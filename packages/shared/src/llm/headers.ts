/**
 * Provider auth/header shaping, shared by the engine factory, the provider
 * engines, and the model-listing helpers.
 *
 * Split out of `factory.ts` so `openai-compat.ts` (model listing) can build
 * provider headers without importing the factory that itself imports it.
 */
import { isInvalidApiKeyValue, normalizeApiKeyValue } from './api-key';
import type { LLMProvider } from './types';

export interface ProviderHeaderOptions {
  accept?: string;
  contentType?: string;
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
        // The Claude API authenticates API keys via `x-api-key`; `Authorization`
        // carries OAuth/workload tokens instead. `anthropic-version` is required.
        headers['x-api-key'] = normalizedApiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'google':
        headers['x-goog-api-key'] = normalizedApiKey;
        break;
      default:
        // OpenAI, OpenRouter, DeepSeek, Z.AI, Kimi and Ollama (cloud) all take
        // `Authorization: Bearer`.
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
