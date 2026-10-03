# Hosting the download artifacts

**This is maintainer documentation.** It deliberately lives outside `packages/web/public/`, because everything in that folder is published with the site — build and hosting instructions belong with the repository, not on the public download page. The page itself (`/download`) is visitor-facing: it lists the files, their sizes, and Download buttons, and says nothing about how they are produced.

## What is published today

Artifacts are uploaded as **assets on GitHub Releases** of this repository, and `packages/shared/src/info/download.ts` derives each channel's `downloadUrl` from `buildReleaseAssetUrl`. Nothing is site-hosted anymore — `packages/web/public/downloads/` is intentionally empty — so the published site stays small and no binary counts against the Pages storage or bandwidth budget.

| Asset (on release `v4.7.0`)              | Size     | Channel                         |
| ---------------------------------------- | -------- | ------------------------------- |
| `Eidolon.Simulacra_4.7.0_x64-setup.exe`  | 5.27 MB  | Desktop (recommended installer) |
| `Eidolon.Simulacra_4.7.0_x64_en-US.msi`  | 6.65 MB  | Desktop (MSI)                   |
| `app-release.apk`                        | 87.44 MB | Android                         |

The APK keeps its fixed `app-release.apk` name on purpose: each release uploads an asset of the same name under the new tag, so the URL shape stays predictable even though the tag version changes. The desktop asset names use dots (`Eidolon.Simulacra_…`) rather than the Tauri bundle's spaces — uploading normalizes the space away — which `buildReleaseAssetUrl` already accounts for. Size note: the first 4.5.0 desktop bundles built at ~51–53 MB were an anomaly (as were the local 4.3.0/4.4.0 bundles); the 4.5.0 assets above are from a clean rebuild back at the normal ~5–7 MB.

## Shipping a new build

1. Build it:

   ```powershell
   pnpm build:desktop   # -> packages/web/src-tauri/target/release/bundle/{nsis,msi}/
   pnpm build:mobile    # -> packages/mobile/android/app/build/outputs/apk/release/
   ```

2. Create a GitHub release tagged `v<version>` on the release commit and upload the artifacts as assets with dot-separated names (`Eidolon.Simulacra_<version>_x64-setup.exe` and `…_x64_en-US.msi` — uploading normalizes the Tauri bundle's spaces to dots; the APK stays `app-release.apk`). **Create the release before pushing the `download.ts` change**, or the download buttons 404 until the assets exist.
3. Update `packages/shared/src/info/download.ts`: bump `RELEASE_VERSION` and the `approxSize` labels. `buildReleaseAssetUrl` handles space encoding and the tag.
4. Run `pnpm test:shared` — the URL-shape test pins the repository, the `vX.Y.Z` tag, and space encoding, because `pnpm downloads:check` deliberately cannot verify absolute URLs (they are GitHub's uptime, not this repository's). `pnpm downloads:check` still guards the (currently empty) set of site-relative downloads should any return.

## The custom domain (Porkbun) — separate from Pages

CI deploys the web build to GitHub Pages automatically (`maeveoffae.github.io/eidolonsimulacra.github.io/`). The custom domain `eidolonsimulacra.com` is **not** GitHub Pages: it is Porkbun static hosting, which serves whatever is on this repository's `porkbun-deploy` branch. That branch is only updated when a maintainer runs:

```powershell
pnpm deploy:porkbun --build   # builds web dist, then pushes it to origin/porkbun-deploy
```

- Run it as the last step of the release recipe (after the GitHub release exists), or the custom domain will keep serving the previous build while Pages moves ahead — which looks exactly like a broken deploy.
- `--build` rebuilds `packages/web/dist` first (shared package included); without it, the script publishes whatever dist is currently on disk, which may be stale.
- Hashed `assets/` accumulate on the branch on purpose, so an index.html cached in a browser never references a missing chunk. The branch grows over time; that is the accepted trade.
- SPA deep links fall back to `index.html` through `packages/web/public/.htaccess`, which is part of the published dist.

## Why GitHub Releases, not the repository

Recorded because the trade-offs were weighed when the binaries moved (after 4.5.0), not because anything blocks:

- GitHub Pages allows a **1 GB published site** and a **100 GB/month soft bandwidth limit**. Committing artifacts added ~190 MB to the repository per release, and the APK alone cost roughly **14× the bandwidth** of a desktop installer per download.
- Committed artifacts stay in git history forever: each release added another full copy even when a file was replaced in place.
- GitHub warns above **50 MB per file** on push. All three artifacts exceed it; release assets have a **2 GB per-file limit** on Free and cost nothing against the Pages quota.
- **Git LFS was never an option** for the site-hosted variant ("Git LFS cannot be used with GitHub Pages sites"), which is what forced binaries into the repository originally. Release assets make the question moot.

History note: releases 4.0.0 through 4.5.0 shipped binaries from `packages/web/public/downloads/`; those blobs remain in git history even though the files are gone from the tip. Reclaiming that size would require a history rewrite (`git filter-repo`), which invalidates every clone — not worth it unless the repository nears the 1 GB guidance.

## Android signing caveat (still open)

The release variant in `packages/mobile/android/app/build.gradle` uses the **debug keystore** (`signingConfig signingConfigs.debug`), so the APK above installs for testing but is **not store-ready**. The download page states this to users. Configure a real release keystore — or build with the EAS `production` profile — before treating it as an official release build.
