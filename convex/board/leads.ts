import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('leads').order('desc').take(100);
  },
});

export const listWithActivity = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query('leads').order('desc').take(200);
    return Promise.all(
      leads.map(async (lead) => {
        const lastActivity = await ctx.db
          .query('activity_log')
          .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
          .order('desc')
          .first();
        return { ...lead, lastActivity };
      })
    );
  },
});

export const listFiltered = query({
  args: {
    search: v.optional(v.string()),
    stage: v.optional(v.string()),
    sector: v.optional(v.string()),
    source: v.optional(v.string()),
    minScore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const leads = await ctx.db.query('leads').order('desc').take(limit);
    const search = args.search?.trim().toLowerCase();
    const filtered = leads.filter((l) => {
      if (args.stage && (l.stage ?? 'discover') !== args.stage) return false;
      if (args.sector && l.sector !== args.sector) return false;
      if (args.source && l.source !== args.source) return false;
      if (args.minScore !== undefined && (l.score ?? 0) < args.minScore) return false;
      if (search) {
        const hay = [
          l.company ?? '',
          l.contact ?? '',
          l.email ?? '',
          l.sector ?? '',
          l.location ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
    return Promise.all(
      filtered.map(async (lead) => {
        const lastActivity = await ctx.db
          .query('activity_log')
          .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
          .order('desc')
          .first();
        return { ...lead, lastActivity };
      })
    );
  },
});

export const getLead = query({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    const lead = await ctx.db.get(id);
    if (!lead) return null;
    const [activity, emailSends, emailEvents, bookings, payments] = await Promise.all([
      ctx.db
        .query('activity_log')
        .withIndex('by_lead', (q) => q.eq('leadId', id))
        .order('desc')
        .take(100),
      ctx.db
        .query('email_sends')
        .withIndex('by_lead', (q) => q.eq('leadId', id))
        .order('desc')
        .take(50),
      ctx.db
        .query('email_events')
        .withIndex('by_lead', (q) => q.eq('leadId', id))
        .order('desc')
        .take(100),
      ctx.db
        .query('cal_bookings')
        .withIndex('by_lead', (q) => q.eq('leadId', id))
        .order('desc')
        .take(50),
      ctx.db
        .query('payments')
        .withIndex('by_lead', (q) => q.eq('leadId', id))
        .order('desc')
        .take(50),
    ]);
    return { lead, activity, emailSends, emailEvents, bookings, payments };
  },
});

export const moveStage = mutation({
  args: {
    id: v.id('leads'),
    toStage: v.string(),
  },
  handler: async (ctx, { id, toStage }) => {
    const lead = await ctx.db.get(id);
    if (!lead) throw new Error('Lead not found');
    const fromStage = lead.stage ?? 'discover';
    if (fromStage === toStage) return { ok: true, noop: true };
    await ctx.db.patch(id, { stage: toStage });
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'stage_change',
      details: `${fromStage} → ${toStage}`,
      timestamp: Date.now(),
    });
    return { ok: true, fromStage, toStage };
  },
});

export const bulkMoveStage = mutation({
  args: {
    ids: v.array(v.id('leads')),
    toStage: v.string(),
  },
  handler: async (ctx, { ids, toStage }) => {
    let moved = 0;
    let skipped = 0;
    const now = Date.now();
    for (const id of ids) {
      const lead = await ctx.db.get(id);
      if (!lead) {
        skipped++;
        continue;
      }
      const fromStage = lead.stage ?? 'discover';
      if (fromStage === toStage) {
        skipped++;
        continue;
      }
      await ctx.db.patch(id, { stage: toStage });
      await ctx.db.insert('activity_log', {
        leadId: id,
        action: 'stage_change',
        details: `${fromStage} → ${toStage} (bulk)`,
        timestamp: now,
      });
      moved++;
    }
    return { ok: true, moved, skipped, toStage };
  },
});

export const markLost = mutation({
  args: {
    id: v.id('leads'),
    reason: v.string(),
  },
  handler: async (ctx, { id, reason }) => {
    const lead = await ctx.db.get(id);
    if (!lead) throw new Error('Lead not found');
    const fromStage = lead.stage ?? 'discover';
    await ctx.db.patch(id, { stage: 'lost', outcome: reason });
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'stage_change',
      details: `${fromStage} → lost (reason: ${reason})`,
      timestamp: Date.now(),
    });
    return { ok: true };
  },
});

export const addNote = mutation({
  args: {
    id: v.id('leads'),
    text: v.string(),
  },
  handler: async (ctx, { id, text }) => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Note cannot be empty');
    const lead = await ctx.db.get(id);
    if (!lead) throw new Error('Lead not found');
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'note_added',
      details: trimmed,
      timestamp: Date.now(),
    });
    await ctx.db.patch(id, { lastTouchpoint: 'note_added' });
    return { ok: true };
  },
});

export const resendEmail = mutation({
  args: {
    id: v.id('leads'),
    subject: v.string(),
  },
  handler: async (ctx, { id, subject }) => {
    const lead = await ctx.db.get(id);
    if (!lead) throw new Error('Lead not found');
    const now = Date.now();
    await ctx.db.insert('email_sends', {
      leadId: id,
      subject,
      status: 'queued',
      sentAt: now,
    });
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'email_sent',
      details: `re-send queued: ${subject}`,
      timestamp: now,
    });
    await ctx.db.patch(id, { lastTouchpoint: 'email_sent' });
    return { ok: true };
  },
});
