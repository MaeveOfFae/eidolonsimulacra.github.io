import type { ModelsResponse } from '../types';
import type { LLMProvider } from './types';
import { MODEL_SUGGESTIONS, buildProviderHeaders } from './factory';
import { normalizeModelsPayload, providerModelsUrl } from './openai-compat';
import { getRuntimeLLMFetch } from './transport';

/** Error envelope only — model entries are normalized by `normalizeModelsPayload`. */
type ProviderModelsPayload = {
  error?:
    | {
        message?: string;
      }
    | string;
};

export function getFallbackModels(provider: LLMProvider): ModelsResponse['models'] {
  return (MODEL_SUGGESTIONS[provider] || []).map((id) => ({
    id,
    name: id,
    provider,
  }));
}

export async function fetchProviderModels(
  provider: LLMProvider,
  apiKey: string,
  baseUrl: string,
  options: { includeContentTypeHeader?: boolean } = {},
): Promise<ModelsResponse> {
  const headers = buildProviderHeaders(
    provider,
    apiKey,
    options.includeContentTypeHeader ? { contentType: 'application/json' } : undefined,
  );

  const response = await getRuntimeLLMFetch()(providerModelsUrl(provider, baseUrl), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let error = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as ProviderModelsPayload;
      if (typeof payload.error === 'string') {
        error = payload.error;
      } else if (payload.error?.message) {
        error = payload.error.message;
      }
    } catch {
      // Keep the HTTP status fallback.
    }

    throw new Error(error);
  }

  const payload = (await response.json()) as ProviderModelsPayload;
  const models = normalizeModelsPayload(payload).map((model) => ({
    id: model.id,
    name: model.name || model.id,
    provider,
    context_length: model.context_length,
    supports_vision: model.input_modalities?.includes('image') || false,
    supports_tools: model.supported_parameters?.includes('tools') || false,
  }));

  return {
    provider,
    models,
    cached: false,
  };
}
