/**
 * Runtime hook for provider HTTP.
 *
 * Every engine call and provider model listing resolves its `fetch` through
 * here so a host runtime can swap the transport. The desktop app installs
 * Tauri's native HTTP plugin (webview `fetch` is CORS-bound — Ollama answers
 * the desktop origin with a bare 403 — and other endpoints block browser
 * origins too); browser and mobile keep the environment default. Nothing
 * installed means global `fetch`, exactly as before.
 */

export type LLMFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let runtimeFetch: LLMFetch | undefined;
let runtimeStreamingSupported = true;

/** Install the transport provider calls should use on this runtime. */
export function setRuntimeLLMFetch(fetchFn: LLMFetch | undefined): void {
  runtimeFetch = fetchFn;
}

/** The fetch implementation provider calls use (environment default unless installed). */
export function getRuntimeLLMFetch(): LLMFetch {
  return runtimeFetch ?? ((input, init) => fetch(input, init));
}

/**
 * Whether the installed transport delivers a response body incrementally.
 *
 * Tauri's native HTTP plugin buffers the whole body, so a "streaming" call there
 * emits nothing until the response completes — which trips the engine's
 * inactivity guard. Hosts that install such a transport set this `false`, and the
 * engines fall back to a single non-streaming completion (which reads the full,
 * buffered body with no inactivity deadline).
 */
export function setRuntimeLLMStreamingSupported(supported: boolean): void {
  runtimeStreamingSupported = supported;
}

export function isRuntimeLLMStreamingSupported(): boolean {
  return runtimeStreamingSupported;
}
