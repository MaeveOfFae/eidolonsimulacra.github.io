import { type Draft, type Template } from '@char-gen/shared';
import {
  buildCompactReferenceAssets,
  normalizeConnectedReferenceIds,
  type ReferenceAssetLimits,
} from '@char-gen/shared';
import { DraftStorage } from '../storage/draft-db.js';
import type { ReferenceSuiteContext } from './builder.js';

export { normalizeConnectedReferenceIds };

const PREFERRED_REFERENCE_ASSET_ORDER = ['character_sheet', 'post_history', 'system_prompt'] as const;

type LoadReferenceSuitesOptions = ReferenceAssetLimits & {
  excludeIds?: string[];
  resolveTemplate?: (templateName?: string) => Template | undefined;
};

export async function loadReferenceSuites(
  draftIds: string[] | undefined,
  options: LoadReferenceSuitesOptions = {},
): Promise<ReferenceSuiteContext[]> {
  const normalizedDraftIds = normalizeConnectedReferenceIds(draftIds, {
    excludeIds: options.excludeIds,
  });

  if (normalizedDraftIds.length === 0) {
    return [];
  }

  const drafts = await Promise.all(normalizedDraftIds.map((draftId) => DraftStorage.getDraft(draftId)));

  return drafts
    .filter((draft): draft is Draft => Boolean(draft))
    .map((draft) => ({
      label: draft.metadata.character_name || draft.metadata.review_id,
      assets: buildCompactReferenceAssets(draft, {
        charLimits: options.charLimits,
        lineLimits: options.lineLimits,
        preferredAssetOrder: options.preferredAssetOrder ?? [...PREFERRED_REFERENCE_ASSET_ORDER],
        includeAssetPrefixes: options.includeAssetPrefixes,
        defaultCharLimit: options.defaultCharLimit,
        defaultLineLimit: options.defaultLineLimit,
      }),
      template: options.resolveTemplate?.(draft.metadata.template_name),
    }))
    .filter((suite) => Object.keys(suite.assets).length > 0);
}
