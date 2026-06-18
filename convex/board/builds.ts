// Board-side read surface for the `build_register` table.
// Mirrors convex/board/maya.ts (list/get/stats) and adds a stage
// breakdown to stats() since the build pipeline is the point of this view.
// The /builds page in app/(board)/builds calls these.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export type BuildStage =
  | 'build_idea'
  | 'design_visuals'
  | 'planning'
  | 'reviewed'
  | 'awaiting_dusk_approval'
  | 'product_ready_to_sell';

const STAGES: BuildStage[] = [
  'build_idea',
  'design_visuals',
  'planning',
  'reviewed',
  'awaiting_dusk_approval',
  'product_ready_to_sell',
];

export const list = query({
  args: {
    stage: v.optional(
      v.union(
        v.literal('build_idea'),
        v.literal('design_visuals'),
        v.literal('planning'),
        v.literal('reviewed'),
        v.literal('awaiting_dusk_approval'),
        v.literal('product_ready_to_sell'),
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.stage) {
      return await ctx.db
        .query('build_register')
        .withIndex('by_stage', (q) => q.eq('stage', args.stage as BuildStage))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('build_register')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('build_register') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('build_register').take(1000);
    const total = rows.length;
    const byStage: Record<BuildStage, number> = {
      build_idea: 0,
      design_visuals: 0,
      planning: 0,
      reviewed: 0,
      awaiting_dusk_approval: 0,
      product_ready_to_sell: 0,
    };
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    let thisWeek = 0;
    for (const r of rows) {
      if (STAGES.includes(r.stage as BuildStage)) {
        byStage[r.stage as BuildStage] += 1;
      }
      if (r.createdAt >= sevenDaysAgo) thisWeek += 1;
    }
    return { total, byStage, thisWeek };
  },
});
