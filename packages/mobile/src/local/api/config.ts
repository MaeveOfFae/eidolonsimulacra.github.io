/**
 * Model-cache and provider configuration: the cache and its TTL, the export presets, the prompt-size limits, and resolution of the configured provider, key, base URL and engine.
 *
 * Split out of `api.ts`, which is now a barrel over these modules.
 */
import {
  APIError,
  createEngine,
  detectProviderFromModel,
  getDefaultBaseUrl,
  canonicalizeLegacyAssetName,
  stripReasoningArtifacts,
  unwrapSingleCodeFence,
  type ApiKeys,
  type Config,
  type DownloadResponse,
  type ExportPresetSummary,
  type LLMProvider,
  type ModelsResponse,
} from '@char-gen/shared';
import { getStoredDeviceConfig } from '../../storage/device-config';
import { MOBILE_PROVIDER_TIMEOUT_MS } from './streaming';

export const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
export const EXPORT_PRESETS: ExportPresetSummary[] = [
  {
    name: 'Official PNG Character Card',
    path: 'png',
    format: 'png',
    description: 'Export a standard PNG character card with embedded V2/V3 card data.',
  },
  {
    name: 'Official V2/V3 Card JSON',
    path: 'json',
    format: 'json',
    description: 'Export a Chub-compatible V2/V3 character card JSON with Eidolon round-trip extensions.',
  },
  { name: 'text', path: 'text', format: 'text', description: 'Export draft assets as plain text sections.' },
  {
    name: 'combined',
    path: 'combined',
    format: 'combined',
    description: 'Export a markdown bundle with metadata and assets.',
  },
  {
    name: 'Printable PDF',
    path: 'pdf',
    format: 'pdf',
    description: 'Export a printable single-column PDF with metadata and every asset.',
  },
];

export type CachedModelsEntry = {
  response: ModelsResponse;
  cachedAt: number;
};

export const modelsCache = new Map<string, CachedModelsEntry>();

export function slugifyFileName(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return sanitized || 'export';
}

export function createDownload(content: string | Uint8Array, filename: string, contentType: string): DownloadResponse {
  return {
    blob: new Blob([content instanceof Uint8Array ? new Uint8Array(content) : content], { type: contentType }),
    filename,
    contentType,
  };
}

export const PROMPT_ASSET_CHAR_LIMITS: Record<string, number> = {
  system_prompt: 500,
  post_history: 500,
  character_sheet: 1400,
  intro_scene: 700,
  creator_notes: 420,
  a1111: 360,
  reference_summary: 360,
  default: 420,
};

export const PROMPT_ASSET_LINE_LIMITS: Record<string, number> = {
  system_prompt: 8,
  post_history: 8,
  character_sheet: 24,
  intro_scene: 10,
  creator_notes: 8,
  a1111: 6,
  reference_summary: 6,
  default: 8,
};

export function getPromptAssetCharLimit(assetName: string): number {
  return PROMPT_ASSET_CHAR_LIMITS[canonicalizeLegacyAssetName(assetName)] ?? PROMPT_ASSET_CHAR_LIMITS.default;
}

export function getPromptAssetLineLimit(assetName: string): number {
  return PROMPT_ASSET_LINE_LIMITS[canonicalizeLegacyAssetName(assetName)] ?? PROMPT_ASSET_LINE_LIMITS.default;
}

export function normalizeModelOutput(content: string): string {
  return unwrapSingleCodeFence(stripReasoningArtifacts(content)).trim();
}

export function createReviewId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveConfiguredProvider(config: Config): LLMProvider {
  if (config.engine_mode === 'explicit' && config.engine !== 'auto' && config.engine !== 'openai_compatible') {
    return config.engine as LLMProvider;
  }

  return detectProviderFromModel(config.model);
}

export function getFallbackApiKey(apiKeys: ApiKeys): string | undefined {
  return Object.values(apiKeys).find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

export function getConfiguredBaseUrl(config: Config, provider: LLMProvider): string {
  const configured = config.base_url?.trim();
  return configured && configured.length > 0 ? configured : getDefaultBaseUrl(provider);
}

export function createConfiguredEngine(config: Config = getStoredDeviceConfig()) {
  const provider = resolveConfiguredProvider(config);
  const apiKey = provider === 'ollama' ? undefined : config.api_keys[provider] || getFallbackApiKey(config.api_keys);

  if (provider !== 'ollama' && (!apiKey || apiKey.trim().length === 0)) {
    throw new APIError(400, `No API key configured for ${provider}`);
  }

  const baseUrl = getConfiguredBaseUrl(config, provider);
  return {
    provider,
    baseUrl,
    engine: createEngine({
      model: config.model,
      apiKey,
      apiKeys: config.api_keys as Record<string, string>,
      provider,
      baseUrl,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      timeout: MOBILE_PROVIDER_TIMEOUT_MS,
    }),
  };
}
