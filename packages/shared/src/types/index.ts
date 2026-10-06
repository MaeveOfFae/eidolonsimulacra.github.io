/**
 * Core data types for Eidolon Simulacra.
 * Mirrors Python dataclasses from bpui.
 */

import type { ComfyRenderRecord } from '../comfyui/history';
import type { ChubPublishRecord } from '../chub/publish-record';

// ============================================================================
// Configuration Types
// ============================================================================

export type EngineType =
  | 'openai'
  | 'google'
  | 'openrouter'
  | 'anthropic'
  | 'deepseek'
  | 'zai'
  | 'moonshot'
  | 'ollama'
  | 'openai_compatible'
  | 'auto';
export type EngineMode = 'auto' | 'explicit';
export type ContentMode = 'SFW' | 'NSFW' | 'Platform-Safe' | 'Auto';

// Feature categories for blueprints
export type FeatureCategory =
  | 'orchestration'
  | 'seed_generation'
  | 'offspring_generation'
  | 'worldbook_generation'
  | 'intro_scene_generation'
  | 'validation'
  | 'similarity';

export interface FeatureBlueprintDefaults {
  orchestration?: string;
  seed_generation?: string;
  offspring_generation?: string;
  worldbook_generation?: string;
  intro_scene_generation?: string;
  validation?: string;
  similarity?: string;
}

export interface ApiKeys {
  openai?: string;
  google?: string;
  openrouter?: string;
  anthropic?: string;
  deepseek?: string;
  zai?: string;
  moonshot?: string;
  [key: string]: string | undefined;
}

export interface BatchConfig {
  max_concurrent: number;
  rate_limit_delay: number;
}

export interface ThemeAppColors {
  background?: string;
  text?: string;
  accent?: string;
  button?: string;
  button_text?: string;
  border?: string;
  highlight?: string;
  window?: string;
  muted_text?: string;
  surface?: string;
  success_bg?: string;
  danger_bg?: string;
  accent_bg?: string;
  accent_title?: string;
  success_text?: string;
  error_text?: string;
  warning_text?: string;
}

export interface ThemeTokenizerColors {
  brackets?: string;
  asterisk?: string;
  parentheses?: string;
  double_brackets?: string;
  curly_braces?: string;
  pipes?: string;
  at_sign?: string;
}

export interface ThemeOverride {
  app?: ThemeAppColors;
  tokenizer?: ThemeTokenizerColors;
}

export interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  button: string;
  button_text: string;
  border: string;
  highlight: string;
  window: string;
  tok_brackets: string;
  tok_asterisk: string;
  tok_parentheses: string;
  tok_double_brackets: string;
  tok_curly_braces: string;
  tok_pipes: string;
  tok_at_sign: string;
  muted_text: string;
  surface: string;
  success_bg: string;
  danger_bg: string;
  accent_bg: string;
  accent_title: string;
  success_text: string;
  error_text: string;
  warning_text: string;
}

export interface ThemePreset {
  name: string;
  display_name: string;
  description: string;
  author: string;
  tags: string[];
  based_on: string;
  is_builtin: boolean;
  colors: ThemeColors;
}

export interface ThemePresetCreate {
  name: string;
  display_name: string;
  description?: string;
  author?: string;
  tags?: string[];
  based_on?: string;
  colors: ThemeColors;
}

export interface ThemePresetUpdate {
  display_name?: string;
  description?: string;
  author?: string;
  tags?: string[];
  based_on?: string;
  colors?: ThemeColors;
}

export interface ThemeDuplicateRequest {
  new_name: string;
  display_name?: string;
  description?: string;
  author?: string;
  tags?: string[];
  based_on?: string;
}

export interface ThemeRenameRequest {
  new_name: string;
  display_name?: string;
}

export type ThemeImportStrategy = 'reject' | 'rename' | 'overwrite';

export interface ThemeImportRequest {
  conflict_strategy?: ThemeImportStrategy;
  target_name?: string;
}

export interface HelpState {
  first_run_completed: boolean;
  show_inline_tips: boolean;
  completed_guides: string[];
  dismissed_tips: string[];
  completed_tours: string[];
}

export interface Config {
  engine: EngineType;
  engine_mode: EngineMode;
  model: string;
  temperature: number;
  max_tokens: number;
  api_keys: ApiKeys;
  batch: BatchConfig;
  base_url?: string;
  api_proxy_key?: string;
  api_base_url?: string;
  theme_name?: string;
  theme?: ThemeOverride;
  help?: HelpState;
  feature_blueprints?: FeatureBlueprintDefaults;
  comfyui?: ComfyUIConfig;
  chub?: ChubConfig;
}

