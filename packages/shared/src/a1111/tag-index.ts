/**
 * Runtime lookup for the local Danbooru tag index.
 *
 * The index is built by `tools/generation/build-danbooru-index.mjs` in two tiers:
 * a compact **core** (top tags by post count) generated into
 * `packages/shared/src/generated/danbooru-tags.ts` and bundled with the app, and a
 * **full** index (`packages/web/public/danbooru/*.csv`) that web/desktop fetch lazily.
 * Both tiers use the same CSV row format — `name,category,post_count,deprecated` and
 * `alias,canonical` — so this module parses either.
 *
 * Aliases are chain-resolved at build time, so every value in the alias map is a
 * canonical name present in the paired tag table.
 */

export interface DanbooruTagEntry {
  name: string;
  /** Danbooru category: 0 general, 1 artist, 3 copyright, 4 character, 5 meta. */
  category: number;
  postCount: number;
  deprecated: boolean;
}

export interface DanbooruTagIndex {
  /** Canonical tag names, sorted ascending. */
  names: string[];
  entries: Map<string, DanbooruTagEntry>;
  /** Alias → canonical. Empty for the core tier (aliases ship with the full tier). */
  aliases: Map<string, string>;
}

const TAGS_HEADER = 'name,category,post_count,deprecated';
const ALIASES_HEADER = 'alias,canonical';

function splitCsvLines(csv: string): string[] {
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function parseDanbooruTagsCsv(csv: string): Map<string, DanbooruTagEntry> {
  const entries = new Map<string, DanbooruTagEntry>();
  for (const line of splitCsvLines(csv)) {
    if (line === TAGS_HEADER) {
      continue;
    }
    const [name, category, postCount, deprecated] = line.split(',');
    if (!name || category === undefined || postCount === undefined) {
      continue;
    }
    entries.set(name, {
      name,
      category: Number.parseInt(category, 10) || 0,
      postCount: Number.parseInt(postCount, 10) || 0,
      deprecated: deprecated === '1',
    });
  }
  return entries;
}

export function parseDanbooruAliasesCsv(csv: string): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const line of splitCsvLines(csv)) {
    if (line === ALIASES_HEADER) {
      continue;
    }
    const separator = line.indexOf(',');
    if (separator === -1) {
      continue;
    }
    const alias = line.slice(0, separator);
    const canonical = line.slice(separator + 1);
    if (alias && canonical && alias !== canonical) {
      aliases.set(alias, canonical);
    }
  }
  return aliases;
}

export function buildDanbooruTagIndex(tagsCsv: string, aliasesCsv?: string): DanbooruTagIndex {
  const entries = parseDanbooruTagsCsv(tagsCsv);
  const aliases = aliasesCsv ? parseDanbooruAliasesCsv(aliasesCsv) : new Map<string, string>();
  return {
    names: [...entries.keys()].sort(),
    entries,
    aliases,
  };
}

/** Booru normalization: lowercase, surrounding whitespace trimmed, inner runs → `_`. */
export function normalizeBooruTag(rawTag: string): string {
  return rawTag.trim().toLowerCase().replace(/\s+/g, '_');
}

export type BooruTagStatus = 'canonical' | 'alias' | 'unknown';

export interface BooruTagResolution {
  status: BooruTagStatus;
  /** The normalized tag as written in the asset. */
  tag: string;
  /** Canonical name when `status` is `canonical` or `alias`. */
  canonical: string | undefined;
  entry: DanbooruTagEntry | undefined;
}

export function resolveBooruTag(index: DanbooruTagIndex, rawTag: string): BooruTagResolution {
  const tag = normalizeBooruTag(rawTag);
  const direct = index.entries.get(tag);
  if (direct) {
    return { status: 'canonical', tag, canonical: tag, entry: direct };
  }
  const aliased = index.aliases.get(tag);
  if (aliased) {
    return { status: 'alias', tag, canonical: aliased, entry: index.entries.get(aliased) };
  }
  return { status: 'unknown', tag, canonical: undefined, entry: undefined };
}

/** Levenshtein distance that bails as soon as the bound is exceeded (returns bound + 1). */
function boundedLevenshtein(a: string, b: string, max: number): number {
  if (a === b) {
    return 0;
  }
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  let previous = Array.from({ length: b.length + 1 }, (_unused, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMinimum = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      const value = Math.min(substitution, previous[j]! + 1, current[j - 1]! + 1);
      current[j] = value;
      if (value < rowMinimum) {
        rowMinimum = value;
      }
    }
    if (rowMinimum > max) {
      return max + 1;
    }
    previous = current;
  }
  return previous[b.length]!;
}

export interface SimilarTagOptions {
  maxDistance?: number;
  limit?: number;
}

/** Near-miss canonical names for an unknown tag, best first (distance, then popularity). */
export function findSimilarTagNames(
  index: DanbooruTagIndex,
  rawTag: string,
  options: SimilarTagOptions = {},
): string[] {
  const maxDistance = options.maxDistance ?? 2;
  const limit = options.limit ?? 3;
  const target = normalizeBooruTag(rawTag);
  if (target.length === 0) {
    return [];
  }

  const candidates: Array<{ name: string; distance: number; postCount: number }> = [];
  for (const name of index.names) {
    if (name === target) {
      continue;
    }
    const distance = boundedLevenshtein(target, name, maxDistance);
    if (distance <= maxDistance) {
      candidates.push({ name, distance, postCount: index.entries.get(name)?.postCount ?? 0 });
    }
  }

  candidates.sort((a, b) => a.distance - b.distance || b.postCount - a.postCount || (a.name < b.name ? -1 : 1));
  return candidates.slice(0, limit).map((candidate) => candidate.name);
}
