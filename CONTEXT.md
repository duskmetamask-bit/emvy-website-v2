# EMVY AI — Glossary

> Canonical language for the lead pipeline, engagement process, and product domain. No implementation details — terms and their meanings only.

---

## Lead Pipeline Model

The pipeline is **one entity** (`leads` table) that progresses through **stages**. The four sales-language labels — Lead, Prospect, Opportunity, Client — are human-language ranges that group stage values, not separate tables.

### Stage taxonomy

| Stage value | Label | Meaning |
|---|---|---|
| `discover` | Lead | Researched, scored, attributes populated. Not yet contacted. |
| `contacted` | Lead | Cold outreach email sent **and** delivered via Resend. |
| `engaged` | Prospect | Light signal — opened, clicked, replied, partial activity. |
| `assessed` | Prospect | Completed the mini ops assessment. PDF + score + discovery call CTA sent. |
| `qualified` | Opportunity | Discovery call booked. Active sales conversation. |
| `audited` | Opportunity | Audit call complete, report delivered, awaiting debrief. |
| `proposal_sent` | Opportunity | Stripe link sent (audit or implementation), awaiting payment. |
| `implementing` | Client | Paid. Build in flight. |
| `active` | Client | Delivered. On maintenance retainer. |
| `lost` | — | Did not convert. Reason captured in `outcome`. |

### Stage transitions

- `discover` → `contacted` — fires on Resend `email.delivered` webhook. Bounces / undelivered stays at `discover` with an `email_bounced` activity log entry.
- `contacted` → `engaged` — fires on first engagement signal (open, click, reply).
- `contacted` / `engaged` → `assessed` — fires on assessment form submission.
- `assessed` → `qualified` — fires on Cal.com booking confirmation.
- `qualified` → `audited` — fires when audit report is delivered.
- `audited` → `proposal_sent` — fires when Stripe payment link is sent.
- `proposal_sent` → `implementing` — fires on `payment_intent.succeeded`.
- `implementing` → `active` — fires on build delivery.
- `*` → `lost` — fires manually, with `outcome` capturing reason.

### Lead research

Lead research is captured as **attributes** on the lead, not as a stage:

- `score` — Blando ICP score (0–10)
- `painSignals` — list of triggering signals
- `icpMatch` — boolean: scored above threshold
- `sector` — industry vertical
- `source` — research channel (e.g., `hipages`, `x-twitter`, `aussieweb`, `google`)

A lead only enters Convex once research is complete (scoring populated). The `discover` stage means "researched, in our system, awaiting outreach" — not "Hermes is currently scanning." Research is not a stage; it is a precondition for entering the pipeline.

Draft rejection (the user declining a Hermes-generated email) happens privately between the user and the Hermes agent. It is **not** reflected on the board and produces no lead state change.

### Attribution

Two fields plus the activity log:

- **Source** — high-level origin of the lead. Set at creation, never changes. Values: `cold-outreach`, `direct-website`, `contact-form`, `pdf`, `referral`.
- **Last Touchpoint** — rolling update on each interaction. Values: `email_sent`, `email_delivered`, `email_opened`, `email_clicked`, `assessment_started`, `assessment_completed`, `pdf_sent`, `pdf_clicked`, `cal_booked`, `payment_succeeded`.
- **Activity Log** — source of truth for the full touchpoint trail, per lead.

Links in emails and PDFs carry UTM params + a `leadId` so the source is captured at form submission.

---

## Discovery Call

The 15-minute discovery call follows a strict format: **help first, pitch second**.

| Time | Section | What happens |
|---|---|---|
| 0–2 min | Introduction | Names, context, agenda set. |
| 2–5 min | Their business | Listen. Understand what they do, who they serve, where they are. |
| 5–7 min | Issues identification | Surface the main pain point(s). |
| 7–13 min | **Help with ONE pain point** | Diagnose → recommend → reference past work. (See below.) |
| 13–15 min | **Pitch the full audit** | "The audit is the formal version of what we just did together." |

### The 6-minute "help" structure (7–13 min)

The 6-minute "help" window is the audit preview and the trust-building moment. It has three sub-moves:

