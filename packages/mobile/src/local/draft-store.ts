import {
  buildDraftLibraryExport,
  getUniqueImportedReviewId,
  inferCharacterDisplayNameFromAssets,
  MAX_CONNECTED_DRAFT_REFERENCES,
  parseDraftImportText,
  type CharacterCardMetadata,
  type CharacterImportOptions,
  type ContentMode,
  type Draft,
  type DraftMetadata,
} from '@char-gen/shared';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { resolveTemplateDefinition } from './content-store';

const DRAFTS_DB_NAME = 'eidolon-mobile-drafts.db';
const LEGACY_DRAFTS_STORAGE_KEY = 'eidolon.mobile.drafts';
const APP_META_MIGRATION_KEY = 'legacy_localstorage_migrated';

type StorageLike = Pick<Storage, 'getItem' | 'removeItem'>;

interface DraftRecordRow {
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
  cardMetadataJson?: string | null;
  archivedAt?: string | null;
  createdAt: number;
  updatedAt: number;
}

interface DraftAssetRow {
  reviewId: string;
  assetName: string;
  content: string;
}

interface DraftTagRow {
  reviewId: string;
  tag: string;
}

interface DraftOrderedAssetRow {
  reviewId: string;
  assetName: string;
}

interface DraftRelationRow {
  reviewId: string;
  relatedReviewId: string;
}

let databasePromise: Promise<SQLiteDatabase> | null = null;

function getStorage(): StorageLike | null {
  const maybeStorage = globalThis as { localStorage?: StorageLike };
  return maybeStorage.localStorage ?? null;
}

function cloneCardMetadata(cardMetadata?: CharacterCardMetadata): CharacterCardMetadata | undefined {
  return cardMetadata ? JSON.parse(JSON.stringify(cardMetadata)) as CharacterCardMetadata : undefined;
}

function parseCardMetadataJson(value?: string | null): CharacterCardMetadata | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null
      ? JSON.parse(JSON.stringify(parsed)) as CharacterCardMetadata
      : undefined;
  } catch {
    return undefined;
  }
}

function cloneMetadata(metadata: DraftMetadata): DraftMetadata {
  return {
    ...metadata,
    tags: metadata.tags ? [...metadata.tags] : undefined,
    parent_drafts: metadata.parent_drafts ? [...metadata.parent_drafts] : undefined,
    connected_drafts: metadata.connected_drafts ? [...metadata.connected_drafts] : undefined,
    component_send_order: metadata.component_send_order ? [...metadata.component_send_order] : undefined,
    card_metadata: cloneCardMetadata(metadata.card_metadata),
  };
}

function cloneDraft(draft: Draft): Draft {
  return {
    path: draft.path,
    metadata: cloneMetadata(draft.metadata),
    assets: { ...draft.assets },
  };
}

function coerceContentMode(value: unknown): ContentMode | undefined {
  if (value === 'SFW' || value === 'NSFW' || value === 'Platform-Safe' || value === 'Auto') {
    return value;
  }

  return undefined;
}

function normalizeStringList(values: string[] | undefined): string[] | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeConnectedDraftIds(reviewId: string, values: string[] | undefined): string[] | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
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

function toTimestamp(value: string | undefined): number {
  if (!value) {
    return Date.now();
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function normalizeDraft(draft: Draft): Draft {
  const nowIso = new Date().toISOString();
  const normalizedAssets = { ...draft.assets };
  const characterName = draft.metadata.character_name || inferCharacterDisplayNameFromAssets(normalizedAssets) || undefined;

  return cloneDraft({
    path: draft.path || draft.metadata.review_id,
    metadata: {
      ...draft.metadata,
      review_id: draft.metadata.review_id,
      favorite: Boolean(draft.metadata.favorite),
      mode: coerceContentMode(draft.metadata.mode),
      created: draft.metadata.created || nowIso,
      modified: draft.metadata.modified || nowIso,
      character_name: characterName,
      tags: normalizeStringList(draft.metadata.tags),
      parent_drafts: normalizeStringList(draft.metadata.parent_drafts),
      connected_drafts: normalizeConnectedDraftIds(draft.metadata.review_id, draft.metadata.connected_drafts),
      component_send_order: normalizeStringList(draft.metadata.component_send_order),
      card_metadata: cloneCardMetadata(draft.metadata.card_metadata),
    },
    assets: normalizedAssets,
  });
}

function isDraftLike(value: unknown): value is Draft {
  return typeof value === 'object'
    && value !== null
    && 'metadata' in value
    && 'assets' in value
    && typeof (value as Draft).metadata?.review_id === 'string'
    && typeof (value as Draft).assets === 'object'
    && (value as Draft).assets !== null;
}

function coerceLegacyDrafts(raw: string): Draft[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is Draft => isDraftLike(entry))
      .map((entry) => normalizeDraft(entry));
  } catch {
    return [];
  }
}

