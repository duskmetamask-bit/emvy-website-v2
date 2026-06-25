// Per-stage webhook feed for /document-control. Reads from every
// source table that touches the EMVY sales pipeline, classifies each
// row into a stage (see lib/webhook-stages.ts), and returns a flat
// list sorted newest-first. The page slices by stage client-side.
//
// Per ADR-007, this file is the single source of truth; the website
// repo mirrors it under emvy-website-v2/convex/board/webhookFeed.ts
// and deploys.

import { query } from '../_generated/server';
import { v } from 'convex/values';
import {
  classifyEvent,
  type WebhookEvent,
} from '../../lib/webhook-stages';

const DEFAULT_PER_SOURCE = 25;

export const listAll = query({
  args: { perSource: v.optional(v.number()) },
  handler: async (ctx, { perSource }) => {
    const limit = perSource ?? DEFAULT_PER_SOURCE;
    const events: WebhookEvent[] = [];

    // audit_chatbot_leads → Lead Generation
    const auditLeads = await ctx.db.query('audit_chatbot_leads').order('desc').take(limit);
    for (const row of auditLeads) {
      const ts = (row as { updatedAt?: number; createdAt?: number }).updatedAt
        ?? (row as { createdAt?: number }).createdAt
        ?? Date.now();
      const ev = classifyEvent({
        source: 'audit-chatbot',
        id: `audit_chatbot_leads:${row._id}`,
        timestamp: ts,
        payload: { score: (row as { score?: number }).score, business: (row as { business?: string }).business, email: (row as { email?: string }).email },
      });
      if (ev) events.push(ev);
    }

    // contact_submissions → Capture & Score
    const contacts = await ctx.db
      .query('contact_submissions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
    for (const row of contacts) {
      const ev = classifyEvent({
        source: 'contact-form',
        id: `contact_submissions:${row._id}`,
        timestamp: row.createdAt,
        payload: { name: row.name, email: row.email },
      });
      if (ev) events.push(ev);
    }

    // assessment_submissions → Capture & Score
    const assessments = await ctx.db
      .query('assessment_submissions')
      .order('desc')
      .take(limit);
    for (const row of assessments) {
      const ev = classifyEvent({
        source: 'assessment',
        id: `assessment_submissions:${row._id}`,
        timestamp: row.createdAt ?? Date.now(),
        payload: { vertical: (row as { vertical?: string }).vertical, email: (row as { email?: string }).email },
      });
      if (ev) events.push(ev);
    }

    // email_sends → Outreach
    const sends = await ctx.db
      .query('email_sends')
      .withIndex('by_sentAt')
      .order('desc')
      .take(limit);
    for (const row of sends) {
      const ev = classifyEvent({
        source: 'resend',
        id: `email_sends:${row._id}`,
        timestamp: row.sentAt,
        payload: { eventType: 'sent', subject: row.subject, recipient: (row as { recipient?: string }).recipient },
      });
      if (ev) events.push(ev);
    }

    // email_events → Outreach (delivered/opened/clicked/bounced) + Triage (replied)
    const emailEvents = await ctx.db
      .query('email_events')
      .order('desc')
      .take(limit);
    for (const row of emailEvents) {
      const ev = classifyEvent({
        source: 'resend',
        id: `email_events:${row._id}`,
        timestamp: row.timestamp,
        payload: { eventType: row.eventType, subject: (row as { subject?: string }).subject },
      });
      if (ev) events.push(ev);
    }

    // email_inbox → Triage (Purelymail inbound)
    const inbox = await ctx.db
      .query('email_inbox')
      .withIndex('by_receivedAt')
      .order('desc')
      .take(limit);
    for (const row of inbox) {
      const ev = classifyEvent({
        source: 'purelymail',
        id: `email_inbox:${row._id}`,
        timestamp: row.receivedAt,
        payload: { from: row.from, subject: row.subject },
      });
      if (ev) events.push(ev);
    }

    // cal_bookings → Calls
    const bookings = await ctx.db
      .query('cal_bookings')
      .withIndex('by_bookingTime')
      .order('desc')
      .take(limit);
    for (const row of bookings) {
      const ev = classifyEvent({
        source: 'cal-com',
        id: `cal_bookings:${row._id}`,
        timestamp: row.createdAt,
        payload: { type: row.type, name: row.name, bookingTime: row.bookingTime },
      });
      if (ev) events.push(ev);
    }

    // payments → Payment Gate
    const payments = await ctx.db
      .query('payments')
      .order('desc')
      .take(limit);
    for (const row of payments) {
      const ev = classifyEvent({
        source: 'stripe',
        id: `payments:${row._id}`,
        timestamp: row.createdAt,
        payload: { amount: row.amount, currency: row.currency, description: row.description },
      });
      if (ev) events.push(ev);
    }

    // activity_log: stage transitions → Implementation
    const stageChanges = await ctx.db
      .query('activity_log')
      .withIndex('by_action', (q) => q.eq('action', 'stage_change'))
      .order('desc')
      .take(limit);
    for (const row of stageChanges) {
      const details = row.details ?? '';
      // details format: "{from} → {to}" or similar. Best-effort parse.
      const toStage = details.split('→').pop()?.trim() ?? details;
      const ev = classifyEvent({
        source: 'stage-change',
        id: `activity_log:${row._id}`,
        timestamp: row.timestamp,
        payload: { leadId: row.leadId, toStage },
      });
      if (ev) events.push(ev);
    }

    // lead-create activity_log entries → Capture & Score
    const leadCreates = await ctx.db
      .query('activity_log')
      .withIndex('by_action', (q) => q.eq('action', 'lead_created'))
      .order('desc')
      .take(limit);
    for (const row of leadCreates) {
      const ev = classifyEvent({
        source: 'lead-create',
        id: `activity_log:lead_create:${row._id}`,
        timestamp: row.timestamp,
        payload: { leadId: row.leadId, company: row.details },
      });
      if (ev) events.push(ev);
    }

    // Newest first.
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events;
  },
});