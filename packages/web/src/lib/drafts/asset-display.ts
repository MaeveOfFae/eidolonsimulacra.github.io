/**
 * Display helpers shared across the draft screens.
 *
 * `formatAssetLabel` started life as a module-local helper in `Review.tsx`, and
 * `summarizeText` was copied into the review cards and the comparison helpers with two
 * different default lengths. These are now the single implementations the screens import.
 */

/** Turns an internal asset key (`intro_scene`) into a label (`intro scene`). */
export function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

/**
 * Collapses whitespace and truncates to `maxLength`, ending with an ellipsis.
 *
 * Callers that want more room pass their own limit, so this default is the one documented
 * behaviour rather than a per-file accident.
 */
export function summarizeText(content: string, maxLength = 120): string {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}