function metadataToRow(metadata: DraftMetadata, createdAt: number, updatedAt: number): Record<string, string | number | null> {
  return {
    $reviewId: metadata.review_id,
    $seed: metadata.seed,
    $favorite: metadata.favorite ? 1 : 0,
    $mode: metadata.mode || null,
    $model: metadata.model || null,
    $createdIso: metadata.created || null,
    $modifiedIso: metadata.modified || null,
    $genre: metadata.genre || null,
    $notes: metadata.notes || null,
    $customInstructions: metadata.custom_instructions || null,
    $characterName: metadata.character_name || null,
    $templateName: metadata.template_name || null,
    $offspringType: metadata.offspring_type || null,
    $cardMetadataJson: metadata.card_metadata ? JSON.stringify(metadata.card_metadata) : null,
    $archivedAt: metadata.archived_at || null,
    $createdAt: createdAt,
    $updatedAt: updatedAt,
  };
}

async function ensureSchema(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS draft_records (
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
      card_metadata_json TEXT,
      archived_at TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS draft_assets (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (review_id, asset_name)
    );
    CREATE TABLE IF NOT EXISTS draft_tags (
      review_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, tag)
    );
    CREATE TABLE IF NOT EXISTS draft_component_send_order (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, asset_name)
    );
    CREATE TABLE IF NOT EXISTS draft_parent_links (
      review_id TEXT NOT NULL,
      parent_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, parent_review_id)
    );
    CREATE TABLE IF NOT EXISTS draft_connected_links (
      review_id TEXT NOT NULL,
      connected_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, connected_review_id)
    );
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_draft_assets_review_id ON draft_assets(review_id);
    CREATE INDEX IF NOT EXISTS idx_draft_tags_review_id ON draft_tags(review_id);
    CREATE INDEX IF NOT EXISTS idx_draft_component_send_order_review_id ON draft_component_send_order(review_id);
    CREATE INDEX IF NOT EXISTS idx_draft_parent_links_review_id ON draft_parent_links(review_id);
    CREATE INDEX IF NOT EXISTS idx_draft_connected_links_review_id ON draft_connected_links(review_id);
  `);

  const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(draft_records)');
  if (!columns.some((column) => column.name === 'card_metadata_json')) {
    await database.execAsync('ALTER TABLE draft_records ADD COLUMN card_metadata_json TEXT;');
  }
}

async function writeDraft(database: SQLiteDatabase, draft: Draft): Promise<Draft> {
  const normalized = normalizeDraft(draft);
  const createdAt = toTimestamp(normalized.metadata.created);
  const updatedAt = toTimestamp(normalized.metadata.modified);

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO draft_records (
        review_id, seed, favorite, mode, model, created_iso, modified_iso, genre, notes,
        custom_instructions, character_name, template_name, offspring_type, card_metadata_json, archived_at, created_at, updated_at
      ) VALUES (
        $reviewId, $seed, $favorite, $mode, $model, $createdIso, $modifiedIso, $genre, $notes,
        $customInstructions, $characterName, $templateName, $offspringType, $cardMetadataJson, $archivedAt, $createdAt, $updatedAt
      )
      ON CONFLICT(review_id) DO UPDATE SET
        seed = excluded.seed,
        favorite = excluded.favorite,
        mode = excluded.mode,
        model = excluded.model,
        created_iso = excluded.created_iso,
        modified_iso = excluded.modified_iso,
        genre = excluded.genre,
        notes = excluded.notes,
        custom_instructions = excluded.custom_instructions,
        character_name = excluded.character_name,
        template_name = excluded.template_name,
        offspring_type = excluded.offspring_type,
        card_metadata_json = excluded.card_metadata_json,
        archived_at = excluded.archived_at,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at`,
      metadataToRow(normalized.metadata, createdAt, updatedAt)
    );

    await database.runAsync('DELETE FROM draft_assets WHERE review_id = $reviewId', { $reviewId: normalized.metadata.review_id });
    await database.runAsync('DELETE FROM draft_tags WHERE review_id = $reviewId', { $reviewId: normalized.metadata.review_id });
    await database.runAsync('DELETE FROM draft_component_send_order WHERE review_id = $reviewId', { $reviewId: normalized.metadata.review_id });
    await database.runAsync('DELETE FROM draft_parent_links WHERE review_id = $reviewId', { $reviewId: normalized.metadata.review_id });
    await database.runAsync('DELETE FROM draft_connected_links WHERE review_id = $reviewId', { $reviewId: normalized.metadata.review_id });

    for (const [assetName, content] of Object.entries(normalized.assets)) {
      await database.runAsync(
        'INSERT INTO draft_assets (review_id, asset_name, content, updated_at) VALUES ($reviewId, $assetName, $content, $updatedAt)',
        {
          $reviewId: normalized.metadata.review_id,
          $assetName: assetName,
          $content: content,
          $updatedAt: updatedAt,
        }
      );
    }

    for (const [index, tag] of (normalized.metadata.tags ?? []).entries()) {
      await database.runAsync(
        'INSERT INTO draft_tags (review_id, tag, sort_order) VALUES ($reviewId, $tag, $sortOrder)',
        {
          $reviewId: normalized.metadata.review_id,
          $tag: tag,
          $sortOrder: index,
        }
      );
    }

    for (const [index, assetName] of (normalized.metadata.component_send_order ?? []).entries()) {
      await database.runAsync(
        'INSERT INTO draft_component_send_order (review_id, asset_name, sort_order) VALUES ($reviewId, $assetName, $sortOrder)',
        {
          $reviewId: normalized.metadata.review_id,
          $assetName: assetName,
          $sortOrder: index,
        }
      );
    }

    for (const [index, parentReviewId] of (normalized.metadata.parent_drafts ?? []).entries()) {
      await database.runAsync(
        'INSERT INTO draft_parent_links (review_id, parent_review_id, sort_order) VALUES ($reviewId, $parentReviewId, $sortOrder)',
        {
          $reviewId: normalized.metadata.review_id,
          $parentReviewId: parentReviewId,
          $sortOrder: index,
        }
      );
    }

    for (const [index, connectedReviewId] of (normalized.metadata.connected_drafts ?? []).entries()) {
      await database.runAsync(
        'INSERT INTO draft_connected_links (review_id, connected_review_id, sort_order) VALUES ($reviewId, $connectedReviewId, $sortOrder)',
        {
          $reviewId: normalized.metadata.review_id,
          $connectedReviewId: connectedReviewId,
          $sortOrder: index,
        }
      );
    }
  });

  return normalized;
}

