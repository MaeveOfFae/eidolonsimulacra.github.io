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

/** Map a transport failure to the remedy that actually applies on this runtime. */
export function describeComfyTransportError(error: unknown): string {
  if (error instanceof TypeError && /failed to fetch/i.test(error.message)) {
    if (isDesktopRuntime()) {
      return 'Could not reach ComfyUI. Check that it is running and that the base URL in Settings → Image Pipeline is correct.';
    }
    return 'The browser blocked the request to ComfyUI (CORS or mixed content). Start ComfyUI with --enable-cors-header — or serve it over https — or use the desktop app, which talks to ComfyUI directly.';
  }
  return error instanceof Error ? error.message : 'The request to ComfyUI failed.';
}
