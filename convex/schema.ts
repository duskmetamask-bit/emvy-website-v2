import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  assessment_submissions: defineTable({
    name: v.string(),
    email: v.string(),
    score: v.number(),
    priorityLevel: v.string(),
    priorityDescription: v.string(),
    recommendation: v.string(),
    answers: v.object({
      call_handling: v.union(v.string(), v.array(v.string())),
      time_waste: v.string(),
      bottlenecks: v.string(),
      automate_first: v.string(),
      double_entry: v.string(),
      team_size: v.string(),
      tools: v.array(v.string()),
      problem_duration: v.string(),
      tried_fix: v.string(),
      time_back: v.string(),
    }),
    createdAt: v.number(),
  }).index('by_email', ['email']).index('by_createdAt', ['createdAt']),

  leads: defineTable({
    company: v.optional(v.string()),
    contact: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    source: v.optional(v.string()),
    lastTouchpoint: v.optional(v.string()),
    sector: v.optional(v.string()),
    score: v.optional(v.number()),
    painSignals: v.optional(v.array(v.string())),
    icpMatch: v.optional(v.boolean()),
    solutionMatched: v.optional(v.string()),
    emailSequence: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    outcome: v.optional(v.string()),
    stage: v.optional(v.string()),
    discoveredAt: v.optional(v.number()),
    enrichedAt: v.optional(v.number()),
  })
    .index('by_stage', ['stage'])
    .index('by_score', ['score'])
    .index('by_sector', ['sector'])
    .index('by_source', ['source'])
    .index('by_outcome', ['outcome'])
    .index('by_discoveredAt', ['discoveredAt'])
    .index('by_email', ['email']),

  email_drafts: defineTable({
    leadId: v.optional(v.id('leads')),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    status: v.optional(v.string()), // draft, approved, sent
    createdAt: v.optional(v.number()),
  }).index('by_status', ['status']).index('by_lead', ['leadId']),

  email_sends: defineTable({
    leadId: v.id('leads'),
    subject: v.string(),
    status: v.string(), // sent, delivered, opened, replied, bounced
    sentAt: v.number(),
  })
    .index('by_lead', ['leadId'])
    .index('by_status', ['status'])
    .index('by_sentAt', ['sentAt']),

  pdf_lead_magnets: defineTable({
    leadId: v.optional(v.id('leads')),
    title: v.string(),
    vertical: v.optional(v.string()),
    solution: v.optional(v.string()),
    path: v.optional(v.string()),
    url: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_lead', ['leadId']).index('by_vertical', ['vertical']),

  cal_bookings: defineTable({
    leadId: v.optional(v.id('leads')),
    eventId: v.string(),
    type: v.optional(v.string()), // 'discovery' | 'audit' | 'strategy' | 'implementation' | 'review'
    bookingTime: v.number(),
    status: v.string(), // scheduled, confirmed, completed, cancelled
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_lead', ['leadId'])
    .index('by_bookingTime', ['bookingTime'])
    .index('by_type', ['type']),

  contact_submissions: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    source: v.optional(v.string()), // contact-form, footer, etc.
    createdAt: v.number(),
  }).index('by_email', ['email']).index('by_createdAt', ['createdAt']),

  email_events: defineTable({
    emailId: v.optional(v.string()), // Resend email ID
    leadId: v.optional(v.id('leads')),
    eventType: v.string(), // delivered, opened, clicked, bounced, complained
    timestamp: v.number(),
    metadata: v.optional(v.string()), // JSON string for extra data
  }).index('by_emailId', ['emailId']).index('by_lead', ['leadId']).index('by_eventType', ['eventType']),

  activity_log: defineTable({
    leadId: v.id('leads'),
    action: v.string(), // stage_change, email_sent, email_opened, booking_created, note_added
    actor: v.optional(v.string()), // 'operator' | 'hermes' — write provenance
    details: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_lead', ['leadId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_action', ['action']),

  payments: defineTable({
    leadId: v.optional(v.id('leads')),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(), // in cents
    currency: v.optional(v.string()), // usd, aud, etc.
    status: v.string(), // pending, succeeded, failed, refunded, cancelled
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_lead', ['leadId'])
    .index('by_status', ['status'])
    .index('by_stripeId', ['stripePaymentIntentId'])
    .index('by_createdAt', ['createdAt']),

  case_studies: defineTable({
    title: v.string(),
    client: v.optional(v.string()),
    sector: v.optional(v.string()),
    problem: v.optional(v.string()),
    solution: v.optional(v.string()),
    outcome: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index('by_sector', ['sector']).index('by_createdAt', ['createdAt']),

  email_inbox: defineTable({
    messageId: v.string(),
    from: v.string(), // full RFC822 From header, e.g. "Jane Doe <jane@example.com>"
    fromAddress: v.string(), // parsed "jane@example.com" for indexing
    to: v.string(), // receiving address, e.g. "hello@emvyai.com"
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
    inReplyTo: v.optional(v.string()),
    references: v.optional(v.string()),
    receivedAt: v.number(),
    leadId: v.optional(v.id('leads')),
    status: v.string(), // unread, read, archived
  })
    .index('by_lead', ['leadId'])
    .index('by_from', ['fromAddress'])
    .index('by_receivedAt', ['receivedAt'])
    .index('by_status', ['status']),

  actions: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    track: v.string(), // workspace | growth | clients | harden | polish
    priority: v.string(), // P0 | P1 | P2 | P3
    status: v.string(), // open | in_progress | done | blocked | dropped
    assignee: v.string(), // operator | hermes
    actor: v.string(), // operator | hermes (write provenance)
    source: v.optional(v.string()), // manual | hermes | import
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    dueAt: v.optional(v.number()),
    blockedBy: v.optional(v.array(v.id('actions'))),
    evidence: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_track', ['track'])
    .index('by_assignee', ['assignee'])
    .index('by_actor', ['actor'])
    .index('by_priority', ['priority'])
    .index('by_dueAt', ['dueAt']),

  outreach_queue: defineTable({
    leadId: v.optional(v.id('leads')),
    company: v.string(),
    contact: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    sector: v.optional(v.string()),
    source: v.optional(v.string()), // csv_seed | yp_scrape | manual | followup
    status: v.string(), // queued | sending | sent | failed | suppressed | replied
    scheduledFor: v.optional(v.number()),
    attempts: v.optional(v.number()),
    lastError: v.optional(v.string()),
    lastAttemptAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    draftId: v.optional(v.id('email_drafts')),
    sendId: v.optional(v.id('email_sends')),
    touch: v.optional(v.number()), // 1 = first outreach, 2 = follow-up #1, 3 = follow-up #2
    createdAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_status_scheduledFor', ['status', 'scheduledFor'])
    .index('by_lead', ['leadId'])
    .index('by_email', ['email']),

  outreach_followups: defineTable({
    queueId: v.id('outreach_queue'),
    leadId: v.id('leads'),
    touch: v.number(), // 2 or 3
    sendAt: v.number(),
    status: v.string(), // scheduled | sent | cancelled | failed
    cancelledReason: v.optional(v.string()), // replied | bounced | unsubscribed | manual
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_status_sendAt', ['status', 'sendAt'])
    .index('by_lead', ['leadId']),

  hermes_daily_digest: defineTable({
    date: v.string(), // YYYY-MM-DD
    planned: v.number(),
    sent: v.number(),
    failed: v.number(),
    suppressed: v.number(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_date', ['date']),

  learnings: defineTable({
    leadId: v.optional(v.id('leads')),
    draftId: v.optional(v.id('email_drafts')),
    sendId: v.optional(v.id('email_sends')),
    source: v.string(), // 'operator_edit' | 'operator_save' | 'auto_send' | 'discarded'
    fromAddress: v.optional(v.string()),
    subject: v.optional(v.string()),
    originalBody: v.optional(v.string()),
    editedBody: v.optional(v.string()),
    context: v.optional(v.string()), // JSON: lead snapshot at capture time
    weight: v.optional(v.number()), // operator_edit = 2.0, default 1.0
    capturedAt: v.number(),
  })
    .index('by_lead', ['leadId'])
    .index('by_source', ['source'])
    .index('by_capturedAt', ['capturedAt']),

  contacts: defineTable({
    name: v.string(),
    relationship: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastEngagementAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_lastEngagementAt', ['lastEngagementAt']),

  contact_engagement: defineTable({
    contactId: v.id('contacts'),
    type: v.union(
      v.literal('note'),
      v.literal('call'),
      v.literal('message'),
      v.literal('meetup'),
      v.literal('gift'),
      v.literal('other')
    ),
    summary: v.string(),
    details: v.optional(v.string()),
    occurredAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_contact', ['contactId'])
    .index('by_occurredAt', ['occurredAt']),
})
