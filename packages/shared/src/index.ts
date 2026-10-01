// ============================================================================
// Core Types
// ============================================================================

export * from './types';

// ============================================================================
// API
// ============================================================================

export { api, APIError, EidolonAPI, GenerationStream } from './services';
export type { DownloadResponse, GenerationEvent, GenerationEventType } from './services';

// ============================================================================
// LLM Engine (Direct client-side calls)
// ============================================================================

export * from './llm/types';
export * from './llm/factory';
export * from './llm/models';
export * from './llm/base';
export * from './llm/google';
export * from './llm/anthropic';
export { OpenAICompatEngine, OpenAICompatConfig } from './llm/openai-compat';

// ============================================================================
// Usage Records
// ============================================================================

export * from './usage/records';

// ============================================================================
// Multi-Model Comparison
// ============================================================================

export * from './comparison';

// ============================================================================
// Draft Library
// ============================================================================

export * from './draft-library';

// ============================================================================
// Parsing
// ============================================================================

export {
  buildAssetContextBlock,
  buildAssetContextLines,
  selectRelevantPriorAssets,
  stripReasoningArtifacts,
  unwrapSingleCodeFence,
} from './prompt-utils';

export {
  buildOptimizeTextMessages,
  estimateTextStats,
  estimateTokenCount,
  type TextOptimizationStats,
} from './text-optimization';

export {
  applyDraftFilters,
  buildDraftListResponse,
  buildLineageResponse,
  buildSimilarityResult,
  isArchivedDraft,
  validateDraftAssets,
  type ValidateDraftAssetsOptions,
} from './draft-runtime';

export {
  MAX_LOREBOOK_PACKETS,
  buildLorebookPacketRecord,
  createLorebookPacketId,
  deriveLorebookPacketTitle,
  extractLorebookPacketSourceDrafts,
  getLorebookPacketFilename,
  mergeLorebookPacket,
  normalizeLorebookPacketDraftIds,
  normalizeLorebookPacketRecord,
  normalizeLorebookPackets,
  parseLorebookPacket,
  removeLorebookPacket,
  sortLorebookPackets,
  type LorebookPacketEntryType,
  type LorebookPacketSaveInput,
  type ParsedLorebookPacket,
  type ParsedLorebookPacketEntry,
  type SavedLorebookPacketRecord,
} from './lorebook-packets';

export {
  DEFAULT_REFERENCE_ASSET_CHAR_LIMITS,
  DEFAULT_REFERENCE_ASSET_LINE_LIMITS,
  DEFAULT_REFERENCE_ASSET_ORDER,
  buildCompactReferenceAssets,
  buildLorebookUserPrompt,
  buildReferenceSummary,
  buildReferenceSuiteSection,
  getReferenceAssetCharLimit,
  getReferenceAssetLineLimit,
  normalizeConnectedReferenceIds,
  truncateReferenceAssetContent,
  type ReferenceAssetLimits,
  type ReferenceSuiteContext,
} from './lorebook-prompt';

export {
  flattenBlueprintList,
  getBlueprintsForFeature,
  resolveBlueprintForFeature,
  toBlueprintOptions,
} from './blueprint-features';

export { releaseNotes, type ReleaseNoteEntry, type ReleaseNoteLink } from './whats-new';

export { builtinTheme, builtinThemes } from './themes/builtin-themes';

export * from './help';
export * from './info';

export {
  buildDraftExportArtifact,
  buildDraftLibraryExport,
  coerceDraft,
  coerceDraftMetadata,
  createImportedReviewId,
  escapeAssetContentForMarkdownBundle,
  getUniqueImportedReviewId,
  parseDraftImportText,
  type DraftExportArtifact,
  type DraftImportParseResult,
} from './draft-files';

export {
  buildDraftLibraryBadges,
  buildExportReadinessSummary,
  type DraftLibraryBadge,
  type ExportReadinessSummary,
  type ExportReadinessWarningAsset,
} from './draft-readiness';

export {
  MAX_DRAFT_REVISION_SNAPSHOTS,
  appendDraftRevisionSnapshot,
  buildDraftRevisionSnapshot,
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotAssetDiffPreview,
  buildDraftSnapshotAssetDiffPreviews,
  buildDraftSnapshotAssetDiffPreviewsFromStates,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffModelsFromSnapshots,
  buildDraftSnapshotDiffSummary,
  buildDraftSnapshotDiffSummaryFromStates,
  getLatestDraftSnapshotSummary,
  type DraftSnapshotAssetDiffLine,
  type DraftSnapshotAssetDiffPreview,
  type DraftSnapshotDiffModel,
  type DraftSnapshotDiffSummary,
  type LatestDraftSnapshotSummary,
} from './draft-revisions';

export {
  WORKSPACE_BUNDLE_APP_ID,
  WORKSPACE_BUNDLE_VERSION,
  createWorkspaceBundle,
  parseWorkspaceBundle,
  type WorkspaceBundle,
  type WorkspaceBundlePayload,
  type WorkspaceBundleSource,
  type WorkspaceBundleTemplateRecord,
} from './workspace-bundle';

