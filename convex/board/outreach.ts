// Operator-facing outreach tracker. Powers /outreach.
//
// Shows contacts grouped by zone (Zone 1 = $500-free-for-10 AI Strategy
// Audit campaign, Zone 2 = standard cold outreach) with the per-contact
// E1/E2/E3 sequence stage derived from the actual outreach_followups +
// email_events state.
//
// Per ADR-007, this file is the single source of truth for the query; the
// website repo mirrors it under convex/board/outreach.ts and deploys.

import { mutation, query, action } from '../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { inferZone, inferSequenceStage, type Zone, type SequenceStage } from '../../lib/outreach-zones';
import { internal, api } from '../_generated/api';

const QUEUE_TAKE = 500;
const LEADS_TAKE = 500;

export type OutreachContact = {
  leadId: string;
  company: string;
  contact?: string | null;
  email: string;
  sector?: string | null;
  zone: Zone;
  stage: SequenceStage;
  lastTouchAt: number;
  totalFollowupsSent: number;
  totalReplies: number;
  queueStatus: string;
};

export const list = query({
  args: {
    zone: v.optional(v.union(v.literal('zone1'), v.literal('zone2'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;

    // outreach_queue has no by_sentAt index — sort by createdAt-desc via
    // an in-memory pass after .collect(). We cap at 500 rows to keep it
    // bounded.
    const queueRows = await ctx.db.query('outreach_queue').take(QUEUE_TAKE);
    queueRows.sort((a, b) => b.createdAt - a.createdAt);

    // Build a per-lead summary: pick the freshest row per lead, plus
    // count total sends, replies, cancelled follow-ups, etc.
    type Acc = {
      latestQueue: (typeof queueRows)[number];
      sendCount: number;
      followupCount: number;
    };
    const byLead = new Map<string, Acc>();
    for (const row of queueRows) {
      const key = row.leadId ?? row.email;
      if (!key) continue;
      const isSent =
        row.status === 'sent' || row.status === 'replied' ? true : false;
      const isFollowup =
        row.touch != null && row.touch >= 2 ? true : false;
      const existing = byLead.get(key);
      if (!existing) {
        byLead.set(key, {
          latestQueue: row,
          sendCount: isSent && !isFollowup ? 1 : 0,
          followupCount: isSent && isFollowup ? 1 : 0,
        });
      } else {
        if (isSent && !isFollowup) existing.sendCount += 1;
        if (isSent && isFollowup) existing.followupCount += 1;
        // latestQueue is already the freshest because queueRows is desc.
      }
    }

    // Pull all lead rows in one shot so we can join lead fields.
    const leadRows = await ctx.db.query('leads').take(LEADS_TAKE);
    const leadById = new Map<string, (typeof leadRows)[number]>(
      leadRows.map((l) => [String(l._id), l]),
    );

    // For each lead we still need: replied events, cancelled followup
    // reasons. Two small per-lead queries; capped by lead count.
    const out: OutreachContact[] = [];
    for (const [, acc] of byLead.entries()) {
      const leadId: Id<'leads'> | null = acc.latestQueue.leadId ?? null;
      if (!leadId) continue;
      const lead = leadById.get(String(leadId));
      if (!lead) continue;
      const leadRow = lead as unknown as {
        _id: string;
        company?: string;
        contact?: string;
        email?: string;
        sector?: string;
        source?: string;
        notes?: string;
        internalNotes?: string;
      };

      // Replied events for this lead.
      const replyRows = await ctx.db
        .query('email_events')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId))
        .filter((q) => q.eq(q.field('eventType'), 'replied'))
        .take(50);

      // All followups for this lead.
      const followups = await ctx.db
        .query('outreach_followups')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId))
        .take(20);

      const sentFollowupCount = followups.filter((f) => f.status === 'sent')
        .length;
      const cancelledReasons = followups
        .filter((f) => f.status === 'cancelled')
        .map((f) => (f.cancelledReason ?? '') as string);

      const zone = inferZone({
        leadSource: leadRow.source ?? null,
        leadNotes: leadRow.notes ?? null,
        leadInternalNotes: leadRow.internalNotes ?? null,
        queueSource: acc.latestQueue.source ?? null,
      });

      const stage = inferSequenceStage({
        hasRepliedEvent: replyRows.length > 0,
        cancelledReasons,
        sentFollowupCount,
      });

      const lastTouchAt = Math.max(
        acc.latestQueue.sentAt ?? acc.latestQueue.lastAttemptAt ?? 0,
        acc.latestQueue.createdAt,
      );

      out.push({
        leadId: String(leadId),
        company: leadRow.company ?? acc.latestQueue.company ?? '(unknown)',
        contact: leadRow.contact ?? acc.latestQueue.contact ?? null,
        email: leadRow.email ?? acc.latestQueue.email ?? '',
        sector: leadRow.sector ?? null,
        zone,
        stage,
        lastTouchAt,
        totalFollowupsSent: sentFollowupCount,
        totalReplies: replyRows.length,
        queueStatus: acc.latestQueue.status ?? 'unknown',
      });
    }

    // Newest-touch first.
    out.sort((a, b) => b.lastTouchAt - a.lastTouchAt);

    const filtered = args.zone ? out.filter((r) => r.zone === args.zone) : out;
    return filtered.slice(0, limit);
  },
});

