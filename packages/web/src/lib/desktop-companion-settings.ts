import type { DesktopCompanionSyncSelection } from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from './persistence/storage.js';

const DESKTOP_COMPANION_IDENTITY_STORAGE_KEY = 'eidolon.desktop.companion.identity';
const REMEMBERED_MOBILE_COMPANIONS_STORAGE_KEY = 'eidolon.desktop.companion.mobile-history';
const DESKTOP_COMPANION_POLICY_STORAGE_KEY = 'eidolon.desktop.companion.policy';
const DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY = 'eidolon.desktop.companion.reliability';
const DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY = 'eidolon.desktop.companion.syncSelection';

export interface DesktopCompanionIdentity {
  deviceId: string;
  name: string;
}

export type UntrustedSenderPolicy = 'allow' | 'confirm' | 'block';

export interface DesktopCompanionPolicySettings {
  untrustedSenderPolicy: UntrustedSenderPolicy;
}

export interface DesktopCompanionReliabilityMetadata {
  lastPublishedAt?: string;
  lastAppliedIncomingAt?: string;
}

export interface DesktopCompanionSyncSelectionSettings {
  publishSelection: DesktopCompanionSyncSelection;
}

export interface RememberedMobileCompanion {
  deviceId: string;
  name: string;
  platform: 'mobile' | 'desktop' | 'web';
  runtime: 'expo' | 'tauri' | 'browser';
  lastSeenAt: string;
  trusted: boolean;
}

function createDeviceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `desktop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeDesktopCompanionIdentity(value: unknown): DesktopCompanionIdentity {
  const record = typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionIdentity>) : {};
  const deviceId =
    typeof record.deviceId === 'string' && record.deviceId.trim().length > 0
      ? record.deviceId.trim()
      : createDeviceId();
  const name = typeof record.name === 'string' && record.name.trim().length > 0 ? record.name.trim() : 'My Desktop';

  return { deviceId, name };
}

function normalizeDesktopCompanionPolicySettings(value: unknown): DesktopCompanionPolicySettings {
  const record = typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionPolicySettings>) : {};
  const untrustedSenderPolicy =
    record.untrustedSenderPolicy === 'allow' ||
    record.untrustedSenderPolicy === 'block' ||
    record.untrustedSenderPolicy === 'confirm'
      ? record.untrustedSenderPolicy
      : 'confirm';

  return { untrustedSenderPolicy };
}

function toIsoString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function normalizeDesktopCompanionReliabilityMetadata(value: unknown): DesktopCompanionReliabilityMetadata {
  const record =
    typeof value === 'object' && value !== null ? (value as Partial<DesktopCompanionReliabilityMetadata>) : {};
  const lastPublishedAt = toIsoString(record.lastPublishedAt);
  const lastAppliedIncomingAt = toIsoString(record.lastAppliedIncomingAt);

  return {
    ...(lastPublishedAt ? { lastPublishedAt } : {}),
    ...(lastAppliedIncomingAt ? { lastAppliedIncomingAt } : {}),
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
    publishSelection: normalizeDesktopCompanionSyncSelection(record.publishSelection),
  };
}

function normalizeRememberedMobileCompanion(value: unknown): RememberedMobileCompanion | null {
  const record = typeof value === 'object' && value !== null ? (value as Partial<RememberedMobileCompanion>) : {};
  const deviceId = typeof record.deviceId === 'string' ? record.deviceId.trim() : '';
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const platform =
    record.platform === 'mobile' || record.platform === 'desktop' || record.platform === 'web'
      ? record.platform
      : undefined;
  const runtime =
    record.runtime === 'expo' || record.runtime === 'tauri' || record.runtime === 'browser'
      ? record.runtime
      : undefined;
  const lastSeenAt =
    typeof record.lastSeenAt === 'string' && !Number.isNaN(new Date(record.lastSeenAt).getTime())
      ? new Date(record.lastSeenAt).toISOString()
      : new Date().toISOString();
  const trusted = record.trusted === true;

  if (!deviceId || !name || !platform || !runtime) {
    return null;
  }

  return { deviceId, name, platform, runtime, lastSeenAt, trusted };
}

function normalizeRememberedMobileCompanions(value: unknown): RememberedMobileCompanion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const byId = new Map<string, RememberedMobileCompanion>();
  for (const entry of value) {
    const normalized = normalizeRememberedMobileCompanion(entry);
    if (!normalized) {
      continue;
    }
    byId.set(normalized.deviceId, normalized);
  }

  return Array.from(byId.values()).sort((left, right) => Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt));
}

export function getDesktopCompanionIdentity(): DesktopCompanionIdentity {
  const stored = readPersistedJson<DesktopCompanionIdentity>(DESKTOP_COMPANION_IDENTITY_STORAGE_KEY, {
    deviceId: createDeviceId(),
    name: 'My Desktop',
  });
  const normalized = normalizeDesktopCompanionIdentity(stored);
  writePersistedJson(DESKTOP_COMPANION_IDENTITY_STORAGE_KEY, [], normalized);
  return normalized;
}

export function updateDesktopCompanionIdentity(updates: Partial<DesktopCompanionIdentity>): DesktopCompanionIdentity {
  const nextIdentity = normalizeDesktopCompanionIdentity({
    ...getDesktopCompanionIdentity(),
    ...updates,
  });
  writePersistedJson(DESKTOP_COMPANION_IDENTITY_STORAGE_KEY, [], nextIdentity);
  return nextIdentity;
}

export function getDesktopCompanionPolicySettings(): DesktopCompanionPolicySettings {
  const stored = readPersistedJson<DesktopCompanionPolicySettings>(DESKTOP_COMPANION_POLICY_STORAGE_KEY, {
    untrustedSenderPolicy: 'confirm',
  });
  const normalized = normalizeDesktopCompanionPolicySettings(stored);
  writePersistedJson(DESKTOP_COMPANION_POLICY_STORAGE_KEY, [], normalized);
  return normalized;
}

export function updateDesktopCompanionPolicySettings(
  updates: Partial<DesktopCompanionPolicySettings>,
): DesktopCompanionPolicySettings {
  const nextSettings = normalizeDesktopCompanionPolicySettings({
    ...getDesktopCompanionPolicySettings(),
    ...updates,
  });
  writePersistedJson(DESKTOP_COMPANION_POLICY_STORAGE_KEY, [], nextSettings);
  return nextSettings;
}

export function getDesktopCompanionReliabilityMetadata(): DesktopCompanionReliabilityMetadata {
  return normalizeDesktopCompanionReliabilityMetadata(
    readPersistedJson<DesktopCompanionReliabilityMetadata>(DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY, {}),
  );
}

export function updateDesktopCompanionReliabilityMetadata(
  updates: Partial<DesktopCompanionReliabilityMetadata>,
): DesktopCompanionReliabilityMetadata {
  const nextMetadata = normalizeDesktopCompanionReliabilityMetadata({
    ...getDesktopCompanionReliabilityMetadata(),
    ...updates,
  });
  writePersistedJson(DESKTOP_COMPANION_RELIABILITY_STORAGE_KEY, [], nextMetadata);
  return nextMetadata;
}

export function getDesktopCompanionSyncSelectionSettings(): DesktopCompanionSyncSelectionSettings {
  return normalizeDesktopCompanionSyncSelectionSettings(
    readPersistedJson<DesktopCompanionSyncSelectionSettings>(DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY, {
      publishSelection: {
        drafts: true,
        config: true,
        templates: true,
        blueprints: true,
      },
    }),
  );
}

export function updateDesktopCompanionSyncSelectionSettings(
  updates: Partial<DesktopCompanionSyncSelectionSettings>,
): DesktopCompanionSyncSelectionSettings {
  const nextSettings = normalizeDesktopCompanionSyncSelectionSettings({
    ...getDesktopCompanionSyncSelectionSettings(),
    ...updates,
  });
  writePersistedJson(DESKTOP_COMPANION_SYNC_SELECTION_STORAGE_KEY, [], nextSettings);
  return nextSettings;
}

export function getRememberedMobileCompanions(): RememberedMobileCompanion[] {
  return normalizeRememberedMobileCompanions(
    readPersistedJson<RememberedMobileCompanion[]>(REMEMBERED_MOBILE_COMPANIONS_STORAGE_KEY, []),
  );
}

export function saveRememberedMobileCompanion(
  companion: Omit<RememberedMobileCompanion, 'lastSeenAt' | 'trusted'> &
    Partial<Pick<RememberedMobileCompanion, 'trusted'>>,
): RememberedMobileCompanion[] {
  const existingEntry = getRememberedMobileCompanions().find((entry) => entry.deviceId === companion.deviceId);
  const nextEntry = normalizeRememberedMobileCompanion({
    ...companion,
    trusted: companion.trusted ?? existingEntry?.trusted ?? false,
    lastSeenAt: new Date().toISOString(),
  });

  if (!nextEntry) {
    return getRememberedMobileCompanions();
  }

  const next = getRememberedMobileCompanions().filter((entry) => entry.deviceId !== nextEntry.deviceId);
  next.unshift(nextEntry);
  const normalized = normalizeRememberedMobileCompanions(next);
  writePersistedJson(REMEMBERED_MOBILE_COMPANIONS_STORAGE_KEY, [], normalized);
  return normalized;
}

export function updateRememberedMobileCompanion(
  deviceId: string,
  updates: Partial<Pick<RememberedMobileCompanion, 'name' | 'trusted'>>,
): RememberedMobileCompanion[] {
  const next = getRememberedMobileCompanions().map((entry) =>
    entry.deviceId === deviceId
      ? {
          ...entry,
          ...(typeof updates.name === 'string' ? { name: updates.name.trim() || entry.name } : {}),
          ...(typeof updates.trusted === 'boolean' ? { trusted: updates.trusted } : {}),
        }
      : entry,
  );
  const normalized = normalizeRememberedMobileCompanions(next);
  writePersistedJson(REMEMBERED_MOBILE_COMPANIONS_STORAGE_KEY, [], normalized);
  return normalized;
}

export function removeRememberedMobileCompanion(deviceId: string): RememberedMobileCompanion[] {
  const next = getRememberedMobileCompanions().filter((entry) => entry.deviceId !== deviceId);
  writePersistedJson(REMEMBERED_MOBILE_COMPANIONS_STORAGE_KEY, [], next);
  return next;
}
