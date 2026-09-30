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

async function main() {
  const { downloadChannels, isSiteRelativeDownload, listChannelDownloadUrls } = await loadSharedModule();
  const problems = [];
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
