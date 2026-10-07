# 5.2.0 — the publishing release

**Released 2026-10-06** · In the app: [`/whats-new`](/whats-new) · History: [`CHANGELOG.md`](../CHANGELOG.md)

5.2 is the release where a draft leaves the app. Paste a chub.ai token in Settings, press **Test**,
and the app verifies it against the live gateway, tells you who you are signed in as, and mints the
scoped token publishing needs. Then take any draft, approve the character sheet, and publish it as a
Chub character — mapped into the exact fields the gateway's V2 spec expects, gated by a preflight
list that blocks a bad listing before a single request is made, and recorded on the draft so
publishing again updates that character instead of creating a second one.

The rest of the release is the other half of the same promise. The provider layer was re-verified
against all eight vendors' own documentation, Ollama became the out-of-the-box default and finally
reachable from the desktop build, a scoped token that expires can heal itself instead of looping,
`target="_blank"` links open in a real browser, and the sidebar stopped moving under the pointer.

Draft for the `v5.2.0` release body: everything from "Publish a draft to chub.ai" down to
"Where to look".

Suggested tag: `v5.2.0`, titled "the publishing release" — earlier releases are tagged as
lightweight tags (`v5.1.0` points straight at its release commit).

## Publish a draft to chub.ai

**Settings → Chub is the whole connection.** Paste a token, press **Test**, and the gateway verifies
you: the app shows the signed-in account and mints a scoped projects-CRUD token for publishing.
Disconnect clears the connection. The verification has to be real, so it gates on `GET /api/self`
answering with a positive account id *and* a non-stub username — an unauthenticated call to that same
endpoint answers `200` with an anonymous stub (`id: -22358`, `name: "You"`) rather than a 401.

**A draft becomes a character in the shape the spec asks for.** The mapper is V2-aware, including the
gateway's naming quirk (`description` carries creator notes, `personality` carries the V2
`description`): character sheet → persona, creator notes → notes, intro scene → first message, post
history → `<START>`-wrapped example dialogs, system prompt and card image → their fields. Name,
tagline, tags, rating and visibility are editable in the panel before anything is sent.

**Preflight runs before the request, not after the rejection.** A listed character needs its three
tags, a greeting is required, macros are checked for hygiene, and alternate greetings must be wrapped
in `<START>`. Each unmet rule is named in the panel and blocks the publish.

**Republishing updates; it does not duplicate.** The Chub record — username, pathname, character id —
is stored on the draft as `metadata.chub_publish`, so the next publish issues `PUT` against the same
character.

**It lives where you are working.** The panel sits under the character sheet for in-context
publishing, and the review header now carries a **Publish to Chub** button next to Export that opens
the same panel in the standard dialog shell (Escape, backdrop, focus trap, scroll lock — the same
contract as every other overlay). Both surfaces keep the same approval gate: the character sheet is
approved first, or there is nothing to publish. The guided tour's description of the review header
mentions it now too.

Mobile does not ship the Chub connection. The shared client is runtime-free and transport-agnostic
precisely so a mobile surface can adopt it without forking, and
[`docs/MOBILE_PARITY.md`](MOBILE_PARITY.md) records that as a decision rather than an omission.

## Tokens that tell you the truth

The help told people to paste `URQL_TOKEN`, which is chub.ai's *session* JWT — it expires on Chub's
schedule no matter how often it is re-copied, and two flows handled that badly.

**Expiry is visible now.** The token field decodes the JWT's `exp` claim (opaque keys show nothing)
and says either "Session token expired … — paste a fresh URQL_TOKEN" in red, or a calm notice while
the token is still valid. **Test** short-circuits an expired token with that remedy instead of
spending a request on a guaranteed 401.

**A stale scoped token heals itself.** Publishing prefers the minted `publish_token`, but the mint
only ran while that field was empty — so once the scoped token went stale, pasting a fresh session
token and pressing Test could never replace it, and publishing stayed on "expired" indefinitely
(Disconnect was the only escape). A 401 on the scoped token now re-mints from the session token,
retries once, and hands the new token back so the panel persists it. A 401 on the session token
itself still stops and asks for a fresh paste, because that is the only real fix: the gateway's spec
defines no refresh endpoint, and issuance lives on chub.ai.

