/**
 * Character Card Import Parser
 *
 * Parses external character card formats (TavernAI/SillyTavern v1/v2, Chub AI,
 * PNG-embedded cards) and maps their fields plus Eidolon extension payloads back to
 * internal draft assets.
 *
 * This module is now a barrel: the implementation lives in
 * `./character-parser/`, split into reading the raw card, mapping fields (including
 * the lorebook and template aliases), and the per-format parsers.
 */
export { detectJsonFormat, isPngFilename, buildReverseMapping } from './character-parser/field-mapping';

export {
  parseTavernAICard,
  parseChubAICard,
  parseGenericCharacter,
  parsePlainTextContent,
  detectAndParseCharacter,
  formatSourceLabel,
} from './character-parser/parsers';
