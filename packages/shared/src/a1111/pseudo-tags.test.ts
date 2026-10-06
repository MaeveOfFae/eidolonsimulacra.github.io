import { describe, expect, it } from 'vitest';
import { A1111_QUALITY_TOKEN_ALLOWLIST, PSEUDO_TAG_CORRECTIONS } from './pseudo-tags';
import { loadCoreDanbooruTagIndex } from './core-index';

/**
 * The overlay is only trustworthy if it points at real tags: every correction target
 * must exist in the bundled core index, and no correction key may itself be canonical
 * (that would mean the "correction" is a no-op masking a stale entry). Running this
 * against the generated artifact also doubles as its smoke test.
 */
describe('PSEUDO_TAG_CORRECTIONS against the bundled core index', () => {
  it('corrects only to canonical Danbooru tags', async () => {
    const index = await loadCoreDanbooruTagIndex();
    const invalidTargets = Object.entries(PSEUDO_TAG_CORRECTIONS)
      .filter(([, target]) => !index.entries.has(target))
      .map(([pseudoTag, target]) => `${pseudoTag} → ${target}`);
    expect(invalidTargets).toEqual([]);
  });

  it('never lists a canonical tag as a pseudo-tag key', async () => {
    const index = await loadCoreDanbooruTagIndex();
    const canonicalKeys = Object.keys(PSEUDO_TAG_CORRECTIONS).filter((key) => index.entries.has(key));
    expect(canonicalKeys).toEqual([]);
  });

  it('covers the documented flagship correction', () => {
    expect(PSEUDO_TAG_CORRECTIONS.fiery_redhead).toBe('red_hair');
  });
});

describe('A1111_QUALITY_TOKEN_ALLOWLIST', () => {
  it('contains the common anime-checkpoint quality tokens', () => {
    expect(A1111_QUALITY_TOKEN_ALLOWLIST.has('masterpiece')).toBe(true);
    expect(A1111_QUALITY_TOKEN_ALLOWLIST.has('best_quality')).toBe(true);
    expect(A1111_QUALITY_TOKEN_ALLOWLIST.has('very_aesthetic')).toBe(true);
  });

  it('is stored in normalized booru form', () => {
    for (const token of A1111_QUALITY_TOKEN_ALLOWLIST) {
      expect(token).toBe(token.toLowerCase().replace(/\s+/g, '_'));
    }
  });
});
