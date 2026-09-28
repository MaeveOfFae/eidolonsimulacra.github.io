import type {
  Blueprint,
  BlueprintList,
  CreateTemplateRequest,
  Template,
  TemplateBlueprintContentsResponse,
} from './types';

export type BlueprintCategory = Blueprint['category'];

export interface StoredTemplateRecordLike {
  template: Template;
  blueprint_contents: Record<string, string>;
  template_root?: string;
}

export interface BuildStoredTemplateRecordOptions {
  isOfficial?: boolean;
  isDefault?: boolean;
  templateRoot?: string;
}

export type BlueprintContentResolver = (path: string) => string | undefined | null;

export function normalizePathSegments(path: string): string {
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

export function normalizeBlueprintPath(path: string): string {
  return normalizePathSegments(path.replace(/^\/+/, ''));
}

export function resolveBlueprintPath(templateRoot: string | undefined, blueprintPath: string): string {
  const normalizedPath = normalizeBlueprintPath(blueprintPath);
  if (normalizedPath.startsWith('blueprints/')) {
    return normalizedPath;
  }

  if (!templateRoot) {
    return normalizedPath;
  }

  return normalizeBlueprintPath(`${templateRoot}/${normalizedPath}`);
}

export function inferBlueprintCategoryFromPath(path: string): BlueprintCategory {
  if (path.startsWith('blueprints/system/')) {
    return 'system';
  }

  if (path.startsWith('blueprints/examples/')) {
    return 'example';
  }

  if (path.startsWith('blueprints/templates/')) {
    return 'template';
  }

  return 'core';
}

export function parseTomlString(rawValue: string): string {
  return rawValue.trim().replace(/^"|"$/g, '');
}

export function parseTomlStringArray(rawValue: string): string[] {
  const values: string[] = [];
  const matcher = /"([^"]*)"/g;
  let match = matcher.exec(rawValue);

  while (match) {
    values.push(match[1]);
    match = matcher.exec(rawValue);
  }

  return values;
}

export function getTemplateBlueprintKey(asset: { name: string; blueprint_file?: string }): string {
  return asset.blueprint_file ?? `${asset.name}.md`;
}

export function buildStoredTemplateRecord<T extends StoredTemplateRecordLike = StoredTemplateRecordLike>(
  template: CreateTemplateRequest,
  options: BuildStoredTemplateRecordOptions = {},
): T {
  const nextTemplate: Template = {
    name: template.name,
    version: template.version,
    description: template.description,
    assets: template.assets.map((asset) => ({
      ...asset,
      depends_on: [...(asset.depends_on ?? [])],
    })),
    is_official: options.isOfficial ?? false,
  };

  if (options.isDefault !== undefined) {
    nextTemplate.is_default = options.isDefault;
  }

  return {
    template: nextTemplate,
    blueprint_contents: { ...template.blueprint_contents },
    ...(options.templateRoot === undefined ? {} : { template_root: options.templateRoot }),
  } as T;
}

export function cloneStoredTemplateRecord<T extends StoredTemplateRecordLike>(record: T): T {
  return {
    ...record,
    template: {
      ...record.template,
      assets: record.template.assets.map((asset) => ({
        ...asset,
        depends_on: [...(asset.depends_on ?? [])],
      })),
    },
    blueprint_contents: { ...record.blueprint_contents },
  };
}

export function getLegacyTemplateBlueprintContent(
  blueprintContents: Record<string, string>,
  asset: { name: string; blueprint_file?: string },
): string | undefined {
  const blueprintKey = getTemplateBlueprintKey(asset);
  const shortFileName = blueprintKey.split('/').pop() ?? blueprintKey;

  return blueprintContents[blueprintKey] ?? blueprintContents[shortFileName] ?? blueprintContents[asset.name];
}

export function normalizeStoredTemplateRecord<T extends StoredTemplateRecordLike>(
  record: T,
  options: { resolveBuiltinContent?: BlueprintContentResolver } = {},
): T {
  const normalized = cloneStoredTemplateRecord(record);
  const normalizedContents: Record<string, string> = {};

  normalized.template.assets.forEach((asset) => {
    const blueprintKey = getTemplateBlueprintKey(asset);
    const content = getLegacyTemplateBlueprintContent(normalized.blueprint_contents, asset);
    if (!content?.trim()) {
      return;
    }

    const builtinContent = options.resolveBuiltinContent?.(blueprintKey);
    if (typeof builtinContent === 'string' && builtinContent === content) {
      return;
    }

    normalizedContents[blueprintKey] = content;
  });

  Object.entries(normalized.blueprint_contents).forEach(([key, content]) => {
    if (!content?.trim() || normalizedContents[key]) {
      return;
    }

    const builtinContent = options.resolveBuiltinContent?.(key);
    if (typeof builtinContent === 'string' && builtinContent === content) {
      return;
    }

    normalizedContents[key] = content;
  });

  normalized.blueprint_contents = normalizedContents;
  return normalized;
}

