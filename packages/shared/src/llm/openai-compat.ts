/**
 * OpenAI-compatible REST API engine for direct provider calls.
 * Supports OpenRouter, DeepSeek, Anthropic, Zai, Moonshot, etc.
 */

import type {
  LLMEngine,
  LLMChatMessage,
  GenerateOptions,
  GenerateResult,
  StreamChunk,
  TokenUsage,
  StreamGenerateOptions,
  LLMConnectionTestResult,
  LLMProvider,
} from './types';
import { ProviderEndpoints } from './types';
import { isInvalidApiKeyValue, normalizeApiKeyValue } from './api-key';
import { buildProviderHeaders } from './headers';
import { getRuntimeLLMFetch, isRuntimeLLMStreamingSupported } from './transport';

interface OpenAICompatErrorResponse {
  error?: { message?: string } | string;
}

interface OpenAICompatUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAICompatChoice {
  text?: unknown;
  error?: { message?: string } | string;
  message?: {
    content?: unknown;
    output_text?: unknown;
    refusal?: unknown;
    parts?: unknown;
    tool_calls?: unknown[];
  };
  finish_reason?: string;
  delta?: {
    content?: unknown;
    output_text?: unknown;
    refusal?: unknown;
    parts?: unknown;
    tool_calls?: unknown[];
    // Reasoning models (OpenRouter, DeepSeek-R, etc.) stream chain-of-thought in
    // a field the display parser ignores; tracked only to explain a stall.
    reasoning?: unknown;
    reasoning_content?: unknown;
  };
}

interface OpenAICompatChatCompletionResponse {
  choices?: OpenAICompatChoice[];
  output_text?: unknown;
  error?: { message?: string } | string;
  usage?: OpenAICompatUsage;
}

function isDisplayContentRecord(record: Record<string, unknown>): boolean {
  const partType = typeof record.type === 'string' ? record.type : undefined;

  if (!partType) {
    return true;
  }

  return (
    partType === 'text' || partType === 'text_delta' || partType === 'output_text' || partType === 'output_text_delta'
  );
}

function extractTextValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextValue(entry)).join('');
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (!isDisplayContentRecord(record)) {
      return '';
    }

    if (typeof record.text === 'string') {
      return record.text;
    }

    if (record.text && typeof record.text === 'object') {
      const nestedText = record.text as Record<string, unknown>;
      if (typeof nestedText.value === 'string') {
        return nestedText.value;
      }
    }

    if (typeof record.value === 'string') {
      return record.value;
    }

    if (Array.isArray(record.parts)) {
      return extractTextValue(record.parts);
    }

    if (typeof record.output_text === 'string') {
      return record.output_text;
    }

    if (Array.isArray(record.output_text)) {
      return extractTextValue(record.output_text);
    }

    if (typeof record.content === 'string') {
      return record.content;
    }

    if (Array.isArray(record.content)) {
      return extractTextValue(record.content);
    }

    if (typeof record.output === 'string') {
      return record.output;
    }

    if (Array.isArray(record.output)) {
      return extractTextValue(record.output);
    }
  }

  return '';
}

function extractChoiceMessageContent(
  choice?: OpenAICompatChoice,
  response?: OpenAICompatChatCompletionResponse,
): string {
  return extractTextValue(
    choice?.message?.content ??
      choice?.message?.output_text ??
      choice?.message?.parts ??
      choice?.text ??
      response?.output_text,
  );
}

function extractChoiceDeltaContent(choice?: OpenAICompatChoice): string {
  return extractTextValue(choice?.delta?.content ?? choice?.delta?.output_text ?? choice?.delta?.parts ?? choice?.text);
}

