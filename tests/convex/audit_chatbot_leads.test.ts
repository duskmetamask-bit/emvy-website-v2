// Smoke test for the audit_chatbot_leads Convex module. The :update
// mutation is the backfill path for the audit chatbot front-end: it
// fills the score + 30/60/90 roadmap after the MiniMax M2.7 report
// lands. :markReviewed is the operator-side status flip from the board.
//
// This test does NOT mock Convex — it only verifies the function
// exports exist with the expected names. Real mutation behavior
// (db.get, db.patch, db.insert) is exercised in the e2e smoke test
// for the audit-chatbot board surface (see prd/board.json
// audit-chatbot-board-001).

import { describe, it, expect } from 'vitest';
import * as auditChatbotLeads from '@/convex/audit_chatbot_leads';

describe('audit_chatbot_leads exports', () => {
  it('exports :create (existing — public write on email-submit)', () => {
    expect(auditChatbotLeads.create).toBeDefined();
  });

  it('exports :list (existing — read for the board)', () => {
    expect(auditChatbotLeads.list).toBeDefined();
  });

  it('exports :get (existing — single-row read)', () => {
    expect(auditChatbotLeads.get).toBeDefined();
  });

  it('exports :getStats (existing — aggregate stats)', () => {
    expect(auditChatbotLeads.getStats).toBeDefined();
  });

  it('exports :update (new — backfill after the report lands)', () => {
    expect(auditChatbotLeads.update).toBeDefined();
  });

  it('exports :markReviewed (new — board operator action)', () => {
    expect(auditChatbotLeads.markReviewed).toBeDefined();
  });
});
