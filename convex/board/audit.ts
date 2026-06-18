// Board-side read surface for the `audit_register` table.
// Mirrors convex/board/maya.ts (list/get/stats).
// The /audits page in app/(board)/audits calls these.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    businessName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.businessName) {
      return await ctx.db
        .query('audit_register')
        .withIndex('by_businessName', (q) =>
          q.eq('businessName', args.businessName as string)
        )
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('audit_register')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('audit_register') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('audit_register').take(1000);
    const total = rows.length;
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    let thisWeek = 0;
    for (const r of rows) {
      if (r.createdAt >= sevenDaysAgo) thisWeek += 1;
    }
    return { total, thisWeek };
  },
});

// One-off: deletes audit_register rows whose sourcePath starts with `smoke/`.
// Created 2026-06-15 to clean up two rows the operator's `npx convex run`
// validation left behind. Hard-gated: requires `confirm: true` AND only
// matches the smoke/* path pattern. Will not touch any real audit row.
export const removeSmokeTest = mutation({
  args: { confirm: v.boolean() },
  handler: async (ctx, args) => {
    if (args.confirm !== true) {
      throw new Error('removeSmokeTest requires confirm: true');
    }
    const all = await ctx.db.query('audit_register').collect();
    const targets = all.filter((r) => r.sourcePath.startsWith('smoke/'));
    for (const row of targets) {
      await ctx.db.delete(row._id);
    }
    return { deleted: targets.length, ids: targets.map((r) => r._id) };
  },
});