async function maybeMigrateLegacyDrafts(database: SQLiteDatabase): Promise<void> {
  const migrationRow = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = $key LIMIT 1',
    { $key: APP_META_MIGRATION_KEY }
  );

  if (migrationRow?.value === 'true') {
    return;
  }

  const storage = getStorage();
  const raw = storage?.getItem(LEGACY_DRAFTS_STORAGE_KEY) ?? null;
  const existingCountRow = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM draft_records');
  const existingCount = existingCountRow?.count ?? 0;

  if (raw && existingCount === 0) {
    const drafts = coerceLegacyDrafts(raw);
    for (const draft of drafts) {
      await writeDraft(database, draft);
    }
  }

  await database.runAsync(
    'INSERT INTO app_meta (key, value) VALUES ($key, $value) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    { $key: APP_META_MIGRATION_KEY, $value: 'true' }
  );
  storage?.removeItem(LEGACY_DRAFTS_STORAGE_KEY);
}

async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await openDatabaseAsync(DRAFTS_DB_NAME);
      await ensureSchema(database);
      await maybeMigrateLegacyDrafts(database);
      return database;
    })();
  }

  return databasePromise;
}

function rowToMetadata(
  row: DraftRecordRow,
  tags: string[],
  componentSendOrder: string[],
  parentDrafts: string[],
  connectedDrafts: string[]
): DraftMetadata {
  const metadata: DraftMetadata = {
    review_id: row.reviewId,
    seed: row.seed,
    favorite: Boolean(row.favorite),
  };

  metadata.mode = coerceContentMode(row.mode);
  if (row.model) metadata.model = row.model;
  if (row.createdIso) metadata.created = row.createdIso;
  if (row.modifiedIso) metadata.modified = row.modifiedIso;
  if (row.genre) metadata.genre = row.genre;
  if (row.notes) metadata.notes = row.notes;
  if (row.customInstructions) metadata.custom_instructions = row.customInstructions;
  if (row.characterName) metadata.character_name = row.characterName;
  if (row.templateName) metadata.template_name = row.templateName;
  if (row.offspringType) metadata.offspring_type = row.offspringType;
  const cardMetadata = parseCardMetadataJson(row.cardMetadataJson);
  if (cardMetadata) metadata.card_metadata = cardMetadata;
  if (row.archivedAt) metadata.archived_at = row.archivedAt;
  if (tags.length > 0) metadata.tags = tags;
  if (componentSendOrder.length > 0) metadata.component_send_order = componentSendOrder;
  if (parentDrafts.length > 0) metadata.parent_drafts = parentDrafts;
  if (connectedDrafts.length > 0) metadata.connected_drafts = connectedDrafts;

  return metadata;
}

