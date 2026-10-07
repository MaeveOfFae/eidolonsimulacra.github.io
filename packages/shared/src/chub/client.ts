/**
 * Transport-agnostic Chub.ai gateway client (mirrors `comfyui/client.ts`).
 *
 * Auth: protected calls send the token as **both** `Authorization: Bearer` and
 * `ch-api-key` — the gateway's security schemes accept either. Verification
 * probes `GET /api/self`: it accepts the API-style tokens chub.ai issues
 * (samwise values — `/oauth/userinfo` rejects those with a misleading
 * "This token is expired.") and answers an anonymous stub (id `-22358`, name
 * "You") when no valid token is presented, so a positive id is the verdict.
 * `/oauth/userinfo` remains best-effort enrichment (tier/credits) and the
 * legacy fallback for older session tokens.
 *
 * The gateway answers `Access-Control-Allow-Origin: *` and allows both auth headers,
 * so plain browser `fetch` works directly. Non-browser callers (smoke scripts) must
 * send a browser-like User-Agent — the gateway answers HTTP 403 "This service is not
 * available in your country." to default script UAs.
 */
import type {
  ChubApiResult,
  ChubCharacterCreate,
  ChubCharacterUpdate,
  ChubClientOptions,
  ChubFetch,
  ChubIdentity,
  ChubPublishedRef,
  ChubSearchNode,
} from './types';
import { DEFAULT_CHUB_BASE_URL } from './defaults';

// Re-exported so consumers (and tests) can import the transport type from the
// module that defines the requests it drives.
export type { ChubFetch } from './types';

/** A gateway error with the HTTP status and the parsed `detail`, when present. */
export class ChubApiError extends Error {
  readonly status: number;
  readonly detail: string | null;

  constructor(status: number, detail: string | null, message?: string) {
    super(message ?? `Chub answered HTTP ${status}${detail ? `: ${detail}` : '.'}`);
    this.name = 'ChubApiError';
    this.status = status;
    this.detail = detail;
  }
}

export function normalizeChubBaseUrl(rawUrl: string | undefined): string {
  const trimmed = (rawUrl ?? '').trim().replace(/\/+$/, '');
  if (trimmed.length === 0) {
    return DEFAULT_CHUB_BASE_URL;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/** Pull the human-readable message out of either error shape the gateway uses. */
export function parseChubErrorDetail(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const candidate = entry as { msg?: unknown; type?: unknown; loc?: unknown };
        const msg = typeof candidate.msg === 'string' ? candidate.msg : null;
        const type = typeof candidate.type === 'string' ? candidate.type : null;
        const loc = Array.isArray(candidate.loc) ? candidate.loc.join('.') : null;
        if (msg && loc) {
          return `${loc}: ${msg}`;
        }
        return msg ?? (type ? `validation failed (${type})` : null);
      })
      .filter((entry): entry is string => Boolean(entry));
    return messages.length > 0 ? messages.join('; ') : null;
  }
  return null;
}

function resolveFetch(options: ChubClientOptions): ChubFetch {
  return options.fetchFn ?? ((url, init) => fetch(url, init));
}

