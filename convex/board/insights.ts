// Board-side unified insight timeline. Aggregates agent output across
// 6 source tables into a single sorted feed for the /insights page.
// Mirrors the role of VPS `~/obsidian-vault/emvy-process/shared-feed.md`
// (locked 2026-06-26 in project_emvy-pipeline-architecture). No new
// tables — we read existing mirror tables only.

import { query } from '../_generated/server';
import { v } from 'convex/values';
import type { InsightRow, InsightTag } from '../../lib/insights';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_LIMIT = 200;

function trim(value: string | undefined | null, max = 220): string {
  if (!value) return '';
  const collapsed = value.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1).trimEnd()}…`;
}

// Cap any single source so one noisy table (cron_run_history) doesn't
// drown the timeline. The aggregator still returns the full set ordered
// by timestamp — the cap just bounds worst-case work.
const PER_SOURCE_LIMIT = 80;

// Private helper — typed loosely so we can share it across the two
// query handlers without dragging in Convex's GenericQueryCtx<DataModel>
// (which is not generated for the mirror schema). The public query
// signatures still infer their return types correctly.
async function gather(ctx: any): Promise<InsightRow[]> {
  const sinceCutoff = Date.now() - SEVEN_DAYS_MS;

  const [intel, brief, maya, audit, build, hhHistory, otherHistory] =
    await Promise.all([
      ctx.db.query('intelligence_reports').collect(),
      ctx.db.query('intelligence_brief').collect(),
      ctx.db.query('maya_publication_log').collect(),
      ctx.db.query('audit_register').collect(),
      ctx.db.query('build_register').collect(),
      (ctx.db
        .query('cron_run_history')
        .withIndex('by_agentId_startedAt', (q: { eq: (f: string, v: string) => unknown }) =>
          q.eq('agentId', 'happy-harold'),
        )
        .order('desc')
        .take(PER_SOURCE_LIMIT) as unknown) as Array<Record<string, unknown>>,
      (ctx.db
        .query('cron_run_history')
        .withIndex('by_startedAt')
        .order('desc')
        .take(PER_SOURCE_LIMIT * 2) as unknown) as Array<Record<string, unknown>>,
    ]);

  const rows: InsightRow[] = [];

  for (const r of intel) {
    rows.push({
      id: `intel:${r._id}`,
      tag: 'INT',
      agentId: r.agentId,
      agentLabel: 'Intelligence',
      title: r.title,
      summary: trim(r.summary),
      timestamp: r.createdAt,
      source: 'intelligence_reports',
      href: '/intelligence',
      body: r.body ?? null,
      meta: r.reportType,
    });
  }

  for (const r of brief) {
    rows.push({
      id: `brief:${r._id}`,
      tag: 'BRIEF',
      agentId: r.agentId,
      agentLabel: 'Intelligence',
      title: r.title,
      summary: trim(r.summary),
      timestamp: r.createdAt,
      source: 'intelligence_brief',
      href: '/intelligence',
      body: r.body,
      meta: `synthesised · ${r.sourceReportIds.length} sources`,
    });
  }

  for (const r of maya) {
    rows.push({
      id: `maya:${r._id}`,
      tag: 'MAYA',
      agentId: r.agentId,
      agentLabel: 'Maya',
      title: r.title,
      summary: trim(typeof r.body === 'string' ? r.body : '', 220),
      timestamp: r.createdAt,
      source: 'maya_publication_log',
      href: '/marketing',
      body: typeof r.body === 'string' ? r.body : null,
      meta: `${r.platform} · ${r.status}`,
    });
  }

  for (const r of audit) {
    rows.push({
      id: `sage:${r._id}`,
      tag: 'SAGE',
      agentId: r.agentId,
      agentLabel: 'Sage',
      title: `${r.businessName} — ${r.auditConducted}`,
      summary: trim(r.findingsRecommendations),
      timestamp: r.createdAt,
      source: 'audit_register',
      href: '/audits',
      body: `${r.auditConducted}\n\nFindings & Recommendations\n${r.findingsRecommendations}\n\nBuild Ideas\n${r.buildIdeas}`,
      meta: r.date,
    });
  }

  for (const r of build) {
    rows.push({
      id: `build:${r._id}`,
      tag: 'BUILD',
      agentId: r.agentId,
      agentLabel: 'Cartz',
      title: r.project,
      summary: `Stage: ${r.stage.replace(/_/g, ' ')}`,
      timestamp: r.createdAt,
      source: 'build_register',
      href: '/builds',
      body: `Project: ${r.project}\nStage: ${r.stage}\nDate: ${r.date}\nSource: ${r.sourcePath}`,
      meta: r.stage,
    });
  }

  // HH-* — happy-harold cron runs (weekly digest signal)
  for (const r of hhHistory as any) {
    if (r.startedAt < sinceCutoff) continue;
    const ok = r.status === 'ok';
    rows.push({
      id: `hh:${r._id}`,
      tag: 'HH',
      agentId: r.agentId,
      agentLabel: 'Happy Harold',
      title: `${r.cronName}${ok ? ' — ok' : r.status === 'fail' ? ' — failed' : ''}`,
      summary: r.error ? trim(r.error, 160) : 'AI capability scan.',
      timestamp: r.startedAt,
      source: 'cron_run_history',
      href: '/intelligence',
      body: r.error ?? null,
      meta: r.durationMs != null ? `${(r.durationMs / 1000).toFixed(1)}s` : null,
    });
  }

  // OPS-* — other cron runs that surfaced (failures or new crons)
  const hhIds = new Set(hhHistory.map((r: any) => r._id));
  for (const r of otherHistory as any) {
    if (hhIds.has(r._id)) continue;
    if (r.startedAt < sinceCutoff) continue;
    if (r.status === 'ok') continue; // only surface failures + running
    rows.push({
      id: `cron:${r._id}`,
      tag: 'OPS',
      agentId: r.agentId,
      agentLabel: r.agentId,
      title: `${r.agentId}/${r.cronName} — ${r.status}`,
      summary: r.error ? trim(r.error, 160) : 'Cron surfaced for review.',
      timestamp: r.startedAt,
      source: 'cron_run_history',
      href: '/cron-health',
      body: r.error ?? null,
      meta: r.durationMs != null ? `${(r.durationMs / 1000).toFixed(1)}s` : null,
    });
  }

  rows.sort((a, b) => b.timestamp - a.timestamp);
  return rows;
}

export const timeline = query({
  args: {
    tag: v.optional(
      v.union(
        v.literal('INT'),
        v.literal('BRIEF'),
        v.literal('MAYA'),
        v.literal('SAGE'),
        v.literal('BUILD'),
        v.literal('HH'),
        v.literal('OPS'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<InsightRow[]> => {
    const all = await gather(ctx);
    const tag = args.tag as InsightTag | undefined;
    const limit = args.limit ?? DEFAULT_LIMIT;
    const filtered = tag ? all.filter((r) => r.tag === tag) : all;
    return filtered.slice(0, limit);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await gather(ctx);
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    const last7d = rows.filter((r) => r.timestamp >= cutoff).length;
    const byTag: Record<string, number> = {};
    for (const r of rows) {
      byTag[r.tag] = (byTag[r.tag] ?? 0) + 1;
    }
    return { total: rows.length, last7d, byTag };
  },
});