import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadA1111TagIndex, resetA1111TagIndexCache } from './a1111-tag-lint';

const FULL_TAGS_CSV = `name,category,post_count,deprecated
1girl,0,6947596,0
long_hair,0,5090058,0
red_hair,0,616651,0`;

const FULL_ALIASES_CSV = 'alias,canonical\ntwintail,twintails';

const textResponse = (body: string) => new Response(body, { status: 200 });

describe('loadA1111TagIndex', () => {
  beforeEach(() => {
    resetA1111TagIndexCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the full static index when both assets resolve', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('tags.csv')) {
        return textResponse(FULL_TAGS_CSV);
      }
      if (url.endsWith('tag-aliases.csv')) {
        return textResponse(FULL_ALIASES_CSV);
      }
      return new Response('not found', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { index, tier } = await loadA1111TagIndex();
    expect(tier).toBe('full');
    expect(index.entries.get('1girl')).toBeTruthy();
    expect(index.aliases.get('twintail')).toBe('twintails');
  });

  it('falls back to the bundled core index when the fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('offline', { status: 503 })),
    );

    const { index, tier } = await loadA1111TagIndex();
    expect(tier).toBe('core');
    expect(index.aliases.size).toBe(0);
    expect(index.entries.get('1girl')).toBeTruthy();
  });

  it('memoizes the load across calls', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('tags.csv') ? textResponse(FULL_TAGS_CSV) : textResponse(FULL_ALIASES_CSV),
    );
    vi.stubGlobal('fetch', fetchMock);

    await loadA1111TagIndex();
    await loadA1111TagIndex();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
