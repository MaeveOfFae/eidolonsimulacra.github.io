/**
 * The `DraftStorage` API the rest of the app talks to, over whichever backend the runtime provides.
 *
 * Split out of `draft-db.ts`, which is now a barrel over these modules.
 */
import {
  buildDraftLibraryExport,
  normalizeComparisonGroupId,
  parseDraftImportText,
  type CharacterImportOptions,
  type Draft,
  type DraftMetadata,
} from '@char-gen/shared';
import Dexie from 'dexie';
import { inferCharacterDisplayNameForTemplate, resolveTemplateDefinition } from '../../templates/browser.js';
import {
  AssetEntity,
  AssetWriteOptions,
  BulkDraftMetadataPatch,
  DraftEntity,
  DraftQueryOptions,
  LEGACY_DRAFT_DB_NAMES,
  getUniqueReviewId,
  isDraftArchived,
  matchesDraftArchiveState,
  normalizeConnectedDraftIds,
  normalizeStoredDraft,
  normalizeStoredMetadata,
  toDraftStorageError,
} from './draft-entities.js';
import {
  draftEntityToDraft,
  filterDraftEntities,
  isDesktopDraftStoreEnabled,
  withDesktopDraftStore,
} from './draft-sql-desktop.js';
import { db, ensureDraftStorageReady, resetDraftStorageMigration } from './draft-dexie.js';

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

      resetDraftStorageMigration();
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

    resetDraftStorageMigration();
  }
}
