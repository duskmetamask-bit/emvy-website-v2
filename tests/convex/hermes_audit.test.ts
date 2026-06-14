// Smoke test for the Sage audit register Hermes write surface.
// Verifies the export shape only — real auth + db behavior is covered
// by the deploy smoke path (POST to hermes/audit:appendEntry against
// glad-camel-940, see Session 2026-06-14 PM4 plan).
//
// Pattern mirrors tests/convex/hermes_marketing.test.ts.

import { describe, it, expect } from 'vitest';
import * as hermesAudit from '@/convex/hermes/audit';

describe('hermes/audit exports', () => {
  it('exports :appendEntry (cron write path for Sage audits)', () => {
    expect(hermesAudit.appendEntry).toBeDefined();
  });
});
