import {
  OFFICIAL_TEMPLATE,
  getOrderedAssets,
  inferCharacterDisplayNameFromAssets,
  type FeatureCategory,
  type Template,
} from '@char-gen/shared';
import { parseBlueprintFrontmatter, type TemplateAsset, templateToAssets } from '../prompting/blueprint.js';

const CUSTOM_TEMPLATES_STORAGE_KEY = 'eidolon.web.templates.custom';
const LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS = ['bpui.web.templates.custom'];
const BLUEPRINT_OVERRIDES_STORAGE_KEY = 'eidolon.web.blueprints.overrides';
const LEGACY_BLUEPRINT_OVERRIDES_STORAGE_KEYS = ['bpui.web.blueprints.overrides'];

const blueprintModules = import.meta.glob('../../../../../blueprints/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const templateManifestModules = import.meta.glob('../../../../../blueprints/templates/**/template.toml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface StoredTemplateRecord {
  template: Template;
  blueprint_contents: Record<string, string>;
  template_root?: string;
}

type BlueprintCategory = 'core' | 'system' | 'template' | 'example';

interface BrowserBlueprint {
  name: string;
  description: string;
  invokable: boolean;
  version: string;
  content: string;
  path: string;
  category: BlueprintCategory;
  feature_category?: FeatureCategory;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTemplateShape(value: unknown): value is Template {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.version === 'string'
    && Array.isArray(value.assets);
}

function toStringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
}

function coerceStoredTemplateRecord(value: unknown): StoredTemplateRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (isTemplateShape(value.template)) {
    return {
      template: value.template,
      blueprint_contents: toStringMap(value.blueprint_contents),
      template_root: typeof value.template_root === 'string' ? value.template_root : undefined,
    };
  }

  if (isTemplateShape(value)) {
    return {
      template: value,
      blueprint_contents: toStringMap(value.blueprint_contents),
      template_root: typeof value.template_root === 'string' ? value.template_root : undefined,
    };
  }

  return null;
}

function coerceStoredTemplateRecords(value: unknown): StoredTemplateRecord[] {
  const candidates = Array.isArray(value)
    ? value
    : isRecord(value)
      ? Object.values(value)
      : [];

  return candidates
    .map(coerceStoredTemplateRecord)
    .filter((record): record is StoredTemplateRecord => Boolean(record));
}

function normalizePathSegments(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const segments = normalized.split('/');
  const resolved: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      if (resolved.length > 0) {
        resolved.pop();
      }
      continue;
    }

    resolved.push(segment);
  }

  return resolved.join('/');
}

function normalizeBlueprintPath(path: string): string {
  return normalizePathSegments(path.replace(/^\/+/, ''));
}

function resolveBlueprintPath(templateRoot: string | undefined, blueprintPath: string): string {
  const normalizedPath = normalizeBlueprintPath(blueprintPath);
  if (normalizedPath.startsWith('blueprints/')) {
    return normalizedPath;
  }

  if (!templateRoot) {
    return normalizedPath;
  }

  return normalizeBlueprintPath(`${templateRoot}/${normalizedPath}`);
}

function parseTomlString(rawValue: string): string {
  return rawValue.trim().replace(/^"|"$/g, '');
}

function parseTomlStringArray(rawValue: string): string[] {
  const values: string[] = [];
  const matcher = /"([^"]*)"/g;
  let match = matcher.exec(rawValue);

  while (match) {
    values.push(match[1]);
    match = matcher.exec(rawValue);
  }

  return values;
}

