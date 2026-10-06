/**
 * Transport for Chub gateway requests.
 *
 * Unlike the ComfyUI bridge, no native plugin is needed: the gateway answers
 * `Access-Control-Allow-Origin: *` and lists `ch-api-key`/`Authorization` in its
 * CORS allow-headers (verified live), so the plain browser `fetch` works on web,
 * desktop, and mobile alike. Browsers also send a browser User-Agent by default,
 * which matters — the gateway 403s default script UAs.
 */
import type { ChubFetch } from '@char-gen/shared';

/** The fetch implementation Chub calls should use on this runtime. */
export function getChubFetch(): ChubFetch {
  return (url, init) => fetch(url, init);
}

/** Map a Chub/transport failure to a remedy-shaped message. */
export function describeChubError(error: unknown): string {
  if (error instanceof Error && 'status' in error && typeof (error as { status?: unknown }).status === 'number') {
    const status = (error as { status: number }).status;
    const detail = 'detail' in error ? (error as { detail: string | null }).detail : null;
    if (status === 401 || status === 403) {
      return `Chub rejected the token (HTTP ${status})${detail ? `: ${detail}` : '.'} Re-copy it in Settings → Chub.`;
    }
    if (status === 429) {
      return 'Chub is rate-limiting requests — wait a moment and try again.';
    }
    return error instanceof Error ? error.message : `Chub answered HTTP ${status}.`;
  }
  if (error instanceof TypeError && /failed to fetch/i.test(error.message)) {
    return 'Could not reach gateway.chub.ai. Check your network connection (the gateway itself is up — its docs load at gateway.chub.ai/docs).';
  }
  return error instanceof Error ? error.message : 'The Chub request failed.';
}
