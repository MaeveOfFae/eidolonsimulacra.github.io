/**
 * Entities, IndexedDB table schemas and the coercion helpers shared by the storage layers.
 *
 * Split out of `draft-db.ts`, which is now a barrel over these modules.
 */
import {
  MAX_CONNECTED_DRAFT_REFERENCES,
  normalizeAssetNameList,
  normalizeAssetRecord,
  type Draft,
  type DraftMetadata,
} from '@char-gen/shared';
import { resolveTemplateDefinition } from '../../templates/browser.js';

/**
 * Draft entity for IndexedDB
 */
export interface DraftEntity {
  id?: number;
  reviewId: string; // Primary key for app logic
  metadata: DraftMetadata;
  assets: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Asset entity for IndexedDB (optional - for better querying)
 */
export interface AssetEntity {
  id?: number;
  draftId: string;
  assetName: string;
  content: string;
  createdAt: number;
}

export function resolveDraftTemplateHint(templateName?: string) {
  return resolveTemplateDefinition(templateName) ?? templateName;
}

export function normalizeStoredMetadata(metadata: DraftMetadata): DraftMetadata {
  const templateHint = resolveDraftTemplateHint(metadata.template_name);
  const componentSendOrder = metadata.component_send_order
    ? normalizeAssetNameList(metadata.component_send_order, templateHint)
    : undefined;

  return {
    ...metadata,
    ...(metadata.component_send_order
      ? { component_send_order: componentSendOrder && componentSendOrder.length > 0 ? componentSendOrder : undefined }
      : {}),
  };
}

export function normalizeStoredDraft(draft: Draft): Draft {
  const templateHint = resolveDraftTemplateHint(draft.metadata.template_name);

  return {
    ...draft,
    metadata: normalizeStoredMetadata(draft.metadata),
    assets: normalizeAssetRecord(draft.assets, templateHint),
  };
}

/**
 * Tag entity for indexing
 */
export interface TagEntity {
  id?: number;
  tag: string;
  draftId: string;
  createdAt: number;
}

export const DRAFT_DB_NAME = 'EidolonSimulacraDB';
export const LEGACY_DRAFT_DB_NAMES = ['CharacterGeneratorDB'];
export const DESKTOP_DRAFT_STORE_FILE = 'eidolon-drafts.db';
export const DESKTOP_DRAFT_STORE_CONNECTION = `sqlite:${DESKTOP_DRAFT_STORE_FILE}`;
export const LEGACY_DESKTOP_DRAFT_STORE_FILE = 'eidolon-drafts.json';
export const DESKTOP_DRAFT_SNAPSHOT_FILE = 'eidolon-drafts-sqlite-snapshot.json';
export const DRAFT_DB_SCHEMA = {
  drafts:
    '++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre',
  assets: '++id, draftId, assetName, createdAt',
  tags: '++id, tag, draftId',
} as const;

/**
 * version 2 (additive): per-call LLM usage telemetry for the Insights surface.
 */
export const USAGE_DB_SCHEMA = {
  usageRecords: '++id, timestamp, provider, model, kind, status, draftId, templateName, assetName',
} as const;

/**
 * version 3 (additive): index for multi-model comparison groups.
 */
export const COMPARISON_DB_SCHEMA = {
  drafts:
    '++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre, metadata.comparison_group',
} as const;

export interface DesktopDraftStore {
  version: 1;
  migrationChecked: boolean;
  drafts: DraftEntity[];
  assetActivity: AssetEntity[];
}

export interface DraftStorageDiagnostics {
  backend: 'desktop-app-data' | 'indexeddb';
  fileName: string | null;
  locationLabel: string;
  migrationChecked: boolean;
  draftCount: number;
  assetActivityCount: number;
}

export interface DraftQueryOptions {
  includeArchived?: boolean;
  archivedOnly?: boolean;
}

export interface AssetWriteOptions {
  overwrite?: boolean;
  expectedPreviousContent?: string | null;
}

/**
 * The editable metadata subset bulk operations may touch. Identity, lineage,
 * and merge history are deliberately not bulk-editable. `unarchive` clears
 * the archive marker (an absent `archived_at` cannot express that intent).
 */
export interface BulkDraftMetadataPatch {
  favorite?: boolean;
  genre?: string;
  notes?: string;
  mode?: DraftMetadata['mode'];
  tags?: string[];
  archived_at?: string;
  unarchive?: boolean;
}

export function describeStorageError(error: unknown): string {
  if (error instanceof Error) {
    const baseMessage = error.message?.trim() || error.name || 'Unknown storage error';

    if (error.cause) {
      const causeMessage = describeStorageError(error.cause);
      if (causeMessage && causeMessage !== baseMessage) {
        return `${baseMessage} (${causeMessage})`;
      }
    }

    return baseMessage;
  }

  if (typeof error === 'string') {
    return error.trim() || 'Unknown storage error';
  }

  if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
    return String(error);
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const messageFields = ['message', 'error', 'reason', 'details', 'description'];

    for (const field of messageFields) {
      const value = record[field];
      if (typeof value === 'string' && value.trim()) {
        const code = typeof record.code === 'string' && record.code.trim() ? ` [${record.code.trim()}]` : '';
        return `${value.trim()}${code}`;
      }
    }

    try {
      const serialized = JSON.stringify(record);
      if (serialized && serialized !== '{}') {
        return serialized;
      }
    } catch {
      // Fall through to generic fallback.
    }
  }

  return 'Unknown storage error';
}

export function toDraftStorageError(error: unknown, backend: DraftStorageDiagnostics['backend']): Error {
  const backendLabel =
    backend === 'desktop-app-data'
      ? `desktop draft storage (${DESKTOP_DRAFT_STORE_FILE})`
      : `browser draft storage (${DRAFT_DB_NAME})`;

  return new Error(`${backendLabel}: ${describeStorageError(error)}`);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function createImportedReviewId(): string {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isDraftArchived(metadata: DraftMetadata): boolean {
  return typeof metadata.archived_at === 'string' && metadata.archived_at.trim().length > 0;
}

export function matchesDraftArchiveState(metadata: DraftMetadata, options: DraftQueryOptions = {}): boolean {
  if (options.includeArchived) {
    return true;
  }

  const archived = isDraftArchived(metadata);
  if (options.archivedOnly) {
    return archived;
  }

  return !archived;
}

export function coerceContentMode(value: unknown): DraftMetadata['mode'] | undefined {
  if (value !== 'SFW' && value !== 'NSFW' && value !== 'Platform-Safe' && value !== 'Auto') {
    return undefined;
  }

  return value;
}

export function normalizeConnectedDraftIds(reviewId: string, value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim();
    if (!trimmed || trimmed === reviewId || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized.length > 0 ? normalized : undefined;
}

export function getUniqueReviewId(usedIds: Set<string>): string {
  let candidate = createImportedReviewId();
  while (usedIds.has(candidate)) {
    candidate = createImportedReviewId();
  }
  return candidate;
}
