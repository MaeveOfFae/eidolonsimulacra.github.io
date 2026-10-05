/**
 * Stateless helpers behind generation: the stream display state the progress sink
 * writes into, the model-output sanitisers, and resolution of the configured provider,
 * API key, engine and max-token budget.
 *
 * Split out of `services/generation.ts`; they were `private static` methods that never
 * touched instance state, so they read better as functions.
 */
import type { ApiKeys, Config, LLMProvider } from '@char-gen/shared';
import { detectProviderFromModel } from '@char-gen/shared';
import { configManager } from '../../config/manager.js';
import { stripReasoningArtifacts, unwrapSingleCodeFence } from '../../content-format.js';
import { createEngine } from '../../llm/factory.js';

export const DEFAULT_GENERATION_MAX_TOKENS = 4096;

export interface StreamDisplayState {
  rawContent: string;
  visibleContent: string;
}

export function createStreamDisplayState(): StreamDisplayState {
  return {
    rawContent: '',
    visibleContent: '',
  };
}

export function sanitizeModelContent(content: string): string {
  return stripReasoningArtifacts(content);
}

export function appendVisibleChunk(state: StreamDisplayState, chunkContent: string): string {
  state.rawContent += chunkContent;
  const nextVisibleContent = sanitizeModelContent(state.rawContent);
  const visibleDelta = nextVisibleContent.startsWith(state.visibleContent)
    ? nextVisibleContent.slice(state.visibleContent.length)
    : '';

  state.visibleContent = nextVisibleContent;
  return visibleDelta;
}

export function resolveGenerationMaxTokens(config: Config): number {
  const configuredMaxTokens =
    typeof config.max_tokens === 'number' && Number.isFinite(config.max_tokens)
      ? Math.max(1, Math.round(config.max_tokens))
      : DEFAULT_GENERATION_MAX_TOKENS;

  return configuredMaxTokens;
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

export function createConfiguredEngine(override?: { model: string }) {
  const apiKeys = configManager.getApiKeys();
  const config = configManager.getConfig();
  const model = override?.model ?? config.model;
  // Comparison candidates resolve their provider from the model string so a
  // single run can span providers without touching the global config.
  const provider = override ? detectProviderFromModel(model) : resolveConfiguredProvider(config);

  return createEngine({
    model,
    apiKey: provider ? apiKeys[provider] : getFallbackApiKey(apiKeys),
    apiKeys,
    provider,
    baseUrl: config.base_url,
    proxyKey: config.api_proxy_key,
    temperature: config.temperature,
    maxTokens: resolveGenerationMaxTokens(config),
  });
}

export function sanitizeGeneratedSeed(content: string): string {
  return unwrapSingleCodeFence(sanitizeModelContent(content)).replace(/^['"]|['"]$/g, '');
}
