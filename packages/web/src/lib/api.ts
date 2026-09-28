import {
  applyDraftFilters,
  buildDraftExportArtifact,
  buildBlueprintList,
  buildDraftListResponse,
  buildLineageResponse,
  buildMissingTemplateBlueprintWarnings,
  buildStoredTemplateRecord,
  buildSimilarityResult,
  detectProviderFromModel,
  fetchProviderModels as fetchSharedProviderModels,
  getFallbackModels,
  validateDraftAssets,
  validateTemplate as validateTemplateDefinition,
  type ApiKeys,
  type Blueprint,
  type BlueprintList,
  type ChatMessage,
  type ChatRequest,
  type Config,
  type ConnectionTestRequest,
  type ConnectionTestResult,
  type CreateTemplateRequest,
  type Draft,
  type DraftFilters,
  type DraftListResponse,
  type DraftMetadata,
  type DuplicateTemplateRequest,
  type ExportPresetSummary,
  type ExportRequest,
  type FinalizeGenerationRequest,
  type GenerateAssetRequest,
  type GenerateAssetResponse,
  type GenerateBatchRequest,
  type GenerateRequest,
  type GenerationComplete,
  type LorebookGenerationRequest,
  type LLMProvider,
  type LineageResponse,
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
  type ThemeDuplicateRequest,
  type ThemeImportRequest,
  type ThemePreset,
  type ThemePresetCreate,
  type ThemePresetUpdate,
  type ThemeRenameRequest,
  type TimelineEventRecord,
  type TimelineRecord,
  type UpdateTemplateRequest,
  type ValidatePathRequest,
  type ValidationResponse,
  type WorldCharacterDraftLinkRecord,
  type WorldCharacterRecord,
  type WorldFactionRecord,
  type WorldLocationRecord,
  type WorldRelationshipRecord,
  type WorldRecord,
} from '@char-gen/shared';
import { MODEL_SUGGESTIONS, createEngine, getDefaultBaseUrl } from './llm/factory.js';
import { toAppConnectionTestResult } from './llm/connection-result.js';
import { builtinThemes } from './themes/builtin-themes.js';
import { configManager } from './config/manager.js';
import { readPersistedJson, writePersistedJson } from './persistence/storage.js';
import { isDesktopRuntime, isSelfContainedDesktopRuntime } from './runtime.js';
import {
  addLocalTimelineEvent,
  addLocalWorldCharacter,
  addLocalWorldFaction,
  addLocalWorldLocation,
  addLocalWorldRelationship,
  createLocalTimeline,
  createLocalWorld,
  deleteLocalTimeline,
  deleteLocalTimelineEvent,
  deleteLocalWorld,
  deleteLocalWorldCharacter,
  deleteLocalWorldFaction,
  deleteLocalWorldLocation,
  deleteLocalWorldRelationship,
  getLocalWorldCharacterDraftLinks,
  getLocalWorldRelationshipAuditIssues,
  getLocalTimeline,
  getLocalWorld,
  getLocalWorlds,
  updateLocalTimeline,
  updateLocalTimelineEvent,
  updateLocalWorld,
  updateLocalWorldCharacter,
  updateLocalWorldFaction,
  updateLocalWorldLocation,
  updateLocalWorldRelationship,
} from './storage/desktop-lore-db.js';
import { DraftStorage, type AssetWriteOptions } from './storage/draft-db.js';
import { GenerationService } from './services/generation.js';
import { appendDraftRevisionSnapshot, buildDraftRevisionSnapshot } from './drafts/revision-snapshots.js';
import {
  buildUniqueCustomBlueprintPath,
  type StoredTemplateRecord,
  getAllTemplateRecords,
  getBlueprintCatalog,
  getBlueprintOverrides,
  getOriginalBlueprintContent,
  hasBlueprintOverride,
  getStoredTemplateRecord,
  getStoredTemplates,
  getTemplateRecord,
  inferCharacterDisplayNameForTemplate,
  isCustomBlueprintPath,
  resolveTemplateBlueprintContent,
  resolveTemplateDefinition,
  saveBlueprintOverrides,
  saveStoredTemplates,
} from './templates/browser.js';
import { buildOptimizeTextMessages } from '@char-gen/shared';

