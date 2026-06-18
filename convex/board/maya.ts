// Operator-facing Maya publication log review view. Powers /maya.
//
// Reads the website's maya_publication_log table (canonical schema
// lives on the website, board mirrors it). The VPS `maya-publication-log`
// cron writes rows here via convex/hermes/marketing.ts:appendEntry
// after appending to the vault log. The board's /maya tab surfaces
// drafts/posts so the operator can see the content pipeline without
// opening the vault.
//
// SCOPE: read-only. Status flips (draft → published) are done by the
// operator directly on the vault log for now. A board-side mutation
// for status + engagement is a follow-up slice (board will get a
// "publish" + "set engagement" mutation once the analytics cron is
// wired).

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const VALID_PLATFORMS = ['X', 'LinkedIn', 'Blog'] as const;
type MayaPlatform = (typeof VALID_PLATFORMS)[number];

const VALID_STATUSES = ['draft', 'published', 'revised'] as const;
type MayaStatus = (typeof VALID_STATUSES)[number];

export const list = query({
  args: {
    platform: v.optional(
      v.union(v.literal('X'), v.literal('LinkedIn'), v.literal('Blog'))
    ),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('published'),
        v.literal('revised')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    // Filter at the index level when possible; fall back to in-memory
    // filter when both platform AND status are present (no compound
    // index in v1 — the table is small enough that this is fine).
    if (args.platform && args.status) {
      const rows = await ctx.db
        .query('maya_publication_log')
        .withIndex('by_platform', (q) => q.eq('platform', args.platform!))
        .order('desc')
        .take(limit * 2);
      return rows
        .filter((r) => (r.status ?? 'draft') === args.status)
        .slice(0, limit);
    }
    if (args.platform) {
      return await ctx.db
        .query('maya_publication_log')
        .withIndex('by_platform', (q) => q.eq('platform', args.platform!))
        .order('desc')
        .take(limit);
    }
    if (args.status) {
      return await ctx.db
        .query('maya_publication_log')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('maya_publication_log')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('maya_publication_log') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('maya_publication_log').take(1000);
    const total = rows.length;
    const byPlatform: Record<MayaPlatform, number> = { X: 0, LinkedIn: 0, Blog: 0 };
    const byStatus: Record<MayaStatus, number> = { draft: 0, published: 0, revised: 0 };
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    let thisWeek = 0;
    for (const r of rows) {
      const p = r.platform as MayaPlatform;
      if (p in byPlatform) byPlatform[p] += 1;
      const s = (r.status ?? 'draft') as MayaStatus;
      if (s in byStatus) byStatus[s] += 1;
      if (r.createdAt >= sevenDaysAgo) thisWeek += 1;
    }
    return { total, byPlatform, byStatus, thisWeek };
  },
});

// Operator action: flip a row to 'published' and (optionally) record
// the live link. Idempotent — calling twice with the same data is a
// noop. Only used for status; engagement is filled by a future
// analytics cron.
export const publish = mutation({
  args: {
    id: v.id('maya_publication_log'),
    link: v.optional(v.string()),
  },
  handler: async (ctx, { id, link }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Maya entry not found');
    await ctx.db.patch(id, {
      status: 'published',
      link: link ?? existing.link,
    });
    return { ok: true, id };
  },
});