1. **Diagnose** — ask clarifying questions to pin down the actual pain.
2. **Recommend** — give specific, actionable advice. Not vague, not hedged. Name the tool, the workflow, the change.
3. **Reference** — cite 1–2 past audits or builds in the same area. The point is credibility through proof: "we've done this before, here's what we found, here's what we built." This is what turns free advice into a sales moment — it shows the value of the *deliverable*, not just the *diagnosis*.

The 8-minute call is not a working session. The lead does not get an implementation. They get a diagnosis, a recommendation, and proof that the audit is worth paying for.

### Why this format works

If a lead won't commit to the audit after free, high-quality advice + proof of past work, they were not qualified. The call's job is to qualify, not to deliver.

---

## Audit

The audit is a **fixed-template written report** built around seven canonical sections. Every audit — Lite or Full — uses the same structure; the difference is depth of research into the client's business, not deliverable shape.

| # | Section | Purpose |
|---|---|---|
| 1 | **Executive summary** | 1-page TL;DR for the CEO. Problem → recommendation → cost. |
| 2 | **Current state map** | What they have today — tools, workflows, pain points. |
| 3 | **Pain point analysis** | Each pain ranked by frequency × severity × cost. |
| 4 | **Recommendations** | Concrete tools/workflows/processes. Numbered, prioritized, with effort per item. |
| 5 | **Cost analysis** | Itemized hours saved, $ saved, payback period. |
| 6 | **Implementation roadmap** | Phased plan: week 1, month 1, month 2+. |
| 7 | **Next steps** | Single CTA: book the debrief, or a go/no-go decision. |

### Lite vs Full

Both tiers use the same 7-section template. The difference is **research depth into the client's business**, not the structure.

| Dimension | Lite | Full |
|---|---|---|
| Discovery call duration | 30 min | 60 min |
| Pain points analyzed | 1 main, light context on others | 3–5, ranked by frequency × severity × cost |
| Recommendations | 3–5 tactical, directional | 8–12 implementation-ready, prioritized with effort per item |
| Research hours | 2–3 hrs | 6–8 hrs |
| Cost analysis | Rough ballpark | Itemized: hours × rate + tool cost line items |
| Roadmap | "Start here" + 1 follow-up | Phased: week 1, month 1, month 2+ |
| Report length | ~5 pages | ~15 pages |

The upsell is intuitive: same shape, more depth. Production process is identical; the difference is hours of operator work. Pricing for the two tiers is still TBD pending market research.

---

## Business Context

EMVY is a **solo-operator consultancy** with a clear scaling path. The product and pricing model must support all phases, even though current delivery is solo.

### Scaling phases

| Phase | Capacity | Tier ceiling | Pricing posture |
|---|---|---|---|
| **1 — Solo (now)** | One person, no team | Small + Medium. No Enterprise. | Premium per unit (no team discount). |
| **2 — Solo + automation** | One person, automation handles growing share of delivery | Medium+ (light Enterprise). Some sub-contracting. | Premium per unit + retainer-funded automation. |
| **3 — Hired team** | Small team | Full Enterprise. Multiple concurrent builds. | Tier-based with team leverage. |

The transition between phases is funded by **active maintenance retainers** — recurring revenue buys automation, automation buys capacity, capacity unlocks bigger engagements, bigger engagements feed the retainer pool. The flywheel.

### Current phase: Solo

- Tier scope must be honest about what one person can deliver at high quality.
- Pricing per unit of work is higher than agency pricing.
- The number of concurrent active retainers is a real capacity ceiling (TBD).
- Enterprise work is referred out until Phase 2/3.

---

## Maintenance Retainer

The retainer is the engine of the flywheel — recurring revenue funds automation investment, automation buys capacity, capacity unlocks bigger engagements.

### Capacity

- **Phase 1 ceiling: 3 concurrent active retainers.** This is the throttle. Above 3, quality drops and Phase 2 never gets funded.
- Each retainer client gets the user's full attention (solo execution), priced accordingly.

### Pricing shape

**Tiered by client size**, mirroring the implementation tier. Each implementation size maps to a retainer tier:

