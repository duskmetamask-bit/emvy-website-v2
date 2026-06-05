// Convex cron schedule for the Hermes daily machine.
//
// PAUSED 2026-06-05 — operator (Dusk) caught 61 emails firing without
// per-batch review. See feedback_review-before-send.md memory and
// ISSUE-6.5 in Projects/EMVY Business/Issues-6 — Infra follow-ups
// 2026-06-04.md. Re-enable only after the draft → review → approved
// gate is wired (PR per ISSUE-6.5).
//
// Original schedule:
//   runDaily:        daily 23:00 UTC (= 9am AEST) — pick up to
//                    HERMES_DAILY_LIMIT (default 40) queued leads
//                    and send touch 1.
//   runFollowups:    every hour at :05 UTC — send any touch 2/3
//                    follow-ups that are due.

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

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
