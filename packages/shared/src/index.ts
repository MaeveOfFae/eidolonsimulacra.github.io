// ============================================================================
// Core Types
// ============================================================================

export type { ComfyRenderRecord } from './comfyui/history';

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
export * from './llm/transport';
export * from './llm/base';
export * from './llm/google';
export * from './llm/anthropic';
export { OpenAICompatEngine, OpenAICompatConfig } from './llm/openai-compat';

// ============================================================================
// Usage Records
// ============================================================================

export * from './usage/records';
export * from './usage/pricing';

// ============================================================================
// Multi-Model Comparison
// ============================================================================

export * from './comparison';
export * from './legacy-keys';

// ============================================================================
// Draft Library
// ============================================================================

export * from './draft-library';

// ============================================================================
// Generation Launcher
// ============================================================================

export * from './generation-launcher';

// ============================================================================
// Seed Studio
// ============================================================================

export * from './seed-studio';

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
  buildAssetApprovalSummary,
  decideAssetApproval,
  fingerprintAssetContent,
  type AssetApprovalEntry,
  type AssetApprovalEntryStatus,
  type AssetApprovalSummary,
  type DraftAssetApprovalDecision,
} from './draft-approvals';

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
// A1111 Tag Linting (Danbooru-backed)
// ============================================================================

export {
  A1111_LINE_ROLES,
  A1111_EXPECTED_LINE_COUNT,
  applyA1111TagFixes,
  lintA1111Tags,
  splitTagTokens,
  stripTagWeightSyntax,
  type A1111LineRole,
  type A1111LintIssue,
  type A1111LintIssueCode,
  type A1111LintOptions,
  type A1111LintSeverity,
  type A1111TagFixResult,
} from './a1111/tag-linter';

export {
  A1111_QUALITY_TOKEN_ALLOWLIST,
  PSEUDO_TAG_CORRECTIONS,
  isA1111QualityToken,
  lookupPseudoTagCorrection,
} from './a1111/pseudo-tags';

// ============================================================================
// ComfyUI Handoff
// ============================================================================

export {
  COMFY_PRESET_LABELS,
  type ComfyHistoryEntry,
  type ComfyHistoryImage,
  type ComfyHistoryOutputEntry,
  type ComfyHistoryStatus,
  type ComfyNode,
  type ComfyNodeMeta,
  type ComfyQueuePromptResponse,
  type ComfyUploadedImage,
  type ComfyWorkflowGraph,
  type ComfyWorkflowPresetId,
} from './comfyui/types';

export {
  BUILTIN_COMFY_WORKFLOW_DEFAULT,
  BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER,
  DEFAULT_COMFY_NEGATIVE_PROMPT,
  getBuiltinComfyWorkflow,
} from './comfyui/workflows';

export {
  describeComfyBindingIssues,
  resolveComfyWorkflowBindings,
  type ComfyWorkflowBindings,
} from './comfyui/binding';

export {
  buildComfyPositivePrompt,
  buildComfyPromptPayload,
  type ComfyPromptBuildRequest,
  type ComfyPromptBuildResult,
} from './comfyui/payload';

export {
  comfyGetHistory,
  comfyListCheckpoints,
  comfyQueuePrompt,
  comfySystemStats,
  comfyUploadImage,
  comfyViewUrl,
  comfyWaitForImages,
  comfyWebSocketUrl,
  defaultComfyWebSocketFactory,
  describeComfyValidationError,
  normalizeComfyBaseUrl,
  type ComfyClientOptions,
  type ComfyFetch,
  type ComfyProgressEvent,
  type ComfySystemStats,
  type ComfyWaitOptions,
  type ComfyWebSocketFactory,
  type ComfyWebSocketLike,
} from './comfyui/client';

export { parseComfyWorkflowJson } from './comfyui/workflow-json';

export { MAX_COMFY_RENDER_HISTORY, appendComfyRenderRecord, normalizeComfyRenderHistory } from './comfyui/history';

export { DEFAULT_COMFY_BASE_URL, createDefaultComfyUIConfig, resolveComfyWorkflow } from './comfyui/defaults';

// ============================================================================
// Chub Publishing
// ============================================================================

export {
  ChubApiError,
  chubCreateCharacter,
  chubGetCharacter,
  chubMintProjectsToken,
  chubResolvePublished,
  chubSearchCharacters,
  chubUpdateCharacter,
  chubVerifyIdentity,
  extractPublishedRef,
  normalizeChubBaseUrl,
  parseChubErrorDetail,
} from './chub/client';

export {
  buildChubCharacterCreate,
  buildChubCharacterUpdate,
  chubAvatarValue,
  chubGreetingStart,
  defaultChubPublishForm,
  normalizeChubTags,
  type ChubDraftSource,
  type ChubPublishForm,
  type ChubPublishRating,
  type ChubPublishVisibility,
} from './chub/payload';

export { chubPreflightHasErrors, runChubPreflight, type ChubPreflightIssue } from './chub/validate';

export {
  chubCharacterUrl,
  normalizeChubPublishRecord,
  recordChubPublish,
  type ChubPublishRecord,
} from './chub/publish-record';

export { DEFAULT_CHUB_BASE_URL, chubActiveToken, createDefaultChubConfig } from './chub/defaults';

export type {
  ChubApiResult,
  ChubCharacterCreate,
  ChubCharacterUpdate,
  ChubClientOptions,
  ChubFetch,
  ChubIdentity,
  ChubPublishedRef,
  ChubSearchNode,
} from './chub/types';

export {
  buildDanbooruTagIndex,
  findSimilarTagNames,
  normalizeBooruTag,
  parseDanbooruAliasesCsv,
  parseDanbooruTagsCsv,
  resolveBooruTag,
  type BooruTagResolution,
  type BooruTagStatus,
  type DanbooruTagEntry,
  type DanbooruTagIndex,
  type SimilarTagOptions,
} from './a1111/tag-index';

// The bundled core index loader lives behind the `@char-gen/shared/danbooru-core`
// subpath on purpose: it statically imports the ~280 KiB generated CSV, and tsup
// bundles with `splitting: false`, so exporting it here would drag that CSV into
// `dist/index.js` — the web app's eagerly-loaded shared chunk. Web dynamic-imports the
// subpath (a lazy chunk); mobile bundles it directly since it has no static assets.

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