function buildNoContentError(choice?: OpenAICompatChoice, response?: OpenAICompatChatCompletionResponse): string {
  const responseError = response?.error;
  if (typeof responseError === 'string' && responseError.trim()) {
    return responseError;
  }
  if (
    responseError &&
    typeof responseError === 'object' &&
    typeof responseError.message === 'string' &&
    responseError.message.trim()
  ) {
    return responseError.message;
  }

  const choiceError = choice?.error;
  if (typeof choiceError === 'string' && choiceError.trim()) {
    return choiceError;
  }
  if (
    choiceError &&
    typeof choiceError === 'object' &&
    typeof choiceError.message === 'string' &&
    choiceError.message.trim()
  ) {
    return choiceError.message;
  }

  const refusal = extractTextValue(choice?.message?.refusal ?? choice?.delta?.refusal);
  if (refusal.trim()) {
    return refusal.trim();
  }

  const toolCalls = [
    ...(Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : []),
    ...(Array.isArray(choice?.delta?.tool_calls) ? choice.delta.tool_calls : []),
  ];
  if (toolCalls.length > 0) {
    return 'Model returned tool calls instead of displayable text. Choose a different model or provider for plain-text responses.';
  }

  switch (choice?.finish_reason) {
    case 'length':
      return 'Model exhausted its output budget before producing visible text. Increase max tokens or choose a different model.';
    case 'content_filter':
      return 'Provider blocked the response with content filtering.';
    case 'error':
      return 'Provider returned an error before producing visible text.';
    default:
      return 'Provider returned no displayable text. Try a different model or increase max tokens.';
  }
}

function normalizeUsage(usage?: OpenAICompatUsage): GenerateResult['usage'] {
  if (usage?.prompt_tokens === undefined || usage.completion_tokens === undefined || usage.total_tokens === undefined) {
    return undefined;
  }

  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}

/**
 * Providers confirmed to accept OpenAI's `stream_options.include_usage`
 * streaming parameter. Other OpenAI-compatible servers may reject the field,
 * so it is not sent to them; usage is still parsed from any chunk that
 * happens to carry it, and a 400 that names the parameter triggers one retry
 * without it.
 */
const STREAM_USAGE_PROVIDERS = new Set<LLMProvider>(['openai', 'openrouter', 'deepseek']);

export interface OpenAICompatConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  proxyKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export class OpenAICompatEngine implements LLMEngine {
  private config: OpenAICompatConfig;

