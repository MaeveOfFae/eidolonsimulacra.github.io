import type { ApiKeys, Config, Draft } from './types';
import type { WorkspaceBundleTemplateRecord } from './workspace-bundle';
import { WORKSPACE_BUNDLE_APP_ID } from './workspace-bundle';

export const DESKTOP_COMPANION_SYNC_VERSION = '1.0';

export type DesktopCompanionSyncDomain = 'drafts' | 'config' | 'templates' | 'blueprints';

export interface DesktopCompanionSyncSelection {
  drafts: boolean;
  config: boolean;
  templates: boolean;
  blueprints: boolean;
}

export const DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION: DesktopCompanionSyncSelection = {
  drafts: true,
  config: true,
  templates: true,
  blueprints: true,
};

export interface DesktopCompanionSyncSource {
  deviceId: string;
  name: string;
  platform: 'desktop' | 'mobile' | 'web';
  runtime: 'tauri' | 'expo' | 'browser';
}

export interface DesktopCompanionConfigSyncPayload {
  config?: Omit<Config, 'api_keys'>;
  api_keys?: ApiKeys;
}

export interface DesktopCompanionSyncManifestEntry {
  available: boolean;
  itemCount: number;
  publishedAtMs: number | null;
}

export interface DesktopCompanionSyncManifest {
  app: typeof WORKSPACE_BUNDLE_APP_ID;
  version: typeof DESKTOP_COMPANION_SYNC_VERSION;
  domains: Record<DesktopCompanionSyncDomain, DesktopCompanionSyncManifestEntry>;
}

export interface DesktopCompanionSyncPayload {
  drafts?: Draft[];
  config?: DesktopCompanionConfigSyncPayload;
  templates?: WorkspaceBundleTemplateRecord[];
  blueprints?: Record<string, string>;
}

export interface DesktopCompanionSyncState {
  app: typeof WORKSPACE_BUNDLE_APP_ID;
  version: typeof DESKTOP_COMPANION_SYNC_VERSION;
  exportedAt: string;
  source?: DesktopCompanionSyncSource;
  manifest: DesktopCompanionSyncManifest;
  payload: DesktopCompanionSyncPayload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

function normalizeTemplateRecords(value: unknown): WorkspaceBundleTemplateRecord[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const records = value
    .filter((entry): entry is WorkspaceBundleTemplateRecord => {
      if (!isRecord(entry)) {
        return false;
      }

      return (
        isRecord(entry.template) &&
        typeof entry.template.name === 'string' &&
        typeof entry.template.version === 'string' &&
        Array.isArray(entry.template.assets) &&
        isRecord(entry.blueprint_contents)
      );
    })
    .map((entry) => ({
      template: entry.template,
      blueprint_contents: toStringRecord(entry.blueprint_contents),
      template_root: typeof entry.template_root === 'string' ? entry.template_root : undefined,
    }));

  return records.length > 0 ? records : undefined;
}

function buildManifestEntry(itemCount: number, publishedAtMs: number | null): DesktopCompanionSyncManifestEntry {
  return {
    available: itemCount > 0,
    itemCount,
    publishedAtMs: itemCount > 0 ? publishedAtMs : null,
  };
}

function normalizeSyncSource(value: unknown): DesktopCompanionSyncSource | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const deviceId = typeof value.deviceId === 'string' ? value.deviceId.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const platform =
    value.platform === 'desktop' || value.platform === 'mobile' || value.platform === 'web'
      ? value.platform
      : undefined;
  const runtime =
    value.runtime === 'tauri' || value.runtime === 'expo' || value.runtime === 'browser' ? value.runtime : undefined;

  if (!deviceId || !name || !platform || !runtime) {
    return undefined;
  }

  return { deviceId, name, platform, runtime };
}

export function normalizeDesktopCompanionSyncSelection(
  value?: Partial<DesktopCompanionSyncSelection> | null,
): DesktopCompanionSyncSelection {
  return {
    drafts: value?.drafts ?? DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION.drafts,
    config: value?.config ?? DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION.config,
    templates: value?.templates ?? DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION.templates,
    blueprints: value?.blueprints ?? DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION.blueprints,
  };
}

export function getSelectedDesktopCompanionSyncDomains(
  selection?: Partial<DesktopCompanionSyncSelection> | null,
): DesktopCompanionSyncDomain[] {
  const normalized = normalizeDesktopCompanionSyncSelection(selection);
  return (['drafts', 'config', 'templates', 'blueprints'] as const).filter((domain) => normalized[domain]);
}

