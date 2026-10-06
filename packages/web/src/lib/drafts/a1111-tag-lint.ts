/**
 * Web loader for the a1111 tag linter's Danbooru index.
 *
 * Two tiers, matching how the index is shipped (`tools/generation/build-danbooru-index.mjs`):
 * the **full** index (185k tags + alias table) is served from `public/danbooru/` and
 * fetched once per session on first lint; the **core** index (top 12k tags, no aliases)
 * is bundled inside `@char-gen/shared` and is the automatic fallback — offline, on a
 * stale deployment, or on mobile, linting still works, just without alias resolution.
 */
import { buildDanbooruTagIndex, lintA1111Tags, type A1111LintIssue, type DanbooruTagIndex } from '@char-gen/shared';

export type A1111TagIndexTier = 'full' | 'core';

export interface A1111TagIndexLoad {
  index: DanbooruTagIndex;
  tier: A1111TagIndexTier;
}

let cachedLoad: Promise<A1111TagIndexLoad> | null = null;

async function fetchFullTagIndex(): Promise<DanbooruTagIndex> {
  const base = import.meta.env.BASE_URL ?? '/';
  const [tagsResponse, aliasesResponse] = await Promise.all([
    fetch(`${base}danbooru/tags.csv`),
    fetch(`${base}danbooru/tag-aliases.csv`),
  ]);
  if (!tagsResponse.ok || !aliasesResponse.ok) {
    throw new Error(
      `Danbooru index assets unavailable (tags: ${tagsResponse.status}, aliases: ${aliasesResponse.status}).`,
    );
  }
  return buildDanbooruTagIndex(await tagsResponse.text(), await aliasesResponse.text());
}

/** Load the best available tag index: fetched full index, falling back to the bundled core. */
export function loadA1111TagIndex(): Promise<A1111TagIndexLoad> {
  cachedLoad ??= fetchFullTagIndex()
    .then((index): A1111TagIndexLoad => ({ index, tier: 'full' }))
    .catch(async (): Promise<A1111TagIndexLoad> => {
      // Dynamic on purpose: the subpath statically imports the ~280 KiB generated CSV,
      // so it must stay a lazy chunk rather than join the eagerly-loaded shared bundle.
      const { loadCoreDanbooruTagIndex } = await import('@char-gen/shared/danbooru-core');
      return { index: await loadCoreDanbooruTagIndex(), tier: 'core' };
    });
  return cachedLoad;
}

/** Test-only escape hatch for the memoized loader. */
export function resetA1111TagIndexCache(): void {
  cachedLoad = null;
}

export interface A1111TagLintState {
  issues: A1111LintIssue[];
  tier: A1111TagIndexTier | null;
  isReady: boolean;
  error: string | null;
}

export async function lintA1111Asset(content: string): Promise<A1111TagLintState & { tier: A1111TagIndexTier }> {
  const { index, tier } = await loadA1111TagIndex();
  return { issues: lintA1111Tags(content, index), tier, isReady: true, error: null };
}