// ============================================================================
// ComfyUI Handoff
// ============================================================================

export type ComfyWorkflowSelection = 'default' | 'dual-encoder-ipadapter' | 'custom';

export interface ComfyUIConfig {
  /** ComfyUI server base URL, e.g. `http://127.0.0.1:8188`. */
  base_url: string;
  /** Which workflow graph to render with: built-in presets or the imported `workflow_json`. */
  workflow_preset: ComfyWorkflowSelection;
  /** Custom API-format workflow graph ("Save (API Format)"), used when preset is `custom`. */
  workflow_json: string;
  /** Default negative prompt injected into the workflow's negative nodes. */
  negative_prompt: string;
  /** Base checkpoint filename; must exist in the ComfyUI install's models/checkpoints. */
  checkpoint: string;
  /** Refiner checkpoint for the dual-encoder preset. */
  refiner_checkpoint: string;
  /** IPAdapter reference strength (0–1) for the dual-encoder preset. */
  ipadapter_strength: number;
  steps: number;
  cfg: number;
  width: number;
  height: number;
  /** Use the draft's attached card image as the IPAdapter reference. */
  use_card_image_as_reference: boolean;
}

// ============================================================================
// Chub Publishing
// ============================================================================

export interface ChubConfig {
  /** Gateway base URL, e.g. `https://gateway.chub.ai`. */
  base_url: string;
  /** Session/API token pasted by the user (sent as `Authorization: Bearer` + `ch-api-key`). */
  api_token: string;
  /**
   * Scoped token minted via `POST /account/tokens/projects` after verification;
   * preferred for publish calls. Falls back to `api_token` when empty.
   */
  publish_token: string;
  /** Username from the last successful verification (display + resolve scoping). */
  username: string;
  /** Subscription tier from `GET /oauth/userinfo` (None/Basic/Full/Max). */
  subscription: string;
  /** ISO timestamp of the last successful verification. */
  verified_at: string;
}

// ============================================================================
// Draft Types
// ============================================================================

export interface CharacterCardRelatedLorebook {
  id?: number;
  book?: string | null;
  path?: string;
  version?: string;
  commit_ref?: string;
}

export interface CharacterCardDepthPrompt {
  depth: number;
  prompt: string;
}

export interface CharacterCardChubMetadata {
  id?: number;
  preset?: string | null;
  full_path?: string;
  custom_css?: string | null;
  extensions?: unknown[];
  expressions?: unknown;
  alt_expressions?: Record<string, unknown>;
  background_image?: string;
  related_lorebooks?: CharacterCardRelatedLorebook[];
}

export interface CharacterCardMetadata {
  avatar?: string;
  creator?: string;
  character_version?: string;
  depth_prompt?: CharacterCardDepthPrompt;
  chub?: CharacterCardChubMetadata;
}

export type DraftAssetReviewScore = 1 | 2 | 3 | 4 | 5;

export type DraftAssetApprovalStatus = 'approved' | 'changes_requested';

export interface DraftAssetApproval {
  status: DraftAssetApprovalStatus;
  decided_at: string;
  note?: string;
  /**
   * Fingerprint of the asset content at decision time. When it no longer
   * matches the saved content, the decision is reported as stale instead of
   * approved or changes requested.
   */
  content_fingerprint: string;
}

export interface DraftReviewAnnotations {
  notes?: string;
  asset_scores?: Record<string, DraftAssetReviewScore>;
  asset_notes?: Record<string, string>;
  asset_approvals?: Record<string, DraftAssetApproval>;
  updated_at?: string;
}

export interface DraftMergeProvenance {
  strategy: 'single-asset' | 'staged-merge';
  source_draft_id: string;
  source_side: 'left' | 'right';
  source_snapshot_id?: string;
  base_draft_id: string;
  base_side: 'left' | 'right';
  base_snapshot_id?: string;
  asset_names: string[];
  created_at: string;
}

export interface DraftMergeResolutionDetail {
  asset_name: string;
  reason: 'content-drift' | 'review-drift' | 'left-only' | 'right-only';
  target_previously_had_asset: boolean;
  review_context_applied: boolean;
}

