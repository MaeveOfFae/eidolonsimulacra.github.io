import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Guards site-hosted downloads.
 *
 * A channel in `packages/shared/src/info/download.ts` may point `downloadUrl` at
 * `/downloads/<file>`, which the published site serves out of
 * `packages/web/public/downloads/`. That only works if the file is actually
 * committed, so this check fails the build when a channel advertises a
 * site-relative download with nothing behind it — the failure mode being a
 * download button that 404s.
 *
 * Absolute `https://` downloads are ignored here: they are somebody else's
 * uptime, and nothing in this repository can verify them.
 *
 * Its other job is the published version. `download.ts` names one release's assets, and that
 * version must never lead the app's own — the app version is bumped first, so a leading
 * download version points at a release that cannot exist yet and every button 404s. Lagging
 * is legitimate, because the binaries are uploaded by hand, but it is announced rather than
 * silent: that is how the page came to advertise filenames it was not serving.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const downloadsDir = path.join(repoRoot, 'packages/web/public/downloads');
const sharedEntry = path.join(repoRoot, 'packages/shared/dist/index.js');

/** A published artifact smaller than this is almost certainly a mistake or an LFS pointer. */
const MIN_ARTIFACT_BYTES = 64 * 1024;

function toRepoRelative(targetPath) {
  return path.relative(repoRoot, targetPath).split(path.sep).join('/');
}

async function loadSharedModule() {
  try {
    return await import(pathToFileURL(sharedEntry).href);
  } catch {
    throw new Error(`Unable to read ${toRepoRelative(sharedEntry)}. Run \`pnpm build:shared\` first.`);
  }
}

/** -1, 0 or 1 for how two `x.y.z` versions order. */
function compareVersions(left, right) {
  const parts = (value) => value.split('.').map((part) => Number.parseInt(part, 10));
  const [leftParts, rightParts] = [parts(left), parts(right)];

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);

    if (difference !== 0) {
      return Math.sign(difference);
    }
  }

  return 0;
}

async function main() {
  const { downloadChannels, downloadReleaseVersion, isSiteRelativeDownload, listChannelDownloadUrls } =
    await loadSharedModule();
  const problems = [];

  const appVersion = JSON.parse(await fs.readFile(path.join(repoRoot, 'packages/web/package.json'), 'utf8')).version;
  const leading = compareVersions(downloadReleaseVersion, appVersion);

  if (leading > 0) {
    throw new Error(
      `download.ts serves release v${downloadReleaseVersion}, ahead of the app's ${appVersion}: ` +
        'the app version is bumped first, so that release cannot exist yet and every download button would 404.',
    );
  }

  if (leading < 0) {
    console.warn(
      `  note: downloads still serve release v${downloadReleaseVersion} while the app is ${appVersion}. ` +
        'Publish the release assets, then bump RELEASE_VERSION (docs/DOWNLOADS.md).',
    );
  }
  /** Unique site-hosted files, so one file shared by two links is checked once. */
  const declared = new Map();

  for (const channel of downloadChannels) {
    for (const downloadUrl of listChannelDownloadUrls(channel)) {
      if (!isSiteRelativeDownload(downloadUrl)) {
        continue; // absolute URLs are somebody else's uptime
      }

      const relative = decodeURIComponent(downloadUrl.replace(/^\//, ''));
      const artifactPath = path.join(downloadsDir, path.basename(relative));
      const key = path.resolve(artifactPath);
      const existing = declared.get(key);

      if (existing) {
        existing.channelIds.add(channel.id);
        continue;
      }

      declared.set(key, { artifactPath, downloadUrl, channelIds: new Set([channel.id]) });
    }
  }

  for (const { artifactPath, downloadUrl, channelIds } of declared.values()) {
    const label = Array.from(channelIds).join('+');
    let stats;

    try {
      stats = await fs.stat(artifactPath);
    } catch {
      problems.push(`${label}: ${downloadUrl} has no file at ${toRepoRelative(artifactPath)}`);
      continue;
    }

    if (!stats.isFile()) {
      problems.push(`${label}: ${toRepoRelative(artifactPath)} is not a file`);
      continue;
    }

    if (stats.size < MIN_ARTIFACT_BYTES) {
      problems.push(
        `${label}: ${toRepoRelative(artifactPath)} is only ${stats.size} bytes — too small to be a published build`,
      );
      continue;
    }

    console.log(`  ${label}: ${downloadUrl} -> ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  }

  if (problems.length > 0) {
    throw new Error(
      [
        'Site-hosted download problems. Either commit the artifact under packages/web/public/downloads/,',
        'or point the channel at an https:// URL instead:',
        ...problems.map((problem) => `  - ${problem}`),
      ].join('\n'),
    );
  }

  console.log(`  published downloads serve release v${downloadReleaseVersion} (app ${appVersion}).`);

  console.log(
    declared.size === 0
      ? 'Download artifact check passed: no site-hosted downloads declared yet.'
      : `Download artifact check passed: ${declared.size} site-hosted file(s) present.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
