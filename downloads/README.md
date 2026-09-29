# Site-hosted downloads

**These downloads are live.** The artifacts in this folder are committed here and published with the site:

| File                                    | Size     | Channel        |
| --------------------------------------- | -------- | -------------- |
| `Eidolon Simulacra_4.0.0_x64-setup.exe` | 4.98 MB  | Desktop (NSIS) |
| `Eidolon Simulacra_4.0.0_x64_en-US.msi` | 6.34 MB  | Desktop (MSI)  |
| `app-release.apk`                       | 86.51 MB | Android        |

Vite copies this folder into the published build, so a file here is served from the site itself:

```
packages/web/public/downloads/<file>   ->   https://<site>/downloads/<file>
```

Same origin as the app: no redirect, no third-party host, no signed URLs.

## Shipping a new build

1. Build it:

   ```powershell
   pnpm build:desktop   # -> packages/web/src-tauri/target/release/bundle/{nsis,msi}/
   pnpm build:mobile    # -> packages/mobile/android/app/build/outputs/apk/release/
   ```

2. Replace the file here, or add the new version alongside the old one and `git rm` the old one. The APK keeps its fixed `app-release.apk` name on purpose, so the download link survives version bumps.
3. Update `packages/shared/src/info/download.ts` so the paths and versioned filenames match. Encode spaces as `%20` — the shared test rejects a literal space.
4. Run `pnpm downloads:check`. It fails if any channel points at a site-relative download with no file — or a file under 64 KB — behind it, so a download button can never 404.

## Costs that come with hosting binaries in this repository

Recorded because the decision was made with them on the table, not because they block anything:

- GitHub Pages allows a **1 GB published site** and a **100 GB/month soft bandwidth limit**; GitHub recommends keeping source repositories **under 1 GB**. These downloads add ~98 MB, almost all of it the APK, which costs roughly **14× the bandwidth** of a desktop installer per download.
- Committed artifacts stay in git history forever, so each release adds another copy. Replacing `app-release.apk` in place keeps the _link_ stable but not the history size.
- GitHub warns above **50 MB per file** on push; the APK is above that (though under the hard limit).
- **Git LFS is not an option for this.** GitHub's docs: _"Git LFS cannot be used with GitHub Pages sites."_ The pointer would be committed while the bytes were not served.
- GitHub's own guidance for distributing binaries is **Releases**, where there is no bandwidth cost against the Pages quota and per-file limits are far higher (2 GB on Free). Any download here can move to a release URL at any time: `downloadUrl` accepts an absolute `https://` link too, and `pnpm downloads:check` leaves non-site-relative links alone.

## Android signing caveat (still open)

The release variant in `packages/mobile/android/app/build.gradle` uses the **debug keystore** (`signingConfig signingConfigs.debug`), so the APK above installs for testing but is **not store-ready**. The download page states this to users. Configure a real release keystore — or build with the EAS `production` profile — before treating it as an official release build.
