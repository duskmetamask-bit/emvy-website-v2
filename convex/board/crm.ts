import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

const EMVY_WORKSPACE_KEY = 'emvy'
const DEFAULT_OWNER = 'dusk'

const normaliseEmail = (value?: string) => value?.trim().toLowerCase() || undefined
const normalisePhone = (value?: string) => value?.replace(/\D/g, '') || undefined

async function emvyWorkspace(ctx: any) {
  const existing = await ctx.db.query('crm_workspaces').withIndex('by_key', (q: any) => q.eq('key', EMVY_WORKSPACE_KEY)).unique()
  if (existing) return existing
  const id = await ctx.db.insert('crm_workspaces', {
    key: EMVY_WORKSPACE_KEY,
    name: 'EMVY',
    defaultOwnerKey: DEFAULT_OWNER,
    createdAt: Date.now(),
  })
  return await ctx.db.get(id)
}

function isEmvyRecord(record: { workspaceId?: unknown }, workspaceId?: unknown) {
  return !record.workspaceId || record.workspaceId === workspaceId
}

function dueState(dueAt?: number, now = Date.now()) {
  if (!dueAt) return 'none'
  if (dueAt < new Date(now).setHours(0, 0, 0, 0)) return 'overdue'
  if (dueAt < new Date(now).setHours(24, 0, 0, 0)) return 'today'
  return 'upcoming'
}

export const queue = query({
  args: {
    search: v.optional(v.string()), stage: v.optional(v.string()), source: v.optional(v.string()),
    due: v.optional(v.string()), workspaceKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.query('crm_workspaces').withIndex('by_key', q => q.eq('key', args.workspaceKey ?? EMVY_WORKSPACE_KEY)).unique()
    const needle = args.search?.trim().toLowerCase()
    const leads = await ctx.db.query('leads').order('desc').take(500)
    const rows = await Promise.all(leads
      .filter(lead => isEmvyRecord(lead, workspace?._id))
      .filter(lead => !args.stage || (lead.stage ?? 'discover') === args.stage)
      .filter(lead => !args.source || lead.source === args.source)
      .filter(lead => !needle || [lead.contact, lead.company, lead.email, lead.phone, lead.source].filter(Boolean).join(' ').toLowerCase().includes(needle))
      .map(async lead => {
        const [tasks, activity, interactions] = await Promise.all([
          ctx.db.query('crm_tasks').withIndex('by_lead_and_status', q => q.eq('leadId', lead._id).eq('status', 'open')).collect(),
          ctx.db.query('activity_log').withIndex('by_lead', q => q.eq('leadId', lead._id)).order('desc').first(),
          ctx.db.query('crm_interactions').withIndex('by_lead_and_occurredAt', q => q.eq('leadId', lead._id)).order('desc').first(),
        ])
        const nextTask = tasks.sort((a, b) => (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER))[0]
        const latestAt = Math.max(activity?.timestamp ?? 0, interactions?.occurredAt ?? 0, lead.discoveredAt ?? lead._creationTime)
        const dueAt = nextTask?.dueAt ?? lead.nextActionAt
        return { ...lead, ownerKey: lead.ownerKey ?? DEFAULT_OWNER, nextTask, dueAt, dueState: dueState(dueAt), latestAt, latestSummary: interactions?.summary ?? activity?.details ?? lead.lastTouchpoint ?? 'New inbound' }
      }))
    return rows
      .filter(row => !args.due || row.dueState === args.due)
      .sort((a, b) => {
        const rank = { overdue: 0, today: 1, none: 2, upcoming: 3 } as Record<string, number>
        return rank[a.dueState] - rank[b.dueState] || b.latestAt - a.latestAt
      })
  },
})

export const createLead = mutation({
  args: { contact: v.string(), company: v.optional(v.string()), email: v.optional(v.string()), phone: v.optional(v.string()), source: v.optional(v.string()), stage: v.optional(v.string()), nextAction: v.optional(v.string()), dueAt: v.optional(v.number()), priority: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const workspace = await emvyWorkspace(ctx)
    if (!workspace) throw new Error('EMVY workspace unavailable')
    const now = Date.now()
    const id = await ctx.db.insert('leads', {
      contact: args.contact.trim(), company: args.company?.trim(), email: normaliseEmail(args.email), phone: args.phone?.trim(),
      normalizedEmail: normaliseEmail(args.email), normalizedPhone: normalisePhone(args.phone), identityStatus: 'unverified', automationEligible: false, serviceStatus: 'prospect',
      source: args.source ?? 'manual', stage: args.stage ?? 'discover', discoveredAt: now, workspaceId: workspace._id, ownerKey: DEFAULT_OWNER,
      nextAction: args.nextAction?.trim(), nextActionAt: args.dueAt, priority: args.priority ?? 'normal',
    })
    await ctx.db.insert('crm_interactions', { leadId: id, workspaceId: workspace._id, kind: 'note', direction: 'internal', summary: 'Lead created manually', occurredAt: now, actor: DEFAULT_OWNER })
    return id
  },
})

