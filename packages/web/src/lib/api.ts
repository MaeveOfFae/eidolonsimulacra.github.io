import {
  type Blueprint,
  type BlueprintList,
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
import { builtinThemes } from './themes/builtin-themes.js';
import { readPersistedJson, writePersistedJson } from './persistence/storage.js';
import * as worldApi from './worlds/lore-api.js';
import * as blueprintApi from './blueprints/blueprint-api.js';
import type { AssetWriteOptions, BulkDraftMetadataPatch } from './storage/draft-db.js';
import * as templateApi from './templates/template-api.js';
import * as exportApi from './export/export-api.js';
import * as draftApi from './drafts/draft-api.js';
import type { CreateDraftRequest } from './drafts/draft-api.js';
import * as configApi from './config/config-api.js';
import { createDownload, slugifyFileName, type DownloadResponse } from './download-response.js';
import * as generationApi from './generation/generation-api.js';
import { BrowserStream, type BlueprintPreviewRequest } from './generation/browser-stream.js';
import * as usageApi from './usage/usage-api.js';
import type { SaveModelPricingInput } from './usage/pricing-store.js';

const CUSTOM_THEMES_STORAGE_KEY = 'eidolon.web.themes.custom';
export const THEMES_SYNCED_EVENT = 'eidolon:themes-synced';
export const DRAFTS_SYNCED_EVENT = 'eidolon:drafts-synced';
const LEGACY_CUSTOM_THEMES_STORAGE_KEYS = ['bpui.web.themes.custom'];

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
    return generationApi.generateSeeds(request);
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
    return generationApi.generate(_request);
  }

  generateAsset(request: GenerateAssetRequest): BrowserStream {
    return generationApi.generateAsset(request);
  }

  previewBlueprint(request: BlueprintPreviewRequest): BrowserStream {
    return generationApi.previewBlueprint(request);
  }

  async finalizeGeneration(request: FinalizeGenerationRequest): Promise<GenerationComplete> {
    return generationApi.finalizeGeneration(request);
  }

  generateBatch(seeds: string[], request: Omit<GenerateBatchRequest, 'seeds'>): BrowserStream {
    return generationApi.generateBatch(seeds, request);
  }

  async getLineage(): Promise<LineageResponse> {
    return draftApi.getLineage();
  }

  async analyzeSimilarity(request: SimilarityRequest): Promise<SimilarityResult> {
    return generationApi.analyzeSimilarity(request);
  }

  generateOffspring(request: OffspringRequest): BrowserStream {
    return generationApi.generateOffspring(request);
  }

  generateOffspringSeed(request: OffspringRequest): BrowserStream {
    return generationApi.generateOffspringSeed(request);
  }

  generateLorebook(request: LorebookGenerationRequest): BrowserStream {
    return generationApi.generateLorebook(request);
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
    return generationApi.chat(request);
  }

  refine(request: RefineRequest): BrowserStream {
    return generationApi.refine(request);
  }

  optimizeText(request: OptimizeTextRequest): BrowserStream {
    return generationApi.optimizeText(request);
  }

  getUsageSummary(options: UsageSummarizeOptions = {}): Promise<UsageSummary> {
    return usageApi.getUsageSummary(options);
  }

  getComparisonGroupDrafts(groupId: string): Promise<DraftMetadata[]> {
    return draftApi.getComparisonGroupDrafts(groupId);
  }

  updateDraftsMetadata(reviewIds: readonly string[], updates: BulkDraftMetadataPatch): Promise<number> {
    return draftApi.updateDraftsMetadata(reviewIds, updates);
  }

  getUsageRecords(filter: UsageFilter = {}): Promise<UsageRecord[]> {
    return usageApi.getUsageRecords(filter);
  }

  clearUsageRecords(): Promise<void> {
    return usageApi.clearUsageRecords();
  }

  getModelPricing(): ModelPricing[] {
    return usageApi.getModelPricing();
  }

  saveModelPricing(input: SaveModelPricingInput): ModelPricing | null {
    return usageApi.saveModelPricing(input);
  }

  deleteModelPricing(id: string): void {
    return usageApi.deleteModelPricing(id);
  }
}

export const api = new EidolonBrowserAPI();
