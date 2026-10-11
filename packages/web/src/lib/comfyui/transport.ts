/**
 * Transport for ComfyUI requests: the desktop app's native HTTP plugin when running
 * under Tauri (no CORS or mixed-content restrictions, so `http://127.0.0.1:8188` just
 * works), the browser's `fetch` otherwise (requires ComfyUI started with
 * `--enable-cors-header` or served over https — surfaced as a readable remedy).
 */
import type { ComfyFetch } from '@char-gen/shared';
import { isDesktopRuntime } from '@/lib/runtime';

let nativeFetch: ComfyFetch | null = null;

async function resolveNativeFetch(): Promise<ComfyFetch> {
  nativeFetch ??= (await import('@tauri-apps/plugin-http')).fetch as unknown as ComfyFetch;
  return nativeFetch;
}

/** The fetch implementation ComfyUI calls should use on this runtime. */
export function getComfyFetch(): ComfyFetch {
  return async (url, init) => {
    if (isDesktopRuntime()) {
      const fetchFn = await resolveNativeFetch();
      return fetchFn(url, init);
    }
    return fetch(url, init);
  };
}

/**
 * The desktop HTTP plugin serializes its Rust errors as **strings** (`err.to_string()`),
 * not `Error` instances, so `error instanceof Error` is false for the failures that
 * matter most. Read a message out of any thrown value.
 */
function readErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return '';
}

/** Tauri's `Error::UrlNotAllowed` — the request never left the machine. */
const SCOPE_DENIED_PATTERN = /url not allowed on the configured scope/i;

/** "Cannot reach it" from either transport: browser `fetch` or the Rust plugin's reqwest. */
const UNREACHABLE_PATTERN =
  /failed to fetch|load failed|network ?error|error sending request|tcp connect|connection refused|connect error|dns error/i;

/** Map a transport failure to the remedy that actually applies on this runtime. */
export function describeComfyTransportError(error: unknown): string {
  const message = readErrorMessage(error);

  // A scope denial is a *configuration* problem, not a dead server: the desktop app's
  // capability allowlist rejected the URL before any connection was attempted. A
  // scheme-wide pattern like `http://**` only matches the scheme's default port, so
  // every `host:port` endpoint (ComfyUI, Ollama, LM Studio) needs a port-aware entry.
  if (SCOPE_DENIED_PATTERN.test(message)) {
    return `The desktop app blocked the request before it left the machine: its HTTP allowlist does not cover this URL (a scheme-wide pattern matches only the default port, so local servers need a port-aware entry, e.g. http://*:*). ${message}`;
  }

  if (UNREACHABLE_PATTERN.test(message)) {
    if (isDesktopRuntime()) {
      return 'Could not reach ComfyUI. Check that it is running and that the base URL in Settings → Image Pipeline is correct.';
    }
    return 'The browser blocked the request to ComfyUI (CORS or mixed content). Start ComfyUI with --enable-cors-header — or serve it over https — or use the desktop app, which talks to ComfyUI directly.';
  }

  return message || 'The request to ComfyUI failed.';
}
