// Convex cron schedule for the Hermes daily machine.
//
// 2026-06-05 — original runDaily + runFollowups crons PAUSED after the
// 61-email incident (no per-batch review gate). Per ISSUE-6.5.
//
// 2026-07-03 — drain-outreach-queue cron ADDED. This was the missing
// sender path: Zone 2 cron queues E1+E2+E3 to Convex outreach_queue;
// drainDueOutreach (5-min cadence) loops over due rows and calls
// claimAndSendStep on each.
//
// 2026-07-03 PM — drain-outreach-queue cron DISABLED. Operator wants
// manual approval per send (board UI at /outreach/queue). The drainer
// function still exists and is called by the new public `sendOne`
// mutation when the operator clicks Send. No auto-sends.
//
// The locked law (feedback_outreach_followup_timing_law.md) — followups
// NEVER fire at the same time as initial outreach — is enforced at SEND
// TIME in `claim`, not at the cron level. So even manual sends via the
// UI are safe: rows that fail the E2≥4d/E3≥6d gate return
// blocked:e*_too_soon and stay queued.

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// 2026-07-03 PM — drain-outreach-queue cron DISABLED for manual-only mode.
// To re-enable auto-drain (e.g. after trust is rebuilt), uncomment the
// block below.
// crons.interval(
//   'drain-outreach-queue',
//   { minutes: 5 },
//   internal.hermes.outreach2.drainDueOutreach,
//   { batchSize: 10 },
// )

// crons.daily(
//   'hermes-daily-outreach',
//   { hourUTC: 23, minuteUTC: 0 },
//   internal.hermes.cronEntry.runDailyCron
// )

// crons.hourly(
//   'hermes-followups',
//   { minuteUTC: 5 },
//   internal.hermes.cronEntry.runFollowupsCron
// )

export default crons
