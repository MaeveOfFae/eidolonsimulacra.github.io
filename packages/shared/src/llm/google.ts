/**
 * Google Gemini LLM engine.
 */

import { BaseLLMEngine } from './base';
import { buildProviderHeaders } from './factory';
import type {
  GenerateOptions,
  GenerateResult,
  LLMChatMessage,
  LLMConfig,
  StreamChunk,
  StreamGenerateOptions,
  LLMConnectionTestResult,
} from './types';

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

  private formatMessages(messages: LLMChatMessage[]): GeminiContent[] {
    const contents: GeminiContent[] = [];
    let systemPrompt = '';

    for (const message of messages) {
      if (message.role === 'system') {
        systemPrompt = message.content;
      } else {
        contents.push({
          role: ROLE_MAP[message.role] || message.role,
          parts: [{ text: message.content }],
        });
      }
    }

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

  async generate(
    messages: LLMChatMessage[],
    options?: GenerateOptions
  ): Promise<GenerateResult> {
    const opts = this.mergeOptions(options);

    const response = await this.callEndpoint(`/models/${this.config.model}:generateContent`, {
      contents: this.formatMessages(messages),
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
        topP: opts.topP,
      },
    }, options?.signal);

    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    const data = await response.json() as GeminiResponse;
    const candidate = data.candidates?.[0];
    const content = this.extractCandidateText(candidate).trim();
    if (!content) {
      throw new Error(this.buildNoContentError(data, candidate));
    }

    return {
      content,
      finishReason: candidate?.finishReason,
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined,
    };
  }

  async *generateStream(
    messages: LLMChatMessage[],
    options?: StreamGenerateOptions
  ): AsyncIterable<StreamChunk> {
    const opts = this.mergeOptions(options);

    const response = await this.callEndpoint(`/models/${this.config.model}:streamGenerateContent`, {
      contents: this.formatMessages(messages),
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
        topP: opts.topP,
      },
    }, options?.signal);

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
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6)) as GeminiStreamResponse;
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
      const response = await this.callEndpoint(`/models/${this.config.model}:generateContent`, {
        contents: [{ role: 'user', parts: [{ text: 'test' }] }],
        generationConfig: { maxOutputTokens: 1 },
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
      const data = await response.json() as { error?: { message?: string; status?: string } };
      return data.error?.message || data.error?.status || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}