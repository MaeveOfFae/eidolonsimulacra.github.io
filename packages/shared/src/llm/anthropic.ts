/**
 * Anthropic Claude LLM engine.
 */

import { BaseLLMEngine } from './base';
import { buildProviderHeaders } from './factory';
import { isRuntimeLLMStreamingSupported } from './transport';
import type {
  GenerateOptions,
  GenerateResult,
  LLMChatMessage,
  LLMConfig,
  StreamChunk,
  StreamGenerateOptions,
  LLMConnectionTestResult,
} from './types';

interface AnthropicMessage {
  role: string;
  content: string;
}

interface AnthropicDelta {
  type: string;
  text?: string;
  stop_reason?: string;
}

interface AnthropicStreamUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicEvent {
  type: string;
  delta?: AnthropicDelta;
  message?: {
    content: Array<{ type: string; text: string }>;
    stop_reason?: string;
    usage?: AnthropicStreamUsage;
  };
  /** Present on `message_delta` events; carries the final output token count. */
  usage?: AnthropicStreamUsage;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicErrorResponse {
  error?: {
    message?: string;
  };
}

export class AnthropicEngine extends BaseLLMEngine {
  private baseUrl: string;

  constructor(config: LLMConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com';
  }

  private getHeaders(): Record<string, string> {
    return buildProviderHeaders('anthropic', this.config.apiKey, {
      contentType: 'application/json',
    });
  }

  private formatMessages(messages: LLMChatMessage[]): AnthropicMessage[] {
    const formatted: AnthropicMessage[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        continue;
      }

      formatted.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      });
    }

    return formatted;
  }

  private getSystemPrompt(messages: LLMChatMessage[]): string | undefined {
    return messages.find((message) => message.role === 'system')?.content;
  }

  private extractResponseText(content: Array<{ type: string; text: string }>): string {
    return content
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('');
  }

  async generate(messages: LLMChatMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    const opts = this.mergeOptions(options);
    const system = this.getSystemPrompt(messages);
    const messagesFormatted = this.formatMessages(messages);

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messagesFormatted,
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature,
    };

    if (system) {
      body.system = system;
    }

    if (opts.topP !== undefined) {
      body.top_p = opts.topP;
    }

    const response = await this.performFetch(`${this.baseUrl}/v1/messages`, {
      ...this.getFetchOptions(options?.signal),
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    const data = (await response.json()) as AnthropicResponse;
    const content = this.extractResponseText(data.content);
    if (!content) {
      throw new Error('No text content in response');
    }

    return {
      content,
      finishReason: data.stop_reason || undefined,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async *generateStream(messages: LLMChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    if (!isRuntimeLLMStreamingSupported()) {
      yield* this.streamAsSingleChunk(messages, options);
      return;
    }

    const opts = this.mergeOptions(options);
    const system = this.getSystemPrompt(messages);
    const messagesFormatted = this.formatMessages(messages);

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messagesFormatted,
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature,
      stream: true,
    };

    if (system) {
      body.system = system;
    }

    if (opts.topP !== undefined) {
      body.top_p = opts.topP;
    }

    const response = await this.performFetch(`${this.baseUrl}/v1/messages`, {
      ...this.getFetchOptions(options?.signal),
      method: 'POST',
      headers: buildProviderHeaders('anthropic', this.config.apiKey, {
        contentType: 'application/json',
        accept: 'text/event-stream',
      }),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    const streamUsage = () =>
      inputTokens !== undefined || outputTokens !== undefined
        ? {
            promptTokens: inputTokens ?? 0,
            completionTokens: outputTokens ?? 0,
            totalTokens: (inputTokens ?? 0) + (outputTokens ?? 0),
          }
        : undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(trimmed.slice(6)) as AnthropicEvent;

            // Input tokens only arrive in `message_start`; keep them until the
            // final events so they can ride the done chunk.
            if (event.type === 'message_start' && event.message?.usage) {
              if (typeof event.message.usage.input_tokens === 'number') {
                inputTokens = event.message.usage.input_tokens;
              }
              if (typeof event.message.usage.output_tokens === 'number') {
                outputTokens = event.message.usage.output_tokens;
              }
            }

            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' && event.delta.text) {
              yield {
                content: event.delta.text,
                done: false,
              };
            }

            if (event.type === 'message_delta') {
              if (typeof event.usage?.output_tokens === 'number') {
                outputTokens = event.usage.output_tokens;
              }

              if (event.delta?.stop_reason) {
                const usage = streamUsage();
                yield {
                  content: '',
                  done: true,
                  finishReason: event.delta.stop_reason,
                  ...(usage ? { usage } : {}),
                };
              }
            }

            if (event.type === 'message_stop') {
              const usage = streamUsage();
              yield {
                content: '',
                done: true,
                ...(usage ? { usage } : {}),
              };
            }
          } catch {
            // Skip invalid lines.
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
      const response = await this.performFetch(`${this.baseUrl}/v1/messages`, {
        ...this.getFetchOptions(),
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1,
        }),
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async parseError(response: Response): Promise<string> {
    try {
      const data = (await response.json()) as AnthropicErrorResponse;
      return data.error?.message || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}