export interface DraftMergeHistoryEvent extends DraftMergeProvenance {
  id: string;
  undo_snapshot_id?: string;
  asset_resolutions?: DraftMergeResolutionDetail[];
}

export interface DraftRevisionSnapshotState {
  seed: string;
  mode?: ContentMode;
  model?: string;
  tags?: string[];
  genre?: string;
  notes?: string;
  favorite: boolean;
  character_name?: string;
  template_name?: string;
  parent_drafts?: string[];
  connected_drafts?: string[];
  offspring_type?: string;
  custom_instructions?: string;
  component_send_order?: string[];
  card_metadata?: CharacterCardMetadata;
  review_annotations?: DraftReviewAnnotations;
  merge_provenance?: DraftMergeProvenance;
  merge_history?: DraftMergeHistoryEvent[];
  comparison_group?: string;
  assets: Record<string, string>;
}

export interface DraftRevisionSnapshot {
  id: string;
  label?: string;
  reason?: string;
  created_at: string;
  state: DraftRevisionSnapshotState;
}

export interface DraftMetadata {
  review_id: string;
  seed: string;
  mode?: ContentMode;
  model?: string;
  created?: string;
  modified?: string;
  archived_at?: string;
  tags?: string[];
  genre?: string;
  notes?: string;
  favorite: boolean;
  character_name?: string;
  template_name?: string;
  parent_drafts?: string[];
  connected_drafts?: string[];
  offspring_type?: string;
  custom_instructions?: string;
  component_send_order?: string[];
  card_metadata?: CharacterCardMetadata;
  review_annotations?: DraftReviewAnnotations;
  merge_provenance?: DraftMergeProvenance;
  merge_history?: DraftMergeHistoryEvent[];
  revision_snapshots?: DraftRevisionSnapshot[];
  /** Shared id linking drafts produced by one multi-model comparison run. */
  comparison_group?: string;
  /** Render history from the ComfyUI handoff, newest first (see `comfyui/history.ts`). */
  comfy_renders?: ComfyRenderRecord[];
  /** Chub publication record for this draft (see `chub/publish-record.ts`). */
  chub_publish?: ChubPublishRecord;
}

export interface Draft {
  metadata: DraftMetadata;
  assets: Record<string, string>;
  path: string;
}

export interface DraftListResponse {
  drafts: DraftMetadata[];
  total: number;
  stats: {
    total_drafts: number;
    archived_drafts: number;
    favorites: number;
    by_genre: Record<string, number>;
    by_mode: Record<string, number>;
  };
}

