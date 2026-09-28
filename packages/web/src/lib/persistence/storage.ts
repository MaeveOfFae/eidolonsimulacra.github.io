import { isDesktopRuntime } from '../runtime.js';

const DESKTOP_APP_DATA_FILE = 'eidolon-device-storage.json';

export interface PersistentStorageDiagnostics {
  backend: 'desktop-app-data' | 'local-storage';
  fileName: string | null;
  locationLabel: string;
  initialized: boolean;
  entryCount: number;
  hasPersistedFile: boolean;
}

interface DesktopStorageSnapshot {
  version: 1;
  values: Record<string, string>;
}

let desktopValues: Record<string, string> = {};
let desktopInitialized = false;
let desktopInitializationPromise: Promise<void> | null = null;
let desktopFlushPromise: Promise<void> | null = null;
let desktopFlushDirty = false;
let fsModulePromise: Promise<typeof import('@tauri-apps/plugin-fs')> | null = null;

function canUseWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function shouldUseDesktopAppData(): boolean {
  return typeof window !== 'undefined' && isDesktopRuntime();
}

function hasDesktopValue(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(desktopValues, key);
}

function getDesktopValue(key: string): string | null {
  return hasDesktopValue(key) ? desktopValues[key] : null;
}

function parseDesktopSnapshot(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const candidateValues =
      'values' in parsed && parsed.values && typeof parsed.values === 'object' ? parsed.values : parsed;

    return Object.fromEntries(
      Object.entries(candidateValues as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

async function loadFsModule() {
  if (!fsModulePromise) {
    fsModulePromise = import('@tauri-apps/plugin-fs');
  }

  return fsModulePromise;
}

async function waitForDesktopFlush(): Promise<void> {
  while (desktopFlushPromise) {
    await desktopFlushPromise;
  }
}

async function readDesktopStorageFile(): Promise<string | null> {
  const { exists, readTextFile, BaseDirectory } = await loadFsModule();
  if (!(await exists(DESKTOP_APP_DATA_FILE, { baseDir: BaseDirectory.AppData }))) {
    return null;
  }

  return readTextFile(DESKTOP_APP_DATA_FILE, { baseDir: BaseDirectory.AppData });
}

async function flushDesktopValues(): Promise<void> {
  const { writeTextFile, BaseDirectory } = await loadFsModule();
  const snapshot: DesktopStorageSnapshot = {
    version: 1,
    values: desktopValues,
  };

  await writeTextFile(DESKTOP_APP_DATA_FILE, JSON.stringify(snapshot, null, 2), {
    baseDir: BaseDirectory.AppData,
  });
}

function queueDesktopFlush(): void {
  if (!shouldUseDesktopAppData() || !desktopInitialized) {
    return;
  }

  desktopFlushDirty = true;
  if (desktopFlushPromise) {
    return;
  }

  desktopFlushPromise = (async () => {
    while (desktopFlushDirty) {
      desktopFlushDirty = false;
      await flushDesktopValues();
    }
  })()
    .catch((error) => {
      console.warn('Failed to persist desktop app data:', error);
    })
    .finally(() => {
      desktopFlushPromise = null;
    });
}

function readLocalStorageValue(key: string): string | null {
  if (!canUseWindowStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorageValue(key: string, value: string): void {
  if (!canUseWindowStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

function clearLocalStorageValues(keys: readonly string[]): void {
  if (!canUseWindowStorage()) {
    return;
  }

  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  }
}

export async function initializePersistentStorage(): Promise<void> {
  if (!shouldUseDesktopAppData()) {
    return;
  }

  if (desktopInitialized) {
    return;
  }

  if (desktopInitializationPromise) {
    return desktopInitializationPromise;
  }

  desktopInitializationPromise = (async () => {
    try {
      const { exists, readTextFile, BaseDirectory } = await loadFsModule();

      if (await exists(DESKTOP_APP_DATA_FILE, { baseDir: BaseDirectory.AppData })) {
        const raw = await readTextFile(DESKTOP_APP_DATA_FILE, { baseDir: BaseDirectory.AppData });
        desktopValues = parseDesktopSnapshot(raw);
      } else {
        desktopValues = {};
      }
    } catch (error) {
      console.warn('Failed to initialize desktop app data storage:', error);
      desktopValues = {};
    } finally {
      desktopInitialized = true;
    }
  })().finally(() => {
    desktopInitializationPromise = null;
  });

  return desktopInitializationPromise;
}

export function readPersistedString(keys: string | readonly string[]): { value: string; sourceKey: string } | null {
  const keyList = Array.isArray(keys) ? [...keys] : [keys];
  const [currentKey, ...legacyKeys] = keyList;

  if (shouldUseDesktopAppData() && desktopInitialized) {
    for (const key of keyList) {
      const value = getDesktopValue(key);
      if (value === null) {
        continue;
      }

      if (key !== currentKey) {
        desktopValues[currentKey] = value;
        for (const legacyKey of legacyKeys) {
          delete desktopValues[legacyKey];
        }
        queueDesktopFlush();
      }

      clearLocalStorageValues(keyList);
      return { value, sourceKey: key };
    }
  }

  for (const key of keyList) {
    const value = readLocalStorageValue(key);
    if (value === null) {
      continue;
    }

    if (shouldUseDesktopAppData() && desktopInitialized) {
      desktopValues[currentKey] = value;
      for (const legacyKey of legacyKeys) {
        delete desktopValues[legacyKey];
      }
      queueDesktopFlush();
      clearLocalStorageValues(keyList);
      return { value, sourceKey: key };
    }

    if (key !== currentKey) {
      writeLocalStorageValue(currentKey, value);
      clearLocalStorageValues(legacyKeys);
    }

    return { value, sourceKey: key };
  }

  return null;
}

export function writePersistedString(currentKey: string, legacyKeys: readonly string[], value: string): void {
  if (shouldUseDesktopAppData() && desktopInitialized) {
    desktopValues[currentKey] = value;
    for (const legacyKey of legacyKeys) {
      delete desktopValues[legacyKey];
    }
    queueDesktopFlush();
    clearLocalStorageValues([currentKey, ...legacyKeys]);
    return;
  }

  writeLocalStorageValue(currentKey, value);
  clearLocalStorageValues(legacyKeys);
}

export function removePersistedValues(keys: readonly string[]): void {
  if (shouldUseDesktopAppData() && desktopInitialized) {
    let changed = false;
    for (const key of keys) {
      if (!hasDesktopValue(key)) {
        continue;
      }

      delete desktopValues[key];
      changed = true;
    }

    if (changed) {
      queueDesktopFlush();
    }
  }

  clearLocalStorageValues(keys);
}

export function readPersistedJson<T>(keys: string | readonly string[], fallback: T): T {
  const stored = readPersistedString(keys);
  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored.value) as T;
  } catch {
    return fallback;
  }
}

export function writePersistedJson<T>(currentKey: string, legacyKeys: readonly string[], value: T): void {
  writePersistedString(currentKey, legacyKeys, JSON.stringify(value));
}

export async function getPersistentStorageDiagnostics(): Promise<PersistentStorageDiagnostics> {
  if (!shouldUseDesktopAppData()) {
    return {
      backend: 'local-storage',
      fileName: null,
      locationLabel: 'Browser local storage',
      initialized: canUseWindowStorage(),
      entryCount: canUseWindowStorage() ? window.localStorage.length : 0,
      hasPersistedFile: false,
    };
  }

  await initializePersistentStorage();
  await waitForDesktopFlush();

  const raw = await readDesktopStorageFile().catch(() => null);
  return {
    backend: 'desktop-app-data',
    fileName: DESKTOP_APP_DATA_FILE,
    locationLabel: `AppData/${DESKTOP_APP_DATA_FILE}`,
    initialized: desktopInitialized,
    entryCount: Object.keys(desktopValues).length,
    hasPersistedFile: raw !== null,
  };
}

export async function exportPersistentStorageSnapshot(): Promise<{ fileName: string; contents: string } | null> {
  if (!shouldUseDesktopAppData()) {
    return null;
  }

  await initializePersistentStorage();
  await waitForDesktopFlush();

  const raw = await readDesktopStorageFile().catch(() => null);
  const snapshot: DesktopStorageSnapshot = {
    version: 1,
    values: desktopValues,
  };

  return {
    fileName: DESKTOP_APP_DATA_FILE,
    contents: raw ?? JSON.stringify(snapshot, null, 2),
  };
}
