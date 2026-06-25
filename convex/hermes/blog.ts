import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

// Publish (or update) a blog post. Called by Maya's daily 10am cron
// `maya-blog-publisher` after the 6am draft bundle has produced
// `~/.hermes/profiles/maya/blog/drafts/YYYY-MM-DD-article-*.md`.
//
// Idempotency: upsert by slug. Re-running with the same slug updates
// the row in place (new body, hero, etc.) rather than duplicating.
//
// Auth: server-side check that the caller's token matches the Convex
// deployment env HERMES_TOKEN_MAYA. The mutation also hardcodes
// `agent: 'maya'` so other agents can't write here even with a leaked
// deploy key.
export const publishPost = mutation({
  args: {
    token: v.string(),
    agent: v.literal('maya'),
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    body: v.optional(v.string()),
    targetKeyword: v.optional(v.string()),
    vertical: v.union(
      v.literal('trades'),
      v.literal('professional-services'),
      v.literal('general')
    ),
    heroImageUrl: v.optional(v.string()),
    sourcePath: v.string(),
    readingTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
    const now = Date.now()

    const existing = await ctx.db
      .query('blog_posts')
      .withIndex('by_slug', (q) => q.eq('slug', data.slug))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...data,
        agentId: 'maya',
        status: 'published',
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
      })
      return { id: existing._id, createdAt: existing.createdAt, updated: true }
    }

    const id = await ctx.db.insert('blog_posts', {
      ...data,
      agentId: 'maya',
      status: 'published',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    return { id, createdAt: now, updated: false }
  },
})

// Lightweight sitemap source — slug + lastmod only. Used by app/sitemap.ts.
export const allSlugsForSitemap = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('blog_posts')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()
    return rows
      .filter((r) => typeof r.slug === 'string' && r.slug.length > 0)
      .map((r) => ({ slug: r.slug, lastmod: r.updatedAt ?? r.publishedAt ?? r.createdAt }))
  },
})