/**
 * LLM engine types for the Eidolon Simulacra client.
 */

export type LLMProvider =
  | 'openai'
  | 'google'
  | 'openrouter'
  | 'anthropic'
  | 'deepseek'
  | 'zai'
  | 'moonshot'
  | 'ollama'
  | 'custom';

export type LLMEngineMode = 'auto' | 'explicit';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
  proxyKey?: string;
  timeout?: number;
}

export interface LLMChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  signal?: AbortSignal;
}

/**
 * Normalised token usage reported by the provider for a single call.
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateResult {
  content: string;
  finishReason?: string;
  usage?: TokenUsage;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  finishReason?: string;
  /**
   * Present on the final (`done: true`) chunk when the provider reports usage
   * during streaming. Providers that do not report it leave this undefined.
   */
  usage?: TokenUsage;
}

export interface StreamGenerateOptions extends GenerateOptions {
  signal?: AbortSignal;
}

export interface LLMConnectionTestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  modelInfo?: {
    name: string;
    contextLength?: number;
  };
}

export interface LLMEngine {
  /**
   * Generate a completion (non-streaming)
   */
  generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult>;

  /**
   * Generate a completion with streaming
   */
  generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk>;

  /**
   * Test connection to LLM provider
   */
  testConnection(): Promise<LLMConnectionTestResult>;

  /**
   * Get provider type
   */
  getProvider(): LLMProvider;

  /**
   * Get model name
   */
  getModel(): string;
}

export interface LLMEngineConstructor {
  new (config: LLMConfig): LLMEngine;
}

/**
 * Provider-specific API endpoints. Kept in sync with `getDefaultBaseUrl` in
 * `factory.ts` (docs-verified hosts: api.z.ai per docs.z.ai, api.moonshot.ai
 * per platform.kimi.ai).
 *
 * `ollama` is Ollama Cloud's OpenAI-compatible surface (`/v1/chat/completions`,
 * `/v1/models`) — its native API on the same host (`/api/chat`, `/api/tags`) keeps
 * a different body, reply and listing shape, and nothing in the app speaks it.
 * Local Ollama servers ride the same provider with a `http://localhost:11434/v1`
 * base URL; `custom` (no default — it requires a base URL from config) covers any
 * other OpenAI-compatible endpoint.
 */
export const ProviderEndpoints: Record<LLMProvider, string> = {
  openai: 'https://api.openai.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  openrouter: 'https://openrouter.ai/api/v1',
  anthropic: 'https://api.anthropic.com',
  deepseek: 'https://api.deepseek.com/v1',
  zai: 'https://api.z.ai/api/paas/v4',
  moonshot: 'https://api.moonshot.ai/v1',
  ollama: 'https://ollama.com/v1',
  custom: '',
} as const;

/**
 * True when a base URL targets a loopback server — a local Ollama/LM Studio, or a
 * dev relay. Loopback endpoints are keyless, and a browser reaches them only when
 * the server itself allows the app's origin (Ollama: `OLLAMA_ORIGINS`), which is
 * why the engines and the settings screens special-case them.
 */
export function isLoopbackUrl(value: string | undefined): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value ?? '');
}

/**
 * Resolve whatever Ollama base URL a user typed (or an older build stored) to the
 * OpenAI-compatible path this app calls: a bare host (`http://localhost:11434`,
 * `https://ollama.com`), the native `/api` path, or an explicit `/v1`. A gateway
 * mounted on any other path is left untouched, so a relay is never mangled.
 *
 * `undefined`/blank resolves to the provider default (Ollama Cloud).
 */
export function normalizeOllamaBaseUrl(value: string | undefined): string {
  const trimmed = (value?.trim() || ProviderEndpoints.ollama).replace(/\/+$/, '');

  if (trimmed.endsWith('/v1')) {
    return trimmed;
  }

  // `/api` is Ollama's native surface: same host, different protocol.
  if (trimmed.endsWith('/api')) {
    return `${trimmed.slice(0, -'/api'.length)}/v1`;
  }

  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  return withoutScheme.includes('/') ? trimmed : `${trimmed}/v1`;
}

/**
 * Resolve whichever base URL a caller holds for a provider: Ollama's value is
 * normalized to the OpenAI-compatible `/v1` path it is called with, every other
 * provider's override is used verbatim, and a blank/undefined value keeps the
 * provider's documented default. Shared so the listing, connection-test and
 * generation paths cannot disagree about the endpoint (they did: one normalized
 * the local `/api` value and the others did not).
 */
