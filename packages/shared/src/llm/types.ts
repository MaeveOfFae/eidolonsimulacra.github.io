/**
 * LLM engine types for the Eidolon Simulacra client.
 */

export type LLMProvider = 'openai' | 'google' | 'openrouter' | 'anthropic' | 'deepseek' | 'zai' | 'moonshot' | 'ollama';

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
 */
export const ProviderEndpoints: Record<LLMProvider, string> = {
  openai: 'https://api.openai.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  openrouter: 'https://openrouter.ai/api/v1',
  anthropic: 'https://api.anthropic.com',
  deepseek: 'https://api.deepseek.com',
  zai: 'https://api.z.ai/api/paas/v4',
  moonshot: 'https://api.moonshot.ai/v1',
  ollama: 'http://localhost:11434/v1',
} as const;

/**
 * Provider-specific header keys. Ollama's local server needs no auth; Ollama
 * Cloud (https://ollama.com/v1) accepts `Authorization: Bearer OLLAMA_API_KEY`.
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
