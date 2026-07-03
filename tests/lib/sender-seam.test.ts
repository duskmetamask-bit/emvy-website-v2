// Sender Seam Regression Guard (Slice 2)
//
// INVARIANT (locked 2026-07-03):
//   `convex/hermes/outreach2.ts` is the ONLY file in `convex/` that may:
//     1. Write to the `outreach_queue` or `outreach_followups` tables.
//     2. Send via Resend on behalf of the blando outreach pipeline
//        (identified by the `X-Outreach-Step` header).
//
// SCOPE: This guard scopes to the BLANDO OUTREACH pipeline. Other
//   Resend callers (`convex/board/webmail.ts`, `convex/contact_notify_action.ts`,
//   `convex/audit_chatbot_notify_action.ts`) are transactional notification
//   paths that the operator relies on and do NOT interact with
//   outreach_queue / outreach_followups / email_sends. Those are NOT the
//   seam — they are correctly separate.
//
// WHY: between 2026-04 and 2026-07, three parallel outreach sender paths
//   lived simultaneously. The duplicate-send foot-gun returned on every
//   partial migration. This test fails CI the moment a developer adds
//   a new writer to outreach_queue or outreach_followups outside
//   `hermes/outreach2.ts`, OR adds a Resend send with `X-Outreach-Step`
//   outside `hermes/outreach2.ts`.
//
// RUNTIME EQUIVALENT: `SENDER_NAME === 'convex-v2'` guard in
// claimAndSendStep (committed 2026-07-03 in 8b5bc53) is belt + suspenders
// for this static check.
//
// ALLOWLIST: pre-existing seam violations are tracked below so the test
// can stay green while the migration to outreach2.ts is incomplete.
// Empty the ALLOWLIST as each item is remediated.
//
// IMPLEMENTATION: pure-Node file scan via fs.readdirSync + fs.readFileSync.
// Originally shell-based (`grep -rnE`), but the pattern strings contain
// regex chars that, when interpolated into a zsh command line, cause
// "unexpected EOF" shell errors that silently produce empty stdout and
// make the test pass vacuously. JS scan is deterministic and portable.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const CONVEX_DIR = join(ROOT, 'convex')
const CANONICAL_SEAM = 'convex/hermes/outreach2.ts'

// Pre-existing seam violations. The CI test must not fail on these
// today (they pre-date Slice 2), but each is owed a follow-up slice
// to either delete the dead writer or migrate it through outreach2.ts.
// Empty the list as items are remediated.
//
// As of 2026-07-03 Slice 2a: ALLOWLIST is EMPTY. `convex/hermes/runner.ts`
// + its 3 callers (`app/api/hermes/{seedTradies,runDaily}/route.ts` +
// `convex/hermes/cronEntry.ts:runDailyCron/runFollowupsCron`) were deleted.
// The seam is now genuinely single-writer.
const ALLOWLIST: ReadonlyArray<{ file: string; reason: string; slice: string }> = []

// Patterns that indicate a fresh sender / queue-writer sneaking into
// the outreach pipeline. We exclude the canonical seam file.
const PATTERNS: RegExp[] = [
  // Direct writes to outreach state tables
  /db\.insert\(\s*['"]outreach_queue['"]/,
  /db\.insert\(\s*['"]outreach_followups['"]/,
  // Patches that touch outreachState on a lead (state-machine flips)
  /db\.patch\(\s*[^,]+,\s*\{[^}]*outreachState/,
  // Resend sends flagged as outreach sends (X-Outreach-Step header)
  /X-Outreach-Step/,
  // Sender-side path-of-no-return markers (legacy v1 function names)
  /\bsendPersonalized\b/,
  /\bsendFollowupAction\b/,
  /\bsendCampaignDirect\b/,
]

type Offender = { pattern: string; file: string; line: string; content: string }

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      if (entry === '_generated' || entry === 'node_modules') continue
      walk(full, out)
    } else if (st.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
      out.push(full)
    }
  }
  return out
}

function scanForOffenders(): Offender[] {
  const files = walk(CONVEX_DIR)
  const offenders: Offender[] = []
  const allowlisted = new Set(ALLOWLIST.map((a) => a.file))
  for (const file of files) {
    const rel = relative(ROOT, file)
    if (rel === CANONICAL_SEAM) continue
    if (allowlisted.has(rel)) continue
    const content = readFileSync(file, 'utf8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (const pattern of PATTERNS) {
        if (pattern.test(line)) {
          offenders.push({
            pattern: pattern.source,
            file: rel,
            line: String(i + 1),
            content: line.trim(),
          })
        }
      }
    }
  }
  return offenders
}

describe('outreach sender seam', () => {
  it('only convex/hermes/outreach2.ts may write outreach state or send via the X-Outreach-Step channel', () => {
    const offenders = scanForOffenders()
    if (offenders.length > 0) {
      const formatted = offenders
        .map((o) => `  - ${o.file}:${o.line}  [${o.pattern}]\n      ${o.content}`)
        .join('\n')
      throw new Error(
        `Outreach sender seam violation — only ${CANONICAL_SEAM} may write outreach state or send via the X-Outreach-Step channel. ` +
          `Found ${offenders.length} offender(s):\n${formatted}\n\n` +
          `Route the new code through convex/hermes/outreach2.ts (queueSequence → drainDueOutreach → claimAndSendStep → markStepSent).`,
      )
    }
    expect(offenders).toHaveLength(0)
  })
})