import {
  APIError,
  appendDraftRevisionSnapshot,
  applyDraftFilters,
  buildAssetContextBlock as buildSharedAssetContextBlock,
  buildDraftExportArtifact,
  buildDraftRevisionSnapshot,
  buildMissingTemplateBlueprintWarnings,
  buildStoredTemplateRecord,
  buildDraftListResponse,
  buildLineageResponse,
  buildSimilarityResult,
  createEngine,
  detectProviderFromModel,
  fetchProviderModels,
  getDefaultBaseUrl,
  getFallbackModels,
  getOrderedAssets,
  inferCharacterDisplayNameFromAssets,
  canonicalizeLegacyAssetName,
  normalizeAssetNameList as normalizeSharedAssetNameList,
  selectRelevantPriorAssets,
  stripReasoningArtifacts,
  unwrapSingleCodeFence,
  validateDraftAssets,
  validateTemplate,
  type ApiKeys,
  type Blueprint,
  type BlueprintList,
  type ChatMessage,
  type ChatRequest,
  type Config,
  type ConnectionTestRequest,
  type ConnectionTestResult,
  type CreateTemplateRequest,
  type DownloadResponse,
  type Draft,
  type DraftFilters,
  type DraftListResponse,
  type DraftMetadata,
  type ExportRequest,
  type ExportPresetSummary,
  type FinalizeGenerationRequest,
  type GenerateAssetRequest,
  type GenerateBatchRequest,
  type GenerateRequest,
  type GenerationComplete,
  type LineageResponse,
  type LLMProvider,
  type ModelsResponse,
  type OffspringRequest,
  type OptimizeTextRequest,
  type RefineRequest,
  type SeedGenerationRequest,
  type SeedGenerationResponse,
  type SimilarityRequest,
  type SimilarityResult,
  type Template,
  type TemplateBlueprintContentsResponse,
  type TemplateValidationResult,
  type UpdateTemplateRequest,
  type ValidatePathRequest,
  type ValidationResponse,
} from '@char-gen/shared';
import { Platform } from 'react-native';
import { getStoredDeviceConfig, updateStoredDeviceConfig } from '../storage/device-config';
import { deleteDraft, getAllMetadata, getDraft, saveDraft, updateAsset, updateMetadata } from './draft-store';
import {
  getAllTemplateRecords,
  getBlueprintCatalog,
  getBlueprintList,
  getBlueprintOverrides,
  getStoredTemplateRecord,
  getStoredTemplates,
  getTemplateBlueprintContents,
  getTemplateRecord,
  resolveTemplateBlueprintContent,
  resolveTemplateDefinition,
  saveBlueprintOverrides,
  saveStoredTemplates,
  type StoredTemplateRecord,
} from './content-store';
import { buildOptimizeTextMessages } from '@char-gen/shared';

type StreamEventType = 'status' | 'chunk' | 'complete' | 'error' | 'batch_start' | 'batch_complete' | 'batch_error';

type StreamEventMap = {
  status: { stage?: string; asset?: string; progress?: number };
  chunk: { content: string };
  complete:
    | GenerationComplete
    | { draft_id?: string; character_name?: string }
    | { content: string }
    | { status: 'done' };
  error: { error: string };
  batch_start: { index: number; seed: string };
  batch_complete: { index: number; seed: string; draft_id?: string; character_name?: string };
  batch_error: { index: number; seed: string; error: string };
};

export type LocalStreamEvent = {
  [EventType in StreamEventType]: {
    event: EventType;
    data: StreamEventMap[EventType];
  };
}[StreamEventType];

type StreamReader = (event: LocalStreamEvent) => void;

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
const EXPORT_PRESETS: ExportPresetSummary[] = [
  {
    name: 'Official PNG Character Card',
    path: 'png',
    format: 'png',
    description: 'Export a standard PNG character card with embedded V2/V3 card data.',
  },
  {
    name: 'Official V2/V3 Card JSON',
    path: 'json',
    format: 'json',
    description: 'Export a Chub-compatible V2/V3 character card JSON with Eidolon round-trip extensions.',
  },
  { name: 'text', path: 'text', format: 'text', description: 'Export draft assets as plain text sections.' },
  {
    name: 'combined',
    path: 'combined',
    format: 'combined',
    description: 'Export a markdown bundle with metadata and assets.',
  },
  {
    name: 'Printable PDF',
    path: 'pdf',
    format: 'pdf',
    description: 'Export a printable single-column PDF with metadata and every asset.',
  },
];

type CachedModelsEntry = {
  response: ModelsResponse;
  cachedAt: number;
};

const modelsCache = new Map<string, CachedModelsEntry>();

function slugifyFileName(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return sanitized || 'export';
}

function createDownload(content: string | Uint8Array, filename: string, contentType: string): DownloadResponse {
  return {
    blob: new Blob([content instanceof Uint8Array ? new Uint8Array(content) : content], { type: contentType }),
    filename,
    contentType,
  };
}

const PROMPT_ASSET_CHAR_LIMITS: Record<string, number> = {
  system_prompt: 500,
  post_history: 500,
  character_sheet: 1400,
  intro_scene: 700,
  creator_notes: 420,
  a1111: 360,
  reference_summary: 360,
  default: 420,
};

