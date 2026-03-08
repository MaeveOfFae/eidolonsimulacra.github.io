/**
 * API Client for Character Generator
 * Isomorphic - works in browser and Node.js
 */

import type {
  Config,
  Draft,
  DraftListResponse,
  DraftFilters,
  Template,
  CreateTemplateRequest,
  GenerateRequest,
  GenerationProgress,
  GenerationComplete,
  SimilarityRequest,
  SimilarityResult,
  OffspringRequest,
  ExportRequest,
  ConnectionTestRequest,
  ConnectionTestResult,
  ModelsResponse,
  ChatRequest,
  RefineRequest,
} from '../types';

export class CharacterGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText })) as { detail?: string };
      throw new APIError(response.status, errorData.detail || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Configuration
  // ===========================================================================

  async getConfig(): Promise<Config> {
    return this.request<Config>('/config');
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    return this.request<Config>('/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async testConnection(request: ConnectionTestRequest): Promise<ConnectionTestResult> {
    return this.request<ConnectionTestResult>('/config/test', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ===========================================================================
  // Models
  // ===========================================================================

  async getModels(provider: string, refresh: boolean = false): Promise<ModelsResponse> {
    const query = refresh ? '?refresh=true' : '';
    return this.request<ModelsResponse>(`/models/${provider}${query}`);
  }

  async refreshModels(provider: string): Promise<{ status: string; model_count: number; error?: string }> {
    return this.request<{ status: string; model_count: number; error?: string }>(`/models/${provider}/refresh`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // Templates
  // ===========================================================================

  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/templates');
  }

  async getTemplate(name: string): Promise<Template> {
    return this.request<Template>(`/templates/${encodeURIComponent(name)}`);
  }

  async createTemplate(template: CreateTemplateRequest): Promise<Template> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(name: string): Promise<void> {
    return this.request<void>(`/templates/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Generation (SSE Streaming)
  // ===========================================================================

  generate(request: GenerateRequest): GenerationStream {
    return new GenerationStream(
      `${this.baseUrl}/generate/single`,
      request
    );
  }

  generateBatch(seeds: string[], options: Omit<GenerateRequest, 'seed'> & { parallel?: boolean; max_concurrent?: number }): GenerationStream {
    return new GenerationStream(
      `${this.baseUrl}/generate/batch`,
      { seeds, ...options }
    );
  }

  // ===========================================================================
  // Drafts
  // ===========================================================================

  async getDrafts(filters?: DraftFilters): Promise<DraftListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.set(key, String(value));
          }
        }
      });
    }
    const query = params.toString();
    return this.request<DraftListResponse>(`/drafts${query ? `?${query}` : ''}`);
  }

  async getDraft(draftId: string): Promise<Draft> {
    return this.request<Draft>(`/drafts/${encodeURIComponent(draftId)}`);
  }

  async saveDraft(draftId: string, updates: Partial<Draft>): Promise<Draft> {
    return this.request<Draft>(`/drafts/${encodeURIComponent(draftId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDraft(draftId: string): Promise<void> {
    return this.request<void>(`/drafts/${encodeURIComponent(draftId)}`, {
      method: 'DELETE',
    });
  }

  async updateAsset(draftId: string, assetName: string, content: string): Promise<void> {
    return this.request<void>(
      `/drafts/${encodeURIComponent(draftId)}/assets/${encodeURIComponent(assetName)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }
    );
  }

  async updateMetadata(draftId: string, metadata: Partial<Draft['metadata']>): Promise<void> {
    return this.request<void>(
      `/drafts/${encodeURIComponent(draftId)}/metadata`,
      {
        method: 'PUT',
        body: JSON.stringify(metadata),
      }
    );
  }

  // ===========================================================================
  // Similarity
  // ===========================================================================

  async analyzeSimilarity(request: SimilarityRequest): Promise<SimilarityResult> {
    return this.request<SimilarityResult>('/similarity', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async compareCharacters(request: SimilarityRequest & { mode?: string; use_llm?: boolean }): Promise<SimilarityResult> {
    return this.request<SimilarityResult>('/similarity/compare', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ===========================================================================
  // Offspring
  // ===========================================================================

  generateOffspring(request: OffspringRequest): GenerationStream {
    return new GenerationStream(
      `${this.baseUrl}/offspring`,
      request
    );
  }

  // ===========================================================================
  // Export
  // ===========================================================================

  async exportDraft(request: ExportRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new APIError(response.status, 'Export failed');
    }

    return response.blob();
  }

  async getExportPresets(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/export/presets');
  }

  // ===========================================================================
  // Chat/Refinement
  // ===========================================================================

  chat(request: ChatRequest): GenerationStream {
    return new GenerationStream(
      `${this.baseUrl}/chat`,
      request
    );
  }

  refine(request: RefineRequest): GenerationStream {
    return new GenerationStream(
      `${this.baseUrl}/refine`,
      request
    );
  }
}

// ============================================================================
// SSE Streaming Helper
// ============================================================================

export type GenerationEventType = 'status' | 'chunk' | 'asset' | 'asset_complete' | 'progress' | 'complete' | 'error' | 'batch_start' | 'batch_complete' | 'batch_error';

export interface GenerationEvent {
  event: GenerationEventType;
  data: GenerationProgress | { content: string } | GenerationComplete | { error: string };
}

export class GenerationStream {
  private controller: AbortController | null = null;
  private readers: Set<(event: GenerationEvent) => void> = new Set();
  private onComplete: ((data: GenerationComplete) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor(
    private url: string,
    private body: object
  ) {}

  subscribe(callback: (event: GenerationEvent) => void): () => void {
    this.readers.add(callback);
    return () => this.readers.delete(callback);
  }

  onComplete_(callback: (data: GenerationComplete) => void): this {
    this.onComplete = callback;
    return this;
  }

  onError_(callback: (error: string) => void): this {
    this.onError = callback;
    return this;
  }

  async start(): Promise<void> {
    this.controller = new AbortController();

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.body),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const event = this.parseSSE(line);
          if (event) {
            this.readers.forEach(cb => cb(event));

            if (event.event === 'complete' && this.onComplete) {
              this.onComplete(event.data as GenerationComplete);
            }
            if (event.event === 'error' && this.onError) {
              this.onError((event.data as { error: string }).error);
            }
          }
        }
      }
    } catch (err) {
      if (this.onError) {
        this.onError(err instanceof Error ? err.message : 'Stream error');
      }
    }
  }

  abort(): void {
    this.controller?.abort();
  }

  private parseSSE(line: string): GenerationEvent | null {
    if (line.startsWith('event:')) {
      return { event: line.slice(6).trim() as GenerationEventType, data: {} as GenerationEvent['data'] };
    }
    if (line.startsWith('data:')) {
      try {
        return {
          event: 'chunk',
          data: JSON.parse(line.slice(5).trim()),
        } as GenerationEvent;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ============================================================================
// Error Class
// ============================================================================

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Default instance
export const api = new CharacterGeneratorAPI();
