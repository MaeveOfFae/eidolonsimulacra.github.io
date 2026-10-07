/**
 * The two surfaces a visitor can download. Build-from-source instructions live in
 * the repository (`README.md` "Build Pipeline", `docs/DOWNLOADS.md`), not here:
 * this data drives a public download page, so it only describes what a visitor
 * gets, what it needs, and where to fetch it.
 */

import { PROJECT_REPOSITORY_URL } from './project-links';

export type DownloadChannelId = 'desktop' | 'android' | 'ios';

export interface DownloadArtifact {
  label: string;
  /**
   * The name the visitor gets. For an artifact served from a release asset this is
   * the published name, version and all — never a placeholder, so the page can only
   * ever name the file it links to. `{version}` remains for site-hosted artifacts,
   * whose file the deploy produces at the caller's build version.
   */
  filename: string;
  /** Approximate, and labelled as such, so a new build cannot make the page lie. */
  approxSize: string;
  /**
   * Direct link for this specific artifact, when it is published separately from
   * the channel's primary download (both Windows installers, for example).
   * Same rules as {@link DownloadChannel.downloadUrl}: absolute `https://` or a
   * site-relative path under {@link downloadPathPrefix}.
   */
  downloadUrl?: string | null;
}

export interface DownloadChannel {
  id: DownloadChannelId;
  name: string;
  summary: string;
  /**
   * Where the build can be fetched, once it is published anywhere:
   * - an absolute `https://…` URL (a release asset, a store listing), or
   * - a site-relative path under {@link downloadPathPrefix}, for artifacts served
   *   by the site itself (`packages/web/public/downloads/` is copied into the
   *   published build, so the file lands on the same origin as the page).
   * `null` while nothing is published, which is also how the surfaces know a
   * channel has no download to offer yet.
   */
  downloadUrl: string | null;
  /** What a visitor actually downloads. */
  artifacts: DownloadArtifact[];
  /** What the visitor's device needs, in user terms — never toolchains. */
  requirements: string[];
  /** Caveats a reader needs before treating the build as an official release. */
  notes: string[];
}

/**
 * Site-relative download prefix. Anything in `packages/web/public/downloads/` is
 * published at `<origin>/downloads/<file>` alongside the app, which keeps the
 * download same-origin (no redirects, no third-party host).
 */
export const downloadPathPrefix = '/downloads/';

export const downloadRepositoryUrl = PROJECT_REPOSITORY_URL;

/**
 * Version of the GitHub release that carries the published artifacts. Bump this
 * (and the `approxSize` labels) as part of the release recipe in
 * `docs/DOWNLOADS.md` — creating the release and uploading the assets *first*,
 * or every download button 404s until they exist.
 *
 * It is also the version the page *names*: a release-asset artifact reports its
 * published filename rather than the caller's build version, because a page that
 * displays 5.1.0 and serves 4.7.0 is worse than one that says it is serving
 * 4.7.0. `pnpm downloads:check` fails when this is ahead of the app version and
 * warns while it is behind.
 */
const RELEASE_VERSION = '5.2.0';
const RELEASE_TAG = `v${RELEASE_VERSION}`;

/** The release whose assets are published, for callers that want to say so. */
export const downloadReleaseVersion = RELEASE_VERSION;

/**
 * Download URL for an artifact uploaded as an asset on this repository's
 * current release. Binaries live on GitHub Releases instead of the repository:
 * no ~190 MB of installers added to git history per release, nothing against
 * the Pages site size or bandwidth budget, and a far higher per-file limit.
 * The trade is that `pnpm downloads:check` cannot verify absolute URLs (they
 * are GitHub's uptime, not this repository's), so the release-upload step in
 * `docs/DOWNLOADS.md` and the URL-shape test in `download.test.ts` carry the
 * honesty burden instead.
 */
function buildReleaseAssetUrl(filename: string): string {
  return `${PROJECT_REPOSITORY_URL}/releases/download/${RELEASE_TAG}/${encodeURIComponent(filename)}`;
}