function parseTemplateManifest(content: string): Template | null {
  const normalizedContent = content.replace(/\r\n?/g, '\n');
  const lines = normalizedContent.split('\n');

  let section: 'template' | 'assets' | null = null;
  let pendingArrayKey: 'depends_on' | null = null;

  let templateName = '';
  let templateVersion = '1.0.0';
  let templateDescription = '';

  const assets: Template['assets'] = [];
  let currentAsset: Template['assets'][number] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    if (trimmed === '[template]') {
      section = 'template';
      pendingArrayKey = null;
      continue;
    }

    if (trimmed === '[[assets]]') {
      currentAsset = {
        name: '',
        required: false,
        depends_on: [],
        description: '',
      };
      assets.push(currentAsset);
      section = 'assets';
      pendingArrayKey = null;
      continue;
    }

    if (pendingArrayKey && currentAsset) {
      if (trimmed === ']') {
        pendingArrayKey = null;
        continue;
      }

      currentAsset.depends_on.push(...parseTomlStringArray(trimmed));
      continue;
    }

    const keyValueMatch = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!keyValueMatch) {
      continue;
    }

    const [, key, rawValue] = keyValueMatch;

    if (section === 'template') {
      if (key === 'name') {
        templateName = parseTomlString(rawValue);
      } else if (key === 'version') {
        templateVersion = parseTomlString(rawValue);
      } else if (key === 'description') {
        templateDescription = parseTomlString(rawValue);
      }
      continue;
    }

    if (section !== 'assets' || !currentAsset) {
      continue;
    }

    if (key === 'name') {
      currentAsset.name = parseTomlString(rawValue);
    } else if (key === 'required') {
      currentAsset.required = rawValue.trim() === 'true';
    } else if (key === 'depends_on') {
      const compactValue = rawValue.trim();
      if (compactValue === '[') {
        pendingArrayKey = 'depends_on';
      } else {
        currentAsset.depends_on = parseTomlStringArray(compactValue);
      }
    } else if (key === 'description') {
      currentAsset.description = parseTomlString(rawValue);
    } else if (key === 'blueprint_file') {
      currentAsset.blueprint_file = parseTomlString(rawValue);
    }
  }

  const parsedAssets = assets.filter((asset) => asset.name.trim().length > 0);
  if (!templateName.trim() || parsedAssets.length === 0) {
    return null;
  }

  return {
    name: templateName,
    version: templateVersion,
    description: templateDescription,
    is_official: true,
    assets: parsedAssets,
  };
}

