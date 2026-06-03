import { describe, it, expect } from 'vitest';
import { parseAddress } from '@/convex/email_inbox';

describe('parseAddress', () => {
  it('extracts address from "Name <addr@x>" format', () => {
    expect(parseAddress('Jane Doe <jane@example.com>')).toBe('jane@example.com');
  });

  it('handles a bare address with no display name', () => {
    expect(parseAddress('jane@example.com')).toBe('jane@example.com');
  });

  it('lowercases the parsed address', () => {
    expect(parseAddress('Jane <JANE@Example.COM>')).toBe('jane@example.com');
  });

  it('trims whitespace around the address', () => {
    expect(parseAddress('  <jane@example.com>  ')).toBe('jane@example.com');
  });

  it('handles a quoted display name with embedded special chars', () => {
    expect(parseAddress('"Doe, Jane" <jane@example.com>')).toBe('jane@example.com');
  });

  it('returns the first address when multiple are present', () => {
    // "Jane <jane@a.com>, John <john@b.com>" → first match wins
    expect(parseAddress('Jane <jane@a.com>, John <john@b.com>')).toBe('jane@a.com');
  });

  it('falls back to the lowercased input when no address is found', () => {
    // Malformed input — no @ sign, no angle brackets. The function
    // lowercases and trims but does not throw.
    expect(parseAddress('  NoAtSign  ')).toBe('noatsign');
  });
});
