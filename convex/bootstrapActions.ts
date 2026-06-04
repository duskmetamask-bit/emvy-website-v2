// One-time seed from Master Actions 2026-06-04.md.
// Idempotent on (title, track) — re-running is a no-op.
//
// Run from the Convex dashboard or via:
//   npx convex run bootstrapActions:run
//
// Returns: { inserted: number, skipped: number, total: number }

import { mutation } from './_generated/server'
import { v } from 'convex/values'

type Seed = {
  title: string
  description: string
  track: 'workspace' | 'growth' | 'clients' | 'harden' | 'polish'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'open' | 'in_progress' | 'done' | 'blocked' | 'dropped'
}

// Source: Master Actions 2026-06-04.md (snapshot 2026-06-04).
// 58 rows across 5 tracks. Edit here when the MD file changes —
// or rewrite this to parse the MD at action-runtime if a fresh
// read is ever needed.
const SEEDS: Seed[] = [
  // Workspace (W-1..W-9)
  { track: 'workspace', priority: 'P0', status: 'open', title: 'Inbox feature deploy', description: 'Cloudflare + Vercel env (7 steps in Actions.md). Code done (commit 5e5ea72). User action.' },
  { track: 'workspace', priority: 'P0', status: 'open', title: 'Hermes Q1–Q6 decisions', description: 'Q1 proxy, Q2 skip drafts.publish, Q3 eager backfill, Q5 yes-with-outcome. Q4/Q6 defer.' },
  { track: 'workspace', priority: 'P0', status: 'open', title: 'Hermes Access Plan steps 1–10', description: 'Schema additive (activity_log.actor); mint Hermes token; rotate README dev key; board timeline pill.' },
  { track: 'workspace', priority: 'P0', status: 'open', title: 'Obsidian LiveSync verify', description: 'Open Obsidian locally; install plugin on VPS; test sync.' },
  { track: 'workspace', priority: 'P1', status: 'open', title: 'actions Convex table + board /actions view + Hermes function surface', description: 'New feature. See architecture in master actions.' },
  { track: 'workspace', priority: 'P1', status: 'open', title: 'Q4 schema gaps', description: 'lastTouchpoint, internalNotes, drop pdf_lead_magnets, tighten required fields, add missing indexes.' },
  { track: 'workspace', priority: 'P1', status: 'open', title: 'RESEND_WEBHOOK_SECRET to Vercel production env', description: 'Per Session 2026-06-02 webhook tests closeout.' },
  { track: 'workspace', priority: 'P2', status: 'open', title: 'Secrets rotation cadence', description: 'Quarterly, scripted, in api-keys/emvy-website.md.' },
  { track: 'workspace', priority: 'P2', status: 'open', title: 'Cron for Hermes token rotation', description: 'Q4 follow-up.' },

  // Growth (G-1..G-16)
  { track: 'growth', priority: 'P0', status: 'open', title: 'P1 PR 1 — Schema Foundation', description: 'Typed JSON-LD builders + reusable component + CI lint + tests. Spec at Projects/EMVY AI Website/P1 Schema Foundation 2026-06-04.md.' },
  { track: 'growth', priority: 'P0', status: 'open', title: 'P1 PR 2 — Service + FAQPage + BreadcrumbList JSON-LD', description: 'Same pattern, copy-paste + tests.' },
  { track: 'growth', priority: 'P0', status: 'open', title: 'P1 PR 3 — Sitemap expansion + OG image generation', description: 'One per route, brand-consistent fallback.' },
  { track: 'growth', priority: 'P0', status: 'open', title: 'P1 PR 4 — Internal linking + redirects + Lighthouse CI', description: 'Lighthouse CI gates deploys on perf regression.' },
  { track: 'growth', priority: 'P1', status: 'open', title: 'P2 — Content production (human + Surfer)', description: 'Gated on P1 success.' },
  { track: 'growth', priority: 'P1', status: 'open', title: 'AI Readiness Scorecard lead magnet', description: '8–12 questions, score→outcome. Topic locked 2026-06-04.' },
  { track: 'growth', priority: 'P1', status: 'open', title: 'Drip platform decision', description: 'Resend-only / Loops / ConvertKit. Decide at P2 kickoff.' },
  { track: 'growth', priority: 'P1', status: 'open', title: '/lp/scorecard landing page', description: 'Gated form → PDF + Convex leads + Resend welcome. P2 deliverable.' },
  { track: 'growth', priority: 'P1', status: 'open', title: 'UTM + leadId capture on all /lp/* forms', description: 'P2; extends attribution.' },
  { track: 'growth', priority: 'P1', status: 'open', title: 'GDPR/Privacy consent + cookie banner', description: 'Check app/privacy first.' },
  { track: 'growth', priority: 'P2', status: 'open', title: 'P3 — Distribution (1 channel pilot, LinkedIn via Buffer)', description: 'Validates ROI before scaling.' },
  { track: 'growth', priority: 'P2', status: 'open', title: 'Vercel Analytics on public site', description: '5-min setup. Per System Map locked.' },
  { track: 'growth', priority: 'P2', status: 'open', title: 'Convex queries for conversion', description: 'Assessment/contact/cal counts per day. Per System Map locked.' },
  { track: 'growth', priority: 'P3', status: 'open', title: 'P4 — AI content pipeline', description: 'After human+Surfer proves ROI. Gated.' },
  { track: 'growth', priority: 'P3', status: 'open', title: 'SERP tracking decision', description: "Ahrefs/Semrush export or manual cadence. Don't build a crawler." },
  { track: 'growth', priority: 'P3', status: 'open', title: 'Gmail API vs manual reply detection', description: 'Punted from glossary.' },

  // Clients (C-1..C-5)
  { track: 'clients', priority: 'P1', status: 'open', title: 'Retainers tab v2', description: 'MRR per tier, last-touchpoint, health signals (Phase 3). Spec in Visual Requirements.md; page exists, no analytics yet.' },
  { track: 'clients', priority: 'P1', status: 'open', title: 'Pricing decisions', description: 'Lite/Full audit, Small/Medium implementation, retainer per tier, personal income floor, monthly automation budget. Per Glossary 2026-06-01.md open decisions.' },
  { track: 'clients', priority: 'P2', status: 'open', title: 'Dropbox Sign / PandaDoc e-sign', description: 'Trigger when Phase 2/3 needs it. Defer until retainer clients or implementation >$5K.' },
  { track: 'clients', priority: 'P2', status: 'open', title: 'E-sign integration lands in config/esign.ts', description: 'Per System Map locked.' },
  { track: 'clients', priority: 'P3', status: 'open', title: 'Phase 2 readiness', description: 'Capacity math, automation budget, hire triggers. Per Glossary 2026-06-01.md scaling.' },

  // Harden (H-1..H-11)
  { track: 'harden', priority: 'P0', status: 'open', title: 'Verify Sentry DSNs on both apps', description: 'DSN set in Vercel Production + api-keys/emvy-board.md. Per Actions.md #1 marked DONE; needs prod-URL smoke.' },
  { track: 'harden', priority: 'P0', status: 'open', title: 'Schema mirror CI check', description: 'Green on both repos. Per c1ff278 + 7c5810c.' },
  { track: 'harden', priority: 'P0', status: 'open', title: 'Real-browser CSP smoke test', description: 'scripts/verify-drive.js Playwright drive. Per Actions.md #4 DONE 2026-06-03; rerun post-P1 PRs.' },
  { track: 'harden', priority: 'P0', status: 'open', title: 'Webhook signature verification tests', description: '15/15 green on website. Per Actions.md #6 DONE 2026-06-02.' },
  { track: 'harden', priority: 'P0', status: 'open', title: 'Vitest HMAC verify path (board)', description: '45/45 green. Per Actions.md #5 DONE 2026-06-02.' },
  { track: 'harden', priority: 'P1', status: 'open', title: 'Brute-force rate limit on /api/auth/login', description: '5/5min/IP, verified under load. Per 259ba9f.' },
  { track: 'harden', priority: 'P1', status: 'open', title: 'Backups', description: 'Convex auto (verify retention), vault auto-sync via Stop hook, env file copies in api-keys/. sync-vault.sh runs on Stop hook.' },
  { track: 'harden', priority: 'P1', status: 'open', title: 'A11y audit on both apps', description: 'Keyboard nav, focus rings, ARIA, color contrast. New.' },
  { track: 'harden', priority: 'P2', status: 'open', title: 'Third-party security audit', description: 'When team grows or revenue justifies.' },
  { track: 'harden', priority: 'P2', status: 'open', title: 'Hermes canary', description: 'First real outreach run with new function surface. Hermes Access Plan step 7.' },
  { track: 'harden', priority: 'P2', status: 'open', title: 'README dev key rotation', description: 'npx convex deploykey rotate; remove key from emvy-website-v2/README.md + CLAUDE.md. Hermes Access Plan step 8.' },

  // Polish (P-1..P-17)
  { track: 'polish', priority: 'P0', status: 'done', title: 'Design tokens', description: 'lib/design-tokens.ts + shadcn CSS variables in app/globals.css :root + .dark (dark palette, matching existing visual port). docs/design-system.md written. Build verified. Foundation. P-2 and P-3 consume this.' },
  { track: 'polish', priority: 'P0', status: 'open', title: 'Component consistency pass', description: 'Every shadcn primitive (Card, Button, Badge, Dialog, Input, Label, Table, Tabs, Sheet, Tooltip, DropdownMenu) refactored to the tokens. Drives the "designed, not assembled" feel.' },
  { track: 'polish', priority: 'P0', status: 'open', title: 'State coverage pass', description: 'Empty / error / loading on every page. Locked patterns: empty = icon + headline + body + CTA, error = headline + body + retry, loading = skeleton. The surfaces that fail first.' },
  { track: 'polish', priority: 'P0', status: 'open', title: 'Copy review pass — board', description: 'Empty / error / dialog / action / tab copy. Conversational + direct, second-person. Locked glossary.' },
  { track: 'polish', priority: 'P0', status: 'open', title: 'Copy review pass — website', description: 'Every route (/, /services/*, /assessment, /contact, /pricing, /industries, /case-studies, /why-ai, /process, /guide, /resources, /lp/*, /about, /privacy, /terms, /success, /not-found). Mate-style Australian, no jargon.' },
  { track: 'polish', priority: 'P0', status: 'open', title: 'Error boundaries on both apps', description: 'Per-route error.tsx, not-found.tsx, loading.tsx.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Brand voice guide', description: 'Locked terminology + locked microcopy patterns. Applied across all pages. One doc. Authoritative reference.' },
  { track: 'polish', priority: 'P1', status: 'open', title: '"Needs attention" widget', description: 'Stale leads > 7 days in stage. Deferred from BOARD-12.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Bulk select + multi-stage move', description: 'Deferred from BOARD-12.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Keyboard shortcuts', description: 'N, M, /, etc. Deferred from BOARD-12.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Mobile-optimized layout — board', description: "Currently 'works but not designed-for-mobile.'" },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Mobile QA + responsive pass — website', description: 'Hero, forms, tables, modals on viewports 360–414.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Email engagement analytics', description: 'Open/click rates per stage. Deferred from BOARD-8.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Payment aggregates chart', description: 'Total revenue, by tier, by type. Deferred from BOARD-8.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Thread view in Inbox', description: 'Currently list + detail. Add compose/reply.' },
  { track: 'polish', priority: 'P1', status: 'open', title: 'Audit intake page polish', description: '/services/audit-questionnaire route exists; review copy + flow.' },
  { track: 'polish', priority: 'P2', status: 'open', title: 'Case studies content refresh', description: 'Outcomes, sectors, tags. Pull from existing Convex case_studies table; ensure copy aligns with brand voice.' },
]

export const run = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false
    let inserted = 0
    let skipped = 0
    const now = Date.now()

    for (const seed of SEEDS) {
      // Idempotency: check (title, track) before insert
      const existing = await ctx.db
        .query('actions')
        .withIndex('by_track', (q) => q.eq('track', seed.track))
        .filter((q) => q.eq(q.field('title'), seed.title))
        .first()
      if (existing) {
        skipped++
        continue
      }
      if (dryRun) {
        inserted++
        continue
      }
      await ctx.db.insert('actions', {
        title: seed.title,
        description: seed.description,
        track: seed.track,
        priority: seed.priority,
        status: seed.status,
        assignee: 'operator',
        actor: 'operator',
        source: 'import',
        createdAt: now,
        updatedAt: now,
      })
      inserted++
    }

    return { inserted, skipped, total: SEEDS.length }
  },
})
