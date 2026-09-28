import type { ApiKeys, Config, Draft, Template } from './types';

export const WORKSPACE_BUNDLE_APP_ID = 'eidolon-simulacra';
export const WORKSPACE_BUNDLE_VERSION = '1.0';

export interface WorkspaceBundleTemplateRecord {
  template: Template;
  blueprint_contents: Record<string, string>;
  template_root?: string;
}

export interface WorkspaceBundleSource {
  platform: 'web' | 'desktop' | 'mobile';
  runtime: 'browser' | 'tauri' | 'expo';
}

export interface WorkspaceBundlePayload {
  drafts: Draft[];
  config?: Omit<Config, 'api_keys'>;
  api_keys?: ApiKeys;
  templates?: WorkspaceBundleTemplateRecord[];
  blueprint_overrides?: Record<string, string>;
}

export interface WorkspaceBundle {
  app: typeof WORKSPACE_BUNDLE_APP_ID;
  version: typeof WORKSPACE_BUNDLE_VERSION;
  exportedAt: string;
  source: WorkspaceBundleSource;
  payload: WorkspaceBundlePayload;
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

function normalizeSource(value: unknown): WorkspaceBundleSource {
  if (!isRecord(value)) {
    return { platform: 'web', runtime: 'browser' };
  }

  const platform =
    value.platform === 'desktop' || value.platform === 'mobile' || value.platform === 'web' ? value.platform : 'web';
  const runtime =
    value.runtime === 'tauri' || value.runtime === 'expo' || value.runtime === 'browser'
      ? value.runtime
      : platform === 'desktop'
        ? 'tauri'
        : platform === 'mobile'
          ? 'expo'
          : 'browser';

  return { platform, runtime };
}

export function createWorkspaceBundle(payload: WorkspaceBundlePayload, source: WorkspaceBundleSource): WorkspaceBundle {
  return {
    app: WORKSPACE_BUNDLE_APP_ID,
    version: WORKSPACE_BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    source,
    payload: {
      drafts: Array.isArray(payload.drafts) ? payload.drafts : [],
      ...(payload.config ? { config: payload.config } : {}),
      ...(payload.api_keys ? { api_keys: payload.api_keys } : {}),
      ...(payload.templates ? { templates: payload.templates } : {}),
      ...(payload.blueprint_overrides ? { blueprint_overrides: payload.blueprint_overrides } : {}),
    },
  };
}

export function parseWorkspaceBundle(json: string): WorkspaceBundle {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('Invalid workspace bundle JSON');
  }

  if (!isRecord(parsed)) {
    throw new Error('Invalid workspace bundle payload');
  }

  if (parsed.app !== WORKSPACE_BUNDLE_APP_ID) {
    throw new Error('Unsupported workspace bundle source');
  }

  if (parsed.version !== WORKSPACE_BUNDLE_VERSION) {
    throw new Error(`Unsupported workspace bundle version: ${String(parsed.version ?? 'unknown')}`);
  }

  if (!isRecord(parsed.payload)) {
    throw new Error('Workspace bundle is missing payload data');
  }

  const payload = parsed.payload;

  return {
    app: WORKSPACE_BUNDLE_APP_ID,
    version: WORKSPACE_BUNDLE_VERSION,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    source: normalizeSource(parsed.source),
    payload: {
      drafts: Array.isArray(payload.drafts) ? (payload.drafts as Draft[]) : [],
      ...(isRecord(payload.config) ? { config: payload.config as Omit<Config, 'api_keys'> } : {}),
      ...(isRecord(payload.api_keys) ? { api_keys: payload.api_keys as ApiKeys } : {}),
      ...(normalizeTemplateRecords(payload.templates)
        ? { templates: normalizeTemplateRecords(payload.templates) }
        : {}),
      ...(isRecord(payload.blueprint_overrides)
        ? { blueprint_overrides: toStringRecord(payload.blueprint_overrides) }
        : {}),
    },
  };
}
