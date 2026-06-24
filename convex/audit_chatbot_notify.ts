// audit_chatbot_notify — fired by ctx.scheduler.runAfter(0, ...) from
// audit_chatbot_leads.ts:create. Idempotent via a `notifiedAt` timestamp
// on the audit_chatbot_leads row — a re-run no-ops.
//
// Two side-effects, both best-effort:
//   1. Email the operator (Resend) with the lead's key fields.
//   2. POST to the VPS webhook receiver at /webhook/assessment, signed
//      with HMAC-SHA256(body, EMVY_INBOUND_HMAC_SECRET). The VPS side
//      already has a working handler at
//      ~/.hermes/webhooks/webhook_receiver.py:_handle_assessment
//      that saves the payload, sends a Telegram, and queues Blando to
//      follow up.
//
// This file holds the helpers (query + mutation) used by the action in
// audit_chatbot_notify_action.ts. Keeping them separate because Convex
// requires node-only actions to live in a `"use node"` file with no
// other exports.

import { internalMutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

export const getRow = internalQuery({
  args: { id: v.id('audit_chatbot_leads') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const markNotified = internalMutation({
  args: {
    id: v.id('audit_chatbot_leads'),
    errors: v.array(v.string()),
  },
  handler: async (ctx, { id, errors }) => {
    const patch: Record<string, unknown> = {
      notifiedAt: Date.now(),
    }
    if (errors.length > 0) {
      patch.notificationErrors = errors
    }
    await ctx.db.patch(id, patch)
  },
})
