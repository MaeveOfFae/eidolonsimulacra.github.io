import {
  buildBlueprintList,
  buildTemplateBlueprintContentsResponse,
  findStoredTemplateRecord,
  hydrateStoredTemplateRecord,
  inferBlueprintCategoryFromPath,
  normalizeStoredTemplateRecord,
  parseTemplateManifest,
  resolveTemplateDefinitionFromRecords,
  resolveTemplateRecordBlueprintContent,
  type Blueprint,
  type BlueprintList,
  type FeatureCategory,
  type Template,
  type TemplateBlueprintContentsResponse,
} from '@char-gen/shared';
import { bundledBlueprintContents, bundledTemplateManifestContents } from '../generated/local-content';

const CUSTOM_TEMPLATES_STORAGE_KEY = 'eidolon.mobile.templates.custom';
const BLUEPRINT_OVERRIDES_STORAGE_KEY = 'eidolon.mobile.blueprints.overrides';

type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;
const blueprintContentMap = bundledBlueprintContents as Record<string, string>;
const templateManifestMap = bundledTemplateManifestContents as Record<string, string>;

export interface StoredTemplateRecord {
  template: Template;
  blueprint_contents: Record<string, string>;
  template_root?: string;
}

function getStorage(): StorageLike | null {
  const maybeStorage = globalThis as { localStorage?: StorageLike };
  return maybeStorage.localStorage ?? null;
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  const value = storage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
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

function parseBlueprintMetadata(
  path: string,
  content: string,
): {
  name: string;
  description: string;
  version: string;
  invokable: boolean;
  feature_category?: FeatureCategory;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let name = path.split('/').pop()?.replace('.md', '') || 'Blueprint';
  let description = '';
  let version = '1.0';
  let invokable = true;
  let featureCategory: FeatureCategory | undefined;

  if (!frontmatterMatch) {
    return { name, description, version, invokable, feature_category: featureCategory };
  }

  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);
  const invokableMatch = frontmatter.match(/^invokable:\s*(.+)$/m);
  const featureCategoryMatch = frontmatter.match(/^feature_category:\s*(.+)$/m);

  if (nameMatch) {
    name = nameMatch[1].trim();
  }
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
  }
  if (versionMatch) {
    version = versionMatch[1].trim();
  }
  if (invokableMatch) {
    invokable = invokableMatch[1].trim() === 'true';
  }
  if (featureCategoryMatch) {
    featureCategory = featureCategoryMatch[1].trim() as FeatureCategory;
  }

  return { name, description, version, invokable, feature_category: featureCategory };
}

function buildBlueprint(path: string, content: string): Blueprint {
  const metadata = parseBlueprintMetadata(path, content);
  return {
    name: metadata.name,
    description: metadata.description,
    version: metadata.version,
    invokable: metadata.invokable,
    content,
    path,
    category: inferBlueprintCategoryFromPath(path),
    feature_category: metadata.feature_category,
  };
}

function resolveBundledBlueprintContent(path: string): string | undefined {
  const overrides = getBlueprintOverrides();
  return overrides[path] ?? blueprintContentMap[path];
}

function getBuiltInTemplateRecords(): StoredTemplateRecord[] {
  return Object.entries(templateManifestMap).reduce<StoredTemplateRecord[]>(
    (records, [manifestPath, content], index) => {
      const template = parseTemplateManifest(content);
      if (!template) {
        return records;
      }

      template.is_default = index === 0;
      const templateRoot = manifestPath.includes('/')
        ? manifestPath.slice(0, manifestPath.lastIndexOf('/'))
        : undefined;

      records.push({
        template,
        blueprint_contents: {},
        template_root: templateRoot,
      });

      return records;
    },
    [],
  );
}

