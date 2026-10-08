/**
 * Mobile lorebook generation logic.
 *
 * Deliberately pure so it can be unit-tested in the node Vitest environment:
 * every draft/blueprint lookup happens in `local/api.ts` and is passed in here.
 */

import {
  LOREBOOK_REFERENCE_ASSET_ORDER,
  LOREBOOK_REFERENCE_ASSET_PREFIXES,
  buildCompactReferenceAssets,
  buildLorebookUserPrompt,
  normalizeDraftReferenceIds,
  resolveBlueprintForFeature,
  type BlueprintList,
  type ChatMessage,
  type Draft,
  type ReferenceSuiteContext,
} from '@char-gen/shared';

// Re-exported so this module keeps exposing the same order/prefix constants it
// used to define locally — both now come from `@char-gen/shared`.
export { LOREBOOK_REFERENCE_ASSET_ORDER, LOREBOOK_REFERENCE_ASSET_PREFIXES };

export const DEFAULT_LOREBOOK_BLUEPRINT_PATH = 'blueprints/system/lorebook_generator.md';

export const DEFAULT_LOREBOOK_BLUEPRINT_FALLBACK =
  'Generate a connected lorebook/worldbook packet from the provided reference drafts. Extract shared canon, places, factions, events, and recurring pressure. Do not generate a new standalone character.';

export function normalizeLorebookFocus(focus: string | undefined): string | undefined {
  const trimmed = focus?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveLorebookBlueprintPath(
  featureBlueprints: { worldbook_generation?: string } | undefined,
  overridePath?: string,
): string {
  const trimmedOverride = overridePath?.trim();
  if (trimmedOverride) {
    return trimmedOverride;
  }

  const configured = featureBlueprints?.worldbook_generation?.trim();
  return configured || DEFAULT_LOREBOOK_BLUEPRINT_PATH;
}

/**
 * Resolves the lorebook blueprint path against the bundled catalog so the
 * preferred path is only honoured when it is actually tagged
 * `worldbook_generation`. Uses the shared ranking web relies on, so both
 * surfaces pick the same blueprint for the same catalog.
 */
export function resolveLorebookBlueprintPathFromCatalog(blueprintList: BlueprintList, preferredPath?: string): string {
  const blueprint = resolveBlueprintForFeature(blueprintList, 'worldbook_generation', preferredPath);
  return blueprint?.path || preferredPath || DEFAULT_LOREBOOK_BLUEPRINT_PATH;
}

export function resolveLorebookBlueprintContent(candidates: {
  requested?: string;
  catalog?: string;
  bundled?: string | null;
}): string {
  for (const candidate of [candidates.requested, candidates.catalog, candidates.bundled]) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return DEFAULT_LOREBOOK_BLUEPRINT_FALLBACK;
}

/**
 * Compact reference-draft context for the lorebook prompt. Drafts without usable
 * assets are dropped so the caller can report "not enough context" instead of
 * sending an empty prompt.
 */
export function buildLorebookReferenceSuites(drafts: readonly (Draft | null | undefined)[]): ReferenceSuiteContext[] {
  return drafts
    .filter((draft): draft is Draft => Boolean(draft))
    .map((draft) => ({
      label: draft.metadata.character_name || draft.metadata.review_id,
      assets: buildCompactReferenceAssets(draft, {
        preferredAssetOrder: LOREBOOK_REFERENCE_ASSET_ORDER,
        includeAssetPrefixes: LOREBOOK_REFERENCE_ASSET_PREFIXES,
      }),
    }))
    .filter((suite) => Object.keys(suite.assets).length > 0);
}

export function buildLorebookMessages(options: {
  referenceSuites: ReferenceSuiteContext[];
  blueprintContent: string;
  focus?: string;
}): ChatMessage[] {
  return [
    {
      role: 'system',
      content: options.blueprintContent,
    },
    {
      role: 'user',
      content: buildLorebookUserPrompt(options.referenceSuites, { focus: normalizeLorebookFocus(options.focus) }),
    },
  ];
}

export function countLorebookPacketEntries(content: string): number {
  return content.match(/\[\[ENTRY\]\]/g)?.length ?? 0;
}

/**
 * Normalizes the selected reference draft ids: trims, de-duplicates, and caps the
 * list at the shared `MAX_CONNECTED_DRAFT_REFERENCES` ceiling.
 */
export function normalizeLorebookReferenceIds(draftIds: string[] | undefined): string[] {
  return normalizeDraftReferenceIds(draftIds);
}

/**
 * Keeps only the packet's source draft ids that still exist locally, so a loaded
 * packet never selects ids the device cannot resolve.
 */
export function restoreKnownLorebookDraftIds(packetDraftIds: string[], knownDraftIds: Iterable<string>): string[] {
  const known = new Set(knownDraftIds);
  return normalizeLorebookReferenceIds(packetDraftIds).filter((draftId) => known.has(draftId));
}
