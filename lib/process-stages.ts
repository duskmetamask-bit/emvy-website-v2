// EMVY pipeline registry. Used by /process to render the live Mermaid
// diagram + the per-stage KPI cards.
//
// Source of truth: VPS `~/obsidian-vault/emvy-process/PIPELINE.md`
// (2026-06-22) and `CLIENT-BUILD-PROCESS.md` (2026-06-18).
//
// The pipeline is **layered**, not a linear funnel. Pre-payment pipeline:
//   Intelligence + Happy Harold → Maya → Blando → Engagement →
//   Booking → Sage Audit
// Post-payment client build (vault-tracked by Dusk, not in Convex):
//   Scope → Deposit → Discovery → Build → Review → Final → Handover
//
// Stage IDs map 1:1 to Convex table counts where possible. Stages with no
// data source render with `count: null` + a warning — that's the
// intentional dead-space signal the operator wants.

export type StageGroup =
  | 'intelligence'
  | 'content'
  | 'lead_gen'
  | 'engagement'
  | 'booking'
  | 'audit'
  | 'delivery';

export type StageDef = {
  id: string;
  index: number;
  label: string;
  group: StageGroup;
  groupLabel: string;
  /** Subgroup label for the diagram (e.g. 'AM', 'PM', 'E1', 'E2'). */
  subgroup?: string;
  /** Optional empty-state copy when count is 0 or null. */
  emptyCopy?: string;
  /** Hint shown when count is null (e.g. missing table). */
  warning?: string;
};

export const STAGE_DEFS: StageDef[] = [
  // Intelligence layer
  {
    id: 'intelligence_reports',
    index: 1,
    label: 'Intelligence Reports',
    group: 'intelligence',
    groupLabel: 'Intelligence',
    emptyCopy: 'No intelligence reports in last 7d',
  },
  {
    id: 'happy_harold',
    index: 2,
    label: 'Happy Harold — AI Research',
    group: 'intelligence',
    groupLabel: 'Intelligence',
    emptyCopy: 'No Happy Harold scans in last 7d',
  },

  // Content layer (Maya)
  {
    id: 'maya_blog',
    index: 3,
    label: 'Maya — Blog',
    group: 'content',
    groupLabel: 'Content',
    subgroup: 'Blog',
    emptyCopy: 'No blog drafts',
  },
  {
    id: 'maya_social',
    index: 4,
    label: 'Maya — X + LinkedIn',
    group: 'content',
    groupLabel: 'Content',
    subgroup: 'Social',
    emptyCopy: 'No X / LinkedIn posts',
  },

  // Lead-gen layer (Blando)
  {
    id: 'blando_outbox',
    index: 5,
    label: 'Blando — Discovery (AM/PM)',
    group: 'lead_gen',
    groupLabel: 'Lead Gen',
    subgroup: 'Blando',
    emptyCopy: 'No Blando discovery in last 7d',
  },
  {
    id: 'assessment_submissions',
    index: 6,
    label: 'Mini AI Strategy Assessment',
    group: 'lead_gen',
    groupLabel: 'Lead Gen',
    subgroup: 'Chatbot',
    emptyCopy: 'No Mini AI Strategy Assessment submissions',
  },
  {
    id: 'outreach_sends',
    index: 7,
    label: 'Outreach Sent (E1/E2/E3)',
    group: 'lead_gen',
    groupLabel: 'Lead Gen',
    subgroup: 'Sends',
    emptyCopy: 'No outreach sends in last 7d',
  },

  // Engagement layer (Resend events)
  {
    id: 'engagement_opens',
    index: 8,
    label: 'Email Opened',
    group: 'engagement',
    groupLabel: 'Engagement',
    subgroup: 'Open',
    emptyCopy: 'No opens tracked',
  },
  {
    id: 'engagement_clicks',
    index: 9,
    label: 'Email Clicked',
    group: 'engagement',
    groupLabel: 'Engagement',
    subgroup: 'Click',
    emptyCopy: 'No clicks tracked',
  },
  {
    id: 'engagement_bounces',
    index: 10,
    label: 'Email Bounced',
    group: 'engagement',
    groupLabel: 'Engagement',
    subgroup: 'Bounce',
    emptyCopy: 'No bounces tracked',
  },
  {
    id: 'engagement_replies',
    index: 11,
    label: 'Email Replied',
    group: 'engagement',
    groupLabel: 'Engagement',
    subgroup: 'Reply',
    emptyCopy: 'No replies yet',
  },

  // Booking layer
  {
    id: 'discovery_booked',
    index: 12,
    label: 'Discovery Call Booked',
    group: 'booking',
    groupLabel: 'Booking',
    emptyCopy: 'No discovery bookings',
  },
  {
    id: 'strategy_paid',
    index: 13,
    label: 'AI Strategy — Paid',
    group: 'booking',
    groupLabel: 'Booking',
    emptyCopy: 'No strategy payments yet',
  },

  // Audit layer
  {
    id: 'sage_audit',
    index: 14,
    label: 'Sage Audit',
    group: 'audit',
    groupLabel: 'Audit + Build',
    emptyCopy: 'No completed Sage audits in last 30d',
  },
  {
    id: 'build_register',
    index: 15,
    label: 'Cartz — Build Register',
    group: 'audit',
    groupLabel: 'Audit + Build',
    subgroup: 'Cartz',
    emptyCopy: 'No builds registered',
  },

  // Post-payment client delivery (CLIENT-BUILD-PROCESS.md §2)
  // These are vault-tracked by Dusk, not in Convex.
  {
    id: 'client_scope',
    index: 16,
    label: 'Stage 1 — Scope Definition',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    warning: 'No client_builds table — Dusk tracks in vault.',
    emptyCopy: 'No active client scopes',
  },
  {
    id: 'client_deposit',
    index: 17,
    label: 'Stage 2 — Deposit + Contract',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No deposit payments',
  },
  {
    id: 'client_discovery',
    index: 18,
    label: 'Stage 3 — Technical Discovery',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No discovery in flight',
  },
  {
    id: 'client_build',
    index: 19,
    label: 'Stage 4 — Build',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No active builds',
  },
  {
    id: 'client_review',
    index: 20,
    label: 'Stage 5 — Client Review',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No clients awaiting review',
  },
  {
    id: 'client_final',
    index: 21,
    label: 'Stage 6 — Final Payment',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No final payments',
  },
  {
    id: 'client_handover',
    index: 22,
    label: 'Stage 7 — Delivery + Handover',
    group: 'delivery',
    groupLabel: 'Client Delivery',
    emptyCopy: 'No clients handed over',
  },
];