export const downloadChannels: DownloadChannel[] = [
  {
    id: 'desktop',
    name: 'Desktop app',
    summary:
      'The same browser app wrapped in a Tauri shell, so it runs offline with local SQLite-backed draft and lore storage, and can host a LAN companion endpoint for paired mobile devices.',
    downloadUrl: buildReleaseAssetUrl(`Eidolon.Simulacra_${RELEASE_VERSION}_x64-setup.exe`),
    artifacts: [
      {
        label: 'Windows installer (recommended)',
        filename: `Eidolon.Simulacra_${RELEASE_VERSION}_x64-setup.exe`,
        approxSize: '≈5 MB',
        downloadUrl: buildReleaseAssetUrl(`Eidolon.Simulacra_${RELEASE_VERSION}_x64-setup.exe`),
      },
      {
        label: 'Windows installer (MSI)',
        filename: `Eidolon.Simulacra_${RELEASE_VERSION}_x64_en-US.msi`,
        approxSize: '≈7 MB',
        downloadUrl: buildReleaseAssetUrl(`Eidolon.Simulacra_${RELEASE_VERSION}_x64_en-US.msi`),
      },
    ],
    requirements: ['Windows 10 or later.'],
    notes: [
      'Drafts and lore are stored in the app data directory on this device, and the desktop app can host the LAN companion endpoint that paired mobile devices use for workspace transfer.',
    ],
  },
  {
    id: 'android',
    name: 'Android app',
    summary:
      'The Expo React Native app: generate, review, archive, and export drafts on a phone, with the same shared blueprint compiler and content the other surfaces use.',
    downloadUrl: buildReleaseAssetUrl('app-release.apk'),
    artifacts: [
      {
        label: 'Release APK',
        filename: 'app-release.apk',
        approxSize: '≈87 MB',
        downloadUrl: buildReleaseAssetUrl('app-release.apk'),
      },
    ],
    requirements: ['An Android device that allows installing an app from outside the store.'],
    notes: [
      'This APK is signed with the Android debug keystore, so it installs for testing but is not a store-ready release.',
      'No Play Store listing exists yet.',
    ],
  },
  {
    id: 'ios',
    name: 'iOS app',
    summary:
      'The same React Native app for iPhone and iPad, with the same draft workflow and shared content as the other surfaces.',
    downloadUrl: null,
    artifacts: [],
    requirements: [],
    notes: ['No iOS build is published yet.', 'There is no App Store listing for the app yet.'],
  },
];

/**
 * Shown per channel while it has no published download, so the page states the
 * real situation instead of implying an installer is one click away.
 */
export const unpublishedDownloadNotice = 'There is nothing to download for this platform yet.';

export function getDownloadChannel(id: DownloadChannelId): DownloadChannel {
  const channel = downloadChannels.find((entry) => entry.id === id);

  if (!channel) {
    throw new Error(`Unknown download channel: ${id}`);
  }

  return channel;
}

/** Substitutes the caller's build version into a site-hosted artifact filename. */
export function formatArtifactFilename(filename: string, version: string): string {
  return filename.replace('{version}', version);
}

/** True when the download is served by the site itself rather than a third party. */
export function isSiteRelativeDownload(url: string): boolean {
  return url.startsWith(downloadPathPrefix);
}

/**
 * Turns any download link from this module into something openable outside a
 * browser: absolute URLs pass through untouched, site-relative paths are joined
 * to the caller's site origin, and without an origin the path is returned as-is.
 */
export function toAbsoluteDownloadUrl(url: string, siteOrigin?: string): string {
  if (!isSiteRelativeDownload(url) || !siteOrigin) {
    return url;
  }

  return `${siteOrigin.replace(/\/$/, '')}${url}`;
}

/**
 * Absolute URL for a channel's primary download. The browser page can use the
 * site-relative path as-is; anything outside a browser (the mobile app opening a
 * link, an emailed link) needs an origin, so the caller supplies its own.
 * Returns `null` when nothing is published.
 */
export function resolveDownloadUrl(channel: DownloadChannel, siteOrigin?: string): string | null {
  return channel.downloadUrl === null ? null : toAbsoluteDownloadUrl(channel.downloadUrl, siteOrigin);
}

/** Channels a visitor can actually fetch right now. */
export function listPublishedDownloads(): DownloadChannel[] {
  return downloadChannels.filter((channel) => channel.downloadUrl !== null);
}

/** Every download link a channel exposes: its primary download plus per-artifact links. */
export function listChannelDownloadUrls(channel: DownloadChannel): string[] {
  const urls = [channel.downloadUrl, ...channel.artifacts.map((artifact) => artifact.downloadUrl ?? null)];

  return urls.filter((url): url is string => url !== null);
}

export function isAnyDownloadPublished(): boolean {
  return listPublishedDownloads().length > 0;
}
