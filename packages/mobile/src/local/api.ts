import {
  APIError,
  appendDraftRevisionSnapshot,
  applyDraftFilters,
  buildDraftExportArtifact,
  buildDraftRevisionSnapshot,
  buildMissingTemplateBlueprintWarnings,
  buildStoredTemplateRecord,
  buildDraftListResponse,
  buildLineageResponse,
  buildSimilarityResult,
  createEngine,
  fetchProviderModels,
  getFallbackModels,
  inferCharacterDisplayNameFromAssets,
  unwrapSingleCodeFence,
  validateDraftAssets,
  validateTemplate,
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
  type GenerationComplete,
  type LineageResponse,
  type LLMProvider,
  type LorebookGenerationRequest,
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
import { getStoredDeviceConfig, updateStoredDeviceConfig } from '../storage/device-config';
import { deleteDraft, getAllMetadata, getDraft, saveDraft, updateAsset, updateMetadata } from './draft-store';
import {
  buildLorebookMessages,
  buildLorebookReferenceSuites,
  normalizeLorebookReferenceIds,
  resolveLorebookBlueprintContent,
  resolveLorebookBlueprintPath,
  resolveLorebookBlueprintPathFromCatalog,
} from '../lib/lorebook';
import {
  getAllTemplateRecords,
  getBlueprintCatalog,
  getBlueprintList,
  getBlueprintOverrides,
  getOriginalBlueprintContent,
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
import {
  EXPORT_PRESETS,
  MODEL_CACHE_TTL_MS,
  createDownload,
  createReviewId,
  getConfiguredBaseUrl,
  getFallbackApiKey,
  modelsCache,
  resolveConfiguredProvider,
  slugifyFileName,
} from './api/config';
import {
  buildChatMessages,
  buildDraftPriorAssets,
  buildOffspringSeedMessages,
  buildPerAssetMessages,
  buildSeedMessages,
  buildSimilarityMessages,
  parseSeedOutput,
} from './api/prompts';
import type { MobileGenerateRequest } from './api/prompts';
import { LocalStream, collectStreamedContent, runGeneration } from './api/streaming';
export type { LocalStreamEvent } from './api/stream-types';

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
    // Ollama (Cloud) and Custom only ever use their own key slot.
    const ownKeyOnly = provider === 'ollama' || provider === 'custom';
    const apiKey = ownKeyOnly
      ? config.api_keys[provider]
      : config.api_keys[provider] || getFallbackApiKey(config.api_keys);

    // Only Custom runs keyless (local servers); Ollama Cloud needs its key too.
    if (provider !== 'custom' && !apiKey) {
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
    // Ollama (Cloud) and Custom only ever use their own key slot.
    const ownKeyOnly = typedProvider === 'ollama' || typedProvider === 'custom';
    const apiKey = ownKeyOnly
      ? config.api_keys[typedProvider]
      : config.api_keys[typedProvider] || getFallbackApiKey(config.api_keys);
    const cacheKey = `${provider}|${baseUrl}|${apiKey ? 'auth' : 'anon'}`;
    const cached = modelsCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < MODEL_CACHE_TTL_MS) {
      return { ...cached.response, cached: true };
    }

    if (typedProvider === 'custom' && !baseUrl) {
      return {
        provider,
        models: [],
        cached: true,
        error:
          'Set an API base URL for the Custom provider in Settings (for a local Ollama server: http://localhost:11434/v1).',
      };
    }

    const fallbackModels = getFallbackModels(typedProvider);
    // Custom (local servers, gateways) lists keyless; every other provider
    // needs its key (Ollama Cloud included).
    if (!apiKey && typedProvider !== 'custom') {
      return {
        provider,
        models: fallbackModels,
        cached: true,
        error: 'No API key configured for provider model lookup.',
      };
    }

    try {
      const response = await fetchProviderModels(typedProvider, apiKey ?? '', baseUrl, {
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

  generateLorebook(request: LorebookGenerationRequest): LocalStream {
    return new LocalStream(async ({ emit, signal }) => {
      const draftIds = normalizeLorebookReferenceIds(request.draft_ids);
      if (draftIds.length === 0) {
        emit('error', { error: 'Select at least one reference draft to generate a lorebook packet.' });
        return;
      }

      emit('status', { stage: 'loading_references', progress: 0.1 });

      const drafts = await Promise.all(draftIds.map((draftId) => getDraft(draftId)));
      const referenceSuites = buildLorebookReferenceSuites(drafts);
      if (referenceSuites.length === 0) {
        emit('error', {
          error: 'The selected drafts did not contain enough usable reference context for lorebook generation.',
        });
        return;
      }

      emit('status', { stage: 'building_prompt', progress: 0.18 });

      const blueprintPath = resolveLorebookBlueprintPathFromCatalog(
        getBlueprintList(),
        resolveLorebookBlueprintPath(getStoredDeviceConfig().feature_blueprints, request.blueprint_path),
      );
      const messages = buildLorebookMessages({
        referenceSuites,
        blueprintContent: resolveLorebookBlueprintContent({
          requested: request.blueprint_content,
          catalog: getBlueprintCatalog().get(blueprintPath)?.content,
          bundled: getOriginalBlueprintContent(blueprintPath),
        }),
        focus: request.focus,
      });

      emit('status', { stage: 'generating', progress: 0.24 });

      const content = await collectStreamedContent(
        messages,
        signal,
        (chunk) => emit('chunk', { content: chunk }),
        (stage, progress, asset) => emit('status', { stage, progress, asset }),
        { start: 0.28, end: 0.92 },
      );

      if (!signal.aborted) {
        emit('complete', { content });
      }
    });
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

  async archiveDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    await updateMetadata(reviewId, {
      archived_at: new Date().toISOString(),
    });

    return { status: 'archived', draft_id: reviewId };
  }

  async restoreDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
    await updateMetadata(reviewId, {
      archived_at: undefined,
    });

    return { status: 'restored', draft_id: reviewId };
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
        checkpointSession: true,
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
