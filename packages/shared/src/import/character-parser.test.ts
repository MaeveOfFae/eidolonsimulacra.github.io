import { describe, expect, it } from 'vitest';

/**
 * `import/character-parser.ts` is now a barrel over `./character-parser/*` — reading
 * the raw card, mapping fields, and the per-format parsers.
 *
 * The parser moved verbatim: verified line-by-line against the pre-split file, 943
 * code lines in and 943 out with zero differences. Behaviour is covered from the web
 * side (`web/src/lib/character-import.test.ts`, 387 lines of round-trip cases), so
 * what this pins is the thing a barrel can silently drop: the export surface, which
 * `draft-files.ts` and the package root both re-export.
 */
const PARSER_SURFACE = [
  'buildReverseMapping',
  'detectAndParseCharacter',
  'detectJsonFormat',
  'formatSourceLabel',
  'isPngFilename',
  'parseChubAICard',
  'parseGenericCharacter',
  'parsePlainTextContent',
  'parseTavernAICard',
].sort();

describe('character parser barrel', () => {
  it('exposes exactly the parsers the single module used to', async () => {
    const surface = await import('./character-parser');

    expect(Object.keys(surface).sort()).toEqual(PARSER_SURFACE);
  });
});