export {
  DESKTOP_COMPANION_PAIRING_SCHEME,
  buildDesktopCompanionPairingLink,
  buildDesktopCompanionPairingPayload,
  parseDesktopCompanionPairingLink,
  type DesktopCompanionPairingRecord,
} from './companion-pairing';

export {
  DEFAULT_DESKTOP_COMPANION_SYNC_SELECTION,
  DESKTOP_COMPANION_SYNC_VERSION,
  createDesktopCompanionSyncState,
  filterDesktopCompanionSyncPayload,
  getSelectedDesktopCompanionSyncDomains,
  hasSelectedDesktopCompanionSyncDomains,
  normalizeDesktopCompanionSyncSelection,
  parseDesktopCompanionSyncState,
  type DesktopCompanionSyncSelection,
  type DesktopCompanionConfigSyncPayload,
  type DesktopCompanionSyncDomain,
  type DesktopCompanionSyncManifest,
  type DesktopCompanionSyncManifestEntry,
  type DesktopCompanionSyncPayload,
  type DesktopCompanionSyncSource,
  type DesktopCompanionSyncState,
} from './companion-sync';

export {
  areDraftsEquivalent,
  areTemplateRecordsEquivalent,
  getUniqueBlueprintCopyPath,
  getUniqueTemplateCopyName,
  planAdditiveApiKeyMerge,
  planAdditiveBlueprintOverrideMerge,
  planAdditiveConfigMerge,
  planAdditiveDraftMerge,
  planAdditiveTemplateMerge,
  type AdditiveApiKeyMergePlan,
  type AdditiveBlueprintMergeOptions,
  type AdditiveBlueprintMergePlan,
  type AdditiveConfigDefaultState,
  type AdditiveConfigMergePlan,
  type AdditiveDraftMergePlan,
  type AdditiveTemplateMergePlan,
} from './companion-sync-merge';

export {
  buildBlueprintList,
  buildMissingTemplateBlueprintWarnings,
  buildStoredTemplateRecord,
  buildTemplateBlueprintContentsResponse,
  cloneStoredTemplateRecord,
  findStoredTemplateRecord,
  getTemplateBlueprintKey,
  getLegacyTemplateBlueprintContent,
  hydrateStoredTemplateRecord,
  inferBlueprintCategoryFromPath,
  normalizeBlueprintPath,
  normalizePathSegments,
  normalizeStoredTemplateRecord,
  parseTemplateManifest,
  parseTomlString,
  parseTomlStringArray,
  resolveTemplateDefinitionFromRecords,
  resolveTemplateRecordBlueprintContent,
  resolveBlueprintPath,
  type BuildStoredTemplateRecordOptions,
  type BlueprintContentResolver,
  type BlueprintCategory,
  type StoredTemplateRecordLike,
} from './content-runtime';

export {
  ASSET_ORDER,
  DEFAULT_ASSET_FILENAMES,
  AssetName,
  ParseResult,
  ParseError,
  extractCodeblocks,
  parseBlueprintOutput,
  extractSingleAsset,
  extractCharacterName,
  extractCharacterDisplayName,
  sanitizeCharacterName,
  inferCharacterDisplayNameFromAssets,
  inferCharacterNameFromAssets,
  validateAssetContent,
  validateAssetsContent,
} from './parse/parse-blocks';

// ============================================================================
// Export Presets
// ============================================================================

export { applyPreset, formatExport, validatePreset } from './export/presets';

export { buildTextPdfDocument, type PdfSection, type TextPdfOptions } from './export/pdf';

// ============================================================================
// Character Import
// ============================================================================

export {
  detectAndParseCharacter,
  detectJsonFormat,
  parseTavernAICard,
  parseChubAICard,
  parseGenericCharacter,
  parsePlainTextContent,
  buildReverseMapping,
  formatSourceLabel,
  isPngFilename,
} from './import/character-parser';

export {
  buildPngCardBytes,
  extractPngCharaChunk,
  hasPngSignature,
  parseEmbeddedPngBytes,
  pngBytesToDataUrl,
} from './png-card';

// ============================================================================
// Templates
// ============================================================================

export {
  OFFICIAL_TEMPLATE,
  DEFAULT_ASSET_ORDER as TemplateAssetOrder,
  AssetDefinition,
  Template as TemplateType,
  CREATOR_NOTES_ASSET_NAME,
  LEGACY_CREATOR_NOTES_ASSET_NAME,
  canonicalizeLegacyAssetName,
  normalizeAssetName,
  normalizeAssetNameList,
  normalizeAssetRecord,
  topologicalSort,
  getOrderedAssets,
  validateTemplate,
} from './templates';

// ============================================================================
// Blueprint Orchestrator
// ============================================================================

export {
  buildOrchestrator,
  getDefaultAssetOrder as GetDefaultAssetOrder,
  getOfficialTemplate,
} from './blueprint/orchestrator';
