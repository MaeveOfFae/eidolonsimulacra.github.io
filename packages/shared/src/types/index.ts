/**
 * Core data types for Character Generator
 * Mirrors Python dataclasses from bpui
 */

// ============================================================================
// Configuration Types
// ============================================================================

export type EngineType = 'openai' | 'google' | 'openai_compatible' | 'auto';
export type EngineMode = 'auto' | 'explicit';
export type ContentMode = 'SFW' | 'NSFW' | 'Platform-Safe' | 'Auto';

export interface ApiKeys {
  openai?: string;
  google?: string;
  openrouter?: string;
  deepseek?: string;
  zai?: string;
  moonshot?: string;
  [key: string]: string | undefined;
}

export interface BatchConfig {
  max_concurrent: number;
  rate_limit_delay: number;
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
}

// ============================================================================
// Draft Types
// ============================================================================

export interface DraftMetadata {
  seed: string;
  mode?: ContentMode;
  model?: string;
  created?: string;
  modified?: string;
  tags?: string[];
  genre?: string;
  notes?: string;
  favorite: boolean;
  character_name?: string;
  template_name?: string;
  parent_drafts?: string[];
  offspring_type?: string;
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
  sort_by?: 'created' | 'modified' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
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
}

// ============================================================================
// Generation Types
// ============================================================================

export interface GenerateRequest {
  seed: string;
  template?: string;
  mode: ContentMode;
  stream?: boolean;
}

export interface GenerateBatchRequest {
  seeds: string[];
  template?: string;
  mode: ContentMode;
  parallel?: boolean;
  max_concurrent?: number;
}

export interface GenerationProgress {
  stage: 'initializing' | 'orchestrator' | 'parsing' | 'saving' | 'complete' | 'error';
  status: 'started' | 'in_progress' | 'complete' | 'error';
  asset?: string;
  content?: string;
  progress?: number;
  error?: string;
}

export interface GenerationComplete {
  draft_path: string;
  character_name?: string;
  duration_ms: number;
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
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'text' | 'json' | 'combined';

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
// Chat/Refinement Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  draft_id: string;
  messages: ChatMessage[];
  context_asset?: string;
}

export interface RefineRequest {
  draft_id: string;
  asset: string;
  message: string;
}
