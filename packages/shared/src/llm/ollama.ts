/**
 * Ollama engine (native API) — covers **both** Ollama deployments:
 *
 *  - **Ollama Cloud** (default): https://ollama.com/api with
 *    `Authorization: Bearer OLLAMA_API_KEY` (docs.ollama.com/cloud).
 *  - **A local server**: set the base URL to http://localhost:11434/api (a bare
 *    `http://localhost:11434` or the older `/v1` value is normalized). Local
 *    servers are keyless, and a browser reaches one only when its origin is
 *    allowed (`OLLAMA_ORIGINS`).
 *
 * Talks to Ollama's own REST API — `POST {base}/chat`, `GET {base}/tags` — instead
 * of its OpenAI-compatible `/v1` surface (which keeps a different body, reply, and
 * model-listing shape). The native envelopes differ from OpenAI's too: generation
 * limits ride in an `options` object (`num_predict`, not `max_tokens`), the answer
 * arrives as `message.content`, usage is `prompt_eval_count`/`eval_count`, and
 * streaming is newline-delimited JSON rather than SSE `data:` events.
 */

import { BaseLLMEngine } from './base';
import { buildProviderHeaders } from './factory';
import { isRuntimeLLMStreamingSupported } from './transport';
import { ProviderEndpoints, isLoopbackUrl } from './types';
import type {
  GenerateOptions,
  GenerateResult,
  LLMChatMessage,
  LLMConfig,
  LLMConnectionTestResult,
  StreamChunk,
  StreamGenerateOptions,
  TokenUsage,
} from './types';

/** One `/chat` reply — also one NDJSON line of a streamed reply. */
interface OllamaChatResponse {
  message?: { role?: string; content?: string; tool_calls?: unknown[] };
  done?: boolean;
  done_reason?: string;
  prompt_eval_count?: number;
  eval_count?: number;
  /** Ollama reports failures as `{ "error": "..." }`. */
  error?: unknown;
}

/**
 * Ollama Cloud's native API. Read from `ProviderEndpoints` rather than a second
 * literal so the factory default, the endpoint table, and this engine's own
 * fallback cannot drift apart (they did once: a stray edit left this constant on
 * the OpenAI-compatible `/v1` host, which serves a different body shape entirely).
 * A local server serves the same native API from http://localhost:11434/api.
 */
const DEFAULT_OLLAMA_BASE_URL = ProviderEndpoints.ollama;

/**
 * The native API lives under `/api`, so accept the shapes users type and the ones
 * older builds stored:
 *  - a bare host — `http://localhost:11434` (the Ollama server root serves its web
 *    UI, not the API) or `https://ollama.com`;
 *  - the OpenAI-compatible `/v1` path, which was this app's local Ollama default
 *    before the engine spoke the native API (same server, different surface);
 *  - an explicit `/api`.
 * Anything else — a relay mounted on another path — is left untouched.
 */
function normalizeOllamaBaseUrl(value: string | undefined): string {
  const trimmed = (value?.trim() || DEFAULT_OLLAMA_BASE_URL).replace(/\/+$/, '');

  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  if (trimmed.endsWith('/v1')) {
    return `${trimmed.slice(0, -'/v1'.length)}/api`;
  }

  // A bare host carries no path of its own; anything with one is a deliberate gateway.
  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  return withoutScheme.includes('/') ? trimmed : `${trimmed}/api`;
}

export class OllamaEngine extends BaseLLMEngine {
  private baseUrl: string;

  constructor(config: LLMConfig) {
    super(config);
    // Accepts the cloud default, a local server (`http://localhost:11434`), the
    // older `/v1` value, or a relay — see `normalizeOllamaBaseUrl`.
    this.baseUrl = normalizeOllamaBaseUrl(config.baseUrl);
  }

  private getHeaders(): Record<string, string> {
    return buildProviderHeaders('ollama', this.config.apiKey, {
      contentType: 'application/json',
    });
  }

