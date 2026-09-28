import type { ApiKeys, Config, DesktopCompanionSyncSelection, HelpState } from '@char-gen/shared';

const CONFIG_STORAGE_KEY = 'eidolon.web.config';
const API_KEYS_STORAGE_KEY = 'eidolon.web.apiKeys';
const DESKTOP_COMPANION_STORAGE_KEY = 'eidolon.mobile.desktopCompanion';
const REMEMBERED_DESKTOP_COMPANIONS_STORAGE_KEY = 'eidolon.mobile.desktopCompanion.remembered';
const DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY = 'eidolon.mobile.desktopCompanion.reliability';
const DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY = 'eidolon.mobile.desktopCompanion.syncSelection';
const MOBILE_DEVICE_IDENTITY_STORAGE_KEY = 'eidolon.mobile.device.identity';

type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

export interface DesktopCompanionSettings {
  url?: string;
  pair_code?: string;
}

export interface MobileDeviceIdentity {
  device_id: string;
  name: string;
}

export interface RememberedDesktopCompanion {
  id: string;
  name: string;
  url: string;
  pair_code: string;
  last_used_at?: string;
}

export interface DesktopCompanionReliabilityMetadata {
  last_successful_test_at?: string;
  last_successful_pull_at?: string;
  last_successful_send_at?: string;
  pending_desktop_apply_sent_at?: string;
}

export interface DesktopCompanionSyncSelectionSettings {
  pull_selection: DesktopCompanionSyncSelection;
  send_selection: DesktopCompanionSyncSelection;
}

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
      .filter((entry): entry is [string, string] => entry[1].length > 0),
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

  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
    },
    null,
    2,
  );
}

export function importStoredDeviceConfig(json: string): Config {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('Invalid configuration JSON');
  }

  const payload =
    typeof parsed === 'object' && parsed !== null && 'config' in parsed
      ? (parsed as { config?: Partial<Config> }).config
      : (parsed as Partial<Config>);

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

  const payload =
    typeof parsed === 'object' && parsed !== null
      ? ((parsed as { apiKeys?: ApiKeys; api_keys?: ApiKeys }).apiKeys ??
        (parsed as { apiKeys?: ApiKeys; api_keys?: ApiKeys }).api_keys ??
        parsed)
      : null;

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid API keys JSON');
  }

  return updateStoredDeviceConfig({ api_keys: payload as ApiKeys });
}

function trimDesktopCompanionUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function repairLegacyDesktopCompanionUrl(value: string): string {
  const match = value.match(/^(https?):\/\/([^/?#]+)([/?#].*)?$/i);
  if (!match) {
    return value;
  }

  const [, protocol, authority, suffix = ''] = match;
  if (authority.includes('[') || authority.includes(']')) {
    return value;
  }

  const colonMatches = authority.match(/:/g) ?? [];
  if (colonMatches.length <= 1) {
    return value;
  }

  const lastColonIndex = authority.lastIndexOf(':');
  const hostPart = authority.slice(0, lastColonIndex);
  const portPart = authority.slice(lastColonIndex + 1);
  const repairedAuthority =
    /^\d+$/.test(portPart) && hostPart.includes(':') ? `[${hostPart}]:${portPart}` : `[${authority}]`;

  return `${protocol}://${repairedAuthority}${suffix}`;
}

function normalizeDesktopCompanionUrlSuffix(value: string): string {
  if (!value) {
    return '';
  }

  const markerIndex = value.search(/[?#]/);
  const pathPart = markerIndex >= 0 ? value.slice(0, markerIndex) : value;
  const suffixPart = markerIndex >= 0 ? value.slice(markerIndex) : '';
  const normalizedPath = pathPart === '/' ? '' : pathPart.replace(/\/+$/, '');
  return `${normalizedPath}${suffixPart}`;
}

interface ParsedDesktopCompanionUrl {
  protocol: 'http' | 'https';
  authority: string;
  suffix: string;
}

function parseDesktopCompanionUrl(value: string): ParsedDesktopCompanionUrl | null {
  const repaired = repairLegacyDesktopCompanionUrl(value);
  const match = repaired.match(/^(https?):\/\/([^/?#]+)([/?#].*)?$/i);
  if (!match) {
    return null;
  }

  const protocol = match[1].toLowerCase();
  const authority = match[2];
  const suffix = match[3] ?? '';
  if ((protocol !== 'http' && protocol !== 'https') || !isValidDesktopCompanionAuthority(authority)) {
    return null;
  }

  return {
    protocol,
    authority,
    suffix: normalizeDesktopCompanionUrlSuffix(suffix),
  };
}

function isValidDesktopCompanionAuthority(value: string): boolean {
  if (!value) {
    return false;
  }

  const ipv6Match = value.match(/^\[([^\]]+)\](?::(\d+))?$/);
  if (ipv6Match) {
    return ipv6Match[1].trim().length > 0 && isValidDesktopCompanionPort(ipv6Match[2]);
  }

  const hostMatch = value.match(/^([^:]+)(?::(\d+))?$/);
  if (!hostMatch) {
    return false;
  }

  return hostMatch[1].trim().length > 0 && isValidDesktopCompanionPort(hostMatch[2]);
}

function isValidDesktopCompanionPort(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

function serializeDesktopCompanionUrl(url: ParsedDesktopCompanionUrl): string {
  return `${url.protocol}://${url.authority}${url.suffix}`;
}

export function normalizeDesktopCompanionUrlInput(value: string | undefined): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = trimDesktopCompanionUrl(value);
  if (!trimmed) {
    return '';
  }

  const parsed = parseDesktopCompanionUrl(trimmed);
  if (!parsed) {
    return trimmed;
  }

  return serializeDesktopCompanionUrl(parsed);
}

export function validateDesktopCompanionUrl(value: string): string {
  const trimmed = normalizeDesktopCompanionUrlInput(value);
  if (!trimmed) {
    throw new Error('Desktop companion URL is required.');
  }

  const parsed = parseDesktopCompanionUrl(trimmed);
  if (!parsed) {
    throw new Error('Desktop companion URL must be a valid http:// or https:// address.');
  }

  return serializeDesktopCompanionUrl(parsed);
}

function normalizeDesktopCompanionSettings(settings?: Partial<DesktopCompanionSettings>): DesktopCompanionSettings {
  const url = normalizeDesktopCompanionUrlInput(settings?.url);
  const pairCode = typeof settings?.pair_code === 'string' ? settings.pair_code.trim().toUpperCase() : '';

  return {
    ...(url ? { url } : {}),
    ...(pairCode ? { pair_code: pairCode } : {}),
  };
}

function createMobileDeviceId(): string {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeMobileDeviceIdentity(identity?: Partial<MobileDeviceIdentity>): MobileDeviceIdentity {
  const deviceId =
    typeof identity?.device_id === 'string' && identity.device_id.trim().length > 0
      ? identity.device_id.trim()
      : createMobileDeviceId();
  const name =
    typeof identity?.name === 'string' && identity.name.trim().length > 0 ? identity.name.trim() : 'My Phone';

  return {
    device_id: deviceId,
    name,
  };
}

function toIsoString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function createRememberedDesktopId(url: string): string {
  const normalizedUrl = url.trim().toLowerCase();
  return `desktop-${normalizedUrl.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || Date.now().toString()}`;
}

function normalizeRememberedDesktopCompanion(value: unknown): RememberedDesktopCompanion | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Partial<RememberedDesktopCompanion>;
  const url = normalizeDesktopCompanionUrlInput(record.url);
  const pairCode = typeof record.pair_code === 'string' ? record.pair_code.trim().toUpperCase() : '';
  const id =
    typeof record.id === 'string' && record.id.trim().length > 0 ? record.id.trim() : createRememberedDesktopId(url);
  const name =
    typeof record.name === 'string' && record.name.trim().length > 0 ? record.name.trim() : url || 'Desktop Companion';
  const lastUsedAt = toIsoString(record.last_used_at);

  if (!url || !pairCode) {
    return null;
  }

  return {
    id,
    name,
    url,
    pair_code: pairCode,
    ...(lastUsedAt ? { last_used_at: lastUsedAt } : {}),
  };
}

function normalizeRememberedDesktopCompanions(value: unknown): RememberedDesktopCompanion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const byId = new Map<string, RememberedDesktopCompanion>();
  for (const entry of value) {
    const normalized = normalizeRememberedDesktopCompanion(entry);
    if (!normalized) {
      continue;
    }

    byId.set(normalized.id, normalized);
  }

  return Array.from(byId.values()).sort((left, right) => {
    const leftTime = left.last_used_at ? Date.parse(left.last_used_at) : 0;
    const rightTime = right.last_used_at ? Date.parse(right.last_used_at) : 0;
    return rightTime - leftTime || left.name.localeCompare(right.name);
  });
}

function normalizeDesktopCompanionReliabilityMetadata(value: unknown): DesktopCompanionReliabilityMetadata {
  const record =
    typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionReliabilityMetadata>) : {};
  const lastSuccessfulTestAt = toIsoString(record.last_successful_test_at);
  const lastSuccessfulPullAt = toIsoString(record.last_successful_pull_at);
  const lastSuccessfulSendAt = toIsoString(record.last_successful_send_at);
  const pendingDesktopApplySentAt = toIsoString(record.pending_desktop_apply_sent_at);

  return {
    ...(lastSuccessfulTestAt ? { last_successful_test_at: lastSuccessfulTestAt } : {}),
    ...(lastSuccessfulPullAt ? { last_successful_pull_at: lastSuccessfulPullAt } : {}),
    ...(lastSuccessfulSendAt ? { last_successful_send_at: lastSuccessfulSendAt } : {}),
    ...(pendingDesktopApplySentAt ? { pending_desktop_apply_sent_at: pendingDesktopApplySentAt } : {}),
  };
}

function normalizeDesktopCompanionSyncSelection(value: unknown): DesktopCompanionSyncSelection {
  const record = typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionSyncSelection>) : {};
  return {
    drafts: record.drafts !== false,
    config: record.config !== false,
    templates: record.templates !== false,
    blueprints: record.blueprints !== false,
  };
}

function normalizeDesktopCompanionSyncSelectionSettings(value: unknown): DesktopCompanionSyncSelectionSettings {
  const record =
    typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionSyncSelectionSettings>) : {};
  return {
    pull_selection: normalizeDesktopCompanionSyncSelection(record.pull_selection),
    send_selection: normalizeDesktopCompanionSyncSelection(record.send_selection),
  };
}

export function getStoredDesktopCompanionSettings(): DesktopCompanionSettings {
  return normalizeDesktopCompanionSettings(
    readJson<DesktopCompanionSettings>(DESKTOP_COMPANION_STORAGE_KEY) ?? undefined,
  );
}

export function updateStoredDesktopCompanionSettings(
  updates: Partial<DesktopCompanionSettings>,
): DesktopCompanionSettings {
  const nextSettings = normalizeDesktopCompanionSettings({
    ...getStoredDesktopCompanionSettings(),
    ...updates,
  });

  writeJson(DESKTOP_COMPANION_STORAGE_KEY, nextSettings);
  return nextSettings;
}

export function getStoredMobileDeviceIdentity(): MobileDeviceIdentity {
  const stored = readJson<MobileDeviceIdentity>(MOBILE_DEVICE_IDENTITY_STORAGE_KEY) ?? undefined;
  const normalized = normalizeMobileDeviceIdentity(stored);
  writeJson(MOBILE_DEVICE_IDENTITY_STORAGE_KEY, normalized);
  return normalized;
}

export function updateStoredMobileDeviceIdentity(updates: Partial<MobileDeviceIdentity>): MobileDeviceIdentity {
  const nextIdentity = normalizeMobileDeviceIdentity({
    ...getStoredMobileDeviceIdentity(),
    ...updates,
  });
  writeJson(MOBILE_DEVICE_IDENTITY_STORAGE_KEY, nextIdentity);
  return nextIdentity;
}

export function getRememberedDesktopCompanions(): RememberedDesktopCompanion[] {
  return normalizeRememberedDesktopCompanions(
    readJson<RememberedDesktopCompanion[]>(REMEMBERED_DESKTOP_COMPANIONS_STORAGE_KEY) ?? [],
  );
}

export function saveRememberedDesktopCompanion(
  companion: Partial<RememberedDesktopCompanion> & Pick<RememberedDesktopCompanion, 'url' | 'pair_code'>,
): RememberedDesktopCompanion[] {
  const normalized = normalizeRememberedDesktopCompanion(companion);
  if (!normalized) {
    throw new Error('A desktop companion needs a valid URL and pair code to be remembered.');
  }

  const existing = getRememberedDesktopCompanions();
  const next = existing.filter((entry) => entry.id !== normalized.id && entry.url !== normalized.url);
  next.unshift({
    ...normalized,
    last_used_at: new Date().toISOString(),
  });
  const normalizedList = normalizeRememberedDesktopCompanions(next);
  writeJson(REMEMBERED_DESKTOP_COMPANIONS_STORAGE_KEY, normalizedList);
  return normalizedList;
}

export function removeRememberedDesktopCompanion(id: string): RememberedDesktopCompanion[] {
  const next = getRememberedDesktopCompanions().filter((entry) => entry.id !== id);
  writeJson(REMEMBERED_DESKTOP_COMPANIONS_STORAGE_KEY, next);
  return next;
}

export function touchRememberedDesktopCompanion(id: string): RememberedDesktopCompanion[] {
  const next = getRememberedDesktopCompanions().map((entry) =>
    entry.id === id ? { ...entry, last_used_at: new Date().toISOString() } : entry,
  );
  const normalizedList = normalizeRememberedDesktopCompanions(next);
  writeJson(REMEMBERED_DESKTOP_COMPANIONS_STORAGE_KEY, normalizedList);
  return normalizedList;
}

export function getDesktopCompanionReliabilityMetadata(): DesktopCompanionReliabilityMetadata {
  return normalizeDesktopCompanionReliabilityMetadata(
    readJson<DesktopCompanionReliabilityMetadata>(DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY) ?? undefined,
  );
}

export function updateDesktopCompanionReliabilityMetadata(
  updates: Partial<DesktopCompanionReliabilityMetadata>,
): DesktopCompanionReliabilityMetadata {
  const nextMetadata = normalizeDesktopCompanionReliabilityMetadata({
    ...getDesktopCompanionReliabilityMetadata(),
    ...updates,
  });
  writeJson(DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY, nextMetadata);
  return nextMetadata;
}

export function getDesktopCompanionSyncSelectionSettings(): DesktopCompanionSyncSelectionSettings {
  return normalizeDesktopCompanionSyncSelectionSettings(
    readJson<DesktopCompanionSyncSelectionSettings>(DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY) ?? undefined,
  );
}

export function updateDesktopCompanionSyncSelectionSettings(
  updates: Partial<DesktopCompanionSyncSelectionSettings>,
): DesktopCompanionSyncSelectionSettings {
  const nextSettings = normalizeDesktopCompanionSyncSelectionSettings({
    ...getDesktopCompanionSyncSelectionSettings(),
    ...updates,
  });
  writeJson(DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY, nextSettings);
  return nextSettings;
}
