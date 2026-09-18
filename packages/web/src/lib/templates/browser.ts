import {
  OFFICIAL_TEMPLATE,
  buildTemplateBlueprintContentsResponse,
  findStoredTemplateRecord,
  hydrateStoredTemplateRecord,
  inferBlueprintCategoryFromPath,
  normalizeStoredTemplateRecord,
  parseTemplateManifest,
  resolveTemplateDefinitionFromRecords,
  resolveTemplateRecordBlueprintContent,
  getOrderedAssets,
  inferCharacterDisplayNameFromAssets,
  type BlueprintCategory,
  type FeatureCategory,
  type Template,
  type TemplateBlueprintContentsResponse,
} from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';
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

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  return readPersistedJson(keys, fallback);
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  writePersistedJson(key, legacyKeys, value);
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

    catalog.set(normalizedPath, {
      name: metadata.name,
      description: metadata.description,
      invokable: metadata.invokable,
      version: metadata.version,
      content,
      path: normalizedPath,
      category: inferBlueprintCategoryFromPath(normalizedPath),
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

export function getStoredTemplates(): StoredTemplateRecord[] {
  const stored = readStorage<unknown>(
    [CUSTOM_TEMPLATES_STORAGE_KEY, ...LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS],
    []
  );
  const coerced = coerceStoredTemplateRecords(stored);
  const normalized = coerced.map((record) => normalizeStoredTemplateRecord(record, {
    resolveBuiltinContent: findBlueprintContent,
  }));

  if (JSON.stringify(stored) !== JSON.stringify(normalized)) {
    writeStorage(CUSTOM_TEMPLATES_STORAGE_KEY, LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS, normalized);
  }

  return normalized;
}

export function saveStoredTemplates(records: StoredTemplateRecord[]): void {
  writeStorage(
    CUSTOM_TEMPLATES_STORAGE_KEY,
    LEGACY_CUSTOM_TEMPLATES_STORAGE_KEYS,
    records.map((record) => normalizeStoredTemplateRecord(record, {
      resolveBuiltinContent: findBlueprintContent,
    }))
  );
}

export function getAllTemplateRecords(): StoredTemplateRecord[] {
  return [
    ...buildBuiltinTemplateRecords().map((record) => hydrateStoredTemplateRecord(record, {
      resolveBuiltinContent: findBlueprintContent,
    })),
    ...getStoredTemplates().map((record) => hydrateStoredTemplateRecord(record, {
      resolveBuiltinContent: findBlueprintContent,
    })),
  ];
}

export function getStoredTemplateRecord(name?: string): StoredTemplateRecord | undefined {
  return findStoredTemplateRecord(getStoredTemplates(), name);
}

export function getTemplateRecord(name?: string): StoredTemplateRecord | undefined {
  return findStoredTemplateRecord(getAllTemplateRecords(), name);
}

export function resolveTemplateDefinition(name?: string): Template | undefined {
  return resolveTemplateDefinitionFromRecords(getAllTemplateRecords(), { name });
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

  return resolveTemplateRecordBlueprintContent(record, assetName, {
    resolveBuiltinContent: findBlueprintContent,
  });
}

export function getTemplateBlueprintContents(name: string): TemplateBlueprintContentsResponse {
  return buildTemplateBlueprintContentsResponse(getTemplateRecord(name));
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