  /**
   * The native `/chat` body. Generation limits ride in `options` under Ollama's
   * own names — the endpoint ignores OpenAI's `max_tokens` sibling.
   */
  private buildBody(messages: LLMChatMessage[], options: GenerateOptions, stream: boolean): Record<string, unknown> {
    const nativeOptions: Record<string, unknown> = {};

    if (options.temperature !== undefined) nativeOptions.temperature = options.temperature;
    if (options.maxTokens !== undefined) nativeOptions.num_predict = options.maxTokens;
    if (options.topP !== undefined) nativeOptions.top_p = options.topP;
    if (options.frequencyPenalty !== undefined) nativeOptions.frequency_penalty = options.frequencyPenalty;
    if (options.presencePenalty !== undefined) nativeOptions.presence_penalty = options.presencePenalty;

    return {
      model: this.config.model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream,
      ...(Object.keys(nativeOptions).length > 0 ? { options: nativeOptions } : {}),
    };
  }

  /** `prompt_eval_count`/`eval_count` are Ollama's token counters. */
  private usageOf(data: OllamaChatResponse): TokenUsage | undefined {
    if (data.prompt_eval_count === undefined && data.eval_count === undefined) {
      return undefined;
    }

    const promptTokens = data.prompt_eval_count ?? 0;
    const completionTokens = data.eval_count ?? 0;
    return { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens };
  }

  private buildNoContentError(data: OllamaChatResponse): string {
    if (data.done_reason === 'length') {
      return 'Ollama exhausted its output budget before producing visible text. Increase max tokens or choose a different model.';
    }

    // Tool-capable cloud models (glm, kimi, gpt-oss, deepseek) can answer with a
    // tool call and no text; this app never sends tools, so name the mismatch.
    if (Array.isArray(data.message?.tool_calls) && data.message.tool_calls.length > 0) {
      return 'Ollama returned tool calls instead of displayable text. Choose a different model for plain-text responses.';
    }

    return 'Ollama returned no displayable text. Try a different model or increase max tokens.';
  }

