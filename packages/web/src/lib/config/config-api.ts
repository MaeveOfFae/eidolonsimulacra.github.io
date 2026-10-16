/**
 * Configuration and provider-model operations for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.7.0). Config reads and writes go
 * through `configManager` (the desktop-aware persisted store); provider-key
 * resolution falls back to the first configured key (except Ollama, which never
 * inherits a foreign key); `loadProviderModels` caches per provider/baseUrl/
 * auth-shape for 5 minutes and falls back to the static suggestion lists when a
 * key is missing (Ollama lists keyless). Behavior is pinned by
 * `api.config.test.ts` through the facade.
 */

import {
  detectProviderFromModel,
  fetchProviderModels as fetchSharedProviderModels,
  getFallbackModels,
  providerRequiresApiKey,
  type ApiKeys,
  type Config,
  type ConnectionTestRequest,
  type ConnectionTestResult,
  type LLMProvider,
  type ModelsResponse,
} from '@char-gen/shared';
import { MODEL_SUGGESTIONS, createEngine, getDefaultBaseUrl } from '../llm/factory.js';
import { toAppConnectionTestResult } from '../llm/connection-result.js';
import { isDesktopRuntime } from '../runtime.js';
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

  // Local/gateway Custom endpoints need no key and must never inherit a
  // foreign provider's key (it would be sent as a Bearer token to an arbitrary
  // URL). Ollama Cloud users store their key under `ollama` above.
  if (provider === 'ollama' || provider === 'custom') {
    return undefined;
  }

  return getFallbackApiKey(apiKeys);
}

/**
 * The endpoint a provider will actually call. Custom and Ollama own the config
 * base URL — Ollama is Cloud by default and a local server (or relay) once one is
 * set (`config.base_url`); every other provider keeps its documented host so a
 * leftover URL can never hijack it.
 */
export function resolveProviderBaseUrl(provider: LLMProvider, config: Config): string {
  if (provider === 'custom' || provider === 'ollama') {
    const configured = config.base_url?.trim();
    if (configured) {
      return configured;
    }
  }

  return getDefaultBaseUrl(provider);
}

/**
 * Whether a provider needs an API key before a call is worth attempting. Custom
 * endpoints and a loopback Ollama (a local server) answer keyless; Ollama Cloud
 * and every other provider need one. Re-exported from `@char-gen/shared` for the
 * settings screens that already read this module.
 */
export { providerRequiresApiKey } from '@char-gen/shared';

/**
 * A refused or CORS-blocked request reaches us as a bare `TypeError` whose
 * message is engine-specific: "Failed to fetch" (Chromium), "NetworkError when
 * attempting to fetch resource." (Firefox), "Load failed" (Safari), "Network
 * request failed" (React Native). Matching one spelling would misreport the
 * others as a server-side error and drop the origin-fix guidance.
 */
function isTransportFailure(error: unknown): boolean {
  return (
    error instanceof TypeError && /failed to fetch|networkerror|load failed|network request failed/i.test(error.message)
  );
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
  const config = configManager.getConfig();
  const provider = request.provider as LLMProvider;
  const apiKey = configManager.getApiKeys()[request.provider];
  const baseUrl =
    request.base_url?.trim() || (provider === 'custom' || provider === 'ollama' ? config.base_url?.trim() || '' : '');

  // Custom runs keyless (local servers) and so does a loopback Ollama; Ollama
  // Cloud needs its OLLAMA_API_KEY before a test is meaningful.
  if (providerRequiresApiKey(provider, baseUrl) && !apiKey) {
    return {
      success: false,
      error:
        provider === 'ollama'
          ? 'No API key configured for ollama — add an OLLAMA_API_KEY for Ollama Cloud, or set a local server base URL in Settings → Runtime'
          : `No API key configured for ${request.provider}`,
    };
  }

  const model =
    request.model || MODEL_SUGGESTIONS[request.provider as keyof typeof MODEL_SUGGESTIONS]?.[0] || config.model;
  try {
    const engine = createEngine({
      model,
      apiKey,
      provider: request.provider as never,
      // Custom and Ollama fall back to the configured base URL (Settings → Runtime).
      baseUrl: provider === 'custom' || provider === 'ollama' ? baseUrl : undefined,
    });
    const result = await engine.testConnection();
    return toAppConnectionTestResult(result);
  } catch (error) {
    // createEngine refuses a Custom provider with no base URL — surface that
    // as a normal connection failure instead of an unhandled rejection.
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

export async function loadProviderModels(provider: string, refresh: boolean = false): Promise<ModelsResponse> {
  const apiKeys = configManager.getApiKeys();
  const config = configManager.getConfig();
  const typedProvider = provider as LLMProvider;
  // Custom and Ollama own the base-URL override (Ollama: Cloud by default, a local
  // server or relay when one is configured); every other provider lists from its
  // documented endpoint.
  const baseUrl = resolveProviderBaseUrl(typedProvider, config);
  const apiKey = resolveProviderApiKey(provider, apiKeys);
  const cacheKey = `${provider}|${baseUrl}|${apiKey ? 'auth' : 'anon'}`;
  const cachedEntry = modelsCache.get(cacheKey);
  if (!refresh && cachedEntry && Date.now() - cachedEntry.cachedAt < MODEL_CACHE_TTL_MS) {
    return {
      ...cachedEntry.response,
      cached: true,
    };
  }

  if (typedProvider === 'custom' && !baseUrl) {
    return {
      provider,
      models: [],
      cached: true,
      error:
        'Set an API base URL for the Custom provider in Settings → Runtime (for a local Ollama server: http://localhost:11434/v1).',
    };
  }

  const fallbackModels = getFallbackModels(typedProvider);
  // Every provider supports remote listing (Anthropic via /v1/models, Google via
  // its models[] payload, Ollama via its catalog). Ollama's `GET /api/tags` is a
  // public catalog that answers without a key (verified live), so only the
  // remaining providers require one before the fetch.
  const needsKey = provider !== 'custom' && provider !== 'ollama';

  if (needsKey && !apiKey) {
    const response = {
      provider,
      models: fallbackModels,
      cached: true,
    };
    modelsCache.set(cacheKey, {
      response,
      cachedAt: Date.now(),
    });
    return response;
  }

  try {
    const response = await fetchSharedProviderModels(typedProvider, apiKey ?? '', baseUrl);
    modelsCache.set(cacheKey, {
      response,
      cachedAt: Date.now(),
    });
    return response;
  } catch (error) {
    const isNetworkError = isTransportFailure(error);
    // The local-first default targets localhost; a refused connection there is
    // either "Ollama isn't running" or "Ollama is blocking this app's origin"
    // (the desktop app and non-localhost origins get a 403 without OLLAMA_ORIGINS).
    const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(baseUrl);
    const message = isNetworkError
      ? isLocalTarget
        ? `Could not reach the local model server at ${baseUrl}: either it is not running, or it blocked this app's origin — start Ollama with OLLAMA_ORIGINS=* to allow it. The built-in suggestions are shown below.`
        : typedProvider === 'ollama' && !isDesktopRuntime()
          ? // ollama.com answers no browser at all, so this is a policy block, not
            // the user's network or privacy shield.
            `ollama.com sends no CORS headers, so a browser cannot list Ollama Cloud models — use the desktop app, or point the Custom provider at a relay that forwards to https://ollama.com/v1. The built-in suggestions are shown below.`
          : 'Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.'
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
