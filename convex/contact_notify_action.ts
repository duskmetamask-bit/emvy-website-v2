"use node";

// contact_notify_action — node-runtime action that fires the operator
// email (Resend) on contact_submissions:submit. Split from contact_notify.ts
// because Convex requires node-only actions to live in a `"use node"`
// file with no other exports.

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

const RESEND_API = 'https://api.resend.com/emails';

export const notifyOperator = internalAction({
  args: { submissionId: v.id('contact_submissions') },
  handler: async (ctx, { submissionId }) => {
    const row = await ctx.runQuery(internal.contact_notify.getRow, {
      id: submissionId,
    });
    if (!row) {
      console.warn('[contact_notify] row not found', { submissionId });
      return { ok: false, reason: 'row_not_found' as const };
    }
    if (row.notifiedAt) {
      return { ok: true, noop: true, reason: 'already_notified' as const };
    }

    const errors: string[] = [];

    // --- (1) Operator email via Resend ---
    const resendKey = process.env.RESEND_API_KEY;
    const operatorEmail = process.env.NOTIFY_OPERATOR_EMAIL ?? 'jake@emvyai.com';
    const fromAddress =
      process.env.NOTIFY_FROM_ADDRESS ?? 'EMVY Audit Bot <audit@emvyai.com>';

    if (!resendKey) {
      errors.push('RESEND_API_KEY not set on Convex deployment');
    } else {
      const summary = contactSummary(row);
      try {
        const res = await fetch(RESEND_API, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: operatorEmail,
            subject: `[Contact] ${row.name ?? 'Unknown'} — ${row.email ?? 'no email'}`,
            text: summary,
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => 'unknown');
          errors.push(`Resend ${res.status}: ${errText.slice(0, 200)}`);
        }
      } catch (e) {
        errors.push(`Resend fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Mark notified regardless of partial failure so we don't spam the
    // operator on every retry. Errors are recorded in notificationErrors.
    await ctx.runMutation(internal.contact_notify.markNotified, {
      id: submissionId,
      errors,
    });

    return {
      ok: errors.length === 0,
      errors: errors.length ? errors : undefined,
    };
  },
});

function contactSummary(row: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
  createdAt: number;
}): string {
  const lines: string[] = [];
  lines.push(`Name:    ${row.name ?? '—'}`);
  lines.push(`Email:   ${row.email ?? '—'}`);
  if (row.phone) lines.push(`Phone:   ${row.phone}`);
  if (row.company) lines.push(`Company: ${row.company}`);
  if (row.source) lines.push(`Source:  ${row.source}`);
  lines.push(`Time:    ${new Date(row.createdAt).toISOString()}`);
  if (row.message) {
    lines.push('');
    lines.push('Message:');
    lines.push(row.message);
  }
  return lines.join('\n');
}