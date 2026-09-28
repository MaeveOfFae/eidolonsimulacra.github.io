import type { ModelsResponse } from '../types';
import type { LLMProvider } from './types';
import { MODEL_SUGGESTIONS, buildProviderHeaders } from './factory';

type ProviderModelsPayload = {
  data?: Array<{
    id?: string;
    name?: string;
    context_length?: number;
    architecture?: {
      input_modalities?: string[];
    };
    supported_parameters?: string[];
  }>;
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

  const response = await fetch(`${baseUrl}/models`, {
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
  const models = (payload.data || [])
    .filter((model): model is NonNullable<ProviderModelsPayload['data']>[number] & { id: string } => Boolean(model?.id))
    .map((model) => ({
      id: model.id,
      name: model.name || model.id,
      provider,
      context_length: model.context_length,
      supports_vision: model.architecture?.input_modalities?.includes('image') || false,
      supports_tools: model.supported_parameters?.includes('tools') || false,
    }));

  return {
    provider,
    models,
    cached: false,
  };
}