export type StageCount = {
  id: string;
  count: number | null;
  warning?: string;
};

const GROUP_LABEL_BY_GROUP: Record<StageGroup, string> = STAGE_DEFS.reduce(
  (acc, s) => {
    acc[s.group] = s.groupLabel;
    return acc;
  },
  {} as Record<StageGroup, string>,
);

export function groupOrder(): StageGroup[] {
  return ['intelligence', 'content', 'lead_gen', 'engagement', 'booking', 'audit', 'delivery'];
}

export function stagesByGroup(): Record<StageGroup, StageDef[]> {
  const out: Record<StageGroup, StageDef[]> = {
    intelligence: [],
    content: [],
    lead_gen: [],
    engagement: [],
    booking: [],
    audit: [],
    delivery: [],
  };
  for (const s of STAGE_DEFS) out[s.group].push(s);
  return out;
}

export function buildMermaidSource(stageCounts: StageCount[]): string {
  const lookup = new Map(stageCounts.map((s) => [s.id, s]));
  const lines: string[] = ['flowchart LR'];
  for (const g of groupOrder()) {
    const groupStages = STAGE_DEFS.filter((s) => s.group === g);
    if (groupStages.length === 0) continue;
    lines.push(`  subgraph ${g}["${GROUP_LABEL_BY_GROUP[g]}"]`);
    for (const s of groupStages) {
      const c = lookup.get(s.id);
      const countLabel = c && c.count != null ? ` · ${c.count}` : ' · —';
      const safeLabel = (s.subgroup ? `${s.subgroup}: ` : '') + s.label;
      lines.push(`    ${s.id}["${safeLabel}${countLabel}"]`);
    }
    lines.push('  end');
  }
  const groups = groupOrder();
  for (let i = 0; i < groups.length - 1; i++) {
    lines.push(`  ${groups[i]} --> ${groups[i + 1]}`);
  }
  lines.push('  classDef stage fill:#0d2336,stroke:#56d9ff,color:#e0f2ff,stroke-width:1.2px;');
  return lines.join('\n');
}