**The diagnosis was the fix.** Live-probing the gateway with a real token showed the split that caused
all of it — `/api/self` → `200` with the actual account, `/oauth/userinfo` → `401 {"detail":"This
token is expired."}`, and the scoped-token mint → `200`, all with the same token. Chub's misleading
catch-all is now only a best-effort enrichment of the profile, never the gate.

## Every provider, checked against its own docs

Eight providers, eight documentation sites, and the base URLs did not all match: Z.AI moved to
`https://api.z.ai/api/paas/v4`, Kimi/Moonshot to `https://api.moonshot.ai/v1`, Anthropic's endpoint
was carrying a stray `/v1`, and DeepSeek was synced to `/v1`. OpenAI, OpenRouter, Google and the
local Ollama host were re-confirmed against the same docs.

**Model listing works for all eight.** Anthropic's Models API is `/v1/models` on a base URL that has
no `/v1`; Google answers `models[]` rather than `data[]`, so the `models/` prefix is stripped and
`inputTokenLimit` becomes `context_length`. Google used to parse to an empty list and Anthropic
404'd; both list remotely now, alongside the rest.

**Bare model ids route correctly.** `deepseek-*`, `glm-*`, `kimi-*`, `o3`/`o4` (regex) and `gpt-oss`
(matched before `gpt-`, so it goes to Ollama) each detect to the right provider, and unknown ids
still fall to OpenRouter. The model suggestions were refreshed from the current catalogs, and every
provider now links to its own documentation from the Runtime picker, the API-key editor and the Setup
access card. "Moonshot" is labelled "Kimi (Moonshot)".

## Ollama: local out of the box, cloud when you want it

**Fresh installs start local.** The default engine is Ollama at `http://localhost:11434/v1` with
model `gemma4` and no API key, so a machine already running Ollama works immediately — everyone else
picks a provider as before. Web's config manager, mobile's default device config and the device-link
sync baseline ship those same three values in lockstep, and Settings infers the provider with the
engine's own detection rules, so bare ids like `gemma4` resolve and the panel always names the
provider that will actually answer.

**Cloud is its own provider.** `ollama` now means **Ollama Cloud** (`https://ollama.com/v1`, the
OpenAI-compatible surface — `/api` is the native protocol) and requires `OLLAMA_API_KEY`. The
free-form base-URL override stopped being a per-provider field: it belongs to the ninth provider,
**Custom**, which is also where local Ollama and any other OpenAI-compatible endpoint live. Custom
refuses to run without a base URL and says where to set it; the transport fields (base URL, proxy
key, Test) render only for Custom. Key hygiene is enforced with it: Ollama and Custom are
own-key-only and never inherit another provider's key, and keyless Custom sends no auth header at
all — which is exactly what a local server wants. Mobile gains the Ollama and Custom options with
the same key rules, and "Use" pins `engine_mode: 'explicit'` so choosing Custom actually takes effect
under auto-detection.

**Local failures are diagnosed, not guessed.** A bare 403 from Ollama means the origin was refused —
localhost origins are allowed, `http://tauri.localhost` and LAN origins are not — and the message now
gives the fix (`OLLAMA_ORIGINS=*` on a restart) instead of a bare fetch error. Test Connection tests
the model you will actually generate with, so Ollama's own "model not found, try pulling it first"
reaches you rather than a generic failure, and a Runtime notice appears when the loaded model list
does not contain the current model (prefix-normalised, so `openrouter/x` and `x` agree).

## Desktop: direct connections, real links

**Provider traffic no longer goes through the webview.** Every provider request — completions,
streaming, model listing, Test Connection, and Settings' own custom-base ping — resolves its `fetch`
through a runtime transport hook. On desktop that hook is Tauri's native HTTP plugin: there is no
origin at all, so Ollama's origin refusal disappears and localhost listing, tests and streaming
generation simply work (the plugin feeds a real `ReadableStream` and honours `AbortSignal`, so SSE
and timeouts are intact). In the browser nothing changes — localhost origins are allowed, and other
origins follow the `OLLAMA_ORIGINS` note in Settings.

**`target="_blank"` finally leaves the app.** The desktop shell had no link handling at all, so
provider docs, chub.ai character pages and the gateway all failed to open. One delegated click
handler, installed once at startup and only on desktop runtimes, sends any `http(s)`/`mailto` anchor
— nested elements included — to the OS default browser, while `#…` hash routes and ordinary clicks
pass through untouched, so routing is unaffected.

