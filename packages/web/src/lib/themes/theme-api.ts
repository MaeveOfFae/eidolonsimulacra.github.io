/**
 * Theme CRUD for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6.2), beside the already-extracted
 * builtin catalogue (`themes/builtin-themes.ts`). Custom themes persist
 * through the desktop-aware JSON storage layer under
 * `eidolon.web.themes.custom` (with the legacy `bpui.` key still read);
 * builtins are never mutated — updating or deleting one 404s or leaves the
 * builtin in place. Behavior is pinned by `api.themes.test.ts` through the
 * facade.
 */

import type {
  ThemeDuplicateRequest,
  ThemeImportRequest,
  ThemePreset,
  ThemePresetCreate,
  ThemePresetUpdate,
  ThemeRenameRequest,
} from '@char-gen/shared';
import { APIError } from '../api-error.js';
import { createDownload, slugifyFileName, type DownloadResponse } from '../download-response.js';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';
import { builtinThemes } from './builtin-themes.js';

const CUSTOM_THEMES_STORAGE_KEY = 'eidolon.web.themes.custom';
const LEGACY_CUSTOM_THEMES_STORAGE_KEYS = ['bpui.web.themes.custom'];

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  return readPersistedJson(keys, fallback);
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  writePersistedJson(key, legacyKeys, value);
}

function getCustomThemes(): ThemePreset[] {
  return readStorage<ThemePreset[]>([CUSTOM_THEMES_STORAGE_KEY, ...LEGACY_CUSTOM_THEMES_STORAGE_KEYS], []);
}

function saveCustomThemes(themes: ThemePreset[]): void {
  writeStorage(CUSTOM_THEMES_STORAGE_KEY, LEGACY_CUSTOM_THEMES_STORAGE_KEYS, themes);
}

function getAllThemes(): ThemePreset[] {
  return [...builtinThemes, ...getCustomThemes()];
}

export function getThemesSnapshot(): ThemePreset[] {
  return getAllThemes();
}

export async function getThemes(): Promise<ThemePreset[]> {
  return getThemesSnapshot();
}

export async function createTheme(theme: ThemePresetCreate): Promise<ThemePreset> {
  const themes = getCustomThemes();
  if (getAllThemes().some((candidate) => candidate.name === theme.name)) {
    throw new APIError(409, `Theme ${theme.name} already exists`);
  }

  const created: ThemePreset = {
    ...theme,
    description: theme.description || '',
    author: theme.author || '',
    tags: theme.tags || [],
    based_on: theme.based_on || '',
    is_builtin: false,
  };
  themes.push(created);
  saveCustomThemes(themes);

  return created;
}

export async function exportTheme(name: string): Promise<DownloadResponse> {
  const theme = getAllThemes().find((candidate) => candidate.name === name);
  if (!theme) {
    throw new APIError(404, `Theme ${name} not found`);
  }
  return createDownload(JSON.stringify(theme, null, 2), `${slugifyFileName(name)}.json`, 'application/json');
}

export async function importTheme(file: File, options: ThemeImportRequest = {}): Promise<ThemePreset> {
  const payload = JSON.parse(await file.text()) as ThemePreset;
  const incoming: ThemePreset = {
    ...payload,
    is_builtin: false,
  };

  const themes = getCustomThemes();
  const existingIndex = themes.findIndex((theme) => theme.name === incoming.name);
  if (existingIndex >= 0) {
    if (options.conflict_strategy === 'overwrite') {
      themes[existingIndex] = incoming;
    } else if (options.conflict_strategy === 'rename') {
      incoming.name = options.target_name || `${incoming.name}_copy`;
      themes.push(incoming);
    } else {
      throw new APIError(409, `Theme ${incoming.name} already exists`);
    }
  } else {
    themes.push(incoming);
  }

  saveCustomThemes(themes);
  return incoming;
}

export async function updateTheme(name: string, theme: ThemePresetUpdate): Promise<ThemePreset> {
  const themes = getCustomThemes();
  const index = themes.findIndex((candidate) => candidate.name === name);
  if (index < 0) {
    throw new APIError(404, `Theme ${name} is builtin or missing`);
  }
  themes[index] = { ...themes[index], ...theme };
  saveCustomThemes(themes);

  return themes[index];
}

export async function duplicateTheme(name: string, request: ThemeDuplicateRequest): Promise<ThemePreset> {
  const source = getAllThemes().find((theme) => theme.name === name);
  if (!source) {
    throw new APIError(404, `Theme ${name} not found`);
  }
  return createTheme({
    name: request.new_name,
    display_name: request.display_name || source.display_name,
    description: request.description || source.description,
    author: request.author || source.author,
    tags: request.tags || source.tags,
    based_on: request.based_on || source.name,
    colors: source.colors,
  });
}

export async function renameTheme(name: string, request: ThemeRenameRequest): Promise<ThemePreset> {
  return updateTheme(name, {
    display_name: request.display_name,
    ...(request.new_name !== name ? {} : {}),
  }).then((theme) => {
    const themes = getCustomThemes();
    const index = themes.findIndex((candidate) => candidate.name === name);
    if (index < 0) {
      throw new APIError(404, `Theme ${name} is builtin or missing`);
    }
    themes[index] = { ...theme, name: request.new_name };
    saveCustomThemes(themes);
    return themes[index];
  });
}

export async function deleteTheme(name: string): Promise<{ status: string; name: string }> {
  // Delete locally first
  const themes = getCustomThemes().filter((theme) => theme.name !== name);
  saveCustomThemes(themes);

  return { status: 'deleted', name };
}
