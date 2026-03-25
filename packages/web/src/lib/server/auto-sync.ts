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
  const mode = draft.metadata.mode;
  const normalizedMode = mode === 'SFW' || mode === 'NSFW' || mode === 'Platform-Safe' || mode === 'Auto'
    ? mode
    : undefined;
  const toOptionalString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };
  const normalizedAssets = Object.fromEntries(
    Object.entries(draft.assets).filter((entry): entry is [string, string] => {
      const [assetName, content] = entry;
      return typeof assetName === 'string' && assetName.length > 0 && typeof content === 'string';
    })
  );

  return {
    reviewId: toOptionalString(draft.metadata.review_id) ?? draft.path,
    seed: toOptionalString(draft.metadata.seed) ?? draft.path,
    mode: normalizedMode,
    model: toOptionalString(draft.metadata.model),
    characterName: toOptionalString(draft.metadata.character_name),
    templateName: toOptionalString(draft.metadata.template_name),
    genre: toOptionalString(draft.metadata.genre),
    notes: toOptionalString(draft.metadata.notes),
    favorite: Boolean(draft.metadata.favorite),
    tags: Array.isArray(draft.metadata.tags)
      ? draft.metadata.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [],
    offspringType: toOptionalString(draft.metadata.offspring_type),
    parentDraftIds: Array.isArray(draft.metadata.parent_drafts)
      ? draft.metadata.parent_drafts.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : undefined,
    assets: normalizedAssets,
  };
}

function getRemoteBlueprintPath(path: string): string {
  const isBuiltinBlueprint = getOriginalBlueprintContent(path) !== null && !isCustomBlueprintPath(path);
  if (!isBuiltinBlueprint) {
    return path;
  }

  return `blueprints/overrides/${path.replace(/^blueprints\//, '')}`;
}

function isUuid(value: string | undefined): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function syncDrafts(): Promise<void> {
  const [localDrafts, remoteResponse] = await Promise.all([
    DraftStorage.getAllDrafts(),
    serverClient.listRemoteDrafts(),
  ]);

  const localReviewIds = new Set(localDrafts.map((draft) => draft.metadata.review_id));
  const remoteDrafts = remoteResponse.drafts || [];

  const pushResult = await serverClient.syncDrafts('push', {
    drafts: localDrafts.map(mapDraftForSync),
  }) as { results?: Array<{ reviewId: string; status: string; error?: string }> };

  const failedDraftMessages = (pushResult.results || [])
    .filter((entry) => entry.status === 'error')
    .map((entry) => entry.error ? `${entry.reviewId} (${entry.error})` : entry.reviewId);

  if (failedDraftMessages.length > 0) {
    throw new Error(`Remote draft sync failed for: ${failedDraftMessages.join(', ')}`);
  }

  await Promise.all(
    remoteDrafts
      .filter((draft) => !localReviewIds.has(draft.reviewId))
      .map((draft) => {
        if (!isUuid(draft.id)) {
          console.warn(`Skipping remote draft delete for ${draft.reviewId}: server returned non-UUID id.`);
          return Promise.resolve();
        }

        return serverClient.deleteRemoteDraft(draft.id).catch((error) => {
          console.warn(`Failed to delete remote draft ${draft.reviewId}:`, error);
        });
      })
  );
}

async function syncThemes(): Promise<void> {
  const localThemes = readCustomThemes();
  const remoteResponse = await serverClient.listRemoteThemes();
  const remoteThemes = remoteResponse.themes || [];
  const localThemeNames = new Set(localThemes.map((theme) => theme.name));

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

  await Promise.all(
    remoteThemes
      .filter((theme) => !theme.isBuiltin && !localThemeNames.has(theme.name))
      .map((theme) => serverClient.deleteRemoteTheme(theme.name).catch((error) => {
        console.warn(`Failed to delete remote theme ${theme.name}:`, error);
      }))
  );
}

async function syncTemplates(): Promise<void> {
  const localRecords = getStoredTemplates();
  const remoteResponse = await serverClient.listRemoteTemplates();
  const remoteTemplates = remoteResponse.templates || [];
  const localNames = new Set(localRecords.map((record) => record.template.name));

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

  await Promise.all(
    remoteTemplates
      .filter((template) => !template.isOfficial && !localNames.has(template.name))
      .map((template) => serverClient.deleteRemoteTemplate(template.name).catch((error) => {
        console.warn(`Failed to delete remote template ${template.name}:`, error);
      }))
  );
}

async function syncBlueprints(): Promise<void> {
  const overrides = getBlueprintOverrides();
  const entries = Object.entries(overrides);

  const expectedRemotePaths = new Set(entries.map(([path]) => getRemoteBlueprintPath(path)));
  const remoteResponse = await serverClient.listRemoteBlueprints();
  const remoteBlueprints = remoteResponse.blueprints || [];

  if (entries.length > 0) {
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

  await Promise.all(
    remoteBlueprints
      .filter((blueprint) => !blueprint.isBuiltin && !expectedRemotePaths.has(blueprint.path))
      .map((blueprint) => serverClient.deleteRemoteBlueprint(blueprint.path).catch((error) => {
        console.warn(`Failed to delete remote blueprint ${blueprint.path}:`, error);
      }))
  );
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

/**
 * Manually trigger a flush of pending auto-syncs.
 * Useful when server becomes available or authentication happens.
 * This is called automatically after queueAutoSync, but can be used
 * to immediately push pending data when needed.
 */
export function triggerAutoSyncFlush(): Promise<void> {
  return flushPendingAutoSync();
}
