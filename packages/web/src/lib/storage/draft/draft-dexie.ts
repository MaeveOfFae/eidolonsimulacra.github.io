/**
 * The browser store: the Dexie database, its global instance, and the legacy-database migration.
 *
 * Split out of `draft-db.ts`, which is now a barrel over these modules.
 */
import { type UsageRecord } from '@char-gen/shared';
import Dexie, { Table } from 'dexie';
import {
  AssetEntity,
  COMPARISON_DB_SCHEMA,
  DESKTOP_DRAFT_SNAPSHOT_FILE,
  DESKTOP_DRAFT_STORE_FILE,
  DRAFT_DB_NAME,
  DRAFT_DB_SCHEMA,
  DraftEntity,
  DraftStorageDiagnostics,
  LEGACY_DRAFT_DB_NAMES,
  TagEntity,
  USAGE_DB_SCHEMA,
} from './draft-entities.js';
import { isDesktopDraftStoreEnabled, withDesktopDraftStore } from './draft-sql-desktop.js';

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

/**
 * Clears the memoised migration promise so the next readiness check migrates again.
 * `DraftStorage` needs this after it migrates a legacy database itself; module state
 * cannot be assigned through an import, so the owner of the state exposes the reset.
 */
export function resetDraftStorageMigration(): void {
  migrationPromise = null;
}

export async function ensureDraftStorageReady(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateLegacyDraftDatabase();
  }

  await migrationPromise;
}

export async function migrateLegacyDraftDatabase(): Promise<void> {
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
