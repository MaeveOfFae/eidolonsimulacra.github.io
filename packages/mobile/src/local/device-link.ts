import {
  filterDesktopCompanionSyncPayload,
  getSelectedDesktopCompanionSyncDomains,
  type ApiKeys,
  buildDraftLibraryExport,
  createDesktopCompanionSyncState,
  createWorkspaceBundle,
  type DesktopCompanionSyncSelection,
  type DesktopCompanionSyncSource,
  planAdditiveApiKeyMerge,
  planAdditiveBlueprintOverrideMerge,
  planAdditiveConfigMerge,
  planAdditiveDraftMerge,
  planAdditiveTemplateMerge,
  parseDesktopCompanionSyncState,
  parseWorkspaceBundle,
  type Config,
  type Draft,
  type DesktopCompanionSyncState,
  type WorkspaceBundleTemplateRecord,
} from '@char-gen/shared';
import {
  getAllTemplateRecords,
  getBlueprintCatalog,
  getBlueprintOverrides,
  getOriginalBlueprintContent,
  getStoredTemplates,
  saveBlueprintOverrides,
  saveStoredTemplates,
  type StoredTemplateRecord,
} from './content-store';
import { exportAllDrafts, getAllDrafts, importDrafts } from './draft-store';
import {
  DEFAULT_DEVICE_CONFIG,
  getStoredMobileDeviceIdentity,
  getStoredDeviceConfig,
  updateStoredDeviceConfig,
} from '../storage/device-config';

export interface WorkspaceBundleImportResult {
  drafts: number;
  remappedDrafts: number;
  templates: number;
  blueprintOverrides: number;
  configImported: boolean;
  apiKeys: number;
}

export interface DesktopCompanionSyncPreview {
  exportedAt: string;
  source?: DesktopCompanionSyncSource;
  domains: {
    drafts: {
      incomingCount: number;
      matchingReviewIds: number;
      identicalReviewIds: number;
      conflictingReviewIds: number;
      newReviewIds: number;
      conflictingDrafts: Array<{
        reviewId: string;
        incomingName: string;
        currentName: string;
      }>;
      newDrafts: Array<{
        reviewId: string;
        incomingName: string;
      }>;
    };
    config: {
      hasConfig: boolean;
      hasApiKeys: boolean;
      incomingModel: string | null;
      currentModel: string | null;
      modelWillChange: boolean;
      importedSettingFields: number;
      importedApiKeys: number;
    };
    templates: {
      incomingCount: number;
      matchingNames: number;
      identicalNames: number;
      conflictingNames: number;
      newNames: number;
      conflictingTemplates: Array<{
        incomingName: string;
        importedName: string;
      }>;
      newTemplateNames: string[];
    };
    blueprints: {
      incomingCount: number;
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
    };
  };
}

async function importDraftsAdditively(
  incomingDrafts: readonly Draft[] | undefined,
): Promise<{ imported: number; remapped: number }> {
  if (!incomingDrafts || incomingDrafts.length === 0) {
    return { imported: 0, remapped: 0 };
  }

  const localDrafts = await getAllDrafts();
  const draftPlan = planAdditiveDraftMerge(localDrafts, incomingDrafts);

  const importedNew =
    draftPlan.newDrafts.length > 0
      ? await importDrafts(buildDraftLibraryExport(draftPlan.newDrafts), { conflictStrategy: 'merge' })
      : { imported: 0, remapped: 0 };
  const importedConflicts =
    draftPlan.conflictingDrafts.length > 0
      ? await importDrafts(buildDraftLibraryExport(draftPlan.conflictingDrafts), { conflictStrategy: 'remap' })
      : { imported: 0, remapped: 0 };

  return {
    imported: importedNew.imported + importedConflicts.imported,
    remapped: importedNew.remapped + importedConflicts.remapped,
  };
}

function mergeTemplateRecordsAdditively(
  existingStored: StoredTemplateRecord[],
  incoming: readonly WorkspaceBundleTemplateRecord[],
) {
  return planAdditiveTemplateMerge(existingStored, getAllTemplateRecords(), incoming);
}

function mergeBlueprintOverridesAdditively(
  existingOverrides: Record<string, string>,
  incoming: Record<string, string> | undefined,
) {
  return planAdditiveBlueprintOverrideMerge(existingOverrides, incoming, {
    knownPaths: getBlueprintCatalog().keys(),
    resolveOriginalContent: getOriginalBlueprintContent,
  });
}

function mergeConfigAdditively(currentConfig: Config, incomingConfig: Omit<Config, 'api_keys'> | undefined) {
  return planAdditiveConfigMerge(currentConfig, incomingConfig, DEFAULT_DEVICE_CONFIG);
}

function mergeApiKeysAdditively(existingKeys: ApiKeys, incomingKeys: ApiKeys | undefined) {
  return planAdditiveApiKeyMerge(existingKeys, incomingKeys);
}

