import { describe, expect, it } from 'vitest';
import {
  MAX_REMIX_SEED_LENGTH,
  MAX_REMIX_SEEDS,
  MAX_SEED_IDEAS,
  buildRemixedSeed,
  createSeedIdeaId,
  normalizeSeedIdeaRecord,
  normalizeTagList,
  upsertSeedIdea,
} from './seed-studio';

describe('buildRemixedSeed', () => {
  it('folds two seeds into one premise line', () => {
    expect(buildRemixedSeed(['a lonely space pirate', 'night court archivist'])).toBe(
      'a lonely space pirate — crossed with night court archivist',
    );
  });

  it('joins three and four seeds with the connector sequence', () => {
    expect(buildRemixedSeed(['one', 'two', 'three'])).toBe('one — crossed with two, and bound to three');
    expect(buildRemixedSeed(['one', 'two', 'three', 'four'])).toBe(
      'one — crossed with two, and bound to three; further tangled with four',
    );
  });

  it('deduplicates case-insensitively and normalizes whitespace', () => {
    expect(buildRemixedSeed(['Ash  road warden', 'ash road warden', ' другой '])).toBe(
      'Ash road warden — crossed with другой',
    );
  });

  it('caps at four seeds and truncates each to the length limit', () => {
    const long = 'x'.repeat(MAX_REMIX_SEED_LENGTH + 50);
    const five = ['one', 'two', 'three', 'four', 'five'];
    const remixed = buildRemixedSeed(five)!;
    expect(remixed).not.toContain('five');

    const truncated = buildRemixedSeed([long, 'short'])!;
    const firstSegment = truncated.split(' — crossed with')[0]!;
    expect(firstSegment.length).toBe(MAX_REMIX_SEED_LENGTH);
    expect(firstSegment.endsWith('…')).toBe(true);
    expect(MAX_REMIX_SEEDS).toBe(4);
  });

  it('returns undefined for fewer than two distinct seeds', () => {
    expect(buildRemixedSeed([])).toBeUndefined();
    expect(buildRemixedSeed(['only one'])).toBeUndefined();
    expect(buildRemixedSeed(['same', 'SAME'])).toBeUndefined();
  });
});

describe('seed ideas', () => {
  it('normalizes valid records and rejects incomplete ones', () => {
    const record = normalizeSeedIdeaRecord({
      id: ' idea-1 ',
      text: '  A duelist who  fears mirrors  ',
      tags: [' Fantasy ', 'fantasy', 42, 'SEAFARING'],
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(record).toEqual({
      id: 'idea-1',
      text: 'A duelist who fears mirrors',
      tags: ['fantasy', 'seafaring'],
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(normalizeSeedIdeaRecord({ id: 'x' })).toBeNull();
    expect(normalizeSeedIdeaRecord({ text: 'no id' })).toBeNull();
    expect(normalizeSeedIdeaRecord('nope')).toBeNull();
  });

  it('creates unique ids and upserts newest-first with a cap', () => {
    expect(createSeedIdeaId()).toMatch(/^idea-\d+-[a-z0-9]+$/);

    const base = [
      { id: 'a', text: 'A', tags: [], createdAt: '2026-09-01T00:00:00.000Z' },
      { id: 'b', text: 'B', tags: [], createdAt: '2026-09-02T00:00:00.000Z' },
    ];
    const added = upsertSeedIdea(base, { id: 'c', text: 'C', tags: ['x'], createdAt: '2026-09-03T00:00:00.000Z' });
    expect(added.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);

    const capped = upsertSeedIdea(
      Array.from({ length: MAX_SEED_IDEAS }, (_, index) => ({
        id: `id-${index}`,
        text: `Idea ${index}`,
        tags: [],
        createdAt: '2026-09-01T00:00:00.000Z',
      })),
      { id: 'newest', text: 'Newest', tags: [], createdAt: '2026-09-05T00:00:00.000Z' },
    );
    expect(capped).toHaveLength(MAX_SEED_IDEAS);
    expect(capped[0]?.id).toBe('newest');
  });

  it('normalizes tag lists by trimming, lowercasing, and deduplicating', () => {
    expect(normalizeTagList([' Fantasy ', 'fantasy', 'SEA faring', ''])).toEqual(['fantasy', 'sea faring']);
    expect(normalizeTagList('not-an-array')).toEqual([]);
  });
});
