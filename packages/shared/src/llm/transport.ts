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

/** Install the transport provider calls should use on this runtime. */
export function setRuntimeLLMFetch(fetchFn: LLMFetch | undefined): void {
  runtimeFetch = fetchFn;
}

/** The fetch implementation provider calls use (environment default unless installed). */
export function getRuntimeLLMFetch(): LLMFetch {
  return runtimeFetch ?? ((input, init) => fetch(input, init));
}