export const updateLead = mutation({
  args: { leadId: v.id('leads'), stage: v.optional(v.string()), ownerKey: v.optional(v.string()), nextAction: v.optional(v.string()), dueAt: v.optional(v.number()), priority: v.optional(v.string()), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error('Lead not found')
    const workspace = await emvyWorkspace(ctx)
    const now = Date.now()
    const patch: Record<string, unknown> = {}
    if (args.stage !== undefined) patch.stage = args.stage
    if (args.ownerKey !== undefined) patch.ownerKey = args.ownerKey
    if (args.nextAction !== undefined) patch.nextAction = args.nextAction.trim() || undefined
    if (args.dueAt !== undefined) patch.nextActionAt = args.dueAt
    if (args.priority !== undefined) patch.priority = args.priority
    if (Object.keys(patch).length) await ctx.db.patch(args.leadId, patch)
    if (args.note?.trim()) await ctx.db.insert('crm_interactions', { leadId: args.leadId, workspaceId: lead.workspaceId ?? workspace?._id, kind: 'note', direction: 'internal', summary: args.note.trim(), occurredAt: now, actor: args.ownerKey ?? lead.ownerKey ?? DEFAULT_OWNER })
    return { ok: true }
  },
})

export const createTask = mutation({
  args: { leadId: v.optional(v.id('leads')), title: v.string(), kind: v.optional(v.string()), priority: v.optional(v.string()), dueAt: v.optional(v.number()), details: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const workspace = await emvyWorkspace(ctx)
    const lead = args.leadId ? await ctx.db.get(args.leadId) : null
    return await ctx.db.insert('crm_tasks', { leadId: args.leadId, workspaceId: lead?.workspaceId ?? workspace?._id, ownerKey: lead?.ownerKey ?? DEFAULT_OWNER, kind: args.kind ?? 'follow_up', title: args.title.trim(), status: 'open', priority: args.priority ?? 'normal', dueAt: args.dueAt, details: args.details?.trim(), createdAt: Date.now() })
  },
})

export const updateTask = mutation({
  args: { taskId: v.id('crm_tasks'), status: v.optional(v.string()), title: v.optional(v.string()), dueAt: v.optional(v.number()), priority: v.optional(v.string()), details: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task) throw new Error('Task not found')
    const patch: Record<string, unknown> = {}
    if (args.status) { patch.status = args.status; if (args.status === 'done') patch.completedAt = Date.now() }
    if (args.title !== undefined) patch.title = args.title.trim()
    if (args.dueAt !== undefined) patch.dueAt = args.dueAt
    if (args.priority !== undefined) patch.priority = args.priority
    if (args.details !== undefined) patch.details = args.details.trim()
    await ctx.db.patch(args.taskId, patch)
    return { ok: true }
  },
})

export const activeTasks = query({
  args: {},
  handler: async ctx => {
    const workspace = await ctx.db.query('crm_workspaces').withIndex('by_key', q => q.eq('key', EMVY_WORKSPACE_KEY)).unique()
    const tasks = await ctx.db.query('crm_tasks').withIndex('by_status_and_dueAt', q => q.eq('status', 'open')).collect()
    return Promise.all(tasks.filter(task => isEmvyRecord(task, workspace?._id)).map(async task => ({ ...task, ownerKey: task.ownerKey ?? DEFAULT_OWNER, sourceLabel: 'CRM', lead: task.leadId ? await ctx.db.get(task.leadId) : null })))
  },
})

export const leadTimeline = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) return null
    const [activity, interactions, tasks, bookings, emailEvents, callbacks] = await Promise.all([
      ctx.db.query('activity_log').withIndex('by_lead', q => q.eq('leadId', args.leadId)).collect(),
      ctx.db.query('crm_interactions').withIndex('by_lead_and_occurredAt', q => q.eq('leadId', args.leadId)).collect(),
      ctx.db.query('crm_tasks').withIndex('by_lead_and_status', q => q.eq('leadId', args.leadId).eq('status', 'open')).collect(),
      ctx.db.query('cal_bookings').withIndex('by_lead', q => q.eq('leadId', args.leadId)).collect(),
      ctx.db.query('email_events').withIndex('by_lead', q => q.eq('leadId', args.leadId)).collect(),
      ctx.db.query('contact_submissions').collect(),
    ])
    const email = normaliseEmail(lead.email)
    const phone = normalisePhone(lead.phone)
    const exactCallbacks = callbacks.filter(row => (email && normaliseEmail(row.email) === email) || (phone && normalisePhone(row.phone) === phone))
    const timeline = [
      ...activity.map(row => ({ id: `activity-${row._id}`, at: row.timestamp, type: row.action, summary: row.details ?? row.action })),
      ...interactions.map(row => ({ id: `interaction-${row._id}`, at: row.occurredAt, type: row.kind, summary: row.summary })),
      ...tasks.map(row => ({ id: `task-${row._id}`, at: row.completedAt ?? row.createdAt, type: 'task', summary: `${row.status}: ${row.title}` })),
      ...bookings.map(row => ({ id: `booking-${row._id}`, at: row.bookingTime, type: 'booking', summary: `${row.status}: ${row.type ?? 'AI Consult'}` })),
      ...emailEvents.map(row => ({ id: `email-${row._id}`, at: row.timestamp, type: 'email', summary: row.eventType })),
      ...exactCallbacks.map(row => ({ id: `callback-${row._id}`, at: row.createdAt, type: 'callback', summary: row.message ?? 'Matched callback message' })),
    ].sort((a, b) => b.at - a.at)
    return { lead, timeline, callbacks: exactCallbacks }
  },
})
