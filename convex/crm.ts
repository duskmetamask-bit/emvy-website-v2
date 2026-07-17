import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { normalizeEmail, normalizePhone, selectIdentityMatch } from './crm/identity'
import { requireCurrentTask, requireOnboardingAuthority, type LifecycleStage, type LifecycleState } from './crm/lifecycle'

const DAY_MS = 24 * 60 * 60 * 1000
const EMVY_WORKSPACE_KEY = 'emvy'
const DEFAULT_OWNER_KEY = 'dusk'

async function getEmvyWorkspace(ctx: MutationCtx) {
  const existing = await ctx.db
    .query('crm_workspaces')
    .withIndex('by_key', q => q.eq('key', EMVY_WORKSPACE_KEY))
    .unique()
  if (existing) return existing
  const id = await ctx.db.insert('crm_workspaces', {
    key: EMVY_WORKSPACE_KEY,
    name: 'EMVY',
    defaultOwnerKey: DEFAULT_OWNER_KEY,
    createdAt: Date.now(),
  })
  return await ctx.db.get(id)
}

export const ensureEmvyWorkspace = mutation({
  args: {},
  handler: async ctx => {
    const workspace = await getEmvyWorkspace(ctx)
    if (!workspace) throw new Error('Unable to create EMVY workspace')
    return workspace
  },
})

async function findIdentity(
  ctx: MutationCtx,
  email: string | undefined,
  phone: string | undefined,
) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedPhone = normalizePhone(phone)
  const emailMatches = normalizedEmail
    ? await ctx.db.query('leads').withIndex('by_normalizedEmail', q => q.eq('normalizedEmail', normalizedEmail)).take(3)
    : []
  const phoneMatches = normalizedPhone
    ? await ctx.db.query('leads').withIndex('by_normalizedPhone', q => q.eq('normalizedPhone', normalizedPhone)).take(3)
    : []
  return { normalizedEmail, normalizedPhone, match: selectIdentityMatch(emailMatches, phoneMatches) }
}

export const ingestProviderEvent = internalMutation({
  args: {
    provider: v.string(),
    providerEventId: v.string(),
    eventType: v.string(),
    occurredAt: v.number(),
    rawPayload: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    contact: v.optional(v.string()),
    company: v.optional(v.string()),
    source: v.optional(v.string()),
    interaction: v.optional(v.object({
      kind: v.string(), direction: v.string(), summary: v.string(), mailbox: v.optional(v.string()), metadata: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const workspace = await getEmvyWorkspace(ctx)
    if (!workspace) throw new Error('EMVY workspace unavailable')
    const existing = await ctx.db
      .query('provider_events')
      .withIndex('by_provider_and_providerEventId', q => q.eq('provider', args.provider).eq('providerEventId', args.providerEventId))
      .unique()
    if (existing) return { status: 'duplicate' as const, eventId: existing._id, leadId: existing.leadId }

    const identity = await findIdentity(ctx, args.email, args.phone)
    let leadId: Id<'leads'> | undefined
    if (identity.match.status === 'resolved') {
      leadId = identity.match.matches[0]._id
    } else if (identity.match.status === 'unverified' && (identity.normalizedEmail || identity.normalizedPhone)) {
      leadId = await ctx.db.insert('leads', {
        email: identity.normalizedEmail,
        phone: args.phone?.trim(),
        contact: args.contact?.trim(),
        company: args.company?.trim(),
        source: args.source ?? args.provider,
        stage: 'discover',
        discoveredAt: args.occurredAt,
        normalizedEmail: identity.normalizedEmail,
        normalizedPhone: identity.normalizedPhone,
        identityStatus: 'resolved',
        automationEligible: true,
        serviceStatus: 'prospect',
        workspaceId: workspace._id,
        ownerKey: DEFAULT_OWNER_KEY,
      })
    }

    const eventId = await ctx.db.insert('provider_events', {
      provider: args.provider,
      providerEventId: args.providerEventId,
      eventType: args.eventType,
      occurredAt: args.occurredAt,
      receivedAt: Date.now(),
      rawPayload: args.rawPayload,
      leadId,
      workspaceId: workspace._id,
      identityStatus: identity.match.status,
    })

    if (identity.match.status === 'merge_review') {
      await ctx.db.insert('identity_merge_reviews', {
        normalizedEmail: identity.normalizedEmail,
        normalizedPhone: identity.normalizedPhone,
        candidateLeadIds: identity.match.matches.map(lead => lead._id),
        sourceEventId: eventId,
        status: 'open',
        createdAt: Date.now(),
      })
    }

    if (leadId && args.interaction) {
      await ctx.db.insert('crm_interactions', {
        leadId,
        workspaceId: workspace._id,
        providerEventId: eventId,
        kind: args.interaction.kind,
        direction: args.interaction.direction,
        summary: args.interaction.summary,
        occurredAt: args.occurredAt,
        mailbox: args.interaction.mailbox,
        metadata: args.interaction.metadata,
      })
    }
    return { status: 'recorded' as const, eventId, leadId, identityStatus: identity.match.status }
  },
})

export const reconcileLegacyLeads = internalMutation({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    let flagged = 0
    for await (const lead of ctx.db.query('leads').order('asc')) {
      if (lead.identityStatus !== undefined) continue
      await ctx.db.patch(lead._id, {
        normalizedEmail: normalizeEmail(lead.email),
        normalizedPhone: normalizePhone(lead.phone),
        identityStatus: 'unverified',
        automationEligible: false,
      })
      flagged += 1
      if (flagged >= args.limit) break
    }
    return { reviewed: flagged, flagged }
  },
})

export const completeAiConsult = internalMutation({
  args: { consultId: v.id('ai_consults'), completedAt: v.number() },
  handler: async (ctx, args) => {
    const consult = await ctx.db.get(args.consultId)
    if (!consult) throw new Error('AI Consult not found')
    if (consult.status === 'completed') return { status: 'duplicate' as const }
    await ctx.db.patch(consult._id, { status: 'completed', completedAt: args.completedAt, updatedAt: Date.now() })
    await ctx.db.insert('internal_assessments', { leadId: consult.leadId, consultId: consult._id, status: 'pending', createdAt: Date.now() })
    await ctx.db.insert('crm_tasks', {
      leadId: consult.leadId,
      workspaceId: consult.workspaceId,
      ownerKey: DEFAULT_OWNER_KEY,
      kind: 'consult_follow_up',
      title: 'Prepare and send AI Consult recommendation',
      status: 'open',
      priority: 'high',
      dueAt: args.completedAt + DAY_MS,
      createdAt: Date.now(),
      details: 'Operator approval is required before any outbound send.',
    })
    return { status: 'completed' as const }
  },
})

export const listOpenMergeReviews = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db
    .query('identity_merge_reviews')
    .withIndex('by_status_and_createdAt', q => q.eq('status', 'open'))
    .order('desc')
    .take(args.limit ?? 50),
})

