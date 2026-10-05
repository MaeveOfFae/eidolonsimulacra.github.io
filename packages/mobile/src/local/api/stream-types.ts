/**
 * The shape of a streamed event and the reader callback the client hands to the stream helpers.
 *
 * Split out of `api.ts`, which is now a barrel over these modules.
 */
import { type GenerationComplete } from '@char-gen/shared';

export type StreamEventType =
  | 'status'
  | 'chunk'
  | 'complete'
  | 'error'
  | 'batch_start'
  | 'batch_complete'
  | 'batch_error';

export type StreamEventMap = {
  status: { stage?: string; asset?: string; progress?: number };
  chunk: { content: string };
  complete:
    | GenerationComplete
    | { draft_id?: string; character_name?: string }
    | { content: string }
    | { status: 'done' };
  error: { error: string };
  batch_start: { index: number; seed: string };
  batch_complete: { index: number; seed: string; draft_id?: string; character_name?: string };
  batch_error: { index: number; seed: string; error: string };
};

export type LocalStreamEvent = {
  [EventType in StreamEventType]: {
    event: EventType;
    data: StreamEventMap[EventType];
  };
}[StreamEventType];

export type StreamReader = (event: LocalStreamEvent) => void;
