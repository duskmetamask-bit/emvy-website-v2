# EMVY Repo Map

> Codifies which repo deploys what, what each repo may import, and what each repo MUST NOT do. Locked 2026-07-03 (Slice 6). If this file and `convex/_generated/api.d.ts` disagree, the smoke test (`scripts/check-schema-mirror.js` in the board) catches it.

## 1. Purpose

- **`emvy-website-v2`** — Public site (`emvyai.com`) + private operating board (`/admin`). Single source of truth for Convex schema + functions.
- **`emvy-board`** — Companion board UI app. Reads from the website's Convex deployment. Hosts operator-specific pages not on the public site.

Both apps share the Convex deployment `glad-camel-940` (per `reference_convex-deployment.md`).

## 2. Roster (canonical agent + file ownership)

| Concern | Owner | File |
|---|---|---|
| Convex schema | website | `emvy-website-v2/convex/schema.ts` |
| Convex functions (writes) | website | `emvy-website-v2/convex/hermes/*` |
| Convex functions (board reads) | website | `emvy-website-v2/convex/board/*` (with board mirror at `emvy-board/convex/board/*`) |
| Hermes schema deployer | website | postbuild hook in `package.json` |
| Outreach sender seam | website | `emvy-website-v2/convex/hermes/outreach2.ts` ONLY |
| Public marketing pages | website | `emvy-website-v2/app/(public)/*` |
| Admin / board pages | board | `emvy-board/app/(board)/*` |
| Schema mirror CI | board | `emvy-board/scripts/check-schema-mirror.js` |

## 3. Canonical deployer

**`emvy-website-v2` is the single Convex deployer.** Its Vercel postbuild hook runs `npx convex deploy` against `glad-camel-940` after every successful build.

The board repo deploys to Vercel only (Next.js side). It does NOT invoke `npx convex deploy`. This is enforced by ADR-007.

## 4. Deploy-key table

| Key | Where | Notes |
|---|---|---|
| `CONVEX_DEPLOY_KEY` (website) | `emvy-website-v2/.env.prod.pull` | `dev:glad-camel-940\|<token>` despite `dev:` prefix is PROD per `reference_convex-deploy-key-misnomer.md`. |
| `CONVEX_DEPLOY_KEY` (board) | NOT SET | Board doesn't deploy Convex. |
| `SENDER_NAME` | `glad-camel-940` env | MUST be `convex-v2`. Runtime seam guard (Slice 2) refuses any other value. |
| `RESEND_API_KEY` | `glad-camel-940` env | Used by `claimAndSendStep` + `operatorSend`. Board uses the same deployment's env. |
| `HERMES_ACTIONS_TOKEN` | `glad-camel-940` env + `emvy-website-v2/.env` | Per-agent bearer token for `markStepSent` + `setOutreachPaused`. |

**Never** use `vercel env add` with stdin pipe (creates empty values per `feedback_vercel-env-add-stdin.md`). Always pass `--value`.

## 5. Read surfaces

| Repo | What it reads |
|---|---|
| `emvy-website-v2` | Own Convex deployment via `convex/react` |
| `emvy-board` | Same Convex deployment via `convex/react`. The board has `convex/hermes/outreach2.ts` as a TS-only mirror (no deployed code); `convex/board/*` is the board's own queries that call into hermes via `internal.hermes.outreach2.*`. |

## 6. Write surfaces

| Repo | What it writes |
|---|---|
| `emvy-website-v2` | Everything. Public site + Convex schema + Convex functions + Hermes crons. |
| `emvy-board` | ONLY through the website's Convex functions. The board calls `api.hermes.outreach2.operatorSend`, `api.hermes.outreach2.markStepSent`, etc. The board's own `convex/board/outreach.ts` mutations are LIMITED to `settings.outreach_paused` (Slice 1a board mirror precedent) — no other writes. |

## 7. Forbidden actions