const PROMPT_ASSET_LINE_LIMITS: Record<string, number> = {
  system_prompt: 8,
  post_history: 8,
  character_sheet: 24,
  intro_scene: 10,
  creator_notes: 8,
  a1111: 6,
  reference_summary: 6,
  default: 8,
};

function getPromptAssetCharLimit(assetName: string): number {
  return PROMPT_ASSET_CHAR_LIMITS[canonicalizeLegacyAssetName(assetName)] ?? PROMPT_ASSET_CHAR_LIMITS.default;
}

function getPromptAssetLineLimit(assetName: string): number {
  return PROMPT_ASSET_LINE_LIMITS[canonicalizeLegacyAssetName(assetName)] ?? PROMPT_ASSET_LINE_LIMITS.default;
}

function normalizeModelOutput(content: string): string {
  return unwrapSingleCodeFence(stripReasoningArtifacts(content)).trim();
}

function createReviewId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveConfiguredProvider(config: Config): LLMProvider {
  if (config.engine_mode === 'explicit' && config.engine !== 'auto' && config.engine !== 'openai_compatible') {
    return config.engine as LLMProvider;
  }

  return detectProviderFromModel(config.model);
}

function getFallbackApiKey(apiKeys: ApiKeys): string | undefined {
  return Object.values(apiKeys).find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function getConfiguredBaseUrl(config: Config, provider: LLMProvider): string {
  const configured = config.base_url?.trim();
  return configured && configured.length > 0 ? configured : getDefaultBaseUrl(provider);
}

function createConfiguredEngine(config: Config = getStoredDeviceConfig()) {
  const provider = resolveConfiguredProvider(config);
  const apiKey = provider === 'ollama' ? undefined : config.api_keys[provider] || getFallbackApiKey(config.api_keys);

  if (provider !== 'ollama' && (!apiKey || apiKey.trim().length === 0)) {
    throw new APIError(400, `No API key configured for ${provider}`);
  }

  const baseUrl = getConfiguredBaseUrl(config, provider);
  return {
    provider,
    baseUrl,
    engine: createEngine({
      model: config.model,
      apiKey,
      apiKeys: config.api_keys as Record<string, string>,
      provider,
      baseUrl,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      timeout: MOBILE_PROVIDER_TIMEOUT_MS,
    }),
  };
}

async function buildReferenceContext(draftIds: string[] | undefined): Promise<string> {
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

function resolveRelevantPriorAssets(
  template: Template,
  assetName: string,
  priorAssets: Record<string, string>,
): Record<string, string> {
  return selectRelevantPriorAssets(template, assetName, priorAssets);
}

function buildAssetContextBlock(
  assetName: string,
  content: string,
  options: { rawTextCharLimit?: number; rawTextLineLimit?: number } = {},
): string {
  return buildSharedAssetContextBlock(assetName, content, {
    rawTextCharLimit: options.rawTextCharLimit ?? getPromptAssetCharLimit(assetName),
    rawTextLineLimit: options.rawTextLineLimit ?? getPromptAssetLineLimit(assetName),
  });
}

function normalizeAssetNameList(names: readonly string[], template?: Template | string): string[] {
  return normalizeSharedAssetNameList(names, template);
}

function getEffectiveDraftComponentSendOrder(draft: Pick<Draft, 'assets' | 'metadata'>, template: Template): string[] {
  const templateAssetNames = getOrderedAssets(template).map((asset) => asset.name);
  const defaultOrder = normalizeAssetNameList([...templateAssetNames, ...Object.keys(draft.assets)], template);
  const availableNames = new Set(defaultOrder);
  const savedOrder = normalizeAssetNameList(draft.metadata.component_send_order ?? [], template).filter((assetName) =>
    availableNames.has(assetName),
  );
  const seen = new Set(savedOrder);

  return [...savedOrder, ...defaultOrder.filter((assetName) => !seen.has(assetName))];
}

function buildDraftPriorAssets(
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

type ImportedSourceContext = {
  label: string;
  source: string;
  assets: Record<string, string>;
};

type MobileGenerateRequest = GenerateRequest & {
  imported_source?: ImportedSourceContext;
};

function buildImportedSourceContext(
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

function buildPerAssetMessages(
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

function buildSeedMessages(request: SeedGenerationRequest): ChatMessage[] {
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

function normalizeSeedLine(line: string): string {
  return unwrapSingleCodeFence(line)
    .replace(/^[-*•]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/^seed\s*:\s*/i, '')
    .trim();
}

function parseSeedOutput(content: string): string[] {
  return normalizeModelOutput(content)
    .split(/\r?\n/)
    .map((line) => normalizeSeedLine(line))
    .filter(Boolean)
    .filter((line, index, values) => values.indexOf(line) === index);
}

function buildSimilarityMessages(left: Draft, right: Draft): ChatMessage[] {
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

function buildOffspringSeedMessages(parent1: Draft, parent2: Draft, mode: string): ChatMessage[] {
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

function buildChatMessages(request: ChatRequest, draft: Draft | null): ChatMessage[] {
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

const PREFERS_NON_STREAMING_COMPLETIONS = Platform.OS !== 'web';
const MOBILE_PROVIDER_TIMEOUT_MS = 300000;

function isStreamingUnsupportedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('no response body') || message.includes('getreader') || message.includes('body stream');
}

async function collectStreamedContent(
  messages: ChatMessage[],
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void,
  onStatus?: (stage: string, progress?: number, asset?: string) => void,
  nativeProgress?: { start: number; end: number; asset?: string; maxTokens?: number },
): Promise<string> {
  const { engine } = createConfiguredEngine();

  if (PREFERS_NON_STREAMING_COMPLETIONS) {
    const progressStart = nativeProgress?.start ?? 0.28;
    const progressEnd = nativeProgress?.end ?? 0.68;
    let waitTicks = 0;
    const intervalId = setInterval(() => {
      waitTicks += 1;
      onStatus?.('provider_generating', Math.min(progressStart + waitTicks * 0.03, progressEnd), nativeProgress?.asset);
    }, 4000);

    try {
      onStatus?.('provider_generating', progressStart, nativeProgress?.asset);
      const result = await engine.generate(messages, { signal, maxTokens: nativeProgress?.maxTokens });
      const content = normalizeModelOutput(result.content);
      if (content) {
        onChunk?.(content);
      }
      return content;
    } finally {
      clearInterval(intervalId);
    }
  }

  let rawContent = '';
  let visibleContent = '';
  let streamUnsupported = false;

  try {
    for await (const chunk of engine.generateStream(messages, { signal, maxTokens: nativeProgress?.maxTokens })) {
      if (chunk.content) {
        rawContent += chunk.content;
        const nextVisibleContent = stripReasoningArtifacts(rawContent);
        const visibleDelta = nextVisibleContent.startsWith(visibleContent)
          ? nextVisibleContent.slice(visibleContent.length)
          : '';
        visibleContent = nextVisibleContent;
        if (visibleDelta) {
          onChunk?.(visibleDelta);
        }
      }

      if (chunk.done) {
        break;
      }
    }
  } catch (error) {
    if (!signal?.aborted && isStreamingUnsupportedError(error)) {
      streamUnsupported = true;
    } else {
      throw error;
    }
  }

  if ((!visibleContent.trim() || streamUnsupported) && !signal?.aborted) {
    const fallbackResult = await engine.generate(messages, { signal, maxTokens: nativeProgress?.maxTokens });
    visibleContent = stripReasoningArtifacts(fallbackResult.content);
    if (visibleContent) {
      onChunk?.(visibleContent);
    }
  }

  return normalizeModelOutput(visibleContent);
}

async function runGeneration(
  request: MobileGenerateRequest,
  options: {
    signal?: AbortSignal;
    onChunk?: (chunk: string) => void;
    onStatus?: (stage: string, progress?: number, asset?: string) => void;
    parentDraftIds?: string[];
    offspringType?: string;
    extraInstruction?: string;
  } = {},
): Promise<GenerationComplete> {
  const startedAt = Date.now();
  const template = resolveTemplateDefinition(request.template);
  if (!template) {
    throw new APIError(500, 'No local template is available for generation');
  }

  const orderedAssets = getOrderedAssets(template);
  if (orderedAssets.length === 0) {
    throw new APIError(500, `Template ${template.name} does not define any assets`);
  }

  const selectedAssetSet = new Set(
    (request.selected_assets ?? [])
      .map((assetName) => (typeof assetName === 'string' ? assetName.trim() : ''))
      .filter(Boolean),
  );
  const templateAssetsByName = new Map(template.assets.map((asset) => [asset.name, asset] as const));

  // Required assets are always generated.
  template.assets.filter((asset) => asset.required).forEach((asset) => selectedAssetSet.add(asset.name));

  // Ensure selected assets include their full dependency chain.
  const visitedAssetDependencies = new Set<string>();
  const includeDependencies = (assetName: string) => {
    if (visitedAssetDependencies.has(assetName)) {
      return;
    }

    visitedAssetDependencies.add(assetName);
    const asset = templateAssetsByName.get(assetName);
    if (!asset) {
      return;
    }

    asset.depends_on.forEach((dependencyName) => {
      selectedAssetSet.add(dependencyName);
      includeDependencies(dependencyName);
    });
  };
  Array.from(selectedAssetSet).forEach(includeDependencies);

  const generationAssets = orderedAssets.filter((asset) => selectedAssetSet.has(asset.name));
  if (generationAssets.length === 0) {
    throw new APIError(400, `No assets selected for generation in template ${template.name}`);
  }

  options.onStatus?.('loading_references', 0.08);
  const referenceContext = await buildReferenceContext(request.connected_draft_ids);
  const assets: Record<string, string> = {};
  const progressBase = 0.12;
  const progressSpan = 0.76;
  const configuredMaxTokens = Math.max(256, Math.round(getStoredDeviceConfig().max_tokens));

  for (let index = 0; index < generationAssets.length; index += 1) {
    const asset = generationAssets[index];
    const assetStart = progressBase + (index / generationAssets.length) * progressSpan;
    const assetEnd = progressBase + ((index + 1) / generationAssets.length) * progressSpan;
    const maxTokens = configuredMaxTokens;

    options.onStatus?.('building_asset_prompt', assetStart, asset.name);
    const messages = buildPerAssetMessages(
      request,
      template,
      asset.name,
      assets,
      referenceContext,
      options.extraInstruction,
    );
    options.onStatus?.('contacting_provider', Math.min(assetStart + 0.02, assetEnd), asset.name);
    const rawAssetContent = await collectStreamedContent(messages, options.signal, undefined, options.onStatus, {
      start: Math.min(assetStart + 0.04, assetEnd),
      end: Math.max(assetEnd - 0.01, assetStart + 0.04),
      asset: asset.name,
      maxTokens,
    });

    const assetContent =
      asset.name === 'a1111' ? rawAssetContent.trim() : unwrapSingleCodeFence(rawAssetContent).trim();

    if (!assetContent) {
      throw new APIError(502, `Generated asset ${asset.name} was empty`);
    }

    assets[asset.name] = assetContent;
    options.onStatus?.('asset_complete', assetEnd, asset.name);
    options.onChunk?.(`${index === 0 ? '' : '\n\n'}=== ${asset.name.toUpperCase()} ===\n${assetContent}`);
  }

  const reviewId = createReviewId();
  const characterName = inferCharacterDisplayNameFromAssets(assets) || request.seed;
  const config = getStoredDeviceConfig();

  options.onStatus?.('saving', 0.9);
  await saveDraft({
    path: reviewId,
    metadata: {
      review_id: reviewId,
      seed: request.seed,
      mode: request.mode,
      model: config.model,
      created: new Date(startedAt).toISOString(),
      modified: new Date().toISOString(),
      favorite: false,
      template_name: template.name,
      character_name: characterName,
      connected_drafts: request.connected_draft_ids?.length ? [...request.connected_draft_ids] : undefined,
      parent_drafts: options.parentDraftIds?.length ? [...options.parentDraftIds] : undefined,
      offspring_type: options.offspringType,
    },
    assets,
  });

  options.onStatus?.('complete', 1);

  return {
    draft_path: reviewId,
    draft_id: reviewId,
    character_name: characterName,
    duration_ms: Date.now() - startedAt,
  };
}

class LocalStream {
  private controller: AbortController | null = null;
  private readers: Set<StreamReader> = new Set();
  private onComplete: ((data: StreamEventMap['complete']) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor(
    private executor: (context: {
      emit: <EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]) => void;
      signal: AbortSignal;
    }) => Promise<void>,
  ) {}

  subscribe(callback: StreamReader): () => void {
    this.readers.add(callback);
    return () => this.readers.delete(callback);
  }

  onComplete_(callback: (data: StreamEventMap['complete']) => void): this {
    this.onComplete = callback;
    return this;
  }

  onError_(callback: (error: string) => void): this {
    this.onError = callback;
    return this;
  }

  async start(): Promise<void> {
    this.controller = new AbortController();
    try {
      await this.executor({
        emit: (event, data) => {
          const payload = { event, data } as LocalStreamEvent;
          this.readers.forEach((reader) => reader(payload));
          if (event === 'complete' && this.onComplete) {
            this.onComplete(data as StreamEventMap['complete']);
          }
          if (event === 'error' && this.onError) {
            this.onError((data as { error: string }).error);
          }
        },
        signal: this.controller.signal,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Local stream failed';
      this.readers.forEach((reader) => reader({ event: 'error', data: { error: message } }));
      this.onError?.(message);
    }
  }

  abort(): void {
    this.controller?.abort();
  }
}

export class MobileLocalAPI {
  getApiBaseUrl(): string {
    const config = getStoredDeviceConfig();
    const provider = resolveConfiguredProvider(config);
    return getConfiguredBaseUrl(config, provider);
  }

  async getConfig(): Promise<Config> {
    return getStoredDeviceConfig();
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    return updateStoredDeviceConfig(config);
  }

  async testConnection(request: ConnectionTestRequest): Promise<ConnectionTestResult> {
    const config = getStoredDeviceConfig();
    const provider = request.provider as LLMProvider;
    const apiKey = config.api_keys[provider] || getFallbackApiKey(config.api_keys);

    if (provider !== 'ollama' && !apiKey) {
      return { success: false, error: `No API key configured for ${request.provider}` };
    }

    const engine = createEngine({
      provider,
      model: request.model || config.model,
      apiKey,
      apiKeys: config.api_keys as Record<string, string>,
      baseUrl: request.base_url || getConfiguredBaseUrl(config, provider),
      temperature: config.temperature,
      maxTokens: config.max_tokens,
    });

    const result = await engine.testConnection();
    return {
      success: result.success,
      latency_ms: result.latencyMs,
      error: result.error,
      model_info: result.modelInfo
        ? { name: result.modelInfo.name, context_length: result.modelInfo.contextLength }
        : undefined,
    } as ConnectionTestResult;
  }

  async getModels(provider: string): Promise<ModelsResponse> {
    const typedProvider = provider as LLMProvider;
    const config = getStoredDeviceConfig();
    const baseUrl = getConfiguredBaseUrl(config, typedProvider);
    const apiKey = config.api_keys[typedProvider] || getFallbackApiKey(config.api_keys);
    const cacheKey = `${provider}|${baseUrl}|${apiKey ? 'auth' : 'anon'}`;
    const cached = modelsCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < MODEL_CACHE_TTL_MS) {
      return { ...cached.response, cached: true };
    }

    const fallbackModels = getFallbackModels(typedProvider);
    if (!apiKey) {
      return {
        provider,
        models: fallbackModels,
        cached: true,
        error: 'No API key configured for provider model lookup.',
      };
    }

    try {
      const response = await fetchProviderModels(typedProvider, apiKey, baseUrl, {
        includeContentTypeHeader: true,
      });
      modelsCache.set(cacheKey, { response, cachedAt: Date.now() });
      return response;
    } catch (error) {
      const response = {
        provider,
        models: fallbackModels,
        cached: true,
        error: error instanceof Error ? error.message : 'Failed to load models',
      };
      modelsCache.set(cacheKey, { response, cachedAt: Date.now() });
      return response;
    }
  }

  async refreshModels(provider: string): Promise<{ status: string; model_count: number; error?: string }> {
    const response = await this.getModels(provider);
    return { status: 'ok', model_count: response.models.length, error: response.error };
  }

  async generateSeeds(request: SeedGenerationRequest): Promise<SeedGenerationResponse> {
    const content = await collectStreamedContent(buildSeedMessages(request));
    const seeds = parseSeedOutput(content);
    return { seeds };
  }

  async getTemplates(): Promise<Template[]> {
    return getAllTemplateRecords().map((record) => record.template);
  }

  async listTemplates(): Promise<Template[]> {
    return this.getTemplates();
  }

  async getTemplate(name: string): Promise<Template> {
    const record = getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }
    return record.template;
  }

  async getTemplateBlueprintContents(name: string): Promise<TemplateBlueprintContentsResponse> {
    return getTemplateBlueprintContents(name);
  }

  async exportTemplate(name: string): Promise<DownloadResponse> {
    const record = getStoredTemplateRecord(name) ?? getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }

    return createDownload(JSON.stringify(record, null, 2), `${slugifyFileName(name)}.json`, 'application/json');
  }

  async importTemplateFromText(raw: string, sourceName = 'template.json'): Promise<Template> {
    const parsed = JSON.parse(raw) as Partial<StoredTemplateRecord & CreateTemplateRequest>;
    if ('template' in parsed && parsed.template) {
      const record = parsed as StoredTemplateRecord;
      return this.createTemplate({
        name: record.template.name,
        version: record.template.version,
        description: record.template.description,
        assets: record.template.assets,
        blueprint_contents: record.blueprint_contents,
      });
    }

    return this.createTemplate({
      name: parsed.name || sourceName.replace(/\.[^.]+$/, ''),
      version: parsed.version || '1.0',
      description: parsed.description || '',
      assets: parsed.assets || [],
      blueprint_contents: parsed.blueprint_contents || {},
    } as CreateTemplateRequest);
  }

  async createTemplate(template: CreateTemplateRequest): Promise<Template> {
    const records = getStoredTemplates();
    if (records.some((record) => record.template.name === template.name)) {
      throw new APIError(409, `Template ${template.name} already exists`);
    }

    const created = buildStoredTemplateRecord<StoredTemplateRecord>(template, {
      isDefault: false,
    });
    records.push(created);
    saveStoredTemplates(records);
    return created.template;
  }

  async updateTemplate(name: string, template: UpdateTemplateRequest): Promise<Template> {
    const records = getStoredTemplates();
    const index = records.findIndex((record) => record.template.name === name);
    if (index < 0) {
      throw new APIError(404, `Template ${name} not found`);
    }

    records[index] = buildStoredTemplateRecord<StoredTemplateRecord>(template, {
      isDefault: false,
      templateRoot: records[index].template_root,
    });
    saveStoredTemplates(records);
    return records[index].template;
  }

  async deleteTemplate(name: string): Promise<{ status: string; name: string }> {
    const builtIn = getTemplateRecord(name);
    if (builtIn?.template.is_official && !getStoredTemplateRecord(name)) {
      throw new APIError(400, `Cannot delete built-in template ${name}`);
    }

    const records = getStoredTemplates().filter((record) => record.template.name !== name);
    saveStoredTemplates(records);
    return { status: 'deleted', name };
  }

  async validateTemplate(name: string): Promise<TemplateValidationResult> {
    const record = getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }

    const validation = validateTemplate(record.template);
    const warnings = buildMissingTemplateBlueprintWarnings(record.template, (assetName) =>
      resolveTemplateBlueprintContent(record.template.name, assetName),
    );
    return { errors: validation.errors, warnings };
  }

  async getDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    const allMetadata = await getAllMetadata();
    const filtered = applyDraftFilters(allMetadata, filters);
    return buildDraftListResponse(filtered, filtered.length, filtered, allMetadata);
  }

  async listDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    return this.getDrafts(filters);
  }

  async getDraft(reviewId: string): Promise<Draft> {
    const draft = await getDraft(reviewId);
    if (!draft) {
      throw new APIError(404, `Draft ${reviewId} not found`);
    }
    return draft;
  }

  async createDraft(request: {
    seed: string;
    templateName: string;
    mode?: DraftMetadata['mode'];
    characterName?: string;
    genre?: string;
    notes?: string;
    tags?: string[];
    customInstructions?: string;
    componentSendOrder?: string[];
    connectedDraftIds?: string[];
    parentDraftIds?: string[];
    cardMetadata?: DraftMetadata['card_metadata'];
    reviewAnnotations?: DraftMetadata['review_annotations'];
    mergeProvenance?: DraftMetadata['merge_provenance'];
    mergeHistory?: DraftMetadata['merge_history'];
    assets?: Record<string, string>;
  }): Promise<Draft> {
    const seed = request.seed.trim();
    const templateName = request.templateName.trim();

    if (!seed) {
      throw new APIError(400, 'Seed is required');
    }

    if (!templateName) {
      throw new APIError(400, 'Template is required');
    }

    const reviewId = createReviewId();
    const config = getStoredDeviceConfig();
    const timestamp = new Date().toISOString();
    const draft: Draft = {
      path: reviewId,
      metadata: {
        review_id: reviewId,
        seed,
        mode: request.mode ?? 'Auto',
        model: config.model,
        created: timestamp,
        modified: timestamp,
        favorite: false,
        template_name: templateName,
        character_name: request.characterName?.trim() || seed,
        genre: request.genre?.trim() || undefined,
        notes: request.notes?.trim() || undefined,
        tags: (request.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
        custom_instructions: request.customInstructions?.trim() || undefined,
        component_send_order: request.componentSendOrder,
        connected_drafts: (request.connectedDraftIds ?? []).map((draftId) => draftId.trim()).filter(Boolean),
        parent_drafts: (request.parentDraftIds ?? []).map((draftId) => draftId.trim()).filter(Boolean),
        card_metadata: request.cardMetadata ? JSON.parse(JSON.stringify(request.cardMetadata)) : undefined,
        review_annotations: request.reviewAnnotations
          ? JSON.parse(JSON.stringify(request.reviewAnnotations))
          : undefined,
        merge_provenance: request.mergeProvenance ? JSON.parse(JSON.stringify(request.mergeProvenance)) : undefined,
        merge_history: request.mergeHistory ? JSON.parse(JSON.stringify(request.mergeHistory)) : undefined,
      },
      assets: request.assets ?? {},
    };

    await saveDraft(draft);
    return draft;
  }

  async createDraftSnapshot(
    reviewId: string,
    options: { label?: string; reason?: string } = {},
  ): Promise<{ status: 'created'; draft_id: string; snapshot_id: string }> {
    const draft = await this.getDraft(reviewId);
    const snapshot = buildDraftRevisionSnapshot(draft, {
      label: options.label ?? `${draft.metadata.character_name || draft.metadata.seed} restore point`,
      reason: options.reason,
    });

    await updateMetadata(reviewId, {
      revision_snapshots: appendDraftRevisionSnapshot(draft.metadata.revision_snapshots, snapshot),
    });

    return { status: 'created', draft_id: reviewId, snapshot_id: snapshot.id };
  }

  async restoreDraftSnapshot(
    reviewId: string,
    snapshotId: string,
  ): Promise<{ status: 'restored'; draft_id: string; snapshot_id: string }> {
    const draft = await this.getDraft(reviewId);
    const snapshot = draft.metadata.revision_snapshots?.find((entry) => entry.id === snapshotId);
    if (!snapshot) {
      throw new APIError(404, `Snapshot ${snapshotId} not found for draft ${reviewId}`);
    }

    const safeguardSnapshot = buildDraftRevisionSnapshot(draft, {
      label: `Before restore ${new Date().toLocaleString()}`,
      reason: `pre-restore:${snapshotId}`,
    });
    const nextSnapshots = appendDraftRevisionSnapshot(draft.metadata.revision_snapshots, safeguardSnapshot);
    const state = snapshot.state;

    await saveDraft({
      path: draft.path,
      metadata: {
        ...draft.metadata,
        seed: state.seed,
        mode: state.mode,
        model: state.model,
        tags: state.tags,
        genre: state.genre,
        notes: state.notes,
        favorite: state.favorite,
        character_name: state.character_name,
        template_name: state.template_name,
        parent_drafts: state.parent_drafts,
        connected_drafts: state.connected_drafts,
        offspring_type: state.offspring_type,
        custom_instructions: state.custom_instructions,
        component_send_order: state.component_send_order,
        card_metadata: state.card_metadata ? JSON.parse(JSON.stringify(state.card_metadata)) : undefined,
        review_annotations: state.review_annotations ? JSON.parse(JSON.stringify(state.review_annotations)) : undefined,
        merge_provenance: state.merge_provenance ? JSON.parse(JSON.stringify(state.merge_provenance)) : undefined,
        merge_history: state.merge_history ? JSON.parse(JSON.stringify(state.merge_history)) : undefined,
        revision_snapshots: nextSnapshots,
        modified: new Date().toISOString(),
      },
      assets: JSON.parse(JSON.stringify(state.assets)) as Draft['assets'],
    });

    return { status: 'restored', draft_id: reviewId, snapshot_id: snapshotId };
  }

  async saveDraft(draftId: string, updates: Partial<Draft>): Promise<Draft> {
    const current = await this.getDraft(draftId);
    const nextDraft: Draft = {
      path: current.path,
      metadata: {
        ...current.metadata,
        ...(updates.metadata ?? {}),
        review_id: current.metadata.review_id,
      },
      assets: {
        ...current.assets,
        ...(updates.assets ?? {}),
      },
    };
    return saveDraft(nextDraft);
  }

  async updateMetadata(
    reviewId: string,
    updates: Partial<DraftMetadata>,
  ): Promise<{ status: string; draft_id: string }> {
    await updateMetadata(reviewId, updates);
    return { status: 'updated', draft_id: reviewId };
  }

  async deleteDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    await deleteDraft(reviewId);
    return { status: 'deleted', draft_id: reviewId };
  }

  async updateAsset(
    reviewId: string,
    assetName: string,
    content: string,
  ): Promise<{ status: 'created' | 'updated'; draft_id: string; asset_name: string }> {
    const status = await updateAsset(reviewId, assetName, content);
    return { status, draft_id: reviewId, asset_name: assetName };
  }

  async validateDraft(reviewId: string): Promise<ValidationResponse> {
    const draft = await this.getDraft(reviewId);
    return validateDraftAssets(draft, { resolveTemplate: resolveTemplateDefinition });
  }

  async validatePath(request: ValidatePathRequest): Promise<ValidationResponse> {
    const reviewId = request.path.trim().replace(/^drafts\//, '');
    const draft = await getDraft(reviewId);
    if (!draft) {
      return {
        path: request.path,
        output: 'VALIDATION FAILED\n- Local mobile validation only supports saved draft review IDs.',
        errors: '',
        exit_code: 1,
        success: false,
      };
    }
    return validateDraftAssets(draft, { resolveTemplate: resolveTemplateDefinition });
  }

  generate(request: MobileGenerateRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      emit('status', { stage: 'initializing', progress: 0.05 });
      const result = await runGeneration(request, {
        signal,
        onChunk: (content) => emit('chunk', { content }),
        onStatus: (stage, progress, asset) => emit('status', { stage, progress, asset }),
      });
      if (!signal.aborted) {
        emit('complete', result);
      }
    });
  }

  async finalizeGeneration(request: FinalizeGenerationRequest): Promise<GenerationComplete> {
    const reviewId = createReviewId();
    const characterName = inferCharacterDisplayNameFromAssets(request.assets) || request.seed;
    const config = getStoredDeviceConfig();
    await saveDraft({
      path: reviewId,
      metadata: {
        review_id: reviewId,
        seed: request.seed,
        mode: request.mode,
        model: config.model,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        favorite: false,
        template_name: request.template,
        character_name: characterName,
      },
      assets: request.assets,
    });

    return {
      draft_path: reviewId,
      draft_id: reviewId,
      character_name: characterName,
      duration_ms: 0,
    };
  }

  generateBatch(seeds: string[], request: Omit<GenerateBatchRequest, 'seeds'>): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const runSeed = async (seed: string, index: number) => {
        emit('batch_start', { index, seed });
        try {
          const result = await runGeneration(
            {
              seed,
              mode: request.mode,
              template: request.template,
              selected_assets: request.selected_assets,
              connected_draft_ids: request.connected_draft_ids,
            },
            { signal },
          );
          emit('batch_complete', {
            index,
            seed,
            draft_id: result.draft_id,
            character_name: result.character_name,
          });
        } catch (error) {
          emit('batch_error', {
            index,
            seed,
            error: error instanceof Error ? error.message : 'Batch generation failed',
          });
        }
      };

      if (request.parallel) {
        let nextIndex = 0;
        const workerCount = Math.min(Math.max(request.max_concurrent ?? 3, 1), seeds.length || 1);
        await Promise.all(
          Array.from({ length: workerCount }, async () => {
            while (!signal.aborted) {
              const index = nextIndex;
              nextIndex += 1;
              if (index >= seeds.length) {
                return;
              }
              await runSeed(seeds[index], index);
            }
          }),
        );
      } else {
        for (let index = 0; index < seeds.length; index += 1) {
          if (signal.aborted) {
            return;
          }
          await runSeed(seeds[index], index);
        }
      }

      if (!signal.aborted) {
        emit('complete', { status: 'done' });
      }
    });
  }

  async getLineage(): Promise<LineageResponse> {
    return buildLineageResponse(await getAllMetadata());
  }

  async compareCharacters(
    request: SimilarityRequest & { mode?: string; use_llm?: boolean },
  ): Promise<SimilarityResult> {
    const left = await this.getDraft(request.draft1_id);
    const right = await this.getDraft(request.draft2_id);
    const baseResult = buildSimilarityResult(left, right);

    if (!request.use_llm && !request.include_llm_analysis) {
      return baseResult;
    }

    try {
      const analysis = await collectStreamedContent(buildSimilarityMessages(left, right));
      return {
        ...baseResult,
        llm_analysis: {
          relationship_potential: analysis || 'LLM analysis unavailable.',
          conflict_areas: baseResult.differences.slice(0, 4),
          synergy_areas: baseResult.commonalities.slice(0, 4),
          story_hooks: baseResult.relationship_suggestions.slice(0, 4),
        },
      };
    } catch {
      return baseResult;
    }
  }

  generateOffspring(request: OffspringRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const parent1 = await this.getDraft(request.parent1_id);
      const parent2 = await this.getDraft(request.parent2_id);
      emit('status', { stage: 'deriving_seed' });
      const seedOutput = await collectStreamedContent(
        buildOffspringSeedMessages(parent1, parent2, request.mode),
        signal,
        undefined,
        (stage, progress, asset) => emit('status', { stage, progress, asset }),
      );
      const derivedSeed = parseSeedOutput(seedOutput)[0] || `${parent1.metadata.seed} / ${parent2.metadata.seed}`;
      emit('chunk', { content: `Derived offspring seed: ${derivedSeed}\n\n` });

      const result = await runGeneration(
        {
          seed: derivedSeed,
          mode: request.mode,
          template: request.template,
          connected_draft_ids: [request.parent1_id, request.parent2_id],
        },
        {
          signal,
          parentDraftIds: [request.parent1_id, request.parent2_id],
          offspringType: 'blended',
          extraInstruction:
            'Treat the generated character as offspring derived from the provided parent drafts and preserve inherited contrasts or overlaps where relevant.',
          onChunk: (content) => emit('chunk', { content }),
          onStatus: (stage, progress, asset) => emit('status', { stage, progress, asset }),
        },
      );

      if (!signal.aborted) {
        emit('complete', { draft_id: result.draft_id, character_name: result.character_name });
      }
    });
  }

  async getExportPresets(): Promise<ExportPresetSummary[]> {
    return EXPORT_PRESETS;
  }

  async exportDraft(request: ExportRequest): Promise<DownloadResponse> {
    const draft = await this.getDraft(request.draft_id);
    const preset =
      request.preset === 'text' || request.preset === 'combined' || request.preset === 'png' || request.preset === 'pdf'
        ? request.preset
        : 'json';
    const includeMetadata = request.include_metadata !== false;
    const fileBase = slugifyFileName(draft.metadata.character_name || draft.metadata.seed || draft.metadata.review_id);
    const artifact = buildDraftExportArtifact(draft, preset, includeMetadata);

    return createDownload(artifact.content, `${fileBase}.${artifact.extension}`, artifact.contentType);
  }

  async getBlueprints(): Promise<BlueprintList> {
    return getBlueprintList();
  }

  async getBlueprint(path: string): Promise<Blueprint> {
    const blueprint = getBlueprintCatalog().get(path);
    if (!blueprint) {
      throw new APIError(404, `Blueprint ${path} not found`);
    }
    return blueprint;
  }

  async updateBlueprint(path: string, content: string): Promise<Blueprint> {
    const overrides = getBlueprintOverrides();
    overrides[path] = content;
    saveBlueprintOverrides(overrides);
    return this.getBlueprint(path);
  }

  chat(request: ChatRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const draft = request.draft_id ? await getDraft(request.draft_id) : null;
      const messages = buildChatMessages(request, draft);
      const fullContent = await collectStreamedContent(messages, signal, (content) => emit('chunk', { content }));
      if (!signal.aborted) {
        emit('complete', { content: fullContent });
      }
    });
  }

  generateAssetVariant(
    request: Pick<GenerateAssetRequest, 'asset_name' | 'additional_instructions'> & { draft_id: string },
  ): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const draft = await this.getDraft(request.draft_id);
      const template = resolveTemplateDefinition(draft.metadata.template_name);
      if (!template) {
        throw new APIError(500, 'This draft template is not available locally for asset generation');
      }

      if (!template.assets.some((asset) => asset.name === request.asset_name)) {
        throw new APIError(404, `Asset ${request.asset_name} is not part of template ${template.name}`);
      }

      const extraInstructions = [draft.metadata.custom_instructions, ...(request.additional_instructions ?? [])]
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .join('\n\n');

      emit('status', { stage: 'building_asset_prompt', progress: 0.14, asset: request.asset_name });

      const messages = buildPerAssetMessages(
        {
          seed: draft.metadata.seed,
          mode: draft.metadata.mode ?? 'Auto',
          template: template.name,
        },
        template,
        request.asset_name,
        buildDraftPriorAssets(draft, request.asset_name, template),
        '',
        extraInstructions || undefined,
      );

      emit('status', { stage: 'contacting_provider', progress: 0.2, asset: request.asset_name });

      const rawAssetContent = await collectStreamedContent(
        messages,
        signal,
        (content) => emit('chunk', { content }),
        (stage, progress, asset) => emit('status', { stage, progress, asset }),
        {
          start: 0.24,
          end: 0.84,
          asset: request.asset_name,
          maxTokens: Math.max(256, Math.round(getStoredDeviceConfig().max_tokens)),
        },
      );

      const assetContent =
        request.asset_name === 'a1111' ? rawAssetContent.trim() : unwrapSingleCodeFence(rawAssetContent).trim();

      if (!assetContent) {
        throw new APIError(502, `Generated asset ${request.asset_name} was empty`);
      }

      if (!signal.aborted) {
        emit('complete', { content: assetContent });
      }
    });
  }

  refine(request: RefineRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const draft = await this.getDraft(request.draft_id);
      const assetContent = draft.assets[request.asset];
      if (!assetContent) {
        throw new APIError(404, `Asset ${request.asset} not found in draft`);
      }

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary.',
        },
        {
          role: 'user',
          content: `Draft seed: ${draft.metadata.seed}\nAsset: ${request.asset}\n\nCurrent content:\n${assetContent}\n\nRevision request:\n${request.message}`,
        },
      ];

      const fullContent = await collectStreamedContent(messages, signal, (content) => emit('chunk', { content }));
      if (!signal.aborted) {
        emit('complete', { content: fullContent });
      }
    });
  }

  optimizeText(request: OptimizeTextRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const messages = buildOptimizeTextMessages(request);
      const fullContent = await collectStreamedContent(messages, signal, (content) => emit('chunk', { content }));
      if (!signal.aborted) {
        emit('complete', { content: fullContent });
      }
    });
  }
}

export const mobileLocalApi = new MobileLocalAPI();
