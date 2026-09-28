import type {
  Draft,
  DraftFilters,
  DraftListResponse,
  DraftMetadata,
  LineageNode,
  LineageResponse,
  SimilarityResult,
  Template,
  ValidationResponse,
} from './types';
import type { AssetName } from './parse/parse-blocks';
import { validateAssetContent } from './parse/parse-blocks';
import { getOrderedAssets, OFFICIAL_TEMPLATE } from './templates';

export function isArchivedDraft(metadata: DraftMetadata): boolean {
  return typeof metadata.archived_at === 'string' && metadata.archived_at.trim().length > 0;
}

export function buildDraftListResponse(
  metadata: DraftMetadata[],
  total: number,
  statsSource: DraftMetadata[] = metadata,
  archiveSource: DraftMetadata[] = statsSource,
): DraftListResponse {
  const stats = statsSource.reduce<DraftListResponse['stats']>(
    (accumulator, draft) => {
      accumulator.total_drafts += 1;
      if (isArchivedDraft(draft)) {
        accumulator.archived_drafts += 1;
      }
      if (draft.favorite) {
        accumulator.favorites += 1;
      }

      const genre = draft.genre || 'unknown';
      const mode = draft.mode || 'unknown';
      accumulator.by_genre[genre] = (accumulator.by_genre[genre] || 0) + 1;
      accumulator.by_mode[mode] = (accumulator.by_mode[mode] || 0) + 1;
      return accumulator;
    },
    {
      total_drafts: 0,
      archived_drafts: archiveSource.filter((draft) => isArchivedDraft(draft)).length,
      favorites: 0,
      by_genre: {},
      by_mode: {},
    },
  );

  return {
    drafts: metadata,
    total,
    stats,
  };
}

