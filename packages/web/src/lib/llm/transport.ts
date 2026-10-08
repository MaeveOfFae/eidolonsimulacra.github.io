/**
 * Desktop LLM transport: Tauri's native HTTP plugin when running under the
 * desktop runtime — webview `fetch` is CORS-bound, so Ollama (and other
 * endpoints that refuse foreign origins) answer the desktop origin with 403,
 * while native HTTP has no origin at all. Browser keeps the environment
 * `fetch`. Installed once from `main.tsx`; mirrors `@/lib/comfyui/transport`.
 *
 * The native plugin also **buffers** the whole response body: a "streaming"
 * request emits nothing until the completion finishes, so the engine's
 * inactivity guard trips and a long generation looks like a hang (re-verified
 * against `plugin-http` 2.6.1). This install therefore marks the transport as
 * non-streaming and every engine runs one non-streaming completion instead —
 * exactly what the mobile build does (`PREFERS_NON_STREAMING_COMPLETIONS`).
 * `setRuntimeLLMStreamingSupported(true)` re-enables SSE once a plugin streams
 * incrementally, and the engine's zero-byte fallback stays as a safety net.
 */
import { setRuntimeLLMFetch, setRuntimeLLMStreamingSupported, type LLMFetch } from '@char-gen/shared';
import { isDesktopRuntime } from '@/lib/runtime';

let installed = false;

export function installDesktopLLMFetch(): void {
  if (installed || !isDesktopRuntime()) {
    return;
  }
  installed = true;

  let nativeFetch: LLMFetch | undefined;
  setRuntimeLLMFetch(async (input, init) => {
    nativeFetch ??= (await import('@tauri-apps/plugin-http')).fetch as unknown as LLMFetch;
    return nativeFetch(input, init);
  });

  // The native plugin answers a streaming request with a buffered body, so a
  // "streaming" call here would stall until it completed. Run one non-streaming
  // completion instead (the transport is installed before any provider call).
  setRuntimeLLMStreamingSupported(false);
}
