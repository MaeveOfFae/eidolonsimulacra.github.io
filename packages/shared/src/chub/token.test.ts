import { describe, expect, it } from 'vitest';
import { parseChubTokenExpiry } from './token';

/** Build a JWT-shaped string with the given payload (signature is never checked). */
function jwtWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(payload)}.sig`;
}

describe('parseChubTokenExpiry', () => {
  it('reads a future expiry as not expired', () => {
    const now = 1_700_000_000_000;
    const expiry = parseChubTokenExpiry(jwtWithPayload({ exp: 2_000_000_000 }), now);

    expect(expiry).not.toBeNull();
    expect(expiry!.expired).toBe(false);
    expect(expiry!.expiresAt.getTime()).toBe(2_000_000_000_000);
  });

  it('reads a past expiry as expired', () => {
    const expiry = parseChubTokenExpiry(jwtWithPayload({ exp: 1_000_000_000 }), 1_700_000_000_000);

    expect(expiry!.expired).toBe(true);
  });

  it('returns null for opaque (non-JWT) tokens', () => {
    expect(parseChubTokenExpiry('not-a-jwt')).toBeNull();
    expect(parseChubTokenExpiry('two.parts')).toBeNull();
    expect(parseChubTokenExpiry('a..c')).toBeNull();
  });

  it('returns null when the payload has no numeric exp', () => {
    expect(parseChubTokenExpiry(jwtWithPayload({ sub: 'user' }))).toBeNull();
    expect(parseChubTokenExpiry(jwtWithPayload({ exp: 'soon' }))).toBeNull();
  });

  it('returns null for undecodable payloads', () => {
    expect(parseChubTokenExpiry('header.!!!not-base64!!!.sig')).toBeNull();
    expect(parseChubTokenExpiry('header.eyJibGFkIjoiJ30.sig')).toBeNull();
  });
});
