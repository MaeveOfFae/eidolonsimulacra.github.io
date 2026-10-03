/**
 * The browser API facade.
 *
 * This file is deliberately a thin delegation shell: every domain lives in
 * its own module under `lib/` — config/models (`config/config-api.ts`),
 * themes (`themes/theme-api.ts` + `themes/builtin-themes.ts`), templates
 * (`templates/template-api.ts`), drafts (`drafts/draft-api.ts`), export
 * (`export/export-api.ts`), generation/chat streams
 * (`generation/generation-api.ts` + `generation/browser-stream.ts`), usage
 * and pricing (`usage/usage-api.ts` + `usage/pricing-store.ts`), blueprints
 * (`blueprints/blueprint-api.ts`), and worlds/timelines
 * (`worlds/lore-api.ts`). Screens depend only on the facade; the public
 * method set is locked by `api.surface.ts`, and each module's behavior is
 * pinned by its `api.<domain>.test.ts` characterization suite.
 */
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
  type DraftAssetApprovalDecision,
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
import * as worldApi from './worlds/lore-api.js';
import * as blueprintApi from './blueprints/blueprint-api.js';
import type { AssetWriteOptions, BulkDraftMetadataPatch } from './storage/draft-db.js';
import * as templateApi from './templates/template-api.js';
import * as exportApi from './export/export-api.js';
import * as draftApi from './drafts/draft-api.js';
import type { CreateDraftRequest } from './drafts/draft-api.js';
import * as configApi from './config/config-api.js';
import type { DownloadResponse } from './download-response.js';
import * as generationApi from './generation/generation-api.js';
import { BrowserStream, type BlueprintPreviewRequest } from './generation/browser-stream.js';
import * as usageApi from './usage/usage-api.js';
import type { SaveModelPricingInput } from './usage/pricing-store.js';
import * as themeApi from './themes/theme-api.js';

export const THEMES_SYNCED_EVENT = 'eidolon:themes-synced';
export const DRAFTS_SYNCED_EVENT = 'eidolon:drafts-synced';

export { APIError } from './api-error.js';
export type { DownloadResponse } from './download-response.js';
export type { CreateDraftRequest } from './drafts/draft-api.js';

export class EidolonBrowserAPI {
  async getConfig(): Promise<Config> {
    return configApi.getConfig();
  }

  getConfigSnapshot(): Config {
    return configApi.getConfigSnapshot();
  }

  getThemesSnapshot(): ThemePreset[] {
    return themeApi.getThemesSnapshot();
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
    return themeApi.getThemes();
  }

  async createTheme(theme: ThemePresetCreate): Promise<ThemePreset> {
    return themeApi.createTheme(theme);
  }

  async exportTheme(name: string): Promise<DownloadResponse> {
    return themeApi.exportTheme(name);
  }

  async importTheme(file: File, options: ThemeImportRequest = {}): Promise<ThemePreset> {
    return themeApi.importTheme(file, options);
  }

  async updateTheme(name: string, theme: ThemePresetUpdate): Promise<ThemePreset> {
    return themeApi.updateTheme(name, theme);
  }

  async duplicateTheme(name: string, request: ThemeDuplicateRequest): Promise<ThemePreset> {
    return themeApi.duplicateTheme(name, request);
  }

  async renameTheme(name: string, request: ThemeRenameRequest): Promise<ThemePreset> {
    return themeApi.renameTheme(name, request);
  }

  async deleteTheme(name: string): Promise<{ status: string; name: string }> {
    return themeApi.deleteTheme(name);
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

  async setAssetApproval(
    reviewId: string,
    assetName: string,
    decision: DraftAssetApprovalDecision | null,
  ): Promise<{ status: string; draft_id: string; asset_name: string }> {
    return draftApi.setAssetApproval(reviewId, assetName, decision);
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
