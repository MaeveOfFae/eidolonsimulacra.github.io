/**
 * Draft lifecycle operations for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6.2). Drafts persist through
 * `DraftStorage` (IndexedDB in the browser, SQLite on desktop); listing and
 * filtering run over the full metadata set through the shared filter/list
 * builders; revision snapshots ride `drafts/revision-snapshots.ts` with a
 * pre-restore safeguard snapshot. Behavior is pinned by `api.drafts.test.ts`
 * through the facade.
 */

import {
  applyDraftFilters,
  buildDraftListResponse,
  buildLineageResponse,
  validateDraftAssets,
  type Draft,
  type DraftFilters,
  type DraftListResponse,
  type DraftMetadata,
  type LineageResponse,
  type ValidatePathRequest,
  type ValidationResponse,
} from '@char-gen/shared';
import { APIError } from '../api-error.js';
import { configManager } from '../config/manager.js';
import { isDesktopRuntime } from '../runtime.js';
import { DraftStorage, type AssetWriteOptions, type BulkDraftMetadataPatch } from '../storage/draft-db.js';
import { resolveTemplateDefinition } from '../templates/browser.js';
import { appendDraftRevisionSnapshot, buildDraftRevisionSnapshot } from './revision-snapshots.js';

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

export async function getDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
  const allMetadata = await DraftStorage.getAllMetadata({ includeArchived: true });
  const filtered = applyDraftFilters(allMetadata, filters);
  return buildDraftListResponse(filtered, filtered.length, filtered, allMetadata);
}

export async function listDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
  return getDrafts(filters);
}

export async function getDraft(reviewId: string): Promise<Draft> {
  const draft = await DraftStorage.getDraft(reviewId);
  if (!draft) {
    throw new APIError(404, `Draft ${reviewId} not found`);
  }
  return draft;
}

export async function createDraft(request: CreateDraftRequest): Promise<Draft> {
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
      review_annotations: request.reviewAnnotations ? JSON.parse(JSON.stringify(request.reviewAnnotations)) : undefined,
      merge_provenance: request.mergeProvenance ? JSON.parse(JSON.stringify(request.mergeProvenance)) : undefined,
      merge_history: request.mergeHistory ? JSON.parse(JSON.stringify(request.mergeHistory)) : undefined,
    },
    assets: request.assets ?? {},
  };

  await DraftStorage.saveDraft(draft);

  return draft;
}

export async function updateMetadata(
  reviewId: string,
  updates: Partial<DraftMetadata>,
): Promise<{ status: string; draft_id: string }> {
  // Update locally first
  await DraftStorage.updateMetadata(reviewId, updates);

  return { status: 'updated', draft_id: reviewId };
}

export async function createDraftSnapshot(
  reviewId: string,
  options: { label?: string; reason?: string } = {},
): Promise<{ status: 'created'; draft_id: string; snapshot_id: string }> {
  const draft = await getDraft(reviewId);
  const snapshot = buildDraftRevisionSnapshot(draft, {
    label: options.label ?? `${draft.metadata.character_name || draft.metadata.seed} restore point`,
    reason: options.reason,
  });

  await DraftStorage.updateMetadata(reviewId, {
    revision_snapshots: appendDraftRevisionSnapshot(draft.metadata.revision_snapshots, snapshot),
  });

  return { status: 'created', draft_id: reviewId, snapshot_id: snapshot.id };
}

export async function restoreDraftSnapshot(
  reviewId: string,
  snapshotId: string,
): Promise<{ status: 'restored'; draft_id: string; snapshot_id: string }> {
  const draft = await getDraft(reviewId);
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
      comparison_group: state.comparison_group,
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

export async function archiveDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
  await DraftStorage.updateMetadata(reviewId, {
    archived_at: new Date().toISOString(),
  });

  return { status: 'archived', draft_id: reviewId };
}

export async function restoreDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
  await DraftStorage.updateMetadata(reviewId, {
    archived_at: undefined,
  });

  return { status: 'restored', draft_id: reviewId };
}

export async function deleteDraft(reviewId: string): Promise<{ status: string; draft_id: string }> {
  // Delete locally first
  await DraftStorage.deleteDraft(reviewId);

  return { status: 'deleted', draft_id: reviewId };
}

export async function updateAsset(
  reviewId: string,
  assetName: string,
  content: string,
  options: AssetWriteOptions = {},
): Promise<{ status: 'created' | 'updated'; draft_id: string; asset_name: string }> {
  // Update locally first
  const status = await DraftStorage.updateAsset(reviewId, assetName, content, options);

  return { status, draft_id: reviewId, asset_name: assetName };
}

export async function validateDraft(reviewId: string): Promise<ValidationResponse> {
  const draft = await getDraft(reviewId);
  return validateDraftAssets(draft, { resolveTemplate: resolveTemplateDefinition });
}

export async function validatePath(request: ValidatePathRequest): Promise<ValidationResponse> {
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

export async function getLineage(): Promise<LineageResponse> {
  const metadata = await DraftStorage.getAllMetadata();
  return buildLineageResponse(metadata);
}

export function getComparisonGroupDrafts(groupId: string): Promise<DraftMetadata[]> {
  return DraftStorage.getComparisonGroupDrafts(groupId);
}

export function updateDraftsMetadata(reviewIds: readonly string[], updates: BulkDraftMetadataPatch): Promise<number> {
  return DraftStorage.updateDraftsMetadata(reviewIds, updates);
}
