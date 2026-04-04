/**
 * Draft Storage Database (IndexedDB via Dexie.js)
 * Stores character drafts and their assets client-side
 */

import Dexie, { Table } from 'dexie';
import type {
  Draft,
  DraftMetadata,
} from '@char-gen/shared';
import { inferCharacterDisplayNameForTemplate } from '../templates/browser.js';

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
const DRAFT_DB_SCHEMA = {
  drafts: '++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre',
  assets: '++id, draftId, assetName, createdAt',
  tags: '++id, tag, draftId',
} as const;

interface DraftQueryOptions {
  includeArchived?: boolean;
  archivedOnly?: boolean;
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

function getUniqueReviewId(usedIds: Set<string>): string {
  let candidate = createImportedReviewId();
  while (usedIds.has(candidate)) {
    candidate = createImportedReviewId();
  }
  return candidate;
}

function coerceDraftMetadata(raw: unknown, fallbackSeed: string): DraftMetadata {
  const source = isRecord(raw) ? raw : {};
  const reviewIdValue = typeof source.review_id === 'string'
    ? source.review_id
    : typeof source.reviewId === 'string'
      ? source.reviewId
      : '';
  const review_id = reviewIdValue.trim().length > 0
    ? reviewIdValue
    : createImportedReviewId();
  const seedValue = typeof source.seed === 'string' ? source.seed : '';
  const seed = seedValue.trim().length > 0
    ? seedValue
    : fallbackSeed;

  const metadata: DraftMetadata = {
    review_id,
    seed,
    favorite: Boolean(source.favorite),
  };

  metadata.mode = coerceContentMode(source.mode);
  if (typeof source.model === 'string') metadata.model = source.model;
  if (typeof source.created === 'string') metadata.created = source.created;
  else if (typeof source.createdAt === 'string') metadata.created = source.createdAt;
  if (typeof source.modified === 'string') metadata.modified = source.modified;
  else if (typeof source.updatedAt === 'string') metadata.modified = source.updatedAt;
  if (Array.isArray(source.tags)) metadata.tags = source.tags.filter((tag): tag is string => typeof tag === 'string');
  if (typeof source.genre === 'string') metadata.genre = source.genre;
  if (typeof source.notes === 'string') metadata.notes = source.notes;
  if (typeof source.character_name === 'string') metadata.character_name = source.character_name;
  else if (typeof source.characterName === 'string') metadata.character_name = source.characterName;
  if (typeof source.template_name === 'string') metadata.template_name = source.template_name;
  else if (typeof source.templateName === 'string') metadata.template_name = source.templateName;
  const parentDraftsValue = Array.isArray(source.parent_drafts)
    ? source.parent_drafts
    : Array.isArray(source.parentDraftIds)
      ? source.parentDraftIds
      : null;
  if (parentDraftsValue) {
    metadata.parent_drafts = parentDraftsValue.filter((id): id is string => typeof id === 'string');
  }
  if (typeof source.offspring_type === 'string') metadata.offspring_type = source.offspring_type;
  else if (typeof source.offspringType === 'string') metadata.offspring_type = source.offspringType;

  return metadata;
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
  const path = typeof value.path === 'string' && value.path.trim().length > 0
    ? value.path
    : typeof value.reviewId === 'string' && value.reviewId.trim().length > 0
      ? value.reviewId
    : metadata.review_id;

  return { metadata, assets, path };
}

function parseJsonDraftPayload(data: unknown): Draft[] {
  if (Array.isArray(data)) {
    return data.map((entry) => coerceDraft(entry)).filter((entry): entry is Draft => entry !== null);
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.drafts)) {
    return data.drafts.map((entry) => coerceDraft(entry)).filter((entry): entry is Draft => entry !== null);
  }

  if (isRecord(data.draft)) {
    const singleDraft = coerceDraft(data.draft);
    return singleDraft ? [singleDraft] : [];
  }

  const single = coerceDraft(data);
  return single ? [single] : [];
}

function isRecognizedDraftJsonPayload(data: unknown): boolean {
  if (Array.isArray(data)) {
    return true;
  }

  if (!isRecord(data)) {
    return false;
  }

  return Array.isArray(data.drafts)
    || isRecord(data.draft)
    || isRecord(data.assets)
    || isRecord(data.metadata)
    || typeof data.reviewId === 'string'
    || typeof data.review_id === 'string';
}

