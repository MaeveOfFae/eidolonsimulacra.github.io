import { describe, expect, it, vi } from 'vitest';
import {
  ChubApiError,
  chubCreateCharacter,
  chubMintProjectsToken,
  chubResolvePublished,
  chubUpdateCharacter,
  chubVerifyIdentity,
  extractPublishedRef,
  normalizeChubBaseUrl,
  parseChubErrorDetail,
  type ChubFetch,
} from './client';

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

const callsOf = (fetchFn: unknown): Array<[string, RequestInit]> =>
  (fetchFn as ReturnType<typeof vi.fn>).mock.calls as Array<[string, RequestInit]>;

describe('normalizeChubBaseUrl', () => {
  it('fills the scheme and strips trailing slashes', () => {
    expect(normalizeChubBaseUrl('')).toBe('https://gateway.chub.ai');
    expect(normalizeChubBaseUrl(undefined)).toBe('https://gateway.chub.ai');
    expect(normalizeChubBaseUrl('gateway.chub.ai')).toBe('https://gateway.chub.ai');
    expect(normalizeChubBaseUrl('https://gateway.chub.ai///')).toBe('https://gateway.chub.ai');
  });
});

describe('parseChubErrorDetail', () => {
  it('handles the string shape from 401 answers', () => {
    expect(parseChubErrorDetail({ detail: "Missing API Key. Expected in the 'Authorization' header." })).toBe(
      "Missing API Key. Expected in the 'Authorization' header.",
    );
  });

  it('joins FastAPI validation entries with their locations', () => {
    const detail = parseChubErrorDetail({
      detail: [{ type: 'int_parsing', loc: ['path', 'project_id'], msg: 'Input should be a valid integer' }],
    });
    expect(detail).toBe('path.project_id: Input should be a valid integer');
  });

  it('returns null for unusable bodies', () => {
    expect(parseChubErrorDetail(null)).toBeNull();
    expect(parseChubErrorDetail({})).toBeNull();
  });
});

describe('chubVerifyIdentity', () => {
  it('reads userinfo and merges an authenticated /api/self profile', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ identity: 'oid-1', username: 'maeve', scopes: ['openid'], credits: 42, subscription: 'Full' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 14398, name: 'Maeve', user_name: 'maeve', avatar_url: 'https://x/a.png' }),
      ) as unknown as ChubFetch;
    const identity = await chubVerifyIdentity({ token: 'tok', fetchFn });
    expect(identity.username).toBe('maeve');
    expect(identity.subscription).toBe('Full');
    expect(identity.credits).toBe(42);
    expect(identity.displayName).toBe('Maeve');
    expect(identity.accountId).toBe(14398);

    const [, init] = callsOf(fetchFn)[0]!;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer tok');
    expect(headers['ch-api-key']).toBe('tok');
  });

  it('skips the anonymous /api/self stub (negative id)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ identity: 'oid-2', username: 'someone', scopes: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: -22358, name: '', user_name: 'You' })) as unknown as ChubFetch;
    const identity = await chubVerifyIdentity({ token: 'tok', fetchFn });
    expect(identity.username).toBe('someone');
    expect(identity.accountId).toBeUndefined();
    expect(identity.displayName).toBeUndefined();
  });

  it('throws ChubApiError with the gateway message on 401', async () => {
    const fetchFn = (async () =>
      jsonResponse({ detail: "Missing API Key. Expected in the 'Authorization' header." }, 401)) as ChubFetch;
    const error = await chubVerifyIdentity({ token: 'bad', fetchFn }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ChubApiError);
    expect((error as ChubApiError).status).toBe(401);
    expect((error as ChubApiError).message).toContain('Missing API Key');
  });
});

describe('character create/update', () => {
  it('POSTs the create payload to /api/core/characters', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ message: 'ok', success: true })) as unknown as ChubFetch;
    const result = await chubCreateCharacter(
      { token: 'tok', fetchFn },
      { name: 'Alice', description: 'd', personality: 'p', scenario: 's', example_dialogs: 'e', first_message: 'f' },
    );
    expect(result.success).toBe(true);
    const [url, init] = callsOf(fetchFn)[0]!;
    expect(url).toBe('https://gateway.chub.ai/api/core/characters');
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as { name: string };
    expect(body.name).toBe('Alice');
  });

  it('PUTs the update payload to the character path', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ success: true })) as unknown as ChubFetch;
    await chubUpdateCharacter({ token: 'tok', fetchFn }, 'maeve', 'alice', { character_id: 7, personality: 'p' });
    const [url, init] = callsOf(fetchFn)[0]!;
    expect(url).toBe('https://gateway.chub.ai/api/core/characters/maeve/alice');
    expect(init.method).toBe('PUT');
  });

  it('surfaces validation failures as readable ChubApiError messages', async () => {
    const fetchFn = (async () =>
      jsonResponse(
        { detail: [{ type: 'missing', loc: ['body', 'first_message'], msg: 'Field required' }] },
        422,
      )) as ChubFetch;
    const error = await chubCreateCharacter(
      { token: 'tok', fetchFn },
      { name: 'x', description: '', personality: '', scenario: '', example_dialogs: '', first_message: '' },
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ChubApiError);
    expect((error as ChubApiError).message).toContain('body.first_message: Field required');
  });
});

describe('published-character resolution', () => {
  it('reads fullPath straight out of the create response when present', () => {
    const ref = extractPublishedRef({ message: 'ok', fullPath: 'maeve/alice-89fca9a6', id: 211500 }, 'Alice');
    expect(ref).toEqual({
      characterId: 211500,
      full_path: 'maeve/alice-89fca9a6',
      username: 'maeve',
      pathname: 'alice-89fca9a6',
      name: 'Alice',
    });
    expect(extractPublishedRef({ success: true }, 'Alice')).toBeNull();
  });

  it('falls back to a name search scoped to the publisher prefix', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        data: {
          nodes: [
            { id: 1, name: 'Alice', fullPath: 'someone-else/alice' },
            { id: 2, name: 'Alice', fullPath: 'maeve/alice-9f2', createdAt: '2026-01-01T00:00:00Z' },
          ],
        },
      }),
    ) as unknown as ChubFetch;
    const ref = await chubResolvePublished({ token: 'tok', fetchFn }, 'maeve', 'Alice', { success: true });
    expect(ref).toEqual({
      characterId: 2,
      full_path: 'maeve/alice-9f2',
      username: 'maeve',
      pathname: 'alice-9f2',
      name: 'Alice',
    });
    const [url] = callsOf(fetchFn)[0]!;
    expect(url).toContain('/search?');
    expect(url).toContain('search=Alice');
  });

  it('returns null when nothing matches', async () => {
    const fetchFn = (async () => jsonResponse({ data: { nodes: [] } })) as ChubFetch;
    expect(await chubResolvePublished({ token: 'tok', fetchFn }, 'maeve', 'Alice', {})).toBeNull();
  });
});

describe('chubMintProjectsToken', () => {
  it('extracts the token from known response fields', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ token: 'proj_abc' })) as unknown as ChubFetch;
    expect(await chubMintProjectsToken({ token: 'tok', fetchFn })).toBe('proj_abc');
    const [url, init] = callsOf(fetchFn)[0]!;
    expect(url).toBe('https://gateway.chub.ai/account/tokens/projects');
    expect(init.method).toBe('POST');
  });

  it('returns null when the shape is unrecognised', async () => {
    const fetchFn = (async () => jsonResponse({ unexpected: true })) as ChubFetch;
    expect(await chubMintProjectsToken({ token: 'tok', fetchFn })).toBeNull();
  });
});
