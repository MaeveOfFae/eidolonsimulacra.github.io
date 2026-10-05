/** Config for splitting `shared/src/import/character-parser.ts` (1,226 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/shared/src/import/character-parser.ts',
  dir: 'packages/shared/src/import/character-parser',
  // Shared's internals import without extensions.
  extension: '',
  barrelDoc: `/**
 * Character Card Import Parser
 *
 * Parses external character card formats (TavernAI/SillyTavern v1/v2, Chub AI,
 * PNG-embedded cards) and maps their fields plus Eidolon extension payloads back to
 * internal draft assets.
 *
 * This module is now a barrel: the implementation lives in
 * \`./character-parser/\`, split into reading the raw card, mapping fields (including
 * the lorebook and template aliases), and the per-format parsers.
 */
`,
  external: [
    {
      specifier: '../../types',
      typeOnly: true,
      names: [
        'CharacterCardMetadata',
        'CharacterImportOptions',
        'DraftMetadata',
        'ExportPreset',
        'ImportedCharacter',
        'ImportedCharacterFormat',
      ],
    },
    {
      specifier: '../../png-card',
      names: ['extractPngCharaChunk', 'parseEmbeddedPngBytes', 'pngBytesToDataUrl'],
    },
    {
      specifier: '../../templates',
      names: ['OFFICIAL_TEMPLATE', 'normalizeAssetName', 'normalizeAssetNameList', 'normalizeAssetRecord'],
    },
  ],
  modules: [
    {
      file: 'card-readers.ts',
      from: 24,
      to: 395,
      doc: 'Reading a raw card: the field readers, the Eidolon extension, and the asset builders every format shares.',
    },
    {
      file: 'field-mapping.ts',
      from: 396,
      to: 854,
      doc: 'Format detection, the TavernAI field map and reverse mapping, and the lorebook and template-alias formatting that turns card fields into assets.',
    },
    {
      file: 'parsers.ts',
      from: 855,
      to: 1226,
      doc: 'The per-format parsers — TavernAI, Chub AI, generic JSON and plain text — plus the entry point that detects and dispatches.',
    },
  ],
});

console.log(`character-parser.ts: ${result.exports} exports`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
