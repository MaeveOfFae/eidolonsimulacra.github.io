/**
 * LLM Engine Factory for creating engines based on model and configuration.
 * Handles provider detection and API key resolution.
 */

import type { LLMConfig, LLMEngine, LLMProvider } from './types';
import { detectProviderFromModel } from './types';
import { listModels as listModelsFromProvider, OpenAICompatEngine } from './openai-compat';
import { GoogleEngine } from './google';
import { AnthropicEngine } from './anthropic';

// Header/auth shaping moved to `headers.ts` so `openai-compat.ts` can share it
// without importing this factory (which imports `openai-compat`).
export { buildProviderHeaders, getProviderAuthType } from './headers';
export type { ProviderHeaderOptions } from './headers';

export interface CreateEngineOptions extends Omit<LLMConfig, 'provider'> {
  provider?: LLMProvider;
  apiKeys?: Record<string, string | undefined>;
  defaultApiKey?: string;
}

/**
 * Normalize model names for OpenAI-compatible APIs.
 * OpenRouter expects provider/model IDs and does not accept legacy "openrouter/" prefix.
 */
function normalizeOpenAICompatModel(model: string, baseUrl: string): string {
  if (baseUrl.includes('openrouter.ai') && model.startsWith('openrouter/')) {
    return model.slice('openrouter/'.length);
  }
  return model;
}

/**
 * Get API key for a provider from the keys object.
 * Falls back to defaultApiKey if no provider-specific key is found.
 *
 * Ollama is the exception: it only ever uses its own key (local servers need
 * none; Ollama Cloud at `https://ollama.com/v1` needs `OLLAMA_API_KEY`), and
 * must never inherit an unrelated provider's key — that would leak a foreign
 * credential to localhost.
 */
function getApiKey(
  provider: LLMProvider,
  options: Omit<CreateEngineOptions, 'provider' | 'model'>,
): string | undefined {
  if (provider === 'ollama') {
    return options.apiKeys?.ollama || options.apiKey || undefined;
  }

  if (options.apiKeys?.[provider]) {
    return options.apiKeys[provider];
  }

  return options.apiKey || options.defaultApiKey;
}

export function getDefaultBaseUrl(provider: LLMProvider): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1beta';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    case 'anthropic':
      return 'https://api.anthropic.com';
    case 'deepseek':
      return 'https://api.deepseek.com';
    // docs.z.ai "API Endpoint": the international Z.AI gateway (the older
    // open.bigmodel.cn host is the China-specific deployment).
    case 'zai':
      return 'https://api.z.ai/api/paas/v4';
    // platform.kimi.ai quickstart configures the OpenAI SDK against api.moonshot.ai
    // (api.moonshot.cn is the China-specific deployment).
    case 'moonshot':
      return 'https://api.moonshot.ai/v1';
    // Local server by default; Ollama Cloud is the same OpenAI-compatible surface
    // at https://ollama.com/v1 with an OLLAMA_API_KEY (set as the API base URL).
    case 'ollama':
      return 'http://localhost:11434/v1';
    default:
      return 'https://api.openai.com/v1';
  }
}

/**
 * Create appropriate LLM engine based on config and model.
 * This is the main entry point for creating engines.
 */
export function createEngine(options: CreateEngineOptions): LLMEngine {
  const {
    model,
    baseUrl: explicitBaseUrl,
    apiKeys,
    defaultApiKey,
    proxyKey,
    provider: explicitProvider,
    ...rest
  } = options;

  // Detect provider from model if not explicitly set
  const provider = explicitProvider || detectProviderFromModel(model);

  // Determine base URL
  const baseUrl = explicitBaseUrl || getDefaultBaseUrl(provider);

  // Get API key
  const apiKey = getApiKey(provider, { apiKeys, defaultApiKey, ...rest });

  // Normalize model name
  const normalizedModel = normalizeOpenAICompatModel(model, baseUrl);

  // Create engine configuration.
  // A proxy key only applies to a custom base URL, so it is dropped when the
  // caller did not configure one (the resolved default is always present).
  const config: LLMConfig = {
    provider,
    model: normalizedModel,
    apiKey: apiKey || '',
    baseUrl,
    ...(explicitBaseUrl && proxyKey ? { proxyKey } : {}),
    ...rest,
  };

  switch (provider) {
    case 'google':
      return new GoogleEngine(config);

    case 'anthropic':
      return new AnthropicEngine(config);

    case 'openai':
    case 'openrouter':
    case 'deepseek':
    case 'zai':
    case 'moonshot':
    case 'ollama':
    default:
      return new OpenAICompatEngine(config);
  }
}

/**
 * Get the engine type that would be used for a given model.
 * Useful for UI display without actually creating an engine.
 */
export function getEngineType(model: string, provider?: LLMProvider): string {
  const detected = provider || detectProviderFromModel(model);
  switch (detected) {
    case 'google':
      return `GoogleEngine (${detected})`;
    case 'anthropic':
      return `AnthropicEngine (${detected})`;
    default:
      return `OpenAICompatEngine (${detected})`;
  }
}

/**
 * List available models from a provider.
 */
export async function listModels(provider: LLMProvider, apiKey?: string, baseUrl?: string): Promise<string[]> {
  const resolvedBaseUrl = baseUrl || getDefaultBaseUrl(provider);
  return listModelsFromProvider(resolvedBaseUrl, apiKey, provider);
}

/**
 * Static fallback suggestions, verified against each provider's official docs
 * (developers.openai.com, ai.google.dev, openrouter.ai, platform.claude.com,
 * api-docs.deepseek.com, docs.z.ai, platform.kimi.ai, docs.ollama.com — 2026-10).
 * Remote listing supersedes these wherever the provider supports it.
 */
export const MODEL_SUGGESTIONS: Record<LLMProvider, string[]> = {
  openai: ['gpt-6-astra', 'gpt-6.1-sol', 'gpt-6-luna', 'gpt-5.2'],
  google: ['gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.7-flash', 'gemini-flash-latest'],
  openrouter: ['openai/gpt-5.2', 'openai/gpt-6.1-sol', 'anthropic/claude-sonnet-5-5', 'google/gemini-3.8-flash'],
  anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-1', 'claude-haiku-4-5-20251001'],
  deepseek: ['deepseek-flash', 'deepseek-v4-pro'],
  zai: ['glm-5.3', 'glm-5.3-flash', 'glm-5.2', 'glm-4.7'],
  moonshot: ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.6'],
  ollama: ['gemma4', 'qwen3.5', 'llama3.1', 'qwen3', 'gpt-oss'],
};

/**
 * Test connection to a provider.
 */
export async function testConnection(
  provider: LLMProvider,
  model: string,
  apiKey?: string,
  baseUrl?: string,
  options?: Partial<Omit<CreateEngineOptions, 'provider' | 'model' | 'apiKey' | 'baseUrl'>>,
): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  try {
    const engine = createEngine({
      provider,
      model,
      apiKey,
      baseUrl,
      ...options,
    });

    const result = await engine.testConnection();
    return {
      success: result.success,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}
