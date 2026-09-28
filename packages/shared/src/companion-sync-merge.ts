import {
  cloneStoredTemplateRecord,
  type BlueprintContentResolver,
  type StoredTemplateRecordLike,
} from './content-runtime';
import type { ApiKeys, Config, Draft } from './types';
import type { WorkspaceBundleTemplateRecord } from './workspace-bundle';

export interface AdditiveDraftMergePlan {
  localById: Map<string, Draft>;
  newDrafts: Draft[];
  conflictingDrafts: Draft[];
  matchingReviewIds: number;
  identicalReviewIds: number;
  conflictingReviewIds: number;
  newReviewIds: number;
}

export interface AdditiveTemplateMergePlan {
  records: StoredTemplateRecordLike[];
  imported: number;
  matchingNames: number;
  identicalNames: number;
  conflictingNames: number;
  newNames: number;
  conflictingTemplates: Array<{
    incomingName: string;
    importedName: string;
  }>;
  newTemplateNames: string[];
}

export interface AdditiveBlueprintMergePlan {
  overrides: Record<string, string>;
  imported: number;
  matchingPaths: number;
  identicalPaths: number;
  conflictingPaths: number;
  overridingPaths: number;
  newPaths: number;
  conflictingBlueprints: Array<{
    incomingPath: string;
    importedPath: string;
  }>;
  overridingBlueprintPaths: string[];
  newBlueprintPaths: string[];
}

export interface AdditiveConfigDefaultState {
  engine: Config['engine'];
  engine_mode: Config['engine_mode'];
  model: string;
  temperature: number;
  max_tokens: number;
  batch: Config['batch'];
  feature_blueprints?: Config['feature_blueprints'];
  base_url?: string;
}

export interface AdditiveConfigMergePlan {
  updates: Partial<Config>;
  importedCount: number;
  modelWillChange: boolean;
}

export interface AdditiveApiKeyMergePlan {
  importedKeys: ApiKeys;
  importedCount: number;
}

export interface AdditiveBlueprintMergeOptions {
  knownPaths?: Iterable<string>;
  resolveOriginalContent?: BlueprintContentResolver;
}