function readStoredTemplateRecords(): StoredTemplateRecord[] {
  const stored = readJson<StoredTemplateRecord[]>(CUSTOM_TEMPLATES_STORAGE_KEY, []);
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
    .filter((record): record is StoredTemplateRecord =>
      Boolean(record?.template?.name && Array.isArray(record?.template?.assets)),
    )
    .map((record) =>
      normalizeStoredTemplateRecord(record, {
        resolveBuiltinContent: resolveBundledBlueprintContent,
      }),
    );
}

export function saveStoredTemplates(records: StoredTemplateRecord[]): void {
  writeJson(
    CUSTOM_TEMPLATES_STORAGE_KEY,
    records.map((record) =>
      normalizeStoredTemplateRecord(record, {
        resolveBuiltinContent: resolveBundledBlueprintContent,
      }),
    ),
  );
}

export function getStoredTemplates(): StoredTemplateRecord[] {
  return readStoredTemplateRecords();
}

export function getStoredTemplateRecord(name: string): StoredTemplateRecord | null {
  return findStoredTemplateRecord(readStoredTemplateRecords(), name) ?? null;
}

export function getAllTemplateRecords(): StoredTemplateRecord[] {
  const byName = new Map<string, StoredTemplateRecord>();
  getBuiltInTemplateRecords().forEach((record) =>
    byName.set(
      record.template.name,
      hydrateStoredTemplateRecord(record, {
        resolveBuiltinContent: resolveBundledBlueprintContent,
      }),
    ),
  );
  readStoredTemplateRecords().forEach((record) =>
    byName.set(
      record.template.name,
      hydrateStoredTemplateRecord(record, {
        resolveBuiltinContent: resolveBundledBlueprintContent,
      }),
    ),
  );
  return Array.from(byName.values());
}

export function getTemplateRecord(name: string): StoredTemplateRecord | null {
  return findStoredTemplateRecord(getAllTemplateRecords(), name) ?? null;
}

export function resolveTemplateDefinition(name?: string): Template | undefined {
  return resolveTemplateDefinitionFromRecords(getAllTemplateRecords(), {
    name,
    fallbackToDefault: true,
  });
}

export function getTemplateBlueprintContents(name: string): TemplateBlueprintContentsResponse {
  return buildTemplateBlueprintContentsResponse(getTemplateRecord(name));
}

export function getBlueprintOverrides(): Record<string, string> {
  return readJson<Record<string, string>>(BLUEPRINT_OVERRIDES_STORAGE_KEY, {});
}

export function saveBlueprintOverrides(overrides: Record<string, string>): void {
  writeJson(BLUEPRINT_OVERRIDES_STORAGE_KEY, overrides);
}

export function getOriginalBlueprintContent(path: string): string | null {
  return blueprintContentMap[path] ?? null;
}

export function hasBlueprintOverride(path: string): boolean {
  return Object.prototype.hasOwnProperty.call(getBlueprintOverrides(), path);
}

export function isCustomBlueprintPath(path: string): boolean {
  return getOriginalBlueprintContent(path) === null;
}

export function getBlueprintCatalog(): Map<string, Blueprint> {
  const catalog = new Map<string, Blueprint>();

  Object.entries(blueprintContentMap).forEach(([path, content]) => {
    catalog.set(path, buildBlueprint(path, content));
  });

  Object.entries(getBlueprintOverrides()).forEach(([path, content]) => {
    catalog.set(path, buildBlueprint(path, content));
  });

  return catalog;
}

export function resolveTemplateBlueprintContent(templateName: string | undefined, assetName: string): string | null {
  const record = templateName
    ? getTemplateRecord(templateName)
    : (getAllTemplateRecords().find((entry) => entry.template.is_default) ?? getAllTemplateRecords()[0]);
  if (!record) {
    return null;
  }

  return (
    resolveTemplateRecordBlueprintContent(record, assetName, {
      resolveBuiltinContent: resolveBundledBlueprintContent,
    }) ?? null
  );
}

export function getBlueprintList(): BlueprintList {
  const values = [...getBlueprintCatalog().values()];
  return buildBlueprintList(values);
}
