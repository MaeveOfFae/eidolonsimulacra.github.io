/**
 * Google Gemini LLM Engine
 * Handles Google's Generative AI API
 */

import { BaseLLMEngine } from './base.js';
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

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
  finishMessage?: string;
}

interface GeminiPromptFeedback {
  blockReason?: string;
  blockReasonMessage?: string;
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
  usageMetadata?: GeminiUsageMetadata;
  modelVersion?: string;
}

interface GeminiStreamResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
  usageMetadata?: GeminiUsageMetadata;
}

const ROLE_MAP: Record<string, string> = {
  system: 'user',
  user: 'user',
  assistant: 'model',
};

export class GoogleEngine extends BaseLLMEngine {
  private baseUrl: string;

  constructor(config: LLMConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  private getHeaders(): Record<string, string> {
    return buildProviderHeaders('google', this.config.apiKey, {
      contentType: 'application/json',
    });
  }

  private formatMessages(messages: ChatMessage[]): GeminiContent[] {
    const contents: GeminiContent[] = [];
    let systemPrompt = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        contents.push({
          role: ROLE_MAP[msg.role] || msg.role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add system instruction to first user message or prepend as first content
    if (systemPrompt && contents.length > 0) {
      contents[0].parts[0].text = systemPrompt + '\n\n' + contents[0].parts[0].text;
    } else if (systemPrompt) {
      contents.unshift({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
    }

    return contents;
  }

  private extractCandidateText(candidate?: GeminiCandidate): string {
    if (!candidate?.content?.parts) {
      return '';
    }

    return candidate.content.parts
      .filter((part) => part.thought !== true)
      .map((part) => part.text || '')
      .join('');
  }

  private buildNoContentError(response: GeminiResponse, candidate?: GeminiCandidate): string {
    const blockReason = response.promptFeedback?.blockReason?.trim();
    const blockReasonMessage = response.promptFeedback?.blockReasonMessage?.trim();
    if (blockReason) {
      return blockReasonMessage
        ? `Gemini blocked the prompt (${blockReason}): ${blockReasonMessage}`
        : `Gemini blocked the prompt (${blockReason}).`;
    }

    switch (candidate?.finishReason) {
      case 'MAX_TOKENS':
        return 'Gemini exhausted its output budget before producing visible text. Increase max tokens or choose a different model.';
      case 'SAFETY':
        return 'Gemini blocked the response with safety filters.';
      case 'RECITATION':
        return 'Gemini blocked the response because it appears too close to copyrighted material.';
      case 'LANGUAGE':
        return 'Gemini rejected the response because of an unsupported language.';
      case 'UNEXPECTED_TOOL_CALL':
      case 'TOO_MANY_TOOL_CALLS':
      case 'MALFORMED_FUNCTION_CALL':
        return 'Gemini returned tool or function-call output instead of plain text.';
      case 'MALFORMED_RESPONSE':
        return 'Gemini returned a malformed response.';
      default:
        if (candidate?.finishMessage?.trim()) {
          return `Gemini returned no displayable text: ${candidate.finishMessage.trim()}`;
        }

        return 'Gemini returned no displayable text. Try a different model or increase max tokens.';
    }
  }

  private async callEndpoint(endpoint: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.performFetch(url, {
      ...this.getFetchOptions(signal),
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async generate(messages: ChatMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    const opts = this.mergeOptions(options);

    const endpoint = `/models/${this.config.model}:generateContent`;
    const body = {
      contents: this.formatMessages(messages),
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
        topP: opts.topP,
      },
    };

    const response = await this.callEndpoint(endpoint, body, options?.signal);

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new Error(error);
    }

    const data: GeminiResponse = await response.json();

    const candidate = data.candidates?.[0];
    const content = this.extractCandidateText(candidate).trim();
    if (!content) {
      throw new Error(this.buildNoContentError(data, candidate));
    }

    return {
      content,
      finishReason: candidate?.finishReason,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }

  async *generateStream(messages: ChatMessage[], options?: StreamGenerateOptions): AsyncIterable<StreamChunk> {
    const opts = this.mergeOptions(options);

    const endpoint = `/models/${this.config.model}:streamGenerateContent`;
    const body = {
      contents: this.formatMessages(messages),
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
        topP: opts.topP,
      },
    };

    const response = await this.callEndpoint(endpoint, body, options?.signal);

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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmed.slice(6);
            const data: GeminiStreamResponse = JSON.parse(jsonStr);

            const candidate = data.candidates?.[0];
            if (!candidate) continue;

            const text = this.extractCandidateText(candidate);
            if (text) {
              yield {
                content: text,
                done: false,
              };
            }

            if (candidate.finishReason) {
              yield {
                content: '',
                done: true,
                finishReason: candidate.finishReason,
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
    const startTime = performance.now();

    try {
      const endpoint = `/models/${this.config.model}:generateContent`;
      const body = {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'test' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1,
        },
      };

      const response = await this.callEndpoint(endpoint, body);

      const latency_ms = performance.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          latency_ms,
          error: await this.parseError(response),
        };
      }

      return {
        success: true,
        latency_ms,
        model_info: {
          name: this.config.model,
        },
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
      const data: { error?: { message?: string; status?: string } } = await response.json();
      return data.error?.message || data.error?.status || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}
