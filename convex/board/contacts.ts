import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const ENGAGEMENT_TYPES = [
  'note',
  'call',
  'message',
  'meetup',
  'gift',
  'other',
] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('contacts').order('desc').take(500);
  },
});

export const get = query({
  args: { id: v.id('contacts') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    relationship: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error('Name cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('contacts', {
      name,
      relationship: args.relationship?.trim() || undefined,
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('contacts'),
    name: v.optional(v.string()),
    relationship: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const contact = await ctx.db.get(id);
    if (!contact) throw new Error('Contact not found');
    const trimmed: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === 'string') trimmed[k] = v.trim() || undefined;
    }
    await ctx.db.patch(id, { ...trimmed, updatedAt: Date.now() });
    return { ok: true };
  },
});

export const remove = mutation({
  args: { id: v.id('contacts') },
  handler: async (ctx, { id }) => {
    const contact = await ctx.db.get(id);
    if (!contact) throw new Error('Contact not found');
    const engagements = await ctx.db
      .query('contact_engagement')
      .withIndex('by_contact', (q) => q.eq('contactId', id))
      .collect();
    for (const e of engagements) {
      await ctx.db.delete(e._id);
    }
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const listEngagements = query({
  args: { contactId: v.id('contacts') },
  handler: async (ctx, { contactId }) => {
    return await ctx.db
      .query('contact_engagement')
      .withIndex('by_contact', (q) => q.eq('contactId', contactId))
      .order('desc')
      .take(200);
  },
});

export const addEngagement = mutation({
  args: {
    contactId: v.id('contacts'),
    type: v.union(
      v.literal('note'),
      v.literal('call'),
      v.literal('message'),
      v.literal('meetup'),
      v.literal('gift'),
      v.literal('other')
    ),
    summary: v.string(),
    details: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
  },
  handler: async (ctx, { contactId, type, summary, details, occurredAt }) => {
    const trimmedSummary = summary.trim();
    if (!trimmedSummary) throw new Error('Summary cannot be empty');
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error('Contact not found');
    const now = Date.now();
    const when = occurredAt ?? now;
    const trimmedDetails = details?.trim() || undefined;
    await ctx.db.insert('contact_engagement', {
      contactId,
      type,
      summary: trimmedSummary,
      details: trimmedDetails,
      occurredAt: when,
      createdAt: now,
    });
    await ctx.db.patch(contactId, {
      lastEngagementAt: when,
      updatedAt: now,
    });
    return { ok: true };
  },
});