- ❌ Board invoking `npx convex deploy` (ADR-007)
- ❌ New Resend sender paths outside `convex/hermes/outreach2.ts` (Slice 2 sender seam; CI fails on violation)
- ❌ New DB writes to `outreach_queue` / `outreach_followups` outside `convex/hermes/outreach2.ts` (Slice 2 sender seam)
- ❌ Brevo anywhere in the codebase (permanently retired 2026-06-26 per `feedback_blando_brevo_retire.md`)
- ❌ `git a` / `git au` / `git aa` shell aliases (per `feedback_git-aliases-staging-deletions.md`)
- ❌ Hand-rolled empty/loading/error spinners on the board (use `components/states/{EmptyState,LoadingState,ErrorState}`)
- ❌ Adding a `forceBypassGates=true` send without an activity_log audit row (it's required)
- ❌ Editing `emvy-board/convex/schema.ts` for non-mirror reasons (ADR 0002 in board docs)

## 8. Sender seam (locked invariant)

`convex/hermes/outreach2.ts` is the ONLY file that may:

1. Write to `outreach_queue` or `outreach_followups` tables.
2. Send via Resend on behalf of the blando outreach pipeline (identified by the `X-Outreach-Step` header).

This is enforced by:
- **Static guard** — `tests/lib/sender-seam.test.ts` (pure-Node file scan via `fs.readdirSync` + `fs.readFileSync`; ALLOWLIST empty as of 2026-07-03 Slice 2a).
- **Runtime guard** — `SENDER_NAME === 'convex-v2'` check at the top of `claimAndSendStep` + `operatorSend`.

The 3 transactional-notification Resend callers are explicitly OUT OF SCOPE (different schema surface, never touch outreach_queue):
- `convex/board/webmail.ts` (board's webmail)
- `convex/contact_notify_action.ts` (contact form)
- `convex/audit_chatbot_notify_action.ts` (audit chatbot)

## 9. Cron ownership

All crons are registered in `emvy-website-v2/convex/crons.ts`. The board never registers crons.

Current cron schedule:

| Cron | Cadence | Function | Status |
|---|---|---|---|
| `drain-outreach-queue` | every 5 min | `internal.hermes.outreach2.drainDueOutreach` | DISABLED (manual-only sends, Decision 10) |
| `recover-stuck-sending` | every 5 min | `internal.hermes.outreach2.runRecoverStuckSending` | ACTIVE (Slice 5a-prep) |
| `drain-outreach-queue` (legacy) | — | `internal.hermes.cronEntry.runDailyCron` + `runFollowupsCron` | COMMENTED OUT (Slice 2a) |

To re-enable the auto-drain (requires operator approval):
1. Uncomment the `crons.interval('drain-outreach-queue', ...)` block in `convex/crons.ts`.
2. Verify `SENDER_NAME=convex-v2` is set on glad-camel-940.
3. Trigger a manual sync via `npx convex run hermes/outreach2:drainDueOutreach '{batchSize:1}'` first.
4. Audit-log the re-enable as `activity_log` row tagged `auto_drain_enabled`.

## 10. Incident log pointer

The vault's `Projects/blando/mistakes.md` is the canonical incident ledger. Key entries:

- **2026-06-26** — `decision-blando-double-send-incident` — 61 emails fired in one cron run, no operator override. Drove Slices 1-2.
- **2026-06-26** — `feedback_blando_brevo_retire` — Brevo permanently retired.
- **2026-07-03** — `mistake-blando-slice-2-vacuous-grep` — sender-seam test passed vacuously due to zsh shell-escape bug. Drove the pure-Node rewrite.
- **2026-07-03** — `feedback_resend-quota-tests` — never trigger Resend-sending code paths during verification.

## When this map goes stale

Update it when:
- A new repo joins the workspace (e.g., audit-call, mAIv).
- A new table or function family lands in hermes.
- A new cron is added or an existing one changes cadence.
- An incident reveals a gap in the forbidden-actions list.