// ---------- Manual-send surface: queue listing (2026-07-03) ----------
//
// Public query — lists every outreach_queue row (any status) for the
// /outreach/queue board page. Sorted by scheduledFor asc.

export const listQueue = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lim = Math.min(args.limit ?? 200, 500)
    let rows
    if (args.status) {
      rows = await ctx.db
        .query('outreach_queue')
        .withIndex('by_status_scheduledFor', (q) => q.eq('status', args.status!))
        .take(lim)
    } else {
      rows = await ctx.db.query('outreach_queue').take(lim)
    }
    const leadIds = Array.from(
      new Set(rows.map((r) => r.leadId).filter((id): id is Id<'leads'> => !!id)),
    )
    const leadRows = await Promise.all(leadIds.map((id) => ctx.db.get(id)))
    const leadMap = new Map<string, Doc<'leads'>>(
      leadRows.filter((l): l is Doc<'leads'> => !!l).map((l) => [String(l._id), l]),
    )
    return rows
      .sort((a, b) => (a.scheduledFor ?? 0) - (b.scheduledFor ?? 0))
      .map((r) => {
        const lead = r.leadId ? leadMap.get(String(r.leadId)) : null
        return {
          _id: String(r._id),
          email: r.email,
          company: r.company ?? lead?.company ?? '(unknown)',
          contact: r.contact ?? lead?.contact ?? null,
          sector: r.sector ?? lead?.sector ?? null,
          location: r.location ?? lead?.location ?? null,
          touch: r.touch ?? 1,
          status: r.status,
          subject: r.subject ?? '',
          body: r.body ?? '',
          templateId: r.templateId ?? null,
          scheduledFor: r.scheduledFor ?? 0,
          createdAt: r.createdAt ?? 0,
          sentAt: r.sentAt ?? null,
          resendId: r.resendId ?? null,
          attempts: r.attempts ?? 0,
          leadState: lead?.outreachState ?? null,
          leadHistory: lead?.outreachHistory ?? [],
        }
      })
  },
})

// ---------- Slice 1a: pause/resume kill switch ----------
//
// The board UI at /outreach calls `getOutreachPaused` to render the
// toggle state, and `setOutreachPaused` to flip it. The mutation
// delegates to the canonical seam `internal.hermes.outreach2.setOutreachPaused`
// so the `settings` table only has ONE writer (the hermes file). The
// drainer reads the same setting on every run.
//
// IMPORTANT: the board mirror in `emvy-board/convex/board/outreach.ts`
// inlines this logic because the board repo doesn't ship
// `convex/hermes/outreach2.ts`. Both paths write to the same
// `settings` row in glad-camel-940, so the seam invariant holds
// regardless of which repo's UI fires first.

export const getOutreachPaused = query({
  args: {},
  handler: async (ctx): Promise<{ paused: boolean; updatedAt: number | null }> => {
    const row = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'outreach_paused'))
      .first()
    if (!row) return { paused: false, updatedAt: null }
    return { paused: row.value === '1', updatedAt: row.updatedAt }
  },
})

