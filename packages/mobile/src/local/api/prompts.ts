/**
 * Prompt assembly: reference context, prior assets, imported source, and the per-asset, seed, similarity, offspring and chat message builders.
 *
 * Split out of `api.ts`, which is now a barrel over these modules.
 */
import {
  buildAssetContextBlock as buildSharedAssetContextBlock,
  getOrderedAssets,
  normalizeAssetNameList as normalizeSharedAssetNameList,
  selectRelevantPriorAssets,
  unwrapSingleCodeFence,
  type ChatMessage,
  type ChatRequest,
  type Draft,
  type GenerateRequest,
  type SeedGenerationRequest,
  type Template,
} from '@char-gen/shared';
import { getStoredDeviceConfig } from '../../storage/device-config';
import { getDraft } from '../draft-store';
import { getBlueprintCatalog, resolveTemplateBlueprintContent } from '../content-store';
import { getPromptAssetCharLimit, getPromptAssetLineLimit, normalizeModelOutput } from './config';

export async function buildReferenceContext(draftIds: string[] | undefined): Promise<string> {
  const normalizedIds = [...new Set((draftIds ?? []).map((draftId) => draftId.trim()).filter(Boolean))].slice(0, 4);
  if (normalizedIds.length === 0) {
    return '';
  }

  const drafts = await Promise.all(normalizedIds.map((draftId) => getDraft(draftId)));
  const relevantDrafts = drafts.filter((draft): draft is Draft => Boolean(draft));
  if (relevantDrafts.length === 0) {
    return '';
  }

  return relevantDrafts
    .map((draft) => {
      const preferredAssets = ['character_sheet', 'post_history', 'system_prompt'];
      const chosenAssets = preferredAssets.filter(
        (assetName) => typeof draft.assets[assetName] === 'string' && draft.assets[assetName].trim().length > 0,
      );
      const assetNames = chosenAssets.length > 0 ? chosenAssets : Object.keys(draft.assets).slice(0, 2);
      const assetBlocks = assetNames
        .map((assetName) =>
          buildAssetContextBlock(assetName, draft.assets[assetName] || '', {
            rawTextCharLimit: getPromptAssetCharLimit(assetName),
            rawTextLineLimit: getPromptAssetLineLimit(assetName),
          }),
        )
        .join('\n\n');
      return [
        `## Reference Draft: ${draft.metadata.character_name || draft.metadata.review_id}`,
        `Seed: ${draft.metadata.seed}`,
        draft.metadata.mode ? `Mode: ${draft.metadata.mode}` : '',
        assetBlocks,
      ]
        .filter(Boolean)
        .join('\n\n');
    })
    .join('\n\n');
}

export function resolveRelevantPriorAssets(
  template: Template,
  assetName: string,
  priorAssets: Record<string, string>,
): Record<string, string> {
  return selectRelevantPriorAssets(template, assetName, priorAssets);
}

export function buildAssetContextBlock(
  assetName: string,
  content: string,
  options: { rawTextCharLimit?: number; rawTextLineLimit?: number } = {},
): string {
  return buildSharedAssetContextBlock(assetName, content, {
    rawTextCharLimit: options.rawTextCharLimit ?? getPromptAssetCharLimit(assetName),
    rawTextLineLimit: options.rawTextLineLimit ?? getPromptAssetLineLimit(assetName),
  });
}

export function normalizeAssetNameList(names: readonly string[], template?: Template | string): string[] {
  return normalizeSharedAssetNameList(names, template);
}

export function getEffectiveDraftComponentSendOrder(
  draft: Pick<Draft, 'assets' | 'metadata'>,
  template: Template,
): string[] {
  const templateAssetNames = getOrderedAssets(template).map((asset) => asset.name);
  const defaultOrder = normalizeAssetNameList([...templateAssetNames, ...Object.keys(draft.assets)], template);
  const availableNames = new Set(defaultOrder);
  const savedOrder = normalizeAssetNameList(draft.metadata.component_send_order ?? [], template).filter((assetName) =>
    availableNames.has(assetName),
  );
  const seen = new Set(savedOrder);

  return [...savedOrder, ...defaultOrder.filter((assetName) => !seen.has(assetName))];
}

