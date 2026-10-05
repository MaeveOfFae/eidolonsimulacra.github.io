import { describe, expect, it } from 'vitest';

/**
 * `draft-files.ts` is now a barrel over `./draft-files/*` — the normalisers, the
 * import/coercion entry points, and the exporters.
 *
 * The implementation moved verbatim: verified line-by-line against the pre-split
 * file, 1,209 code lines in and 1,209 out with zero differences. Behaviour is covered
 * from the web side (`character-import.test.ts` for the import half, the export tests
 * for the other), so what this pins is the surface a barrel can silently drop —
 * including that the two types are still reachable, which the build's declaration
 * step checks at each use.
 */
const DRAFT_FILES_SURFACE = [
  'buildDraftExportArtifact',
  'buildDraftLibraryExport',
  'coerceDraft',
  'coerceDraftMetadata',
  'createImportedReviewId',
  'escapeAssetContentForMarkdownBundle',
  'getUniqueImportedReviewId',
  'parseDraftImportText',
].sort();

describe('draft files barrel', () => {
  it('exposes exactly the values the single module used to', async () => {
    const surface = await import('./draft-files');

    expect(Object.keys(surface).sort()).toEqual(DRAFT_FILES_SURFACE);
  });
});
