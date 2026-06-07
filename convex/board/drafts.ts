// Operator-facing email drafts view. Lists pending drafts (status=draft or
// approved) joined with their lead row, with a one-shot detail query that
// fans out to activity_log. Powers the /drafts list and /drafts/[id] pages.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const PENDING_STATUSES = ['draft', 'approved'] as const;

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    // Pull both statuses and merge client-side; the table only has by_lead
    // and no compound status index, so a full scan + filter is fine at v1
    // volume (hundreds of drafts/week).
    const all = await ctx.db.query('email_drafts').order('desc').collect();
    const pending = all.filter((d) =>
      (PENDING_STATUSES as readonly string[]).includes(d.status ?? 'draft'),
    );
    const rows = await Promise.all(
      pending.map(async (draft) => {
        const lead = draft.leadId ? await ctx.db.get(draft.leadId) : null;
        return { ...draft, lead };
      }),
    );
    return rows;
  },
});

export const getDraft = query({
  args: { id: v.id('email_drafts') },
  handler: async (ctx, { id }) => {
    const draft = await ctx.db.get(id);
    if (!draft) return null;
    const lead = draft.leadId ? await ctx.db.get(draft.leadId) : null;
    const activity = lead
      ? await ctx.db
          .query('activity_log')
          .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
          .order('desc')
          .take(20)
      : [];
    return { draft, lead, activity };
  },
});

export const discardDraft = mutation({
  args: { id: v.id('email_drafts') },
  handler: async (ctx, { id }) => {
    const draft = await ctx.db.get(id);
    if (!draft) throw new Error('Draft not found');
    if (draft.status === 'sent') {
      return { ok: true, noop: true, reason: 'already_sent' };
    }
    const now = Date.now();
    await ctx.db.patch(id, { status: 'discarded' });
    if (draft.leadId) {
      await ctx.db.insert('activity_log', {
        leadId: draft.leadId,
        action: 'draft_discarded',
        actor: 'operator',
        details: draft.subject ?? '',
        timestamp: now,
      });
    }
    return { ok: true };
  },
});

// Soft-warn banner on the drafts detail page. Returns whether the lead
// has had a recent Resend bounce or complaint (default window 30 days).
export const hasRecentBounce = query({
  args: {
    leadId: v.id('leads'),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, { leadId, windowMs }) => {
    const since = Date.now() - (windowMs ?? 30 * 24 * 60 * 60 * 1000);
    const events = await ctx.db
      .query('email_events')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect();
    const recent = events.find(
      (e) =>
        (e.eventType === 'bounced' || e.eventType === 'complained') &&
        e.timestamp >= since,
    );
    return { bounced: !!recent, at: recent?.timestamp ?? null };
  },
});

// Board-side mirror of hermes.outreach.recordLearning. The board UI calls
// this directly; the website-side version is only used by Blando / API
// routes. Captures a 'learnings' row + an activity_log entry so the
// operator edit is visible on the lead timeline.
export const recordOperatorEdit = mutation({
  args: {
    draftId: v.id('email_drafts'),
    leadId: v.id('leads'),
    subject: v.string(),
    editedBody: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, { draftId, leadId, subject, editedBody, source }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error('Draft not found');
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error('Lead not found');
    const now = Date.now();
    const context = JSON.stringify({
      company: lead.company,
      sector: lead.sector,
      score: lead.score,
      stage: lead.stage,
      painSignals: lead.painSignals,
    });
    const learningId = await ctx.db.insert('learnings', {
      leadId,
      draftId,
      source: source ?? 'operator_save',
      fromAddress: lead.email,
      subject,
      originalBody: draft.body,
      editedBody,
      context,
      weight: source === 'operator_edit' ? 2.0 : 1.0,
      capturedAt: now,
    });
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'draft_edited',
      actor: 'operator',
      details: subject,
      timestamp: now,
    });
    return learningId;
  },
});
