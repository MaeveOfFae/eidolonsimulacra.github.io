/** Config for splitting `shared/src/draft-files.ts` (1,433 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/shared/src/draft-files.ts',
  dir: 'packages/shared/src/draft-files',
  extension: '',
  barrelDoc: `/**
 * Reading drafts in from outside the app and writing them back out: the coercion of
 * untrusted input into \`Draft\`/\`DraftMetadata\`, the import text parser, and the
 * export artifact builders (JSON, PNG card, Chub-compatible card, markdown bundle,
 * PDF).
 *
 * This module is now a barrel: the implementation lives in \`./draft-files/\`, split
 * into the normalisers, the import/coercion entry points, and the exporters.
 */
`,
  external: [
    { specifier: '../import/character-parser', names: ['detectAndParseCharacter'] },
    { specifier: '../parse/parse-blocks', names: ['inferCharacterDisplayNameFromAssets'] },
    { specifier: '../png-card', names: ['buildPngCardBytes', 'parseEmbeddedPngBytes'] },
    { specifier: '../export/pdf', names: ['buildTextPdfDocument'] },
    {
      specifier: '../templates',
      names: ['OFFICIAL_TEMPLATE', 'normalizeAssetNameList', 'normalizeAssetRecord'],
    },
    {
      specifier: '../types',
      typeOnly: true,
      names: [
        'CharacterCardMetadata',
        'CharacterImportOptions',
        'Draft',
        'DraftAssetReviewScore',
        'DraftMergeHistoryEvent',
        'DraftMergeProvenance',
        'DraftMergeResolutionDetail',
        'DraftMetadata',
        'DraftReviewAnnotations',
        'DraftRevisionSnapshot',
        'DraftRevisionSnapshotState',
        'ExportFormat',
        'ImportedCharacter',
      ],
    },
    { specifier: '../types', names: ['MAX_CONNECTED_DRAFT_REFERENCES'] },
  ],
  modules: [
    {
      file: 'normalizers.ts',
      from: 23,
      to: 599,
      doc: 'The normalisers behind the public coercion: field-by-field readers for metadata, revision snapshots, merge history, card metadata and review annotations, each of which accepts unknown input and returns undefined rather than guessing.',
    },
    {
      file: 'importing.ts',
      from: 601,
      to: 984,
      doc: 'The entry points for bringing a draft in: review-id allocation, `coerceDraftMetadata` and `coerceDraft`, and the text importer that turns a pasted card into drafts.',
    },
    {
      file: 'exporting.ts',
      from: 986,
      to: 1433,
      doc: 'The exporters: resolving a draft into a portable artifact (JSON, PNG card, Chub-compatible card, markdown bundle, PDF) and the library bundle.',
    },
  ],
});

console.log(`draft-files.ts: ${result.exports} exports`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
