// Convex cron schedule for the Hermes daily machine.
//
// Daily 9:00 AEST (UTC+10 in winter, UTC+11 in summer) — we use UTC.
// AEST = UTC+10, so 9am AEST = 23:00 UTC the previous day.
// We schedule at 23:00 UTC, which is safe all year (within the hour either way).
// Operators in AEDT get the email at 10am — still fine.
//
// runDaily:        pick up to HERMES_DAILY_LIMIT (default 40) queued leads
//                  and send touch 1.
// runFollowups:    every hour, send any touch 2/3 follow-ups that are due.

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.daily(
  'hermes-daily-outreach',
  { hourUTC: 23, minuteUTC: 0 },
  internal.hermes.cronEntry.runDailyCron
)

crons.hourly(
  'hermes-followups',
  { minuteUTC: 5 },
  internal.hermes.cronEntry.runFollowupsCron
)

export default crons