export interface DownloadResponse {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

export interface CreateDraftRequest {
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
}

type StreamEventType = 'status' | 'chunk' | 'complete' | 'error' | 'batch_start' | 'batch_complete' | 'batch_error';

type StatusStreamData = { stage?: string; asset?: string; progress?: number };
type ChunkStreamData = { content: string };
type ErrorStreamData = { error: string };
type BatchStartStreamData = { index: number; seed: string };
type BatchCompleteStreamData = { index: number; seed: string; draft_path: string };
type BatchErrorStreamData = { index: number; seed: string; error: string };
type CompleteStreamData =
  | GenerationComplete
  | GenerateAssetResponse
  | BlueprintPreviewResponse
  | { draft_id: string; character_name?: string }
  | { content: string }
  | { status: 'done' };

type StreamEventMap = {
  status: StatusStreamData;
  chunk: ChunkStreamData;
  complete: CompleteStreamData;
  error: ErrorStreamData;
  batch_start: BatchStartStreamData;
  batch_complete: BatchCompleteStreamData;
  batch_error: BatchErrorStreamData;
};

type StreamEvent = {
  [EventType in StreamEventType]: {
    event: EventType;
    data: StreamEventMap[EventType];
  };
}[StreamEventType];

type StreamReader = (event: StreamEvent) => void;

type BlueprintPreviewRequest = GenerateAssetRequest & {
  blueprint_content: string;
};

type BlueprintPreviewResponse = GenerateAssetResponse & {
  system_prompt: string;
  user_prompt: string;
};

const CUSTOM_THEMES_STORAGE_KEY = 'eidolon.web.themes.custom';
export const THEMES_SYNCED_EVENT = 'eidolon:themes-synced';
export const DRAFTS_SYNCED_EVENT = 'eidolon:drafts-synced';
const DESKTOP_WORLDS_ONLY_MESSAGE =
  'Persisted worlds, factions, locations, and timelines are currently only available in the desktop app.';

function parseBlueprintMetadata(
  path: string,
  content: string,
): {
  name: string;
  description: string;
  version: string;
  invokable: boolean;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let name = path.split('/').pop()?.replace('.md', '') || 'Blueprint';
  let description = '';
  let version = '1.0';
  let invokable = true;

  if (!frontmatterMatch) {
    return { name, description, version, invokable };
  }

  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);
  const invokableMatch = frontmatter.match(/^invokable:\s*(.+)$/m);

  if (nameMatch) {
    name = nameMatch[1].trim();
  }
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
  }
  if (versionMatch) {
    version = versionMatch[1].trim();
  }
  if (invokableMatch) {
    invokable = invokableMatch[1].trim() === 'true';
  }

  return { name, description, version, invokable };
}

function getUniqueTemplateName(requestedName: string, excludeName?: string): string {
  const existingNames = new Set(
    getAllTemplateRecords()
      .map((record) => record.template.name)
      .filter((name) => name !== excludeName),
  );

  if (!existingNames.has(requestedName)) {
    return requestedName;
  }

  const copyBase = requestedName.endsWith(' Copy') ? requestedName : `${requestedName} Copy`;
  if (!existingNames.has(copyBase)) {
    return copyBase;
  }

  let suffix = 2;
  let candidate = `${copyBase} ${suffix}`;
  while (existingNames.has(candidate)) {
    suffix += 1;
    candidate = `${copyBase} ${suffix}`;
  }

  return candidate;
}
const LEGACY_CUSTOM_THEMES_STORAGE_KEYS = ['bpui.web.themes.custom'];
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedModelsEntry = {
  response: ModelsResponse;
  cachedAt: number;
};

const modelsCache = new Map<string, CachedModelsEntry>();

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
  {
    name: 'text',
    path: 'text',
    format: 'text',
    description: 'Export draft assets as plain text sections.',
  },
  {
    name: 'combined',
    path: 'combined',
    format: 'combined',
    description: 'Export a markdown bundle with metadata and assets.',
  },
];

class BrowserStream {
  private readers: StreamReader[] = [];
  private onComplete?: (data: CompleteStreamData) => void;
  private onError?: (error: string) => void;
  private controller = new AbortController();

  constructor(
    private readonly executor: (helpers: {
      emit: <EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]) => void;
      signal: AbortSignal;
    }) => Promise<void>,
  ) {}

  subscribe(callback: StreamReader): this {
    this.readers.push(callback);
    return this;
  }

  onComplete_(callback: (data: CompleteStreamData) => void): this {
    this.onComplete = callback;
    return this;
  }

  onError_(callback: (error: string) => void): this {
    this.onError = callback;
    return this;
  }

  async start(): Promise<void> {
    try {
      await this.executor({
        emit: (event, data) => this.emit(event, data),
        signal: this.controller.signal,
      });
    } catch (error) {
      if (this.controller.signal.aborted) {
        return;
      }
      this.emit('error', { error: error instanceof Error ? error.message : 'Stream failed' });
    }
  }

  abort(): void {
    this.controller.abort();
  }

  private emit<EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]): void {
    const payload = { event, data } as StreamEvent;
    this.readers.forEach((reader) => reader(payload));

    if (payload.event === 'complete' && this.onComplete) {
      this.onComplete(payload.data);
    }

    if (payload.event === 'error' && this.onError) {
      this.onError(payload.data.error);
    }
  }
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  return readPersistedJson(keys, fallback);
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  writePersistedJson(key, legacyKeys, value);
}

function slugifyFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getBrowserConfig(): Config {
  return {
    ...configManager.getConfig(),
    api_keys: configManager.getApiKeys(),
  };
}

function resolveConfiguredProvider(config: Config): LLMProvider | undefined {
  if (config.engine_mode === 'explicit' && config.engine !== 'auto' && config.engine !== 'openai_compatible') {
    return config.engine as LLMProvider;
  }

  return config.model ? detectProviderFromModel(config.model) : undefined;
}