function buildBuiltinTemplateRecords(): StoredTemplateRecord[] {
  const manifestRecords = Object.entries(templateManifestModules)
    .map(([modulePath, content]) => {
      const template = parseTemplateManifest(content);
      if (!template) {
        return null;
      }

      const manifestPath = modulePath.replace(/^.*\/blueprints\//, 'blueprints/');
      const templateRoot = manifestPath.replace(/\/template\.toml$/i, '');

      return {
        template,
        blueprint_contents: {},
        template_root: templateRoot,
      } as StoredTemplateRecord;
    })
    .filter((record): record is StoredTemplateRecord => Boolean(record));

  const defaultTemplateRoot = manifestRecords.find((record) => record.template_root?.endsWith('/official_v2v3'))?.template_root;
  const builtinRecords: StoredTemplateRecord[] = [
    {
      template: {
        ...OFFICIAL_TEMPLATE,
        is_default: true,
      },
      blueprint_contents: {},
      template_root: defaultTemplateRoot,
    },
  ];

  for (const record of manifestRecords) {
    if (record.template_root === defaultTemplateRoot || record.template.name === OFFICIAL_TEMPLATE.name) {
      continue;
    }

    builtinRecords.push(record);
  }

  return builtinRecords;
}

function sanitizeBlueprintSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getAssetBlueprintKey(asset: { name: string; blueprint_file?: string }): string {
  return asset.blueprint_file ?? `${asset.name}.md`;
}

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const keyList = Array.isArray(keys) ? [...keys] : [keys];
  const [currentKey, ...legacyKeys] = keyList;

  try {
    for (const key of keyList) {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as T;
      if (key !== currentKey) {
        window.localStorage.setItem(currentKey, JSON.stringify(parsed));
        legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
      }

      return parsed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
}

function buildDefaultBlueprintCatalog(): Map<string, BrowserBlueprint> {
  const catalog = new Map<string, BrowserBlueprint>();

  Object.entries(blueprintModules).forEach(([modulePath, content]) => {
    const normalizedPath = modulePath.replace(/^.*\/blueprints\//, 'blueprints/');
    const fileName = normalizedPath.split('/').pop()?.toLowerCase();
    if (fileName === 'readme.md') {
      return;
    }

    const metadata = parseBlueprintFrontmatter(content);

    let category: BlueprintCategory = 'core';
    if (normalizedPath.includes('/system/')) {
      category = 'system';
    } else if (normalizedPath.includes('/templates/')) {
      category = 'template';
    } else if (normalizedPath.includes('/examples/')) {
      category = 'example';
    }

    catalog.set(normalizedPath, {
      name: metadata.name,
      description: metadata.description,
      invokable: metadata.invokable,
      version: metadata.version,
      content,
      path: normalizedPath,
      category,
      feature_category: metadata.feature_category,
    });
  });

  return catalog;
}

export function getBlueprintOverrides(): Record<string, string> {
  return readStorage<Record<string, string>>(
    [BLUEPRINT_OVERRIDES_STORAGE_KEY, ...LEGACY_BLUEPRINT_OVERRIDES_STORAGE_KEYS],
    {}
  );
}

export function saveBlueprintOverrides(overrides: Record<string, string>): void {
  writeStorage(BLUEPRINT_OVERRIDES_STORAGE_KEY, LEGACY_BLUEPRINT_OVERRIDES_STORAGE_KEYS, overrides);
}

export function isCustomBlueprintPath(path: string): boolean {
  return path.startsWith('blueprints/custom/');
}

export function buildUniqueCustomBlueprintPath(name: string, excludePath?: string): string {
  const slug = sanitizeBlueprintSlug(name) || 'custom_blueprint';
  const catalog = getBlueprintCatalog();
  let candidate = `blueprints/custom/${slug}.md`;
  let suffix = 2;

  while (candidate !== excludePath && catalog.has(candidate)) {
    candidate = `blueprints/custom/${slug}_${suffix}.md`;
    suffix += 1;
  }

  return candidate;
}

export function getBlueprintCatalog(): Map<string, BrowserBlueprint> {
  const catalog = buildDefaultBlueprintCatalog();
  const overrides = getBlueprintOverrides();

  Object.entries(overrides).forEach(([path, content]) => {
    const metadata = parseBlueprintFrontmatter(content);
    const existing = catalog.get(path);
    catalog.set(path, {
      name: metadata.name,
      description: metadata.description,
      invokable: metadata.invokable,
      version: metadata.version,
      content,
      path,
      category: existing?.category ?? 'core',
      feature_category: metadata.feature_category,
    });
  });

  return catalog;
}

export function getOriginalBlueprintContent(path: string): string | null {
  const modulePath = `../../../../../${path}`;
  return (blueprintModules as Record<string, string>)[modulePath] ?? null;
}

export function hasBlueprintOverride(path: string): boolean {
  return path in getBlueprintOverrides();
}

export function findBlueprintContent(fileName?: string): string {
  if (!fileName) {
    return '';
  }

  const normalizedFileName = fileName.replace(/^\.?\//, '');
  const targetBase = normalizedFileName.replace(/\.(txt|md)$/i, '');
  const match = [...getBlueprintCatalog().values()].find((blueprint) => (
    blueprint.path === normalizedFileName
      || blueprint.path.endsWith(`/${normalizedFileName}`)
      || blueprint.path.endsWith(`/${targetBase}.md`)
  ));

  return match?.content ?? '';
}

function getLegacyBlueprintContent(
  blueprintContents: Record<string, string>,
  asset: { name: string; blueprint_file?: string }
): string | undefined {
  const blueprintKey = getAssetBlueprintKey(asset);
  const shortFileName = blueprintKey.split('/').pop() ?? blueprintKey;

  return blueprintContents[blueprintKey]
    ?? blueprintContents[shortFileName]
    ?? blueprintContents[asset.name];
}

function normalizeTemplateRecord(record: StoredTemplateRecord): StoredTemplateRecord {
  const normalizedContents: Record<string, string> = {};

  record.template.assets.forEach((asset) => {
    const blueprintKey = getAssetBlueprintKey(asset);
    const content = getLegacyBlueprintContent(record.blueprint_contents, asset);
    if (!content?.trim()) {
      return;
    }

    const builtinContent = findBlueprintContent(blueprintKey);
    if (builtinContent && builtinContent === content) {
      return;
    }

    normalizedContents[blueprintKey] = content;
  });

  Object.entries(record.blueprint_contents).forEach(([key, content]) => {
    if (!content?.trim() || normalizedContents[key]) {
      return;
    }

    const builtinContent = findBlueprintContent(key);
    if (builtinContent && builtinContent === content) {
      return;
    }

    normalizedContents[key] = content;
  });

  return {
    template: record.template,
    blueprint_contents: normalizedContents,
    template_root: record.template_root,
  };
}

function hydrateTemplateRecord(record: StoredTemplateRecord): StoredTemplateRecord {
  const normalized = normalizeTemplateRecord(record);
  const blueprintContents = { ...normalized.blueprint_contents };

  normalized.template.assets.forEach((asset) => {
    const blueprintKey = getAssetBlueprintKey(asset);
    if (!blueprintContents[blueprintKey]) {
      const builtinContent = findBlueprintContent(blueprintKey);
      if (builtinContent) {
        blueprintContents[blueprintKey] = builtinContent;
      }
    }
  });

  return {
    template: normalized.template,
    blueprint_contents: blueprintContents,
    template_root: normalized.template_root,
  };
}

export function getStoredTemplates(): StoredTemplateRecord[] {
  const stored = readStorage<unknown>(
    [CUSTOM_TEMPLATES_STORAGE_KEY, ...LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS],
    []
  );
  const coerced = coerceStoredTemplateRecords(stored);
  const normalized = coerced.map(normalizeTemplateRecord);

  if (JSON.stringify(stored) !== JSON.stringify(normalized)) {
    writeStorage(CUSTOM_TEMPLATES_STORAGE_KEY, LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS, normalized);
  }

  return normalized;
}

export function saveStoredTemplates(records: StoredTemplateRecord[]): void {
  writeStorage(
    CUSTOM_TEMPLATES_STORAGE_KEY,
    LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS,
    records.map(normalizeTemplateRecord)
  );
}

export function getAllTemplateRecords(): StoredTemplateRecord[] {
  return [
    ...buildBuiltinTemplateRecords().map(hydrateTemplateRecord),
    ...getStoredTemplates().map(hydrateTemplateRecord),
  ];
}

export function getStoredTemplateRecord(name?: string): StoredTemplateRecord | undefined {
  if (!name) {
    return undefined;
  }

  return getStoredTemplates().find((record) => record.template.name === name);
}

export function getTemplateRecord(name?: string): StoredTemplateRecord | undefined {
  if (!name) {
    return undefined;
  }

  return getAllTemplateRecords().find((record) => record.template.name === name);
}

export function resolveTemplateDefinition(name?: string): Template | undefined {
  return getTemplateRecord(name)?.template;
}

export function resolveTemplateAssets(name?: string): TemplateAsset[] | undefined {
  const template = resolveTemplateDefinition(name);
  return template ? templateToAssets(template) : undefined;
}

export function resolveTemplateBlueprintContent(templateName: string | undefined, assetName: string): string | undefined {
  const record = getTemplateRecord(templateName);
  if (!record) {
    return undefined;
  }

  const asset = record.template.assets.find((candidate) => candidate.name === assetName);
  if (!asset) {
    return undefined;
  }

  const blueprintFile = getAssetBlueprintKey(asset);
  const resolvedBlueprintFile = resolveBlueprintPath(record.template_root, blueprintFile);

  return record.blueprint_contents[blueprintFile]
    || record.blueprint_contents[resolvedBlueprintFile]
    || findBlueprintContent(resolvedBlueprintFile)
    || findBlueprintContent(blueprintFile)
    || undefined;
}

export function inferCharacterDisplayNameForTemplate(
  assets: Record<string, string>,
  templateName?: string
): string | undefined {
  const template = resolveTemplateDefinition(templateName);
  const preferredAssets = template
    ? getOrderedAssets(template).map((asset) => asset.name)
    : ['character_sheet'];

  const displayName = inferCharacterDisplayNameFromAssets(assets, preferredAssets);
  return displayName ?? undefined;
}