- **Small retainer** — for clients on a Small implementation
- **Medium retainer** — for clients on a Medium implementation
- **Enterprise retainer** — Phase 2/3 only

Tiered (not flat) because the support load is genuinely different: a Medium client with 10 automations has more failure modes than a Small client with 3. The tier acknowledges that.

### Economics (placeholder structure, numbers TBD)

The dial-in equation: *(retention price per tier) × (capacity ceiling) ≥ (personal income floor) + (monthly automation investment)*

This is the minimum for the flywheel to spin. Below this, the user stays in Phase 1 forever; above it, Phase 2 is achievable.

---

## Engagement Process (high-level)

`Lead Gen → Outreach → Assessment → Discovery Call → Audit → Debrief → Implementation → Maintenance → Referrals (future)`

This is the canonical sequence. A lead moves through pipeline stages in step with the engagement process.

---

## System Topology

The system is two independently deployed apps sharing one backend. Each app has its own repo, its own auth boundary, and its own deploy pipeline. They communicate only through Convex.

| App | Purpose | Domain | Codebase | Direction vs Convex |
|---|---|---|---|---|
| **emvy-website-v2** | Public site — marketing, assessment, lead capture, payment | `emvyai.com` | `emvy-website-v2` (this repo) | Writes events, reads its own writes |
| **emvy-board** | Internal operating board — pipeline view, lead timeline, manual actions | `board.emvyai.com` | `emvy-board` (separate repo) | Reads everything; writes the exceptions webhooks don't cover (manual stage moves, internal notes) |
| **Convex (`glad-camel-940`)** | Shared source of truth | n/a | n/a | Owns the data; both apps consume the schema |

### Why two apps, not one

The public site and the board are different products. The public site is marketing + lead capture. The board is dense internal data + deliberate manual actions. Sharing a repo, a deploy, or an auth boundary couples their lifecycles (version upgrades, deploy freezes, contractor access). The Convex schema is the only contract between them — change the schema, both apps update; change the UI, neither knows.

### Auth boundaries

- **Public site** — visitor-facing. No auth on the assessment or contact forms. Auth only on Stripe checkout success / webhook verification.
- **Board** — solo-operator in Phase 1, locked behind Vercel Password Protection (env-var-gated, no code). Phase 2+ swaps to SSO (Clerk / WorkOS / NextAuth) when access expands to a VA or co-operator. The board's auth is **independent** of the public site's — a public-site session never grants board access.

### Customisation rule

Either app can change framework, UI library, or Next.js version without coordinating with the other. The only shared artifact is the Convex schema, which is documented in this glossary and treated as the canonical contract.

---

## Build Principles

These are day-one habits, not big refactors. Following them costs nothing during the build and unlocks the open-source path for free when the time comes.

### Config-over-hardcode

Anything that is **EMVY-the-agency specific** lives in a `config/` folder, not in the code. The infrastructure is the framework; the config is the brand.

| What | Lives in | Why it's config, not code |
|---|---|---|
| Brand strings (name, domain, tagline, copy) | `config/brand.ts` | Swap for "Acme AI" without touching logic |
| ICP scoring weights + signals | `config/icp.ts` | The structure is reusable; the weights are opinionated |
| Assessment questions + scoring | `config/assessment.ts` | Same flow, different quiz per deployment |
| Email templates + tone guide | `config/email.ts` | "Mate-style Australian" is a config value, not a code path |
| Audit report template | `config/audit-template.ts` | 7-section structure is reusable; the words per section are yours |
| Stage taxonomy constants | `config/stages.ts` | Mirrors the locked stages in this glossary; single source for both apps |

The discipline: when writing new code, if a string or value is "EMVY the agency" rather than "lead pipeline infrastructure," it goes in `config/`. You won't notice the cost during the build. When the time comes to open-source, the heavy lifting is already done — rename the placeholder, write a README, push to GitHub.

### Schema is the contract, code is the consumer

The Convex schema is the canonical contract between `emvy-website-v2` and `emvy-board`. When the schema changes, both apps update. When an app's UI changes, neither knows. This is the only coupling between the two codebases.

---

## CRM Strategy