function getFallbackApiKey(apiKeys: ApiKeys): string | undefined {
  return Object.values(apiKeys).find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function resolveProviderApiKey(provider: string, apiKeys: ApiKeys): string | undefined {
  const providerKey = apiKeys[provider];
  if (typeof providerKey === 'string' && providerKey.trim().length > 0) {
    return providerKey;
  }

  return getFallbackApiKey(apiKeys);
}

function getCustomThemes(): ThemePreset[] {
  return readStorage<ThemePreset[]>([CUSTOM_THEMES_STORAGE_KEY, ...LEGACY_CUSTOM_THEMES_STORAGE_KEYS], []);
}

function saveCustomThemes(themes: ThemePreset[]): void {
  writeStorage(CUSTOM_THEMES_STORAGE_KEY, LEGACY_CUSTOM_THEMES_STORAGE_KEYS, themes);
}

function getAllThemes(): ThemePreset[] {
  return [...builtinThemes, ...getCustomThemes()];
}

function createDownload(content: string | Uint8Array, filename: string, type: string): DownloadResponse {
  // TypeScript's DOM types reject `Uint8Array<ArrayBufferLike>` as a `BlobPart`
  // because `ArrayBufferLike` also covers `SharedArrayBuffer`. Copying through a
  // fresh view guarantees an `ArrayBuffer`-backed part without a cast.
  const parts: BlobPart[] = typeof content === 'string' ? [content] : [new Uint8Array(content)];

  return {
    blob: new Blob(parts, { type }),
    filename,
    contentType: type,
  };
}

async function generateWithCurrentConfig(
  messages: ChatMessage[],
): Promise<AsyncIterable<{ content?: string; done?: boolean }>> {
  const config = configManager.getConfig();
  const apiKeys = configManager.getApiKeys();
  const provider = resolveConfiguredProvider(config);
  const engine = createEngine({
    model: config.model,
    apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
    apiKeys,
    provider,
    baseUrl: config.base_url,
    temperature: config.temperature,
    maxTokens: config.max_tokens,
  });
  return engine.generateStream(messages);
}

export class EidolonBrowserAPI {
  private async loadProviderModels(provider: string, refresh: boolean = false): Promise<ModelsResponse> {
    const apiKeys = configManager.getApiKeys();
    const config = configManager.getConfig();
    const typedProvider = provider as LLMProvider;
    const baseUrl = config.base_url || getDefaultBaseUrl(typedProvider);
    const apiKey = resolveProviderApiKey(provider, apiKeys);
    const cacheKey = `${provider}|${baseUrl}|${apiKey ? 'auth' : 'anon'}`;
    const cachedEntry = modelsCache.get(cacheKey);
    if (!refresh && cachedEntry && Date.now() - cachedEntry.cachedAt < MODEL_CACHE_TTL_MS) {
      return {
        ...cachedEntry.response,
        cached: true,
      };
    }

    const fallbackModels = getFallbackModels(typedProvider);
    const supportsRemoteListing = ['openrouter', 'openai', 'deepseek', 'zai', 'moonshot'].includes(provider);

    if (!apiKey || !supportsRemoteListing) {
      const response = {
        provider,
        models: fallbackModels,
        cached: true,
        error: apiKey || supportsRemoteListing ? undefined : 'Provider model listing is not available in browser mode.',
      };
      modelsCache.set(cacheKey, {
        response,
        cachedAt: Date.now(),
      });
      return response;
    }

    try {
      const response = await fetchSharedProviderModels(typedProvider, apiKey, baseUrl);
      modelsCache.set(cacheKey, {
        response,
        cachedAt: Date.now(),
      });
      return response;
    } catch (error) {
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      const message = isNetworkError
        ? 'Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.'
        : error instanceof Error
          ? error.message
          : 'Failed to load models';
      const response = {
        provider,
        models: fallbackModels,
        cached: true,
        error: message,
      };
      modelsCache.set(cacheKey, {
        response,
        cachedAt: Date.now(),
      });
      return response;
    }
  }

  async getConfig(): Promise<Config> {
    return getBrowserConfig();
  }

  getConfigSnapshot(): Config {
    return getBrowserConfig();
  }

  getThemesSnapshot(): ThemePreset[] {
    return getAllThemes();
  }

  async syncConfigFromServer(): Promise<boolean> {
    return false;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    const nextConfig = { ...config };
    if (config.api_keys) {
      configManager.replaceApiKeys(config.api_keys);
      delete nextConfig.api_keys;
    }
    configManager.updateConfig(nextConfig);
    return this.getConfig();
  }

  async testConnection(request: ConnectionTestRequest): Promise<ConnectionTestResult> {
    const apiKey = configManager.getApiKeys()[request.provider];
    if (!apiKey) {
      return { success: false, error: `No API key configured for ${request.provider}` };
    }

    const model =
      request.model ||
      MODEL_SUGGESTIONS[request.provider as keyof typeof MODEL_SUGGESTIONS]?.[0] ||
      getBrowserConfig().model;
    const engine = createEngine({
      model,
      apiKey,
      provider: request.provider as never,
      baseUrl: request.base_url,
    });

    const result = await engine.testConnection();

    return toAppConnectionTestResult(result);
  }

  async getThemes(): Promise<ThemePreset[]> {
    return this.getThemesSnapshot();
  }

  async createTheme(theme: ThemePresetCreate): Promise<ThemePreset> {
    const themes = getCustomThemes();
    if (getAllThemes().some((candidate) => candidate.name === theme.name)) {
      throw new APIError(409, `Theme ${theme.name} already exists`);
    }

    const created: ThemePreset = {
      ...theme,
      description: theme.description || '',
      author: theme.author || '',
      tags: theme.tags || [],
      based_on: theme.based_on || '',
      is_builtin: false,
    };
    themes.push(created);
    saveCustomThemes(themes);

    return created;
  }

  async exportTheme(name: string): Promise<DownloadResponse> {
    const theme = getAllThemes().find((candidate) => candidate.name === name);
    if (!theme) {
      throw new APIError(404, `Theme ${name} not found`);
    }
    return createDownload(JSON.stringify(theme, null, 2), `${slugifyFileName(name)}.json`, 'application/json');
  }

  async importTheme(file: File, options: ThemeImportRequest = {}): Promise<ThemePreset> {
    const payload = JSON.parse(await file.text()) as ThemePreset;
    const incoming: ThemePreset = {
      ...payload,
      is_builtin: false,
    };

    const themes = getCustomThemes();
    const existingIndex = themes.findIndex((theme) => theme.name === incoming.name);
    if (existingIndex >= 0) {
      if (options.conflict_strategy === 'overwrite') {
        themes[existingIndex] = incoming;
      } else if (options.conflict_strategy === 'rename') {
        incoming.name = options.target_name || `${incoming.name}_copy`;
        themes.push(incoming);
      } else {
        throw new APIError(409, `Theme ${incoming.name} already exists`);
      }
    } else {
      themes.push(incoming);
    }

    saveCustomThemes(themes);
    return incoming;
  }

  async updateTheme(name: string, theme: ThemePresetUpdate): Promise<ThemePreset> {
    const themes = getCustomThemes();
    const index = themes.findIndex((candidate) => candidate.name === name);
    if (index < 0) {
      throw new APIError(404, `Theme ${name} is builtin or missing`);
    }
    themes[index] = { ...themes[index], ...theme };
    saveCustomThemes(themes);

    return themes[index];
  }

  async duplicateTheme(name: string, request: ThemeDuplicateRequest): Promise<ThemePreset> {
    const source = getAllThemes().find((theme) => theme.name === name);
    if (!source) {
      throw new APIError(404, `Theme ${name} not found`);
    }
    return this.createTheme({
      name: request.new_name,
      display_name: request.display_name || source.display_name,
      description: request.description || source.description,
      author: request.author || source.author,
      tags: request.tags || source.tags,
      based_on: request.based_on || source.name,
      colors: source.colors,
    });
  }

  async renameTheme(name: string, request: ThemeRenameRequest): Promise<ThemePreset> {
    return this.updateTheme(name, {
      display_name: request.display_name,
      ...(request.new_name !== name ? {} : {}),
    }).then((theme) => {
      const themes = getCustomThemes();
      const index = themes.findIndex((candidate) => candidate.name === name);
      if (index < 0) {
        throw new APIError(404, `Theme ${name} is builtin or missing`);
      }
      themes[index] = { ...theme, name: request.new_name };
      saveCustomThemes(themes);
      return themes[index];
    });
  }

  async deleteTheme(name: string): Promise<{ status: string; name: string }> {
    // Delete locally first
    const themes = getCustomThemes().filter((theme) => theme.name !== name);
    saveCustomThemes(themes);

    return { status: 'deleted', name };
  }

  async getModels(provider: string): Promise<ModelsResponse> {
    return this.loadProviderModels(provider, false);
  }

  async refreshModels(provider: string): Promise<{ status: string; model_count: number; error?: string }> {
    const response = await this.loadProviderModels(provider, true);
    return { status: 'ok', model_count: response.models.length, error: response.error };
  }

  async generateSeeds(request: SeedGenerationRequest): Promise<SeedGenerationResponse> {
    const seeds: string[] = [];

    for await (const progress of GenerationService.generateSeeds(request)) {
      if (progress.type === 'complete' && progress.content) {
        seeds.push(
          ...progress.content
            .split('\n')
            .map((seed) => seed.trim())
            .filter(Boolean),
        );
      }
    }

    return { seeds: [...new Set(seeds)] };
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
    const record = getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }
    return { blueprint_contents: record.blueprint_contents };
  }

  async createTemplate(template: CreateTemplateRequest): Promise<Template> {
    const records = getStoredTemplates();
    if (records.some((record) => record.template.name === template.name)) {
      throw new APIError(409, `Template ${template.name} already exists`);
    }
    const record = buildStoredTemplateRecord<StoredTemplateRecord>(template);
    records.push(record);
    saveStoredTemplates(records);

    return record.template;
  }

  async updateTemplate(name: string, template: UpdateTemplateRequest): Promise<Template> {
    const records = getStoredTemplates();
    const index = records.findIndex((record) => record.template.name === name);
    if (index < 0) {
      const sourceRecord = getTemplateRecord(name);
      if (!sourceRecord) {
        throw new APIError(404, `Template ${name} not found`);
      }

      const nextName = getUniqueTemplateName(template.name, name);
      return this.createTemplate({
        ...template,
        name: nextName,
      });
    }

    if (template.name !== name) {
      const conflictingRecord = getTemplateRecord(template.name);
      if (conflictingRecord && conflictingRecord.template.name !== name) {
        throw new APIError(409, `Template ${template.name} already exists`);
      }
    }

    records[index] = buildStoredTemplateRecord<StoredTemplateRecord>(template, {
      templateRoot: records[index].template_root,
    });
    saveStoredTemplates(records);

    return records[index].template;
  }

  async deleteTemplate(name: string): Promise<{ status: string; name: string }> {
    const records = getStoredTemplates().filter((record) => record.template.name !== name);
    saveStoredTemplates(records);

    return { status: 'deleted', name };
  }

  async duplicateTemplate(name: string, request: DuplicateTemplateRequest): Promise<Template> {
    const source = getTemplateRecord(name);
    if (!source) {
      throw new APIError(404, `Template ${name} not found`);
    }
    return this.createTemplate({
      name: request.name,
      version: request.version || source.template.version,
      description: source.template.description,
      assets: source.template.assets,
      blueprint_contents: source.blueprint_contents,
    });
  }

  async validateTemplate(name: string): Promise<TemplateValidationResult> {
    const record = getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }
    const validation = validateTemplateDefinition(record.template);
    const warnings = buildMissingTemplateBlueprintWarnings(
      record.template,
      (assetName) => resolveTemplateBlueprintContent(record.template.name, assetName) ?? null,
    );
    return { errors: validation.errors, warnings };
  }

  async exportTemplate(name: string): Promise<DownloadResponse> {
    const record = getStoredTemplateRecord(name) ?? getTemplateRecord(name);
    if (!record) {
      throw new APIError(404, `Template ${name} not found`);
    }
    return createDownload(JSON.stringify(record, null, 2), `${slugifyFileName(name)}.json`, 'application/json');
  }

  async importTemplate(file: File): Promise<Template> {
    const parsed = JSON.parse(await file.text()) as Partial<StoredTemplateRecord & CreateTemplateRequest>;
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
      name: parsed.name || file.name.replace(/\.[^.]+$/, ''),
      version: parsed.version || '1.0',
      description: parsed.description || '',
      assets: parsed.assets || [],
      blueprint_contents: parsed.blueprint_contents || {},
    } as CreateTemplateRequest);
  }

  async getDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    const allMetadata = await DraftStorage.getAllMetadata({ includeArchived: true });
    const filtered = applyDraftFilters(allMetadata, filters);
    return buildDraftListResponse(filtered, filtered.length, filtered, allMetadata);
  }

  async listDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    return this.getDrafts(filters);
  }

  async getDraft(reviewId: string): Promise<Draft> {
    const draft = await DraftStorage.getDraft(reviewId);
    if (!draft) {
      throw new APIError(404, `Draft ${reviewId} not found`);
    }
    return draft;
  }

  async createDraft(request: CreateDraftRequest): Promise<Draft> {
    const seed = request.seed.trim();
    const templateName = request.templateName.trim();

    if (!seed) {
      throw new APIError(400, 'Seed is required');
    }

    if (!templateName) {
      throw new APIError(400, 'Template is required');
    }

    const reviewId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const draft: Draft = {
      path: reviewId,
      metadata: {
        review_id: reviewId,
        seed,
        mode: request.mode ?? 'Auto',
        model: configManager.getConfig().model,
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

    await DraftStorage.saveDraft(draft);

    return draft;
  }

  async updateMetadata(
    reviewId: string,
    updates: Partial<DraftMetadata>,
  ): Promise<{ status: string; draft_id: string }> {
    // Update locally first
    await DraftStorage.updateMetadata(reviewId, updates);

    return { status: 'updated', draft_id: reviewId };
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

    await DraftStorage.updateMetadata(reviewId, {
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

    await DraftStorage.saveDraft({
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

  async archiveDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    await DraftStorage.updateMetadata(reviewId, {
      archived_at: new Date().toISOString(),
    });

    return { status: 'archived', draft_id: reviewId };
  }

  async restoreDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    await DraftStorage.updateMetadata(reviewId, {
      archived_at: undefined,
    });

    return { status: 'restored', draft_id: reviewId };
  }

  async deleteDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    // Delete locally first
    await DraftStorage.deleteDraft(reviewId);

    return { status: 'deleted', draft_id: reviewId };
  }

  async updateAsset(
    reviewId: string,
    assetName: string,
    content: string,
    options: AssetWriteOptions = {},
  ): Promise<{ status: 'created' | 'updated'; draft_id: string; asset_name: string }> {
    // Update locally first
    const status = await DraftStorage.updateAsset(reviewId, assetName, content, options);

    return { status, draft_id: reviewId, asset_name: assetName };
  }

  async validateDraft(reviewId: string): Promise<ValidationResponse> {
    const draft = await this.getDraft(reviewId);
    return validateDraftAssets(draft, { resolveTemplate: resolveTemplateDefinition });
  }

  async validatePath(request: ValidatePathRequest): Promise<ValidationResponse> {
    const reviewId = request.path.trim().replace(/^drafts\//, '');
    const draft = await DraftStorage.getDraft(reviewId);
    if (!draft) {
      return {
        path: request.path,
        output: `VALIDATION FAILED\n- ${isDesktopRuntime() ? 'Desktop draft storage' : 'Browser-only mode'} can validate saved drafts by review ID only.`,
        errors: '',
        exit_code: 1,
        success: false,
      };
    }
    return validateDraftAssets(draft, { resolveTemplate: resolveTemplateDefinition });
  }

  generate(_request: GenerateRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.generate(_request, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'complete') {
          const draftId = progress.asset || '';
          const draft = draftId ? await DraftStorage.getDraft(draftId) : null;
          emit('complete', {
            draft_path: draftId,
            draft_id: draftId,
            character_name: draft?.metadata.character_name,
            duration_ms: 0,
          } satisfies GenerationComplete);
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Generation failed' });
        }
      }
    });
  }

  generateAsset(request: GenerateAssetRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.generateAsset(request, true, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'asset') {
          emit('complete', {
            asset_name: request.asset_name,
            content: progress.content || '',
          } satisfies GenerateAssetResponse);
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Asset generation failed' });
        }
      }
    });
  }

  previewBlueprint(request: BlueprintPreviewRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.previewBlueprint(request, true, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'asset') {
          emit('complete', {
            asset_name: request.asset_name,
            content: progress.content || '',
            system_prompt: progress.systemPrompt || '',
            user_prompt: progress.userPrompt || '',
          } satisfies BlueprintPreviewResponse);
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Blueprint preview failed' });
        }
      }
    });
  }

  async finalizeGeneration(request: FinalizeGenerationRequest): Promise<GenerationComplete> {
    const reviewId = crypto.randomUUID();
    const characterName = inferCharacterDisplayNameForTemplate(request.assets, request.template);
    const draft: Draft = {
      path: reviewId,
      metadata: {
        review_id: reviewId,
        seed: request.seed,
        mode: request.mode,
        model: configManager.getConfig().model,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        favorite: false,
        template_name: request.template,
        character_name: characterName,
      },
      assets: request.assets,
    };
    await DraftStorage.saveDraft(draft);
    return {
      draft_path: reviewId,
      draft_id: reviewId,
      character_name: characterName,
      duration_ms: 0,
    };
  }

  generateBatch(seeds: string[], request: Omit<GenerateBatchRequest, 'seeds'>): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      const runSeed = async (seed: string, index: number) => {
        emit('batch_start', { index, seed });
        try {
          let draftId = '';
          for await (const progress of GenerationService.generate(
            {
              seed,
              mode: request.mode,
              template: request.template,
              selected_assets: request.selected_assets,
              connected_draft_ids: request.connected_draft_ids,
            },
            { signal },
          )) {
            if (signal.aborted) {
              return;
            }
            if (progress.type === 'complete') {
              draftId = progress.asset || '';
            }
          }
          emit('batch_complete', { index, seed, draft_path: draftId });
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

      if (signal.aborted) {
        return;
      }

      emit('complete', { status: 'done' });
    });
  }

  async getLineage(): Promise<LineageResponse> {
    const metadata = await DraftStorage.getAllMetadata();
    return buildLineageResponse(metadata);
  }

  async analyzeSimilarity(request: SimilarityRequest): Promise<SimilarityResult> {
    const left = await this.getDraft(request.draft1_id);
    const right = await this.getDraft(request.draft2_id);
    const baseResult = buildSimilarityResult(left, right);

    if (!request.include_llm_analysis) {
      return baseResult;
    }

    try {
      const analysis = (await GenerationService.analyzeSimilarity(request.draft1_id, request.draft2_id)) as {
        narrative_dynamics?: unknown;
        relationship_arc?: unknown;
        story_opportunities?: unknown;
        scene_suggestions?: unknown;
        raw?: unknown;
      };

      const storyHooks = Array.isArray(analysis.story_opportunities)
        ? analysis.story_opportunities.map((item) => String(item)).slice(0, 4)
        : baseResult.relationship_suggestions;
      const sceneSuggestions = Array.isArray(analysis.scene_suggestions)
        ? analysis.scene_suggestions.map((item) => String(item)).slice(0, 3)
        : baseResult.relationship_suggestions;
      const relationshipPotential =
        [analysis.narrative_dynamics, analysis.relationship_arc]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .join('\n\n') || (typeof analysis.raw === 'string' ? analysis.raw : 'LLM analysis unavailable.');

      return {
        ...baseResult,
        relationship_suggestions: sceneSuggestions,
        llm_analysis: {
          relationship_potential: relationshipPotential,
          conflict_areas: baseResult.differences.slice(0, 4),
          synergy_areas: baseResult.commonalities.slice(0, 4),
          story_hooks: storyHooks,
        },
      };
    } catch {
      return baseResult;
    }
  }

  generateOffspring(request: OffspringRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.generateOffspring(request, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'status') {
          emit('status', {
            stage: progress.stage,
            asset: progress.asset,
            progress: progress.progress,
          });
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'complete') {
          const draftId = progress.asset || '';
          const draft = draftId ? await DraftStorage.getDraft(draftId) : null;
          emit('complete', {
            draft_id: draftId,
            character_name: draft?.metadata.character_name,
          });
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Offspring generation failed' });
        }
      }
    });
  }

  generateOffspringSeed(request: OffspringRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.generateOffspringSeed(request, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'status') {
          emit('status', {
            stage: progress.stage,
            asset: progress.asset,
            progress: progress.progress,
          });
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'complete') {
          emit('complete', { content: progress.content || '' });
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Offspring seed generation failed' });
        }
      }
    });
  }

  generateLorebook(request: LorebookGenerationRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      for await (const progress of GenerationService.generateLorebook(request, { signal })) {
        if (signal.aborted) {
          return;
        }
        if (progress.type === 'status') {
          emit('status', {
            stage: progress.stage,
            asset: progress.asset,
            progress: progress.progress,
          });
        }
        if (progress.type === 'chunk') {
          emit('chunk', { content: progress.content || '' });
        }
        if (progress.type === 'complete') {
          emit('complete', { content: progress.content || '' });
        }
        if (progress.type === 'error') {
          emit('error', { error: progress.error || 'Lorebook generation failed' });
        }
      }
    });
  }

  async getExportPresets(): Promise<ExportPresetSummary[]> {
    return EXPORT_PRESETS;
  }

  async exportDraft(request: ExportRequest): Promise<DownloadResponse> {
    const draft = await this.getDraft(request.draft_id);
    const preset =
      request.preset === 'text' || request.preset === 'combined' || request.preset === 'png' ? request.preset : 'json';
    const includeMetadata = request.include_metadata !== false;
    const fileBase = slugifyFileName(draft.metadata.character_name || draft.metadata.seed || draft.metadata.review_id);
    const artifact = buildDraftExportArtifact(draft, preset, includeMetadata);

    return createDownload(artifact.content, `${fileBase}.${artifact.extension}`, artifact.contentType);
  }

  async getBlueprints(): Promise<BlueprintList> {
    const values = [...getBlueprintCatalog().values()];
    return buildBlueprintList(values);
  }

  async getWorlds(params?: {
    search?: string;
    genre?: string;
    includePublic?: boolean;
  }): Promise<{ worlds: WorldRecord[] }> {
    if (isSelfContainedDesktopRuntime()) {
      return getLocalWorlds(params);
    }

    return { worlds: [] };
  }

  async getWorldCharacterDraftLinks(params?: {
    draftIds?: string[];
  }): Promise<{ links: WorldCharacterDraftLinkRecord[] }> {
    if (isSelfContainedDesktopRuntime()) {
      return getLocalWorldCharacterDraftLinks(params);
    }

    return { links: [] };
  }

  async getWorldRelationshipAuditIssues(): Promise<{
    issues: Array<{
      worldId: string;
      worldName: string;
      relationshipId: string;
      label: string;
      sourceCharacterId: string;
      sourceCharacterName?: string;
      targetCharacterId: string;
      targetCharacterName?: string;
      updatedAt: string;
      kind: 'missing-source-character' | 'missing-target-character' | 'missing-both-characters';
    }>;
  }> {
    if (isSelfContainedDesktopRuntime()) {
      return getLocalWorldRelationshipAuditIssues();
    }

    return { issues: [] };
  }

  async getWorld(id: string): Promise<{ world: WorldRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return getLocalWorld(id);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async createWorld(data: {
    name: string;
    description?: string;
    genre?: string;
    setting?: string;
    notes?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<{ world: WorldRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return createLocalWorld(data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateWorld(id: string, data: Record<string, unknown>): Promise<{ world: WorldRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalWorld(id, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteWorld(id: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalWorld(id);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async addWorldCharacter(
    worldId: string,
    data: { draftId?: string; characterName: string; role?: string; notes?: string },
  ): Promise<{ character: WorldCharacterRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return addLocalWorldCharacter(worldId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateWorldCharacter(
    worldId: string,
    characterId: string,
    data: Record<string, unknown>,
  ): Promise<{ character: WorldCharacterRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalWorldCharacter(worldId, characterId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteWorldCharacter(worldId: string, characterId: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalWorldCharacter(worldId, characterId);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async addWorldFaction(
    worldId: string,
    data: { name: string; description?: string; role?: string; notes?: string; tags?: string[]; draftIds?: string[] },
  ): Promise<{ faction: WorldFactionRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return addLocalWorldFaction(worldId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateWorldFaction(
    worldId: string,
    factionId: string,
    data: Record<string, unknown>,
  ): Promise<{ faction: WorldFactionRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalWorldFaction(worldId, factionId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteWorldFaction(worldId: string, factionId: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalWorldFaction(worldId, factionId);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async addWorldLocation(
    worldId: string,
    data: {
      name: string;
      description?: string;
      category?: string;
      notes?: string;
      tags?: string[];
      draftIds?: string[];
    },
  ): Promise<{ location: WorldLocationRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return addLocalWorldLocation(worldId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateWorldLocation(
    worldId: string,
    locationId: string,
    data: Record<string, unknown>,
  ): Promise<{ location: WorldLocationRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalWorldLocation(worldId, locationId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteWorldLocation(worldId: string, locationId: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalWorldLocation(worldId, locationId);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async addWorldRelationship(
    worldId: string,
    data: { sourceCharacterId: string; targetCharacterId: string; label: string; notes?: string },
  ): Promise<{ relationship: WorldRelationshipRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return addLocalWorldRelationship(worldId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateWorldRelationship(
    worldId: string,
    relationshipId: string,
    data: Record<string, unknown>,
  ): Promise<{ relationship: WorldRelationshipRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalWorldRelationship(worldId, relationshipId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteWorldRelationship(worldId: string, relationshipId: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalWorldRelationship(worldId, relationshipId);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async getTimeline(id: string): Promise<{ timeline: TimelineRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return getLocalTimeline(id);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async createTimeline(data: {
    worldId: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }): Promise<{ timeline: TimelineRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return createLocalTimeline(data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateTimeline(id: string, data: Record<string, unknown>): Promise<{ timeline: TimelineRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalTimeline(id, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteTimeline(id: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalTimeline(id);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async addTimelineEvent(
    timelineId: string,
    data: {
      title: string;
      description?: string;
      eventDate?: string;
      sortOrder?: number;
      tags?: string[];
      metadata?: Record<string, unknown>;
    },
  ): Promise<{ event: TimelineEventRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return addLocalTimelineEvent(timelineId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async updateTimelineEvent(
    timelineId: string,
    eventId: string,
    data: Record<string, unknown>,
  ): Promise<{ event: TimelineEventRecord }> {
    if (isSelfContainedDesktopRuntime()) {
      return updateLocalTimelineEvent(timelineId, eventId, data);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async deleteTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
    if (isSelfContainedDesktopRuntime()) {
      return deleteLocalTimelineEvent(timelineId, eventId);
    }

    throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
  }

  async getBlueprint(path: string): Promise<Blueprint> {
    const blueprint = getBlueprintCatalog().get(path);
    if (!blueprint) {
      throw new APIError(404, `Blueprint ${path} not found`);
    }
    return blueprint;
  }

  async updateBlueprint(path: string, content: string): Promise<Blueprint> {
    const isBuiltinBlueprint = getOriginalBlueprintContent(path) !== null && !isCustomBlueprintPath(path);
    if (isBuiltinBlueprint) {
      const metadata = parseBlueprintMetadata(path, content);
      const targetPath = buildUniqueCustomBlueprintPath(metadata.name || path, path);
      return this.createBlueprint(targetPath, content);
    }

    // Save locally first
    const overrides = getBlueprintOverrides();
    overrides[path] = content;
    saveBlueprintOverrides(overrides);

    return this.getBlueprint(path);
  }

  async deleteBlueprint(path: string): Promise<{ status: 'deleted'; path: string }> {
    if (getOriginalBlueprintContent(path) !== null) {
      throw new APIError(400, `Cannot delete built-in blueprint ${path}`);
    }

    const overrides = getBlueprintOverrides();
    delete overrides[path];
    saveBlueprintOverrides(overrides);

    return { status: 'deleted', path };
  }

  async resetBlueprint(path: string): Promise<Blueprint> {
    // Remove local override
    const overrides = getBlueprintOverrides();
    delete overrides[path];
    saveBlueprintOverrides(overrides);

    const blueprint = this.getBlueprint(path);
    if (!blueprint) {
      throw new APIError(404, `Blueprint ${path} not found`);
    }
    return blueprint;
  }

  async createBlueprint(path: string, content: string): Promise<Blueprint> {
    const existing = getBlueprintCatalog().get(path);
    if (existing) {
      throw new APIError(409, `Blueprint ${path} already exists`);
    }

    // Save locally first
    const overrides = getBlueprintOverrides();
    overrides[path] = content;
    saveBlueprintOverrides(overrides);

    return this.getBlueprint(path);
  }

  async duplicateBlueprint(sourcePath: string, targetPath: string): Promise<Blueprint> {
    const source = getBlueprintCatalog().get(sourcePath);
    if (!source) {
      throw new APIError(404, `Source blueprint ${sourcePath} not found`);
    }
    const existing = getBlueprintCatalog().get(targetPath);
    if (existing) {
      throw new APIError(409, `Blueprint ${targetPath} already exists`);
    }

    // Save locally first
    const overrides = getBlueprintOverrides();
    overrides[targetPath] = source.content;
    saveBlueprintOverrides(overrides);

    return this.getBlueprint(targetPath);
  }

  hasBlueprintOverride(path: string): boolean {
    return hasBlueprintOverride(path);
  }

  getOriginalBlueprintContent(path: string): string | null {
    return getOriginalBlueprintContent(path);
  }

  chat(request: ChatRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      const draft = request.draft_id ? await DraftStorage.getDraft(request.draft_id) : null;
      const contextParts = [
        draft ? `Current draft metadata: ${JSON.stringify(draft.metadata)}` : '',
        request.context_asset && draft?.assets[request.context_asset]
          ? `Focused asset (${request.context_asset}):\n${draft.assets[request.context_asset]}`
          : '',
        request.screen_context ? `Screen context: ${JSON.stringify(request.screen_context)}` : '',
      ].filter(Boolean);

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant.',
        },
        ...(contextParts.length > 0 ? [{ role: 'system' as const, content: contextParts.join('\n\n') }] : []),
        ...request.messages,
      ];

      const stream = await generateWithCurrentConfig(messages);
      let fullContent = '';
      for await (const chunk of stream) {
        if (signal.aborted) {
          return;
        }
        if (chunk.content) {
          fullContent += chunk.content;
          emit('chunk', { content: chunk.content });
        }
        if (chunk.done) {
          break;
        }
      }
      emit('complete', { content: fullContent });
    });
  }

  refine(request: RefineRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
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

      const stream = await generateWithCurrentConfig(messages);
      let fullContent = '';
      for await (const chunk of stream) {
        if (signal.aborted) {
          return;
        }
        if (chunk.content) {
          fullContent += chunk.content;
          emit('chunk', { content: chunk.content });
        }
        if (chunk.done) {
          break;
        }
      }
      emit('complete', { content: fullContent });
    });
  }

  optimizeText(request: OptimizeTextRequest): BrowserStream {
    return new BrowserStream(async ({ emit, signal }) => {
      const messages = buildOptimizeTextMessages(request);
      const stream = await generateWithCurrentConfig(messages);
      let fullContent = '';
      for await (const chunk of stream) {
        if (signal.aborted) {
          return;
        }
        if (chunk.content) {
          fullContent += chunk.content;
          emit('chunk', { content: chunk.content });
        }
        if (chunk.done) {
          break;
        }
      }
      emit('complete', { content: fullContent });
    });
  }
}

export const api = new EidolonBrowserAPI();
