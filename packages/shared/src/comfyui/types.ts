/**
 * Types for ComfyUI's API-format workflow graph and server responses.
 *
 * ComfyUI's `POST /prompt` takes `{ prompt: <graph>, client_id }` where `<graph>` maps
 * node ids to `{ class_type, inputs, _meta: { title } }`. Links are `[nodeId, slot]`
 * pairs. These types cover the subset the handoff needs; unknown fields pass through
 * untouched so imported workflows keep working as their authors wrote them.
 */

export interface ComfyNodeMeta {
  title?: string;
}

export interface ComfyNode {
  class_type: string;
  _meta?: ComfyNodeMeta;
  inputs: Record<string, unknown>;
}

/** An API-format workflow: node id → node. */
export type ComfyWorkflowGraph = Record<string, ComfyNode>;

export type ComfyWorkflowPresetId = 'default' | 'dual-encoder-ipadapter';

/** The built-in presets' intended pipeline, for labels and docs. */
export const COMFY_PRESET_LABELS: Record<ComfyWorkflowPresetId, string> = {
  default: 'SDXL base (CLIP skip 2) — core ComfyUI nodes only',
  'dual-encoder-ipadapter': 'Base + refiner dual-encoder, CLIP skip 2, IPAdapter refs (needs ComfyUI_IPAdapter_plus)',
};

export interface ComfyQueuePromptResponse {
  prompt_id: string;
  number: number;
  node_errors?: Record<string, unknown>;
  error?: unknown;
}

export interface ComfyHistoryImage {
  filename: string;
  subfolder: string;
  type: string;
}

export interface ComfyHistoryOutputEntry {
  images?: ComfyHistoryImage[];
}

export interface ComfyHistoryStatus {
  status_str?: string;
  completed?: boolean;
  messages?: unknown[];
}

export interface ComfyHistoryEntry {
  prompt_id: string;
  outputs: Record<string, ComfyHistoryOutputEntry>;
  status?: ComfyHistoryStatus;
}

/** A resolved reference to an uploaded input image. */
export interface ComfyUploadedImage {
  name: string;
  subfolder: string;
  type: string;
}