export function buildDraftPriorAssets(
  draft: Pick<Draft, 'assets' | 'metadata'>,
  targetAssetName: string,
  template: Template,
): Record<string, string> {
  const effectiveOrder = getEffectiveDraftComponentSendOrder(draft, template);
  const targetIndex = effectiveOrder.indexOf(targetAssetName);

  if (targetIndex <= 0) {
    return {};
  }

  const priorAssets: Record<string, string> = {};

  for (const assetName of effectiveOrder.slice(0, targetIndex)) {
    const content = draft.assets[assetName];
    if (typeof content === 'string' && content.trim().length > 0) {
      priorAssets[assetName] = content;
    }
  }

  return priorAssets;
}

export type ImportedSourceContext = {
  label: string;
  source: string;
  assets: Record<string, string>;
};

export type MobileGenerateRequest = GenerateRequest & {
  imported_source?: ImportedSourceContext;
  /** Checkpoint resume: assets already completed by an earlier interrupted run. */
  resume_assets?: Record<string, string>;
};

export function buildImportedSourceContext(
  template: Template,
  assetName: string,
  importedSource?: ImportedSourceContext,
): string {
  if (!importedSource) {
    return '';
  }

  const relevantAssets = resolveRelevantPriorAssets(template, assetName, importedSource.assets);
  const currentAsset = importedSource.assets[assetName];
  if (typeof currentAsset === 'string' && currentAsset.trim().length > 0) {
    relevantAssets[assetName] = currentAsset;
  }

  const orderedAssetNames = getOrderedAssets(template)
    .map((asset) => asset.name)
    .filter((candidate) => candidate in relevantAssets);
  const remainingAssetNames = Object.keys(relevantAssets).filter((candidate) => !orderedAssetNames.includes(candidate));
  const assetNames = [...orderedAssetNames, ...remainingAssetNames];

  if (assetNames.length === 0) {
    return '';
  }

  return [
    'IMPORTED CHARACTER SOURCE MATERIAL:',
    `Source label: ${importedSource.label}`,
    `Imported from: ${importedSource.source}`,
    'Treat the following imported card assets as source material for this rehash.',
    'Preserve compatible facts, tone, relationship logic, and constraints when they fit the active seed and blueprint.',
    'Do not copy them blindly as final output; rewrite them into the requested asset format.',
    '',
    ...assetNames.map((candidate) => buildAssetContextBlock(candidate, relevantAssets[candidate] || '')),
  ].join('\n');
}

export function buildPerAssetMessages(
  request: MobileGenerateRequest,
  template: Template,
  assetName: string,
  priorAssets: Record<string, string>,
  referenceContext: string,
  extraInstruction?: string,
): ChatMessage[] {
  const blueprintContent =
    resolveTemplateBlueprintContent(template.name, assetName) ||
    `Generate the ${assetName} asset for the active template.`;
  const relevantPriorAssets = resolveRelevantPriorAssets(template, assetName, priorAssets);

  const userLines: string[] = [
    `TEMPLATE: ${template.name}`,
    `TARGET ASSET: ${assetName}`,
    `TASK: Generate only the requested ${assetName} asset.`,
    'Do not regenerate, restate, or summarize any other asset unless it is quoted below as supporting context.',
  ];

  if (assetName === 'a1111') {
    userLines.push(
      'OUTPUT: Return only the final raw A1111 prompt lines. Do not write narration, scene prose, explanations, headings, labels, or code fences.',
    );
  }

  userLines.push('');
  userLines.push(`Mode: ${request.mode}`);
  userLines.push(`SEED: ${request.seed}`);

  if (extraInstruction) {
    userLines.push('');
    userLines.push('ADDITIONAL INSTRUCTIONS:');
    userLines.push(extraInstruction);
  }

  if (referenceContext) {
    userLines.push('');
    userLines.push('CONNECTED CHARACTER REFERENCES:');
    userLines.push(referenceContext);
  }

  const importedSourceContext = buildImportedSourceContext(template, assetName, request.imported_source);
  if (importedSourceContext) {
    userLines.push('');
    userLines.push(importedSourceContext);
  }

  if (Object.keys(relevantPriorAssets).length > 0) {
    userLines.push('');
    userLines.push('PRIOR ASSET CONTEXT:');
    Object.entries(relevantPriorAssets).forEach(([priorName, priorContent]) => {
      userLines.push(buildAssetContextBlock(priorName, priorContent));
    });
  }

  return [
    {
      role: 'system',
      content: `# BLUEPRINT: ${assetName}\n\n${blueprintContent}`,
    },
    {
      role: 'user',
      content: userLines.join('\n'),
    },
  ];
}

