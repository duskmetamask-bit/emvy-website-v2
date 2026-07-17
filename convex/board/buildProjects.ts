import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const DEFAULT_PROJECTS = [
  {
    project: 'emvy-board',
    lane: 'management' as const,
    repoPath: '/Users/DuskWunz/Documents/Claude/Projects/emvy-board',
    liveTarget: 'board.emvyai.com',
    liveUrl: 'https://board.emvyai.com',
    owner: 'Cartz',
    status: 'live',
    nextAction: 'Keep the next build slice visible and keep shared surfaces serialized.',
    lastVerified: '2026-07-03',
  },
  {
    project: 'emvy-website-v2',
    lane: 'client' as const,
    repoPath: '/Users/DuskWunz/Documents/Claude/Projects/emvy-website-v2',
    liveTarget: 'emvyai.com',
    liveUrl: 'https://emvyai.com',
    owner: 'Maya',
    status: 'live',
    nextAction: 'Keep the canonical schema and function mirror aligned before board updates.',
    lastVerified: '2026-07-03',
  },
  {
    project: 'audit chat bot',
    lane: 'client' as const,
    repoPath: '/Users/DuskWunz/Documents/audit chat bot',
    liveTarget: 'emvy-audit-chatbot.vercel.app',
    liveUrl: 'https://emvy-audit-chatbot.vercel.app',
    owner: 'Sage',
    status: 'live',
    nextAction: 'Finish the clickable detail row and report drill-in.',
    lastVerified: '2026-07-03',
  },
  {
    project: 'mAIv',
    lane: 'local' as const,
    repoPath: '/Users/DuskWunz/Documents/Claude/Projects/mAIv',
    liveTarget: 'Convex: peaceful-bison-550',
    owner: 'Dusk',
    status: 'active',
    nextAction: 'Pick the first public hosting target once beta is ready.',
    lastVerified: '2026-07-03',
  },
  {
    project: 'lepepai',
    lane: 'local' as const,
    repoPath: '/Users/DuskWunz/Documents/Claude/Projects/lepepai',
    liveTarget: 'lepepai.vercel.app',
    liveUrl: 'https://lepepai.vercel.app',
    owner: 'Client',
    status: 'design shipped',
    nextAction: 'Deploy to Vercel and walk the friend through the first real site visit.',
    lastVerified: '2026-07-03',
  },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('build_projects')
      .withIndex('by_createdAt')
      .order('desc')
      .take(100);
  },
});

export const getByProject = query({
  args: { project: v.string() },
  handler: async (ctx, { project }) => {
    return await ctx.db
      .query('build_projects')
      .withIndex('by_project', (q) => q.eq('project', project))
      .unique();
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('build_projects').collect();
    const byProject = new Map(existing.map((row) => [row.project, row]));
    const now = Date.now();

    for (const project of DEFAULT_PROJECTS) {
      const current = byProject.get(project.project);
      const payload = {
        ...project,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      };

      if (current) {
        await ctx.db.patch(current._id, payload);
      } else {
        await ctx.db.insert('build_projects', payload);
      }
    }

    return { count: DEFAULT_PROJECTS.length };
  },
});
