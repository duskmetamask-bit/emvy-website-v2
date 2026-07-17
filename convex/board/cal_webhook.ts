// Board-side Cal.com webhook handler. Called by `app/api/cal/webhook/route.ts`
// after the request signature has been verified. Persists BOOKING_CREATED,
// BOOKING_CANCELLED, BOOKING_RESCHEDULED events into `cal_bookings`.
//
// Idempotency: dedupes by `eventId` (the Cal.com booking UID in our stored
// format is `${eventTypeName}_${bookingTime}`, but the webhook payload also
// ships `uid` directly — we accept either).
//
// Lead linking: matches by email. Operators can attach an email to a lead in
// the standard pipeline and any Cal.com booking with that email auto-links.

import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';

/**
 * Upsert a cal_bookings row from a Cal.com webhook payload. Matches on
 * `eventId` — Cal.com sends a stable `uid` we encode as `eventId` so
 * replays (cancel, reschedule) update the same row instead of inserting.
 */
export const recordCalEvent = mutation({
  args: {
    eventId: v.string(),
    eventTypeName: v.string(),
    bookingTime: v.number(),
    status: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let leadId: Id<'leads'> | undefined;
    if (args.email) {
      const leads = await ctx.db
        .query('leads')
        .withIndex('by_email', (q) => q.eq('email', args.email!))
        .collect();
      leadId = leads[0]?._id;
    }

    // No by_eventId index on cal_bookings today, so scan + dedupe. Bookings
    // are low-volume so a full scan is fine; if we cross ~5k rows we'll add
    // a by_eventId index in the schema mirror.
    const all = await ctx.db.query('cal_bookings').collect();
    const existing = all.find((r) => r.eventId === args.eventId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        name: args.name ?? existing.name,
        email: args.email ?? existing.email,
        type: args.eventTypeName,
        leadId: leadId ?? existing.leadId,
      });
      return { bookingId: existing._id, duplicate: true, leadId: leadId ?? null };
    }

    const bookingId = await ctx.db.insert('cal_bookings', {
      leadId,
      eventId: args.eventId,
      type: args.eventTypeName,
      bookingTime: args.bookingTime,
      status: args.status,
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
    });

    return { bookingId, duplicate: false, leadId: leadId ?? null };
  },
});
