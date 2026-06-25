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

// Publish a blog post — REMOVED 2026-06-25 (was unauthenticated).
// Use `api.hermes.blog.publishPost` instead (requires HERMES_TOKEN_MAYA).