  /**
   * `POST /chat` with the native body, turning transport failures into the
   * guidance below: a bare `Failed to fetch` names neither the endpoint nor the
   * cause, and in a browser that failure is usually ollama.com's missing CORS
   * headers rather than a broken network.
   */
  private async postChat(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
    try {
      return await this.performFetch(`${this.baseUrl}/chat`, {
        ...this.getFetchOptions(signal),
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new Error(this.describeRequestFailure(error));
    }
  }

  async generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    const opts = this.mergeOptions(options);
    const response = await this.postChat(this.buildBody(messages, opts, false), options?.signal);

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = typeof data.message?.content === 'string' ? data.message.content.trim() : '';
    if (!content) {
      throw new Error(this.buildNoContentError(data));
    }

    return {
      content,
      finishReason: data.done_reason,
      usage: this.usageOf(data),
    };
  }

  async *generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    if (!isRuntimeLLMStreamingSupported()) {
      yield* this.streamAsSingleChunk(messages, options);
      return;
    }

    const opts = this.mergeOptions(options);
    const timeoutMs = this.getRequestTimeoutMs();

    const response = await this.postChat(this.buildBody(messages, opts, true), options?.signal);

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        // An inactivity deadline: the request deadline above only covers the
        // response headers, so a stream that stops delivering bytes would
        // otherwise leave the generator pending forever with no output.
        const { done, value } = await this.readStreamChunk(reader, timeoutMs);
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let data: OllamaChatResponse;
          try {
            // Ollama streams one JSON object per line — no `data:` prefix.
            data = JSON.parse(trimmed) as OllamaChatResponse;
          } catch {
            // Skip partial or non-JSON lines.
            continue;
          }

          if (data.error !== undefined) {
            throw new Error(typeof data.error === 'string' ? data.error : 'Ollama stream failed');
          }

          const content = typeof data.message?.content === 'string' ? data.message.content : '';
          if (content) {
            yield { content, done: false };
          }

          if (data.done) {
            // The final line carries the token counts and the stop reason.
            const usage = this.usageOf(data);
            yield {
              content: '',
              done: true,
              finishReason: data.done_reason,
              ...(usage ? { usage } : {}),
            };
            return;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async testConnection(): Promise<LLMConnectionTestResult> {
    const startTime = performance.now();

    try {
      const response = await this.postChat({
        model: this.config.model,
        messages: [{ role: 'user', content: 'test' }],
        stream: false,
        options: { num_predict: 1 },
      });

      const latencyMs = performance.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          latencyMs,
          error: await this.parseError(response),
        };
      }

      return {
        success: true,
        latencyMs,
        modelInfo: { name: this.config.model },
      };
    } catch (error) {
      return {
        success: false,
        // `postChat` already replaced bare transport errors with the guidance.
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /** True when the configured base URL targets a loopback server (local Ollama). */
  private isLocalEndpoint(): boolean {
    return isLoopbackUrl(this.baseUrl);
  }

  /**
   * A blocked or offline request surfaces as a bare `Failed to fetch`; name the
   * endpoint and the cause instead. A local server normally refuses the app
   * origin (a bare 403 without `OLLAMA_ORIGINS`), while ollama.com never answers
   * a browser at all: it sends no CORS headers, so it is only reachable through
   * the desktop app's native transport, a relay, or a locally signed-in server.
   */
  private describeRequestFailure(error: unknown): string {
    const raw = error instanceof Error ? error.message : 'Unknown error';
    if (!/fetch|network|econnrefused|failed/i.test(raw)) {
      return raw;
    }

    return isLoopbackUrl(this.baseUrl)
      ? `Could not reach the local model server at ${this.baseUrl}. Is it running (e.g. \`ollama serve\`), and does OLLAMA_ORIGINS=* allow this app's origin?`
      : `Could not reach ${this.baseUrl}. Browsers cannot call Ollama Cloud directly — ollama.com sends no CORS headers, so use the desktop app, a relay behind the Custom provider, or a locally signed-in server. Otherwise check your network and browser privacy shields.`;
  }

  private async parseError(response: Response): Promise<string> {
    if (response.status === 403 && this.isLocalEndpoint()) {
      return 'The local server refused this app origin (HTTP 403). Restart it with its origins allowed (for Ollama: OLLAMA_ORIGINS=*) and try again.';
    }

    let message = `HTTP ${response.status}`;

    try {
      const data = (await response.json()) as OllamaChatResponse & { error?: unknown };
      // Ollama answers a bad request or an unknown model with a plain string;
      // gateways in front of it may nest the same text under `error.message`.
      if (typeof data.error === 'string' && data.error.trim()) {
        message = data.error;
      } else if (data.error && typeof data.error === 'object') {
        const nested = (data.error as { message?: unknown }).message;
        if (typeof nested === 'string' && nested.trim()) {
          message = nested;
        }
      }
    } catch {
      // Keep the HTTP status fallback.
    }

    const remedy = this.remedyFor(response.status);
    return remedy ? `${message} (HTTP ${response.status}) — provider "ollama": ${remedy}.` : message;
  }

  /**
   * Status guidance from docs.ollama.com/api/errors (400 bad request, 404 unknown
   * model, 429 rate limit, 500/502 server-or-cloud-model failures). Only the codes
   * the user can act on get a suffix; the rest keep the provider's own message.
   * Ollama API keys never expire (docs.ollama.com/api/authentication), so a
   * rejected key is invalid or revoked.
   */
  private remedyFor(status: number): string | undefined {
    switch (status) {
      case 401:
      case 403:
        return this.config.apiKey
          ? 'the configured OLLAMA_API_KEY was rejected (invalid or revoked) — re-enter it in Settings'
          : 'no OLLAMA_API_KEY is configured — add one in Settings';
      case 404:
        return this.isLocalEndpoint()
          ? 'the model is not installed on this server — check `ollama list` or pull it first'
          : `the model must match a name from GET ${this.baseUrl}/tags exactly (e.g. "gemma4:31b", not "gemma4")`;
      case 429:
        return 'Ollama Cloud rate limit or plan quota reached — wait and retry, or use a smaller model';
      case 502:
        return 'Ollama Cloud could not reach the model — retry, or choose another model';
      default:
        return undefined;
    }
  }
}
