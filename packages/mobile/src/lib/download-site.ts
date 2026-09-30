/**
 * Origin the published site is served from, used to turn the site-relative
 * download paths in `@char-gen/shared` into links the phone can open.
 *
 * This repository is a `<owner>.github.io` Pages site, so the app is served from
 * the domain root. If the project ever moves to a custom domain, update this one
 * constant — `packages/web/public/downloads/README.md` covers the hosting side.
 */
export const DOWNLOAD_SITE_ORIGIN = 'https://maeveoffae.github.io';
