import { query } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfToday(): number {
  return startOfToday() + 86400000;
}

export const todaysBookings = query({
  args: {},
  handler: async (ctx) => {
    const start = startOfToday();
    const end = endOfToday();
    const bookings = await ctx.db
      .query('cal_bookings')
      .withIndex('by_status')
      .order('desc')
      .take(200);
    return bookings
      .filter((b) => b.bookingTime >= start && b.bookingTime < end)
      .sort((a, b) => a.bookingTime - b.bookingTime);
  },
});

export const recentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = limit ?? 20;
    const entries = await ctx.db
      .query('activity_log')
      .withIndex('by_timestamp')
      .order('desc')
      .take(take);
    return Promise.all(
      entries.map(async (e) => {
        const lead = await ctx.db.get(e.leadId);
        return {
          ...e,
          contact: lead?.contact ?? null,
          company: lead?.company ?? null,
        };
      })
    );
  },
});

export const pipelineSummary = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query('leads').order('desc').take(500);
    const counts: Record<string, number> = {};
    let active = 0;
    for (const l of leads) {
      const s = l.stage ?? 'discover';
      counts[s] = (counts[s] ?? 0) + 1;
      if (s !== 'lost') active++;
    }
    return { total: leads.length, active, counts };
  },
});

const ACTIVE_STAGES = [
  'discover',
  'contacted',
  'engaged',
  'assessed',
  'qualified',
  'audited',
  'proposal_sent',
  'implementing',
] as const;

export const needsAttention = query({
  args: {
    staleDays: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { staleDays = 7, limit = 20 }) => {
    const nowMs = Date.now();
    const cutoffMs = nowMs - staleDays * 86400000;
    const stale: Array<{
      _id: Id<'leads'>;
      company: string | undefined;
      contact: string | undefined;
      email: string | undefined;
      stage: string | undefined;
      score: number | undefined;
      lastTouchpoint: string | undefined;
      discoveredAt: number | undefined;
      daysSinceDiscovered: number;
    }> = [];

    for (const stage of ACTIVE_STAGES) {
      const leads = await ctx.db
        .query('leads')
        .withIndex('by_stage', (q) => q.eq('stage', stage))
        .take(200);
      for (const lead of leads) {
        const rawDiscovered = lead.discoveredAt ?? lead._creationTime;
        const discoveredMs = rawDiscovered > 1e12 ? rawDiscovered : rawDiscovered * 1000;
        if (discoveredMs >= cutoffMs) continue;
        stale.push({
          _id: lead._id,
          company: lead.company,
          contact: lead.contact,
          email: lead.email,
          stage: lead.stage,
          score: lead.score,
          lastTouchpoint: lead.lastTouchpoint,
          discoveredAt: discoveredMs,
          daysSinceDiscovered: Math.floor((nowMs - discoveredMs) / 86400000),
        });
      }
    }

    stale.sort((a, b) => b.daysSinceDiscovered - a.daysSinceDiscovered);
    return stale.slice(0, limit);
  },
});
