// Hermes function surface for the Maya publication log.
//
// Called by the VPS `maya-publication-log` cron after it appends a row
// to ~/obsidian-vault/maya/MAYA-PUBLICATION-LOG.md. The board's /maya
// tab reads this table to surface drafts/posts in the operator CRM.
//
// Auth: requireHermesAgent(token, agent) where agent MUST be 'maya'.
// Cross-agent calls (any other agent) throw. agentId is also set
// server-side to 'maya' (immutable, set on insert) so the source of
// every row is clear at query time.
//
// Per-agent attribution pattern: 'maya' for content drafts/posts,
// 'intelligence' for competitive intel reports. The board's
// /audit-chatbot tab uses 'audit_chatbot' for the same reason.
// activity_log is NOT written here — it requires a leadId, and Maya
// drafts/posts are not lead-scoped. The maya_publication_log row
// (with agentId + createdAt + sourcePath) is the audit trail.

import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

export const appendEntry = mutation({
  args: {
    token: v.string(),
    agent: v.literal('maya'),
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
    body: v.optional(v.string()), // full post text (markdown). Optional for backfill rows that predate the field.
    link: v.optional(v.string()),
    sourcePath: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
    const now = Date.now()
    const id = await ctx.db.insert('maya_publication_log', {
      date: data.date,
      platform: data.platform,
      title: data.title,
      status: data.status ?? 'draft',
      body: data.body,
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
    agent: v.literal('maya'),
    date: v.string(),         // YYYY-MM-DD
    dayName: v.string(),      // Monday, Tuesday, ...
    topic: v.string(),        // "Memory Thread", "Quick Win", ...
    bucket: v.string(),       // "Operator" | "Business Outcome"
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
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

// Backfill helper: returns [{_id, sourcePath}] for all existing rows.
// Used by the VPS backfill_bodies.py script to PATCH bodies onto rows
// that were inserted before the body field was wired through.
// Auth: requireHermesAgent with agent='maya' (script supplies its token).
export const listForBackfill = query({
  args: {
    token: v.string(),
    agent: v.literal('maya'),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const rows = await ctx.db.query('maya_publication_log').collect()
    return rows.map((r) => ({ _id: r._id, sourcePath: r.sourcePath, hasBody: r.body != null }))
  },
})

// Backfill helper: PATCHes the body field on an existing row. Used by
// the VPS backfill script. Idempotent — calling twice with the same
// body is a noop.
export const updateEntryBody = mutation({
  args: {
    token: v.string(),
    agent: v.literal('maya'),
    id: v.id('maya_publication_log'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    await ctx.db.patch(args.id, { body: args.body })
    return { id: args.id, ok: true }
  },
})
