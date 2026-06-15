import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { requireHermesAgent, requireHermes, hermesAgentConfigured } from '@/convex/hermesAuth';

const SAVED: Record<string, string | undefined> = {};
beforeEach(() => {
  for (const k of Object.keys(SAVED)) {
    if (SAVED[k] === undefined) delete process.env[k];
    else process.env[k] = SAVED[k];
  }
  // wipe all HERMES_TOKEN_*
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('HERMES_TOKEN_')) SAVED[k] = (delete process.env[k], undefined);
  }
  for (const k of Object.keys(SAVED)) {
    if (k.startsWith('HERMES_TOKEN_')) SAVED[k] = process.env[k];
    delete process.env[k];
  }
});
afterEach(() => {
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('HERMES_TOKEN_')) delete process.env[k];
  }
  for (const [k, v] of Object.entries(SAVED)) {
    if (v !== undefined) process.env[k] = v;
  }
});

describe('requireHermesAgent', () => {
  it('throws when no token is provided', () => {
    expect(() => requireHermesAgent(undefined, 'sage')).toThrow(/missing token/);
    expect(() => requireHermesAgent(null, 'sage')).toThrow(/missing token/);
    expect(() => requireHermesAgent('', 'sage')).toThrow(/missing token/);
  });

  it('throws when no agent is provided', () => {
    expect(() => requireHermesAgent('any-token', undefined)).toThrow(/missing agent/);
    expect(() => requireHermesAgent('any-token', null)).toThrow(/missing agent/);
  });

  it('throws when agent is unknown', () => {
    expect(() => requireHermesAgent('any-token', 'rogue-agent')).toThrow(/unknown agent/);
  });

  it('throws when agent env var is not configured', () => {
    expect(() => requireHermesAgent('any-token', 'sage')).toThrow(/not configured/);
  });

  it('throws on a wrong token', () => {
    process.env.HERMES_TOKEN_SAGE = 'correct-token-32-chars-aaaaaaaaaaaa';
    expect(() => requireHermesAgent('wrong-token-32-chars-aaaaaaaaaaa', 'sage')).toThrow(/invalid token/);
  });

  it('accepts the matching token for the right agent', () => {
    process.env.HERMES_TOKEN_SAGE = 'correct-token-32-chars-aaaaaaaaaaaa';
    expect(() => requireHermesAgent('correct-token-32-chars-aaaaaaaaaaaa', 'sage')).not.toThrow();
  });

  it('rejects a token belonging to a different agent', () => {
    process.env.HERMES_TOKEN_BLANDO = 'blando-token-aaaaaaaaaaaaaa';
    process.env.HERMES_TOKEN_SAGE = 'sage-token-bbbbbbbbbbbbbbbb';
    // blando's token trying to call sage's mutation
    expect(() => requireHermesAgent('blando-token-aaaaaaaaaaaaaa', 'sage')).toThrow(/invalid token/);
    // sage's token trying to call blando's mutation
    expect(() => requireHermesAgent('sage-token-bbbbbbbbbbbbbbbb', 'blando')).toThrow(/invalid token/);
  });

  it('rejects tokens of a different length (constant-time path)', () => {
    process.env.HERMES_TOKEN_SAGE = 'short';
    expect(() => requireHermesAgent('a-much-longer-token-value', 'sage')).toThrow(/invalid token/);
  });

  it('rejects a token that differs by one character', () => {
    process.env.HERMES_TOKEN_SAGE = 'abcdefghijklmnop';
    expect(() => requireHermesAgent('abcdefghijklmnoq', 'sage')).toThrow(/invalid token/);
  });
});

describe('hermesAgentConfigured', () => {
  it('returns false for an agent whose env var is unset', () => {
    expect(hermesAgentConfigured('sage')).toBe(false);
  });

  it('returns false when env var is empty string', () => {
    process.env.HERMES_TOKEN_SAGE = '';
    expect(hermesAgentConfigured('sage')).toBe(false);
  });

  it('returns true when env var is set', () => {
    process.env.HERMES_TOKEN_SAGE = 'some-token-value';
    expect(hermesAgentConfigured('sage')).toBe(true);
  });

  it('returns false for an unknown agent', () => {
    expect(hermesAgentConfigured('rogue-agent')).toBe(false);
  });
});

describe('requireHermes (v1 shim)', () => {
  it('always throws — v1 shared token retired', () => {
    expect(() => requireHermes('any-token')).toThrow(/v1 shared token retired/);
    expect(() => requireHermes(undefined)).toThrow(/missing token/);
  });
});
