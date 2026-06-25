// Operator-facing outreach tracker. Powers /outreach.
//
// Shows contacts grouped by zone (Zone 1 = $500-free-for-10 AI Strategy
// Audit campaign, Zone 2 = standard cold outreach) with the per-contact
// E1/E2/E3 sequence stage derived from the actual outreach_followups +
// email_events state.
//
// Per ADR-007, this file is the single source of truth for the query; the
// website repo mirrors it under convex/board/outreach.ts and deploys.

import { query } from '../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { inferZone, inferSequenceStage, type Zone, type SequenceStage } from '../../lib/outreach-zones';

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