/**
 * Transport-agnostic ComfyUI client.
 *
 * Every call takes a fetch-like `ComfyFetch` so the same code runs behind the browser's
 * `fetch` (requires ComfyUI started with `--enable-cors-header`, or an https endpoint)
 * and behind the desktop app's native HTTP plugin (no CORS restrictions). Endpoints:
 * `POST /prompt`, `GET /history/{id}`, `GET /view`, `POST /upload/image`,
 * `GET /system_stats`, `GET /object_info/{node}` — per the ComfyUI server API.
 */
import type {
  ComfyHistoryEntry,
  ComfyHistoryImage,
  ComfyQueuePromptResponse,
  ComfyUploadedImage,
  ComfyWorkflowGraph,
} from './types';

export type ComfyFetch = (url: string, init?: RequestInit) => Promise<Response>;

/**
 * Minimal structural WebSocket type so tests can inject a fake and environments
 * without `WebSocket` (older Node) still load this module.
 */
export interface ComfyWebSocketLike {
  close(code?: number, reason?: string): void;
  onopen: ((event: unknown) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
}

export type ComfyWebSocketFactory = (url: string) => ComfyWebSocketLike;

export function defaultComfyWebSocketFactory(): ComfyWebSocketFactory | undefined {
  if (typeof WebSocket === 'undefined') {
    return undefined;
  }
  return (url) => new WebSocket(url) as unknown as ComfyWebSocketLike;
}

/** The `/ws` URL for a server base URL, bound to the client id the prompt was queued with. */
export function comfyWebSocketUrl(baseUrl: string, clientId: string): string {
  return `${normalizeComfyBaseUrl(baseUrl).replace(/^http/i, 'ws')}/ws?clientId=${encodeURIComponent(clientId)}`;
}

/** A decoded ComfyUI websocket progress event, flattened for UI consumption. */
export interface ComfyProgressEvent {
  kind: 'progress' | 'executing' | 'executed' | 'status';
  /** Sampler step / total steps for `progress` events. */
  value?: number;
  max?: number;
  /** Node currently executing (null when a prompt finishes). */
  node?: string | null;
  promptId?: string;
}

export interface ComfyClientOptions {
  baseUrl: string;
  fetchFn?: ComfyFetch;
  clientId?: string;
  webSocketFactory?: ComfyWebSocketFactory | null;
}

export function normalizeComfyBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (trimmed.length === 0) {
    return 'http://127.0.0.1:8188';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

function optionsUrl(options: ComfyClientOptions, path: string): { url: string; fetchFn: ComfyFetch } {
  return {
    url: `${normalizeComfyBaseUrl(options.baseUrl)}${path}`,
    fetchFn: options.fetchFn ?? ((url, init) => fetch(url, init)),
  };
}

export interface ComfySystemStats {
  systemOs?: string;
  pythonVersion?: string;
  deviceName?: string;
  vramTotal?: number;
  comfyVersion?: string;
}

export async function comfySystemStats(options: ComfyClientOptions): Promise<ComfySystemStats> {
  const { url, fetchFn } = optionsUrl(options, '/system_stats');
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`ComfyUI answered HTTP ${response.status} from ${url}.`);
  }
  const payload = (await response.json()) as {
    system?: { os?: string; python_version?: string; ram_total?: number };
    devices?: Array<{ name?: string; vram_total?: number; type?: string }>;
    version?: string;
  };
  const device = payload.devices?.[0];
  return {
    systemOs: payload.system?.os,
    pythonVersion: payload.system?.python_version,
    deviceName: device?.name,
    vramTotal: device?.vram_total,
    comfyVersion: payload.version,
  };
}

/** Checkpoint filenames from the live install (`GET /object_info/CheckpointLoaderSimple`). */
export async function comfyListCheckpoints(options: ComfyClientOptions): Promise<string[]> {
  const { url, fetchFn } = optionsUrl(options, '/object_info/CheckpointLoaderSimple');
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`ComfyUI answered HTTP ${response.status} from ${url}.`);
  }
  const payload = (await response.json()) as {
    CheckpointLoaderSimple?: { input?: { required?: { ckpt_name?: [string[]] } } };
  };
  return payload.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] ?? [];
}

export async function comfyQueuePrompt(
  options: ComfyClientOptions,
  graph: ComfyWorkflowGraph,
): Promise<ComfyQueuePromptResponse> {
  const { url, fetchFn } = optionsUrl(options, '/prompt');
  const clientId = options.clientId ?? 'eidolon-simulacra';
  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  });
  const payload = (await response.json()) as ComfyQueuePromptResponse & {
    error?: { message?: string; details?: string } | string;
    details?: string;
  };

  if (!response.ok || payload.error) {
    throw new Error(describeComfyValidationError(payload));
  }
  if (!payload.prompt_id) {
    throw new Error('ComfyUI accepted the prompt but returned no prompt id.');
  }
  return payload;
}

export async function comfyGetHistory(
  options: ComfyClientOptions,
  promptId: string,
): Promise<ComfyHistoryEntry | null> {
  const { url, fetchFn } = optionsUrl(options, `/history/${encodeURIComponent(promptId)}`);
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`ComfyUI answered HTTP ${response.status} from ${url}.`);
  }
  const payload = (await response.json()) as Record<string, ComfyHistoryEntry>;
  return payload[promptId] ?? null;
}

export interface ComfyWaitOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Live progress from the `/ws` stream when the transport allows it. */
  onProgress?: (event: ComfyProgressEvent) => void;
}

