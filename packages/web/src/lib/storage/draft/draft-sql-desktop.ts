/**
 * The desktop (Tauri) draft store: the SQL connection, its schema, and the record reads and writes that sit on it.
 *
 * Split out of `draft-db.ts`, which is now a barrel over these modules.
 */
import {
  coerceDraftMetadata as coerceSharedDraftMetadata,
  type CharacterCardMetadata,
  type Draft,
  type DraftMergeHistoryEvent,
  type DraftMergeProvenance,
  type DraftMetadata,
  type DraftReviewAnnotations,
  type DraftRevisionSnapshot,
} from '@char-gen/shared';
import { isDesktopRuntime } from '../../runtime.js';
import {
  AssetEntity,
  DESKTOP_DRAFT_STORE_CONNECTION,
  DesktopDraftStore,
  DraftEntity,
  DraftQueryOptions,
  LEGACY_DESKTOP_DRAFT_STORE_FILE,
  coerceContentMode,
  isRecord,
  matchesDraftArchiveState,
  normalizeConnectedDraftIds,
  normalizeStoredDraft,
} from './draft-entities.js';
import { db, migrateLegacyDraftDatabase } from './draft-dexie.js';

export function isDesktopDraftStoreEnabled(): boolean {
  return typeof window !== 'undefined' && isDesktopRuntime();
}

export let desktopDraftStore: DesktopDraftStore | null = null;
export let desktopDraftStoreInitPromise: Promise<void> | null = null;
export let desktopDraftStoreQueue: Promise<void> = Promise.resolve();
export let draftFsModulePromise: Promise<typeof import('@tauri-apps/plugin-fs')> | null = null;
export let draftSqlModulePromise: Promise<typeof import('@tauri-apps/plugin-sql')> | null = null;
export let desktopDatabasePromise: Promise<DraftSqlDatabase> | null = null;

export interface DraftSqlDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<unknown>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T[]>;
}

