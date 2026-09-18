import {
  MAX_CONNECTED_DRAFT_REFERENCES,
  type Draft,
  type Template,
} from '@char-gen/shared';
import { DraftStorage } from '../storage/draft-db.js';
import type { ReferenceSuiteContext } from './builder.js';

const PREFERRED_REFERENCE_ASSET_ORDER = [
  'character_sheet',
  'post_history',
  'system_prompt',
] as const;

const REFERENCE_ASSET_CHAR_LIMITS: Record<string, number> = {
  character_sheet: 1400,
  post_history: 500,
  system_prompt: 500,
  reference_summary: 360,
  default: 420,
};

const REFERENCE_ASSET_LINE_LIMITS: Record<string, number> = {
  character_sheet: 24,
  post_history: 8,
  system_prompt: 8,
  reference_summary: 6,
  default: 8,
};

interface LoadReferenceSuitesOptions {
  excludeIds?: string[];
  resolveTemplate?: (templateName?: string) => Template | undefined;
  preferredAssetOrder?: string[];
  includeAssetPrefixes?: string[];
}

function getReferenceAssetCharLimit(assetName: string): number {
  return REFERENCE_ASSET_CHAR_LIMITS[assetName] ?? REFERENCE_ASSET_CHAR_LIMITS.default;
}

function getReferenceAssetLineLimit(assetName: string): number {
  return REFERENCE_ASSET_LINE_LIMITS[assetName] ?? REFERENCE_ASSET_LINE_LIMITS.default;
}

function truncateReferenceAssetContent(assetName: string, content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return '';
  }

  const lineLimit = getReferenceAssetLineLimit(assetName);
  const charLimit = getReferenceAssetCharLimit(assetName);
  const allLines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  const selectedLines = allLines.slice(0, lineLimit);

  const compact = selectedLines.join('\n');
  if (compact.length <= charLimit && allLines.length <= lineLimit) {
    return compact;
  }

  const truncated = compact.slice(0, charLimit).trimEnd();
  return `${truncated}\n[truncated for reference]`;
}

function buildReferenceSummary(draft: Draft): string {
  const lines: string[] = [];
  const { metadata } = draft;

  lines.push(`name: ${metadata.character_name || metadata.review_id}`);
  if (metadata.template_name) {
    lines.push(`template: ${metadata.template_name}`);
  }
  if (metadata.mode) {
    lines.push(`mode: ${metadata.mode}`);
  }
  lines.push(`seed: ${metadata.seed}`);
  if (metadata.genre) {
    lines.push(`genre: ${metadata.genre}`);
  }
  if (metadata.notes?.trim()) {
    lines.push(`notes: ${metadata.notes.trim()}`);
  }

  return truncateReferenceAssetContent('reference_summary', lines.join('\n'));
}

function buildCompactReferenceAssets(draft: Draft, options: LoadReferenceSuitesOptions = {}): Record<string, string> {
  const assets: Record<string, string> = {};
  const summary = buildReferenceSummary(draft);
  if (summary) {
    assets.reference_summary = summary;
  }

  const preferredAssetOrder = options.preferredAssetOrder ?? [...PREFERRED_REFERENCE_ASSET_ORDER];
  for (const assetName of preferredAssetOrder) {
    const content = draft.assets[assetName];
    if (typeof content !== 'string' || content.trim().length === 0) {
      continue;
    }

    assets[assetName] = truncateReferenceAssetContent(assetName, content);
  }

  if (options.includeAssetPrefixes?.length) {
    const alreadyIncluded = new Set(Object.keys(assets));
    for (const [assetName, content] of Object.entries(draft.assets)) {
      if (alreadyIncluded.has(assetName)) {
        continue;
      }

      if (!options.includeAssetPrefixes.some((prefix) => assetName.startsWith(prefix))) {
        continue;
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        continue;
      }

      assets[assetName] = truncateReferenceAssetContent(assetName, content);
    }
  }

  if (Object.keys(assets).length > 1) {
    return assets;
  }

  const fallbackAsset = Object.entries(draft.assets).find(([, content]) => typeof content === 'string' && content.trim().length > 0);
  if (fallbackAsset) {
    const [assetName, content] = fallbackAsset;
    assets[assetName] = truncateReferenceAssetContent(assetName, content);
  }

  return assets;
}

export function normalizeConnectedReferenceIds(
  draftIds: string[] | undefined,
  options: { excludeIds?: string[] } = {}
): string[] {
  const excludedIds = new Set(
    (options.excludeIds ?? [])
      .filter((draftId): draftId is string => typeof draftId === 'string')
      .map((draftId) => draftId.trim())
      .filter(Boolean)
  );

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const draftId of draftIds ?? []) {
    if (typeof draftId !== 'string') {
      continue;
    }

    const normalizedId = draftId.trim();
    if (!normalizedId || excludedIds.has(normalizedId) || seen.has(normalizedId)) {
      continue;
    }

    seen.add(normalizedId);
    normalized.push(normalizedId);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized;
}

export async function loadReferenceSuites(
  draftIds: string[] | undefined,
  options: LoadReferenceSuitesOptions = {}
): Promise<ReferenceSuiteContext[]> {
  const normalizedDraftIds = normalizeConnectedReferenceIds(draftIds, {
    excludeIds: options.excludeIds,
  });

  if (normalizedDraftIds.length === 0) {
    return [];
  }

  const drafts = await Promise.all(
    normalizedDraftIds.map((draftId) => DraftStorage.getDraft(draftId))
  );

  return drafts
    .filter((draft): draft is Draft => Boolean(draft))
    .map((draft) => ({
      label: draft.metadata.character_name || draft.metadata.review_id,
      assets: buildCompactReferenceAssets(draft, options),
      template: options.resolveTemplate?.(draft.metadata.template_name),
    }))
    .filter((suite) => Object.keys(suite.assets).length > 0);
}