function normalizeAssetHeading(heading: string): string {
  return heading.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseMarkdownDraftPayload(markdown: string): Draft[] {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const fallbackSeed = titleMatch?.[1]?.trim() || 'Imported draft';
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: Array<{ title: string; start: number; bodyStart: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      title: match[1].trim(),
      start: match.index,
      bodyStart: headingRegex.lastIndex,
    });
  }

  if (headings.length === 0) {
    return [];
  }

  const assets: Record<string, string> = {};
  let metadataSource: unknown = undefined;

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    const rawBody = markdown.slice(current.bodyStart, next ? next.start : markdown.length);
    const body = rawBody.replace(/^\n+/, '').trimEnd().replace(/^\\##/gm, '##');
    if (!body) {
      continue;
    }

    if (current.title.trim().toLowerCase() === 'metadata') {
      try {
        metadataSource = JSON.parse(body);
      } catch {
        // Ignore malformed metadata blocks and still import asset content.
      }
      continue;
    }

    const assetName = normalizeAssetHeading(current.title);
    assets[assetName] = body;
  }

  if (Object.keys(assets).length === 0) {
    return [];
  }

  const metadata = coerceDraftMetadata(metadataSource, fallbackSeed);
  return [{
    path: metadata.review_id,
    metadata,
    assets,
  }];
}

/**
 * Draft database
 */
class DraftDatabase extends Dexie {
  drafts!: Table<DraftEntity>;
  assets!: Table<AssetEntity>;
  tags!: Table<TagEntity>;

  constructor(name: string) {
    super(name);

    // Define schema
    // version 1: initial schema
    this.version(1).stores(DRAFT_DB_SCHEMA);
  }
}

// Global database instance
export const db = new DraftDatabase(DRAFT_DB_NAME);

