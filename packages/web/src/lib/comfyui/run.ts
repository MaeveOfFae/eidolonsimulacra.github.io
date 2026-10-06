/**
 * Orchestrates one render: config → workflow → optional reference upload → prompt
 * injection → queue → poll → fetched image blobs. Pure plumbing over the shared
 * ComfyUI client; the UI (ComfyRenderPanel) owns state and cancellation.
 */
import {
  buildComfyPositivePrompt,
  buildComfyPromptPayload,
  comfyQueuePrompt,
  comfySystemStats,
  comfyUploadImage,
  comfyViewUrl,
  comfyWaitForImages,
  describeComfyBindingIssues,
  normalizeComfyBaseUrl,
  resolveComfyWorkflow,
  type ComfyFetch,
  type ComfyHistoryImage,
  type ComfyProgressEvent,
  type ComfyUIConfig,
} from '@char-gen/shared';
import { describeComfyTransportError, getComfyFetch } from './transport';

export interface ComfyRenderResult {
  promptId: string;
  seed: number;
  /** Server-side image references (`/view` URLs need the transport, so blobs are fetched eagerly). */
  images: ComfyHistoryImage[];
  /** Object URLs for display; the caller revokes them when done. */
  objectUrls: string[];
}

export interface ComfyRunParams {
  config: ComfyUIConfig;
  a1111Content: string;
  /** Draft card image as a data URL, used as the IPAdapter reference when enabled. */
  referenceImageDataUrl?: string;
  seed?: number;
  signal?: AbortSignal;
  fetchFn?: ComfyFetch;
  /** Live progress from the `/ws` stream, when the transport allows one. */
  onProgress?: (event: ComfyProgressEvent) => void;
}