export function resolveProviderBaseUrlOverride(provider: LLMProvider, baseUrl: string | undefined): string | undefined {
  if (!baseUrl?.trim()) {
    return undefined;
  }

  return provider === 'ollama' ? normalizeOllamaBaseUrl(baseUrl) : baseUrl.trim();
}

/**
 * Whether a provider needs an API key before a call is worth attempting. Custom
 * endpoints and a loopback Ollama (a local server) answer keyless; Ollama Cloud
 * and every hosted provider need one.
 */
export function providerRequiresApiKey(provider: LLMProvider, baseUrl: string): boolean {
  if (provider === 'custom') {
    return false;
  }

  if (provider === 'ollama') {
    return !isLoopbackUrl(baseUrl);
  }

  return true;
}

/**
 * Provider-specific header keys. Ollama Cloud (https://ollama.com/v1) accepts
 * `Authorization: Bearer OLLAMA_API_KEY`; `custom` endpoints take Bearer when
 * a key is configured and no auth header at all keyless (local servers).
 */
export const ProviderAuthHeaders: Record<LLMProvider, string> = {
  openai: 'Authorization',
  google: 'x-goog-api-key',
  openrouter: 'Authorization',
  anthropic: 'x-api-key',
  deepseek: 'Authorization',
  zai: 'Authorization',
  moonshot: 'Authorization',
  ollama: 'Authorization',
  custom: 'Authorization',
} as const;

/**
 * Helper to format auth header value
 */
export function formatAuthHeader(provider: LLMProvider, apiKey: string): string {
  switch (provider) {
    case 'google':
      return apiKey;
    case 'anthropic':
      return apiKey; // Sent as the `x-api-key` header value, not `Authorization`.
    case 'ollama':
      // Local Ollama needs no auth; Ollama Cloud takes a Bearer token.
      return apiKey ? `Bearer ${apiKey}` : '';
    default:
      // OpenAI, OpenRouter, DeepSeek, Z.AI and Kimi take `Authorization: Bearer`.
      return apiKey ? `Bearer ${apiKey}` : '';
  }
}

/**
 * Detect provider from model name
 */
export function detectProviderFromModel(model: string): LLMProvider {
  const modelLower = model.toLowerCase();

  // Check for explicit provider prefixes
  if (modelLower.startsWith('openrouter/')) return 'openrouter';
  if (modelLower.startsWith('openai/')) return 'openai';
  if (modelLower.startsWith('google/')) return 'google';
  if (modelLower.startsWith('anthropic/')) return 'anthropic';
  if (modelLower.startsWith('zai/')) return 'zai';
  if (modelLower.startsWith('moonshot')) return 'moonshot';
  if (modelLower.startsWith('ollama/')) return 'ollama';

  // Bare provider-prefixed API model IDs: deepseek-flash / deepseek-v4-pro,
  // glm-5.3, kimi-k3. (`gpt-oss` is an open-weights tag pulled through Ollama,
  // so it must win over the `gpt-` OpenAI rule below.)
  if (modelLower.startsWith('deepseek-')) return 'deepseek';
  if (modelLower.startsWith('glm-')) return 'zai';
  if (modelLower.startsWith('kimi-')) return 'moonshot';
  if (modelLower.startsWith('gpt-oss')) return 'ollama';

  // Auto-detect based on model name patterns
  if (modelLower.startsWith('gpt-') || /^o[134](?:[-_.]|$)/.test(modelLower)) {
    return 'openai';
  }
  if (modelLower.startsWith('gemini')) {
    return 'google';
  }
  if (modelLower.startsWith('claude')) {
    return 'anthropic';
  }
  // Common Ollama model patterns
  if (
    modelLower.startsWith('llama') ||
    modelLower.startsWith('mistral') ||
    modelLower.startsWith('codellama') ||
    modelLower.startsWith('vicuna') ||
    modelLower.startsWith('qwen') ||
    modelLower.startsWith('phi') ||
    modelLower.startsWith('gemma') ||
    modelLower.startsWith('starcoder') ||
    modelLower.includes('ollama')
  ) {
    return 'ollama';
  }

  // Default to openrouter for unknown models
  return 'openrouter';
}
