import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultChubConfig, type ChubFetch, type Draft } from '@char-gen/shared';
import { runChubPublish, testChubConnection } from './publish';
import { describeChubError } from './transport';

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

const callsOf = (fetchFn: unknown): Array<[string, RequestInit]> =>
  (fetchFn as ReturnType<typeof vi.fn>).mock.calls as Array<[string, RequestInit]>;

const draft: Draft = {
  path: 'alice-draft',
  metadata: { review_id: 'r1', seed: 'abc123', favorite: false, character_name: 'Alice', mode: 'SFW' },
  assets: {
    character_sheet: 'Persona prose.',
    creator_notes: 'Notes prose.',
    intro_scene: 'Hey {{user}}, I am Alice.',
    post_history: '',
    system_prompt: '',
  },
};

const connectedConfig = () => ({
  ...createDefaultChubConfig(),
  api_token: 'sess-token',
  publish_token: '',
  username: 'maeve',
  verified_at: '2026-10-06T00:00:00.000Z',
});

const form = {
  name: 'Alice',
  tagline: '',
  scenario: '',
  tags: ['OC', 'SFW', 'student'],
  rating: 'SFW' as const,
  visibility: 'public' as const,
  alternateGreetings: [],
  version: '1.0',
};

/** JWT-shaped token with the given exp (seconds from epoch); signatures are never checked. */
const sessionJwtWithExp = (expSeconds: number): string => {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode({ exp: expSeconds })}.sig`;
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('testChubConnection', () => {
  it('requires a pasted token before doing anything', async () => {
    const fetchFn = vi.fn() as unknown as ChubFetch;
    const result = await testChubConnection(createDefaultChubConfig(), fetchFn);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Paste a Chub token');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('verifies identity, mints a scoped token once, and reports the account', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ identity: 'oid-1', username: 'maeve', scopes: [], credits: 42, subscription: 'Full' }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 14398, name: 'Maeve', user_name: 'maeve' }))
      .mockResolvedValueOnce(jsonResponse({ token: 'proj_abc' })) as unknown as ChubFetch;
    const result = await testChubConnection(connectedConfig(), fetchFn);
    expect(result.ok).toBe(true);
    expect(result.message).toBe('Connected as maeve · Full · 42 credits');
    expect(result.publishToken).toBe('proj_abc');
    expect(result.identity?.username).toBe('maeve');
  });

  it('does not mint again when a scoped token is already stored', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ identity: 'oid-1', username: 'maeve', scopes: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 5, name: 'Maeve', user_name: 'maeve' })) as unknown as ChubFetch;
    const result = await testChubConnection({ ...connectedConfig(), publish_token: 'proj_stored' }, fetchFn);
    expect(result.ok).toBe(true);
    expect(result.publishToken).toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('reports a rejected token with the gateway detail', async () => {
    const fetchFn = (async () =>
      jsonResponse({ detail: "Missing API Key. Expected in the 'Authorization' header." }, 401)) as ChubFetch;
    const result = await testChubConnection(connectedConfig(), fetchFn);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Settings → Chub');
    expect(result.message).toContain('Missing API Key');
  });

  it('short-circuits an expired session token before any request', async () => {
    const fetchFn = vi.fn() as unknown as ChubFetch;
    const expired = sessionJwtWithExp(Math.floor(Date.now() / 1000) - 60);

    const result = await testChubConnection({ ...connectedConfig(), api_token: expired }, fetchFn);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('expired');
    expect(result.message).toContain('URQL_TOKEN');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe('describeChubError', () => {
  it('shapes auth, rate-limit, network, and generic failures differently', () => {
    const auth = Object.assign(new Error('Chub answered HTTP 401'), { status: 401, detail: 'bad token' });
    expect(describeChubError(auth)).toContain('Paste a fresh URQL_TOKEN from chub.ai');
    const rate = Object.assign(new Error('429'), { status: 429, detail: null });
    expect(describeChubError(rate)).toContain('rate-limiting');
    expect(describeChubError(new TypeError('Failed to fetch'))).toContain('gateway.chub.ai');
    expect(describeChubError(new Error('plain boom'))).toBe('plain boom');
    expect(describeChubError('odd')).toBe('The Chub request failed.');
  });
});

describe('runChubPublish', () => {
  it('refuses to publish without a verified connection', async () => {
    await expect(
      runChubPublish({ config: createDefaultChubConfig(), draft, form, fetchFn: vi.fn() as unknown as ChubFetch }),
    ).rejects.toThrow(/Settings → Chub/);
    await expect(
      runChubPublish({
        config: { ...connectedConfig(), username: '' },
        draft,
        form,
        fetchFn: vi.fn() as unknown as ChubFetch,
      }),
    ).rejects.toThrow(/Verify the Chub connection/);
  });

  it('blocks preflight errors before any network call', async () => {
    const fetchFn = vi.fn() as unknown as ChubFetch;
    await expect(
      runChubPublish({
        config: connectedConfig(),
        draft: { ...draft, assets: { ...draft.assets, intro_scene: '' } },
        form,
        fetchFn,
      }),
    ).rejects.toThrow(/first message/i);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('creates, resolves via the username-scoped search fallback, and returns a record', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'ok', success: true }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: { nodes: [{ id: 211500, name: 'Alice', fullPath: 'maeve/alice-9f2' }] },
        }),
      ) as unknown as ChubFetch;
    const outcome = await runChubPublish({
      config: connectedConfig(),
      draft,
      form,
      fetchFn,
      now: '2026-10-06T12:00:00.000Z',
    });
    expect(outcome.status).toBe('created');
    expect(outcome.record).toMatchObject({
      character_id: 211500,
      full_path: 'maeve/alice-9f2',
      published_at: '2026-10-06T12:00:00.000Z',
    });
    expect(outcome.message).toContain('maeve/alice-9f2');
    const [createUrl] = callsOf(fetchFn)[0]!;
    expect(createUrl).toContain('/api/core/characters');
    const [searchUrl] = callsOf(fetchFn)[1]!;
    expect(searchUrl).toContain('/search?');
  });

  it('uses a fullPath carried by the create response without searching', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ success: true, fullPath: 'maeve/alice-x', id: 211501 }),
      ) as unknown as ChubFetch;
    const outcome = await runChubPublish({ config: connectedConfig(), draft, form, fetchFn });
    expect(outcome.record).toMatchObject({ full_path: 'maeve/alice-x', username: 'maeve', character_id: 211501 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('updates the recorded character instead of creating a duplicate', async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(jsonResponse({ success: true })) as unknown as ChubFetch;
    const previous = {
      character_id: 211500,
      username: 'maeve',
      pathname: 'alice-9f2',
      full_path: 'maeve/alice-9f2',
      name: 'Alice',
      published_at: '2026-10-01T00:00:00.000Z',
      version: '1.0',
    };
    const outcome = await runChubPublish({
      config: connectedConfig(),
      draft: { ...draft, metadata: { ...draft.metadata, chub_publish: previous } },
      form,
      fetchFn,
      now: '2026-10-06T12:00:00.000Z',
    });
    expect(outcome.status).toBe('updated');
    expect(outcome.record).toMatchObject({
      full_path: 'maeve/alice-9f2',
      published_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-06T12:00:00.000Z',
    });
    const [url, init] = callsOf(fetchFn)[0]!;
    expect(url).toBe('https://gateway.chub.ai/api/core/characters/maeve/alice-9f2');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(String(init.body)) as { character_id: number };
    expect(body.character_id).toBe(211500);
  });

  it('returns a non-throwing unresolved outcome when search cannot find the new character', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ data: { nodes: [] } })) as unknown as ChubFetch;
    const outcome = await runChubPublish({ config: connectedConfig(), draft, form, fetchFn });
    expect(outcome.status).toBe('created');
    expect(outcome.record).toBeNull();
    expect(outcome.message).toContain('do not publish again');
  });

  it('re-mints the scoped token and retries once when publish gets a 401', async () => {
    const calls: Array<[string, RequestInit]> = [];
    let createAttempts = 0;
    const fetchFn = vi.fn(async (url: string, init: RequestInit) => {
      calls.push([String(url), init]);
      if (String(url).includes('/account/tokens/projects')) {
        return jsonResponse({ token: 'fresh_scoped' });
      }
      if (String(url).includes('/api/core/characters')) {
        createAttempts += 1;
        if (createAttempts === 1) {
          return jsonResponse({ detail: 'token expired' }, 401);
        }
      }
      if (String(url).includes('/search')) {
        return jsonResponse({ data: { nodes: [] } });
      }
      return jsonResponse({ success: true });
    }) as unknown as ChubFetch;
    const refreshed: string[] = [];

    const outcome = await runChubPublish({
      config: { ...connectedConfig(), publish_token: 'proj_stored' },
      draft,
      form,
      fetchFn,
      onPublishTokenRefreshed: (publishToken) => refreshed.push(publishToken),
    });

    // The retry succeeded and the caller was handed the fresh scoped token.
    expect(outcome.status).toBe('created');
    expect(refreshed).toEqual(['fresh_scoped']);

    const createCalls = calls.filter(([url]) => url.includes('/api/core/characters'));
    expect(createCalls).toHaveLength(2);
    expect((createCalls[0]![1].headers as Record<string, string>).Authorization).toBe('Bearer proj_stored');
    expect((createCalls[1]![1].headers as Record<string, string>).Authorization).toBe('Bearer fresh_scoped');
  });

  it('does not re-mint when the session token itself is rejected', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ detail: 'expired' }, 401)) as unknown as ChubFetch;

    await expect(runChubPublish({ config: connectedConfig(), draft, form, fetchFn })).rejects.toThrow(/expired/);

    // No mint attempt: the pasted token was the one in flight, so a fresh
    // paste in Settings is the only real fix.
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
