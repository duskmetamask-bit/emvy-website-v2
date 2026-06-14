// Smoke test for the Maya publication log Hermes write surface.
// Verifies the export shape only — real auth + db behavior is covered
// by the e2e smoke path (see prd/board.json maya-board-001).
//
// Pattern mirrors tests/convex/audit_chatbot_leads.test.ts.

import { describe, it, expect } from 'vitest';
import * as hermesMarketing from '@/convex/hermes/marketing';

describe('hermes/marketing exports', () => {
  it('exports :appendEntry (cron write path for Maya drafts/posts)', () => {
    expect(hermesMarketing.appendEntry).toBeDefined();
  });
});
