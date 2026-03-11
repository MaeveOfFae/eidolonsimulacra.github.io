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
   * Get all drafts
   */
  static async getAllDrafts(): Promise<Draft[]> {
    await this.ensureReady();

    const entities = await db.drafts.toArray();

    return entities.map(entity => ({
      path: entity.reviewId,
      metadata: entity.metadata,
      assets: entity.assets,
    }));
  }

  /**
   * Get draft metadata for listing
   */
  static async getAllMetadata(): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.toArray();
    return entities.map(e => e.metadata);
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

    // Update assets table
    await db.assets
      .where('[draftId+assetName]')
      .equals([reviewId, assetName])
      .modify({ content, createdAt: existing.updatedAt });
  }

  /**
   * Search drafts by query
   */
  static async searchDrafts(query: string): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const q = query.toLowerCase();

    const entities = await db.drafts.filter(entity => {
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
  static async getDraftsByTag(tag: string): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const draftIds = await db.tags.where('tag').equals(tag).toArray();
    const reviewIds = [...new Set(draftIds.map(t => t.draftId))];

    const entities = await db.drafts
      .where('reviewId')
      .anyOf(reviewIds)
      .toArray();

    return entities.map(e => e.metadata);
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
  static async getFavorites(): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.filter(draft => draft.metadata.favorite === true).toArray();
    return entities.map(e => e.metadata);
  }

  /**
   * Get drafts by mode
   */
  static async getDraftsByMode(mode: string): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.where('metadata.mode').equals(mode).toArray();
    return entities.map(e => e.metadata);
  }

  /**
   * Get drafts by genre
   */
  static async getDraftsByGenre(genre: string): Promise<DraftMetadata[]> {
    await this.ensureReady();

    const entities = await db.drafts.where('metadata.genre').equals(genre).toArray();
    return entities.map(e => e.metadata);
  }

  /**
   * Get draft statistics
   */
  static async getStats(): Promise<{
    total: number;
    favorites: number;
    byMode: Record<string, number>;
    byGenre: Record<string, number>;
  }> {
    await this.ensureReady();

    const all = await db.drafts.toArray();

    const stats = {
      total: all.length,
      favorites: all.filter(e => e.metadata.favorite).length,
      byMode: {} as Record<string, number>,
      byGenre: {} as Record<string, number>,
    };

    for (const entity of all) {
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

    const drafts = await this.getAllDrafts();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      drafts,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import drafts from JSON
   */
  static async import(json: string): Promise<void> {
    await this.ensureReady();

    const data = JSON.parse(json);

    if (!data.drafts || !Array.isArray(data.drafts)) {
      throw new Error('Invalid export format');
    }

    for (const draft of data.drafts) {
      await this.saveDraft(draft);
    }
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
