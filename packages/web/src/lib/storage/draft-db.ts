/**
 * Draft storage service.
 * Uses desktop app data in the Tauri runtime and IndexedDB in the browser.
 */

import Dexie, { Table } from 'dexie';
import type {
  CharacterImportOptions,
  CharacterCardMetadata,
  Draft,
  DraftMergeHistoryEvent,
  DraftMergeProvenance,
  DraftMetadata,
  DraftReviewAnnotations,
  DraftRevisionSnapshot,
  UsageRecord,
} from '@char-gen/shared';
import {
  buildDraftLibraryExport,
  normalizeAssetNameList,
  normalizeAssetRecord,
  coerceDraftMetadata as coerceSharedDraftMetadata,
  MAX_CONNECTED_DRAFT_REFERENCES,
  normalizeComparisonGroupId,
  parseDraftImportText,
} from '@char-gen/shared';
import { isDesktopRuntime } from '../runtime.js';
import { inferCharacterDisplayNameForTemplate, resolveTemplateDefinition } from '../templates/browser.js';

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

function resolveDraftTemplateHint(templateName?: string) {
  return resolveTemplateDefinition(templateName) ?? templateName;
}

function normalizeStoredMetadata(metadata: DraftMetadata): DraftMetadata {
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

function normalizeStoredDraft(draft: Draft): Draft {
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

const DRAFT_DB_NAME = 'EidolonSimulacraDB';
const LEGACY_DRAFT_DB_NAMES = ['CharacterGeneratorDB'];
const DESKTOP_DRAFT_STORE_FILE = 'eidolon-drafts.db';
const DESKTOP_DRAFT_STORE_CONNECTION = `sqlite:${DESKTOP_DRAFT_STORE_FILE}`;
const LEGACY_DESKTOP_DRAFT_STORE_FILE = 'eidolon-drafts.json';
const DESKTOP_DRAFT_SNAPSHOT_FILE = 'eidolon-drafts-sqlite-snapshot.json';
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

interface DesktopDraftStore {
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

interface DraftQueryOptions {
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

function describeStorageError(error: unknown): string {
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

function toDraftStorageError(error: unknown, backend: DraftStorageDiagnostics['backend']): Error {
  const backendLabel =
    backend === 'desktop-app-data'
      ? `desktop draft storage (${DESKTOP_DRAFT_STORE_FILE})`
      : `browser draft storage (${DRAFT_DB_NAME})`;

  return new Error(`${backendLabel}: ${describeStorageError(error)}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createImportedReviewId(): string {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isDraftArchived(metadata: DraftMetadata): boolean {
  return typeof metadata.archived_at === 'string' && metadata.archived_at.trim().length > 0;
}

function matchesDraftArchiveState(metadata: DraftMetadata, options: DraftQueryOptions = {}): boolean {
  if (options.includeArchived) {
    return true;
  }

  const archived = isDraftArchived(metadata);
  if (options.archivedOnly) {
    return archived;
  }

  return !archived;
}

function coerceContentMode(value: unknown): DraftMetadata['mode'] | undefined {
  if (value !== 'SFW' && value !== 'NSFW' && value !== 'Platform-Safe' && value !== 'Auto') {
    return undefined;
  }

  return value;
}

function normalizeConnectedDraftIds(reviewId: string, value: unknown): string[] | undefined {
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

function getUniqueReviewId(usedIds: Set<string>): string {
  let candidate = createImportedReviewId();
  while (usedIds.has(candidate)) {
    candidate = createImportedReviewId();
  }
  return candidate;
}

export function isDesktopDraftStoreEnabled(): boolean {
  return typeof window !== 'undefined' && isDesktopRuntime();
}

let desktopDraftStore: DesktopDraftStore | null = null;
let desktopDraftStoreInitPromise: Promise<void> | null = null;
let desktopDraftStoreQueue: Promise<void> = Promise.resolve();
let draftFsModulePromise: Promise<typeof import('@tauri-apps/plugin-fs')> | null = null;
let draftSqlModulePromise: Promise<typeof import('@tauri-apps/plugin-sql')> | null = null;
let desktopDatabasePromise: Promise<DraftSqlDatabase> | null = null;

export interface DraftSqlDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<unknown>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T[]>;
}

interface SqlDraftRecordRow {
  reviewId: string;
  seed: string;
  favorite: number;
  mode?: string | null;
  model?: string | null;
  createdIso?: string | null;
  modifiedIso?: string | null;
  genre?: string | null;
  notes?: string | null;
  customInstructions?: string | null;
  characterName?: string | null;
  templateName?: string | null;
  offspringType?: string | null;
  comparisonGroup?: string | null;
  cardMetadataJson?: string | null;
  reviewAnnotationsJson?: string | null;
  mergeProvenanceJson?: string | null;
  mergeHistoryJson?: string | null;
  revisionSnapshotsJson?: string | null;
  createdAt: number;
  updatedAt: number;
}

interface SqlLegacyDraftBlobRow {
  reviewId: string;
  metadataJson: string;
  assetsJson: string;
  createdAt: number;
  updatedAt: number;
}

interface SqlDraftAssetRow {
  reviewId: string;
  assetName: string;
  content: string;
  updatedAt: number;
}

interface SqlAssetActivityRow {
  id?: number;
  draftId: string;
  assetName: string;
  content: string;
  createdAt: number;
}

interface SqlMetaRow {
  value: string;
}

interface SqlDraftTagRow {
  reviewId: string;
  tag: string;
  sortOrder: number;
}

interface SqlDraftOrderedAssetRow {
  reviewId: string;
  assetName: string;
  sortOrder: number;
}

interface SqlDraftRelationRow {
  reviewId: string;
  relatedReviewId: string;
  sortOrder: number;
}

function createEmptyDesktopDraftStore(): DesktopDraftStore {
  return {
    version: 1,
    migrationChecked: false,
    drafts: [],
    assetActivity: [],
  };
}

function cloneCardMetadata(cardMetadata?: CharacterCardMetadata): CharacterCardMetadata | undefined {
  return cardMetadata ? (JSON.parse(JSON.stringify(cardMetadata)) as CharacterCardMetadata) : undefined;
}

function cloneReviewAnnotations(reviewAnnotations?: DraftReviewAnnotations): DraftReviewAnnotations | undefined {
  return reviewAnnotations ? (JSON.parse(JSON.stringify(reviewAnnotations)) as DraftReviewAnnotations) : undefined;
}

function cloneMergeProvenance(mergeProvenance?: DraftMergeProvenance): DraftMergeProvenance | undefined {
  return mergeProvenance ? (JSON.parse(JSON.stringify(mergeProvenance)) as DraftMergeProvenance) : undefined;
}

function cloneMergeHistory(mergeHistory?: DraftMergeHistoryEvent[]): DraftMergeHistoryEvent[] | undefined {
  return mergeHistory ? (JSON.parse(JSON.stringify(mergeHistory)) as DraftMergeHistoryEvent[]) : undefined;
}

function cloneRevisionSnapshots(revisionSnapshots?: DraftRevisionSnapshot[]): DraftRevisionSnapshot[] | undefined {
  return revisionSnapshots ? (JSON.parse(JSON.stringify(revisionSnapshots)) as DraftRevisionSnapshot[]) : undefined;
}

function parseCardMetadataJson(value?: string | null): CharacterCardMetadata | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null
      ? (JSON.parse(JSON.stringify(parsed)) as CharacterCardMetadata)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseReviewAnnotationsJson(value?: string | null): DraftReviewAnnotations | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null
      ? (JSON.parse(JSON.stringify(parsed)) as DraftReviewAnnotations)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseMergeProvenanceJson(value?: string | null): DraftMergeProvenance | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null
      ? (JSON.parse(JSON.stringify(parsed)) as DraftMergeProvenance)
      : undefined;
  } catch {
    return undefined;
  }
}

function parseMergeHistoryJson(value?: string | null): DraftMergeHistoryEvent[] | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (JSON.parse(JSON.stringify(parsed)) as DraftMergeHistoryEvent[]) : undefined;
  } catch {
    return undefined;
  }
}

function parseRevisionSnapshotsJson(value?: string | null): DraftRevisionSnapshot[] | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (JSON.parse(JSON.stringify(parsed)) as DraftRevisionSnapshot[]) : undefined;
  } catch {
    return undefined;
  }
}

async function loadDraftFsModule() {
  if (!draftFsModulePromise) {
    draftFsModulePromise = import('@tauri-apps/plugin-fs');
  }

  return draftFsModulePromise;
}

async function loadDraftSqlModule() {
  if (!draftSqlModulePromise) {
    draftSqlModulePromise = import('@tauri-apps/plugin-sql');
  }

  return draftSqlModulePromise;
}

async function ensureDesktopDraftColumn(
  database: DraftSqlDatabase,
  columnName: string,
  columnType: string,
): Promise<void> {
  const columns = await database.select<Array<{ name: string }> extends never ? never : { name: string }>(
    'PRAGMA table_info(draft_records)',
  );
  if (!columns.some((column) => column.name === columnName)) {
    await database.execute(`ALTER TABLE draft_records ADD COLUMN ${columnName} ${columnType}`);
  }
}

async function ensureDesktopDraftSchema(database: DraftSqlDatabase): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS draft_records (
      review_id TEXT PRIMARY KEY NOT NULL,
      seed TEXT NOT NULL,
      favorite INTEGER NOT NULL DEFAULT 0,
      mode TEXT,
      model TEXT,
      created_iso TEXT,
      modified_iso TEXT,
      genre TEXT,
      notes TEXT,
      custom_instructions TEXT,
      character_name TEXT,
      template_name TEXT,
      offspring_type TEXT,
      comparison_group TEXT,
      card_metadata_json TEXT,
      review_annotations_json TEXT,
      merge_provenance_json TEXT,
      merge_history_json TEXT,
      revision_snapshots_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS draft_assets (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (review_id, asset_name)
    )`,
    'CREATE INDEX IF NOT EXISTS idx_draft_assets_review_id ON draft_assets(review_id)',
    `CREATE TABLE IF NOT EXISTS asset_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draft_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS draft_tags (
      review_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, tag)
    )`,
    `CREATE TABLE IF NOT EXISTS draft_component_send_order (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, asset_name)
    )`,
    `CREATE TABLE IF NOT EXISTS draft_parent_links (
      review_id TEXT NOT NULL,
      parent_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, parent_review_id)
    )`,
    `CREATE TABLE IF NOT EXISTS draft_connected_links (
      review_id TEXT NOT NULL,
      connected_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, connected_review_id)
    )`,
    'CREATE INDEX IF NOT EXISTS idx_draft_tags_review_id ON draft_tags(review_id)',
    'CREATE INDEX IF NOT EXISTS idx_draft_component_send_order_review_id ON draft_component_send_order(review_id)',
    'CREATE INDEX IF NOT EXISTS idx_draft_parent_links_review_id ON draft_parent_links(review_id)',
    'CREATE INDEX IF NOT EXISTS idx_draft_connected_links_review_id ON draft_connected_links(review_id)',
    `CREATE TABLE IF NOT EXISTS usage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      total_tokens INTEGER,
      draft_id TEXT,
      template_name TEXT,
      asset_name TEXT,
      error_message TEXT
    )`,
    'CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON usage_records(timestamp)',
  ];

  for (const statement of statements) {
    await database.execute(statement);
  }

  await ensureDesktopDraftColumn(database, 'card_metadata_json', 'TEXT');
  await ensureDesktopDraftColumn(database, 'review_annotations_json', 'TEXT');
  await ensureDesktopDraftColumn(database, 'merge_provenance_json', 'TEXT');
  await ensureDesktopDraftColumn(database, 'merge_history_json', 'TEXT');
  await ensureDesktopDraftColumn(database, 'revision_snapshots_json', 'TEXT');
  await ensureDesktopDraftColumn(database, 'comparison_group', 'TEXT');
}

async function getDesktopDraftDatabase(): Promise<DraftSqlDatabase> {
  if (!isDesktopDraftStoreEnabled()) {
    throw new Error('Local draft persistence is only available in the desktop runtime.');
  }

  if (!desktopDatabasePromise) {
    desktopDatabasePromise = (async () => {
      const Database = (await loadDraftSqlModule()).default;
      const database = await (Database.load(DESKTOP_DRAFT_STORE_CONNECTION) as Promise<DraftSqlDatabase>);
      await ensureDesktopDraftSchema(database);
      return database;
    })();
  }

  return desktopDatabasePromise;
}

/**
 * Raw SQL access to the desktop draft database (schema ensured). Sibling
 * storage modules (usage records) keep their own tables in the same file.
 */
export async function openDesktopDraftDatabase(): Promise<DraftSqlDatabase> {
  return getDesktopDraftDatabase();
}

function coerceDraftMetadata(raw: unknown, fallbackSeed: string): DraftMetadata {
  return coerceSharedDraftMetadata(raw, fallbackSeed);
}

function coerceDraft(value: unknown, fallbackSeed = 'Imported draft'): Draft | null {
  if (!isRecord(value) || !isRecord(value.assets)) {
    return null;
  }

  const assets: Record<string, string> = {};
  for (const [assetName, content] of Object.entries(value.assets)) {
    if (typeof content === 'string') {
      assets[assetName] = content;
    }
  }

  if (Object.keys(assets).length === 0) {
    return null;
  }

  const metadata = coerceDraftMetadata(isRecord(value.metadata) ? value.metadata : value, fallbackSeed);
  const path =
    typeof value.path === 'string' && value.path.trim().length > 0
      ? value.path
      : typeof value.reviewId === 'string' && value.reviewId.trim().length > 0
        ? value.reviewId
        : metadata.review_id;

  return { metadata, assets, path };
}

function normalizeStoredDraftEntity(value: unknown): DraftEntity | null {
  const draft = coerceDraft(value, 'Stored draft');
  if (!draft || !isRecord(value)) {
    return null;
  }

  const createdAt =
    typeof value.createdAt === 'number'
      ? value.createdAt
      : typeof draft.metadata.created === 'string'
        ? Date.parse(draft.metadata.created)
        : Date.now();
  const updatedAt =
    typeof value.updatedAt === 'number'
      ? value.updatedAt
      : typeof draft.metadata.modified === 'string'
        ? Date.parse(draft.metadata.modified)
        : createdAt;

  return {
    id: typeof value.id === 'number' ? value.id : undefined,
    reviewId: draft.metadata.review_id,
    metadata: draft.metadata,
    assets: draft.assets,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
  };
}

function normalizeStoredAssetEntity(value: unknown): AssetEntity | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.draftId !== 'string' || typeof value.assetName !== 'string' || typeof value.content !== 'string') {
    return null;
  }

  const createdAt = typeof value.createdAt === 'number' ? value.createdAt : Date.now();

  return {
    id: typeof value.id === 'number' ? value.id : undefined,
    draftId: value.draftId,
    assetName: value.assetName,
    content: value.content,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
}

function buildAssetRowsFromDraftEntities(entities: DraftEntity[]): AssetEntity[] {
  return entities.flatMap((entity) =>
    Object.entries(entity.assets).map(([assetName, content]) => ({
      draftId: entity.reviewId,
      assetName,
      content,
      createdAt: entity.updatedAt,
    })),
  );
}

function parseDesktopDraftStore(raw: string): DesktopDraftStore {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return createEmptyDesktopDraftStore();
    }

    const drafts = Array.isArray(parsed.drafts)
      ? parsed.drafts
          .map((entry) => normalizeStoredDraftEntity(entry))
          .filter((entry): entry is DraftEntity => entry !== null)
      : [];
    const reviewIds = new Set(drafts.map((entry) => entry.reviewId));
    const assetActivity = Array.isArray(parsed.assetActivity)
      ? parsed.assetActivity
          .map((entry) => normalizeStoredAssetEntity(entry))
          .filter((entry): entry is AssetEntity => entry !== null && reviewIds.has(entry.draftId))
      : [];

    return {
      version: 1,
      migrationChecked: parsed.migrationChecked === true,
      drafts,
      assetActivity: assetActivity.length > 0 ? assetActivity : buildAssetRowsFromDraftEntities(drafts),
    };
  } catch {
    return createEmptyDesktopDraftStore();
  }
}

function normalizeSqlDraftRecordRow(
  row: SqlDraftRecordRow,
  assets: Record<string, string>,
  draftTags: string[],
  componentSendOrder: string[],
  parentDrafts: string[],
  connectedDrafts: string[],
): DraftEntity {
  const metadata: DraftMetadata = {
    review_id: row.reviewId,
    seed: row.seed,
    favorite: row.favorite === 1,
  };

  metadata.mode = coerceContentMode(row.mode);
  if (typeof row.model === 'string' && row.model.length > 0) metadata.model = row.model;
  if (typeof row.createdIso === 'string' && row.createdIso.length > 0) metadata.created = row.createdIso;
  if (typeof row.modifiedIso === 'string' && row.modifiedIso.length > 0) metadata.modified = row.modifiedIso;
  if (typeof row.genre === 'string' && row.genre.length > 0) metadata.genre = row.genre;
  if (typeof row.notes === 'string' && row.notes.length > 0) metadata.notes = row.notes;
  if (typeof row.customInstructions === 'string' && row.customInstructions.length > 0)
    metadata.custom_instructions = row.customInstructions;
  if (typeof row.characterName === 'string' && row.characterName.length > 0)
    metadata.character_name = row.characterName;
  if (typeof row.templateName === 'string' && row.templateName.length > 0) metadata.template_name = row.templateName;
  if (typeof row.offspringType === 'string' && row.offspringType.length > 0)
    metadata.offspring_type = row.offspringType;
  if (typeof row.comparisonGroup === 'string' && row.comparisonGroup.length > 0)
    metadata.comparison_group = row.comparisonGroup;
  const cardMetadata = parseCardMetadataJson(row.cardMetadataJson);
  if (cardMetadata) metadata.card_metadata = cardMetadata;
  const reviewAnnotations = parseReviewAnnotationsJson(row.reviewAnnotationsJson);
  if (reviewAnnotations) metadata.review_annotations = reviewAnnotations;
  const mergeProvenance = parseMergeProvenanceJson(row.mergeProvenanceJson);
  if (mergeProvenance) metadata.merge_provenance = mergeProvenance;
  const mergeHistory = parseMergeHistoryJson(row.mergeHistoryJson);
  if (mergeHistory) metadata.merge_history = mergeHistory;
  const revisionSnapshots = parseRevisionSnapshotsJson(row.revisionSnapshotsJson);
  if (revisionSnapshots) metadata.revision_snapshots = revisionSnapshots;

  const tags = draftTags;
  if (tags.length > 0) metadata.tags = tags;
  const resolvedComponentSendOrder = componentSendOrder;
  if (resolvedComponentSendOrder.length > 0) metadata.component_send_order = resolvedComponentSendOrder;
  const resolvedParentDrafts = parentDrafts;
  if (resolvedParentDrafts.length > 0) metadata.parent_drafts = resolvedParentDrafts;
  const normalizedConnectedDrafts = normalizeConnectedDraftIds(row.reviewId, connectedDrafts);
  if (normalizedConnectedDrafts) metadata.connected_drafts = normalizedConnectedDrafts;

  return {
    reviewId: row.reviewId,
    metadata,
    assets,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizeLegacySqlDraftRow(row: SqlLegacyDraftBlobRow): DraftEntity | null {
  try {
    return normalizeStoredDraftEntity({
      reviewId: row.reviewId,
      metadata: JSON.parse(row.metadataJson),
      assets: JSON.parse(row.assetsJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  } catch {
    return null;
  }
}

function normalizeSqlAssetRow(row: SqlAssetActivityRow): AssetEntity | null {
  return normalizeStoredAssetEntity({
    id: row.id,
    draftId: row.draftId,
    assetName: row.assetName,
    content: row.content,
    createdAt: row.createdAt,
  });
}

function draftEntityToDraft(entity: DraftEntity): Draft {
  return normalizeStoredDraft({
    path: entity.reviewId,
    metadata: entity.metadata,
    assets: entity.assets,
  });
}

function filterDraftEntities(entities: DraftEntity[], options: DraftQueryOptions = {}): DraftEntity[] {
  return entities.filter((entity) => matchesDraftArchiveState(entity.metadata, options));
}

async function persistDesktopDraftStore(store: DesktopDraftStore): Promise<void> {
  const database = await getDesktopDraftDatabase();

  await database.execute('BEGIN');
  try {
    await database.execute('DELETE FROM draft_records');
    await database.execute('DELETE FROM draft_assets');
    await database.execute('DELETE FROM asset_activity');
    await database.execute('DELETE FROM draft_tags');
    await database.execute('DELETE FROM draft_component_send_order');
    await database.execute('DELETE FROM draft_parent_links');
    await database.execute('DELETE FROM draft_connected_links');

    for (const draft of store.drafts) {
      await database.execute(
        'INSERT INTO draft_records (review_id, seed, favorite, mode, model, created_iso, modified_iso, genre, notes, custom_instructions, character_name, template_name, offspring_type, card_metadata_json, review_annotations_json, merge_provenance_json, merge_history_json, revision_snapshots_json, comparison_group, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)',
        [
          draft.reviewId,
          draft.metadata.seed,
          draft.metadata.favorite ? 1 : 0,
          draft.metadata.mode ?? null,
          draft.metadata.model ?? null,
          draft.metadata.created ?? null,
          draft.metadata.modified ?? null,
          draft.metadata.genre ?? null,
          draft.metadata.notes ?? null,
          draft.metadata.custom_instructions ?? null,
          draft.metadata.character_name ?? null,
          draft.metadata.template_name ?? null,
          draft.metadata.offspring_type ?? null,
          draft.metadata.card_metadata ? JSON.stringify(cloneCardMetadata(draft.metadata.card_metadata)) : null,
          draft.metadata.review_annotations
            ? JSON.stringify(cloneReviewAnnotations(draft.metadata.review_annotations))
            : null,
          draft.metadata.merge_provenance
            ? JSON.stringify(cloneMergeProvenance(draft.metadata.merge_provenance))
            : null,
          draft.metadata.merge_history ? JSON.stringify(cloneMergeHistory(draft.metadata.merge_history)) : null,
          draft.metadata.revision_snapshots
            ? JSON.stringify(cloneRevisionSnapshots(draft.metadata.revision_snapshots))
            : null,
          draft.metadata.comparison_group ?? null,
          draft.createdAt,
          draft.updatedAt,
        ],
      );

      for (const [sortOrder, tag] of (draft.metadata.tags ?? []).entries()) {
        await database.execute('INSERT INTO draft_tags (review_id, tag, sort_order) VALUES ($1, $2, $3)', [
          draft.reviewId,
          tag,
          sortOrder,
        ]);
      }

      for (const [sortOrder, assetName] of (draft.metadata.component_send_order ?? []).entries()) {
        await database.execute(
          'INSERT INTO draft_component_send_order (review_id, asset_name, sort_order) VALUES ($1, $2, $3)',
          [draft.reviewId, assetName, sortOrder],
        );
      }

      for (const [sortOrder, parentReviewId] of (draft.metadata.parent_drafts ?? []).entries()) {
        await database.execute(
          'INSERT INTO draft_parent_links (review_id, parent_review_id, sort_order) VALUES ($1, $2, $3)',
          [draft.reviewId, parentReviewId, sortOrder],
        );
      }

      for (const [sortOrder, connectedReviewId] of (draft.metadata.connected_drafts ?? []).entries()) {
        await database.execute(
          'INSERT INTO draft_connected_links (review_id, connected_review_id, sort_order) VALUES ($1, $2, $3)',
          [draft.reviewId, connectedReviewId, sortOrder],
        );
      }

      for (const [assetName, content] of Object.entries(draft.assets)) {
        await database.execute(
          'INSERT INTO draft_assets (review_id, asset_name, content, updated_at) VALUES ($1, $2, $3, $4)',
          [draft.reviewId, assetName, content, draft.updatedAt],
        );
      }
    }

    for (const row of store.assetActivity) {
      await database.execute(
        'INSERT INTO asset_activity (draft_id, asset_name, content, created_at) VALUES ($1, $2, $3, $4)',
        [row.draftId, row.assetName, row.content, row.createdAt],
      );
    }

    await database.execute(
      'INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ['desktop_json_migration_checked', store.migrationChecked ? 'true' : 'false'],
    );

    await database.execute('COMMIT');
  } catch (error) {
    try {
      await database.execute('ROLLBACK');
    } catch {
      // Ignore rollback failures.
    }
    throw error;
  }
}

async function initializeDesktopDraftStore(): Promise<void> {
  const database = await getDesktopDraftDatabase();
  let store = createEmptyDesktopDraftStore();

  try {
    const draftRows = await database.select<SqlDraftRecordRow>(
      'SELECT review_id AS reviewId, seed, favorite, mode, model, created_iso AS createdIso, modified_iso AS modifiedIso, genre, notes, custom_instructions AS customInstructions, character_name AS characterName, template_name AS templateName, offspring_type AS offspringType, comparison_group AS comparisonGroup, card_metadata_json AS cardMetadataJson, review_annotations_json AS reviewAnnotationsJson, merge_provenance_json AS mergeProvenanceJson, merge_history_json AS mergeHistoryJson, revision_snapshots_json AS revisionSnapshotsJson, created_at AS createdAt, updated_at AS updatedAt FROM draft_records',
    );
    const assetRowsForDrafts = await database.select<SqlDraftAssetRow>(
      'SELECT review_id AS reviewId, asset_name AS assetName, content, updated_at AS updatedAt FROM draft_assets',
    );
    const assetsByDraft = new Map<string, Record<string, string>>();
    for (const row of assetRowsForDrafts) {
      const current = assetsByDraft.get(row.reviewId) ?? {};
      current[row.assetName] = row.content;
      assetsByDraft.set(row.reviewId, current);
    }
    const tagRows = await database.select<SqlDraftTagRow>(
      'SELECT review_id AS reviewId, tag, sort_order AS sortOrder FROM draft_tags ORDER BY review_id ASC, sort_order ASC',
      [],
    );
    const componentRows = await database.select<SqlDraftOrderedAssetRow>(
      'SELECT review_id AS reviewId, asset_name AS assetName, sort_order AS sortOrder FROM draft_component_send_order ORDER BY review_id ASC, sort_order ASC',
      [],
    );
    const parentRows = await database.select<SqlDraftRelationRow>(
      'SELECT review_id AS reviewId, parent_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_parent_links ORDER BY review_id ASC, sort_order ASC',
      [],
    );
    const connectedRows = await database.select<SqlDraftRelationRow>(
      'SELECT review_id AS reviewId, connected_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_connected_links ORDER BY review_id ASC, sort_order ASC',
      [],
    );

    const tagsByDraft = new Map<string, string[]>();
    for (const row of tagRows) {
      const current = tagsByDraft.get(row.reviewId) ?? [];
      current.push(row.tag);
      tagsByDraft.set(row.reviewId, current);
    }

    const componentOrderByDraft = new Map<string, string[]>();
    for (const row of componentRows) {
      const current = componentOrderByDraft.get(row.reviewId) ?? [];
      current.push(row.assetName);
      componentOrderByDraft.set(row.reviewId, current);
    }

    const parentDraftsByDraft = new Map<string, string[]>();
    for (const row of parentRows) {
      const current = parentDraftsByDraft.get(row.reviewId) ?? [];
      current.push(row.relatedReviewId);
      parentDraftsByDraft.set(row.reviewId, current);
    }

    const connectedDraftsByDraft = new Map<string, string[]>();
    for (const row of connectedRows) {
      const current = connectedDraftsByDraft.get(row.reviewId) ?? [];
      current.push(row.relatedReviewId);
      connectedDraftsByDraft.set(row.reviewId, current);
    }

    const drafts = draftRows.map((row) =>
      normalizeSqlDraftRecordRow(
        row,
        assetsByDraft.get(row.reviewId) ?? {},
        tagsByDraft.get(row.reviewId) ?? [],
        componentOrderByDraft.get(row.reviewId) ?? [],
        parentDraftsByDraft.get(row.reviewId) ?? [],
        connectedDraftsByDraft.get(row.reviewId) ?? [],
      ),
    );
    const reviewIds = new Set(drafts.map((draft) => draft.reviewId));
    const assetRows = await database.select<SqlAssetActivityRow>(
      'SELECT id, draft_id AS draftId, asset_name AS assetName, content, created_at AS createdAt FROM asset_activity ORDER BY created_at DESC',
    );
    const assetActivity = assetRows
      .map((row) => normalizeSqlAssetRow(row))
      .filter((row): row is AssetEntity => row !== null && reviewIds.has(row.draftId));
    const metaRows = await database.select<SqlMetaRow>('SELECT value FROM app_meta WHERE key = $1 LIMIT 1', [
      'desktop_json_migration_checked',
    ]);

    store = {
      version: 1,
      migrationChecked: metaRows[0]?.value === 'true',
      drafts,
      assetActivity: assetActivity.length > 0 ? assetActivity : buildAssetRowsFromDraftEntities(drafts),
    };
  } catch (error) {
    console.warn('Failed to read desktop SQLite draft store:', error);
  }

  try {
    if (store.drafts.length === 0) {
      const legacyRows = await database.select<SqlLegacyDraftBlobRow>(
        'SELECT review_id AS reviewId, metadata_json AS metadataJson, assets_json AS assetsJson, created_at AS createdAt, updated_at AS updatedAt FROM drafts',
      );
      const legacyDrafts = legacyRows
        .map((row) => normalizeLegacySqlDraftRow(row))
        .filter((row): row is DraftEntity => row !== null);
      if (legacyDrafts.length > 0) {
        store.drafts = legacyDrafts;
        store.assetActivity = buildAssetRowsFromDraftEntities(legacyDrafts);
        store.migrationChecked = false;
      }
    }
  } catch (error) {
    console.warn('Failed to read legacy SQLite blob draft rows:', error);
  }

  const { exists, readTextFile, BaseDirectory } = await loadDraftFsModule();

  try {
    if (
      !store.migrationChecked &&
      (await exists(LEGACY_DESKTOP_DRAFT_STORE_FILE, { baseDir: BaseDirectory.AppData }))
    ) {
      const raw = await readTextFile(LEGACY_DESKTOP_DRAFT_STORE_FILE, { baseDir: BaseDirectory.AppData });
      const legacyStore = parseDesktopDraftStore(raw);
      if (legacyStore.drafts.length > 0) {
        store.drafts = legacyStore.drafts;
        store.assetActivity =
          legacyStore.assetActivity.length > 0
            ? legacyStore.assetActivity
            : buildAssetRowsFromDraftEntities(legacyStore.drafts);
      }
    }
  } catch (error) {
    console.warn('Failed to read legacy desktop draft JSON store:', error);
  }

  if (!store.migrationChecked) {
    try {
      await migrateLegacyDraftDatabase();
      const indexedDbDrafts = await db.drafts.toArray();
      if (indexedDbDrafts.length > 0) {
        const indexedDbAssets = await db.assets.toArray();
        store.drafts = indexedDbDrafts;
        store.assetActivity =
          indexedDbAssets.length > 0 ? indexedDbAssets : buildAssetRowsFromDraftEntities(indexedDbDrafts);
      }
    } catch (error) {
      console.warn('Failed to migrate IndexedDB drafts into desktop app data:', error);
    }

    store.migrationChecked = true;

    try {
      await persistDesktopDraftStore(store);
    } catch (error) {
      console.warn('Failed to persist desktop SQLite draft store after migration:', error);
    }
  }

  desktopDraftStore = store;
}

function queueDesktopDraftStoreTask<T>(task: () => Promise<T>): Promise<T> {
  const scheduled = desktopDraftStoreQueue.then(task, task);
  desktopDraftStoreQueue = scheduled.then(
    () => undefined,
    () => undefined,
  );
  return scheduled;
}

async function withDesktopDraftStore<T>(
  work: (store: DesktopDraftStore) => Promise<T> | T,
  options: { persist?: boolean } = {},
): Promise<T> {
  return queueDesktopDraftStoreTask(async () => {
    if (!desktopDraftStore && !desktopDraftStoreInitPromise) {
      desktopDraftStoreInitPromise = initializeDesktopDraftStore().finally(() => {
        desktopDraftStoreInitPromise = null;
      });
    }

    if (desktopDraftStoreInitPromise) {
      await desktopDraftStoreInitPromise;
    }

    if (!desktopDraftStore) {
      desktopDraftStore = createEmptyDesktopDraftStore();
    }

    const result = await work(desktopDraftStore);

    if (options.persist) {
      await persistDesktopDraftStore(desktopDraftStore);
    }

    return result;
  });
}

/**
 * Draft database
 */
export class DraftDatabase extends Dexie {
  drafts!: Table<DraftEntity>;
  assets!: Table<AssetEntity>;
  tags!: Table<TagEntity>;
  usageRecords!: Table<UsageRecord>;

  constructor(name: string) {
    super(name);

    // Define schema
    // version 1: initial schema
    this.version(1).stores(DRAFT_DB_SCHEMA);
    // version 2: usage telemetry (Insights surface)
    this.version(2).stores(USAGE_DB_SCHEMA);
    // version 3: comparison-group index (multi-model runs)
    this.version(3).stores(COMPARISON_DB_SCHEMA);
  }
}

export async function getDraftStorageDiagnostics(): Promise<DraftStorageDiagnostics> {
  if (isDesktopDraftStoreEnabled()) {
    return withDesktopDraftStore(async (store) => ({
      backend: 'desktop-app-data',
      fileName: DESKTOP_DRAFT_STORE_FILE,
      locationLabel: `AppConfig/${DESKTOP_DRAFT_STORE_FILE}`,
      migrationChecked: store.migrationChecked,
      draftCount: store.drafts.length,
      assetActivityCount: store.assetActivity.length,
    }));
  }

  await ensureDraftStorageReady();
  return {
    backend: 'indexeddb',
    fileName: null,
    locationLabel: DRAFT_DB_NAME,
    migrationChecked: true,
    draftCount: await db.drafts.count(),
    assetActivityCount: await db.assets.count(),
  };
}

export async function exportRawDraftStorage(): Promise<{ fileName: string; contents: string } | null> {
  if (!isDesktopDraftStoreEnabled()) {
    return null;
  }

  return withDesktopDraftStore(async (store) => ({
    fileName: DESKTOP_DRAFT_SNAPSHOT_FILE,
    contents: JSON.stringify(store, null, 2),
  }));
}

// Global database instance
export const db = new DraftDatabase(DRAFT_DB_NAME);

let migrationPromise: Promise<void> | null = null;

async function ensureDraftStorageReady(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateLegacyDraftDatabase();
  }

  await migrationPromise;
}

async function migrateLegacyDraftDatabase(): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    return;
  }

  const existingDraftCount = await db.drafts.count();
  if (existingDraftCount > 0) {
    return;
  }

  for (const legacyName of LEGACY_DRAFT_DB_NAMES) {
    if (!(await Dexie.exists(legacyName))) {
      continue;
    }

    const legacyDb = new DraftDatabase(legacyName);

    try {
      await legacyDb.open();

      const legacyDrafts = await legacyDb.drafts.toArray();
      if (legacyDrafts.length === 0) {
        continue;
      }

      const legacyAssets = await legacyDb.assets.toArray();
      const legacyTags = await legacyDb.tags.toArray();

      await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
        await db.drafts.bulkPut(legacyDrafts);
        if (legacyAssets.length > 0) {
          await db.assets.bulkPut(legacyAssets);
        }
        if (legacyTags.length > 0) {
          await db.tags.bulkPut(legacyTags);
        }
      });

      legacyDb.close();
      await Dexie.delete(legacyName);
      return;
    } catch (error) {
      console.warn(`Failed to migrate legacy draft database ${legacyName}:`, error);
    } finally {
      legacyDb.close();
    }
  }
}

/**
 * Draft Storage Service
 */
export class DraftStorage {
  private static async ensureReady(): Promise<void> {
    await ensureDraftStorageReady();
  }

  /**
   * Drafts that belong to one multi-model comparison group, oldest first.
   */
  static async getComparisonGroupDrafts(groupId: string): Promise<DraftMetadata[]> {
    const normalized = normalizeComparisonGroupId(groupId);
    if (!normalized) {
      return [];
    }

    if (isDesktopDraftStoreEnabled()) {
      try {
        return await withDesktopDraftStore((store) =>
          store.drafts
            .filter((entry) => entry.metadata.comparison_group === normalized)
            .sort((left, right) => left.createdAt - right.createdAt)
            .map((entry) => draftEntityToDraft(entry).metadata),
        );
      } catch (error) {
        throw toDraftStorageError(error, 'desktop-app-data');
      }
    }

    await this.ensureReady();
    const entities = await db.drafts.where('metadata.comparison_group').equals(normalized).toArray();

    return entities
      .sort((left, right) => left.createdAt - right.createdAt)
      .map((entry) => draftEntityToDraft(entry).metadata);
  }

  /**
   * Save or update a draft
   */
  static async saveDraft(draft: Draft): Promise<void> {
    const normalizedDraft = normalizeStoredDraft(draft);

    if (isDesktopDraftStoreEnabled()) {
      try {
        return await withDesktopDraftStore(
          async (store) => {
            const now = Date.now();
            const inferredCharacterName = inferCharacterDisplayNameForTemplate(
              normalizedDraft.assets,
              normalizedDraft.metadata.template_name,
            );
            const nextMetadata: DraftMetadata = {
              ...normalizedDraft.metadata,
              character_name: normalizedDraft.metadata.character_name || inferredCharacterName,
              connected_drafts: normalizeConnectedDraftIds(
                normalizedDraft.metadata.review_id,
                normalizedDraft.metadata.connected_drafts,
              ),
              created: normalizedDraft.metadata.created || new Date(now).toISOString(),
              modified: normalizedDraft.metadata.modified || new Date(now).toISOString(),
            };

            const entity: DraftEntity = {
              reviewId: normalizedDraft.metadata.review_id,
              metadata: nextMetadata,
              assets: normalizedDraft.assets,
              createdAt: nextMetadata.created ? new Date(nextMetadata.created).getTime() : now,
              updatedAt: nextMetadata.modified ? new Date(nextMetadata.modified).getTime() : now,
            };

            const existingIndex = store.drafts.findIndex(
              (entry) => entry.reviewId === normalizedDraft.metadata.review_id,
            );
            if (existingIndex >= 0) {
              entity.id = store.drafts[existingIndex].id;
              store.drafts[existingIndex] = entity;
            } else {
              store.drafts.push(entity);
            }

            store.assetActivity = store.assetActivity.filter(
              (entry) => entry.draftId !== normalizedDraft.metadata.review_id,
            );
            store.assetActivity.push(
              ...Object.entries(normalizedDraft.assets).map(([assetName, content]) => ({
                draftId: normalizedDraft.metadata.review_id,
                assetName,
                content,
                createdAt: now,
              })),
            );
          },
          { persist: true },
        );
      } catch (error) {
        console.error('Desktop draft save failed:', error);
        throw toDraftStorageError(error, 'desktop-app-data');
      }
    }

    try {
      await this.ensureReady();

      const now = Date.now();
      const inferredCharacterName = inferCharacterDisplayNameForTemplate(
        normalizedDraft.assets,
        normalizedDraft.metadata.template_name,
      );
      const nextMetadata: DraftMetadata = {
        ...normalizedDraft.metadata,
        character_name: normalizedDraft.metadata.character_name || inferredCharacterName,
        connected_drafts: normalizeConnectedDraftIds(
          normalizedDraft.metadata.review_id,
          normalizedDraft.metadata.connected_drafts,
        ),
        created: normalizedDraft.metadata.created || new Date(now).toISOString(),
        modified: normalizedDraft.metadata.modified || new Date(now).toISOString(),
      };

      const entity: DraftEntity = {
        reviewId: normalizedDraft.metadata.review_id,
        metadata: nextMetadata,
        assets: normalizedDraft.assets,
        createdAt: nextMetadata.created ? new Date(nextMetadata.created).getTime() : now,
        updatedAt: nextMetadata.modified ? new Date(nextMetadata.modified).getTime() : now,
      };

      const existing = await db.drafts.where('reviewId').equals(normalizedDraft.metadata.review_id).first();

      if (existing) {
        entity.id = existing.id;
      }

      await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
        await db.drafts.put(entity);
        await db.assets.where('draftId').equals(normalizedDraft.metadata.review_id).delete();
        await db.tags.where('draftId').equals(normalizedDraft.metadata.review_id).delete();

        const assetEntities = Object.entries(normalizedDraft.assets).map(([assetName, content]) => ({
          draftId: normalizedDraft.metadata.review_id,
          assetName,
          content,
          createdAt: now,
        }));

        await db.assets.bulkAdd(assetEntities);

        if (normalizedDraft.metadata.tags) {
          const tagEntities = normalizedDraft.metadata.tags.map((tag) => ({
            tag,
            draftId: normalizedDraft.metadata.review_id,
            createdAt: now,
          }));
          await db.tags.bulkAdd(tagEntities);
        }
      });
    } catch (error) {
      console.error('Browser draft save failed:', error);
      throw toDraftStorageError(error, 'indexeddb');
    }
  }

  /**
   * Get a draft by review ID
   */
  static async getDraft(reviewId: string): Promise<Draft | null> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        const entity = store.drafts.find((entry) => entry.reviewId === reviewId);
        return entity ? draftEntityToDraft(entity) : null;
      });
    }

    await this.ensureReady();

    const entity = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!entity) {
      return null;
    }

    return normalizeStoredDraft({
      path: entity.reviewId,
      metadata: entity.metadata,
      assets: entity.assets,
    });
  }

  /**
   * Get asset activity rows for a draft, newest first.
   */
  static async getAssetActivity(reviewId: string): Promise<AssetEntity[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return store.assetActivity
          .filter((entry) => entry.draftId === reviewId)
          .sort((left, right) => right.createdAt - left.createdAt);
      });
    }

    await this.ensureReady();

    const rows = await db.assets.where('draftId').equals(reviewId).toArray();
    return rows.sort((left, right) => right.createdAt - left.createdAt);
  }

  /**
   * Get all drafts
   */
  static async getAllDrafts(): Promise<Draft[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return filterDraftEntities(store.drafts).map((entity) => draftEntityToDraft(entity));
      });
    }

    await this.ensureReady();

    const entities = await db.drafts.toArray();

    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata))
      .map((entity) => ({
        path: entity.reviewId,
        metadata: entity.metadata,
        assets: entity.assets,
      }));
  }

  static async getAllDraftsWithOptions(options: DraftQueryOptions = {}): Promise<Draft[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return filterDraftEntities(store.drafts, options).map((entity) => draftEntityToDraft(entity));
      });
    }

    await this.ensureReady();

    const entities = await db.drafts.toArray();

    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map((entity) => ({
        path: entity.reviewId,
        metadata: entity.metadata,
        assets: entity.assets,
      }));
  }

  /**
   * Get draft metadata for listing
   */
  static async getAllMetadata(options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return filterDraftEntities(store.drafts, options).map((entity) => normalizeStoredMetadata(entity.metadata));
      });
    }

    await this.ensureReady();

    const entities = await db.drafts.toArray();
    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map((entity) => normalizeStoredMetadata(entity.metadata));
  }

  /**
   * Delete a draft
   */
  static async deleteDraft(reviewId: string): Promise<void> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(
        async (store) => {
          store.drafts = store.drafts.filter((entry) => entry.reviewId !== reviewId);
          store.assetActivity = store.assetActivity.filter((entry) => entry.draftId !== reviewId);
        },
        { persist: true },
      );
    }

    await this.ensureReady();

    await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
      await db.drafts.where('reviewId').equals(reviewId).delete();
      await db.assets.where('draftId').equals(reviewId).delete();
      await db.tags.where('draftId').equals(reviewId).delete();
    });
  }

  /**
   * Update draft metadata
   */
  static async updateMetadata(reviewId: string, updates: Partial<DraftMetadata>): Promise<void> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(
        async (store) => {
          const existing = store.drafts.find((entry) => entry.reviewId === reviewId);
          if (!existing) {
            throw new Error(`Draft ${reviewId} not found`);
          }

          const now = Date.now();
          const normalizedConnectedDraftIds =
            updates.connected_drafts === undefined
              ? undefined
              : normalizeConnectedDraftIds(reviewId, updates.connected_drafts);
          existing.metadata = {
            ...existing.metadata,
            ...updates,
            connected_drafts:
              normalizedConnectedDraftIds ??
              (updates.connected_drafts === undefined ? existing.metadata.connected_drafts : undefined),
            modified: new Date(now).toISOString(),
          };
          existing.updatedAt = now;
        },
        { persist: true },
      );
    }

    await this.ensureReady();

    const existing = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!existing) {
      throw new Error(`Draft ${reviewId} not found`);
    }

    const now = Date.now();
    const normalizedConnectedDraftIds =
      updates.connected_drafts === undefined
        ? undefined
        : normalizeConnectedDraftIds(reviewId, updates.connected_drafts);
    existing.metadata = {
      ...existing.metadata,
      ...updates,
      connected_drafts:
        normalizedConnectedDraftIds ??
        (updates.connected_drafts === undefined ? existing.metadata.connected_drafts : undefined),
      modified: new Date(now).toISOString(),
    };
    existing.updatedAt = now;

    await db.drafts.put(existing);

    // If tags were updated, update the tags index
    if (updates.tags !== undefined) {
      await db.tags.where('draftId').equals(reviewId).delete();
      if (updates.tags) {
        const tagEntities = updates.tags.map((tag) => ({
          tag,
          draftId: reviewId,
          createdAt: now,
        }));
        await db.tags.bulkAdd(tagEntities);
      }
    }
  }

  /**
   * Bulk-update editable metadata across many drafts in one pass — a single
   * browser transaction and a single desktop persist instead of one full
   * re-persist per draft. Returns the number of drafts updated.
   */
  static async updateDraftsMetadata(reviewIds: readonly string[], updates: BulkDraftMetadataPatch): Promise<number> {
    const ids = [...new Set(reviewIds.map((id) => id.trim()).filter(Boolean))];
    if (ids.length === 0) {
      return 0;
    }

    const { unarchive, ...patch } = updates;
    const applyPatch = (metadata: DraftMetadata, now: number): DraftMetadata => ({
      ...metadata,
      ...patch,
      ...(unarchive ? { archived_at: undefined } : {}),
      modified: new Date(now).toISOString(),
    });

    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(
        (store) => {
          const now = Date.now();
          let updated = 0;

          for (const id of ids) {
            const existing = store.drafts.find((entry) => entry.reviewId === id);
            if (!existing) {
              continue;
            }
            existing.metadata = applyPatch(existing.metadata, now);
            existing.updatedAt = now;
            updated += 1;
          }

          return updated;
        },
        { persist: true },
      );
    }

    await this.ensureReady();

    let updated = 0;
    const now = Date.now();

    await db.transaction('rw', db.drafts, db.tags, async () => {
      for (const id of ids) {
        const existing = await db.drafts.where('reviewId').equals(id).first();
        if (!existing) {
          continue;
        }

        existing.metadata = applyPatch(existing.metadata, now);
        existing.updatedAt = now;
        await db.drafts.put(existing);

        if (updates.tags !== undefined) {
          await db.tags.where('draftId').equals(id).delete();
          if (updates.tags && updates.tags.length > 0) {
            await db.tags.bulkAdd(
              updates.tags.map((tag) => ({
                tag,
                draftId: id,
                createdAt: now,
              })),
            );
          }
        }

        updated += 1;
      }
    });

    return updated;
  }

  /**
   * Update an asset content
   */
  static async updateAsset(
    reviewId: string,
    assetName: string,
    content: string,
    options: AssetWriteOptions = {},
  ): Promise<'created' | 'updated'> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(
        async (store) => {
          const existing = store.drafts.find((entry) => entry.reviewId === reviewId);

          if (!existing) {
            throw new Error(`Draft ${reviewId} not found`);
          }

          const hadExistingAsset = Object.prototype.hasOwnProperty.call(existing.assets, assetName);
          const currentContent = hadExistingAsset ? existing.assets[assetName] : null;

          if (hadExistingAsset && options.overwrite === false) {
            throw new Error(`Asset ${assetName} already exists. Reload the draft before trying a different action.`);
          }

          if (options.expectedPreviousContent !== undefined && currentContent !== options.expectedPreviousContent) {
            if (hadExistingAsset) {
              throw new Error(
                `Asset ${assetName} changed since you loaded it. Reload the draft before overwriting it.`,
              );
            }

            throw new Error(
              `Asset ${assetName} was created after this session started. Reload the draft before saving.`,
            );
          }

          existing.assets[assetName] = content;
          existing.updatedAt = Date.now();
          existing.metadata = {
            ...existing.metadata,
            modified: new Date(existing.updatedAt).toISOString(),
            character_name:
              inferCharacterDisplayNameForTemplate(existing.assets, existing.metadata.template_name) ||
              existing.metadata.character_name,
          };

          const existingRow = store.assetActivity.find(
            (entry) => entry.draftId === reviewId && entry.assetName === assetName,
          );
          store.assetActivity = store.assetActivity.filter(
            (entry) => !(entry.draftId === reviewId && entry.assetName === assetName),
          );
          store.assetActivity.push({
            id: existingRow?.id,
            draftId: reviewId,
            assetName,
            content,
            createdAt: existing.updatedAt,
          });

          return hadExistingAsset ? 'updated' : 'created';
        },
        { persist: true },
      );
    }

    await this.ensureReady();

    const existing = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!existing) {
      throw new Error(`Draft ${reviewId} not found`);
    }

    const hadExistingAsset = Object.prototype.hasOwnProperty.call(existing.assets, assetName);
    const currentContent = hadExistingAsset ? existing.assets[assetName] : null;

    if (hadExistingAsset && options.overwrite === false) {
      throw new Error(`Asset ${assetName} already exists. Reload the draft before trying a different action.`);
    }

    if (options.expectedPreviousContent !== undefined && currentContent !== options.expectedPreviousContent) {
      if (hadExistingAsset) {
        throw new Error(`Asset ${assetName} changed since you loaded it. Reload the draft before overwriting it.`);
      }

      throw new Error(`Asset ${assetName} was created after this session started. Reload the draft before saving.`);
    }

    existing.assets[assetName] = content;
    existing.updatedAt = Date.now();
    existing.metadata = {
      ...existing.metadata,
      modified: new Date(existing.updatedAt).toISOString(),
      character_name:
        inferCharacterDisplayNameForTemplate(existing.assets, existing.metadata.template_name) ||
        existing.metadata.character_name,
    };

    await db.drafts.put(existing);

    // Keep the optional assets table in sync without relying on a compound index.
    const updatedRows = await db.assets
      .where('draftId')
      .equals(reviewId)
      .and((asset) => asset.assetName === assetName)
      .modify({ content, createdAt: existing.updatedAt });

    if (updatedRows === 0) {
      await db.assets.add({
        draftId: reviewId,
        assetName,
        content,
        createdAt: existing.updatedAt,
      });
    }

    return hadExistingAsset ? 'updated' : 'created';
  }

  /**
   * Search drafts by query
   */
  static async searchDrafts(query: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        const q = query.toLowerCase();

        return store.drafts
          .filter((entity) => {
            if (!matchesDraftArchiveState(entity.metadata, options)) {
              return false;
            }

            const name = entity.metadata.character_name?.toLowerCase() || '';
            const seed = entity.metadata.seed?.toLowerCase() || '';
            const notes = entity.metadata.notes?.toLowerCase() || '';
            const genre = entity.metadata.genre?.toLowerCase() || '';

            return name.includes(q) || seed.includes(q) || notes.includes(q) || genre.includes(q);
          })
          .map((entity) => entity.metadata);
      });
    }

    await this.ensureReady();

    const q = query.toLowerCase();

    const entities = await db.drafts
      .filter((entity) => {
        if (!matchesDraftArchiveState(entity.metadata, options)) {
          return false;
        }

        const name = entity.metadata.character_name?.toLowerCase() || '';
        const seed = entity.metadata.seed?.toLowerCase() || '';
        const notes = entity.metadata.notes?.toLowerCase() || '';
        const genre = entity.metadata.genre?.toLowerCase() || '';

        return name.includes(q) || seed.includes(q) || notes.includes(q) || genre.includes(q);
      })
      .toArray();

    return entities.map((e) => e.metadata);
  }

  /**
   * Get drafts by tag
   */
  static async getDraftsByTag(tag: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return store.drafts
          .filter((entity) => matchesDraftArchiveState(entity.metadata, options) && entity.metadata.tags?.includes(tag))
          .map((entity) => entity.metadata);
      });
    }

    await this.ensureReady();

    const draftIds = await db.tags.where('tag').equals(tag).toArray();
    const reviewIds = [...new Set(draftIds.map((t) => t.draftId))];

    const entities = await db.drafts.where('reviewId').anyOf(reviewIds).toArray();

    return entities.filter((entity) => matchesDraftArchiveState(entity.metadata, options)).map((e) => e.metadata);
  }

  /**
   * Get all tags
   */
  static async getAllTags(): Promise<string[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        const uniqueTags = [...new Set(store.drafts.flatMap((entity) => entity.metadata.tags ?? []))];
        return uniqueTags.sort();
      });
    }

    await this.ensureReady();

    const tags = await db.tags.toArray();
    const uniqueTags = [...new Set(tags.map((t) => t.tag))];
    return uniqueTags.sort();
  }

  /**
   * Get favorite drafts
   */
  static async getFavorites(options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return store.drafts
          .filter((entity) => entity.metadata.favorite === true && matchesDraftArchiveState(entity.metadata, options))
          .map((entity) => entity.metadata);
      });
    }

    await this.ensureReady();

    const entities = await db.drafts
      .filter((draft) => draft.metadata.favorite === true && matchesDraftArchiveState(draft.metadata, options))
      .toArray();
    return entities.map((e) => e.metadata);
  }

  /**
   * Get drafts by mode
   */
  static async getDraftsByMode(mode: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return store.drafts
          .filter((entity) => entity.metadata.mode === mode && matchesDraftArchiveState(entity.metadata, options))
          .map((entity) => entity.metadata);
      });
    }

    await this.ensureReady();

    const entities = await db.drafts.where('metadata.mode').equals(mode).toArray();
    return entities.filter((entity) => matchesDraftArchiveState(entity.metadata, options)).map((e) => e.metadata);
  }

  /**
   * Get drafts by genre
   */
  static async getDraftsByGenre(genre: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        return store.drafts
          .filter((entity) => entity.metadata.genre === genre && matchesDraftArchiveState(entity.metadata, options))
          .map((entity) => entity.metadata);
      });
    }

    await this.ensureReady();

    const entities = await db.drafts.where('metadata.genre').equals(genre).toArray();
    return entities.filter((entity) => matchesDraftArchiveState(entity.metadata, options)).map((e) => e.metadata);
  }

  /**
   * Get draft statistics
   */
  static async getStats(options: DraftQueryOptions = {}): Promise<{
    total: number;
    archived: number;
    favorites: number;
    byMode: Record<string, number>;
    byGenre: Record<string, number>;
  }> {
    if (isDesktopDraftStoreEnabled()) {
      return withDesktopDraftStore(async (store) => {
        const all = store.drafts;
        const visible = filterDraftEntities(all, options);
        const archived = all.filter((entity) => isDraftArchived(entity.metadata));

        const stats = {
          total: visible.length,
          archived: archived.length,
          favorites: visible.filter((entry) => entry.metadata.favorite).length,
          byMode: {} as Record<string, number>,
          byGenre: {} as Record<string, number>,
        };

        for (const entity of visible) {
          const mode = entity.metadata.mode || 'unknown';
          const currentGenre = entity.metadata.genre || 'unknown';

          stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
          stats.byGenre[currentGenre] = (stats.byGenre[currentGenre] || 0) + 1;
        }

        return stats;
      });
    }

    await this.ensureReady();

    const all = await db.drafts.toArray();
    const visible = all.filter((entity) => matchesDraftArchiveState(entity.metadata, options));
    const archived = all.filter((entity) => isDraftArchived(entity.metadata));

    const stats = {
      total: visible.length,
      archived: archived.length,
      favorites: visible.filter((e) => e.metadata.favorite).length,
      byMode: {} as Record<string, number>,
      byGenre: {} as Record<string, number>,
    };

    for (const entity of visible) {
      const mode = entity.metadata.mode || 'unknown';
      const genre = entity.metadata.genre || 'unknown';

      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
      stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export all drafts as JSON
   */
  static async exportAll(): Promise<string> {
    await this.ensureReady();

    const drafts = await this.getAllDraftsWithOptions({ includeArchived: true });
    return buildDraftLibraryExport(drafts);
  }

  /**
   * Import drafts from JSON or markdown draft bundles.
   */
  static async import(
    raw: string,
    options: {
      conflictStrategy?: 'remap' | 'merge';
      sourceName?: string;
      template?: CharacterImportOptions['template'];
    } = {},
  ): Promise<{ imported: number; remapped: number }> {
    await this.ensureReady();
    const conflictStrategy = options.conflictStrategy ?? 'remap';
    const { drafts, recognizedJsonPayload, explicitEmptyPayload } = parseDraftImportText(raw, options.sourceName, {
      template: options.template ?? resolveTemplateDefinition(),
    });

    if (drafts.length === 0) {
      if (recognizedJsonPayload || explicitEmptyPayload) {
        return { imported: 0, remapped: 0 };
      }
      throw new Error(
        'Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.',
      );
    }

    const existingMetadata = await this.getAllMetadata({ includeArchived: true });
    const usedIds = new Set(existingMetadata.map((metadata) => metadata.review_id));
    const idRemap = new Map<string, string>();
    let remapped = 0;

    const normalizedDrafts = drafts.map((draft) => {
      const sourceId = draft.metadata.review_id;
      let targetId = sourceId;

      if (conflictStrategy === 'remap' && usedIds.has(targetId)) {
        targetId = getUniqueReviewId(usedIds);
      }

      usedIds.add(targetId);

      if (targetId !== sourceId) {
        remapped += 1;
        idRemap.set(sourceId, targetId);
      }

      return {
        ...draft,
        path: targetId,
        metadata: {
          ...draft.metadata,
          review_id: targetId,
        },
      };
    });

    for (const draft of normalizedDrafts) {
      const parentDrafts = draft.metadata.parent_drafts?.map((parentId) => idRemap.get(parentId) || parentId);
      const connectedDrafts = draft.metadata.connected_drafts?.map((draftId) => idRemap.get(draftId) || draftId);
      await this.saveDraft({
        ...draft,
        metadata: {
          ...draft.metadata,
          parent_drafts: parentDrafts,
          connected_drafts: connectedDrafts,
        },
      });
    }

    return { imported: normalizedDrafts.length, remapped };
  }

  /**
   * Clear all drafts
   */
  static async clearAll(): Promise<void> {
    if (isDesktopDraftStoreEnabled()) {
      await withDesktopDraftStore(
        async (store) => {
          store.drafts = [];
          store.assetActivity = [];
          store.migrationChecked = true;

          if (typeof indexedDB !== 'undefined') {
            await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
              await db.drafts.clear();
              await db.assets.clear();
              await db.tags.clear();
            });

            for (const legacyName of LEGACY_DRAFT_DB_NAMES) {
              if (await Dexie.exists(legacyName)) {
                await Dexie.delete(legacyName);
              }
            }
          }
        },
        { persist: true },
      );

      migrationPromise = null;
      return;
    }

    await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
      await db.drafts.clear();
      await db.assets.clear();
      await db.tags.clear();
    });

    for (const legacyName of LEGACY_DRAFT_DB_NAMES) {
      if (await Dexie.exists(legacyName)) {
        await Dexie.delete(legacyName);
      }
    }

    migrationPromise = null;
  }
}
