import {
  buildSimilarityResult,
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
  type LineageResponse,
  type ModelPricing,
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
  type UsageFilter,
  type UsageRecord,
  type UsageSummarizeOptions,
  type UsageSummary,
  type ValidatePathRequest,
  type ValidationResponse,
  type WorldCharacterDraftLinkRecord,
  type WorldCharacterRecord,
  type WorldFactionRecord,
  type WorldLocationRecord,
  type WorldRelationshipRecord,
  type WorldRecord,
} from '@char-gen/shared';
import { createEngine } from './llm/factory.js';
import { builtinThemes } from './themes/builtin-themes.js';
import { configManager } from './config/manager.js';
import { readPersistedJson, writePersistedJson } from './persistence/storage.js';
import * as worldApi from './worlds/lore-api.js';
import * as blueprintApi from './blueprints/blueprint-api.js';
import { DraftStorage, type AssetWriteOptions, type BulkDraftMetadataPatch } from './storage/draft-db.js';
import { UsageStorage } from './storage/usage-db.js';
import {
  deleteModelPricing,
  getModelPricing,
  saveModelPricing,
  type SaveModelPricingInput,
} from './usage/pricing-store.js';
import { GenerationService } from './services/generation.js';
import { inferCharacterDisplayNameForTemplate } from './templates/browser.js';
import * as templateApi from './templates/template-api.js';
import * as exportApi from './export/export-api.js';
import * as draftApi from './drafts/draft-api.js';
import type { CreateDraftRequest } from './drafts/draft-api.js';
import * as configApi from './config/config-api.js';
import { getFallbackApiKey, resolveConfiguredProvider } from './config/config-api.js';
import { createDownload, slugifyFileName, type DownloadResponse } from './download-response.js';
import { buildOptimizeTextMessages } from '@char-gen/shared';

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
const LEGACY_CUSTOM_THEMES_STORAGE_KEYS = ['bpui.web.themes.custom'];

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