async function loadDraftMaps(database: SQLiteDatabase, reviewId?: string) {
  const params = reviewId ? { $reviewId: reviewId } : undefined;
  const where = reviewId ? ' WHERE review_id = $reviewId' : '';

  const getAll = async <Row>(query: string): Promise<Row[]> => {
    if (params) {
      return database.getAllAsync<Row>(query, params);
    }

    return database.getAllAsync<Row>(query);
  };

  const draftRows = await getAll<DraftRecordRow>(
    `SELECT review_id AS reviewId, seed, favorite, mode, model, created_iso AS createdIso, modified_iso AS modifiedIso, genre, notes, custom_instructions AS customInstructions, character_name AS characterName, template_name AS templateName, offspring_type AS offspringType, card_metadata_json AS cardMetadataJson, archived_at AS archivedAt, created_at AS createdAt, updated_at AS updatedAt FROM draft_records${where} ORDER BY updated_at DESC`
  );
  const assetRows = await getAll<DraftAssetRow>(
    `SELECT review_id AS reviewId, asset_name AS assetName, content FROM draft_assets${where}`
  );
  const tagRows = await getAll<DraftTagRow>(
    `SELECT review_id AS reviewId, tag FROM draft_tags${where} ORDER BY review_id ASC, sort_order ASC`
  );
  const componentRows = await getAll<DraftOrderedAssetRow>(
    `SELECT review_id AS reviewId, asset_name AS assetName FROM draft_component_send_order${where} ORDER BY review_id ASC, sort_order ASC`
  );
  const parentRows = await getAll<DraftRelationRow>(
    `SELECT review_id AS reviewId, parent_review_id AS relatedReviewId FROM draft_parent_links${where} ORDER BY review_id ASC, sort_order ASC`
  );
  const connectedRows = await getAll<DraftRelationRow>(
    `SELECT review_id AS reviewId, connected_review_id AS relatedReviewId FROM draft_connected_links${where} ORDER BY review_id ASC, sort_order ASC`
  );

  const assetsByDraft = new Map<string, Record<string, string>>();
  for (const row of assetRows) {
    const current = assetsByDraft.get(row.reviewId) ?? {};
    current[row.assetName] = row.content;
    assetsByDraft.set(row.reviewId, current);
  }

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

  return {
    draftRows,
    assetsByDraft,
    tagsByDraft,
    componentOrderByDraft,
    parentDraftsByDraft,
    connectedDraftsByDraft,
  };
}

function draftFromRow(
  row: DraftRecordRow,
  assets: Record<string, string>,
  tags: string[],
  componentSendOrder: string[],
  parentDrafts: string[],
  connectedDrafts: string[]
): Draft {
  return {
    path: row.reviewId,
    metadata: rowToMetadata(row, tags, componentSendOrder, parentDrafts, connectedDrafts),
    assets,
  };
}

export async function getAllDrafts(): Promise<Draft[]> {
  const database = await getDatabase();
  const maps = await loadDraftMaps(database);

  return maps.draftRows.map((row) => draftFromRow(
    row,
    maps.assetsByDraft.get(row.reviewId) ?? {},
    maps.tagsByDraft.get(row.reviewId) ?? [],
    maps.componentOrderByDraft.get(row.reviewId) ?? [],
    maps.parentDraftsByDraft.get(row.reviewId) ?? [],
    maps.connectedDraftsByDraft.get(row.reviewId) ?? [],
  ));
}

