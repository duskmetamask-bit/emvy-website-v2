// Operator notifications aggregator. Powers the bell icon in the
// sidebar topbar. Pulls the latest events from every source table
// that touches the EMVY sales pipeline (email, contact form, Cal.com,
// Stripe, leads, stage transitions, inbound replies) and unifies
// them into a single NotificationItem[] sorted newest first.
//
// Last-seen state is tracked client-side via localStorage
// (board/notifications:lastSeenAt) — no Convex schema change needed
// for v1. Per-device persistence is fine for a single operator.
//
// Per ADR-007, this file is the single source of truth; the website
// repo mirrors it under emvy-website-v2/convex/board/notifications.ts
// and deploys.

import { query } from '../_generated/server';
import { v } from 'convex/values';

const DEFAULT_LIMIT = 20;

// Domains we own — mail from these addresses is operator/system self-send.
// Mirrors webmail.ts:isSelfEmail so the bell surfaces them as notifications
// instead of the inbox.
const SELF_EMAIL_DOMAIN = 'emvyai.com';

function isSelfEmail(fromAddress: string): boolean {
  if (!fromAddress) return false;
  const addr = fromAddress.toLowerCase();
  const at = addr.lastIndexOf('@');
  if (at < 0) return false;
  return addr.slice(at + 1) === SELF_EMAIL_DOMAIN;
}

export type NotificationType =
  | 'email_open'
  | 'email_click'
  | 'email_reply'
  | 'email_sent'
  | 'email_bounce'
  | 'contact_form'
  | 'booking'
  | 'payment'
  | 'lead_created'
  | 'stage_change'
  | 'inbound_reply';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  label: string;
  detail?: string;
  href: string;
  timestamp: number;
};

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = limit ?? DEFAULT_LIMIT;
    const events: NotificationItem[] = [];

    // Email events (open / click / reply / bounce)
    const emailEvents = await ctx.db
      .query('email_events')
      .order('desc')
      .take(take);
    for (const row of emailEvents) {
      const ev = classifyEmailEvent(row);
      if (ev) events.push(ev);
    }

    // Email sends
    const sends = await ctx.db
      .query('email_sends')
      .withIndex('by_sentAt')
      .order('desc')
      .take(take);
    for (const row of sends) {
      events.push({
        id: `email_sends:${row._id}`,
        type: 'email_sent',
        label: 'Email sent',
        detail: row.subject,
        href: '/sent',
        timestamp: row.sentAt,
      });
    }

    // Contact form
    const contacts = await ctx.db
      .query('contact_submissions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(take);
    for (const row of contacts) {
      events.push({
        id: `contact_submissions:${row._id}`,
        type: 'contact_form',
        label: 'New contact form submission',
        detail: row.name ?? row.email ?? 'Visitor',
        href: '/contacts',
        timestamp: row.createdAt,
      });
    }

    // Cal bookings
    const bookings = await ctx.db
      .query('cal_bookings')
      .withIndex('by_bookingTime')
      .order('desc')
      .take(take);
    for (const row of bookings) {
      events.push({
        id: `cal_bookings:${row._id}`,
        type: 'booking',
        label: row.type ? `${row.type} call booked` : 'Discovery call booked',
        detail: row.name ?? row.email ?? '—',
        href: '/bookings',
        timestamp: row.createdAt,
      });
    }

    // Payments
    const payments = await ctx.db
      .query('payments')
      .order('desc')
      .take(take);
    for (const row of payments) {
      const amount = row.amount != null ? `${row.amount} ${row.currency ?? 'USD'}` : '—';
      events.push({
        id: `payments:${row._id}`,
        type: 'payment',
        label: 'Payment received',
        detail: `${amount} · ${row.description ?? row.status ?? 'paid'}`,
        href: '/leads',
        timestamp: row.createdAt,
      });
    }

    // Inbound replies (Purelymail)
    const inbox = await ctx.db
      .query('email_inbox')
      .withIndex('by_receivedAt')
      .order('desc')
      .take(take);
    for (const row of inbox) {
      // Skip self-emails (audit@emvyai.com self-notify, etc.). The
      // webhook-driven activity_log entries already cover real lead
      // events; the email loop adds no information.
      if (isSelfEmail(row.fromAddress ?? '')) continue;
      events.push({
        id: `email_inbox:${row._id}`,
        type: 'inbound_reply',
        label: 'Inbound reply',
        detail: row.subject ?? '(no subject)',
        href: '/inbox',
        timestamp: row.receivedAt,
      });
    }

    // Lead created + stage change
    const leadCreated = await ctx.db
      .query('activity_log')
      .withIndex('by_action', (q) => q.eq('action', 'lead_created'))
      .order('desc')
      .take(take);
    for (const row of leadCreated) {
      events.push({
        id: `activity_log:lead_created:${row._id}`,
        type: 'lead_created',
        label: 'New lead',
        detail: row.details ?? '',
        href: '/leads',
        timestamp: row.timestamp,
      });
    }
    const stageChanges = await ctx.db
      .query('activity_log')
      .withIndex('by_action', (q) => q.eq('action', 'stage_change'))
      .order('desc')
      .take(take);
    for (const row of stageChanges) {
      events.push({
        id: `activity_log:stage_change:${row._id}`,
        type: 'stage_change',
        label: 'Stage advanced',
        detail: row.details ?? '',
        href: '/leads',
        timestamp: row.timestamp,
      });
    }

    // Newest first, then cap.
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, take);
  },
});

function classifyEmailEvent(row: {
  _id: string;
  eventType: string;
  timestamp: number;
  leadId?: string;
}): NotificationItem | null {
  const base = {
    id: `email_events:${row._id}`,
    timestamp: row.timestamp,
    href: '/activity',
  };
  switch (row.eventType) {
    case 'opened':
      return { ...base, type: 'email_open', label: 'Email opened', detail: row.leadId ?? '' };
    case 'clicked':
      return { ...base, type: 'email_click', label: 'Email link clicked', detail: row.leadId ?? '' };
    case 'replied':
      return { ...base, type: 'email_reply', label: 'Reply via Resend', detail: row.leadId ?? '' };
    case 'bounced':
      return { ...base, type: 'email_bounce', label: 'Email bounced', detail: row.leadId ?? '' };
    default:
      return null;
  }
}