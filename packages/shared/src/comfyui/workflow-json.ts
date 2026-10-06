/**
 * Importing user workflows: accept ComfyUI's "Save (API Format)" JSON and reject the
 * editor-format export with a pointer at the right menu entry — the two are easy to
 * confuse and the failure otherwise looks like random garbage.
 */
import type { ComfyNode, ComfyWorkflowGraph } from './types';

export function parseComfyWorkflowJson(text: string): ComfyWorkflowGraph {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The workflow is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('The workflow JSON must be an object of node ids → nodes.');
  }

  const record = parsed as Record<string, unknown>;
  if (Array.isArray(record.nodes)) {
    throw new Error(
      'This looks like a ComfyUI editor-format export. Use "Save (API Format)" instead — the developer-format JSON is a flat object of node ids.',
    );
  }

  const graph: ComfyWorkflowGraph = {};
  for (const [nodeId, value] of Object.entries(record)) {
    if (!value || typeof value !== 'object') {
      throw new Error(`Node "${nodeId}" is not an object.`);
    }
    const node = value as Partial<ComfyNode>;
    if (typeof node.class_type !== 'string' || !node.inputs || typeof node.inputs !== 'object') {
      throw new Error(
        `Node "${nodeId}" is missing "class_type" or "inputs". Use "Save (API Format)" from ComfyUI's developer menu.`,
      );
    }
    graph[nodeId] = node as ComfyNode;
  }

  if (Object.keys(graph).length === 0) {
    throw new Error('The workflow has no nodes.');
  }
  return graph;
}
