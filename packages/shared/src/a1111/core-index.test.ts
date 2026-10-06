import { describe, expect, it } from 'vitest';
import { loadCoreDanbooruTagIndex } from './core-index';

/**
 * The core tier is the offline/mobile fallback for the a1111 tag linter, so the bundled
 * artifact must load and carry the shape the linter relies on.
 */
describe('loadCoreDanbooruTagIndex', () => {
  it('loads the bundled core artifact with the expected shape', async () => {
    const index = await loadCoreDanbooruTagIndex();
    expect(index.entries.get('1girl')).toMatchObject({ category: 0, deprecated: false });
    expect(index.entries.get('long_hair')).toBeTruthy();
    // The core tier ships canonical tags only; aliases ride with the fetched full tier.
    expect(index.aliases.size).toBe(0);
    expect(index.names.length).toBeGreaterThan(10_000);
  });
});