export async function getAllMetadata(): Promise<DraftMetadata[]> {
  const drafts = await getAllDrafts();
  return drafts.map((draft) => cloneMetadata(draft.metadata));
}

export async function getDraft(reviewId: string): Promise<Draft | null> {
  const database = await getDatabase();
  const maps = await loadDraftMaps(database, reviewId);
  const row = maps.draftRows[0];
  if (!row) {
    return null;
  }

  return draftFromRow(
    row,
    maps.assetsByDraft.get(row.reviewId) ?? {},
    maps.tagsByDraft.get(row.reviewId) ?? [],
    maps.componentOrderByDraft.get(row.reviewId) ?? [],
    maps.parentDraftsByDraft.get(row.reviewId) ?? [],
    maps.connectedDraftsByDraft.get(row.reviewId) ?? [],
  );
}

export async function saveDraft(draft: Draft): Promise<Draft> {
  const database = await getDatabase();
  return writeDraft(database, draft);
}

export async function updateMetadata(reviewId: string, updates: Partial<DraftMetadata>): Promise<void> {
  const draft = await getDraft(reviewId);
  if (!draft) {
    throw new Error(`Draft ${reviewId} not found`);
  }

  await saveDraft({
    ...draft,
    metadata: {
      ...draft.metadata,
      ...updates,
      review_id: draft.metadata.review_id,
      modified: new Date().toISOString(),
    },
  });
}

export async function updateAsset(reviewId: string, assetName: string, content: string): Promise<'created' | 'updated'> {
  const draft = await getDraft(reviewId);
  if (!draft) {
    throw new Error(`Draft ${reviewId} not found`);
  }

  const existed = Object.prototype.hasOwnProperty.call(draft.assets, assetName);
  const nextAssets = {
    ...draft.assets,
    [assetName]: content,
  };

  await saveDraft({
    ...draft,
    assets: nextAssets,
    metadata: {
      ...draft.metadata,
      modified: new Date().toISOString(),
      character_name: inferCharacterDisplayNameFromAssets(nextAssets) || draft.metadata.character_name,
    },
  });

  return existed ? 'updated' : 'created';
}

export async function deleteDraft(reviewId: string): Promise<void> {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM draft_records WHERE review_id = $reviewId', { $reviewId: reviewId });
    await database.runAsync('DELETE FROM draft_assets WHERE review_id = $reviewId', { $reviewId: reviewId });
    await database.runAsync('DELETE FROM draft_tags WHERE review_id = $reviewId', { $reviewId: reviewId });
    await database.runAsync('DELETE FROM draft_component_send_order WHERE review_id = $reviewId', { $reviewId: reviewId });
    await database.runAsync('DELETE FROM draft_parent_links WHERE review_id = $reviewId', { $reviewId: reviewId });
    await database.runAsync('DELETE FROM draft_connected_links WHERE review_id = $reviewId', { $reviewId: reviewId });
  });
}

export async function exportAllDrafts(): Promise<string> {
  const drafts = await getAllDrafts();
  return buildDraftLibraryExport(drafts);
}

export async function importDrafts(
  raw: string,
  options: { conflictStrategy?: 'remap' | 'merge'; sourceName?: string; template?: CharacterImportOptions['template'] } = {}
): Promise<{ imported: number; remapped: number }> {
  const { drafts, recognizedJsonPayload, explicitEmptyPayload } = parseDraftImportText(
    raw,
    options.sourceName,
    { template: options.template ?? resolveTemplateDefinition() }
  );

  if (drafts.length === 0) {
    if (recognizedJsonPayload || explicitEmptyPayload) {
      return { imported: 0, remapped: 0 };
    }

    throw new Error('Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.');
  }

  const conflictStrategy = options.conflictStrategy ?? 'remap';
  const existingMetadata = await getAllMetadata();
  const usedIds = new Set(existingMetadata.map((metadata) => metadata.review_id));
  const idRemap = new Map<string, string>();
  let remapped = 0;

  const normalizedDrafts = drafts.map((draft) => {
    const sourceId = draft.metadata.review_id;
    let targetId = sourceId;

    if (conflictStrategy === 'remap' && usedIds.has(targetId)) {
      targetId = getUniqueImportedReviewId(usedIds);
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
    await saveDraft({
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