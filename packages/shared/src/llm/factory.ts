/**
 * LLM Engine Factory for creating engines based on model and configuration.
 * Handles provider detection and API key resolution.
 */

import type { LLMConfig, LLMEngine, LLMProvider } from './types';
import { detectProviderFromModel } from './types';
import { listModels as listModelsFromProvider, OpenAICompatEngine } from './openai-compat';
import { GoogleEngine } from './google';
import { AnthropicEngine } from './anthropic';
import { isInvalidApiKeyValue, normalizeApiKeyValue } from './api-key';

export interface ProviderHeaderOptions {
  accept?: string;
  contentType?: string;
}

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
 */
function getApiKey(
  provider: LLMProvider,
  options: Omit<CreateEngineOptions, 'provider' | 'model'>,
): string | undefined {
  if (provider === 'ollama') {
    return undefined;
  }

  if (options.apiKeys?.[provider]) {
    return options.apiKeys[provider];
  }

  return options.apiKey || options.defaultApiKey;
}

export function getProviderAuthType(provider: LLMProvider): 'bearer' | 'raw' {
  switch (provider) {
    case 'google':
    case 'anthropic':
      return 'raw';
    default:
      return 'bearer';
  }
}

export function buildProviderHeaders(
  provider: LLMProvider,
  apiKey?: string,
  options: ProviderHeaderOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (options.contentType) {
    headers['Content-Type'] = options.contentType;
  }

  if (options.accept) {
    headers.Accept = options.accept;
  }

  const normalizedApiKey = typeof apiKey === 'string' ? normalizeApiKeyValue(apiKey) : undefined;

  if (normalizedApiKey) {
    if (isInvalidApiKeyValue(normalizedApiKey)) {
      throw new Error('Configured API key is invalid or corrupted. Re-enter it in Settings and try again.');
    }

    switch (provider) {
      case 'anthropic':
        headers['x-api-key'] = normalizedApiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'google':
        headers['x-goog-api-key'] = normalizedApiKey;
        break;
      default:
        headers.Authorization = `Bearer ${normalizedApiKey}`;
        break;
    }
  }

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://eidolon-simulacra.app';
    headers['X-OpenRouter-Title'] = 'Eidolon Simulacra';
  }

  return headers;
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
    case 'zai':
      return 'https://open.bigmodel.cn/api/paas/v4';
    case 'moonshot':
      return 'https://api.moonshot.cn/v1';
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
  return `OpenAICompatEngine (${detected})`;
}

/**
 * List available models from a provider.
 */
export async function listModels(provider: LLMProvider, apiKey?: string, baseUrl?: string): Promise<string[]> {
  const resolvedBaseUrl = baseUrl || getDefaultBaseUrl(provider);
  return listModelsFromProvider(resolvedBaseUrl, apiKey);
}

export const MODEL_SUGGESTIONS: Record<LLMProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview'],
  google: ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  openrouter: [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'google/gemini-pro-1.5',
    'openai/gpt-4o-mini',
  ],
  anthropic: ['claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  zai: ['glm-4', 'glm-4-flash'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  ollama: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'qwen2.5', 'phi3', 'gemma2'],
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