export const setOutreachPaused = mutation({
  args: {
    paused: v.boolean(),
    actor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    ok: true
    paused: boolean
    previous: boolean
    updatedAt: number
  }> => {
    return await ctx.runMutation(internal.hermes.outreach2.setOutreachPaused, {
      paused: args.paused,
      actor: args.actor ?? 'operator',
    })
  },
})

// ---------- Manual-send surface (board operator UI) ----------
//
// 2026-07-03 PM — switched to manual-only mode. The board UI at
// /outreach/queue calls these two functions when the operator clicks
// "Send" or "Edit". Convex auth (HMAC middleware + login) handles
// operator identity — no hermes agent token check on these paths.
// Edits are inlined here (board mirror precedent — Slice 1a) because
// the row-level edit doesn't need to go through the hermes seam.

// Public mutation — operator edits subject/body on a queued row.
// Inlined write (board doesn't go through hermes/editQueueRow).
export const editQueueRow = mutation({
  args: {
    queueId: v.id('outreach_queue'),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; reason?: string }> => {
    const row = await ctx.db.get(args.queueId)
    if (!row) return { ok: false, reason: 'not_found' }
    if (row.status !== 'queued' && row.status !== 'drafted') {
      return { ok: false, reason: `status=${row.status} (not editable)` }
    }
    const patch: Record<string, unknown> = {}
    if (args.subject !== undefined) {
      if (!args.subject.trim()) return { ok: false, reason: 'empty_subject' }
      patch.subject = args.subject
    }
    if (args.body !== undefined) {
      if (!args.body.trim()) return { ok: false, reason: 'empty_body' }
      patch.body = args.body
    }
    if (Object.keys(patch).length === 0) return { ok: false, reason: 'no_changes' }
    await ctx.db.patch(args.queueId, patch)
    return { ok: true }
  },
})

// Public action — operator sends a single row. Delegates to
// internal.hermes.outreach2.operatorSend which performs the SENDER_NAME
// check + claim + Resend send + markStepSent. Returns the same shape
// as claimAndSendStep (ok / noop / reason / resendId / state).
// Declared as action (not mutation) because it calls an action.
export const sendOne = action({
  args: {
    queueId: v.id('outreach_queue'),
    forceBypassGates: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    ok: boolean
    noop?: boolean
    reason?: string
    resendId?: string
    state?: string
  }> => {
    return await ctx.runAction(api.hermes.outreach2.operatorSend, {
      queueId: args.queueId,
      forceBypassGates: args.forceBypassGates,
      actor: 'operator',
    })
  },
})

// ---------- Slice 5: send observability surface ----------
//
// Per-send run history. One row per operatorSend invocation (sent /
// blocked / failed / noop). Renders on the board's /outreach page
// as the "Recent send runs" section. The hermes/outreach2 layer
// owns the writer (operatorSend → recordSendRun); this query is the
// public read surface.
export const getRecentSendRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Array<{
    _id: string
    queueId: string
    leadId: string | null
    actor: string
    outcome: 'sent' | 'blocked' | 'failed' | 'noop'
    reason: string | null
    resendId: string | null
    step: string | null
    forceBypassGates: boolean | null
    timestamp: number
  }>> => {
    const limit = args.limit ?? 20
    return await ctx.db
      .query('send_runs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(limit)
  },
})

// Counts of each outcome in the last N hours — for the pipeline stats
// section of /outreach. Computed server-side to avoid a fan-out fetch.
export const getSendRunStats = query({
  args: { sinceMs: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{
    sent: number
    blocked: number
    failed: number
    noop: number
    windowMs: number
  }> => {
    const window = args.sinceMs ?? 24 * 60 * 60 * 1000 // 24h default
    const cutoff = Date.now() - window
    const rows = await ctx.db
      .query('send_runs')
      .withIndex('by_timestamp', (q) => q.gte('timestamp', cutoff))
      .collect()
    const counts = { sent: 0, blocked: 0, failed: 0, noop: 0 }
    for (const r of rows) {
      counts[r.outcome] += 1
    }
    return { ...counts, windowMs: window }
  },
})