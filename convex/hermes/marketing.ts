// Hermes function surface for the Maya publication log.
//
// Called by the VPS `maya-publication-log` cron after it appends a row
// to ~/obsidian-vault/maya/MAYA-PUBLICATION-LOG.md. The board's /maya
// tab reads this table to surface drafts/posts in the operator CRM.
//
// Auth: requireHermes (single shared HERMES_ACTIONS_TOKEN env var,
// per the Hermes Access Plan v1). actor is set server-side to
// 'maya' (immutable, set on insert) so the source of every row is
// clear at query time.
//
// Per-agent attribution pattern: 'maya' for content drafts/posts,
// 'intelligence' for competitive intel reports. The board's
// /audit-chatbot tab uses 'audit_chatbot' for the same reason.
// activity_log is NOT written here — it requires a leadId, and Maya
// drafts/posts are not lead-scoped. The maya_publication_log row
// (with agentId + createdAt + sourcePath) is the audit trail.

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermes } from '../hermesAuth'

export const appendEntry = mutation({
  args: {
    token: v.string(),
    date: v.string(), // YYYY-MM-DD
    platform: v.union(
      v.literal('X'),
      v.literal('LinkedIn'),
      v.literal('Blog')
    ),
    title: v.string(),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('published'),
        v.literal('revised')
      )
    ),
    link: v.optional(v.string()),
    sourcePath: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, ...data } = args
    const now = Date.now()
    const id = await ctx.db.insert('maya_publication_log', {
      date: data.date,
      platform: data.platform,
      title: data.title,
      status: data.status ?? 'draft',
      link: data.link,
      sourcePath: data.sourcePath,
      agentId: 'maya',
      createdAt: now,
    })
    return { id, createdAt: now }
  },
})

// Upserts one row in `maya_content_topics` per (date). Called by the
// VPS `~/.hermes/profiles/maya/bin/log_topics.py` after parsing the
// 30-DAY-CALENDAR-v2.md vault file. The board's /marketing 7-day grid
// reads this for per-date topic labels ("June 17 — Memory Thread").
// Added 2026-06-15.
export const appendTopic = mutation({
  args: {
    token: v.string(),
    date: v.string(),         // YYYY-MM-DD
    dayName: v.string(),      // Monday, Tuesday, ...
    topic: v.string(),        // "Memory Thread", "Quick Win", ...
    bucket: v.string(),       // "Operator" | "Business Outcome"
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, ...data } = args
    const now = Date.now()
    const existing = await ctx.db
      .query('maya_content_topics')
      .withIndex('by_date', (q) => q.eq('date', data.date))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, {
        dayName: data.dayName,
        topic: data.topic,
        bucket: data.bucket,
        updatedAt: now,
      })
      return { id: existing._id, action: 'updated' as const }
    }
    const id = await ctx.db.insert('maya_content_topics', {
      date: data.date,
      dayName: data.dayName,
      topic: data.topic,
      bucket: data.bucket,
      createdAt: now,
      updatedAt: now,
    })
    return { id, action: 'created' as const }
  },
})
