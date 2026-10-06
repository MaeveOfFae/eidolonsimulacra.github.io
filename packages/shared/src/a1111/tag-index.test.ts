import { describe, expect, it } from 'vitest';
import {
  buildDanbooruTagIndex,
  findSimilarTagNames,
  normalizeBooruTag,
  parseDanbooruAliasesCsv,
  parseDanbooruTagsCsv,
  resolveBooruTag,
} from './tag-index';

const FIXTURE_TAGS_CSV = `name,category,post_count,deprecated
1girl,0,6947596,0
blue_eyes,0,2046270,0
long_hair,0,5090058,0
red_hair,0,616651,0
twintails,0,440000,0
school_uniform,0,300000,0
smile,0,900000,0
retired_tag,0,120,1`;

const FIXTURE_ALIASES_CSV = `alias,canonical
twintail,twintails
ponytails,ponytail`;

describe('parseDanbooruTagsCsv', () => {
  it('parses rows into entries with category, post count and deprecation', () => {
    const entries = parseDanbooruTagsCsv(FIXTURE_TAGS_CSV);
    expect(entries.get('1girl')).toMatchObject({ category: 0, postCount: 6947596, deprecated: false });
    expect(entries.get('retired_tag')?.deprecated).toBe(true);
    expect(entries.has('name')).toBe(false);
  });

  it('skips malformed rows instead of throwing', () => {
    const entries = parseDanbooruTagsCsv('name,category,post_count,deprecated\nbroken\n,0,1,0');
    expect(entries.size).toBe(0);
  });
});

describe('parseDanbooruAliasesCsv', () => {
  it('maps alias → canonical and drops self-aliases', () => {
    const aliases = parseDanbooruAliasesCsv('alias,canonical\ntwintail,twintails\nself,self');
    expect(aliases.get('twintail')).toBe('twintails');
    expect(aliases.has('self')).toBe(false);
  });
});

describe('buildDanbooruTagIndex', () => {
  it('returns names sorted ascending', () => {
    const index = buildDanbooruTagIndex(FIXTURE_TAGS_CSV, FIXTURE_ALIASES_CSV);
    expect(index.names[0]).toBe('1girl');
    expect([...index.names]).toEqual([...index.names].sort());
    expect(index.aliases.get('twintail')).toBe('twintails');
  });
});

describe('normalizeBooruTag', () => {
  it('lowercases and converts whitespace runs to underscores', () => {
    expect(normalizeBooruTag('  Fiery   Redhead ')).toBe('fiery_redhead');
    expect(normalizeBooruTag('red_hair')).toBe('red_hair');
  });
});

describe('resolveBooruTag', () => {
  const index = buildDanbooruTagIndex(FIXTURE_TAGS_CSV, FIXTURE_ALIASES_CSV);

  it('recognizes canonical tags case-insensitively', () => {
    expect(resolveBooruTag(index, 'Red_Hair')).toMatchObject({ status: 'canonical', canonical: 'red_hair' });
  });

  it('resolves aliases to their canonical tag and entry', () => {
    expect(resolveBooruTag(index, 'twintail')).toMatchObject({
      status: 'alias',
      canonical: 'twintails',
    });
  });

  it('reports unknown tags without a canonical', () => {
    expect(resolveBooruTag(index, 'fiery_redhead')).toMatchObject({
      status: 'unknown',
      canonical: undefined,
    });
  });
});

describe('findSimilarTagNames', () => {
  it('suggests near misses ordered by distance then popularity', () => {
    const index = buildDanbooruTagIndex(FIXTURE_TAGS_CSV);
    expect(findSimilarTagNames(index, 'red_har')).toEqual(['red_hair']);
  });

  it('returns nothing for tokens with no near miss', () => {
    const index = buildDanbooruTagIndex(FIXTURE_TAGS_CSV);
    expect(findSimilarTagNames(index, 'zzzzzzzzzzzz')).toEqual([]);
  });
});