export function applyDraftFilters(metadata: DraftMetadata[], filters?: DraftFilters): DraftMetadata[] {
  let result = [...metadata];

  if (!filters?.include_archived) {
    if (filters?.archived) {
      result = result.filter((draft) => isArchivedDraft(draft));
    } else {
      result = result.filter((draft) => !isArchivedDraft(draft));
    }
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter((draft) =>
      [draft.character_name, draft.seed, draft.genre, draft.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  if (filters?.genre) {
    result = result.filter((draft) => draft.genre === filters.genre);
  }

  if (filters?.mode) {
    result = result.filter((draft) => draft.mode === filters.mode);
  }

  if (filters?.favorite !== undefined) {
    result = result.filter((draft) => draft.favorite === filters.favorite);
  }

  if (filters?.tags?.length) {
    result = result.filter((draft) => filters.tags?.every((tag) => draft.tags?.includes(tag)));
  }

  const sortOrder = filters?.sort_order === 'asc' ? 1 : -1;
  const sortBy = filters?.sort_by ?? 'modified';
  result.sort((left, right) => {
    const leftValue =
      sortBy === 'name'
        ? left.character_name || left.seed || ''
        : (sortBy === 'created' ? left.created : left.modified) || '';
    const rightValue =
      sortBy === 'name'
        ? right.character_name || right.seed || ''
        : (sortBy === 'created' ? right.created : right.modified) || '';
    return leftValue.localeCompare(rightValue) * sortOrder;
  });

  const offset = filters?.offset ?? 0;
  const limit = filters?.limit;
  if (limit !== undefined) {
    result = result.slice(offset, offset + limit);
  } else if (offset > 0) {
    result = result.slice(offset);
  }

  return result;
}

export interface ValidateDraftAssetsOptions {
  resolveTemplate?: (templateName?: string) => Template | undefined;
  fallbackTemplate?: Template;
}

export function validateDraftAssets(draft: Draft, options: ValidateDraftAssetsOptions = {}): ValidationResponse {
  const findings: string[] = [];
  const template =
    options.resolveTemplate?.(draft.metadata.template_name) || options.fallbackTemplate || OFFICIAL_TEMPLATE;
  const requiredAssets = getOrderedAssets(template).filter((asset) => asset.required);

  requiredAssets.forEach((asset) => {
    const content = draft.assets[asset.name];
    if (!content?.trim()) {
      findings.push(`- missing required asset ${asset.name}`);
    }
  });

  Object.entries(draft.assets).forEach(([assetName, content]) => {
    if (!content.trim()) {
      findings.push(`- ${assetName}: asset is empty`);
      return;
    }

    const issues = validateAssetContent(assetName as AssetName, content);
    if (issues.length > 0) {
      findings.push(`- ${assetName}: ${Array.from(new Set(issues)).join(', ')}`);
    }
  });

  if (findings.length === 0) {
    findings.push('OK: no obvious placeholder violations found in saved assets.');
  } else {
    findings.unshift('VALIDATION FAILED');
  }

  return {
    path: draft.metadata.review_id,
    output: findings.join('\n'),
    errors: '',
    exit_code: findings[0] === 'VALIDATION FAILED' ? 1 : 0,
    success: findings[0] !== 'VALIDATION FAILED',
  };
}

function tokenizeDraft(draft: Draft): Set<string> {
  const corpus =
    `${draft.metadata.character_name || ''}\n${draft.metadata.seed}\n${Object.values(draft.assets).join('\n')}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3);
  return new Set(corpus);
}

function toCompatibility(score: number): SimilarityResult['compatibility'] {
  if (score >= 0.7) {
    return 'high';
  }
  if (score >= 0.45) {
    return 'medium';
  }
  return 'low';
}

export function buildSimilarityResult(left: Draft, right: Draft): SimilarityResult {
  const leftTokens = tokenizeDraft(left);
  const rightTokens = tokenizeDraft(right);
  const common = [...leftTokens].filter((token) => rightTokens.has(token));
  const leftOnly = [...leftTokens].filter((token) => !rightTokens.has(token));
  const rightOnly = [...rightTokens].filter((token) => !leftTokens.has(token));
  const unionCount = new Set([...leftTokens, ...rightTokens]).size || 1;
  const score = common.length / unionCount;
  const conflictPotential = Math.min(1, (leftOnly.length + rightOnly.length) / Math.max(unionCount, 1));
  const synergyPotential = Math.min(1, score + 0.15);

  return {
    character1_name: left.metadata.character_name || left.metadata.seed,
    character2_name: right.metadata.character_name || right.metadata.seed,
    overall_score: score,
    compatibility: toCompatibility(score),
    conflict_potential: conflictPotential,
    synergy_potential: synergyPotential,
    commonalities: common.slice(0, 8),
    differences: [...leftOnly.slice(0, 4), ...rightOnly.slice(0, 4)],
    relationship_suggestions:
      score >= 0.6
        ? ['Shared themes suggest an easy alliance arc.', 'Overlapping traits support collaborative scenes.']
        : ['Use the contrast between their goals for tension.', 'Differences suggest rivalry or uneasy partnership.'],
    meta_analysis: {
      archetype_match: score,
      narrative_compatibility: synergyPotential,
      audience_appeal: Math.max(score, 0.35),
    },
  };
}

export function buildLineageResponse(metadata: DraftMetadata[]): LineageResponse {
  const childMap = new Map<string, string[]>();
  metadata.forEach((draft) => {
    draft.parent_drafts?.forEach((parentId) => {
      const children = childMap.get(parentId) ?? [];
      children.push(draft.review_id);
      childMap.set(parentId, children);
    });
  });

  const metadataMap = new Map(metadata.map((draft) => [draft.review_id, draft]));
  const generationCache = new Map<string, number>();
  const getGeneration = (reviewId: string): number => {
    if (generationCache.has(reviewId)) {
      return generationCache.get(reviewId)!;
    }
    const draft = metadataMap.get(reviewId);
    if (!draft?.parent_drafts?.length) {
      generationCache.set(reviewId, 0);
      return 0;
    }
    const generation = 1 + Math.max(...draft.parent_drafts.map((parentId) => getGeneration(parentId)));
    generationCache.set(reviewId, generation);
    return generation;
  };

  const nodes: LineageNode[] = metadata.map((draft) => {
    const parentIds = draft.parent_drafts ?? [];
    const childIds = childMap.get(draft.review_id) ?? [];
    const generation = getGeneration(draft.review_id);
    const parentNames = parentIds.map((parentId) => metadataMap.get(parentId)?.character_name || parentId);
    const childNames = childIds.map((childId) => metadataMap.get(childId)?.character_name || childId);

    return {
      id: draft.review_id,
      review_id: draft.review_id,
      draft_name: draft.seed,
      character_name: draft.character_name || draft.seed,
      generation,
      is_root: parentIds.length === 0,
      is_leaf: childIds.length === 0,
      offspring_type: draft.offspring_type,
      mode: draft.mode,
      model: draft.model,
      created: draft.created,
      parent_ids: parentIds,
      child_ids: childIds,
      parent_names: parentNames,
      child_names: childNames,
      sibling_names: parentIds
        .flatMap((parentId) => (childMap.get(parentId) ?? []).filter((id) => id !== draft.review_id))
        .map((id) => metadataMap.get(id)?.character_name || id),
      num_ancestors: parentIds.length,
      num_descendants: childIds.length,
    };
  });

  const roots = nodes.filter((node) => node.is_root).map((node) => node.id);
  const maxGeneration = nodes.reduce((max, node) => Math.max(max, node.generation), 0);

  return {
    nodes,
    roots,
    max_generation: maxGeneration,
    stats: {
      total_characters: nodes.length,
      root_characters: nodes.filter((node) => node.is_root).length,
      leaf_characters: nodes.filter((node) => node.is_leaf).length,
      generations: maxGeneration + 1,
    },
  };
}