export function hydrateStoredTemplateRecord<T extends StoredTemplateRecordLike>(
  record: T,
  options: { resolveBuiltinContent?: BlueprintContentResolver } = {},
): T {
  const hydrated = normalizeStoredTemplateRecord(record, options);

  hydrated.template.assets.forEach((asset) => {
    const blueprintKey = getTemplateBlueprintKey(asset);
    const resolvedBlueprintKey = resolveBlueprintPath(hydrated.template_root, blueprintKey);
    const existingContent =
      hydrated.blueprint_contents[blueprintKey] ?? hydrated.blueprint_contents[resolvedBlueprintKey];
    if (existingContent?.trim()) {
      return;
    }

    const builtinContent =
      options.resolveBuiltinContent?.(resolvedBlueprintKey) ?? options.resolveBuiltinContent?.(blueprintKey);
    if (!builtinContent?.trim()) {
      return;
    }

    hydrated.blueprint_contents[blueprintKey] = builtinContent;
  });

  return hydrated;
}

export function resolveTemplateRecordBlueprintContent<T extends StoredTemplateRecordLike>(
  record: T,
  assetName: string,
  options: { resolveBuiltinContent?: BlueprintContentResolver } = {},
): string | undefined {
  const asset = record.template.assets.find((candidate) => candidate.name === assetName);
  if (!asset) {
    return undefined;
  }

  const blueprintKey = getTemplateBlueprintKey(asset);
  const resolvedBlueprintKey = resolveBlueprintPath(record.template_root, blueprintKey);
  const storedContent =
    record.blueprint_contents[blueprintKey] ??
    record.blueprint_contents[resolvedBlueprintKey] ??
    getLegacyTemplateBlueprintContent(record.blueprint_contents, asset);

  if (storedContent?.trim()) {
    return storedContent;
  }

  return (
    options.resolveBuiltinContent?.(resolvedBlueprintKey) ?? options.resolveBuiltinContent?.(blueprintKey) ?? undefined
  );
}

export function buildBlueprintList(blueprints: Blueprint[]): BlueprintList {
  return {
    core: blueprints.filter((blueprint) => blueprint.category === 'core'),
    system: blueprints.filter((blueprint) => blueprint.category === 'system'),
    templates: {
      local: blueprints.filter((blueprint) => blueprint.category === 'template'),
    },
    examples: blueprints.filter((blueprint) => blueprint.category === 'example'),
  };
}

export function buildMissingTemplateBlueprintWarnings(
  template: Template,
  resolveBlueprintContent: (assetName: string) => string | undefined | null,
): string[] {
  return template.assets
    .filter((asset) => !resolveBlueprintContent(asset.name))
    .map((asset) => `Missing blueprint content for ${asset.name}`);
}

export function findStoredTemplateRecord<T extends StoredTemplateRecordLike>(
  records: T[],
  name?: string | null,
): T | undefined {
  if (!name) {
    return undefined;
  }

  return records.find((record) => record.template.name === name);
}

export function resolveTemplateDefinitionFromRecords<T extends StoredTemplateRecordLike>(
  records: T[],
  options: { name?: string | null; fallbackToDefault?: boolean } = {},
): Template | undefined {
  if (options.name) {
    return findStoredTemplateRecord(records, options.name)?.template;
  }

  if (!options.fallbackToDefault) {
    return undefined;
  }

  return records.find((record) => record.template.is_default)?.template ?? records[0]?.template;
}

export function buildTemplateBlueprintContentsResponse(
  record?: StoredTemplateRecordLike | null,
): TemplateBlueprintContentsResponse {
  return {
    blueprint_contents: record ? { ...record.blueprint_contents } : {},
  };
}

export function parseTemplateManifest(content: string): Template | null {
  const normalizedContent = content.replace(/\r\n?/g, '\n');
  const lines = normalizedContent.split('\n');

  let section: 'template' | 'assets' | null = null;
  let pendingArrayKey: 'depends_on' | 'import_aliases' | null = null;

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

      const parsedValues = parseTomlStringArray(trimmed);
      if (pendingArrayKey === 'depends_on') {
        currentAsset.depends_on.push(...parsedValues);
      } else {
        currentAsset.import_aliases = [...(currentAsset.import_aliases ?? []), ...parsedValues];
      }
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
    } else if (key === 'import_aliases') {
      const compactValue = rawValue.trim();
      if (compactValue === '[') {
        pendingArrayKey = 'import_aliases';
      } else {
        currentAsset.import_aliases = parseTomlStringArray(compactValue);
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