The lead pipeline is owned by **Convex** in Phase 1 and Phase 2 — Convex plays the role of CRM, app storage, and event sink. This is the standard "BaaS-as-CRM" pattern for solo operators and indie agencies at low-to-moderate volume. The system is not coupled to a third-party CRM tool (HubSpot, Attio, Pipedrive, etc.).

### Why this is the right call for Phase 1 + 2

- The schema, webhooks, and tables are already wired and in use
- Convex subscriptions give the board real-time updates with no extra plumbing
- Solo-operator economics: zero per-seat CRM fees, zero integration maintenance
- Full schema control — no fighting a tool's data model

### Phase 3 upgrade signal — migrate to a dedicated CRM

Migrate to a dedicated CRM (HubSpot, Attio, Pipedrive, Folk, etc.) when **any** of these trip first:

1. **Volume** — leads cross ~100/week and outreach is hand-managed
2. **Headcount** — a non-technical VA or co-operator needs a UI the CRM provides for free
3. **Automation** — drip campaigns, lead scoring, or deliverability tooling the CRM does natively
4. **Time cost** — Convex schema work exceeds ~1 hr/week that a CRM eliminates

Migration path is documented because the schema and the System Map make it possible: Convex → CSV export or CRM API sync → import. The board's reads migrate to the CRM's API; the public site's writes can either continue to Convex (with a sync to the CRM) or move directly to the CRM's API.

### What this means for the build

- The Convex schema is the system of record, not a "shadow" of an external CRM
- The board reads from Convex, not from a CRM API
- Webhooks (Cal, Resend, Stripe) write to Convex directly
- No CRM SDK in the dependency tree (Stripe and Resend are not CRM SDKs; they're payment and email providers)

### E-sign decision — deferred

No e-sign integration in Phase 1. The standard solo-operator pattern is "PDF proposal + Stripe Payment Link = acceptance." Stripe records the timestamp, amount, `description` (the scope they paid for), and email. Combined with the proposal they received and the email chain, this is a defensible agreement record for B2B services in AU/US/UK.

E-sign is added when a Phase 2/3 trigger trips:
1. Retainer clients start (recurring, formal MSA is conventional)
2. Implementation tickets consistently cross ~$5K
3. A client asks for a formal signed agreement
4. You want to delegate contract reviews to a VA / co-operator

When added, the standard pick is **Dropbox Sign** (cheap, simple API, no enterprise bloat). DocuSign is overkill for solo. PandaDoc is more sales-proposal focused. The integration lands in `config/esign.ts` per the Build Principles. Stripe's payment-as-acceptance pattern remains for low-stakes one-offs.

---

## Open Questions

These are still unresolved and need decisions before they're locked into the glossary:

- [x] Keep `discover` as the stage value (no migration) or rename to `lead-new`? — *default: keep, no migration* (resolved by omission, glossary uses `discover`)
- [ ] Lite vs Full audit pricing (numbers TBD pending market research).
- [ ] Small/Medium implementation pricing (numbers TBD pending market research).
- [ ] Retainer pricing per tier (numbers TBD).
- [ ] Personal income floor and monthly automation budget (the dial-in inputs for retainer pricing).
- [ ] Audit price for new leads vs already-quoted leads — operational rule: don't change quoted numbers for leads in `audited` or later.

## Decisions Log

**2026-06-02 — Grill session (round 2):**

- **Attribution storage shape:** flat strings on the lead row (`source`, `lastTouchpoint`); detail lives in `activity_log`. Schema update needed: add `lastTouchpoint` to `leads`.
- **PDF CTA destination:** direct to Cal.com with `leadId` + UTM params. No intermediate `/process` page in the path.
- **Referrer tracking for direct visits:** deferred. Phase 1 ships with `source: "direct-website"` as a single bucket. If the data later demands it, add a one-row activity-log entry on form submit that captures `Referer` header + any UTM params in the URL.
- **Portfolio storage for past audits/builds:** Convex `case_studies` table, fronted by a `/admin/portfolio` view with a sector filter. Schema fields: `title, client, sector, problem, solution, outcome, tags[], createdAt`.
