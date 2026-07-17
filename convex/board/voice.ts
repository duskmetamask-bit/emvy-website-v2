// Voice board surface.
//
// This is the first CRM-facing voice view for EMVY. It reuses the existing
// board schema instead of adding a dedicated voice table yet: leads supply the
// call queue, cal_bookings supply call outcomes, and contact_submissions supply
// captured messages.

import { query } from '../_generated/server';
import { v } from 'convex/values';

const DAY_MS = 86_400_000;

type LeadRow = {
  _id: string;
  _creationTime: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  stage?: string;
  score?: number;
  source?: string;
  lastTouchpoint?: string;
  nextActionAt?: number;
  discoveredAt?: number;
  doNotContactAt?: number;
};

function normalizeKey(value: string | undefined | null) {
  return value?.trim().toLowerCase() ?? '';
}

function sortByPriority(a: LeadRow, b: LeadRow) {
  const aDue = a.nextActionAt !== undefined && a.nextActionAt <= Date.now();
  const bDue = b.nextActionAt !== undefined && b.nextActionAt <= Date.now();
  if (aDue !== bDue) return aDue ? -1 : 1;

  const aNext = a.nextActionAt ?? Number.POSITIVE_INFINITY;
  const bNext = b.nextActionAt ?? Number.POSITIVE_INFINITY;
  if (aNext !== bNext) return aNext - bNext;

  const aScore = a.score ?? -1;
  const bScore = b.score ?? -1;
  if (aScore !== bScore) return bScore - aScore;

  return (b.discoveredAt ?? b._creationTime) - (a.discoveredAt ?? a._creationTime);
}

export const dashboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    const now = Date.now();
    const last7d = now - 7 * DAY_MS;
    const next7d = now + 7 * DAY_MS;

    const [rawLeads, rawBookings, rawSubmissions] = await Promise.all([
      ctx.db.query('leads').order('desc').take(200),
      ctx.db.query('cal_bookings').withIndex('by_bookingTime').order('desc').take(100),
      ctx.db.query('contact_submissions').withIndex('by_createdAt').order('desc').take(100),
    ]);

    const leads = rawLeads as LeadRow[];
    const leadById = new Map(leads.map((lead) => [String(lead._id), lead]));
    const leadByEmail = new Map(
      leads
        .filter((lead) => lead.email)
        .map((lead) => [normalizeKey(lead.email), lead]),
    );
    const leadByPhone = new Map(
      leads
        .filter((lead) => lead.phone)
        .map((lead) => [normalizeKey(lead.phone), lead]),
    );

    const callQueue = leads
      .filter((lead) => Boolean(lead.phone) && lead.stage !== 'lost' && lead.doNotContactAt == null)
      .sort(sortByPriority)
      .slice(0, limit)
      .map((lead) => ({
        ...lead,
        status: lead.nextActionAt !== undefined && lead.nextActionAt <= now
          ? 'Due now'
          : lead.score !== undefined && lead.score >= 8
            ? 'Hot'
            : 'Ready',
        statusVariant: lead.nextActionAt !== undefined && lead.nextActionAt <= now
          ? 'workflow_blocked'
          : lead.score !== undefined && lead.score >= 8
            ? 'succeeded'
            : 'neutral',
      }));

    const bookings = rawBookings
      .map((booking) => ({
        ...booking,
        lead: booking.leadId ? leadById.get(String(booking.leadId)) ?? null : null,
      }))
      .slice(0, limit);

    const messages = rawSubmissions
      .map((submission) => {
        const matchedLead =
          (submission.email ? leadByEmail.get(normalizeKey(submission.email)) : undefined) ??
          (submission.phone ? leadByPhone.get(normalizeKey(submission.phone)) : undefined) ??
          null;
        return {
          ...submission,
          matchedLead,
        };
      })
      .slice(0, limit);

    const callReadyLeads = leads.filter((lead) => Boolean(lead.phone) && lead.stage !== 'lost' && lead.doNotContactAt == null);
    const dueFollowUps = callReadyLeads.filter((lead) => lead.nextActionAt !== undefined && lead.nextActionAt <= now).length;
    const upcomingBookings = rawBookings.filter((booking) => booking.bookingTime >= now && booking.bookingTime <= next7d && booking.status !== 'cancelled').length;
    const recentMessages = rawSubmissions.filter((submission) => submission.createdAt >= last7d).length;
    const matchedMessages = rawSubmissions.filter((submission) => {
      const matchedLead =
        (submission.email ? leadByEmail.get(normalizeKey(submission.email)) : undefined) ??
        (submission.phone ? leadByPhone.get(normalizeKey(submission.phone)) : undefined);
      return Boolean(matchedLead);
    }).length;

    return {
      summary: {
        callReadyLeads: callReadyLeads.length,
        dueFollowUps,
        upcomingBookings,
        recentMessages,
        matchedMessages,
      },
      callQueue,
      bookings,
      messages,
    };
  },
});
