/**
 * Defaults for the ComfyUI handoff. Kept here (not in `types`) so the web config
 * manager, the settings tab, and any future mobile surface share one source of truth.
 */
import type { ComfyUIConfig } from '../types';
import { BUILTIN_COMFY_WORKFLOW_DEFAULT, DEFAULT_COMFY_NEGATIVE_PROMPT, getBuiltinComfyWorkflow } from './workflows';
import { parseComfyWorkflowJson } from './workflow-json';
import type { ComfyWorkflowGraph } from './types';

export const DEFAULT_COMFY_BASE_URL = 'http://127.0.0.1:8188';

export function createDefaultComfyUIConfig(): ComfyUIConfig {
  return {
    base_url: DEFAULT_COMFY_BASE_URL,
    workflow_preset: 'default',
    workflow_json: JSON.stringify(BUILTIN_COMFY_WORKFLOW_DEFAULT, null, 2),
    negative_prompt: DEFAULT_COMFY_NEGATIVE_PROMPT,
    checkpoint: 'illustriousXL_v01.safetensors',
    refiner_checkpoint: 'sd_xl_refiner_1.0.safetensors',
    ipadapter_strength: 0.75,
    steps: 24,
    cfg: 5,
    width: 832,
    height: 1216,
    use_card_image_as_reference: true,
  };
}

/** Resolve the workflow graph a render should use, with parse problems reported up front. */
export function resolveComfyWorkflow(
  config: ComfyUIConfig,
): { graph: ComfyWorkflowGraph; ok: true } | { ok: false; error: string } {
  if (config.workflow_preset === 'custom') {
    try {
      return { graph: parseComfyWorkflowJson(config.workflow_json), ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'The custom workflow could not be parsed.',
      };
    }
  }
  return { graph: getBuiltinComfyWorkflow(config.workflow_preset), ok: true };
}