export const assertRelationshipInvariant = internalMutation({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error('Relationship not found')
    const currentTasks = await ctx.db
      .query('crm_tasks')
      .withIndex('by_lead_and_status', q => q.eq('leadId', lead._id).eq('status', 'open'))
      .collect()
    const current = currentTasks.filter(task => task.isCurrent === true)
    if (current.length > 1) throw new Error('A relationship may have only one designated current task')
    const task = current[0]
    requireCurrentTask({
      ownerKey: lead.ownerKey,
      currentTaskTitle: task?.title,
      currentTaskDueAt: task?.dueAt,
      lifecycleState: lead.lifecycleState as LifecycleState | undefined,
    })
    return { ok: true }
  },
})

export const createEngagement = internalMutation({
  args: { leadId: v.id('leads'), kind: v.string(), name: v.string(), ownerKey: v.string() },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead?.workspaceId) throw new Error('Relationship must be assigned to a workspace')
    if (!args.ownerKey.trim()) throw new Error('Engagement requires a named human owner')
    const now = Date.now()
    return await ctx.db.insert('crm_engagements', {
      leadId: lead._id, workspaceId: lead.workspaceId, ownerKey: args.ownerKey.trim(),
      kind: args.kind, name: args.name.trim(), status: 'proposed', createdAt: now, updatedAt: now,
    })
  },
})

export const beginOnboarding = internalMutation({
  args: { engagementId: v.id('crm_engagements'), approvedScopeReference: v.string(), approvedBy: v.string(), approvedAt: v.number() },
  handler: async (ctx, args) => {
    const { engagementId, approvedScopeReference, approvedBy, approvedAt } = args
    requireOnboardingAuthority({ stage: 'onboarding' as LifecycleStage, approvedScopeReference, approvedBy, approvedAt })
    const engagement = await ctx.db.get(engagementId)
    if (!engagement) throw new Error('Engagement not found')
    await ctx.db.patch(engagement._id, { status: 'onboarding', approvedScopeReference, approvedBy, approvedAt, updatedAt: Date.now() })
    return { ok: true }
  },
})