export function hasSelectedDesktopCompanionSyncDomains(
  selection?: Partial<DesktopCompanionSyncSelection> | null,
): boolean {
  return getSelectedDesktopCompanionSyncDomains(selection).length > 0;
}

export function filterDesktopCompanionSyncPayload(
  payload: DesktopCompanionSyncPayload,
  selection?: Partial<DesktopCompanionSyncSelection> | null,
  options: { includeApiKeys?: boolean } = {},
): DesktopCompanionSyncPayload {
  const normalized = normalizeDesktopCompanionSyncSelection(selection);
  const includeApiKeys = options.includeApiKeys !== false;

  return {
    ...(normalized.drafts && Array.isArray(payload.drafts) ? { drafts: payload.drafts } : {}),
    ...(normalized.config && payload.config
      ? {
          config: {
            ...(payload.config.config ? { config: payload.config.config } : {}),
            ...(includeApiKeys && payload.config.api_keys ? { api_keys: payload.config.api_keys } : {}),
          },
        }
      : {}),
    ...(normalized.templates && Array.isArray(payload.templates) ? { templates: payload.templates } : {}),
    ...(normalized.blueprints && payload.blueprints ? { blueprints: payload.blueprints } : {}),
  };
}

export function createDesktopCompanionSyncState(
  payload: DesktopCompanionSyncPayload,
  source?: DesktopCompanionSyncSource,
): DesktopCompanionSyncState {
  const publishedAtMs = Date.now();
  const drafts = Array.isArray(payload.drafts) ? payload.drafts : undefined;
  const templates = Array.isArray(payload.templates) ? payload.templates : undefined;
  const blueprints = payload.blueprints ? toStringRecord(payload.blueprints) : undefined;
  const config = payload.config;

  return {
    app: WORKSPACE_BUNDLE_APP_ID,
    version: DESKTOP_COMPANION_SYNC_VERSION,
    exportedAt: new Date(publishedAtMs).toISOString(),
    ...(source ? { source } : {}),
    manifest: {
      app: WORKSPACE_BUNDLE_APP_ID,
      version: DESKTOP_COMPANION_SYNC_VERSION,
      domains: {
        drafts: buildManifestEntry(drafts?.length ?? 0, publishedAtMs),
        config: buildManifestEntry(config ? 1 : 0, publishedAtMs),
        templates: buildManifestEntry(templates?.length ?? 0, publishedAtMs),
        blueprints: buildManifestEntry(Object.keys(blueprints ?? {}).length, publishedAtMs),
      },
    },
    payload: {
      ...(drafts ? { drafts } : {}),
      ...(config ? { config } : {}),
      ...(templates ? { templates } : {}),
      ...(blueprints && Object.keys(blueprints).length > 0 ? { blueprints } : {}),
    },
  };
}

export function parseDesktopCompanionSyncState(json: string): DesktopCompanionSyncState {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('Invalid desktop companion sync JSON');
  }

  if (!isRecord(parsed)) {
    throw new Error('Invalid desktop companion sync payload');
  }

  if (parsed.app !== WORKSPACE_BUNDLE_APP_ID) {
    throw new Error('Unsupported desktop companion sync source');
  }

  if (parsed.version !== DESKTOP_COMPANION_SYNC_VERSION) {
    throw new Error(`Unsupported desktop companion sync version: ${String(parsed.version ?? 'unknown')}`);
  }

  if (!isRecord(parsed.payload)) {
    throw new Error('Desktop companion sync payload is missing domain data');
  }

  const payload = parsed.payload;
  const drafts = Array.isArray(payload.drafts) ? (payload.drafts as Draft[]) : undefined;
  const config = isRecord(payload.config)
    ? {
        ...(isRecord(payload.config.config) ? { config: payload.config.config as Omit<Config, 'api_keys'> } : {}),
        ...(isRecord(payload.config.api_keys) ? { api_keys: payload.config.api_keys as ApiKeys } : {}),
      }
    : undefined;
  const templates = normalizeTemplateRecords(payload.templates);
  const blueprints = isRecord(payload.blueprints) ? toStringRecord(payload.blueprints) : undefined;
  const source = normalizeSyncSource(parsed.source);

  const normalized = createDesktopCompanionSyncState(
    {
      ...(drafts ? { drafts } : {}),
      ...(config && (config.config || config.api_keys) ? { config } : {}),
      ...(templates ? { templates } : {}),
      ...(blueprints ? { blueprints } : {}),
    },
    source,
  );

  return {
    ...normalized,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : normalized.exportedAt,
  };
}
