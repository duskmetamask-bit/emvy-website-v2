import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { requireHermes, hermesAuthConfigured } from '@/convex/hermesAuth';

const ENV_VAR = 'HERMES_ACTIONS_TOKEN';
const ORIGINAL = process.env[ENV_VAR];

beforeEach(() => {
  delete process.env[ENV_VAR];
});

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env[ENV_VAR];
  } else {
    process.env[ENV_VAR] = ORIGINAL;
  }
});

describe('requireHermes', () => {
  it('throws when no token is provided', () => {
    expect(() => requireHermes(undefined)).toThrow(/missing token/);
    expect(() => requireHermes(null)).toThrow(/missing token/);
    expect(() => requireHermes('')).toThrow(/missing token/);
  });

  it('throws when env var is not configured', () => {
    expect(() => requireHermes('any-token')).toThrow(/not configured/);
  });

  it('throws on a wrong token', () => {
    process.env[ENV_VAR] = 'correct-token-32-chars-aaaaaaaaaaaa';
    expect(() => requireHermes('wrong-token-32-chars-aaaaaaaaaaa')).toThrow(/invalid token/);
  });

  it('accepts the matching token', () => {
    process.env[ENV_VAR] = 'correct-token-32-chars-aaaaaaaaaaaa';
    expect(() => requireHermes('correct-token-32-chars-aaaaaaaaaaaa')).not.toThrow();
  });

  it('rejects tokens of a different length (constant-time path)', () => {
    process.env[ENV_VAR] = 'short';
    expect(() => requireHermes('a-much-longer-token-value')).toThrow(/invalid token/);
  });

  it('rejects a token that differs by one character', () => {
    process.env[ENV_VAR] = 'abcdefghijklmnop';
    expect(() => requireHermes('abcdefghijklmnoq')).toThrow(/invalid token/);
  });
});

describe('hermesAuthConfigured', () => {
  it('returns false when env var is not set', () => {
    expect(hermesAuthConfigured()).toBe(false);
  });

  it('returns false when env var is empty string', () => {
    process.env[ENV_VAR] = '';
    expect(hermesAuthConfigured()).toBe(false);
  });

  it('returns true when env var is set', () => {
    process.env[ENV_VAR] = 'some-token-value';
    expect(hermesAuthConfigured()).toBe(true);
  });
});
