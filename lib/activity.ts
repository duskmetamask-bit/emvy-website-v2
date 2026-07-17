// Pure helpers for the activity feed — split out from convex/board/activity.ts
// so they can be unit-tested without a DB (per CLAUDE.md "no DB mocks" rule).

const DAY_MS = 24 * 60 * 60 * 1000;

export type EmailEventRow = {
  _id: string;
  emailId?: string;
  leadId?: string;
  eventType: string;
  timestamp: number;
  metadata?: string;
};

export type ActivityLogRow = {
  _id: string;
  leadId: string;
  action: string;
  actor?: string;
  details?: string;
  timestamp: number;
};

export type ActivityRow = {
  id: string;
  kind: 'email' | 'activity';
  timestamp: number;
  leadId?: string;
  leadName?: string;
  action?: string;
  eventType?: string;
  recipient?: string;
  details?: string;
  actor?: string;
};

export function mergeActivity(
  emails: EmailEventRow[],
  activities: ActivityLogRow[],
  leadNameById: Map<string, string>,
  since = 0,
): ActivityRow[] {
  const merged: ActivityRow[] = [];
  for (const r of emails) {
    if (r.timestamp < since) continue;
    merged.push({
      id: `email:${r._id}`,
      kind: 'email',
      timestamp: r.timestamp,
      leadId: r.leadId,
      leadName: r.leadId ? leadNameById.get(r.leadId) : undefined,
      eventType: r.eventType,
      recipient: r.emailId,
      details: r.metadata,
    });
  }
  for (const r of activities) {
    merged.push({
      id: `activity:${r._id}`,
      kind: 'activity',
      timestamp: r.timestamp,
      leadId: r.leadId,
      leadName: leadNameById.get(r.leadId),
      action: r.action,
      details: r.details,
      actor: r.actor,
    });
  }
  merged.sort((a, b) => b.timestamp - a.timestamp);
  return merged;
}

export function summarizeActivity(
  emails: EmailEventRow[],
  activities: ActivityLogRow[],
  now = Date.now(),
) {
  const cutoff24 = now - DAY_MS;
  const byKind: Record<string, number> = {
    email_delivered: 0,
    email_opened: 0,
    email_clicked: 0,
    email_bounced: 0,
    stage_change: 0,
    email_sent: 0,
    booking_created: 0,
    note_added: 0,
    other: 0,
  };
  let emails24 = 0;
  for (const r of emails) {
    if (r.timestamp >= cutoff24) emails24 += 1;
    const k = `email_${r.eventType}`;
    if (k in byKind) byKind[k] += 1;
    else byKind.other += 1;
  }
  let activities24 = 0;
  for (const r of activities) {
    if (r.timestamp >= cutoff24) activities24 += 1;
    if (r.action in byKind) byKind[r.action] += 1;
    else byKind.other += 1;
  }
  return {
    emails_total: emails.length,
    emails_last_24h: emails24,
    activity_total: activities.length,
    activity_last_24h: activities24,
    by_kind: byKind,
  };
}

export function dayGroupLabel(ts: number, now = Date.now()): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTs = new Date(ts);
  startOfTs.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((startOfToday.getTime() - startOfTs.getTime()) / DAY_MS);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This week';
  return 'Earlier';
}