/** Best-effort progress listener over `/ws`; resolution is a no-op when it cannot connect. */
function attachProgressStream(
  options: ComfyClientOptions,
  promptId: string,
  onProgress: (event: ComfyProgressEvent) => void,
): { close: () => void } {
  const clientId = options.clientId ?? 'eidolon-simulacra';
  const factory =
    options.webSocketFactory === null ? undefined : (options.webSocketFactory ?? defaultComfyWebSocketFactory());
  if (!factory) {
    return { close: () => undefined };
  }

  let socket: ComfyWebSocketLike | null = null;
  let settled = false;
  const close = () => {
    settled = true;
    try {
      socket?.close();
    } catch {
      // Closing an already-dead socket is fine.
    }
  };

  try {
    socket = factory(comfyWebSocketUrl(options.baseUrl, clientId));
  } catch {
    return { close };
  }

  // If the socket never opens, stay silent: history polling is the source of truth.
  const openTimeout = setTimeout(() => {
    if (!settled) {
      close();
    }
  }, 2500);

  socket.onopen = () => undefined;
  socket.onclose = () => {
    clearTimeout(openTimeout);
  };
  socket.onerror = () => {
    clearTimeout(openTimeout);
    close();
  };
  socket.onmessage = (event) => {
    if (typeof event.data !== 'string') {
      return; // Binary previews are out of scope for progress.
    }
    try {
      const payload = JSON.parse(event.data) as {
        type?: string;
        data?: { value?: number; max?: number; node?: string | null; prompt_id?: string };
      };
      if (
        payload.type === 'progress' ||
        payload.type === 'executing' ||
        payload.type === 'executed' ||
        payload.type === 'status'
      ) {
        onProgress({
          kind: payload.type,
          ...(payload.data?.value !== undefined ? { value: payload.data.value } : {}),
          ...(payload.data?.max !== undefined ? { max: payload.data.max } : {}),
          ...(payload.data?.node !== undefined ? { node: payload.data.node } : {}),
          promptId: payload.data?.prompt_id ?? promptId,
        });
      }
    } catch {
      // Non-JSON frames are ignored.
    }
  };

  return {
    close: () => {
      clearTimeout(openTimeout);
      close();
    },
  };
}

/** Poll history until the run finishes; resolves with every saved output image. */
export async function comfyWaitForImages(
  options: ComfyClientOptions,
  promptId: string,
  waitOptions: ComfyWaitOptions = {},
): Promise<ComfyHistoryImage[]> {
  const pollIntervalMs = waitOptions.pollIntervalMs ?? 1000;
  const timeoutMs = waitOptions.timeoutMs ?? 600_000;
  const deadline = Date.now() + timeoutMs;
  const progressStream = waitOptions.onProgress
    ? attachProgressStream(options, promptId, waitOptions.onProgress)
    : null;

  try {
    while (true) {
      if (waitOptions.signal?.aborted) {
        throw new Error('Rendering was cancelled.');
      }
      const entry = await comfyGetHistory(options, promptId);
      if (entry) {
        if (entry.status?.status_str === 'error') {
          throw new Error('ComfyUI reported an execution error while rendering. Check its console for the traceback.');
        }
        const images = Object.values(entry.outputs ?? {}).flatMap((output) => output.images ?? []);
        if (entry.status?.completed || images.length > 0) {
          return images;
        }
      }
      if (Date.now() > deadline) {
        throw new Error(`Rendering did not finish within ${Math.round(timeoutMs / 1000)}s.`);
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  } finally {
    progressStream?.close();
  }
}

export async function comfyUploadImage(
  options: ComfyClientOptions,
  image: { name: string; blob: Blob },
): Promise<ComfyUploadedImage> {
  const { url, fetchFn } = optionsUrl(options, '/upload/image');

  // Manual multipart: the desktop runtime's native fetch does not serialize FormData,
  // and a hand-built body works identically behind the browser fetch.
  const boundary = `----eidolon${Math.random().toString(36).slice(2)}`;
  const encoder = new TextEncoder();
  const field = (name: string, value: string) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  const fileHeader =
    `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${image.name}"\r\n` +
    `Content-Type: ${image.blob.type || 'application/octet-stream'}\r\n\r\n`;
  const parts = [
    encoder.encode(field('overwrite', 'true')),
    encoder.encode(field('type', 'input')),
    encoder.encode(fileHeader),
    new Uint8Array(await image.blob.arrayBuffer()),
    encoder.encode(`\r\n--${boundary}--\r\n`),
  ];
  const body = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    body.set(part, offset);
    offset += part.length;
  }

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!response.ok) {
    throw new Error(`Uploading the reference image failed with HTTP ${response.status}.`);
  }
  return (await response.json()) as ComfyUploadedImage;
}

export function comfyViewUrl(baseUrl: string, image: ComfyHistoryImage): string {
  const query = new URLSearchParams({
    filename: image.filename,
    subfolder: image.subfolder,
    type: image.type,
  });
  return `${normalizeComfyBaseUrl(baseUrl)}/view?${query.toString()}`;
}

/** Turn a rejected `POST /prompt` payload into a readable message. */
export function describeComfyValidationError(payload: unknown): string {
  const candidate = payload as
    | {
        error?: { message?: string; details?: string } | string;
        node_errors?: Record<string, unknown>;
        details?: string;
      }
    | undefined;

  const headline =
    typeof candidate?.error === 'string'
      ? candidate.error
      : (candidate?.error?.message ?? candidate?.details ?? 'ComfyUI rejected the workflow.');
  const nodeErrorCount = candidate?.node_errors ? Object.keys(candidate.node_errors).length : 0;
  if (nodeErrorCount > 0) {
    return `${headline} (${nodeErrorCount} node${nodeErrorCount === 1 ? '' : 's'} reported errors — usually a missing model file or a custom node the workflow needs, such as ComfyUI_IPAdapter_plus.)`;
  }
  return headline;
}