  constructor(config: OpenAICompatConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 120000,
      baseUrl: config.baseUrl || ProviderEndpoints[config.provider],
      ...config,
    };
  }

  getProvider(): LLMProvider {
    return this.config.provider;
  }

  getModel(): string {
    return this.config.model;
  }

  private async fetchWithTimeout(url: string, init: RequestInit, signal?: AbortSignal): Promise<Response> {
    const controller = new AbortController();
    const timeoutMs = typeof this.config.timeout === 'number' ? this.config.timeout : 120000;
    let didTimeout = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleAbort = () => {
      controller.abort();
    };

    if (signal?.aborted) {
      controller.abort();
    } else if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    // A transport that ignores the abort signal (some native bridges do) would
    // leave the request pending forever, so the timeout also rejects the race
    // below instead of relying on `controller.abort()` alone.
    let rejectTimeout: ((error: Error) => void) | null = null;
    const timeoutRejection = new Promise<never>((_resolve, reject) => {
      rejectTimeout = reject;
    });

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
        rejectTimeout?.(new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`));
      }, timeoutMs);
    }

    try {
      return await Promise.race([
        getRuntimeLLMFetch()(url, {
          ...init,
          signal: controller.signal,
        }),
        timeoutRejection,
      ]);
    } catch (error) {
      if (didTimeout) {
        throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
      }

      throw error;
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
    }
  }

  async generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;

    const response = await this.fetchWithTimeout(
      this.config.baseUrl + '/chat/completions',
      {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
          ...this.buildExtraParams(options),
        }),
      },
      options?.signal,
    );

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw new Error(error);
    }

    const responseJson = await response.json();
    const data = responseJson as OpenAICompatChatCompletionResponse;
    const choice = data?.choices?.[0];
    const content = extractChoiceMessageContent(choice, data).trim();
    if (!content) {
      throw new Error(buildNoContentError(choice, data));
    }

    return {
      content,
      finishReason: choice?.finish_reason,
      usage: normalizeUsage(data.usage),
    };
  }

  async *generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    if (!isRuntimeLLMStreamingSupported()) {
      // The transport can't stream (e.g. a buffering native bridge): return the
      // whole completion as one chunk instead of relying on SSE.
      const result = await this.generate(messages, options);
      yield { content: result.content, done: true, finishReason: result.finishReason, usage: result.usage };
      return;
    }

    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;
    const requestStreamUsage = STREAM_USAGE_PROVIDERS.has(this.config.provider);
    const timeoutMs = typeof this.config.timeout === 'number' ? this.config.timeout : 120000;
    const requestUrl = this.config.baseUrl + '/chat/completions';

    const sendRequest = (includeUsage: boolean) =>
      this.fetchWithTimeout(
        requestUrl,
        {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: true,
            ...(includeUsage ? { stream_options: { include_usage: true } } : {}),
            ...this.buildExtraParams(options),
          }),
        },
        options?.signal,
      );

    let response = await sendRequest(requestStreamUsage);

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);

      if (requestStreamUsage && response.status === 400 && /stream_options/i.test(error)) {
        // Some OpenAI-compatible servers reject the usage parameter outright.
        // Retry once without it so streaming still works there.
        response = await sendRequest(false);
        if (!response.ok) {
          throw new Error(await this.parseErrorResponse(response));
        }
      } else {
        throw new Error(error);
      }
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const responseStatus = response.status;
    const responseContentType = response.headers.get('content-type') ?? '(none)';

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamUsage: TokenUsage | undefined;

    // `fetchWithTimeout` only guards the response *headers* — once they arrive its
    // timer is cleared, so a provider that accepts the connection and then stalls
    // (or buffers the whole answer) would leave the read below hanging forever.
    // Guard the body read with an inactivity timer that cancels the reader when no
    // real SSE `data:` event arrives for `timeoutMs` — provider keepalive comment
    // lines (e.g. `: OPENROUTER PROCESSING`) deliberately do NOT count as progress,
    // so a queued/stalled model still times out instead of spinning forever.
    let inactivityId: ReturnType<typeof setTimeout> | null = null;
    let stalled = false;
    let sseEventCount = 0;
    let bytesReceived = 0;
    let sawReasoning = false;
    let previewBytes = '';
    const armInactivity = () => {
      if (inactivityId !== null) {
        clearTimeout(inactivityId);
      }
      if (timeoutMs > 0) {
        inactivityId = setTimeout(() => {
          stalled = true;
          void reader.cancel().catch(() => {});
        }, timeoutMs);
      }
    };

    try {
      armInactivity();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bytesReceived += value.byteLength;
        const decoded = decoder.decode(value, { stream: true });
        buffer += decoded;
        if (previewBytes.length < 200) {
          previewBytes = (previewBytes + decoded).slice(0, 200);
        }
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          // SSE allows one optional space after `data:`; tolerate providers that
          // omit it, since their events are otherwise silently dropped.
          if (line.startsWith('data:')) {
            sseEventCount += 1;
            const dataStr = line.slice(5).trimStart();
            if (dataStr.trim() === '[DONE]') {
              yield { content: '', done: true, ...(streamUsage ? { usage: streamUsage } : {}) };
              return;
            }

            try {
              const data = JSON.parse(dataStr) as OpenAICompatChatCompletionResponse;
              // With usage-enabled streaming the final data chunk carries
              // `usage` and empty `choices`; capture it so it can ride the
              // DONE chunk.
              const chunkUsage = normalizeUsage(data.usage);
              if (chunkUsage) {
                streamUsage = chunkUsage;
              }
              const choice = data.choices?.[0];
              const delta = choice?.delta;
              if (typeof delta?.reasoning === 'string' || typeof delta?.reasoning_content === 'string') {
                sawReasoning = true;
              }
              const content = extractChoiceDeltaContent(choice);
              if (content) {
                // Only displayable output counts as progress. Keepalive comments,
                // empty heartbeat deltas, and reasoning-only events (which this
                // parser intentionally ignores) must NOT keep a stalled stream alive.
                armInactivity();
                yield { content, done: false };
              }
              if (choice?.delta?.tool_calls) {
                armInactivity();
                yield { content: JSON.stringify({ tool_calls: choice.delta.tool_calls }), done: false };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      if (stalled) {
        if (bytesReceived === 0) {
          // The transport accepted the request but streamed literally nothing — that
          // is a non-streaming bridge (e.g. a native HTTP plugin that buffers the
          // whole body), not a slow model. Re-run it as a normal completion so the
          // response still arrives instead of surfacing a timeout.
          const fallback = await this.generate(messages, options);
          yield {
            content: fallback.content,
            done: true,
            finishReason: fallback.finishReason,
            usage: fallback.usage,
          };
          return;
        }

        const kb = (bytesReceived / 1024).toFixed(1);
        const preview = previewBytes
          ? ` First bytes: ${JSON.stringify(previewBytes.replace(/\s+/g, ' ').trim().slice(0, 140))}`
          : ' No bytes were received.';
        const hint = sawReasoning
          ? ' The model streamed reasoning tokens but no answer text — choose a non-reasoning model or another provider.'
          : '';
        throw new Error(
          `Request timed out after ${Math.round(timeoutMs / 1000)}s with no displayable output ` +
            `(${sseEventCount} SSE event${sseEventCount === 1 ? '' : 's'}, ${kb} KB, HTTP ${responseStatus}, ` +
            `content-type "${responseContentType}").${preview} POST ${requestUrl}${hint}`,
        );
      }
    } finally {
      if (inactivityId !== null) {
        clearTimeout(inactivityId);
      }
      reader.releaseLock();
    }
  }

  async testConnection(): Promise<LLMConnectionTestResult> {
    const start = performance.now();

    try {
      const response = await this.fetchWithTimeout(this.config.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
          stream: false,
        }),
      });

      const latency = performance.now() - start;

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        return {
          success: false,
          error,
          modelInfo: {
            name: this.config.model,
          },
        };
      }

      return {
        success: true,
        latencyMs: Math.round(latency),
        modelInfo: {
          name: this.config.model,
        },
      };
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Unknown error';
      const networkish = /fetch|network|econnrefused|failed/i.test(raw);
      let error = raw;
      if (networkish) {
        error = this.isLocalEndpoint()
          ? `Could not reach the local model server at ${this.config.baseUrl}. Is it running (e.g. \`ollama serve\`), and does OLLAMA_ORIGINS=* allow this app's origin?`
          : `Could not reach ${this.config.baseUrl}. Check your network — browser privacy shields commonly block provider requests.`;
      }
      return {
        success: false,
        error,
        modelInfo: {
          name: this.config.model,
        },
      };
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const baseUrl = this.config.baseUrl || ProviderEndpoints[this.config.provider];

    // A custom base URL is usually a self-hosted proxy that authenticates with its
    // own key instead of the provider key.
    const proxyToken = this.config.baseUrl ? this.config.proxyKey : undefined;
    const rawToken = proxyToken || this.config.apiKey;
    const authToken = rawToken ? normalizeApiKeyValue(rawToken) : undefined;

    if (authToken) {
      if (isInvalidApiKeyValue(authToken)) {
        throw new Error('Configured API key is invalid or corrupted. Re-enter it in Settings and try again.');
      }

      headers['Authorization'] = 'Bearer ' + authToken;
    }

    // OpenRouter-specific headers
    if (baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'https://github.com/maeveoffae/eidolon-simulacra';
      headers['X-OpenRouter-Title'] = 'Eidolon Simulacra';
    }

    return headers;
  }

  private buildExtraParams(options?: GenerateOptions | StreamGenerateOptions): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    if (options?.topP !== undefined) params.top_p = options.topP;
    if (options?.frequencyPenalty !== undefined) params.frequency_penalty = options.frequencyPenalty;
    if (options?.presencePenalty !== undefined) params.presence_penalty = options.presencePenalty;

    return params;
  }

  /** True when the configured base URL targets a loopback server (local Ollama etc.). */
  private isLocalEndpoint(): boolean {
    return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(this.config.baseUrl || '');
  }

  private async parseErrorResponse(response: Response): Promise<string> {
    // Local endpoints answer origin-refusals (non-localhost app origins without
    // OLLAMA_ORIGINS) with a bare 403 — say how to fix it instead of echoing an
    // unparseable body.
    if (response.status === 403 && this.isLocalEndpoint()) {
      return 'The local server refused this app origin (HTTP 403). Restart it with its origins allowed (for Ollama: OLLAMA_ORIGINS=*) and try again.';
    }

    let message: string;

    try {
      const data = (await response.json()) as OpenAICompatErrorResponse;
      if (typeof data.error === 'object' && data.error?.message) {
        message = data.error.message;
      } else if (data.error) {
        message = String(data.error);
      } else {
        message = 'HTTP ' + response.status;
      }
    } catch {
      message = 'HTTP ' + response.status;
    }

    return this.withAuthRemedy(message, response.status);
  }

  /**
   * A missing or rejected key produces a terse, sometimes misleading body —
   * OpenRouter answers every bad key with `User not found.`, which reads like an
   * account/attachment problem instead of an auth failure. Naming the provider and
   * the remedy keeps 401/403 answers actionable.
   */
  private withAuthRemedy(message: string, status: number): string {
    if (status !== 401 && status !== 403) {
      return message;
    }

    const label =
      this.config.provider === 'custom'
        ? `the custom endpoint${this.config.baseUrl ? ` at ${this.config.baseUrl}` : ''}`
        : `provider "${this.config.provider}"`;
    const hasKey = Boolean(this.config.apiKey || (this.config.baseUrl && this.config.proxyKey));
    const remedy = hasKey
      ? 'the configured API key was rejected (invalid, expired, or revoked) — re-enter it in Settings'
      : 'no API key is configured for this provider — add one in Settings';
    const detail = message === 'HTTP ' + status ? 'The provider rejected the request' : message;

    return `${detail} (HTTP ${status}) — ${label}: ${remedy}.`;
  }
}

