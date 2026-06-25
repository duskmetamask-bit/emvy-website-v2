// Operator-facing live pipeline counts. Powers /process.
//
// 22 stages laid out per VPS `~/obsidian-vault/emvy-process/PIPELINE.md`
// (2026-06-22) and `CLIENT-BUILD-PROCESS.md` (2026-06-18).
//
// Stages 16–22 (client delivery: Scope → Handover) have no data source
// in Convex today — Dusk tracks them in `~/obsidian-vault/emvy/client-builds/`.
// They intentionally render with `count: null` + warning so the operator
// sees the gap in the diagram rather than a misleading 0.
//
// Time windows: agents + content + outreach = 7d; engagement + bookings =
// 30d; audits + builds = 30d; client delivery = no time filter.

import { query } from '../_generated/server';
import type { StageCount } from '../../lib/process-stages';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function withinWindow(createdAt: number | undefined, cutoff: number): boolean {
  if (!createdAt) return false;
  return createdAt >= cutoff;
}

export const stageCounts = query({
  args: {},
  handler: async (ctx): Promise<StageCount[]> => {
    const now = Date.now();
    const cutoff7 = now - SEVEN_DAYS_MS;
    const cutoff30 = now - THIRTY_DAYS_MS;

    // Pull all the tables we need in parallel.
    const [
      intelReports,
      cronRows,
      mayaRows,
      outreachRows,
      assessmentRows,
      bookings,
      emailEvents,
      payments,
      auditRows,
      buildRows,
    ] = await Promise.all([
      ctx.db.query('intelligence_reports').collect(),
      ctx.db.query('cron_runs').collect(),
      ctx.db.query('maya_publication_log').collect(),
      ctx.db.query('outreach_queue').collect(),
      ctx.db.query('assessment_submissions').collect(),
      ctx.db.query('cal_bookings').collect(),
      ctx.db.query('email_events').collect(),
      ctx.db.query('payments').collect(),
      ctx.db.query('audit_register').collect(),
      ctx.db.query('build_register').collect(),
    ]);

    // 1. Intelligence Reports — last 7d
    const intelligenceReportsCount = intelReports.filter(
      (r) => withinWindow(r.createdAt, cutoff7),
    ).length;

    // 2. Happy Harold — cron_runs where agentId='happy-harold' and lastRunAt in 7d
    const happyHaroldCount = cronRows.filter(
      (r) =>
        r.agentId === 'happy-harold' &&
        withinWindow(r.lastRunAt ?? r.updatedAt, cutoff7),
    ).length;

    // 3. Maya Blog — maya_publication_log platform='Blog' last 7d
    const mayaBlogCount = mayaRows.filter(
      (r) =>
        (r as { platform?: string }).platform === 'Blog' &&
        withinWindow(r.createdAt, cutoff7),
    ).length;

    // 4. Maya Social — platform='X' or 'LinkedIn' last 7d
    const mayaSocialCount = mayaRows.filter((r) => {
      const p = (r as { platform?: string }).platform;
      return (p === 'X' || p === 'LinkedIn') && withinWindow(r.createdAt, cutoff7);
    }).length;

    // 5. Blando Discovery — outreach_queue rows in last 7d (any status)
    const blandoCount = outreachRows.filter(
      (r) => withinWindow(r.createdAt, cutoff7),
    ).length;

    // 6. Assessment chatbot submissions — last 30d
    const assessmentCount = assessmentRows.filter(
      (r) => withinWindow((r as { createdAt?: number }).createdAt, cutoff30),
    ).length;

    // 7. Outreach Sent — outreach_queue where status='sent' last 7d
    const outreachSentCount = outreachRows.filter(
      (r) =>
        r.status === 'sent' && withinWindow(r.sentAt ?? r.createdAt, cutoff7),
    ).length;

    // 8. Opens / 9. Clicks / 10. Bounces / 11. Replies — email_events last 30d
    const openCount = emailEvents.filter(
      (e) => e.eventType === 'opened' && withinWindow(e.timestamp, cutoff30),
    ).length;
    const clickCount = emailEvents.filter(
      (e) => e.eventType === 'clicked' && withinWindow(e.timestamp, cutoff30),
    ).length;
    const bounceCount = emailEvents.filter(
      (e) => e.eventType === 'bounced' && withinWindow(e.timestamp, cutoff30),
    ).length;
    const replyCount = emailEvents.filter(
      (e) => e.eventType === 'replied' && withinWindow(e.timestamp, cutoff30),
    ).length;

    // 12. Discovery bookings — cal_bookings type='discovery', last 30d
    const discoveryCount = bookings.filter((b) => {
      const type = (b as { type?: string }).type ?? '';
      if (type !== 'discovery') return false;
      const t = (b as { createdAt?: number }).createdAt ?? 0;
      return t >= cutoff30;
    }).length;

    // 13. AI Strategy paid — payments matching 'strategy' or '$500'
    const strategyPaidCount = payments.filter(
      (p) =>
        (p as { status?: string }).status === 'succeeded' &&
        ((p as { description?: string }).description ?? '')
          .toLowerCase()
          .match(/strategy|\$500/),
    ).length;

    // 14. Sage audits — last 30d
    const sageAuditCount = auditRows.filter((r) =>
      withinWindow(r.createdAt, cutoff30),
    ).length;

    // 15. Build register — count all (R&D templates, no expiry)
    const buildRegisterCount = buildRows.length;

    const result: StageCount[] = [
      { id: 'intelligence_reports', count: intelligenceReportsCount },
      { id: 'happy_harold', count: happyHaroldCount },
      { id: 'maya_blog', count: mayaBlogCount },
      { id: 'maya_social', count: mayaSocialCount },
      { id: 'blando_outbox', count: blandoCount },
      { id: 'assessment_submissions', count: assessmentCount },
      { id: 'outreach_sends', count: outreachSentCount },
      { id: 'engagement_opens', count: openCount },
      { id: 'engagement_clicks', count: clickCount },
      { id: 'engagement_bounces', count: bounceCount },
      { id: 'engagement_replies', count: replyCount },
      { id: 'discovery_booked', count: discoveryCount },
      { id: 'strategy_paid', count: strategyPaidCount },
      { id: 'sage_audit', count: sageAuditCount },
      { id: 'build_register', count: buildRegisterCount },
      {
        id: 'client_scope',
        count: null,
        warning: 'No client_builds table — Dusk tracks in vault.',
      },
      { id: 'client_deposit', count: null, warning: 'Tracked in vault.' },
      { id: 'client_discovery', count: null, warning: 'Tracked in vault.' },
      { id: 'client_build', count: null, warning: 'Tracked in vault.' },
      { id: 'client_review', count: null, warning: 'Tracked in vault.' },
      { id: 'client_final', count: null, warning: 'Tracked in vault.' },
      { id: 'client_handover', count: null, warning: 'Tracked in vault.' },
    ];

    return result;
  },
});