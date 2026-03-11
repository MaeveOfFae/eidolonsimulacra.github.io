/**
 * Base LLM Engine Implementation
 * Base class for all provider-specific LLM engines
 */

import type {
  ChatMessage,
  ConnectionTestResult,
  GenerateOptions,
  GenerateResult,
  LLMConfig,
  StreamChunk,
  StreamGenerateOptions,
  LLMProvider,
} from '@char-gen/shared';

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

  protected async performFetch(input: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(input, init);
    } catch (error) {
      throw this.normalizeRequestError(error);
    }
  }

  /**
   * Generate a completion (non-streaming)
   */
  abstract generate(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<GenerateResult>;

  /**
   * Generate a completion with streaming
   */
  async *generateStream(
    messages: ChatMessage[],
    options?: StreamGenerateOptions
  ): AsyncIterable<StreamChunk> {
    // Default implementation: fall back to non-streaming and yield the result
    const result = await this.generate(messages, options);
    yield {
      content: result.content,
      done: true,
      finishReason: result.finishReason,
    };
  }

  /**
   * Test connection to the LLM provider
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Get the provider type
   */
  getProvider(): LLMProvider {
    return this.config.provider;
  }

  /**
   * Get the model name
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Get the API key
   */
  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Merge options with defaults
   */
  protected mergeOptions(options?: GenerateOptions): GenerateOptions {
    return {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      ...options,
    };
  }

  /**
   * Get fetch options with timeout
   */
  protected getFetchOptions(signal?: AbortSignal): RequestInit {
    const controller = new AbortController();

    // Combine user signal with timeout signal
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    // If user signal aborts, also abort timeout
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
    });

    // Combine signals
    const combinedSignal = signal
      ? anySignal([signal, controller.signal])
      : controller.signal;

    return {
      signal: combinedSignal as AbortSignal,
    };
  }

  protected normalizeRequestError(error: unknown): Error {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Error('The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider.');
    }

    if (error instanceof Error && /operation was aborted/i.test(error.message)) {
      return new Error('The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider.');
    }

    return error instanceof Error ? error : new Error('Request failed');
  }
}

/**
 * Create a combined abort signal that aborts when any input signal aborts
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}
