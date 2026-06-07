import { query } from '../_generated/server';
import { v } from 'convex/values';

/**
 * List all Cal.com bookings, joined with their lead (if any).
 * Sorted by booking time descending (most recent first).
 *
 * The `cal_bookings` table doesn't have a `type` field — the event type name
 * is encoded in the `eventId` prefix (`<eventTypeName>_<bookingTime>`). The
 * board page parses it client-side using `lib/booking-types.ts`.
 */
export const listAll = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('cal_bookings').order('desc').collect();
    const filtered =
      args.status !== undefined
        ? all.filter((b) => b.status === args.status)
        : all;

    return Promise.all(
      filtered.map(async (b) => ({
        _id: b._id,
        _creationTime: b._creationTime,
        eventId: b.eventId,
        type: b.type ?? null,
        bookingTime: b.bookingTime,
        status: b.status,
        name: b.name ?? null,
        email: b.email ?? null,
        leadId: b.leadId ?? null,
        leadContact: b.leadId ? (await ctx.db.get(b.leadId))?.contact ?? null : null,
        leadCompany: b.leadId ? (await ctx.db.get(b.leadId))?.company ?? null : null,
      }))
    );
  },
});

export const byLead = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    return await ctx.db
      .query('cal_bookings')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .order('desc')
      .collect();
  },
});
