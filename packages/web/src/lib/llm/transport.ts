/**
 * Desktop LLM transport: Tauri's native HTTP plugin when running under the
 * desktop runtime — webview `fetch` is CORS-bound, so Ollama (and other
 * endpoints that refuse foreign origins) answer the desktop origin with 403,
 * while native HTTP has no origin at all. Browser keeps the environment
 * `fetch`. Installed once from `main.tsx`; mirrors `@/lib/comfyui/transport`.
 *
 * Streaming is attempted here (the pinned plugin carries the stream-support
 * fixes). If a bridge still buffers the body, `OpenAICompatEngine.generateStream`
 * detects that it received nothing and re-runs the request non-streamingly, so
 * long generations complete either way. A host that knows its transport can never
 * stream can opt out with `setRuntimeLLMStreamingSupported(false)`.
 */
import { setRuntimeLLMFetch, type LLMFetch } from '@char-gen/shared';
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
}
