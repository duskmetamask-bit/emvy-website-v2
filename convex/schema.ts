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

  // Audit chatbot leads (emvy-audit-chatbot.vercel.app). Richer than
  // assessment_submissions — carries the 5-section report (Strategy
  // Summary, 3 Opportunities, Quick Win, First 90 Days, Next Step) plus
  // the full assessment snapshot. Public mutation writes here + auto-
  // creates a `leads` row so the board's existing /pipeline picks it up.
  //
  // The chat front-end writes a 'new' row at email-submit time. The
  // MiniMax M2.7 report lands a few seconds later and the front-end
  // calls :update to flip status to 'completed' + fill in the report.
  // The board's /audit-chatbot view reads this table and groups by
  // status.
  audit_chatbot_leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),

    // Business profile (from the chat)
    businessName: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),

    // 5-section report (backfilled by the front-end via :update).
    summary: v.optional(v.string()),
    opportunities: v.optional(
      v.array(
        v.object({
          title: v.string(),
          whatItIs: v.string(),
          whyMatters: v.string(),
          whatChanges: v.string(),
          howFast: v.string(),
        })
      )
    ),
    quickWin: v.optional(v.string()),
    first90Days: v.optional(
      v.array(
        v.object({
          title: v.string(),
          actions: v.array(v.string()),
        })
      )
    ),
    nextStep: v.optional(v.string()),

    // Full assessment snapshot
    findings: v.array(
      v.object({
        category: v.string(),
        text: v.string(),
        severity: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
      })
    ),

    // Audit-chatbot scoring output (added 2026-06-18: schema was out of sync
    // with what the audit chatbot actually writes). All optional so older
    // rows without these fields still validate.
    categoriesCovered: v.optional(v.array(v.string())),
    score: v.optional(v.float64()),
    scoreLabel: v.optional(v.string()),
    scoreBlurb: v.optional(v.string()),
    scores: v.optional(v.record(v.string(), v.float64())),
    week1: v.optional(v.array(v.string())),
    weeks24: v.optional(v.array(v.string())),
    months23: v.optional(v.array(v.string())),
    painPoints: v.array(v.string()),
    manualTasks: v.array(v.string()),
    aiTools: v.optional(v.string()),
    goal: v.optional(v.string()),

    // Operator review workflow.
    // 'new' = just submitted, report not yet backfilled.
    // 'completed' = full report backfilled via :update.
    // 'reviewed' = operator looked at it on the board.
    // 'converted' = promoted into the leads pipeline.
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('completed'),
        v.literal('reviewed'),
        v.literal('converted'),
      )
    ),
    updatedAt: v.optional(v.number()),

    // Operator-notification bookkeeping (added 2026-06-24: webhook +
    // email pipeline via audit_chatbot_notify.ts:notifyOperator).
    // notifiedAt gates idempotency — re-runs no-op. notificationErrors
    // captures any partial failures so the operator can see what broke.
    notifiedAt: v.optional(v.number()),
    notificationErrors: v.optional(v.array(v.string())),

    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_createdAt', ['createdAt'])
    .index('by_status', ['status']),

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
    // Outreach state machine fields (aligned to live Convex 2026-07-01)
    unsubscribedAt: v.optional(v.number()),
    doNotContactAt: v.optional(v.number()),
    outreachState: v.optional(v.string()),
    nextActionAt: v.optional(v.number()),
    outreachHistory: v.optional(v.array(v.object({ step: v.string(), sentAt: v.number() }))),
  })
    .index('by_stage', ['stage'])
    .index('by_score', ['score'])
    .index('by_sector', ['sector'])
    .index('by_source', ['source'])
    .index('by_outcome', ['outcome'])
    .index('by_discoveredAt', ['discoveredAt'])
    .index('by_email', ['email'])
    .index('by_outreachState', ['outreachState']),

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
    status: v.string(), // sent, delivered, opened, replied, bounced, pending, failed
    sentAt: v.number(),
    resendId: v.optional(v.string()),
    draftId: v.optional(v.id('email_drafts')),
    sentBy: v.optional(v.string()), // 'auto' | 'operator' | 'board'
    body: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    sequence: v.optional(v.string()),
    touch: v.optional(v.number()),
    fromEmail: v.optional(v.string()),
    toEmail: v.optional(v.string()),
    company: v.optional(v.string()),
    contact: v.optional(v.string()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
    bouncedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  })
    .index('by_lead', ['leadId'])
    .index('by_status', ['status'])
    .index('by_sentAt', ['sentAt'])
    .index('by_resendId', ['resendId']),

  pdf_lead_magnets: defineTable({
    leadId: v.optional(v.id('leads')),
    title: v.string(),
    vertical: v.optional(v.string()),
    solution: v.optional(v.string()),
    path: v.optional(v.string()),
    url: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_lead', ['leadId']).index('by_vertical', ['vertical']),

  // Per-message operator state for the webmail UI (board).
  // Key format: `${type}:${id}` where type is 'inbox' or 'sent'.
  // Decoupled from email_inbox/email_sends so existing pipelines
  // (Purelymail IMAP, Resend send) keep working without migration.
  // Folders: 'inbox' | 'sent' | 'starred' | 'archive' | 'trash' | 'drafts'.
  email_message_state: defineTable({
    key: v.string(),
    folder: v.string(),
    starred: v.boolean(),
    lastReadAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index('by_key', ['key'])
    .index('by_folder_lastReadAt', ['folder', 'lastReadAt'])
    .index('by_starred_lastReadAt', ['starred', 'lastReadAt']),

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
    notifiedAt: v.optional(v.number()),
    notificationErrors: v.optional(v.array(v.string())),
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
    nextActionAt: v.optional(v.number()),
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
    templateId: v.optional(v.string()),
    forceBypassGates: v.optional(v.boolean()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
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

  // Maya publication log — content drafts/posts from the Maya agent
  // (VPS Hermes profile). Mirrors the vault doc MAYA-PUBLICATION-LOG.md
  // and is fed by the `maya-publication-log` cron via
  // convex/hermes/marketing.ts:appendEntry. Read by the board's /maya
  // tab so the operator can see the full pipeline (drafts → published
  // → engagement) without opening the vault.
  //
  // Engagement + link are filled in by the operator or a future
  // analytics cron (placeholder JSON `{ likes, reposts, replies }` for
  // X / LinkedIn, `{ pageviews }` for Blog).
  maya_publication_log: defineTable({
    date: v.string(), // YYYY-MM-DD
    platform: v.union(
      v.literal('X'),
      v.literal('LinkedIn'),
      v.literal('Blog')
    ),
    title: v.string(), // first heading/line of the draft, truncated 80 chars
    status: v.union(
      v.literal('draft'),
      v.literal('published'),
      v.literal('revised')
    ),
    body: v.optional(v.string()), // full post text (markdown). Powers the board's detail panel — no vault access from the board.
    engagement: v.optional(v.any()), // JSON: {likes, reposts, replies} or {pageviews}
    link: v.optional(v.string()),
    sourcePath: v.string(), // relative path to the draft file
    agentId: v.literal('maya'),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_platform', ['platform'])
    .index('by_status', ['status'])
    .index('by_createdAt', ['createdAt']),

  // Intelligence reports from the VPS `intelligence` agent (formerly
  // `deep-state`). The agent produces 10+ daily/weekly briefs — competitor
  // pricing, deep dives, sentiment pulse, ISO 42001 tracking, etc. — and
  // historically wrote them to Obsidian vault markdown files. As of
  // 2026-06-14 they also POST to `hermes/intelligence:appendEntry` so the
  // board's /intelligence tab can render them alongside Maya's publication
  // log. activity_log is NOT written here — these are research outputs,
  // not lead-scoped events.
  intelligence_reports: defineTable({
    date: v.string(), // YYYY-MM-DD
    reportType: v.union(
      v.literal('daily_competitive_intel'),
      v.literal('competitor_pricing'),
      v.literal('competitor_deep_dive'),
      v.literal('compliance_tracker'),
      v.literal('sentiment_pulse'),
      v.literal('launch_tracker'),
      v.literal('seo_gap'),
      v.literal('sector_assessment'),
      v.literal('content_routing'),
      v.literal('pricing_strategy'),
      v.literal('ico_target'),
      v.literal('positioning'),
    ),
    title: v.string(), // topic / first heading, truncated 120 chars
    summary: v.string(), // 1-3 sentence brief
    body: v.optional(v.string()), // full markdown body (can be large)
    tags: v.optional(v.array(v.string())), // keywords (competitor names, sectors, etc.)
    sourcePath: v.string(), // relative path in ~/obsidian-vault/intelligence/
    agentId: v.literal('intelligence'),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_reportType', ['reportType'])
    .index('by_createdAt', ['createdAt']),

  // Synthesized daily intelligence brief — one row per day, written by
  // the VPS `brief-synthesizer` cron (17:30 AWST, post End-of-Day Sector
  // Assessment). The brief reads every intelligence_reports row for the
  // date and concatenates them into a single executive summary so the
  // operator doesn't have to click through 12 reports. The board's
  // /intelligence hero reads this table for the "today's brief" card.
  //
  // Schema: 1 row per date (upsert). body holds the synthesized markdown;
  // sourceReportIds is the list of contributing intelligence_reports ids
  // for traceability.
  // activity_log is NOT written here — same reason as intelligence_reports
  // (research output, not lead-scoped). The brief row is its own audit trail.
  intelligence_brief: defineTable({
    date: v.string(), // YYYY-MM-DD
    title: v.string(), // "Daily Intelligence Brief — 2026-06-15"
    summary: v.string(), // 1-3 sentence exec summary
    body: v.string(), // synthesized markdown body
    sourceReportIds: v.array(v.id('intelligence_reports')),
    agentId: v.literal('intelligence'),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_createdAt', ['createdAt']),

  // Audit register — deliverables from the Sage agent (VPS Hermes profile).
  // One row per business audited. Mirrors the vault doc
  // ~/obsidian-vault/audit/AUDIT-REGISTER.md (to be created in a follow-up
  // session). Fed by the `AI Business Audit — Daily Crawler` cron via
  // convex/hermes/audit.ts:appendEntry. Read by the board's /audits tab so
  // the operator can see the audit pipeline + suggested build ideas without
  // opening the vault.
  //
  // Schema shape: 4 user-facing columns (businessName + 3 markdown bodies),
  // one row per business, deduped on businessName (case-insensitive lookup
  // in the mutation, see hermes/audit.ts).
  // activity_log is NOT written here — audits are not lead-scoped. The
  // audit_register row (with agentId + createdAt + sourcePath) is the
  // audit trail.
  audit_register: defineTable({
    date: v.string(), // YYYY-MM-DD
    businessName: v.string(), // 1-200 chars, deduplicated (case-insensitive)
    auditConducted: v.string(), // markdown, 1-20000 chars
    findingsRecommendations: v.string(), // markdown, 1-20000 chars
    buildIdeas: v.string(), // markdown, 1-20000 chars
    sourcePath: v.string(), // relative path in ~/obsidian-vault/audit/
    agentId: v.literal('sage'),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_businessName', ['businessName'])
    .index('by_createdAt', ['createdAt']),

  // Cron health rows — one row per cron job across all 9 EMVY agents,
  // upserted by the VPS `~/.hermes/bin/log_cron_health.py` every 5 min
  // (added 2026-06-15). The board's /intelligence cron roster reads
  // this live, replacing the static INTEL_CRON_ROSTER array. The
  // /cron-health surface (future) will paginate by agent.
  // Written by hermes/cronEntry.ts:appendRun.
  cron_runs: defineTable({
    agentId: v.string(), // 'maya' | 'intelligence' | 'blando' | 'audit' | 'builds' | 'happy-harold' | 'mewy' | 'ops' | 'sage'
    cronName: v.string(),
    schedule: v.string(), // cron expr in whatever timezone the agent uses
    state: v.union(
      v.literal('scheduled'),
      v.literal('paused'),
      v.literal('unscheduled'),
      v.literal('error'),
    ),
    lastStatus: v.optional(v.string()), // 'ok' | error message | null
    lastRunAt: v.optional(v.number()), // ms epoch
    note: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_agentId', ['agentId'])
    .index('by_agent_cronName', ['agentId', 'cronName'])
    .index('by_state', ['state'])
    .index('by_updatedAt', ['updatedAt']),

  // Cron run history — append-only log of every cron invocation.
  // One row per (agentId, cronName, startedAt). Written by
  // hermes/cronEntry.ts:appendHistory. The board's /cron-history page
  // surfaces this for stats (success rate, p50/p95 duration) and a
  // per-cron timeline. Retention is operator-managed (see vault note).
  cron_run_history: defineTable({
    agentId: v.string(),        // 'mewy' | 'maya' | 'intelligence' | 'blando' | 'audit' | 'builds' | 'happy-harold' | 'ops' | 'sage'
    cronName: v.string(),       // matches cron_runs.cronName for the same agent
    startedAt: v.number(),      // ms epoch when the cron started
    finishedAt: v.optional(v.number()), // ms epoch when it finished (null if still running)
    durationMs: v.optional(v.number()), // finishedAt - startedAt, set on completion
    status: v.union(
      v.literal('ok'),
      v.literal('fail'),
      v.literal('running'),
    ),
    error: v.optional(v.string()),  // failure message if status='fail'
    source: v.optional(v.string()),  // 'log_cron_health.py' | 'manual' | etc.
    runId: v.optional(v.string()),  // optional correlation id from the calling script
  })
    .index('by_agentId_startedAt', ['agentId', 'startedAt'])
    .index('by_agent_cronName_startedAt', ['agentId', 'cronName', 'startedAt'])
    .index('by_status', ['status'])
    .index('by_startedAt', ['startedAt']),

  // Maya content topics — one row per date in the 30-day content
  // calendar. Parsed from ~/obsidian-vault/maya/content-calendar/30-DAY-CALENDAR-v2.md
  // by ~/.hermes/profiles/maya/bin/log_topics.py. The board's /marketing
  // 7-day grid reads this for per-date topic labels (e.g. "June 17 —
  // Memory Thread"). Written by hermes/marketing.ts:appendTopic.
  maya_content_topics: defineTable({
    date: v.string(),         // YYYY-MM-DD
    dayName: v.string(),      // Monday, Tuesday, ...
    topic: v.string(),        // "Memory Thread", "Quick Win", "Exact Setup", ...
    bucket: v.string(),       // "Operator" | "Business Outcome"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_updatedAt', ['updatedAt']),

  // Build register — production-code build pipeline from the Cartz/Builds
  // agent. One row per build project; stage is mutable across crons. Mirrors
  // the vault doc ~/obsidian-vault/builds/BUILD-REGISTER.md (5 stages
  // currently; expanding to 6 with this slice — adding "awaiting_dusk_approval"
  // between reviewed and the prior "live" stage, which is renamed
  // "product_ready_to_sell" to make the gate explicit). Fed by the
  // `Build Register — Daily Review` cron via convex/hermes/builds.ts:appendEntry
  // (upsert semantics: insert new project, or update stage of existing).
  // Read by the board's /builds tab.
  //
  // 6 stages: build_idea → design_visuals → planning → reviewed →
  //   awaiting_dusk_approval → product_ready_to_sell.
  // The "awaiting_dusk_approval" gate is explicit; nothing advances past
  // "reviewed" without operator sign-off (the cron won't auto-advance —
  // the operator edits the vault file, and the next daily review picks it up).
  // activity_log is NOT written here — builds are not lead-scoped.
  build_register: defineTable({
    date: v.string(), // YYYY-MM-DD (date the row was last touched)
    project: v.string(), // 1-200 chars, upserted (see hermes/builds.ts)
    stage: v.union(
      v.literal('build_idea'),
      v.literal('design_visuals'),
      v.literal('planning'),
      v.literal('reviewed'),
      v.literal('awaiting_dusk_approval'),
      v.literal('product_ready_to_sell'),
    ),
    sourcePath: v.string(), // relative path in ~/obsidian-vault/builds/
    agentId: v.literal('builds'),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_stage', ['stage'])
    .index('by_createdAt', ['createdAt']),

  // === Competitor Pricing Matrix (Intelligence agent output, surfaced on /pricing) ===
  // Written by the seed script from the 2026-06-16 VPS pricing_matrix artifact.
  // The intelligence agent can PATCH rows via hermes/pricing:upsertCompetitor;
  // the operator can override notes via board/pricing:setEmvyNotes.

  competitor_pricing: defineTable({
    competitor: v.string(), // canonical name (e.g. 'Nimbull')
    isEmvy: v.boolean(), // true for the EMVY row, false for competitors
    location: v.string(), // 'Sydney' | 'AU' | 'Perth' | etc.
    positioning: v.string(), // one-liner
    website: v.string(), // URL
    auditPrice: v.string(), // '$797' | 'NP' | 'Free'
    auditFormat: v.string(), // '40-60 min + written report'
    auditIncludes: v.string(), // what the audit deliverable covers
    auditBuildCredit: v.boolean(), // true if the audit fee is credited to a subsequent build
    buildMin: v.string(), // '$3,000' | 'NP' | '$2,000/mo'
    buildMax: v.string(),
    buildType: v.string(), // 'Chatbot, Voice AI, Workflow'
    buildNotes: v.string(), // 'Scoped from audit' | etc.
    retainerPrice: v.string(), // '$300-$600/mo' | 'NP'
    retainerIncludes: v.string(),
    emvyNotes: v.optional(v.string()), // operator notes, initially empty
    source: v.union(v.literal('manual'), v.literal('intel_agent')),
    updatedAt: v.number(),
  })
    .index('by_competitor', ['competitor'])
    .index('by_isEmvy', ['isEmvy']),

  pricing_recommendation: defineTable({
    number: v.number(), // 1..5, order from the intel report
    title: v.string(), // 'Move audit from $797 -> $997'
    body: v.string(), // the rationale
    status: v.union(v.literal('open'), v.literal('applied'), v.literal('dropped')),
    createdAt: v.number(),
  })
    .index('by_number', ['number'])
    .index('by_status', ['status']),

  // === Personal Board tables (Dusk personal management) ===
  // Single-user data; auth-gated by the board's HMAC middleware.
  // The board repo is the only client; the website schema mirrors so
  // shared-deployment pushes from either side keep the tables alive.

  personal_tasks: defineTable({
    title: v.string(),
    done: v.boolean(),
    priority: v.optional(
      v.union(v.literal('P0'), v.literal('P1'), v.literal('P2'), v.literal('P3'))
    ),
    dueAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_done', ['done']),

  personal_habits: defineTable({
    name: v.string(),
    cadence: v.union(v.literal('daily'), v.literal('weekly')),
    streak: v.number(),
    lastCheckIn: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_createdAt', ['createdAt']),

  personal_journal: defineTable({
    date: v.string(),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_updatedAt', ['updatedAt']),

  personal_goals: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal('active'), v.literal('done'), v.literal('dropped')),
    targetDate: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_createdAt', ['createdAt']),

  // Blog posts — Maya publishes daily via cron. Target keywords for
  // trades, professional services, and AU SMB SEO.
  blog_posts: defineTable({
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    body: v.optional(v.string()),
    targetKeyword: v.optional(v.string()),
    vertical: v.union(v.literal('trades'), v.literal('professional-services'), v.literal('general')),
    status: v.union(v.literal('draft'), v.literal('published')),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    agentId: v.optional(v.literal('maya')),
    sourcePath: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    readingTimeMinutes: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_publishedAt', ['publishedAt'])
    .index('by_vertical', ['vertical']),
})
