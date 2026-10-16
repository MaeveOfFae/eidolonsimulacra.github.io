/**
 * Base LLM engine implementation shared across provider adapters.
 */

import type {
  GenerateOptions,
  GenerateResult,
  LLMConfig,
  LLMProvider,
  StreamChunk,
  StreamGenerateOptions,
  LLMChatMessage,
  LLMConnectionTestResult,
} from './types';
import { getRuntimeLLMFetch } from './transport';

/**
 * Request budget used when an engine is built without an explicit `timeout`.
 * Matches the OpenAI-compatible engine's documented default.
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = 120_000;

export abstract class BaseLLMEngine {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 180000,
      ...config,
    };
  }

  /** The request budget every deadline in this class is derived from. */
  protected getRequestTimeoutMs(): number {
    return typeof this.config.timeout === 'number' ? this.config.timeout : DEFAULT_REQUEST_TIMEOUT_MS;
  }

  /**
   * Run the transport call under a hard deadline.
   *
   * The deadline both aborts the request (so a cooperative transport frees the
   * socket) **and** rejects the race below: a transport that ignores the abort
   * signal — some native bridges do — would otherwise leave the request pending
   * forever, and the caller would sit on "Generating…" with no output and no
   * error. `OpenAICompatEngine.fetchWithTimeout` is the same shape on purpose.
   */
  protected async performFetch(input: string, init: RequestInit): Promise<Response> {
    const timeoutMs = this.getRequestTimeoutMs();
    const callerSignal = init.signal ?? undefined;
    const controller = new AbortController();
    const handleCallerAbort = () => controller.abort();

    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort();
      } else {
        callerSignal.addEventListener('abort', handleCallerAbort, { once: true });
      }
    }

    let didTimeout = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
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
        getRuntimeLLMFetch()(input, { ...init, signal: controller.signal }),
        timeoutRejection,
      ]);
    } catch (error) {
      if (didTimeout) {
        throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
      }

      throw this.normalizeRequestError(error);
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      callerSignal?.removeEventListener('abort', handleCallerAbort);
    }
  }

  /**
   * Read one chunk of a streaming body under an inactivity deadline.
   *
   * The request deadline only covers the response *headers*: once they arrive,
   * a provider that accepts the connection and then goes silent — or a bridge
   * that buffers the body and never forwards it — leaves `reader.read()`
   * pending forever, so the generator neither yields nor throws. Cancelling the
   * reader surfaces an ordinary error instead. `OpenAICompatEngine` keeps a
   * richer version of this guard (SSE-event diagnostics); this one covers the
   * Google and Anthropic readers.
   */
  protected async readStreamChunk(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    timeoutMs: number = this.getRequestTimeoutMs(),
  ): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (!(timeoutMs > 0)) {
      return reader.read();
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      return await Promise.race([
        reader.read(),
        new Promise<never>((_resolve, reject) => {
          timeoutId = setTimeout(() => {
            // Settle the race with the timeout *first*: cancelling the reader
            // resolves the pending read with `done`, which would otherwise let
            // the stream end silently instead of surfacing the stall.
            reject(
              new Error(
                `Request timed out after ${Math.round(
                  timeoutMs / 1000,
                )}s with no streamed output — the provider stopped sending. Try again, reduce the request size, or choose a faster model/provider.`,
              ),
            );
            void reader.cancel().catch(() => undefined);
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
  }

  abstract generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult>;

  async *generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    yield* this.streamAsSingleChunk(messages, options);
  }

  /**
   * Yield the whole completion as a single `done` chunk. Engines fall back to this
   * when the host transport cannot stream (see `isRuntimeLLMStreamingSupported`),
   * so a "streaming" call still completes instead of stalling.
   */
  protected async *streamAsSingleChunk(
    messages: LLMChatMessage[],
    options?: GenerateOptions,
  ): AsyncIterable<StreamChunk> {
    const result = await this.generate(messages, options);
    yield {
      content: result.content,
      done: true,
      finishReason: result.finishReason,
      usage: result.usage,
    };
  }

  abstract testConnection(): Promise<LLMConnectionTestResult>;

  getProvider(): LLMProvider {
    return this.config.provider;
  }

  getModel(): string {
    return this.config.model;
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  protected mergeOptions(options?: GenerateOptions): GenerateOptions {
    return {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      ...options,
    };
  }

  /**
   * Request init for a provider call: carries the caller's abort signal through
   * to `performFetch`, which owns the deadline (and re-derives the signal it
   * hands the transport, so callers keep spreading the result into their init).
   */
  protected getFetchOptions(signal?: AbortSignal): RequestInit {
    return { signal };
  }

  protected normalizeRequestError(error: unknown): Error {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Error(
        'The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider.',
      );
    }

    if (error instanceof Error && /operation was aborted/i.test(error.message)) {
      return new Error(
        'The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider.',
      );
    }

    return error instanceof Error ? error : new Error('Request failed');
  }
}
