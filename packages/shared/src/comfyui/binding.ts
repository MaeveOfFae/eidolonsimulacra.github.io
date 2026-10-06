/**
 * Binding resolution: which nodes of an API-format workflow receive the prompt.
 *
 * Titles first — the built-in presets and the documented convention title their text
 * encoders `Positive` / `Negative` / `Refiner Positive` / `Refiner Negative` — then a
 * structural fallback that infers them from each sampler's `positive` / `negative`
 * links, so graphs imported from "Save (API Format)" work without renaming anything.
 */
import type { ComfyNode, ComfyWorkflowGraph } from './types';

const SAMPLER_CLASS_TYPES = new Set(['KSampler', 'KSamplerAdvanced']);
const TEXT_ENCODE_CLASS_TYPES = new Set(['CLIPTextEncode']);

export interface ComfyWorkflowBindings {
  /** Node ids whose `text` input receives the positive prompt. */
  positive: string[];
  /** Node ids whose `text` input receives the negative prompt. */
  negative: string[];
  /** Sampler node ids (seed injection targets). */
  samplers: string[];
  /** Checkpoint loader node ids (checkpoint override targets). */
  loaders: string[];
  /** `LoadImage` node ids (uploaded reference targets), titled `Reference` first. */
  imageLoaders: string[];
}

function nodeIdsByTitle(graph: ComfyWorkflowGraph, title: string): string[] {
  return Object.entries(graph)
    .filter(([, node]) => node?._meta?.title === title)
    .map(([id]) => id);
}

function nodeIdsByClass(graph: ComfyWorkflowGraph, classTypes: ReadonlySet<string>): string[] {
  return Object.entries(graph)
    .filter(([, node]) => node && classTypes.has(node.class_type))
    .map(([id]) => id);
}

function linkSourceNodeId(input: unknown): string | null {
  if (Array.isArray(input) && typeof input[0] === 'string') {
    return input[0];
  }
  return null;
}

export function resolveComfyWorkflowBindings(graph: ComfyWorkflowGraph): ComfyWorkflowBindings {
  const samplers = Object.entries(graph)
    .filter(([, node]) => node && SAMPLER_CLASS_TYPES.has(node.class_type))
    .map(([id]) => id);
  const loaders = nodeIdsByClass(graph, new Set(['CheckpointLoaderSimple']));

  let positive = nodeIdsByTitle(graph, 'Positive');
  let negative = nodeIdsByTitle(graph, 'Negative');
  const refinerPositive = nodeIdsByTitle(graph, 'Refiner Positive');
  const refinerNegative = nodeIdsByTitle(graph, 'Refiner Negative');

  if (positive.length === 0 || negative.length === 0) {
    // Structural fallback: follow each sampler's conditioning links back to their encoders.
    const inferredPositive = new Set<string>();
    const inferredNegative = new Set<string>();
    for (const samplerId of samplers) {
      const sampler = graph[samplerId] as ComfyNode | undefined;
      const positiveSource = linkSourceNodeId(sampler?.inputs.positive);
      const negativeSource = linkSourceNodeId(sampler?.inputs.negative);
      if (positiveSource && TEXT_ENCODE_CLASS_TYPES.has(graph[positiveSource]?.class_type ?? '')) {
        inferredPositive.add(positiveSource);
      }
      if (negativeSource && TEXT_ENCODE_CLASS_TYPES.has(graph[negativeSource]?.class_type ?? '')) {
        inferredNegative.add(negativeSource);
      }
    }
    if (positive.length === 0) {
      positive = [...inferredPositive];
    }
    if (negative.length === 0) {
      negative = [...inferredNegative];
    }
  }

  const imageLoaders = nodeIdsByClass(graph, new Set(['LoadImage'])).sort((a, b) => {
    const aIsReference = graph[a]?._meta?.title === 'Reference' ? 0 : 1;
    const bIsReference = graph[b]?._meta?.title === 'Reference' ? 0 : 1;
    return aIsReference - bIsReference;
  });

  return {
    positive: [...new Set([...positive, ...refinerPositive])],
    negative: [...new Set([...negative, ...refinerNegative])],
    samplers,
    loaders,
    imageLoaders,
  };
}

/** Human-readable binding problems that make prompt injection impossible or partial. */
export function describeComfyBindingIssues(graph: ComfyWorkflowGraph): string[] {
  const bindings = resolveComfyWorkflowBindings(graph);
  const issues: string[] = [];
  if (bindings.positive.length === 0) {
    issues.push(
      'No positive prompt node found. Title a CLIPTextEncode node "Positive" or wire one into the sampler\'s positive input.',
    );
  }
  if (bindings.negative.length === 0) {
    issues.push(
      'No negative prompt node found. Title a CLIPTextEncode node "Negative" or wire one into the sampler\'s negative input.',
    );
  }
  if (bindings.samplers.length === 0) {
    issues.push('No KSampler / KSamplerAdvanced node found; there is nothing to seed or run.');
  }
  if (Object.keys(graph).length === 0) {
    issues.push('The workflow graph is empty.');
  }
  return issues;
}
