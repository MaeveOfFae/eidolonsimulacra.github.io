/**
 * Curated pseudo-tag corrections for the a1111 tag linter.
 *
 * Danbooru's own alias table catches renames (`twintail → twintails`), but LLM output
 * keeps inventing *pseudo-tags* — plausible-looking compound color/style names that are
 * not real booru tags and therefore carry no training signal (`fiery_redhead`,
 * `raven_hair`, `golden_hair`). The a1111 blueprint's rule is "choose a simpler common
 * visual tag instead of inventing a fake tag", and until now that correction has been
 * manual. This overlay automates it.
 *
 * Rules for entries here (enforced by `pseudo-tags.test.ts` against the generated core
 * index, so a stale or misspelled correction fails CI):
 *   - every key is NOT a canonical tag in the bundled core index,
 *   - every value IS a canonical tag in the bundled core index,
 *   - corrections are unambiguous (color family → the Danbooru color term), never a
 *     stylistic judgement call.
 */

/**
 * Pseudo-tag → canonical correction. Keys and values use normalized booru form
 * (lowercase, underscores). Both `fiery redhead` and `fiery_redhead` match after
 * `normalizeBooruTag` runs.
 */
export const PSEUDO_TAG_CORRECTIONS: Readonly<Record<string, string>> = {
  // Hair colour pseudo-tags → the Danbooru colour term
  fiery_redhead: 'red_hair',
  crimson_hair: 'red_hair',
  scarlet_hair: 'red_hair',
  raven_hair: 'black_hair',
  jet_black_hair: 'black_hair',
  obsidian_hair: 'black_hair',
  snow_hair: 'white_hair',
  snow_white_hair: 'white_hair',
  platinum_hair: 'white_hair',
  silver_hair: 'grey_hair',
  golden_hair: 'blonde_hair',
  honey_hair: 'blonde_hair',
  honey_blonde: 'blonde_hair',
  rose_hair: 'pink_hair',
  lavender_hair: 'purple_hair',
  violet_hair: 'purple_hair',
  lilac_hair: 'purple_hair',
  amber_hair: 'brown_hair',
  chestnut_hair: 'brown_hair',
  chocolate_hair: 'brown_hair',
  teal_hair: 'aqua_hair',

  // Eye colour pseudo-tags → the Danbooru colour term
  scarlet_eyes: 'red_eyes',
  ruby_eyes: 'red_eyes',
  emerald_eyes: 'green_eyes',
  sapphire_eyes: 'blue_eyes',
  violet_eyes: 'purple_eyes',

  // Clothing pseudo-tags → the Danbooru garment term
  frilly_dress: 'frilled_dress',
  frilly_skirt: 'frilled_skirt',
};

/**
 * Prompt tokens that are not Danbooru tags but are legitimate, widely used style /
 * quality tokens for anime SDXL checkpoints (Illustrious/NoobAI lineage). The linter
 * treats these as known so they do not raise "unknown tag" noise on the anchor line.
 * Normalized booru form (spaces → underscores).
 */
export const A1111_QUALITY_TOKEN_ALLOWLIST: ReadonlySet<string> = new Set([
  'masterpiece',
  'best_quality',
  'high_quality',
  'amazing_quality',
  'great_quality',
  'normal_quality',
  'very_aesthetic',
  'aesthetic',
  'highres',
  'absurdres',
  'ultra_detailed',
  'very_detailed',
  'intricate_details',
  'detailed',
  'recent_upload',
  'oldest',
  'score_9',
  'score_8_up',
  'score_7_up',
]);

/** Resolve a normalized tag through the curated overlay, if it matches. */
export function lookupPseudoTagCorrection(normalizedTag: string): string | undefined {
  return PSEUDO_TAG_CORRECTIONS[normalizedTag];
}

/** Is this normalized token a known style/quality token rather than a Danbooru tag? */
export function isA1111QualityToken(normalizedTag: string): boolean {
  return A1111_QUALITY_TOKEN_ALLOWLIST.has(normalizedTag);
}
