// Outreach backlog visibility — Slice 1.
//
// Lists E2/E3 queue rows whose send would be blocked by the locked-law
// `claim` gate (no E1 in lead.outreachHistory). These rows were queued
// by the v1 cron before the 2026-07-03 migration to the Convex-driven
// queue; their original E1 sends happened via the Brevo
// `send_outreach.py` path that never wrote outreachHistory.
//
// The board UI at /outreach/backlog reads this query to show the
// operator the size of the backlog and lets them click "Backfill from
// archive" per lead. The click calls `backfillLegacy` here, which in
// turn invokes the internal mutation
// `hermes/outreach2:markLegacyE1Backfilled` — the canonical seam stays
// the only writer to outreach state per the Slice 2 sender-seam guard.
//
// Read-only `listBlocked` + write `backfillLegacy`. No auth re-check
// (HMAC middleware covers it).

import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'

// ---------- Public query: listBlocked ----------
export const listBlocked = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lim = Math.min(args.limit ?? 500, 500)

    // Pull all queued rows in (touch 2, 3). We can't use a single index
    // for both touches, so take a generous batch and filter in memory —
    // the backlog is bounded (244 rows on 2026-07-03) and this query
    // is admin-only.
    const e2Rows = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .filter((q) => q.eq(q.field('touch'), 2))
      .take(lim)
    const e3Rows = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .filter((q) => q.eq(q.field('touch'), 3))
      .take(lim)

    const all = [...e2Rows, ...e3Rows]

    // Decorate with lead + filter to rows whose lead has no E1 history
    // and isn't suppressed.
    type Row = {
      queueId: string
      leadId: string | null
      email: string
      company: string | null
      contact: string | null
      touch: number
      scheduledFor: number | null
      attempts: number | null
      sector: string | null
      source: string | null
      leadOutreachState: string | null
      blockedReason: 'e2_before_e1_sent' | 'e3_before_e2_sent'
      derivedE1SentAt: number | null
    }
    const out: Row[] = []
    for (const r of all) {
      if (!r.leadId) continue
      const lead = await ctx.db.get(r.leadId)
      if (!lead) continue
      if (lead.unsubscribedAt || lead.doNotContactAt) continue
      const history = (lead.outreachHistory ?? []) as Array<{ step: string }>
      const hasE1 = history.some((h) => h.step === 'e1')
      if (hasE1) continue // E1 already there — different reason, drainer will pick it up
      const hasE2 = history.some((h) => h.step === 'e2')
      const blockedReason: Row['blockedReason'] = r.touch === 2 ? 'e2_before_e1_sent' : 'e3_before_e2_sent'
      void hasE2 // E3 rows are blocked because there's no E2 either; reason stays 'e3_before_e2_sent'
      // Derive the historical E1 sentAt that would satisfy the gate:
      //   E2: E1.sentAt + 4d <= E2.scheduledFor   →  E1.sentAt = E2.scheduledFor - 4d
      //   E3: E1.sentAt + 10d <= E3.scheduledFor  →  E1.sentAt = E3.scheduledFor - 10d
      // (Also need E2 to have been sent before E3; the next drain after
      // backfill will sequence E2 first via the E2-before-E3 ordering.)
      const e2Gap = 4 * 24 * 60 * 60 * 1000
      const e3Gap = 10 * 24 * 60 * 60 * 1000
      const derivedE1SentAt =
        r.touch === 2 && r.scheduledFor != null
          ? r.scheduledFor - e2Gap
          : r.touch === 3 && r.scheduledFor != null
          ? r.scheduledFor - e3Gap
          : null
      out.push({
        queueId: String(r._id),
        leadId: String(lead._id),
        email: r.email,
        company: r.company ?? null,
        contact: r.contact ?? null,
        touch: r.touch ?? 1,
        scheduledFor: r.scheduledFor ?? null,
        attempts: r.attempts ?? 0,
        sector: r.sector ?? null,
        source: r.source ?? null,
        leadOutreachState: lead.outreachState ?? null,
        blockedReason,
        derivedE1SentAt,
      })
    }

    // Group by lead so the UI renders one row per lead (not per touch).
    const byLead = new Map<string, { email: string; company: string | null; touches: number[]; derivedE1SentAt: number | null; sector: string | null; source: string | null; attempts: number; queueIds: string[]; leadOutreachState: string | null }>()
    for (const r of out) {
      const key = r.leadId ?? r.email
      const cur = byLead.get(key)
      if (cur) {
        cur.touches.push(r.touch)
        cur.queueIds.push(r.queueId)
        cur.attempts = Math.max(cur.attempts, r.attempts ?? 0)
        // Keep the EARLIEST derivedE1SentAt (most conservative for the gate)
        if (r.derivedE1SentAt != null && (cur.derivedE1SentAt == null || r.derivedE1SentAt < cur.derivedE1SentAt)) {
          cur.derivedE1SentAt = r.derivedE1SentAt
        }
      } else {
        byLead.set(key, {
          email: r.email,
          company: r.company,
          touches: [r.touch],
          derivedE1SentAt: r.derivedE1SentAt,
          sector: r.sector,
          source: r.source,
          attempts: r.attempts ?? 0,
          queueIds: [r.queueId],
          leadOutreachState: r.leadOutreachState,
        })
      }
    }

    const groups = Array.from(byLead.entries()).map(([leadId, g]) => ({
      leadId,
      email: g.email,
      company: g.company,
      blockedTouches: g.touches.sort(),
      derivedE1SentAt: g.derivedE1SentAt,
      sector: g.sector,
      source: g.source,
      attempts: g.attempts,
      queueIds: g.queueIds,
      leadOutreachState: g.leadOutreachState,
    }))
    groups.sort((a, b) => (a.derivedE1SentAt ?? 0) - (b.derivedE1SentAt ?? 0))
    return { total: groups.length, rows: groups }
  },
})

// ---------- Public mutation: backfillLegacy ----------
//
// UI-facing wrapper that invokes the canonical seam
// `hermes/outreach2:markLegacyE1Backfilled`. This file MUST stay free
// of direct outreach-state writes — the seam guard test enforces that.
// We just plumb the call.
export const backfillLegacy = mutation({
  args: {
    email: v.string(),
    e1SentAt: v.number(),
    e1Subject: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; noop?: boolean; reason?: string }> => {
    return await ctx.runMutation(internal.hermes.outreach2.markLegacyE1Backfilled, {
      email: args.email,
      e1SentAt: args.e1SentAt,
      e1Subject: args.e1Subject,
      source: args.source ?? 'ui',
    })
  },
})