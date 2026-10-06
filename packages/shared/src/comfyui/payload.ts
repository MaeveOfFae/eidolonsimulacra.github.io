/**
 * Prompt payload construction: clone a workflow graph and inject everything the
 * render needs — prompts into the bound text-encode nodes, the seed into every
 * sampler (KSampler `seed` / KSamplerAdvanced `noise_seed`), checkpoint names into
 * the loaders, dimensions into the latent, the uploaded reference name into the
 * reference `LoadImage` node, and the IPAdapter strength.
 *
 * The template graph is never mutated; a deep clone is returned.
 */
import { resolveComfyWorkflowBindings } from './binding';
import type { ComfyWorkflowGraph } from './types';

export interface ComfyPromptBuildRequest {
  workflow: ComfyWorkflowGraph;
  positivePrompt: string;
  negativePrompt: string;
  /** Fixed seed for reproducible renders; omitted → one random seed shared by all samplers. */
  seed?: number;
  /** Overrides `ckpt_name` on loaders that are not the refiner. */
  checkpointName?: string;
  /** Overrides `ckpt_name` on the loader titled `Refiner Checkpoint`. */
  refinerCheckpointName?: string;
  width?: number;
  height?: number;
  /** Server-side name of an uploaded reference image (from `comfyUploadImage`). */
  referenceImageName?: string;
  ipadapterStrength?: number;
}

export interface ComfyPromptBuildResult {
  graph: ComfyWorkflowGraph;
  seed: number;
}

/** Fold the a1111 asset's five lines into one positive prompt string. */
export function buildComfyPositivePrompt(a1111Content: string): string {
  return a1111Content
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(',\n');
}

function deepCloneGraph(graph: ComfyWorkflowGraph): ComfyWorkflowGraph {
  if (typeof structuredClone === 'function') {
    return structuredClone(graph);
  }
  return JSON.parse(JSON.stringify(graph)) as ComfyWorkflowGraph;
}

export function buildComfyPromptPayload(request: ComfyPromptBuildRequest): ComfyPromptBuildResult {
  const graph = deepCloneGraph(request.workflow);
  const bindings = resolveComfyWorkflowBindings(graph);
  const seed = request.seed ?? Math.floor(Math.random() * 2 ** 31);

  for (const nodeId of bindings.positive) {
    graph[nodeId]!.inputs.text = request.positivePrompt;
  }
  for (const nodeId of bindings.negative) {
    graph[nodeId]!.inputs.text = request.negativePrompt;
  }

  for (const nodeId of bindings.samplers) {
    const inputs = graph[nodeId]!.inputs;
    if ('noise_seed' in inputs) {
      inputs.noise_seed = seed;
    } else {
      inputs.seed = seed;
    }
  }

  for (const nodeId of bindings.loaders) {
    const node = graph[nodeId]!;
    if (node._meta?.title === 'Refiner Checkpoint' && request.refinerCheckpointName) {
      node.inputs.ckpt_name = request.refinerCheckpointName;
    } else if (node._meta?.title !== 'Refiner Checkpoint' && request.checkpointName) {
      node.inputs.ckpt_name = request.checkpointName;
    }
  }

  if (request.width !== undefined || request.height !== undefined) {
    for (const node of Object.values(graph)) {
      if (node?.class_type === 'EmptyLatentImage') {
        if (request.width !== undefined) {
          node.inputs.width = request.width;
        }
        if (request.height !== undefined) {
          node.inputs.height = request.height;
        }
      }
    }
  }

  if (request.referenceImageName && bindings.imageLoaders.length > 0) {
    graph[bindings.imageLoaders[0]!]!.inputs.image = request.referenceImageName;
  }

  if (request.ipadapterStrength !== undefined) {
    for (const node of Object.values(graph)) {
      if (node?.class_type === 'IPAdapterAdvanced') {
        node.inputs.strength = request.ipadapterStrength;
      }
    }
  }

  return { graph, seed };
}
