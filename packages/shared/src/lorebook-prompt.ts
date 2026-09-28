/**
 * Lorebook/worldbook prompt domain.
 *
 * Both surfaces synthesize the same packet from the same reference-draft context,
 * so the prompt contract and the reference-asset compaction rules live here rather
 * than being forked per surface. Each surface keeps only its own draft storage.
 */

import { buildAssetContextLines } from './prompt-utils';
import { getOrderedAssets } from './templates';
import { MAX_CONNECTED_DRAFT_REFERENCES, type Draft, type Template } from './types';

export interface ReferenceSuiteContext {
  label: string;
  assets: Record<string, string>;
  template?: Template;
}

export interface ReferenceAssetLimits {
  charLimits?: Record<string, number>;
  lineLimits?: Record<string, number>;
  preferredAssetOrder?: string[];
  includeAssetPrefixes?: string[];
  defaultCharLimit?: number;
  defaultLineLimit?: number;
}

export const DEFAULT_REFERENCE_ASSET_ORDER = ['character_sheet', 'post_history', 'system_prompt'];

export const DEFAULT_REFERENCE_ASSET_CHAR_LIMITS: Record<string, number> = {
  character_sheet: 1400,
  post_history: 500,
  system_prompt: 500,
  reference_summary: 360,
  default: 420,
};

export const DEFAULT_REFERENCE_ASSET_LINE_LIMITS: Record<string, number> = {
  character_sheet: 24,
  post_history: 8,
  system_prompt: 8,
  reference_summary: 6,
  default: 8,
};

export function getReferenceAssetCharLimit(assetName: string, limits: ReferenceAssetLimits = {}): number {
  const charLimits = limits.charLimits ?? DEFAULT_REFERENCE_ASSET_CHAR_LIMITS;
  return charLimits[assetName] ?? limits.defaultCharLimit ?? charLimits.default ?? 420;
}

export function getReferenceAssetLineLimit(assetName: string, limits: ReferenceAssetLimits = {}): number {
  const lineLimits = limits.lineLimits ?? DEFAULT_REFERENCE_ASSET_LINE_LIMITS;
  return lineLimits[assetName] ?? limits.defaultLineLimit ?? lineLimits.default ?? 8;
}

export function truncateReferenceAssetContent(
  assetName: string,
  content: string,
  limits: ReferenceAssetLimits = {},
): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return '';
  }

  const lineLimit = getReferenceAssetLineLimit(assetName, limits);
  const charLimit = getReferenceAssetCharLimit(assetName, limits);
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

export function buildReferenceSummary(draft: Draft, limits: ReferenceAssetLimits = {}): string {
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

  return truncateReferenceAssetContent('reference_summary', lines.join('\n'), limits);
}

export function buildCompactReferenceAssets(draft: Draft, options: ReferenceAssetLimits = {}): Record<string, string> {
  const assets: Record<string, string> = {};
  const summary = buildReferenceSummary(draft, options);
  if (summary) {
    assets.reference_summary = summary;
  }

  const preferredAssetOrder = options.preferredAssetOrder ?? [...DEFAULT_REFERENCE_ASSET_ORDER];
  for (const assetName of preferredAssetOrder) {
    const content = draft.assets[assetName];
    if (typeof content !== 'string' || content.trim().length === 0) {
      continue;
    }

    assets[assetName] = truncateReferenceAssetContent(assetName, content, options);
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

      assets[assetName] = truncateReferenceAssetContent(assetName, content, options);
    }
  }

  if (Object.keys(assets).length > 1) {
    return assets;
  }

  const fallbackAsset = Object.entries(draft.assets).find(
    ([, content]) => typeof content === 'string' && content.trim().length > 0,
  );
  if (fallbackAsset) {
    const [assetName, content] = fallbackAsset;
    assets[assetName] = truncateReferenceAssetContent(assetName, content, options);
  }

  return assets;
}

export function normalizeConnectedReferenceIds(
  draftIds: string[] | undefined,
  options: { excludeIds?: string[] } = {},
): string[] {
  const excludedIds = new Set(
    (options.excludeIds ?? [])
      .filter((draftId): draftId is string => typeof draftId === 'string')
      .map((draftId) => draftId.trim())
      .filter(Boolean),
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

function getOrderedTemplateAssetNames(template?: Template): string[] {
  if (!template) {
    return [];
  }

  const assets = getOrderedAssets(template);
  return assets.map((asset) => asset.name);
}

export function buildReferenceSuiteSection(
  label: string,
  suiteLabel: string,
  suiteAssets: Record<string, string>,
  template?: Template,
): string[] {
  const orderedNames = getOrderedTemplateAssetNames(template);
  const assetNames = orderedNames.length > 0 ? orderedNames : Object.keys(suiteAssets);
  const lines: string[] = [`\n## ${label}: ${suiteLabel}`];

  if (template) {
    lines.push(`Template: ${template.name} (${template.version})`);
  }

  assetNames.forEach((assetName) => {
    lines.push(...buildAssetContextLines(`### ${assetName}:`, assetName, suiteAssets[assetName] || ''));
  });

  return lines;
}

export function buildLorebookUserPrompt(
  referenceSuites: ReferenceSuiteContext[],
  options: { focus?: string } = {},
): string {
  const userLines: string[] = [
    `REFERENCE_DRAFT_COUNT: ${referenceSuites.length}`,
    'TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.',
    'CONSTRAINT: Do not generate a new standalone character. Extract connected canon, events, places, factions, moments, and recurring pressure instead.',
  ];

  if (options.focus?.trim()) {
    userLines.push('');
    userLines.push(`FOCUS: ${options.focus.trim()}`);
  }

  referenceSuites.forEach((suite, index) => {
    userLines.push(
      ...buildReferenceSuiteSection(`REFERENCE DRAFT ${index + 1}`, suite.label, suite.assets, suite.template),
    );
  });

  return userLines.join('\n');
}
