/**
 * Configuration and provider-model operations for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6.2). Config reads and writes go
 * through `configManager` (the desktop-aware persisted store); provider-key
 * resolution falls back to the first configured key; `loadProviderModels`
 * caches per provider/baseUrl/auth-shape for 5 minutes and falls back to the
 * static suggestion lists when no key is configured or the provider has no
 * remote listing. Behavior is pinned by `api.config.test.ts` through the
 * facade.
 */

import {
  detectProviderFromModel,
  fetchProviderModels as fetchSharedProviderModels,
  getFallbackModels,
  type ApiKeys,
  type Config,
  type ConnectionTestRequest,
  type ConnectionTestResult,
  type LLMProvider,
  type ModelsResponse,
} from '@char-gen/shared';
import { MODEL_SUGGESTIONS, createEngine, getDefaultBaseUrl } from '../llm/factory.js';
import { toAppConnectionTestResult } from '../llm/connection-result.js';
import { configManager } from './manager.js';

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedModelsEntry = {
  response: ModelsResponse;
  cachedAt: number;
};

const modelsCache = new Map<string, CachedModelsEntry>();

export function getBrowserConfig(): Config {
  return {
    ...configManager.getConfig(),
    api_keys: configManager.getApiKeys(),
  };
}

export function resolveConfiguredProvider(config: Config): LLMProvider | undefined {
  if (config.engine_mode === 'explicit' && config.engine !== 'auto' && config.engine !== 'openai_compatible') {
    return config.engine as LLMProvider;
  }

  return config.model ? detectProviderFromModel(config.model) : undefined;
}

export function getFallbackApiKey(apiKeys: ApiKeys): string | undefined {
  return Object.values(apiKeys).find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function resolveProviderApiKey(provider: string, apiKeys: ApiKeys): string | undefined {
  const providerKey = apiKeys[provider];
  if (typeof providerKey === 'string' && providerKey.trim().length > 0) {
    return providerKey;
  }

  return getFallbackApiKey(apiKeys);
}

export async function getConfig(): Promise<Config> {
  return getBrowserConfig();
}

export function getConfigSnapshot(): Config {
  return getBrowserConfig();
}

export async function syncConfigFromServer(): Promise<boolean> {
  return false;
}

export async function updateConfig(config: Partial<Config>): Promise<Config> {
  const nextConfig = { ...config };
  if (config.api_keys) {
    configManager.replaceApiKeys(config.api_keys);
    delete nextConfig.api_keys;
  }
  configManager.updateConfig(nextConfig);
  return getConfig();
}

export async function testConnection(request: ConnectionTestRequest): Promise<ConnectionTestResult> {
  const apiKey = configManager.getApiKeys()[request.provider];
  if (!apiKey) {
    return { success: false, error: `No API key configured for ${request.provider}` };
  }

  const model =
    request.model ||
    MODEL_SUGGESTIONS[request.provider as keyof typeof MODEL_SUGGESTIONS]?.[0] ||
    getBrowserConfig().model;
  const engine = createEngine({
    model,
    apiKey,
    provider: request.provider as never,
    baseUrl: request.base_url,
  });

  const result = await engine.testConnection();

  return toAppConnectionTestResult(result);
}

export async function loadProviderModels(provider: string, refresh: boolean = false): Promise<ModelsResponse> {
  const apiKeys = configManager.getApiKeys();
  const config = configManager.getConfig();
  const typedProvider = provider as LLMProvider;
  const baseUrl = config.base_url || getDefaultBaseUrl(typedProvider);
  const apiKey = resolveProviderApiKey(provider, apiKeys);
  const cacheKey = `${provider}|${baseUrl}|${apiKey ? 'auth' : 'anon'}`;
  const cachedEntry = modelsCache.get(cacheKey);
  if (!refresh && cachedEntry && Date.now() - cachedEntry.cachedAt < MODEL_CACHE_TTL_MS) {
    return {
      ...cachedEntry.response,
      cached: true,
    };
  }

  const fallbackModels = getFallbackModels(typedProvider);
  const supportsRemoteListing = ['openrouter', 'openai', 'deepseek', 'zai', 'moonshot'].includes(provider);

  if (!apiKey || !supportsRemoteListing) {
    const response = {
      provider,
      models: fallbackModels,
      cached: true,
      error: apiKey || supportsRemoteListing ? undefined : 'Provider model listing is not available in browser mode.',
    };
    modelsCache.set(cacheKey, {
      response,
      cachedAt: Date.now(),
    });
    return response;
  }

  try {
    const response = await fetchSharedProviderModels(typedProvider, apiKey, baseUrl);
    modelsCache.set(cacheKey, {
      response,
      cachedAt: Date.now(),
    });
    return response;
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
    const message = isNetworkError
      ? 'Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.'
      : error instanceof Error
        ? error.message
        : 'Failed to load models';
    const response = {
      provider,
      models: fallbackModels,
      cached: true,
      error: message,
    };
    modelsCache.set(cacheKey, {
      response,
      cachedAt: Date.now(),
    });
    return response;
  }
}

export async function getModels(provider: string): Promise<ModelsResponse> {
  return loadProviderModels(provider, false);
}

export async function refreshModels(
  provider: string,
): Promise<{ status: string; model_count: number; error?: string }> {
  const response = await loadProviderModels(provider, true);
  return { status: 'ok', model_count: response.models.length, error: response.error };
}
