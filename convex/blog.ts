import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// List published blog posts (for the public blog page)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query('blog_posts')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .order('desc')
      .collect()
    return posts.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      vertical: p.vertical,
      publishedAt: p.publishedAt,
    }))
  },
})

// Get a single blog post by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query('blog_posts')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()
    return post ?? null
  },
})

// Publish a blog post (called by Maya's cron)
export const publish = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    body: v.optional(v.string()),
    targetKeyword: v.optional(v.string()),
    vertical: v.union(v.literal('trades'), v.literal('professional-services'), v.literal('general')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert('blog_posts', {
      title: args.title,
      slug: args.slug,
      summary: args.summary,
      body: args.body,
      targetKeyword: args.targetKeyword,
      vertical: args.vertical,
      status: 'published',
      publishedAt: now,
      createdAt: now,
    })
  },
})
