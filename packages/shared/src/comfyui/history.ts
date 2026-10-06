/**
 * Render history attached to a draft (`metadata.comfy_renders`).
 *
 * Each record is the durable trace of one ComfyUI submission — prompt id, seed, time,
 * workflow preset and the server-side output image references — so a render survives
 * reloads and can be revisited (re-pin the seed, promote an output to the draft's card
 * image) long after the panel's object URLs are gone. Images stay as `/view`
 * references; blobs are re-fetched on demand rather than embedded.
 */
import type { ComfyWorkflowSelection } from '../types';
import type { ComfyHistoryImage } from './types';

export interface ComfyRenderRecord {
  prompt_id: string;
  seed: number;
  /** ISO timestamp of the submission. */
  rendered_at: string;
  workflow_preset: ComfyWorkflowSelection;
  image_count: number;
  images: ComfyHistoryImage[];
}

/** Newest-first cap: history is a working set, not an archive. */
export const MAX_COMFY_RENDER_HISTORY = 20;

function isComfyHistoryImage(value: unknown): value is ComfyHistoryImage {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<ComfyHistoryImage>;
  return (
    typeof candidate.filename === 'string' &&
    typeof candidate.subfolder === 'string' &&
    typeof candidate.type === 'string'
  );
}

/** Coerce an untrusted `comfy_renders` value (imported bundles, older drafts) into records. */
export function normalizeComfyRenderHistory(value: unknown): ComfyRenderRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const records: ComfyRenderRecord[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const candidate = entry as Partial<ComfyRenderRecord>;
    if (
      typeof candidate.prompt_id !== 'string' ||
      typeof candidate.seed !== 'number' ||
      typeof candidate.rendered_at !== 'string' ||
      !Array.isArray(candidate.images)
    ) {
      continue;
    }
    const images = candidate.images.filter(isComfyHistoryImage);
    records.push({
      prompt_id: candidate.prompt_id,
      seed: candidate.seed,
      rendered_at: candidate.rendered_at,
      workflow_preset:
        candidate.workflow_preset === 'custom' || candidate.workflow_preset === 'dual-encoder-ipadapter'
          ? candidate.workflow_preset
          : 'default',
      image_count: typeof candidate.image_count === 'number' ? candidate.image_count : images.length,
      images,
    });
  }
  return records.slice(0, MAX_COMFY_RENDER_HISTORY);
}

/** Prepend a record (newest first) and cap the list. */
export function appendComfyRenderRecord(history: unknown, record: ComfyRenderRecord): ComfyRenderRecord[] {
  return [record, ...normalizeComfyRenderHistory(history)].slice(0, MAX_COMFY_RENDER_HISTORY);
}
