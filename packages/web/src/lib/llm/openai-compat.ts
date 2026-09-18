/**
 * OpenAI-Compatible LLM Engine
 * Handles OpenAI, OpenRouter, DeepSeek, Zai, and Moonshot APIs
 */

import {
  BaseLLMEngine,
} from './base.js';
import { buildProviderHeaders } from './factory.js';
import type {
  ChatMessage,
  ConnectionTestResult,
  GenerateOptions,
  GenerateResult,
  LLMConfig,
  StreamChunk,
  StreamGenerateOptions,
} from '@char-gen/shared';

interface OpenAIChoice {
  text?: unknown;
  error?: {
    message?: string;
  } | string;
  message?: {
    role: string;
    content?: unknown;
    output_text?: unknown;
    refusal?: unknown;
    parts?: unknown;
    tool_calls?: unknown[];
  };
  delta?: {
    content?: unknown;
    output_text?: unknown;
    refusal?: unknown;
    parts?: unknown;
    tool_calls?: unknown[];
  };
  finish_reason?: string;
}

interface OpenAIResponse {
  id?: string;
  choices: OpenAIChoice[];
  output_text?: unknown;
  error?: {
    message?: string;
  } | string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

interface OpenAIErrorResponse {
  error?: {
    message: string;
    type?: string;
  };
}

export class OpenAICompatEngine extends BaseLLMEngine {
  private baseUrl: string;

  constructor(config: LLMConfig) {
    super(config);
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();
  }

