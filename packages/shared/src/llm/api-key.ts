/**
 * API key normalization and corruption detection.
 *
 * Shared by the engine factory and the provider engines so the same guard runs
 * whether a key is used for headers directly or through `buildProviderHeaders`.
 */

export function normalizeApiKeyValue(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');
}

const CORRUPTED_API_KEY_PATTERNS = [
  /^window\.fetch:/i,
  /cannot convert value in record<bytestring/i,
  /^bearer\s+window\.fetch:/i,
];

export function isInvalidApiKeyValue(value: string): boolean {
  if (!value) {
    return true;
  }

  if (/[^\x20-\x7E]/.test(value)) {
    return true;
  }

  if (/\r|\n/.test(value)) {
    return true;
  }

  return CORRUPTED_API_KEY_PATTERNS.some((pattern) => pattern.test(value));
}