function buildSyncStatePayload(options: { includeApiKeys?: boolean } = {}) {
  const { api_keys: _ignoredApiKeys, ...config } = getStoredDeviceConfig();

  return {
    config: {
      config,
      ...(options.includeApiKeys === false ? {} : { api_keys: getStoredDeviceConfig().api_keys }),
    },
    templates: getStoredTemplates().map(cloneTemplateRecord),
    blueprints: getBlueprintOverrides(),
  };
}

function cloneTemplateRecord(record: StoredTemplateRecord): WorkspaceBundleTemplateRecord {
  return JSON.parse(JSON.stringify(record)) as WorkspaceBundleTemplateRecord;
}

export async function exportWorkspaceBundleText(options: { includeApiKeys?: boolean } = {}): Promise<string> {
  const exportedDrafts = JSON.parse(await exportAllDrafts()) as { drafts?: Draft[] };
  const syncPayload = buildSyncStatePayload(options);

  const bundle = createWorkspaceBundle(
    {
      drafts: Array.isArray(exportedDrafts.drafts) ? exportedDrafts.drafts : [],
      ...(syncPayload.config.config ? { config: syncPayload.config.config } : {}),
      ...(syncPayload.config.api_keys ? { api_keys: syncPayload.config.api_keys } : {}),
      templates: syncPayload.templates,
      blueprint_overrides: syncPayload.blueprints,
    },
    {
      platform: 'mobile',
      runtime: 'expo',
    },
  );

  return JSON.stringify(bundle, null, 2);
}

export async function exportDesktopCompanionSyncStateText(
  options: {
    includeApiKeys?: boolean;
    selection?: Partial<DesktopCompanionSyncSelection>;
  } = {},
): Promise<string> {
  const exportedDrafts = JSON.parse(await exportAllDrafts()) as { drafts?: Draft[] };
  const identity = getStoredMobileDeviceIdentity();
  const filteredPayload = filterDesktopCompanionSyncPayload(
    {
      drafts: Array.isArray(exportedDrafts.drafts) ? exportedDrafts.drafts : [],
      ...buildSyncStatePayload(options),
    },
    options.selection,
    { includeApiKeys: options.includeApiKeys },
  );
  const syncState = createDesktopCompanionSyncState(
    {
      ...filteredPayload,
    },
    {
      deviceId: identity.device_id,
      name: identity.name,
      platform: 'mobile',
      runtime: 'expo',
    },
  );

  return JSON.stringify(syncState, null, 2);
}

async function importDesktopCompanionSyncState(
  syncState: DesktopCompanionSyncState,
): Promise<WorkspaceBundleImportResult> {
  const draftImport = await importDraftsAdditively(syncState.payload.drafts);

  const configPayload = syncState.payload.config;
  const configMerge = mergeConfigAdditively(getStoredDeviceConfig(), configPayload?.config);
  if (configPayload?.config) {
    if (configMerge.importedCount > 0) {
      updateStoredDeviceConfig(configMerge.updates);
    }
  }

  const apiKeyMerge = mergeApiKeysAdditively(getStoredDeviceConfig().api_keys, configPayload?.api_keys);
  if (configPayload?.api_keys) {
    if (apiKeyMerge.importedCount > 0) {
      updateStoredDeviceConfig({ api_keys: apiKeyMerge.importedKeys });
    }
  }

  const templateMerge = mergeTemplateRecordsAdditively(getStoredTemplates(), syncState.payload.templates ?? []);
  if (syncState.payload.templates && syncState.payload.templates.length > 0) {
    saveStoredTemplates(templateMerge.records);
  }

  const blueprintMerge = mergeBlueprintOverridesAdditively(getBlueprintOverrides(), syncState.payload.blueprints);
  if (syncState.payload.blueprints && Object.keys(syncState.payload.blueprints).length > 0) {
    saveBlueprintOverrides(blueprintMerge.overrides);
  }

  return {
    drafts: draftImport.imported,
    remappedDrafts: draftImport.remapped,
    templates: templateMerge.imported,
    blueprintOverrides: blueprintMerge.imported,
    configImported: configMerge.importedCount > 0,
    apiKeys: apiKeyMerge.importedCount,
  };
}

export async function importDesktopCompanionSyncStateText(raw: string): Promise<WorkspaceBundleImportResult> {
  return importDesktopCompanionSyncState(parseDesktopCompanionSyncState(raw));
}

