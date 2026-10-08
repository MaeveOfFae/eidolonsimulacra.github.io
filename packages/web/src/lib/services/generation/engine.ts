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
import { isDesktopRuntime } from '../../runtime.js';

export const DEFAULT_GENERATION_MAX_TOKENS = 4096;

/**
 * Tauri's native transport buffers the whole response body, so a completion
 * request's timeout spans the entire generation rather than a gap between SSE
 * events. Mirrors the mobile build's `MOBILE_PROVIDER_TIMEOUT_MS`, which exists
 * for the same reason.
 */
export const DESKTOP_PROVIDER_TIMEOUT_MS = 300_000;

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
    // Custom owns the base-URL override; named providers use their documented
    // endpoint so a leftover config URL can never hijack them.
    baseUrl: provider === 'custom' ? config.base_url : undefined,
    proxyKey: provider === 'custom' ? config.api_proxy_key : undefined,
    temperature: config.temperature,
    maxTokens: resolveGenerationMaxTokens(config),
    // Desktop runs one non-streaming completion through the buffering native
    // transport, so the timeout spans the whole generation.
    ...(isDesktopRuntime() ? { timeout: DESKTOP_PROVIDER_TIMEOUT_MS } : {}),
  });
}

export function sanitizeGeneratedSeed(content: string): string {
  return unwrapSingleCodeFence(sanitizeModelContent(content)).replace(/^['"]|['"]$/g, '');
}
