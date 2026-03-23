import type { Draft, ThemePreset } from '@char-gen/shared';
import { configManager } from '../config/manager.js';
import { parseBlueprintFrontmatter } from '../prompting/blueprint.js';
import { DraftStorage } from '../storage/draft-db.js';
import {
  getBlueprintOverrides,
  getOriginalBlueprintContent,
  getStoredTemplates,
  isCustomBlueprintPath,
} from '../templates/browser.js';
import { serverClient } from './client.js';

export type AutoSyncDomain = 'drafts' | 'themes' | 'templates' | 'blueprints' | 'config';

interface QueueAutoSyncOptions {
  immediate?: boolean;
}

const CUSTOM_THEMES_STORAGE_KEY = 'eidolon.web.themes.custom';
const LEGACY_CUSTOM_THEMES_STORAGE_KEYS = ['bpui.web.themes.custom'];
const AUTO_SYNC_DELAY_MS = 900;

const pendingDomains = new Set<AutoSyncDomain>();

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let activeFlush: Promise<void> | null = null;

function readCustomThemes(): ThemePreset[] {
  if (typeof window === 'undefined') {
    return [];
  }

  for (const key of [CUSTOM_THEMES_STORAGE_KEY, ...LEGACY_CUSTOM_THEMES_STORAGE_KEYS]) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      return JSON.parse(raw) as ThemePreset[];
    } catch {
      return [];
    }
  }

  return [];
}

function mapDraftForSync(draft: Draft) {
  return {
    reviewId: draft.metadata.review_id,
    seed: draft.metadata.seed,
    mode: draft.metadata.mode,
    model: draft.metadata.model,
    characterName: draft.metadata.character_name,
    templateName: draft.metadata.template_name,
    genre: draft.metadata.genre,
    notes: draft.metadata.notes,
    favorite: draft.metadata.favorite,
    tags: draft.metadata.tags || [],
    offspringType: draft.metadata.offspring_type,
    parentDraftIds: draft.metadata.parent_drafts,
    assets: draft.assets,
  };
}

function getRemoteBlueprintPath(path: string): string {
  const isBuiltinBlueprint = getOriginalBlueprintContent(path) !== null && !isCustomBlueprintPath(path);
  if (!isBuiltinBlueprint) {
    return path;
  }

  return `blueprints/overrides/${path.replace(/^blueprints\//, '')}`;
}

async function syncDrafts(): Promise<void> {
  const [localDrafts, remoteResponse] = await Promise.all([
    DraftStorage.getAllDrafts(),
    serverClient.listRemoteDrafts(),
  ]);

  const localReviewIds = new Set(localDrafts.map((draft) => draft.metadata.review_id));
  const remoteDrafts = remoteResponse.drafts || [];

  await Promise.all(
    remoteDrafts
      .filter((draft) => !localReviewIds.has(draft.reviewId))
      .map((draft) => serverClient.deleteRemoteDraft(draft.id).catch((error) => {
        console.warn(`Failed to delete remote draft ${draft.reviewId}:`, error);
      }))
  );

  await serverClient.syncDrafts('push', {
    drafts: localDrafts.map(mapDraftForSync),
  });
}

async function syncThemes(): Promise<void> {
  const localThemes = readCustomThemes();
  const remoteResponse = await serverClient.listRemoteThemes();
  const remoteThemes = remoteResponse.themes || [];
  const localThemeNames = new Set(localThemes.map((theme) => theme.name));

  await Promise.all(
    remoteThemes
      .filter((theme) => !theme.isBuiltin && !localThemeNames.has(theme.name))
      .map((theme) => serverClient.deleteRemoteTheme(theme.name).catch((error) => {
        console.warn(`Failed to delete remote theme ${theme.name}:`, error);
      }))
  );

  await serverClient.syncThemes('push', {
    themes: localThemes.map((theme) => ({
      name: theme.name,
      displayName: theme.display_name,
      description: theme.description,
      author: theme.author,
      tags: theme.tags,
      basedOn: theme.based_on,
      colors: theme.colors,
    })),
  });
}

