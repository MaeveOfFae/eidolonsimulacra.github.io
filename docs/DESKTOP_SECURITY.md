# Desktop shell security

`packages/web/src-tauri` wraps the web app in a WebView with a deliberately narrow
capability set. This file records what the shell is allowed to do and why, so the
next change to `tauri.conf.json` does not have to rediscover it.

## Content Security Policy

`app.security.csp` (production) and `app.security.devCsp` (development) are both set.
Before this, `csp` was `null`, which meant any script that reached the webview — from
a dependency, an injected asset, or a future bug — ran with the window's full `fs`,
`sql` and `http` capabilities.

| Directive | Value | Why |
| --- | --- | --- |
| `default-src` | `'self'` | Anything not listed below stays same-origin. |
| `script-src` | `'self'` | The bundle has no inline scripts and no CDN scripts. This is the directive that actually stops injected code. |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Tailwind ships as a file; `'unsafe-inline'` stays because runtime style injection is a weak vector next to script injection, and the desktop window cannot be smoke-tested from CI. `fonts.googleapis.com` serves the stylesheet for the two bundled fonts. |
| `font-src` | `'self' data: https://fonts.gstatic.com` | Font files. |
| `img-src` | `'self' data: blob: https:` | Card images and promoted renders are `data:`, ComfyUI outputs are `blob:`, and `https:` keeps images inside generated markdown working. |
| `connect-src` | `'self' ipc: http://ipc.localhost http: https: ws: wss:` | The first three are Tauri's IPC. The rest is deliberately wide: endpoints are user-supplied (OpenAI-compatible providers, Ollama, ComfyUI, the Chub gateway), the Chub client uses plain `fetch` even on desktop, and ComfyUI progress is a raw `WebSocket`. A narrower policy silently breaks someone's endpoint. |
| `frame-src` | `https://ko-fi.com` | The About page's support panel. |
| `object-src` | `'none'` | No plugins or embeds. |
| `base-uri` | `'self'` | A hijacked `<base>` cannot repoint relative script URLs. |
| `form-action` | `'self'` | No form posts to a foreign origin. |
| `frame-ancestors` | `'none'` | The app cannot be framed. |

`devCsp` repeats that policy with `script-src 'self' 'unsafe-inline'`, because Vite's
React-refresh preamble is an inline module script and HMR talks over `ws:`. **Both
blocks have to be kept in step** — Tauri replaces the policy in development rather
than merging the two.

Tauri also injects nonces/hashes for the assets it serves; that only tightens the
policy. If a CSP change ever makes the desktop app render a blank window, open the
webview devtools and read the `Refused to …` line: the directive in it names the
resource that has to be added.

One interaction worth knowing before debugging that: CSP3 ignores `'unsafe-inline'`
whenever a nonce or hash is also present in the same directive, and Tauri adds
nonces/hashes for the assets it serves. `csp` does not care (the production bundle
has no inline scripts). `devCsp` does, because Vite serves the React-refresh preamble
as an inline module script. If `pnpm dev:desktop` boots to a blank window with a
`Refused to execute inline script` error naming that preamble, set
`app.security.dangerousDisableAssetCspModification` to `["script-src"]` — that keeps
Tauri's nonces out of `script-src`, restoring `'unsafe-inline'` for the dev server
only. It is a no-op for the shipped policy, which has nothing inline to hash.

The check that matters is `pnpm --filter @char-gen/web desktop:dev` — the CSP is not
exercised by `pnpm test`, and `cargo test` only pins its shape
(`desktop_security_tests::ships_a_restrictive_content_security_policy`). Open the
Generate screen (fonts, icons), a draft with a card image (`data:`), the ComfyUI
panel (`blob:` + `ws:`), Settings → Chub, and About (the `frame-src` panel).

## Capabilities

`capabilities/default.json` grants the main window `core:default`, `dialog`,
`opener`, `fs` (AppData only), `sql:allow-execute`, and `http` for `http(s)://*:*`.
The HTTP scope is wide on purpose: a scheme-wide pattern matches only the scheme's
default port, so every local server (`http://127.0.0.1:8188`, `http://localhost:11434`)
needs a port-aware entry. What the app chooses to send is still bounded by code, and
the CSP above is what stops injected code from using the same capability.

## What is intentionally absent

- **No remote origin.** The shell loads the bundled frontend (`../dist`) only.
- **No shell or process plugin.** Nothing in the app spawns a process.
- **No updater plugin.** Updates are a manual download — see [`DOWNLOADS.md`](DOWNLOADS.md).