export async function previewDesktopCompanionSyncStateText(raw: string): Promise<DesktopCompanionSyncPreview> {
  const syncState = parseDesktopCompanionSyncState(raw);
  const localDrafts = await getAllDrafts();
  const incomingDrafts = syncState.payload.drafts ?? [];
  const incomingTemplates = syncState.payload.templates ?? [];
  const incomingConfig = syncState.payload.config;
  const currentConfig = getStoredDeviceConfig();
  const currentApiKeys = currentConfig.api_keys;

  const draftPlan = planAdditiveDraftMerge(localDrafts, incomingDrafts);
  const templateMerge = mergeTemplateRecordsAdditively(getStoredTemplates(), incomingTemplates);
  const blueprintMerge = mergeBlueprintOverridesAdditively(getBlueprintOverrides(), syncState.payload.blueprints);
  const configMerge = mergeConfigAdditively(currentConfig, incomingConfig?.config);
  const apiKeyMerge = mergeApiKeysAdditively(currentApiKeys, incomingConfig?.api_keys);

  const conflictingDrafts = draftPlan.conflictingDrafts.map((draft) => {
    const localDraft = draftPlan.localById.get(draft.metadata.review_id);
    return {
      reviewId: draft.metadata.review_id,
      incomingName: draft.metadata.character_name || draft.metadata.seed,
      currentName: localDraft?.metadata.character_name || localDraft?.metadata.seed || draft.metadata.review_id,
    };
  });
  const newDrafts = draftPlan.newDrafts.map((draft) => ({
    reviewId: draft.metadata.review_id,
    incomingName: draft.metadata.character_name || draft.metadata.seed,
  }));
  const incomingModel = incomingConfig?.config?.model ?? null;
  const currentModel = currentConfig.model || null;

  return {
    exportedAt: syncState.exportedAt,
    ...(syncState.source ? { source: syncState.source } : {}),
    domains: {
      drafts: {
        incomingCount: incomingDrafts.length,
        matchingReviewIds: draftPlan.matchingReviewIds,
        identicalReviewIds: draftPlan.identicalReviewIds,
        conflictingReviewIds: draftPlan.conflictingReviewIds,
        newReviewIds: draftPlan.newReviewIds,
        conflictingDrafts,
        newDrafts,
      },
      config: {
        hasConfig: Boolean(incomingConfig?.config),
        hasApiKeys: Boolean(incomingConfig?.api_keys && Object.keys(incomingConfig.api_keys).length > 0),
        incomingModel,
        currentModel,
        modelWillChange: configMerge.modelWillChange,
        importedSettingFields: configMerge.importedCount,
        importedApiKeys: apiKeyMerge.importedCount,
      },
      templates: {
        incomingCount: incomingTemplates.length,
        matchingNames: templateMerge.matchingNames,
        identicalNames: templateMerge.identicalNames,
        conflictingNames: templateMerge.conflictingNames,
        newNames: templateMerge.newNames,
        conflictingTemplates: templateMerge.conflictingTemplates,
        newTemplateNames: templateMerge.newTemplateNames,
      },
      blueprints: {
        incomingCount: Object.keys(syncState.payload.blueprints ?? {}).length,
        matchingPaths: blueprintMerge.matchingPaths,
        identicalPaths: blueprintMerge.identicalPaths,
        conflictingPaths: blueprintMerge.conflictingPaths,
        overridingPaths: blueprintMerge.overridingPaths,
        newPaths: blueprintMerge.newPaths,
        conflictingBlueprints: blueprintMerge.conflictingBlueprints,
        overridingBlueprintPaths: blueprintMerge.overridingBlueprintPaths,
        newBlueprintPaths: blueprintMerge.newBlueprintPaths,
      },
    },
  };
}

export async function importWorkspaceBundleText(raw: string): Promise<WorkspaceBundleImportResult> {
  const bundle = parseWorkspaceBundle(raw);

  const draftImport = await importDraftsAdditively(bundle.payload.drafts);

  const configMerge = mergeConfigAdditively(getStoredDeviceConfig(), bundle.payload.config);
  if (bundle.payload.config) {
    if (configMerge.importedCount > 0) {
      updateStoredDeviceConfig(configMerge.updates);
    }
  }

  const apiKeyMerge = mergeApiKeysAdditively(getStoredDeviceConfig().api_keys, bundle.payload.api_keys);
  if (bundle.payload.api_keys) {
    if (apiKeyMerge.importedCount > 0) {
      updateStoredDeviceConfig({ api_keys: apiKeyMerge.importedKeys });
    }
  }

  const templateMerge = mergeTemplateRecordsAdditively(getStoredTemplates(), bundle.payload.templates ?? []);
  if (bundle.payload.templates && bundle.payload.templates.length > 0) {
    saveStoredTemplates(templateMerge.records);
  }

  const blueprintMerge = mergeBlueprintOverridesAdditively(getBlueprintOverrides(), bundle.payload.blueprint_overrides);
  if (bundle.payload.blueprint_overrides && Object.keys(bundle.payload.blueprint_overrides).length > 0) {
    saveBlueprintOverrides(blueprintMerge.overrides);
  }

  return {
    drafts: draftImport.imported,
    remappedDrafts: draftImport.remapped,
    templates: templateMerge.imported,
    blueprintOverrides: blueprintMerge.imported,
    configImported: configMerge.importedCount > 0,
    apiKeys: apiKeyMerge.importedCount,
  };
}

export function getSelectedSyncDomains(selection?: Partial<DesktopCompanionSyncSelection> | null) {
  return getSelectedDesktopCompanionSyncDomains(selection);
}