let migrationPromise: Promise<void> | null = null;

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
    if (!migrationPromise) {
      migrationPromise = migrateLegacyDraftDatabase();
    }

    await migrationPromise;
  }

  /**
   * Save or update a draft
   */
  static async saveDraft(draft: Draft): Promise<void> {
    await this.ensureReady();

    const now = Date.now();
    const inferredCharacterName = inferCharacterDisplayNameForTemplate(
      draft.assets,
      draft.metadata.template_name
    );
    const nextMetadata: DraftMetadata = {
      ...draft.metadata,
      character_name: draft.metadata.character_name || inferredCharacterName,
      created: draft.metadata.created || new Date(now).toISOString(),
      modified: draft.metadata.modified || new Date(now).toISOString(),
    };

    const entity: DraftEntity = {
      reviewId: draft.metadata.review_id,
      metadata: nextMetadata,
      assets: draft.assets,
      createdAt: nextMetadata.created ? new Date(nextMetadata.created).getTime() : now,
      updatedAt: nextMetadata.modified ? new Date(nextMetadata.modified).getTime() : now,
    };

    // Check if draft exists
    const existing = await db.drafts.where('reviewId').equals(draft.metadata.review_id).first();

    if (existing) {
      entity.id = existing.id;
    }

    await db.transaction('rw', db.drafts, db.assets, db.tags, async () => {
      // Save/update draft
      await db.drafts.put(entity);

      // Clear old assets and tags for this draft
      await db.assets.where('draftId').equals(draft.metadata.review_id).delete();
      await db.tags.where('draftId').equals(draft.metadata.review_id).delete();

      // Save assets
      const assetEntities = Object.entries(draft.assets).map(([assetName, content]) => ({
        draftId: draft.metadata.review_id,
        assetName,
        content,
        createdAt: now,
      }));
      await db.assets.bulkAdd(assetEntities);

      // Save tags
      if (draft.metadata.tags) {
        const tagEntities = draft.metadata.tags.map(tag => ({
          tag,
          draftId: draft.metadata.review_id,
          createdAt: now,
        }));
        await db.tags.bulkAdd(tagEntities);
      }
    });
  }

  /**
   * Get a draft by review ID
   */
  static async getDraft(reviewId: string): Promise<Draft | null> {
    await this.ensureReady();

    const entity = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!entity) {
      return null;
    }

    return {
      path: entity.reviewId,
      metadata: entity.metadata,
      assets: entity.assets,
    };
  }

  /**
   * Get asset activity rows for a draft, newest first.
   */
  static async getAssetActivity(reviewId: string): Promise<AssetEntity[]> {
    await this.ensureReady();

    const rows = await db.assets.where('draftId').equals(reviewId).toArray();
    return rows.sort((left, right) => right.createdAt - left.createdAt);
  }

  /**
   * Get all drafts
   */
  static async getAllDrafts(): Promise<Draft[]> {
    await this.ensureReady();

    const entities = await db.drafts.toArray();

    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata))
      .map(entity => ({
        path: entity.reviewId,
        metadata: entity.metadata,
        assets: entity.assets,
      }));
  }

  static async getAllDraftsWithOptions(options: DraftQueryOptions = {}): Promise<Draft[]> {
    await this.ensureReady();

    const entities = await db.drafts.toArray();

    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map(entity => ({
      path: entity.reviewId,
      metadata: entity.metadata,
      assets: entity.assets,
    }));
  }

  /**
   * Get draft metadata for listing
   */
  static async getAllMetadata(options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.toArray();
    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map(e => e.metadata);
  }

  /**
   * Delete a draft
   */
  static async deleteDraft(reviewId: string): Promise<void> {
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
    await this.ensureReady();

    const existing = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!existing) {
      throw new Error(`Draft ${reviewId} not found`);
    }

    const now = Date.now();
    existing.metadata = {
      ...existing.metadata,
      ...updates,
      modified: new Date(now).toISOString(),
    };
    existing.updatedAt = now;

    await db.drafts.put(existing);

    // If tags were updated, update the tags index
    if (updates.tags !== undefined) {
      await db.tags.where('draftId').equals(reviewId).delete();
      if (updates.tags) {
        const tagEntities = updates.tags.map(tag => ({
          tag,
          draftId: reviewId,
          createdAt: now,
        }));
        await db.tags.bulkAdd(tagEntities);
      }
    }
  }

  /**
   * Update an asset content
   */
  static async updateAsset(reviewId: string, assetName: string, content: string): Promise<void> {
    await this.ensureReady();

    const existing = await db.drafts.where('reviewId').equals(reviewId).first();

    if (!existing) {
      throw new Error(`Draft ${reviewId} not found`);
    }

    existing.assets[assetName] = content;
    existing.updatedAt = Date.now();
    existing.metadata = {
      ...existing.metadata,
      modified: new Date(existing.updatedAt).toISOString(),
      character_name: inferCharacterDisplayNameForTemplate(existing.assets, existing.metadata.template_name) || existing.metadata.character_name,
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
  }

  /**
   * Search drafts by query
   */
  static async searchDrafts(query: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const q = query.toLowerCase();

    const entities = await db.drafts.filter(entity => {
      if (!matchesDraftArchiveState(entity.metadata, options)) {
        return false;
      }

      const name = entity.metadata.character_name?.toLowerCase() || '';
      const seed = entity.metadata.seed?.toLowerCase() || '';
      const notes = entity.metadata.notes?.toLowerCase() || '';
      const genre = entity.metadata.genre?.toLowerCase() || '';

      return (
        name.includes(q) ||
        seed.includes(q) ||
        notes.includes(q) ||
        genre.includes(q)
      );
    }).toArray();

    return entities.map(e => e.metadata);
  }

  /**
   * Get drafts by tag
   */
  static async getDraftsByTag(tag: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const draftIds = await db.tags.where('tag').equals(tag).toArray();
    const reviewIds = [...new Set(draftIds.map(t => t.draftId))];

    const entities = await db.drafts
      .where('reviewId')
      .anyOf(reviewIds)
      .toArray();

    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map(e => e.metadata);
  }

  /**
   * Get all tags
   */
  static async getAllTags(): Promise<string[]> {
    await this.ensureReady();

    const tags = await db.tags.toArray();
    const uniqueTags = [...new Set(tags.map(t => t.tag))];
    return uniqueTags.sort();
  }

  /**
   * Get favorite drafts
   */
  static async getFavorites(options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.filter((draft) => draft.metadata.favorite === true && matchesDraftArchiveState(draft.metadata, options)).toArray();
    return entities.map(e => e.metadata);
  }

  /**
   * Get drafts by mode
   */
  static async getDraftsByMode(mode: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.where('metadata.mode').equals(mode).toArray();
    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map(e => e.metadata);
  }

  /**
   * Get drafts by genre
   */
  static async getDraftsByGenre(genre: string, options: DraftQueryOptions = {}): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.where('metadata.genre').equals(genre).toArray();
    return entities
      .filter((entity) => matchesDraftArchiveState(entity.metadata, options))
      .map(e => e.metadata);
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
    await this.ensureReady();

    const all = await db.drafts.toArray();
    const visible = all.filter((entity) => matchesDraftArchiveState(entity.metadata, options));
    const archived = all.filter((entity) => isDraftArchived(entity.metadata));

    const stats = {
      total: visible.length,
      archived: archived.length,
      favorites: visible.filter(e => e.metadata.favorite).length,
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
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      drafts,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import drafts from JSON or markdown draft bundles.
   */
  static async import(
    raw: string,
    options: { conflictStrategy?: 'remap' | 'merge' } = {}
  ): Promise<{ imported: number; remapped: number }> {
    await this.ensureReady();
    const conflictStrategy = options.conflictStrategy ?? 'remap';

    const trimmed = raw.trim();
    if (!trimmed) {
      throw new Error('Import file is empty');
    }

    let drafts: Draft[] = [];
    let recognizedJsonPayload = false;

    try {
      const jsonData = JSON.parse(trimmed);
      recognizedJsonPayload = isRecognizedDraftJsonPayload(jsonData);
      drafts = parseJsonDraftPayload(jsonData);
    } catch {
      drafts = parseMarkdownDraftPayload(raw);
    }

    if (drafts.length === 0) {
      if (recognizedJsonPayload) {
        return { imported: 0, remapped: 0 };
      }
      throw new Error('Invalid draft import format. Supported: exported drafts JSON and combined markdown draft files.');
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
      await this.saveDraft({
        ...draft,
        metadata: {
          ...draft.metadata,
          parent_drafts: parentDrafts,
        },
      });
    }

    return { imported: normalizedDrafts.length, remapped };
  }

  /**
   * Clear all drafts
   */
  static async clearAll(): Promise<void> {
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
