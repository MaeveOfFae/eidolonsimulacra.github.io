import { describe, expect, it } from 'vitest';
import {
  downloadChannels,
  downloadRepositoryUrl,
  formatArtifactFilename,
  getDownloadChannel,
  isAnyDownloadPublished,
  isSiteRelativeDownload,
  listChannelDownloadUrls,
  listPublishedDownloads,
  resolveDownloadUrl,
  toAbsoluteDownloadUrl,
  unpublishedDownloadNotice,
  type DownloadChannelId,
} from './download';
import { getInfoPage, getInfoPageByPath, getInfoPageSummary } from './pages';

/** The filename a download link actually serves, decoded. */
const basenameOf = (url: string) => decodeURIComponent(url.split('/').pop() ?? '');

describe('download channels', () => {
  it('describes each channel with the copy the pages render', () => {
    expect(downloadChannels.length).toBeGreaterThanOrEqual(3);

    const ids = downloadChannels.map((channel) => channel.id);
    expect(new Set(ids).size).toBe(ids.length);

    downloadChannels.forEach((channel) => {
      expect(channel.name.trim().length).toBeGreaterThan(0);
      expect(channel.summary.trim().length).toBeGreaterThan(0);

      channel.requirements.forEach((requirement) => expect(requirement.trim().length).toBeGreaterThan(0));
      channel.artifacts.forEach((artifact) => {
        expect(artifact.label.trim().length).toBeGreaterThan(0);
        expect(artifact.filename.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('never exposes build instructions, because the page is for visitors', () => {
    // Build-from-source steps belong in the repository docs. If any of these
    // words turn up in channel copy, developer instructions have leaked back
    // into the public download page.
    const developerTerms = ['pnpm', 'npm install', 'npx', 'gradle', 'cargo', 'JAVA_HOME', 'ANDROID_SDK_ROOT', 'JDK'];

    downloadChannels.forEach((channel) => {
      const rendered = [
        channel.name,
        channel.summary,
        ...channel.requirements,
        ...channel.notes,
        ...channel.artifacts.flatMap((artifact) => [artifact.label, artifact.filename]),
      ].join(' ');

      developerTerms.forEach((term) => expect(rendered.toLowerCase()).not.toContain(term.toLowerCase()));
    });
  });

  it('never claims a download that is not a real link', () => {
    // The page renders a download button only when a URL is set, so a non-null
    // value must either be an absolute https URL or a site-relative path under
    // the /downloads/ prefix that the published site serves.
    downloadChannels.forEach((channel) => {
      listChannelDownloadUrls(channel).forEach((url) => {
        const isAbsolute = /^https:\/\//.test(url);
        const isSiteRelative = isSiteRelativeDownload(url);

        expect(isAbsolute || isSiteRelative).toBe(true);
        expect(url).not.toContain(' '); // spaces must be encoded or avoided
      });
    });

    expect(listPublishedDownloads()).toHaveLength(
      downloadChannels.filter((channel) => channel.downloadUrl !== null).length,
    );
    // The two published-state helpers must agree with each other.
    expect(isAnyDownloadPublished()).toBe(listPublishedDownloads().length > 0);
  });

  it('publishes downloads as release assets of this repository under a versioned tag', () => {
    // Binaries live on GitHub Releases, not the Pages site (docs/DOWNLOADS.md).
    // Absolute links are outside `downloads:check`'s reach, so this test pins
    // the shape instead: this repository, a vX.Y.Z tag, no unencoded spaces.
    const prefix = `${downloadRepositoryUrl}/releases/download/`;

    for (const channel of listPublishedDownloads()) {
      listChannelDownloadUrls(channel).forEach((url) => {
        expect(url.startsWith(prefix)).toBe(true);
        expect(url).toMatch(/\/releases\/download\/v\d+\.\d+\.\d+\//);
        expect(url).not.toContain(' ');
      });
    }
  });

  it('collects every download link a channel exposes, primary and per-artifact', () => {
    const desktop = getDownloadChannel('desktop');

    expect(listChannelDownloadUrls(desktop)).toHaveLength(3);
    expect(listChannelDownloadUrls(getDownloadChannel('ios'))).toHaveLength(0);
  });

  it('resolves site-hosted downloads against a caller-supplied origin', () => {
    const channel = { ...downloadChannels[0]!, downloadUrl: '/downloads/setup.exe' };
    const external = { ...downloadChannels[0]!, downloadUrl: 'https://example.com/setup.exe' };
    const unpublished = { ...downloadChannels[0]!, downloadUrl: null };

    expect(resolveDownloadUrl(channel, 'https://site.example')).toBe('https://site.example/downloads/setup.exe');
    expect(resolveDownloadUrl(channel, 'https://site.example/')).toBe('https://site.example/downloads/setup.exe');
    expect(resolveDownloadUrl(channel)).toBe('/downloads/setup.exe');
    expect(resolveDownloadUrl(external, 'https://site.example')).toBe('https://example.com/setup.exe');
    expect(resolveDownloadUrl(unpublished, 'https://site.example')).toBeNull();
    expect(isSiteRelativeDownload('/downloads/x.exe')).toBe(true);
    expect(isSiteRelativeDownload('https://example.com/x.exe')).toBe(false);
    // Per-artifact links resolve through the same helper.
    expect(toAbsoluteDownloadUrl('/downloads/x.apk', 'https://site.example')).toBe(
      'https://site.example/downloads/x.apk',
    );
    expect(toAbsoluteDownloadUrl('https://cdn.example/x.apk', 'https://site.example')).toBe(
      'https://cdn.example/x.apk',
    );
    expect(toAbsoluteDownloadUrl('/downloads/x.apk')).toBe('/downloads/x.apk');
  });

  it('gives every downloadable channel at least one artifact and a link', () => {
    // A channel with a download URL but no artifact would render a button that
    // promises something the page never names.
    downloadChannels.forEach((channel) => {
      if (channel.downloadUrl !== null) {
        expect(channel.artifacts.length).toBeGreaterThan(0);
        expect(channel.artifacts.every((artifact) => artifact.downloadUrl)).toBe(true);
      }
    });
  });

  it('names the file it actually serves', () => {
    // The bug this pins: both download surfaces rendered artifact filenames with their own
    // build version while the links pointed at the release tag's assets, so the page
    // advertised `…_5.0.0_x64-setup.exe` and served `…_4.7.0_x64-setup.exe` — a name that
    // was not the name of anything. A release asset's published filename is fixed, so the
    // displayed name and the link's last path segment have to be the same string.
    for (const channel of listPublishedDownloads()) {
      for (const artifact of channel.artifacts) {
        if (!artifact.downloadUrl || isSiteRelativeDownload(artifact.downloadUrl)) {
          continue;
        }

        expect(basenameOf(artifact.downloadUrl)).toBe(artifact.filename);
        expect(artifact.filename).not.toContain('{version}');
      }

      if (channel.downloadUrl && !isSiteRelativeDownload(channel.downloadUrl)) {
        expect(channel.artifacts.map((artifact) => artifact.filename)).toContain(basenameOf(channel.downloadUrl));
      }
    }
  });

  it('substitutes the build version into a site-hosted artifact filename', () => {
    // Still the helper for the site-hosted case, where the deploy produces the file at the
    // caller's build version. No published artifact uses a placeholder today.
    expect(formatArtifactFilename('Eidolon.Simulacra_{version}_x64-setup.exe', '4.0.0')).toBe(
      'Eidolon.Simulacra_4.0.0_x64-setup.exe',
    );
    expect(formatArtifactFilename('app-release.apk', '4.0.0')).toBe('app-release.apk');
  });

  it('exposes the download page metadata and lookup', () => {
    expect(getInfoPage('download').webPath).toBe('/download');
    expect(getInfoPageByPath('/download')?.kind).toBe('composed');
    expect(getInfoPageSummary('download', 'mobile').trim().length).toBeGreaterThan(0);
    expect(() => getDownloadChannel('nope' as DownloadChannelId)).toThrow(/Unknown download channel/);
  });

  it('marks the Android build as debug-signed instead of store-ready', () => {
    // Verified in packages/mobile/android/app/build.gradle: the release variant
    // uses the debug keystore, so the page must not imply a store-ready release.
    const android = getDownloadChannel('android');
    const notes = android.notes.join(' ').toLowerCase();

    expect(notes).toContain('debug keystore');
    expect(notes).toContain('store-ready');
  });

  it('keeps a repository pointer and an honest notice for the unpublished state', () => {
    expect(downloadRepositoryUrl.startsWith('https://github.com/')).toBe(true);
    expect(unpublishedDownloadNotice.trim().length).toBeGreaterThan(0);
  });
});