export interface SqlDraftRecordRow {
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

export interface SqlLegacyDraftBlobRow {
  reviewId: string;
  metadataJson: string;
  assetsJson: string;
  createdAt: number;
  updatedAt: number;
}

export interface SqlDraftAssetRow {
  reviewId: string;
  assetName: string;
  content: string;
  updatedAt: number;
}

export interface SqlAssetActivityRow {
  id?: number;
  draftId: string;
  assetName: string;
  content: string;
  createdAt: number;
}

export interface SqlMetaRow {
  value: string;
}

export interface SqlDraftTagRow {
  reviewId: string;
  tag: string;
  sortOrder: number;
}

export interface SqlDraftOrderedAssetRow {
  reviewId: string;
  assetName: string;
  sortOrder: number;
}

export interface SqlDraftRelationRow {
  reviewId: string;
  relatedReviewId: string;
  sortOrder: number;
}

export function createEmptyDesktopDraftStore(): DesktopDraftStore {
  return {
    version: 1,
    migrationChecked: false,
    drafts: [],
    assetActivity: [],
  };
}

export function cloneCardMetadata(cardMetadata?: CharacterCardMetadata): CharacterCardMetadata | undefined {
  return cardMetadata ? (JSON.parse(JSON.stringify(cardMetadata)) as CharacterCardMetadata) : undefined;
}

export function cloneReviewAnnotations(reviewAnnotations?: DraftReviewAnnotations): DraftReviewAnnotations | undefined {
  return reviewAnnotations ? (JSON.parse(JSON.stringify(reviewAnnotations)) as DraftReviewAnnotations) : undefined;
}

export function cloneMergeProvenance(mergeProvenance?: DraftMergeProvenance): DraftMergeProvenance | undefined {
  return mergeProvenance ? (JSON.parse(JSON.stringify(mergeProvenance)) as DraftMergeProvenance) : undefined;
}

export function cloneMergeHistory(mergeHistory?: DraftMergeHistoryEvent[]): DraftMergeHistoryEvent[] | undefined {
  return mergeHistory ? (JSON.parse(JSON.stringify(mergeHistory)) as DraftMergeHistoryEvent[]) : undefined;
}

export function cloneRevisionSnapshots(
  revisionSnapshots?: DraftRevisionSnapshot[],
): DraftRevisionSnapshot[] | undefined {
  return revisionSnapshots ? (JSON.parse(JSON.stringify(revisionSnapshots)) as DraftRevisionSnapshot[]) : undefined;
}

export function parseCardMetadataJson(value?: string | null): CharacterCardMetadata | undefined {
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

export function parseReviewAnnotationsJson(value?: string | null): DraftReviewAnnotations | undefined {
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

export function parseMergeProvenanceJson(value?: string | null): DraftMergeProvenance | undefined {
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

export function parseMergeHistoryJson(value?: string | null): DraftMergeHistoryEvent[] | undefined {
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

export function parseRevisionSnapshotsJson(value?: string | null): DraftRevisionSnapshot[] | undefined {
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

export async function loadDraftFsModule() {
  if (!draftFsModulePromise) {
    draftFsModulePromise = import('@tauri-apps/plugin-fs');
  }

  return draftFsModulePromise;
}

export async function loadDraftSqlModule() {
  if (!draftSqlModulePromise) {
    draftSqlModulePromise = import('@tauri-apps/plugin-sql');
  }

  return draftSqlModulePromise;
}

export async function ensureDesktopDraftColumn(
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

export async function ensureDesktopDraftSchema(database: DraftSqlDatabase): Promise<void> {
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

export async function getDesktopDraftDatabase(): Promise<DraftSqlDatabase> {
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

export function coerceDraftMetadata(raw: unknown, fallbackSeed: string): DraftMetadata {
  return coerceSharedDraftMetadata(raw, fallbackSeed);
}

export function coerceDraft(value: unknown, fallbackSeed = 'Imported draft'): Draft | null {
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

export function normalizeStoredDraftEntity(value: unknown): DraftEntity | null {
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

export function normalizeStoredAssetEntity(value: unknown): AssetEntity | null {
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

export function buildAssetRowsFromDraftEntities(entities: DraftEntity[]): AssetEntity[] {
  return entities.flatMap((entity) =>
    Object.entries(entity.assets).map(([assetName, content]) => ({
      draftId: entity.reviewId,
      assetName,
      content,
      createdAt: entity.updatedAt,
    })),
  );
}

export function parseDesktopDraftStore(raw: string): DesktopDraftStore {
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

export function normalizeSqlDraftRecordRow(
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

export function normalizeLegacySqlDraftRow(row: SqlLegacyDraftBlobRow): DraftEntity | null {
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

export function normalizeSqlAssetRow(row: SqlAssetActivityRow): AssetEntity | null {
  return normalizeStoredAssetEntity({
    id: row.id,
    draftId: row.draftId,
    assetName: row.assetName,
    content: row.content,
    createdAt: row.createdAt,
  });
}

export function draftEntityToDraft(entity: DraftEntity): Draft {
  return normalizeStoredDraft({
    path: entity.reviewId,
    metadata: entity.metadata,
    assets: entity.assets,
  });
}

export function filterDraftEntities(entities: DraftEntity[], options: DraftQueryOptions = {}): DraftEntity[] {
  return entities.filter((entity) => matchesDraftArchiveState(entity.metadata, options));
}

export async function persistDesktopDraftStore(store: DesktopDraftStore): Promise<void> {
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

export async function initializeDesktopDraftStore(): Promise<void> {
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

export function queueDesktopDraftStoreTask<T>(task: () => Promise<T>): Promise<T> {
  const scheduled = desktopDraftStoreQueue.then(task, task);
  desktopDraftStoreQueue = scheduled.then(
    () => undefined,
    () => undefined,
  );
  return scheduled;
}

export async function withDesktopDraftStore<T>(
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
