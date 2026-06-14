// Smoke test for the Cartz/Builds build register Hermes write surface.
// Verifies the export shape only — real auth + db behavior is covered
// by the deploy smoke path (POST to hermes/builds:appendEntry against
// glad-camel-940, see Session 2026-06-14 PM4 plan).
//
// Pattern mirrors tests/convex/hermes_marketing.test.ts.

import { describe, it, expect } from 'vitest';
import * as hermesBuilds from '@/convex/hermes/builds';

describe('hermes/builds exports', () => {
  it('exports :appendEntry (cron write path for Cartz/Builds stages)', () => {
    expect(hermesBuilds.appendEntry).toBeDefined();
  });
});
