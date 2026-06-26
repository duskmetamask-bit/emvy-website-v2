// Unified insight timeline types + tag registry. Used by /insights page
// and the ProcessKpiStrip Insights (7d) KPI counter.
//
// Source of truth = VPS `~/obsidian-vault/emvy-process/shared-feed.md`
// (locked 2026-06-26 in project_emvy-pipeline-architecture memory).
// Board-side aggregator lives in `convex/board/insights.ts`.

export const INSIGHT_TAGS = [
  'INT',
  'BRIEF',
  'HH',
  'MAYA',
  'SAGE',
  'BUILD',
  'OPS',
] as const;

export type InsightTag = (typeof INSIGHT_TAGS)[number];

export type InsightRow = {
  id: string;
  tag: InsightTag;
  agentId: string;
  agentLabel: string;
  title: string;
  summary: string;
  timestamp: number;
  source: string;
  href: string;
  body: string | null;
  meta: string | null;
};

export const INSIGHT_TAG_LABELS: Record<InsightTag, string> = {
  INT: 'Intelligence',
  BRIEF: 'Daily brief',
  HH: 'Happy Harold',
  MAYA: 'Maya',
  SAGE: 'Sage',
  BUILD: 'Cartz',
  OPS: 'Ops',
};

export const INSIGHT_TAG_COLORS: Record<InsightTag, string> = {
  INT: '#56d9ff',
  BRIEF: '#7dd3fc',
  HH: '#fbbf24',
  MAYA: '#a78bfa',
  SAGE: '#fb7185',
  BUILD: '#f2c94c',
  OPS: '#94a3b8',
};