export function buildSeedMessages(request: SeedGenerationRequest): ChatMessage[] {
  const config = getStoredDeviceConfig();
  const blueprintPath =
    request.blueprint_path || config.feature_blueprints?.seed_generation || 'blueprints/system/seed_generator.md';
  const blueprintContent =
    request.blueprint_content ||
    getBlueprintCatalog().get(blueprintPath)?.content ||
    'Generate concise character seed ideas.';
  return [
    {
      role: 'system',
      content: `${blueprintContent}\n\nReturn only a newline-delimited list of concise seed ideas.`,
    },
    {
      role: 'user',
      content: request.surprise_mode
        ? 'Generate 8 surprising seed ideas spanning distinct tones and hooks.'
        : `Generate 8 seed ideas from the following genre or theme lines:\n${request.genre_lines}`,
    },
  ];
}

export function normalizeSeedLine(line: string): string {
  return unwrapSingleCodeFence(line)
    .replace(/^[-*•]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/^seed\s*:\s*/i, '')
    .trim();
}

export function parseSeedOutput(content: string): string[] {
  return normalizeModelOutput(content)
    .split(/\r?\n/)
    .map((line) => normalizeSeedLine(line))
    .filter(Boolean)
    .filter((line, index, values) => values.indexOf(line) === index);
}

export function buildSimilarityMessages(left: Draft, right: Draft): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'Compare two character drafts. Return concise relationship potential notes only, with no JSON and no extra headings.',
    },
    {
      role: 'user',
      content: [
        `Character 1: ${left.metadata.character_name || left.metadata.seed}`,
        left.assets.character_sheet || left.assets.intro_scene || left.metadata.seed,
        '',
        `Character 2: ${right.metadata.character_name || right.metadata.seed}`,
        right.assets.character_sheet || right.assets.intro_scene || right.metadata.seed,
      ].join('\n'),
    },
  ];
}

export function buildOffspringSeedMessages(parent1: Draft, parent2: Draft, mode: string): ChatMessage[] {
  const config = getStoredDeviceConfig();
  const blueprintPath = config.feature_blueprints?.offspring_generation || 'blueprints/system/offspring_generator.md';
  const blueprintContent =
    getBlueprintCatalog().get(blueprintPath)?.content || 'Generate a single offspring seed from two parent drafts.';
  return [
    {
      role: 'system',
      content: `${blueprintContent}\n\nReturn a single concise offspring seed with no commentary.`,
    },
    {
      role: 'user',
      content: [
        `Content mode: ${mode}`,
        `Parent 1: ${parent1.metadata.character_name || parent1.metadata.seed}`,
        parent1.assets.character_sheet || parent1.assets.intro_scene || parent1.metadata.seed,
        '',
        `Parent 2: ${parent2.metadata.character_name || parent2.metadata.seed}`,
        parent2.assets.character_sheet || parent2.assets.intro_scene || parent2.metadata.seed,
      ].join('\n'),
    },
  ];
}

export function buildChatMessages(request: ChatRequest, draft: Draft | null): ChatMessage[] {
  const contextParts = [
    draft ? `Current draft metadata: ${JSON.stringify(draft.metadata)}` : '',
    request.context_asset && draft?.assets[request.context_asset]
      ? `Focused asset (${request.context_asset}):\n${draft.assets[request.context_asset]}`
      : '',
    request.screen_context ? `Screen context: ${JSON.stringify(request.screen_context)}` : '',
  ].filter(Boolean);

  return [
    {
      role: 'system',
      content:
        'You are the in-app assistant for Eidolon Simulacra. Be concise and practical. Use the provided draft and screen context when relevant.',
    },
    ...(contextParts.length > 0 ? [{ role: 'system' as const, content: contextParts.join('\n\n') }] : []),
    ...request.messages,
  ];
}
