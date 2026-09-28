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

  abstract generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult>;

  async *generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    const result = await this.generate(messages, options);
    yield {
      content: result.content,
      done: true,
      finishReason: result.finishReason,
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

  protected getFetchOptions(signal?: AbortSignal): RequestInit {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
    });

    const combinedSignal = signal ? anySignal([signal, controller.signal]) : controller.signal;

    return {
      signal: combinedSignal as AbortSignal,
    };
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
