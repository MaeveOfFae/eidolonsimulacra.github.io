import type { ApiKeys, Config, HelpState } from '@char-gen/shared';

const CONFIG_STORAGE_KEY = 'eidolon.web.config';
const API_KEYS_STORAGE_KEY = 'eidolon.web.apiKeys';

type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export const DEFAULT_HELP_STATE: HelpState = {
  first_run_completed: false,
  show_inline_tips: true,
  completed_guides: [],
  dismissed_tips: [],
  completed_tours: [],
};

export const DEFAULT_DEVICE_CONFIG: Config = {
  engine: 'openai_compatible',
  engine_mode: 'auto',
  model: 'openrouter/openai/gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 4096,
  api_keys: {},
  batch: {
    max_concurrent: 3,
    rate_limit_delay: 1,
  },
  help: DEFAULT_HELP_STATE,
  feature_blueprints: {
    orchestration: 'blueprints/system/generator.md',
    seed_generation: 'blueprints/system/seed_generator.md',
    offspring_generation: 'blueprints/system/offspring_generator.md',
    worldbook_generation: 'blueprints/system/lorebook_generator.md',
    intro_scene_generation: 'blueprints/system/intro_scene.md',
  },
};

function getStorage(): StorageLike | null {
  const maybeStorage = globalThis as { localStorage?: StorageLike };
  return maybeStorage.localStorage ?? null;
}

function readJson<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const value = storage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (value === null || value === undefined) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

function normalizeApiKeyValue(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');
}

function normalizeApiKeys(input?: ApiKeys): ApiKeys {
  if (!input) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input)
      .map(([provider, value]) => [provider, typeof value === 'string' ? normalizeApiKeyValue(value) : ''])
      .filter((entry): entry is [string, string] => entry[1].length > 0)
  );
}

function normalizeHelpState(help?: Partial<HelpState>): HelpState {
  return {
    first_run_completed: help?.first_run_completed ?? DEFAULT_HELP_STATE.first_run_completed,
    show_inline_tips: help?.show_inline_tips ?? DEFAULT_HELP_STATE.show_inline_tips,
    completed_guides: help?.completed_guides ?? DEFAULT_HELP_STATE.completed_guides,
    dismissed_tips: help?.dismissed_tips ?? DEFAULT_HELP_STATE.dismissed_tips,
    completed_tours: help?.completed_tours ?? DEFAULT_HELP_STATE.completed_tours,
  };
}

export function normalizeDeviceConfig(config?: Partial<Config>): Config {
  const storedApiKeys = normalizeApiKeys(readJson<ApiKeys>(API_KEYS_STORAGE_KEY) ?? undefined);

  return {
    ...DEFAULT_DEVICE_CONFIG,
    ...config,
    api_keys: normalizeApiKeys(config?.api_keys ?? storedApiKeys),
    batch: {
      ...DEFAULT_DEVICE_CONFIG.batch,
      ...(config?.batch ?? {}),
    },
    help: normalizeHelpState(config?.help),
    feature_blueprints: {
      ...DEFAULT_DEVICE_CONFIG.feature_blueprints,
      ...(config?.feature_blueprints ?? {}),
    },
  };
}

export function getStoredDeviceConfig(): Config {
  return normalizeDeviceConfig(readJson<Partial<Config>>(CONFIG_STORAGE_KEY) ?? undefined);
}

export function updateStoredDeviceConfig(updates: Partial<Config>): Config {
  const currentConfig = getStoredDeviceConfig();
  const mergedApiKeys = { ...currentConfig.api_keys };

  if (updates.api_keys) {
    Object.entries(updates.api_keys).forEach(([provider, value]) => {
      const normalizedValue = typeof value === 'string' ? normalizeApiKeyValue(value) : '';
      if (normalizedValue.length === 0) {
        delete mergedApiKeys[provider];
        return;
      }

      mergedApiKeys[provider] = normalizedValue;
    });
  }

  const nextConfig = normalizeDeviceConfig({
    ...currentConfig,
    ...updates,
    api_keys: mergedApiKeys,
    batch: updates.batch ? { ...currentConfig.batch, ...updates.batch } : currentConfig.batch,
    help: updates.help ? { ...currentConfig.help, ...updates.help } : currentConfig.help,
    feature_blueprints: updates.feature_blueprints
      ? { ...currentConfig.feature_blueprints, ...updates.feature_blueprints }
      : currentConfig.feature_blueprints,
  });

  const serializableConfig: Partial<Config> = {
    ...nextConfig,
    api_keys: undefined,
  };

  writeJson(CONFIG_STORAGE_KEY, serializableConfig);
  writeJson(API_KEYS_STORAGE_KEY, nextConfig.api_keys);

  return nextConfig;
}

export function exportStoredDeviceConfig(): string {
  const { api_keys: _apiKeys, ...config } = getStoredDeviceConfig();

  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    config,
  }, null, 2);
}

export function importStoredDeviceConfig(json: string): Config {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('Invalid configuration JSON');
  }

  const payload = typeof parsed === 'object' && parsed !== null && 'config' in parsed
    ? (parsed as { config?: Partial<Config> }).config
    : parsed as Partial<Config>;

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid configuration JSON');
  }

  const { api_keys: _apiKeys, ...config } = payload as Partial<Config>;
  return updateStoredDeviceConfig(config);
}

export function exportStoredApiKeys(): string {
  return JSON.stringify(getStoredDeviceConfig().api_keys, null, 2);
}

export function importStoredApiKeys(json: string): Config {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('Invalid API keys JSON');
  }

  const payload = typeof parsed === 'object' && parsed !== null
    ? ((parsed as { apiKeys?: ApiKeys; api_keys?: ApiKeys }).apiKeys
      ?? (parsed as { apiKeys?: ApiKeys; api_keys?: ApiKeys }).api_keys
      ?? parsed)
    : null;

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid API keys JSON');
  }

  return updateStoredDeviceConfig({ api_keys: payload as ApiKeys });
}