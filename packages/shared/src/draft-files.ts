/**
 * Reading drafts in from outside the app and writing them back out: the coercion of
 * untrusted input into `Draft`/`DraftMetadata`, the import text parser, and the
 * export artifact builders (JSON, PNG card, Chub-compatible card, markdown bundle,
 * PDF).
 *
 * This module is now a barrel: the implementation lives in `./draft-files/`, split
 * into the normalisers, the import/coercion entry points, and the exporters.
 */
export {
  createImportedReviewId,
  getUniqueImportedReviewId,
  coerceDraftMetadata,
  coerceDraft,
  parseDraftImportText,
  escapeAssetContentForMarkdownBundle,
} from './draft-files/importing';
export type { DraftImportParseResult } from './draft-files/importing';

export { buildDraftExportArtifact, buildDraftLibraryExport } from './draft-files/exporting';
export type { DraftExportArtifact } from './draft-files/exporting';
