#!/usr/bin/env node
// check-convex-deploy.mjs — post-deploy smoke test for glad-camel-940.
//
// Runs `npx convex function-spec` against the configured deployment
// and asserts that a representative set of functions from BOTH the
// website and the board repo are registered. Catches the recurring
// "last-push-wins wiped the other side" trap (ISSUE-6.4 / ADR-007).
//
// Exits 0 if all expected functions are present. Exits 1 if any
// expected function is missing — lists the missing ones to stderr.
//
// Usage:
//   node scripts/check-convex-deploy.mjs
//   npx convex function-spec | node scripts/check-convex-deploy.mjs
//
// The set of expected functions is intentionally small (a few
// representative ones from each module) — the goal is to catch the
// catastrophic "whole other side got wiped" case cheaply, not to
// exhaustively enumerate every function.

import { spawnSync } from 'node:child_process'
import { argv, exit } from 'node:process'

const REQUIRED = [
  // Website side — must survive every deploy
  'actions.js:list',
  'leads/leads.js:list',
  'assessment/submissions.js:listSubmissions',
  'hermes/cronEntry.js:runDailyCron',
  'hermes/outreach.js:createDraft',
  'email_inbox.js:list',
  'webhooks/cal.js:handleBooking',

  // Board side (mirrored from emvy-board/convex/board/*) — must
  // also survive every deploy
  'board/dashboard.js:needsAttention',
  'board/dashboard.js:pipelineSummary',
  'board/actions.js:list',
  'board/personal.js:listTasks',
  'board/drafts.js:listPending',
  'board/contacts.js:list',
  'board/leads.js:list',
  'board/activity.js:list',
  'board/activity.js:stats',
  'board/email_inbox.js:list',
  'board/webhookFeed.js:listAll',
]

function fetchFunctionSpec() {
  const result = spawnSync('npx', ['convex', 'function-spec'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) {
    console.error('npx convex function-spec failed:')
    console.error(result.stderr)
    exit(2)
  }
  try {
    return JSON.parse(result.stdout)
  } catch (err) {
    console.error('Failed to parse convex function-spec output as JSON:')
    console.error(result.stdout.slice(0, 500))
    exit(2)
  }
}

const spec = fetchFunctionSpec()
const identifiers = new Set(
  (spec.functions ?? []).map((f) => f.identifier)
)

const missing = REQUIRED.filter((id) => !identifiers.has(id))

if (missing.length > 0) {
  console.error('check-convex-deploy: missing required functions on the deployment:')
  for (const id of missing) {
    console.error(`  - ${id}`)
  }
  console.error(
    `\n${identifiers.size} total functions registered. ` +
    `This usually means a deploy wiped the other side — see ADR-007.`
  )
  exit(1)
}

console.log(
  `check-convex-deploy: ok — ${REQUIRED.length} representative functions present ` +
  `(${identifiers.size} total).`
)