**The desktop build works end to end again.** `tauri build` refused to compile because the npm opener
plugin had run ahead of crates.io (npm 2.7.0 has no matching crate); the npm side is pinned to
`^2.5.5` to pair with the locked crate, and `pnpm desktop:build` now produces both 5.2.0 bundles —
`Eidolon Simulacra_5.2.0_x64-setup.exe` and the x64 MSI.

## Smaller fixes with long tails

- **Publishing is one click from the review header.** The panel existed only in a collapsed card at
  the bottom of the character sheet, which read as "no UI for publishing" once an account was
  actually connected. The in-card panel remains, for publishing in context after review.
- **A successful Test sticks.** Settings wrote the verification only into the unsaved draft, so
  publishing right after still said "The token is stored but not verified yet — run Test …". The
  outcome (`username`, `subscription`, `verified_at`, minted `publish_token`) is now written straight
  to the persisted config, Disconnect clears the same fields there, and the config-change event it
  fires stays signature-guarded on model/engine so the Settings panel cannot bounce mid-edit.
- **The sidebar holds still.** With workspace modes left on Auto (the default), navigating promoted
  whichever mode's screens you landed on to the top of the sidebar, so items moved under the pointer
  as you clicked — Home un-promoted everything, Library re-promoted Review's screens, and back. Order
  now follows only an explicitly chosen mode; Auto still names the frame and shows the "Following
  this screen" hint, and the ⌘K palette still orders by the active mode. A new `Layout.test.tsx` pins
  both halves — and fails against the old line.
- **The Android package reports its real version.** The checked-in gradle project still carried the
  React Native template defaults (`versionCode 1`, `versionName "0.1.0"`) and the APK build runs a raw
  `assembleRelease` with no prebuild to overwrite them, so the installed app identified as 0.1.0 while
  its own About screen said 5.2.0. Both it and `app.json` now carry `versionCode 12` and `5.2.0`,
  restoring the bump-per-release convention.

## Under the hood

- **The Chub client is runtime-free and transport-agnostic** (`shared/src/chub/`), and web drives it
  with plain `fetch`: the gateway answers `Access-Control-Allow-Origin: *` with both auth headers
  allowed, so unlike ComfyUI there is no native-plugin or CORS story to tell. It does 403 default
  script user agents, so non-browser smoke scripts need a browser UA — browsers and webviews already
  send one.
- **The gateway's error bodies are handled as they arrive** — `{"detail": …}` for 401/403, FastAPI's
  `detail[]` for 422 — and the create response's `id`/`fullPath` are treated as undocumented extras
  with search and detail-endpoint fallbacks, so a schema change there degrades instead of breaking.
- **Tests at the end of the release: 385 shared, 571 web, 155 mobile**, with `tsc` clean on web and
  mobile, lint at zero errors, prettier clean, `build:web`, `cargo check`, and a full
  `pnpm desktop:build`.

## Upgrading

Nothing to do, and nothing is deleted — no storage keys moved in this release, and existing drafts,
settings and keys are read as they are. The version is 5.2.0 across the web app, the desktop build
and the mobile app, and the desktop installers, the Android APK and the in-app About and Download
surfaces all report it.

Two defaults changed, and both are worth knowing about rather than undoing blindly. The engine now
starts on local Ollama (`gemma4` on `http://localhost:11434/v1`) instead of OpenRouter, because the
first run should not require a key. And a base-URL override is only read for the new **Custom**
provider — so if you were pointing a provider at your own endpoint, pick Custom in Settings → Runtime
and put the URL there to keep doing it. Every other provider now uses its documented endpoint.

## Where to look

- Connecting Chub, token expiry, what publishing sends, and the provider diagnostics: `?` on the page
  you are on, or the [Help Center](/help).
- Roadmap and what is *not* shipped: [`docs/ROADMAP.md`](ROADMAP.md) — the same claims the app's
  **What's New → Upcoming Updates** panel shows.
- Mobile parity against the web app: [`docs/MOBILE_PARITY.md`](MOBILE_PARITY.md).
- Download and install: [`/download`](/download) and [`docs/DOWNLOADS.md`](DOWNLOADS.md).
