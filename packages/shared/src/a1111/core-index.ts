/**
 * Loader for the bundled **core** Danbooru index (top tags by post count, no aliases).
 *
 * Deliberately isolated from `tag-index.ts` (and from the package's main export graph):
 * this module statically imports the ~280 KiB generated CSV, and tsup bundles with
 * `splitting: false`, so anything reachable from `src/index.ts` lands in `dist/index.js`
 * — which is the web app's eagerly-loaded shared chunk. Keeping this loader behind its
 * own entry (`@char-gen/shared/danbooru-core`) lets web pull it in via a dynamic import
 * (a lazy chunk, fetched only when the full index is unavailable) while mobile, which
 * has no static assets to fetch, bundles it directly.
 */
import { DANBOORU_TAGS_CORE_CSV } from '../generated/danbooru-tags.js';
import { buildDanbooruTagIndex, type DanbooruTagIndex } from './tag-index';

let cachedCore: DanbooruTagIndex | null = null;

/** The bundled core index (top tags, no aliases), parsed once and memoized. */
export function loadCoreDanbooruTagIndex(): Promise<DanbooruTagIndex> {
  cachedCore ??= buildDanbooruTagIndex(DANBOORU_TAGS_CORE_CSV);
  return Promise.resolve(cachedCore);
}
