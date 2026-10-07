/**
 * Client-side expiry reads for pasted Chub tokens.
 *
 * chub.ai's `URQL_TOKEN` is a session JWT: decoding its `exp` claim (no
 * signature verification — the gateway does that) lets Settings say *why* a
 * token will be rejected before any request is made, instead of surfacing a
 * generic 401 after the round trip. Non-JWT values (opaque API keys) return
 * null and take the normal path.
 */

export interface ChubTokenExpiry {
  expiresAt: Date;
  expired: boolean;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split('.');
  if (segments.length !== 3 || segments[1].length === 0) {
    return null;
  }
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    // `atob` is missing on some embedded runtimes — degrade to null rather
    // than throwing; the gateway remains the authority either way.
    const atobFn = (globalThis as { atob?: (data: string) => string }).atob;
    if (typeof atobFn !== 'function') {
      return null;
    }
    const parsed = JSON.parse(atobFn(padded)) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Read `exp` from a JWT-shaped token; null when it isn't one or carries no expiry. */
export function parseChubTokenExpiry(token: string, now: number = Date.now()): ChubTokenExpiry | null {
  const payload = decodeJwtPayload(token.trim());
  const exp = payload?.exp;
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null;
  }
  const expiresAt = new Date(exp * 1000);
  return { expiresAt, expired: expiresAt.getTime() <= now };
}