/**
 * The models URL for a provider. Anthropic's Models API is `/v1/models` on a
 * base URL of `https://api.anthropic.com` (no `/v1`); every other provider
 * serves `${base}/models`.
 */
export function providerModelsUrl(provider: LLMProvider, baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (provider === 'anthropic' && !trimmed.endsWith('/v1')) {
    return `${trimmed}/v1/models`;
  }
  return `${trimmed}/models`;
}

/** One model entry as normalized by `normalizeModelsPayload`. */
export interface NormalizedModelEntry {
  id: string;
  name?: string;
  context_length?: number;
  input_modalities?: string[];
  supported_parameters?: string[];
}

/**
 * Normalize the two models-list payload shapes:
 *  - OpenAI-compatible `{ data: [{ id, context_length, ... }] }`
 *  - Google Gemini `{ models: [{ name: "models/x", inputTokenLimit, ... }] }`
 */
export function normalizeModelsPayload(payload: unknown): NormalizedModelEntry[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
      .filter((entry) => typeof entry.id === 'string')
      .map((entry) => {
        const architecture = entry.architecture as { input_modalities?: unknown } | undefined;
        const normalized: NormalizedModelEntry = { id: entry.id as string };
        if (typeof entry.name === 'string') normalized.name = entry.name;
        if (typeof entry.context_length === 'number') normalized.context_length = entry.context_length;
        if (Array.isArray(architecture?.input_modalities)) {
          normalized.input_modalities = architecture.input_modalities as string[];
        }
        if (Array.isArray(entry.supported_parameters)) {
          normalized.supported_parameters = entry.supported_parameters as string[];
        }
        return normalized;
      });
  }

  if (Array.isArray(record.models)) {
    return record.models
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
      .map((entry) => {
        const rawName = typeof entry.name === 'string' ? entry.name : '';
        if (rawName.length === 0) {
          return null;
        }
        const normalized: NormalizedModelEntry = {
          id: rawName.startsWith('models/') ? rawName.slice('models/'.length) : rawName,
        };
        if (typeof entry.displayName === 'string') normalized.name = entry.displayName;
        if (typeof entry.inputTokenLimit === 'number') normalized.context_length = entry.inputTokenLimit;
        return normalized;
      })
      .filter((entry): entry is NormalizedModelEntry => entry !== null);
  }

  return [];
}

/**
 * List available models from a provider's OpenAI-compatible endpoint.
 *
 * `provider` selects the auth header and URL quirks: Anthropic's Models API
 * lives at `/v1/models` on a base URL that has no `/v1`, and Google authenticates
 * with `x-goog-api-key` and answers with a `models[]` payload instead of `data[]`.
 */
export async function listModels(
  baseUrl: string,
  apiKey?: string,
  provider: LLMProvider = 'openai',
): Promise<string[]> {
  const headers = buildProviderHeaders(provider, apiKey);
  const response = await fetch(providerModelsUrl(provider, baseUrl), {
    method: 'GET',
    headers,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Failed to list models: HTTP ' + response.status);
  }

  const responseJson = await response.json();
  return normalizeModelsPayload(responseJson)
    .map((model) => model.id)
    .sort();
}
