import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Verifies that a build actually produced what it claims to have produced.
 *
 * The pipeline in the root `package.json` runs shared -> web -> desktop -> mobile
 * and ends here, so a target that silently did nothing (or built against a stale
 * dependency) fails loudly instead of being discovered later. Run it standalone
 * against one target with `--target web` when only that target was built.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
/** Every `--target X` supplied, so CI can verify just the targets it built. */
const onlyTargets = args.reduce(
  (collected, arg, index) => (arg === '--target' && args[index + 1] ? [...collected, args[index + 1]] : collected),
  [],
);
const wantsAll = onlyTargets.length === 0 || onlyTargets.includes('all');

function toRepoRelative(targetPath) {
  return path.relative(repoRoot, targetPath).split(path.sep).join('/');
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(repoRoot, relativePath), 'utf8'));
}

async function statOrNull(targetPath) {
  try {
    return await fs.stat(targetPath);
  } catch {
    return null;
  }
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);

  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

/** Non-trivial output: an empty or stub file is a failure, not a pass. */
function requireSize(stats, minimumBytes) {
  return stats.size >= minimumBytes;
}

async function checkShared(problems, notes) {
  // Thresholds reflect the real emit: `index.js` is ~350 KB, `index.d.ts` ~7 KB,
  // `types/index.d.ts` ~24 KB, and `services/index.d.ts` is a genuine 189-byte
  // barrel of re-exports. Everything must also contain `export`, so an empty stub
  // fails no matter how the sizes shift.
  const files = [
    { path: 'packages/shared/dist/index.js', minBytes: 100_000 },
    { path: 'packages/shared/dist/index.d.ts', minBytes: 2_048 },
    { path: 'packages/shared/dist/types/index.d.ts', minBytes: 1_024 },
    { path: 'packages/shared/dist/services/index.d.ts', minBytes: 64 },
  ];

  for (const file of files) {
    const absolutePath = path.join(repoRoot, file.path);
    const stats = await statOrNull(absolutePath);

    if (!stats) {
      problems.push(`shared: missing ${file.path} — run \`pnpm build:shared\``);
      continue;
    }

    if (!requireSize(stats, file.minBytes)) {
      problems.push(`shared: ${file.path} is only ${stats.size} bytes — the declaration emit may have failed`);
      continue;
    }

    const contents = await fs.readFile(absolutePath, 'utf8');
    if (!contents.includes('export')) {
      problems.push(`shared: ${file.path} contains no exports`);
    }
  }

  notes.push('shared: dist bundle and declarations present');
}

async function checkWeb(problems, notes) {
  const distDir = path.join(repoRoot, 'packages/web/dist');
  const indexHtml = await statOrNull(path.join(distDir, 'index.html'));

  if (!indexHtml) {
    problems.push('web: missing packages/web/dist/index.html — run `pnpm build:web`');
    return;
  }

  if (!requireSize(indexHtml, 256)) {
    problems.push('web: packages/web/dist/index.html is suspiciously small');
  }

  const assets = await listFiles(path.join(distDir, 'assets'));
  if (assets.filter((name) => name.endsWith('.js')).length === 0) {
    problems.push('web: packages/web/dist/assets has no JavaScript bundle');
  }

  // Everything in public/downloads must survive the Vite copy, or a published
  // download link would 404 even though `downloads:check` passed.
  const publicDownloads = await listFiles(path.join(repoRoot, 'packages/web/public/downloads'));
  const publishedDownloads = await listFiles(path.join(distDir, 'downloads'));
  const missingDownloads = publicDownloads.filter((name) => !publishedDownloads.includes(name));

  if (missingDownloads.length > 0) {
    problems.push(`web: downloads/ is missing from dist: ${missingDownloads.join(', ')}`);
  }

  notes.push(`web: dist with ${assets.length} asset(s) and ${publishedDownloads.length} published download(s)`);
}

async function checkDesktop(problems, notes) {
  const { version } = await readJson('packages/web/package.json');
  const bundleRoot = path.join(repoRoot, 'packages/web/src-tauri/target/release/bundle');
  const bundleStats = await statOrNull(bundleRoot);

  if (!bundleStats) {
    problems.push('desktop: no bundle output — run `pnpm build:desktop`');
    return;
  }

  const installers = [];

  for (const kind of ['nsis', 'msi']) {
    const files = await listFiles(path.join(bundleRoot, kind));
    installers.push(...files.filter((name) => name.includes(version)));
  }

  if (installers.length === 0) {
    problems.push(`desktop: no installer for version ${version} under bundle/ — the bundle is stale or missing`);
    return;
  }

  notes.push(`desktop: installer(s) for ${version}: ${installers.join(', ')}`);
}

async function checkMobile(problems, notes) {
  const appConfig = await readJson('packages/mobile/app.json');
  const apkPath = path.join(repoRoot, 'packages/mobile/android/app/build/outputs/apk/release/app-release.apk');
  const stats = await statOrNull(apkPath);

  if (!stats) {
    problems.push('mobile: missing app-release.apk — run `pnpm build:mobile`');
    return;
  }

  if (!requireSize(stats, 1024 * 1024)) {
    problems.push(`mobile: app-release.apk is only ${stats.size} bytes — the APK build failed`);
    return;
  }

  notes.push(`mobile: app-release.apk for v${appConfig.expo.version} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
}

async function main() {
  const targets = [
    { id: 'shared', run: checkShared },
    { id: 'web', run: checkWeb },
    { id: 'desktop', run: checkDesktop },
    { id: 'mobile', run: checkMobile },
  ].filter((target) => wantsAll || onlyTargets.includes(target.id));

  if (targets.length === 0) {
    throw new Error('Unknown --target. Expected one of: all, shared, web, desktop, mobile.');
  }

  const problems = [];
  const notes = [];

  for (const target of targets) {
    await target.run(problems, notes);
  }

  notes.forEach((note) => console.log(`  ok  ${note}`));

  if (problems.length > 0) {
    throw new Error(['Build verification failed:', ...problems.map((problem) => `  - ${problem}`)].join('\n'));
  }

  console.log(`Build verification passed: ${targets.map((target) => target.id).join(', ')}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
