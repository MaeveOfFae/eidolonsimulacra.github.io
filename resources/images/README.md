# App icon art

Tiered source art for every icon surface in the repo (web favicons + PWA
manifest icons, the Tauri desktop bundle, and the Expo/Android app). All files
are 1024x1024 PNGs with transparency; the file names describe the **render size
each variant was drawn for**, so small icons keep their simplified artwork:

| File | Drawn for | Used for |
| --- | --- | --- |
| `ico-xsmall.png` | 32px | favicon.ico / 16-48px sizes |
| `ico-small.png` | 64px | 64-96px sizes (small manifest icons, mdpi/hdpi launchers) |
| `ico-medium.png` | 128px | 128-192px sizes (manifest icons, xhdpi launchers) |
| `ico-large.png` | 256px | 256-432px sizes (splash logos) |
| `ico-large-x.png` | 512px+ | 512/1024 masters (Tauri set, Expo assets, large manifest icons) |

## Regenerating

After replacing any file here, run from the repository root (Windows only —
the generator uses System.Drawing):

```
pnpm icons:generate
```

That rewrites every derived artifact (web `public/favicon.ico` + `public/icons/`,
`packages/web/src-tauri/icons/`, `packages/mobile/assets/`, and the Android
`mipmap-*` / `drawable-*` resources) and the results are committed. CI verifies
the committed set with `pnpm icons:check`
(`tools/generation/check-app-icons.mjs`), which fails if any icon surface is
missing or if `index.html` / `manifest.json` / `tauri.conf.json` reference an
icon that does not exist.

Note: the committed desktop installers in `packages/web/public/downloads/`
embed their icons at build time — rebuild them (see `docs/DOWNLOADS.md`) to
pick up new art, as part of the normal release flow.
