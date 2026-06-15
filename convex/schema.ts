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
  // assessment_submissions — carries the 30/60/90 roadmap, per-category
  // scores, and full findings. Public mutation writes here + auto-creates
  // a `leads` row so the board's existing /pipeline picks it up.
  //
  // The chat front-end writes a 'new' row at email-submit time with
  // score: 0, scoreLabel: 'Pending'. The MiniMax M2.7 report lands a few
  // seconds later and the front-end calls :update to flip status to
  // 'completed' + fill in the roadmap + score. The board's /audit-chatbot
  // view reads this table and groups by status.
  audit_chatbot_leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),

    // Business profile (from the chat)
    businessName: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),

    // Score + headline
    score: v.number(),
    scoreLabel: v.string(),
    scoreBlurb: v.optional(v.string()),
    summary: v.optional(v.string()),

    // 30/60/90 roadmap actions (arrays of strings).
    // Backfilled by the front-end via :update once the report lands.
    week1: v.optional(v.array(v.string())),
    weeks24: v.optional(v.array(v.string())),
    months23: v.optional(v.array(v.string())),
    nextStep: v.optional(v.string()),

    // Full assessment snapshot
    findings: v.array(
      v.object({
        category: v.string(),
        text: v.string(),
        severity: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
      })
    ),
    categoriesCovered: v.array(v.string()),
    painPoints: v.array(v.string()),
    manualTasks: v.array(v.string()),
    scores: v.record(v.string(), v.number()),
    aiTools: v.optional(v.string()),
    budget: v.optional(v.string()),
    goal: v.optional(v.string()),
    obstacles: v.optional(v.string()),

    // Operator review workflow. 'new' = just submitted, score: 0.
    // 'completed' = full report backfilled via :update.
    // 'reviewed' = operator looked at it on the board.
    // 'converted' = promoted into the leads pipeline (v2 slice).
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('completed'),
        v.literal('reviewed'),
        v.literal('converted'),
      )
    ),
    updatedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_createdAt', ['createdAt'])
    .index('by_score', ['score'])
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
})
