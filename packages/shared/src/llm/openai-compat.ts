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
  StreamGenerateOptions,
  LLMConnectionTestResult,
  LLMProvider,
} from "./types";
import { ProviderEndpoints } from './types';

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
  };
}

interface OpenAICompatChatCompletionResponse {
  choices?: OpenAICompatChoice[];
  output_text?: unknown;
  error?: { message?: string } | string;
  usage?: OpenAICompatUsage;
}

interface OpenAICompatModelSummary {
  id: string;
}

interface OpenAICompatModelsResponse {
  data?: OpenAICompatModelSummary[] | null;
}

function isDisplayContentRecord(record: Record<string, unknown>): boolean {
  const partType = typeof record.type === 'string' ? record.type : undefined;

  if (!partType) {
    return true;
  }

  return partType === 'text'
    || partType === 'text_delta'
    || partType === 'output_text'
    || partType === 'output_text_delta';
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
  response?: OpenAICompatChatCompletionResponse
): string {
  return extractTextValue(
    choice?.message?.content
    ?? choice?.message?.output_text
    ?? choice?.message?.parts
    ?? choice?.text
    ?? response?.output_text
  );
}

function extractChoiceDeltaContent(choice?: OpenAICompatChoice): string {
  return extractTextValue(
    choice?.delta?.content
    ?? choice?.delta?.output_text
    ?? choice?.delta?.parts
    ?? choice?.text
  );
}

function buildNoContentError(
  choice?: OpenAICompatChoice,
  response?: OpenAICompatChatCompletionResponse
): string {
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

function normalizeUsage(
  usage?: OpenAICompatUsage
): GenerateResult['usage'] {
  if (
    usage?.prompt_tokens === undefined ||
    usage.completion_tokens === undefined ||
    usage.total_tokens === undefined
  ) {
    return undefined;
  }

  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}

export interface OpenAICompatConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
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

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    signal?: AbortSignal
  ): Promise<Response> {
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

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, timeoutMs);
    }

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
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

  async generate(
    messages: LLMChatMessage[],
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;

    const response = await this.fetchWithTimeout(this.config.baseUrl + "/chat/completions", {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        ...(this.buildExtraParams(options)),
      }),
    }, options?.signal);

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

  async *generateStream(
    messages: LLMChatMessage[],
    options?: StreamGenerateOptions
  ): AsyncIterable<StreamChunk> {
    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;

    const response = await this.fetchWithTimeout(this.config.baseUrl + "/chat/completions", {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
        ...(this.buildExtraParams(options)),
      }),
    }, options?.signal);

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw new Error(error);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr.trim() === "[DONE]") {
              yield { content: "", done: true };
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              const choice = data.choices?.[0] as OpenAICompatChoice | undefined;
              const content = extractChoiceDeltaContent(choice);
              if (content) {
                yield { content, done: false };
              }
              if (choice?.delta?.tool_calls) {
                yield { content: JSON.stringify({ tool_calls: choice.delta.tool_calls }), done: false };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async testConnection(): Promise<LLMConnectionTestResult> {
    const start = performance.now();

    try {
      const response = await this.fetchWithTimeout(this.config.baseUrl + "/chat/completions", {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: "user", content: "test" }],
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
      return {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
        modelInfo: {
          name: this.config.model,
        },
      };
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const baseUrl = this.config.baseUrl || ProviderEndpoints[this.config.provider];

    if (this.config.apiKey) {
      headers["Authorization"] = "Bearer " + this.config.apiKey;
    }

    // OpenRouter-specific headers
    if (baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = "https://github.com/maeveoffae/eidolon-simulacra";
      headers["X-OpenRouter-Title"] = "Eidolon Simulacra";
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

  private async parseErrorResponse(response: Response): Promise<string> {
    try {
      const data = await response.json() as OpenAICompatErrorResponse;
      if (typeof data.error === 'object' && data.error?.message) {
        return data.error.message;
      }
      if (data.error) {
        return String(data.error);
      }
      return "HTTP " + response.status;
    } catch {
      return "HTTP " + response.status;
    }
  }
}

/**
 * List available models from an OpenAI-compatible API endpoint.
 */
export async function listModels(baseUrl: string, apiKey?: string): Promise<string[]> {
  const headers: Record<string, string> = {};

  if (apiKey) {
    headers["Authorization"] = "Bearer " + apiKey;
  }

  // OpenRouter-specific headers
  if (baseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://github.com/maeveoffae/eidolon-simulacra";
    headers["X-OpenRouter-Title"] = "Eidolon Simulacra";
  }

  const response = await fetch(baseUrl + "/models", {
    method: "GET",
    headers,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to list models: HTTP " + response.status);
  }

  const responseJson = await response.json();
  const data = responseJson as OpenAICompatModelsResponse;
  const dataData = data.data;

  if (dataData && Array.isArray(dataData)) {
    return dataData.map((model) => model.id).sort();
  }

  return [];
}