export interface DraftFilters {
  search?: string;
  tags?: string[];
  genre?: string;
  mode?: ContentMode;
  favorite?: boolean;
  archived?: boolean;
  include_archived?: boolean;
  sort_by?: 'created' | 'modified' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================================================
// Worlds / Lorebook Persistence Types
// ============================================================================

export interface WorldCounts {
  characters: number;
  timelines: number;
  factions: number;
  locations: number;
}

export interface WorldFactionRecord {
  id: string;
  worldId: string;
  name: string;
  description?: string;
  role?: string;
  notes?: string;
  tags: string[];
  draftIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorldLocationRecord {
  id: string;
  worldId: string;
  name: string;
  description?: string;
  category?: string;
  notes?: string;
  tags: string[];
  draftIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorldRelationshipRecord {
  id: string;
  worldId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  label: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldCharacterRecord {
  id: string;
  worldId: string;
  draftId?: string;
  characterName: string;
  role?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldCharacterDraftLinkRecord {
  worldId: string;
  worldName: string;
  characterId: string;
  draftId: string;
  characterName: string;
  role?: string;
  updatedAt: string;
}

export interface TimelineEventRecord {
  id: string;
  timelineId: string;
  title: string;
  description?: string;
  eventDate?: string;
  sortOrder: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineRecord {
  id: string;
  worldId: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  world?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
  };
  events?: TimelineEventRecord[];
}

export interface WorldRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  genre?: string;
  setting?: string;
  notes?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: WorldCounts;
  characters?: WorldCharacterRecord[];
  factions?: WorldFactionRecord[];
  locations?: WorldLocationRecord[];
  relationships?: WorldRelationshipRecord[];
  timelines?: TimelineRecord[];
}

// ============================================================================
// Character Profile Types
// ============================================================================

export interface CharacterProfile {
  name: string;
  age?: number;
  gender: string;
  species: string;
  occupation: string;
  personality_traits: string[];
  core_values: string[];
  goals: string[];
  fears: string[];
  background_keywords: string[];
  role: string;
  power_level: string;
  mode: ContentMode;
}

// ============================================================================
// Template Types
// ============================================================================

export interface AssetDefinition {
  name: string;
  required: boolean;
  depends_on: string[];
  description: string;
  blueprint_file?: string;
  import_aliases?: string[];
}

export interface Template {
  name: string;
  version: string;
  description: string;
  assets: AssetDefinition[];
  is_official?: boolean;
  is_default?: boolean;
  path?: string;
}

export interface CreateTemplateRequest {
  name: string;
  version: string;
  description: string;
  assets: AssetDefinition[];
  blueprint_contents: Record<string, string>;
}

export interface DuplicateTemplateRequest {
  name: string;
  version?: string;
}

export interface TemplateValidationResult {
  errors: string[];
  warnings: string[];
}

export type UpdateTemplateRequest = CreateTemplateRequest;

export interface TemplateBlueprintContentsResponse {
  blueprint_contents: Record<string, string>;
}

export interface SeedGenerationRequest {
  genre_lines: string;
  surprise_mode?: boolean;
  blueprint_content?: string;
  blueprint_path?: string;
}

export interface SeedGenerationResponse {
  seeds: string[];
}

export interface LorebookGenerationRequest {
  draft_ids: string[];
  focus?: string;
  blueprint_content?: string;
  blueprint_path?: string;
}

export interface LorebookGenerationResponse {
  content: string;
}

export interface ValidatePathRequest {
  path: string;
}

export interface ValidationResponse {
  path: string;
  output: string;
  errors: string;
  exit_code: number;
  success: boolean;
}

// ============================================================================
// Generation Types
// ============================================================================

export const MAX_CONNECTED_DRAFT_REFERENCES = 10;

export interface GenerateRequest {
  seed: string;
  template?: string;
  mode: ContentMode;
  stream?: boolean;
  selected_assets?: string[];
  connected_draft_ids?: string[];
}

export interface GenerateBatchRequest {
  seeds: string[];
  template?: string;
  mode: ContentMode;
  parallel?: boolean;
  max_concurrent?: number;
  selected_assets?: string[];
  connected_draft_ids?: string[];
}

export interface GenerateAssetRequest {
  seed: string;
  template?: string;
  mode: ContentMode;
  asset_name: string;
  prior_assets: Record<string, string>;
  additional_instructions?: string[];
}

export interface GenerateAssetResponse {
  asset_name: string;
  content: string;
  character_name?: string;
}

export interface FinalizeGenerationRequest {
  seed: string;
  template?: string;
  mode: ContentMode;
  assets: Record<string, string>;
}

export interface GenerationProgress {
  stage: 'initializing' | 'asset_generation' | 'saving' | 'complete' | 'error';
  status: 'started' | 'in_progress' | 'complete' | 'error';
  asset?: string;
  content?: string;
  progress?: number;
  error?: string;
}

export interface GenerationComplete {
  draft_path: string;
  draft_id?: string;
  character_name?: string;
  duration_ms: number;
}

export interface LineageNode {
  id: string;
  review_id: string;
  draft_name: string;
  character_name: string;
  generation: number;
  is_root: boolean;
  is_leaf: boolean;
  offspring_type?: string;
  mode?: string;
  model?: string;
  created?: string;
  parent_ids: string[];
  child_ids: string[];
  parent_names: string[];
  child_names: string[];
  sibling_names: string[];
  num_ancestors: number;
  num_descendants: number;
}

export interface LineageStats {
  total_characters: number;
  root_characters: number;
  leaf_characters: number;
  generations: number;
}

export interface LineageResponse {
  nodes: LineageNode[];
  roots: string[];
  max_generation: number;
  stats: LineageStats;
}

// ============================================================================
// Similarity Types
// ============================================================================

export interface LLMAnalysis {
  relationship_potential: string;
  conflict_areas: string[];
  synergy_areas: string[];
  story_hooks: string[];
}

export interface MetaAnalysis {
  archetype_match: number;
  narrative_compatibility: number;
  audience_appeal: number;
}

export interface SimilarityResult {
  character1_name: string;
  character2_name: string;
  overall_score: number;
  compatibility: 'low' | 'medium' | 'high';
  conflict_potential: number;
  synergy_potential: number;
  commonalities: string[];
  differences: string[];
  relationship_suggestions: string[];
  llm_analysis?: LLMAnalysis;
  meta_analysis?: MetaAnalysis;
}

export interface SimilarityRequest {
  draft1_id: string;
  draft2_id: string;
  include_llm_analysis?: boolean;
}

// ============================================================================
// Offspring Types
// ============================================================================

export interface OffspringRequest {
  parent1_id: string;
  parent2_id: string;
  seed?: string;
  mode: ContentMode;
  template?: string;
  blueprint_override?: string;
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'text' | 'json' | 'combined' | 'png' | 'pdf';

export interface FieldMapping {
  asset: string;
  target: string;
  wrapper?: string;
  optional: boolean;
}

export interface ExportPreset {
  name: string;
  format: ExportFormat;
  description: string;
  fields: FieldMapping[];
  metadata: Record<string, unknown>;
  output_pattern: string;
}

export interface ExportPresetSummary {
  name: string;
  path: string;
  format?: ExportFormat;
  description?: string;
}

export interface ExportRequest {
  draft_id: string;
  preset: string;
  include_metadata?: boolean;
}

// ============================================================================
// Connection Test Types
// ============================================================================

export interface ConnectionTestRequest {
  provider: string;
  model?: string;
  base_url?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  latency_ms?: number;
  error?: string;
  model_info?: {
    name: string;
    context_length?: number;
  };
}

// ============================================================================
// Model Types
// ============================================================================

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context_length?: number;
  supports_vision?: boolean;
  supports_tools?: boolean;
}

export interface ModelsResponse {
  provider: string;
  models: ModelInfo[];
  cached?: boolean;
  error?: string;
}

// ============================================================================
// Character Import Types
// ============================================================================

export type ImportedCharacterFormat = 'tavernai_v1' | 'tavernai_v2' | 'chubai' | 'png_card' | 'plain_text' | 'unknown';

export interface ImportedCharacter {
  name: string;
  assets: Record<string, string>;
  sourceFormat: ImportedCharacterFormat;
  sourcePreset?: string;
  unmappedFields?: Record<string, string>;
  metadata?: Partial<DraftMetadata>;
}

export interface CharacterImportOptions {
  template?: Pick<Template, 'name' | 'assets'>;
}

// ============================================================================
// Chat/Refinement Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  draft_id?: string;
  messages: ChatMessage[];
  context_asset?: string;
  screen_context?: Record<string, unknown>;
}

export interface RefineRequest {
  draft_id: string;
  asset: string;
  message: string;
}

export interface OptimizeTextRequest {
  text: string;
  target_reduction?: number;
  preserve_format?: boolean;
}

// ============================================================================
// Blueprint Types
// ============================================================================

export interface Blueprint {
  name: string;
  description: string;
  invokable: boolean;
  version: string;
  content: string;
  path: string;
  category: 'core' | 'system' | 'template' | 'example';
  feature_category?: FeatureCategory;
}

export interface BlueprintCategory {
  name: string;
  blueprints: Blueprint[];
}

export interface BlueprintList {
  core: Blueprint[];
  system: Blueprint[];
  templates: Record<string, Blueprint[]>;
  examples: Blueprint[];
}

// ============================================================================
// Template Management Types
// ============================================================================

export interface AssetDefinitionWizard extends AssetDefinition {
  blueprint_source?: 'browse' | 'custom' | 'new';
  custom_blueprint_file?: string;
}

export interface TemplateWizardData {
  name: string;
  version: string;
  description: string;
  assets: AssetDefinitionWizard[];
}

// ============================================================================
// Workspace Bundle Types
// ============================================================================

export interface WorkspaceBundleTemplateRecord {
  template: Template;
  blueprint_contents: Record<string, string>;
  template_root?: string;
}

export interface WorkspaceBundleSource {
  platform: 'web' | 'desktop' | 'mobile';
  runtime: 'browser' | 'tauri' | 'expo';
}

export interface WorkspaceBundlePayload {
  drafts: Draft[];
  config?: Omit<Config, 'api_keys'>;
  api_keys?: ApiKeys;
  templates?: WorkspaceBundleTemplateRecord[];
  blueprint_overrides?: Record<string, string>;
}

export interface WorkspaceBundle {
  app: 'eidolon-simulacra';
  version: '1.0';
  exportedAt: string;
  source: WorkspaceBundleSource;
  payload: WorkspaceBundlePayload;
}