  private getDefaultBaseUrl(): string {
    switch (this.config.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'openrouter':
        return 'https://openrouter.ai/api/v1';
      case 'deepseek':
        return 'https://api.deepseek.com';
      case 'zai':
        return 'https://open.bigmodel.cn/api/paas/v4';
      case 'moonshot':
        return 'https://api.moonshot.cn/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  private getHeaders(): Record<string, string> {
    // If using a custom base URL with a proxy key, use the proxy key for auth
    if (this.config.baseUrl && this.config.proxyKey) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.proxyKey}`,
      };
    }

    // Ollama doesn't require authentication
    if (this.config.provider === 'ollama') {
      return {
        'Content-Type': 'application/json',
      };
    }

    return buildProviderHeaders(this.config.provider, this.config.apiKey, {
      contentType: 'application/json',
    });
  }

  private getStreamingHeaders(): Record<string, string> {
    return {
      ...this.getHeaders(),
      Accept: 'text/event-stream',
    };
  }

  private isDisplayContentRecord(record: Record<string, unknown>): boolean {
    const partType = typeof record.type === 'string' ? record.type : undefined;

    if (!partType) {
      return true;
    }

    return partType === 'text'
      || partType === 'text_delta'
      || partType === 'output_text'
      || partType === 'output_text_delta';
  }

  private extractTextValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => this.extractTextValue(entry)).join('');
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;

       if (!this.isDisplayContentRecord(record)) {
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
        return this.extractTextValue(record.parts);
      }

      if (typeof record.output_text === 'string') {
        return record.output_text;
      }

      if (Array.isArray(record.output_text)) {
        return this.extractTextValue(record.output_text);
      }

      if (typeof record.content === 'string') {
        return record.content;
      }

      if (Array.isArray(record.content)) {
        return this.extractTextValue(record.content);
      }

      if (typeof record.output === 'string') {
        return record.output;
      }

      if (Array.isArray(record.output)) {
        return this.extractTextValue(record.output);
      }
    }

    return '';
  }

  private extractChoiceMessageContent(choice?: OpenAIChoice, response?: OpenAIResponse): string {
    return this.extractTextValue(
      choice?.message?.content
      ?? choice?.message?.output_text
      ?? choice?.message?.parts
      ?? choice?.text
      ?? response?.output_text
    );
  }

  private extractChoiceDeltaContent(choice?: OpenAIChoice): string {
    return this.extractTextValue(
      choice?.delta?.content
      ?? choice?.delta?.output_text
      ?? choice?.delta?.parts
      ?? choice?.text
    );
  }

  private buildNoContentError(choice?: OpenAIChoice, response?: OpenAIResponse): string {
    const responseError = response?.error;
    if (typeof responseError === 'string' && responseError.trim()) {
      return responseError;
    }
    if (responseError && typeof responseError === 'object' && typeof responseError.message === 'string' && responseError.message.trim()) {
      return responseError.message;
    }

    const choiceError = choice?.error;
    if (typeof choiceError === 'string' && choiceError.trim()) {
      return choiceError;
    }
    if (choiceError && typeof choiceError === 'object' && typeof choiceError.message === 'string' && choiceError.message.trim()) {
      return choiceError.message;
    }

    const refusal = this.extractTextValue(choice?.message?.refusal ?? choice?.delta?.refusal);
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

  private isDirectBrowserOpenAIRequest(): boolean {
    if (typeof window === 'undefined' || this.config.provider !== 'openai') {
      return false;
    }

    try {
      return new URL(this.baseUrl).hostname === 'api.openai.com';
    } catch {
      return this.baseUrl.includes('api.openai.com');
    }
  }

  private assertBrowserSupported(): void {
    if (this.isDirectBrowserOpenAIRequest()) {
      throw new Error(
        'Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.'
      );
    }
  }

  private formatMessages(messages: ChatMessage[]): Array<{
    role: string;
    content: string;
  }> {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  async generate(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    this.assertBrowserSupported();
    const opts = this.mergeOptions(options);

    const response = await this.performFetch(`${this.baseUrl}/chat/completions`, {
      ...this.getFetchOptions(options?.signal),
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        frequency_penalty: opts.frequencyPenalty,
        presence_penalty: opts.presencePenalty,
      }),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const data: OpenAIResponse = await response.json();

    const choice = data.choices[0];
    const content = this.extractChoiceMessageContent(choice, data).trim();
    if (!content) {
      throw new Error(this.buildNoContentError(choice, data));
    }

    return {
      content,
      finishReason: choice.finish_reason,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  async *generateStream(
    messages: ChatMessage[],
    options?: StreamGenerateOptions
  ): AsyncIterable<StreamChunk> {
    this.assertBrowserSupported();
    const opts = this.mergeOptions(options);

    const response = await this.performFetch(`${this.baseUrl}/chat/completions`, {
      ...this.getFetchOptions(options?.signal),
      method: 'POST',
      headers: this.getStreamingHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        frequency_penalty: opts.frequencyPenalty,
        presence_penalty: opts.presencePenalty,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmed.slice(6);
            const data: OpenAIResponse = JSON.parse(jsonStr);

            const choice = data.choices[0];
            if (!choice) continue;

            const content = this.extractChoiceDeltaContent(choice);
            if (content) {
              yield {
                content,
                done: false,
              };
            }

            if (choice.finish_reason) {
              yield {
                content: '',
                done: true,
                finishReason: choice.finish_reason,
              };
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      this.assertBrowserSupported();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unsupported browser provider configuration',
      };
    }

    const startTime = performance.now();

    try {
      const response = await this.performFetch(`${this.baseUrl}/models`, {
        ...this.getFetchOptions(),
        method: 'GET',
        headers: this.getHeaders(),
      });

      const latency_ms = performance.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          latency_ms,
          error: await this.parseError(response),
        };
      }

      // Try to get model info
      try {
        const data: { data?: Array<{ id: string }>; object?: string } = await response.json();
        void data.data;

        return {
          success: true,
          latency_ms,
          model_info: {
            name: this.config.model,
            context_length: undefined, // Would need model-specific lookup
          },
        };
      } catch {
        return {
          success: true,
          latency_ms,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async parseError(response: Response): Promise<string> {
    try {
      const data: OpenAIErrorResponse = await response.json();
      return data.error?.message || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}
