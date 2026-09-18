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

export {
  applyPreset,
  formatExport,
  validatePreset,
} from './export/presets';

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