async function syncTemplates(): Promise<void> {
  const localRecords = getStoredTemplates();
  const remoteResponse = await serverClient.listRemoteTemplates();
  const remoteTemplates = remoteResponse.templates || [];
  const localNames = new Set(localRecords.map((record) => record.template.name));

  await Promise.all(
    remoteTemplates
      .filter((template) => !template.isOfficial && !localNames.has(template.name))
      .map((template) => serverClient.deleteRemoteTemplate(template.name).catch((error) => {
        console.warn(`Failed to delete remote template ${template.name}:`, error);
      }))
  );

  await serverClient.syncTemplates('push', {
    templates: localRecords.map((record) => ({
      name: record.template.name,
      version: record.template.version,
      description: record.template.description,
      isDefault: record.template.is_default,
      assets: record.template.assets,
      blueprintContent: record.blueprint_contents,
    })),
  });
}

async function syncBlueprints(): Promise<void> {
  const overrides = getBlueprintOverrides();
  const entries = Object.entries(overrides);

  const expectedRemotePaths = new Set(entries.map(([path]) => getRemoteBlueprintPath(path)));
  const remoteResponse = await serverClient.listRemoteBlueprints();
  const remoteBlueprints = remoteResponse.blueprints || [];

  await Promise.all(
    remoteBlueprints
      .filter((blueprint) => !blueprint.isBuiltin && !expectedRemotePaths.has(blueprint.path))
      .map((blueprint) => serverClient.deleteRemoteBlueprint(blueprint.path).catch((error) => {
        console.warn(`Failed to delete remote blueprint ${blueprint.path}:`, error);
      }))
  );

  if (entries.length === 0) {
    return;
  }

  await serverClient.syncBlueprints('push', {
    blueprints: entries.map(([path, content]) => {
      const metadata = parseBlueprintFrontmatter(content);
      return {
        path: getRemoteBlueprintPath(path),
        name: metadata.name,
        description: metadata.description,
        invokable: metadata.invokable,
        version: metadata.version,
        category: 'custom' as const,
        content,
      };
    }),
  });
}

async function syncConfig(): Promise<void> {
  await Promise.all([
    serverClient.pushConfig(configManager.getConfig() as unknown as Record<string, unknown>),
    serverClient.pushApiKeys(configManager.getApiKeys()),
  ]);
}

async function syncDomain(domain: AutoSyncDomain): Promise<void> {
  switch (domain) {
    case 'drafts':
      await syncDrafts();
      return;
    case 'themes':
      await syncThemes();
      return;
    case 'templates':
      await syncTemplates();
      return;
    case 'blueprints':
      await syncBlueprints();
      return;
    case 'config':
      await syncConfig();
      return;
  }
}

async function flushPendingAutoSync(): Promise<void> {
  if (activeFlush) {
    return activeFlush;
  }

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
    autoSyncTimer = null;
  }

  activeFlush = (async () => {
    const domains = Array.from(pendingDomains);
    pendingDomains.clear();

    if (domains.length === 0 || !serverClient.isEnabled()) {
      return;
    }

    const status = await serverClient.checkStatus();
    if (!status.authenticated) {
      return;
    }

    for (const domain of domains) {
      try {
        await syncDomain(domain);
      } catch (error) {
        console.warn(`Automatic ${domain} sync failed:`, error);
      }
    }
  })();

  try {
    await activeFlush;
  } finally {
    activeFlush = null;
    if (pendingDomains.size > 0 && !autoSyncTimer) {
      autoSyncTimer = setTimeout(() => {
        autoSyncTimer = null;
        void flushPendingAutoSync();
      }, AUTO_SYNC_DELAY_MS);
    }
  }
}

export function queueAutoSync(
  domains: AutoSyncDomain | AutoSyncDomain[],
  options: QueueAutoSyncOptions = {}
): void {
  const nextDomains = Array.isArray(domains) ? domains : [domains];
  nextDomains.forEach((domain) => pendingDomains.add(domain));

  if (options.immediate) {
    void flushPendingAutoSync();
    return;
  }

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
  }

  autoSyncTimer = setTimeout(() => {
    autoSyncTimer = null;
    void flushPendingAutoSync();
  }, AUTO_SYNC_DELAY_MS);
}