function cloneTemplateRecordLike(record: StoredTemplateRecordLike): StoredTemplateRecordLike {
  return cloneStoredTemplateRecord(record);
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

export function areDraftsEquivalent(left: Draft, right: Draft): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function areTemplateRecordsEquivalent(left: StoredTemplateRecordLike, right: StoredTemplateRecordLike): boolean {
  return JSON.stringify(cloneTemplateRecordLike(left)) === JSON.stringify(cloneTemplateRecordLike(right));
}

export function getUniqueTemplateCopyName(usedNames: Set<string>, requestedName: string): string {
  if (!usedNames.has(requestedName)) {
    return requestedName;
  }

  const copyBase = requestedName.endsWith(' Copy') ? requestedName : `${requestedName} Copy`;
  if (!usedNames.has(copyBase)) {
    return copyBase;
  }

  let suffix = 2;
  let candidate = `${copyBase} ${suffix}`;
  while (usedNames.has(candidate)) {
    suffix += 1;
    candidate = `${copyBase} ${suffix}`;
  }

  return candidate;
}

export function getUniqueBlueprintCopyPath(usedPaths: Set<string>, requestedName: string): string {
  const slug = sanitizeBlueprintSlug(requestedName) || 'custom_blueprint';
  let candidate = `blueprints/custom/${slug}.md`;
  let suffix = 2;

  while (usedPaths.has(candidate)) {
    candidate = `blueprints/custom/${slug}_${suffix}.md`;
    suffix += 1;
  }

  return candidate;
}

export function planAdditiveDraftMerge(
  localDrafts: readonly Draft[],
  incomingDrafts: readonly Draft[] | undefined,
): AdditiveDraftMergePlan {
  const localById = new Map(localDrafts.map((draft) => [draft.metadata.review_id, draft] as const));
  const newDrafts: Draft[] = [];
  const conflictingDrafts: Draft[] = [];
  let identicalReviewIds = 0;

  for (const incomingDraft of incomingDrafts ?? []) {
    const existingDraft = localById.get(incomingDraft.metadata.review_id);
    if (!existingDraft) {
      newDrafts.push(incomingDraft);
      continue;
    }

    if (areDraftsEquivalent(existingDraft, incomingDraft)) {
      identicalReviewIds += 1;
      continue;
    }

    conflictingDrafts.push(incomingDraft);
  }

  return {
    localById,
    newDrafts,
    conflictingDrafts,
    matchingReviewIds: identicalReviewIds + conflictingDrafts.length,
    identicalReviewIds,
    conflictingReviewIds: conflictingDrafts.length,
    newReviewIds: newDrafts.length,
  };
}

export function planAdditiveTemplateMerge(
  existingStored: readonly StoredTemplateRecordLike[],
  localAllRecords: readonly StoredTemplateRecordLike[],
  incoming: readonly WorkspaceBundleTemplateRecord[] | undefined,
): AdditiveTemplateMergePlan {
  const nextRecords = existingStored.map((record) => cloneTemplateRecordLike(record));
  const existingByName = new Map(localAllRecords.map((record) => [record.template.name, record] as const));
  const usedNames = new Set(existingByName.keys());
  let imported = 0;
  let matchingNames = 0;
  let identicalNames = 0;
  const conflictingTemplates: Array<{ incomingName: string; importedName: string }> = [];
  const newTemplateNames: string[] = [];

  for (const record of incoming ?? []) {
    const incomingRecord = cloneTemplateRecordLike(record);
    const existingRecord = existingByName.get(incomingRecord.template.name);
    if (!existingRecord) {
      nextRecords.push(incomingRecord);
      existingByName.set(incomingRecord.template.name, incomingRecord);
      usedNames.add(incomingRecord.template.name);
      imported += 1;
      newTemplateNames.push(incomingRecord.template.name);
      continue;
    }

    matchingNames += 1;
    if (areTemplateRecordsEquivalent(existingRecord, incomingRecord)) {
      identicalNames += 1;
      continue;
    }

    const copiedName = getUniqueTemplateCopyName(usedNames, incomingRecord.template.name);
    incomingRecord.template.name = copiedName;
    nextRecords.push(incomingRecord);
    existingByName.set(copiedName, incomingRecord);
    usedNames.add(copiedName);
    imported += 1;
    conflictingTemplates.push({
      incomingName: record.template.name,
      importedName: copiedName,
    });
  }

  return {
    records: nextRecords,
    imported,
    matchingNames,
    identicalNames,
    conflictingNames: conflictingTemplates.length,
    newNames: newTemplateNames.length,
    conflictingTemplates,
    newTemplateNames,
  };
}

export function planAdditiveBlueprintOverrideMerge(
  existingOverrides: Record<string, string>,
  incoming: Record<string, string> | undefined,
  options: AdditiveBlueprintMergeOptions = {},
): AdditiveBlueprintMergePlan {
  if (!incoming || Object.keys(incoming).length === 0) {
    return {
      overrides: existingOverrides,
      imported: 0,
      matchingPaths: 0,
      identicalPaths: 0,
      conflictingPaths: 0,
      overridingPaths: 0,
      newPaths: 0,
      conflictingBlueprints: [],
      overridingBlueprintPaths: [],
      newBlueprintPaths: [],
    };
  }

  const nextOverrides = { ...existingOverrides };
  const usedPaths = new Set<string>([...Object.keys(existingOverrides), ...(options.knownPaths ?? [])]);
  let imported = 0;
  let matchingPaths = 0;
  let identicalPaths = 0;
  const conflictingBlueprints: Array<{ incomingPath: string; importedPath: string }> = [];
  const overridingBlueprintPaths: string[] = [];
  const newBlueprintPaths: string[] = [];

  for (const [path, content] of Object.entries(incoming)) {
    const existingOverride = nextOverrides[path];
    if (typeof existingOverride === 'string') {
      matchingPaths += 1;
      if (existingOverride === content) {
        identicalPaths += 1;
        continue;
      }

      const fallbackName = `${path.split('/').pop()?.replace(/\.md$/i, '') || 'blueprint'} Sync`;
      const copiedPath = getUniqueBlueprintCopyPath(usedPaths, fallbackName);
      nextOverrides[copiedPath] = content;
      usedPaths.add(copiedPath);
      imported += 1;
      conflictingBlueprints.push({ incomingPath: path, importedPath: copiedPath });
      continue;
    }

    const builtinContent = options.resolveOriginalContent?.(path) ?? null;
    if (builtinContent !== null) {
      matchingPaths += 1;
    }
    if (builtinContent === content) {
      identicalPaths += 1;
      continue;
    }

    nextOverrides[path] = content;
    usedPaths.add(path);
    imported += 1;
    if (builtinContent !== null) {
      overridingBlueprintPaths.push(path);
    } else {
      newBlueprintPaths.push(path);
    }
  }

  return {
    overrides: nextOverrides,
    imported,
    matchingPaths,
    identicalPaths,
    conflictingPaths: conflictingBlueprints.length,
    overridingPaths: overridingBlueprintPaths.length,
    newPaths: newBlueprintPaths.length,
    conflictingBlueprints,
    overridingBlueprintPaths,
    newBlueprintPaths,
  };
}

export function planAdditiveConfigMerge(
  currentConfig: Config,
  incomingConfig: Omit<Config, 'api_keys'> | undefined,
  defaultConfig: AdditiveConfigDefaultState,
): AdditiveConfigMergePlan {
  if (!incomingConfig) {
    return { updates: {}, importedCount: 0, modelWillChange: false };
  }

  const updates: Partial<Config> = {};
  let importedCount = 0;

  if (currentConfig.engine === defaultConfig.engine && incomingConfig.engine !== currentConfig.engine) {
    updates.engine = incomingConfig.engine;
    importedCount += 1;
  }
  if (
    currentConfig.engine_mode === defaultConfig.engine_mode &&
    incomingConfig.engine_mode !== currentConfig.engine_mode
  ) {
    updates.engine_mode = incomingConfig.engine_mode;
    importedCount += 1;
  }
  if (currentConfig.model === defaultConfig.model && incomingConfig.model !== currentConfig.model) {
    updates.model = incomingConfig.model;
    importedCount += 1;
  }
  if (
    currentConfig.temperature === defaultConfig.temperature &&
    incomingConfig.temperature !== currentConfig.temperature
  ) {
    updates.temperature = incomingConfig.temperature;
    importedCount += 1;
  }
  if (currentConfig.max_tokens === defaultConfig.max_tokens && incomingConfig.max_tokens !== currentConfig.max_tokens) {
    updates.max_tokens = incomingConfig.max_tokens;
    importedCount += 1;
  }

  const incomingBaseUrl = (incomingConfig as Config & { base_url?: string }).base_url;
  if (incomingBaseUrl && !(currentConfig as Config & { base_url?: string }).base_url) {
    (updates as Partial<Config> & { base_url?: string }).base_url = incomingBaseUrl;
    importedCount += 1;
  }

  const batchUpdates: Partial<Config['batch']> = {};
  if (
    currentConfig.batch.max_concurrent === defaultConfig.batch.max_concurrent &&
    incomingConfig.batch.max_concurrent !== currentConfig.batch.max_concurrent
  ) {
    batchUpdates.max_concurrent = incomingConfig.batch.max_concurrent;
    importedCount += 1;
  }
  if (
    currentConfig.batch.rate_limit_delay === defaultConfig.batch.rate_limit_delay &&
    incomingConfig.batch.rate_limit_delay !== currentConfig.batch.rate_limit_delay
  ) {
    batchUpdates.rate_limit_delay = incomingConfig.batch.rate_limit_delay;
    importedCount += 1;
  }
  if (Object.keys(batchUpdates).length > 0) {
    updates.batch = {
      ...currentConfig.batch,
      ...batchUpdates,
    };
  }

  const nextFeatureBlueprints = { ...(currentConfig.feature_blueprints ?? {}) } as Record<string, string>;
  const defaultFeatureBlueprints = (defaultConfig.feature_blueprints ?? {}) as Record<string, string | undefined>;
  let featureBlueprintChanged = false;
  for (const [feature, incomingPath] of Object.entries(incomingConfig.feature_blueprints ?? {})) {
    const currentPath = nextFeatureBlueprints[feature];
    const defaultPath = defaultFeatureBlueprints[feature];
    if ((!currentPath || currentPath === defaultPath) && incomingPath && incomingPath !== currentPath) {
      nextFeatureBlueprints[feature] = incomingPath;
      featureBlueprintChanged = true;
      importedCount += 1;
    }
  }
  if (featureBlueprintChanged) {
    updates.feature_blueprints = nextFeatureBlueprints as Config['feature_blueprints'];
  }

  return {
    updates,
    importedCount,
    modelWillChange: typeof updates.model === 'string' && updates.model !== currentConfig.model,
  };
}

export function planAdditiveApiKeyMerge(
  existingKeys: ApiKeys,
  incomingKeys: ApiKeys | undefined,
): AdditiveApiKeyMergePlan {
  if (!incomingKeys) {
    return { importedKeys: {}, importedCount: 0 };
  }

  const importedKeys = Object.fromEntries(
    Object.entries(incomingKeys).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1].length > 0 && !existingKeys[entry[0]],
    ),
  );

  return {
    importedKeys,
    importedCount: Object.keys(importedKeys).length,
  };
}