export { APIError } from './api-error.js';
export type { DownloadResponse } from './download-response.js';
export type { CreateDraftRequest } from './drafts/draft-api.js';
import { APIError } from './api-error.js';

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  return readPersistedJson(keys, fallback);
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  writePersistedJson(key, legacyKeys, value);
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
  async getConfig(): Promise<Config> {
    return configApi.getConfig();
  }

  getConfigSnapshot(): Config {
    return configApi.getConfigSnapshot();
  }

  getThemesSnapshot(): ThemePreset[] {
    return getAllThemes();
  }

  async syncConfigFromServer(): Promise<boolean> {
    return configApi.syncConfigFromServer();
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    return configApi.updateConfig(config);
  }

  async testConnection(request: ConnectionTestRequest): Promise<ConnectionTestResult> {
    return configApi.testConnection(request);
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
    return configApi.getModels(provider);
  }

  async refreshModels(provider: string): Promise<{ status: string; model_count: number; error?: string }> {
    return configApi.refreshModels(provider);
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
    return templateApi.getTemplates();
  }

  async listTemplates(): Promise<Template[]> {
    return templateApi.listTemplates();
  }

  async getTemplate(name: string): Promise<Template> {
    return templateApi.getTemplate(name);
  }

  async getTemplateBlueprintContents(name: string): Promise<TemplateBlueprintContentsResponse> {
    return templateApi.getTemplateBlueprintContents(name);
  }

  async createTemplate(template: CreateTemplateRequest): Promise<Template> {
    return templateApi.createTemplate(template);
  }

  async updateTemplate(name: string, template: UpdateTemplateRequest): Promise<Template> {
    return templateApi.updateTemplate(name, template);
  }

  async deleteTemplate(name: string): Promise<{ status: string; name: string }> {
    return templateApi.deleteTemplate(name);
  }

  async duplicateTemplate(name: string, request: DuplicateTemplateRequest): Promise<Template> {
    return templateApi.duplicateTemplate(name, request);
  }

  async validateTemplate(name: string): Promise<TemplateValidationResult> {
    return templateApi.validateTemplate(name);
  }

  async exportTemplate(name: string): Promise<DownloadResponse> {
    return templateApi.exportTemplate(name);
  }

  async importTemplate(file: File): Promise<Template> {
    return templateApi.importTemplate(file);
  }

  async getDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    return draftApi.getDrafts(filters);
  }

  async listDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    return draftApi.listDrafts(filters);
  }

  async getDraft(reviewId: string): Promise<Draft> {
    return draftApi.getDraft(reviewId);
  }

  async createDraft(request: CreateDraftRequest): Promise<Draft> {
    return draftApi.createDraft(request);
  }

  async updateMetadata(
    reviewId: string,
    updates: Partial<DraftMetadata>,
  ): Promise<{ status: string; draft_id: string }> {
    return draftApi.updateMetadata(reviewId, updates);
  }

  async createDraftSnapshot(
    reviewId: string,
    options: { label?: string; reason?: string } = {},
  ): Promise<{ status: 'created'; draft_id: string; snapshot_id: string }> {
    return draftApi.createDraftSnapshot(reviewId, options);
  }

  async restoreDraftSnapshot(
    reviewId: string,
    snapshotId: string,
  ): Promise<{ status: 'restored'; draft_id: string; snapshot_id: string }> {
    return draftApi.restoreDraftSnapshot(reviewId, snapshotId);
  }

  async archiveDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    return draftApi.archiveDraft(reviewId);
  }

  async restoreDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    return draftApi.restoreDraft(reviewId);
  }

  async deleteDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    return draftApi.deleteDraft(reviewId);
  }

  async updateAsset(
    reviewId: string,
    assetName: string,
    content: string,
    options: AssetWriteOptions = {},
  ): Promise<{ status: 'created' | 'updated'; draft_id: string; asset_name: string }> {
    return draftApi.updateAsset(reviewId, assetName, content, options);
  }

  async validateDraft(reviewId: string): Promise<ValidationResponse> {
    return draftApi.validateDraft(reviewId);
  }

  async validatePath(request: ValidatePathRequest): Promise<ValidationResponse> {
    return draftApi.validatePath(request);
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
    return draftApi.getLineage();
  }

  async analyzeSimilarity(request: SimilarityRequest): Promise<SimilarityResult> {
    const left = await draftApi.getDraft(request.draft1_id);
    const right = await draftApi.getDraft(request.draft2_id);
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
    return exportApi.getExportPresets();
  }

  async exportDraft(request: ExportRequest): Promise<DownloadResponse> {
    return exportApi.exportDraft(request);
  }

  async getBlueprints(): Promise<BlueprintList> {
    return blueprintApi.getBlueprints();
  }

  async getWorlds(params?: {
    search?: string;
    genre?: string;
    includePublic?: boolean;
  }): Promise<{ worlds: WorldRecord[] }> {
    return worldApi.getWorlds(params);
  }

  async getWorldCharacterDraftLinks(params?: {
    draftIds?: string[];
  }): Promise<{ links: WorldCharacterDraftLinkRecord[] }> {
    return worldApi.getWorldCharacterDraftLinks(params);
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
    return worldApi.getWorldRelationshipAuditIssues();
  }

  async getWorld(id: string): Promise<{ world: WorldRecord }> {
    return worldApi.getWorld(id);
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
    return worldApi.createWorld(data);
  }

  async updateWorld(id: string, data: Record<string, unknown>): Promise<{ world: WorldRecord }> {
    return worldApi.updateWorld(id, data);
  }

  async deleteWorld(id: string): Promise<{ message: string }> {
    return worldApi.deleteWorld(id);
  }

  async addWorldCharacter(
    worldId: string,
    data: { draftId?: string; characterName: string; role?: string; notes?: string },
  ): Promise<{ character: WorldCharacterRecord }> {
    return worldApi.addWorldCharacter(worldId, data);
  }

  async updateWorldCharacter(
    worldId: string,
    characterId: string,
    data: Record<string, unknown>,
  ): Promise<{ character: WorldCharacterRecord }> {
    return worldApi.updateWorldCharacter(worldId, characterId, data);
  }

  async deleteWorldCharacter(worldId: string, characterId: string): Promise<{ message: string }> {
    return worldApi.deleteWorldCharacter(worldId, characterId);
  }

  async addWorldFaction(
    worldId: string,
    data: { name: string; description?: string; role?: string; notes?: string; tags?: string[]; draftIds?: string[] },
  ): Promise<{ faction: WorldFactionRecord }> {
    return worldApi.addWorldFaction(worldId, data);
  }

  async updateWorldFaction(
    worldId: string,
    factionId: string,
    data: Record<string, unknown>,
  ): Promise<{ faction: WorldFactionRecord }> {
    return worldApi.updateWorldFaction(worldId, factionId, data);
  }

  async deleteWorldFaction(worldId: string, factionId: string): Promise<{ message: string }> {
    return worldApi.deleteWorldFaction(worldId, factionId);
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
    return worldApi.addWorldLocation(worldId, data);
  }

  async updateWorldLocation(
    worldId: string,
    locationId: string,
    data: Record<string, unknown>,
  ): Promise<{ location: WorldLocationRecord }> {
    return worldApi.updateWorldLocation(worldId, locationId, data);
  }

  async deleteWorldLocation(worldId: string, locationId: string): Promise<{ message: string }> {
    return worldApi.deleteWorldLocation(worldId, locationId);
  }

  async addWorldRelationship(
    worldId: string,
    data: { sourceCharacterId: string; targetCharacterId: string; label: string; notes?: string },
  ): Promise<{ relationship: WorldRelationshipRecord }> {
    return worldApi.addWorldRelationship(worldId, data);
  }

  async updateWorldRelationship(
    worldId: string,
    relationshipId: string,
    data: Record<string, unknown>,
  ): Promise<{ relationship: WorldRelationshipRecord }> {
    return worldApi.updateWorldRelationship(worldId, relationshipId, data);
  }

  async deleteWorldRelationship(worldId: string, relationshipId: string): Promise<{ message: string }> {
    return worldApi.deleteWorldRelationship(worldId, relationshipId);
  }

  async getTimeline(id: string): Promise<{ timeline: TimelineRecord }> {
    return worldApi.getTimeline(id);
  }

  async createTimeline(data: {
    worldId: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }): Promise<{ timeline: TimelineRecord }> {
    return worldApi.createTimeline(data);
  }

  async updateTimeline(id: string, data: Record<string, unknown>): Promise<{ timeline: TimelineRecord }> {
    return worldApi.updateTimeline(id, data);
  }

  async deleteTimeline(id: string): Promise<{ message: string }> {
    return worldApi.deleteTimeline(id);
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
    return worldApi.addTimelineEvent(timelineId, data);
  }

  async updateTimelineEvent(
    timelineId: string,
    eventId: string,
    data: Record<string, unknown>,
  ): Promise<{ event: TimelineEventRecord }> {
    return worldApi.updateTimelineEvent(timelineId, eventId, data);
  }

  async deleteTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
    return worldApi.deleteTimelineEvent(timelineId, eventId);
  }

  async getBlueprint(path: string): Promise<Blueprint> {
    return blueprintApi.getBlueprint(path);
  }

  async updateBlueprint(path: string, content: string): Promise<Blueprint> {
    return blueprintApi.updateBlueprint(path, content);
  }

  async deleteBlueprint(path: string): Promise<{ status: 'deleted'; path: string }> {
    return blueprintApi.deleteBlueprint(path);
  }

  async resetBlueprint(path: string): Promise<Blueprint> {
    return blueprintApi.resetBlueprint(path);
  }

  async createBlueprint(path: string, content: string): Promise<Blueprint> {
    return blueprintApi.createBlueprint(path, content);
  }

  async duplicateBlueprint(sourcePath: string, targetPath: string): Promise<Blueprint> {
    return blueprintApi.duplicateBlueprint(sourcePath, targetPath);
  }

  hasBlueprintOverride(path: string): boolean {
    return blueprintApi.hasBlueprintOverride(path);
  }

  getOriginalBlueprintContent(path: string): string | null {
    return blueprintApi.getOriginalBlueprintContent(path);
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
      const draft = await draftApi.getDraft(request.draft_id);
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

  getUsageSummary(options: UsageSummarizeOptions = {}): Promise<UsageSummary> {
    return UsageStorage.summarize(options);
  }

  getComparisonGroupDrafts(groupId: string): Promise<DraftMetadata[]> {
    return draftApi.getComparisonGroupDrafts(groupId);
  }

  updateDraftsMetadata(reviewIds: readonly string[], updates: BulkDraftMetadataPatch): Promise<number> {
    return draftApi.updateDraftsMetadata(reviewIds, updates);
  }

  getUsageRecords(filter: UsageFilter = {}): Promise<UsageRecord[]> {
    return UsageStorage.list(filter);
  }

  clearUsageRecords(): Promise<void> {
    return UsageStorage.clear();
  }

  getModelPricing(): ModelPricing[] {
    return getModelPricing();
  }

  saveModelPricing(input: SaveModelPricingInput): ModelPricing | null {
    return saveModelPricing(input);
  }

  deleteModelPricing(id: string): void {
    deleteModelPricing(id);
  }
}

export const api = new EidolonBrowserAPI();
