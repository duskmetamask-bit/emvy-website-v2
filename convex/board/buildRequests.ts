import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const STATUSES = [
  'requested',
  'needs_approval',
  'approved',
  'rejected',
  'in_progress',
  'blocked',
  'complete',
] as const;

function assertStatus(value: string) {
  if (!STATUSES.includes(value as (typeof STATUSES)[number])) {
    throw new Error(`Invalid build request status: ${value}`);
  }
}
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal('requested'),
      v.literal('needs_approval'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('in_progress'),
      v.literal('blocked'),
      v.literal('complete'),
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    if (args.status) {
      return await ctx.db
        .query('build_requests')
        .withIndex('by_status_and_createdAt', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('build_requests')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('build_requests') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const createRequest = mutation({
  args: {
    project: v.optional(v.string()),
    requestText: v.string(),
  },
  handler: async (ctx, args) => {
    const requestText = args.requestText.trim();
    if (!requestText) throw new Error('Request text cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('build_requests', {
      project: args.project?.trim() || undefined,
      requestText,
      status: 'requested',
      requestedBy: 'operator',
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});


export const setProposal = mutation({
  args: {
    id: v.id('build_requests'),
    proposal: v.string(),
    nextAction: v.optional(v.string()),
  },
  handler: async (ctx, { id, proposal, nextAction }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Build request not found');
    const trimmedProposal = proposal.trim();
    if (!trimmedProposal) throw new Error('Proposal cannot be empty');
    await ctx.db.patch(id, {
      proposal: trimmedProposal,
      nextAction: nextAction?.trim() || undefined,
      status: 'needs_approval',
      claimedBy: row.claimedBy ?? 'Cartz',
      claimedAt: row.claimedAt ?? Date.now(),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const approveRequest = mutation({
  args: { id: v.id('build_requests') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Build request not found');
    if (!row.proposal) {
      throw new Error('Cannot approve without a Cartz proposal');
    }
    const now = Date.now();
    await ctx.db.patch(id, {
      status: 'approved',
      approvedBy: 'operator',
      approvedAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});

export const rejectRequest = mutation({
  args: {
    id: v.id('build_requests'),
    reason: v.string(),
  },
  handler: async (ctx, { id, reason }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Build request not found');
    const trimmedReason = reason.trim();
    if (!trimmedReason) throw new Error('Rejection reason cannot be empty');
    const now = Date.now();
    await ctx.db.patch(id, {
      status: 'rejected',
      rejectedReason: trimmedReason,
      updatedAt: now,
    });
    return { ok: true };
  },
});
