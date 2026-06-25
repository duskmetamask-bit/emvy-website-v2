// contact_notify — fired by ctx.scheduler.runAfter(0, ...) from
// webhooks/contact.ts:submit. Idempotent via `notifiedAt` timestamp on
// the contact_submissions row — a re-run no-ops.
//
// Side-effect: email the operator (Resend) with the contact form's key
// fields. Mirrors the audit_chatbot_notify_action pattern.
//
// This file holds the helpers (query + mutation) used by the action in
// contact_notify_action.ts. Kept separate because Convex requires node-only
// actions to live in a `"use node"` file with no other exports.

import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

export const getRow = internalQuery({
  args: { id: v.id('contact_submissions') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const markNotified = internalMutation({
  args: {
    id: v.id('contact_submissions'),
    errors: v.array(v.string()),
  },
  handler: async (ctx, { id, errors }) => {
    const patch: Record<string, unknown> = {
      notifiedAt: Date.now(),
    };
    if (errors.length > 0) {
      patch.notificationErrors = errors;
    }
    await ctx.db.patch(id, patch);
  },
});