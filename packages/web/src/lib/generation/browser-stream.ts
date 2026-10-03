/**
 * Streaming plumbing for the browser API facade's generation surface.
 *
 * Extracted from `api.ts` (4.7.0). `BrowserStream` wraps an async executor
 * with reader subscription, completion/error callbacks, and abort support;
 * the event map and payload types (including the blueprint-preview payloads)
 * are the contract every generation stream emits. Consumed by
 * `lib/generation/generation-api.ts` and re-used by the facade for its
 * method signatures.
 */

import type { GenerateAssetRequest, GenerateAssetResponse, GenerationComplete } from '@char-gen/shared';

type StreamEventType = 'status' | 'chunk' | 'complete' | 'error' | 'batch_start' | 'batch_complete' | 'batch_error';

type StatusStreamData = { stage?: string; asset?: string; progress?: number };
type ChunkStreamData = { content: string };
type ErrorStreamData = { error: string };
type BatchStartStreamData = { index: number; seed: string };
type BatchCompleteStreamData = { index: number; seed: string; draft_path: string };
type BatchErrorStreamData = { index: number; seed: string; error: string };

export type BlueprintPreviewRequest = GenerateAssetRequest & {
  blueprint_content: string;
};

export type BlueprintPreviewResponse = GenerateAssetResponse & {
  system_prompt: string;
  user_prompt: string;
};

type CompleteStreamData =
  | GenerationComplete
  | GenerateAssetResponse
  | BlueprintPreviewResponse
  | { draft_id: string; character_name?: string }
  | { content: string }
  | { status: 'done' };

type StreamEventMap = {
  status: StatusStreamData;
  chunk: ChunkStreamData;
  complete: CompleteStreamData;
  error: ErrorStreamData;
  batch_start: BatchStartStreamData;
  batch_complete: BatchCompleteStreamData;
  batch_error: BatchErrorStreamData;
};

type StreamEvent = {
  [EventType in StreamEventType]: {
    event: EventType;
    data: StreamEventMap[EventType];
  };
}[StreamEventType];

type StreamReader = (event: StreamEvent) => void;

export class BrowserStream {
  private readers: StreamReader[] = [];
  private onComplete?: (data: CompleteStreamData) => void;
  private onError?: (error: string) => void;
  private controller = new AbortController();

  constructor(
    private readonly executor: (helpers: {
      emit: <EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]) => void;
      signal: AbortSignal;
    }) => Promise<void>,
  ) {}

  subscribe(callback: StreamReader): this {
    this.readers.push(callback);
    return this;
  }

  onComplete_(callback: (data: CompleteStreamData) => void): this {
    this.onComplete = callback;
    return this;
  }

  onError_(callback: (error: string) => void): this {
    this.onError = callback;
    return this;
  }

  async start(): Promise<void> {
    try {
      await this.executor({
        emit: (event, data) => this.emit(event, data),
        signal: this.controller.signal,
      });
    } catch (error) {
      if (this.controller.signal.aborted) {
        return;
      }
      this.emit('error', { error: error instanceof Error ? error.message : 'Stream failed' });
    }
  }

  abort(): void {
    this.controller.abort();
  }

  private emit<EventType extends StreamEventType>(event: EventType, data: StreamEventMap[EventType]): void {
    const payload = { event, data } as StreamEvent;
    this.readers.forEach((reader) => reader(payload));

    if (payload.event === 'complete' && this.onComplete) {
      this.onComplete(payload.data);
    }

    if (payload.event === 'error' && this.onError) {
      this.onError(payload.data.error);
    }
  }
}