/** One client id per session so the `/ws` stream and `/prompt` submissions match. */
let sessionClientId: string | null = null;
function getSessionClientId(): string {
  sessionClientId ??= `eidolon-${Math.random().toString(36).slice(2, 10)}`;
  return sessionClientId;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [prefix, base64] = dataUrl.split(',');
  const mime = prefix?.match(/^data:([^;]+);base64$/)?.[1] ?? 'image/png';
  const binary = atob(base64 ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function fetchImageBlob(
  baseUrl: string,
  image: ComfyHistoryImage,
  fetchFn: ComfyFetch,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await fetchFn(comfyViewUrl(baseUrl, image), { signal });
  if (!response.ok) {
    throw new Error(`Fetching the rendered image failed with HTTP ${response.status}.`);
  }
  return response.blob();
}

export async function runComfyRender(params: ComfyRunParams): Promise<ComfyRenderResult> {
  const fetchFn = params.fetchFn ?? getComfyFetch();
  const { config } = params;

  const resolved = resolveComfyWorkflow(config);
  if (!resolved.ok) {
    throw new Error(resolved.error);
  }
  const bindingIssues = describeComfyBindingIssues(resolved.graph);
  if (bindingIssues.length > 0) {
    throw new Error(bindingIssues.join(' '));
  }

  let referenceImageName: string | undefined;
  const hasImageLoader = Object.values(resolved.graph).some((node) => node?.class_type === 'LoadImage');
  if (config.use_card_image_as_reference && hasImageLoader && params.referenceImageDataUrl?.startsWith('data:')) {
    const uploaded = await comfyUploadImage(
      { baseUrl: config.base_url, fetchFn },
      { name: `eidolon-ref-${Date.now()}.png`, blob: dataUrlToBlob(params.referenceImageDataUrl) },
    );
    referenceImageName = uploaded.name;
  }

  const isPreset = config.workflow_preset !== 'custom';
  const payload = buildComfyPromptPayload({
    workflow: resolved.graph,
    positivePrompt: buildComfyPositivePrompt(params.a1111Content),
    negativePrompt: config.negative_prompt,
    ...(params.seed !== undefined ? { seed: params.seed } : {}),
    ...(isPreset ? { checkpointName: config.checkpoint } : {}),
    ...(isPreset ? { refinerCheckpointName: config.refiner_checkpoint } : {}),
    ...(isPreset ? { width: config.width, height: config.height } : {}),
    ...(isPreset ? { ipadapterStrength: config.ipadapter_strength } : {}),
    ...(referenceImageName ? { referenceImageName } : {}),
  });

  // Policy layer on top of the mechanical builder: CFG applies to every sampler, steps
  // only to single-sampler graphs so the dual-encoder two-stage ranges stay intact.
  const samplerIds = Object.entries(payload.graph)
    .filter(([, node]) => node?.class_type === 'KSampler' || node?.class_type === 'KSamplerAdvanced')
    .map(([id]) => id);
  if (Number.isFinite(config.cfg)) {
    for (const id of samplerIds) {
      payload.graph[id]!.inputs.cfg = config.cfg;
    }
  }
  if (samplerIds.length === 1 && Number.isFinite(config.steps) && config.steps > 0) {
    payload.graph[samplerIds[0]!]!.inputs.steps = config.steps;
  }

  const queued = await comfyQueuePrompt(
    { baseUrl: config.base_url, fetchFn, clientId: getSessionClientId() },
    payload.graph,
  );
  const images = await comfyWaitForImages(
    { baseUrl: config.base_url, fetchFn, clientId: getSessionClientId() },
    queued.prompt_id,
    {
      signal: params.signal,
      ...(params.onProgress ? { onProgress: params.onProgress } : {}),
    },
  );

  const objectUrls: string[] = [];
  for (const image of images) {
    const blob = await fetchImageBlob(config.base_url, image, fetchFn, params.signal);
    objectUrls.push(URL.createObjectURL(blob));
  }

  return { promptId: queued.prompt_id, seed: payload.seed, images, objectUrls };
}

export interface ComfyConnectionTest {
  ok: boolean;
  message: string;
}

export interface ComfyVariationBatchResult {
  /** Successful renders, in submission order. */
  results: ComfyRenderResult[];
  /** Failure messages for variations that errored; partial batches still succeed. */
  errors: string[];
}

/**
 * Render N variations of the same prompt. A pinned seed ladders deterministically
 * (seed, seed+1, …) so a good seed can be explored; an empty seed gives each
 * variation its own random seed. Runs concurrently — ComfyUI queues submissions
 * server-side, so this fills the queue rather than racing it.
 */
export async function runComfyVariationBatch(
  params: ComfyRunParams & { count: number },
): Promise<ComfyVariationBatchResult> {
  const count = Math.max(1, Math.min(4, Math.trunc(params.count)));
  const submissions = Array.from({ length: count }, (unused, index) =>
    runComfyRender({
      ...params,
      ...(params.seed !== undefined ? { seed: params.seed + index } : {}),
    }),
  );

  const settled = await Promise.allSettled(submissions);
  const results: ComfyRenderResult[] = [];
  const errors: string[] = [];
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      results.push(outcome.value);
    } else {
      errors.push(describeComfyTransportError(outcome.reason));
    }
  }
  return { results, errors };
}

/** The next free `render_<n>` asset name for the draft (saved renders live beside assets). */
export function nextRenderAssetName(assets: Record<string, string>): string {
  let maxIndex = 0;
  for (const name of Object.keys(assets)) {
    const match = name.match(/^render_(\d+)$/);
    if (match) {
      maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10) || 0);
    }
  }
  return `render_${maxIndex + 1}`;
}

export async function testComfyConnection(config: Pick<ComfyUIConfig, 'base_url'>): Promise<ComfyConnectionTest> {
  try {
    const stats = await comfySystemStats({ baseUrl: config.base_url, fetchFn: getComfyFetch() });
    const device = stats.deviceName ? ` on ${stats.deviceName}` : '';
    const version = stats.comfyVersion ? ` (v${stats.comfyVersion})` : '';
    return { ok: true, message: `Connected${device}${version}.` };
  } catch (error) {
    return { ok: false, message: describeComfyTransportError(error) };
  }
}

export { normalizeComfyBaseUrl };