function chubHeaders(options: ChubClientOptions, hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.token}`,
    'ch-api-key': options.token,
  };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/** Execute one gateway request, throwing `ChubApiError` for any non-2xx answer. */
async function chubRequest(
  options: ChubClientOptions,
  path: string,
  init: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown } = { method: 'GET' },
): Promise<unknown> {
  const fetchFn = resolveFetch(options);
  const url = `${normalizeChubBaseUrl(options.baseUrl)}${path}`;
  const hasBody = init.body !== undefined;
  const response = await fetchFn(url, {
    method: init.method,
    headers: chubHeaders(options, hasBody),
    ...(hasBody ? { body: JSON.stringify(init.body) } : {}),
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new ChubApiError(response.status, parseChubErrorDetail(payload));
  }
  return payload;
}

/**
 * Verify the token. `GET /api/self` is the primary probe: it accepts the
 * API-style tokens chub.ai issues (samwise values; `/oauth/userinfo` rejects
 * those with a misleading "This token is expired.") and answers an anonymous
 * stub (negative id) when no valid token is presented — so a positive id is
 * the verdict. `GET /oauth/userinfo` then runs as best-effort enrichment
 * (tier/credits) and as the legacy fallback for older session tokens that
 * only it accepts; its failure is normal, never the gate.
 */
export async function chubVerifyIdentity(options: ChubClientOptions): Promise<ChubIdentity> {
  const identity: ChubIdentity = { identity: '', username: '', scopes: [], subscription: null };
  let verifiedBySelf = false;

  try {
    const self = (await chubRequest(options, '/api/self')) as {
      id?: number;
      name?: string;
      user_name?: string;
      avatar_url?: string;
    };
    if (typeof self.id === 'number' && self.id > 0) {
      verifiedBySelf = true;
      identity.accountId = self.id;
      if (typeof self.name === 'string' && self.name.trim().length > 0) {
        identity.displayName = self.name;
      }
      if (typeof self.avatar_url === 'string') {
        identity.avatarUrl = self.avatar_url;
      }
      const fromSelf = [self.user_name, self.name].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && candidate.trim().length > 0 && candidate.trim() !== 'You',
      );
      if (fromSelf) {
        identity.username = fromSelf.trim();
      }
    }
  } catch {
    // `/api/self` failing outright falls through to the userinfo probe.
  }

  try {
    const userinfo = (await chubRequest(options, '/oauth/userinfo')) as {
      identity?: unknown;
      username?: unknown;
      scopes?: unknown;
      credits?: unknown;
      subscription?: unknown;
    };
    if (!identity.identity && typeof userinfo.identity === 'string') {
      identity.identity = userinfo.identity;
    }
    if (Array.isArray(userinfo.scopes)) {
      identity.scopes = userinfo.scopes.filter((s): s is string => typeof s === 'string');
    }
    if (typeof userinfo.credits === 'number') {
      identity.credits = userinfo.credits;
    }
    if (typeof userinfo.subscription === 'string') {
      identity.subscription = userinfo.subscription;
    }
    if (!identity.username && typeof userinfo.username === 'string' && userinfo.username.trim()) {
      identity.username = userinfo.username.trim();
    }
  } catch (error) {
    if (!verifiedBySelf) {
      // Neither probe accepted the token — surface the gateway's own detail
      // (it carries the actionable reason: missing key, expired, etc.).
      throw error;
    }
    // Verified by /api/self: tier and credits are cosmetic enrichment.
  }

  if (!identity.username) {
    throw new ChubApiError(
      401,
      verifiedBySelf ? 'The token verified but returned no username.' : 'This token is expired or unrecognized.',
    );
  }
  return identity;
}

/** `POST /api/core/characters` — Create char. */
export async function chubCreateCharacter(
  options: ChubClientOptions,
  payload: ChubCharacterCreate,
): Promise<ChubApiResult> {
  const result = await chubRequest(options, '/api/core/characters', { method: 'POST', body: payload });
  return (result ?? {}) as ChubApiResult;
}

/** `PUT /api/core/characters/{username}/{pathname}` — Update char. */
export async function chubUpdateCharacter(
  options: ChubClientOptions,
  username: string,
  pathname: string,
  payload: ChubCharacterUpdate,
): Promise<ChubApiResult> {
  const path = `/api/core/characters/${encodeURIComponent(username)}/${encodeURIComponent(pathname)}`;
  const result = await chubRequest(options, path, { method: 'PUT', body: payload });
  return (result ?? {}) as ChubApiResult;
}

/** `GET /api/characters/{fullPath}` — public detail (used to confirm a publish landed). */
export async function chubGetCharacter(
  options: ChubClientOptions,
  fullPath: string,
): Promise<{ node: ChubSearchNode } | null> {
  const encoded = fullPath.split('/').map(encodeURIComponent).join('/');
  const result = (await chubRequest(options, `/api/characters/${encoded}`)) as { node?: ChubSearchNode } | null;
  return result?.node ? { node: result.node } : null;
}

/** `GET /search` — keyword search; returns `data.nodes` (live-verified shape). */
export async function chubSearchCharacters(
  options: ChubClientOptions,
  search: string,
  limit = 20,
): Promise<ChubSearchNode[]> {
  const query = new URLSearchParams({
    search,
    namespace: 'characters',
    first: String(Math.max(1, Math.min(50, limit))),
    page: '1',
    sort: 'default',
    chub: 'true',
    venus: 'true',
    count: 'false',
  });
  const result = (await chubRequest(options, `/search?${query.toString()}`)) as {
    data?: { nodes?: ChubSearchNode[] };
  } | null;
  return Array.isArray(result?.data?.nodes) ? result!.data!.nodes! : [];
}

/**
 * Read a published reference out of a create response. The spec documents only
 * `APIResponse {message, success}`, so id/fullPath fields are treated as optional
 * extras; callers fall back to `chubResolvePublished` when they are absent.
 */
export function extractPublishedRef(prior: unknown, fallbackName: string): ChubPublishedRef | null {
  if (!prior || typeof prior !== 'object') {
    return null;
  }
  const candidate = prior as Record<string, unknown>;
  const fullPath =
    typeof candidate.fullPath === 'string'
      ? candidate.fullPath
      : typeof candidate.full_path === 'string'
        ? candidate.full_path
        : null;
  if (!fullPath || !fullPath.includes('/')) {
    return null;
  }
  const [username, pathname] = fullPath.split('/', 2);
  const id = typeof candidate.character_id === 'number' ? candidate.character_id : undefined;
  const rawId = typeof candidate.id === 'number' ? candidate.id : undefined;
  return {
    characterId: id ?? rawId,
    full_path: fullPath,
    username: username!,
    pathname: pathname!,
    name: fallbackName,
  };
}

/**
 * Resolve the `username/pathname` a create produced. Tries fields the create
 * response may carry undocumented, then falls back to a name search scoped to the
 * publisher's own `username/` prefix.
 */
export async function chubResolvePublished(
  options: ChubClientOptions,
  username: string,
  name: string,
  prior: unknown,
): Promise<ChubPublishedRef | null> {
  const direct = extractPublishedRef(prior, name);
  if (direct) {
    return direct;
  }
  const nodes = await chubSearchCharacters(options, name);
  const prefix = `${username}/`;
  const match = nodes.find((node) => node.fullPath?.startsWith(prefix) && node.name === name);
  if (!match?.fullPath) {
    return null;
  }
  const [foundUser, pathname] = match.fullPath.split('/', 2);
  return {
    characterId: match.id,
    full_path: match.fullPath,
    username: foundUser!,
    pathname: pathname!,
    name,
  };
}

/**
 * `POST /account/tokens/projects` — mint a scoped token for "the base API for
 * projects CRUD". The spec's `ActiveToken` schema is a dangling `$ref`, so the
 * token string is extracted defensively from common field names; callers fall back
 * to the session token when extraction fails.
 */
export async function chubMintProjectsToken(options: ChubClientOptions): Promise<string | null> {
  const result = (await chubRequest(options, '/account/tokens/projects', { method: 'POST' })) as Record<
    string,
    unknown
  > | null;
  if (!result || typeof result !== 'object') {
    return null;
  }
  const candidates: unknown[] = [result.token, result.value, result.key, result.api_key, result.secret];
  const nested = result.data;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    candidates.push(inner.token, inner.value, inner.key);
  }
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}
