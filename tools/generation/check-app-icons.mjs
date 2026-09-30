import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * CI gate for the committed icon artifacts.
 *
 * `pnpm icons:generate` (tools/generation/generate-app-icons.ps1, Windows-only
 * because it uses System.Drawing) produces every file checked here and the
 * results are committed, so like `downloads:check` this only validates that the
 * committed tree is complete: no icon surface may silently go missing, and the
 * icon references in index.html / manifest.json / tauri.conf.json must resolve
 * to real files in `public/` (or `src-tauri/`).
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const problems = [];
const notes = [];

async function statOrNull(relativePath) {
  try {
    return await fs.stat(path.join(repoRoot, relativePath));
  } catch {
    return null;
  }
}

/** A declared icon must exist and be a real image, not a stub. */
async function requireIcon(relativePath, minimumBytes) {
  const stats = await statOrNull(relativePath);

  if (!stats) {
    problems.push(`missing ${relativePath} — run \`pnpm icons:generate\``);
    return;
  }
  if (stats.size < minimumBytes) {
    problems.push(`${relativePath} is only ${stats.size} bytes (expected >= ${minimumBytes})`);
  }
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(repoRoot, relativePath), 'utf8'));
}

async function checkWeb() {
  // favicon.ico packs 16/32/48 PNG entries (~0.5 KB total for simple art);
  // the floor only needs to catch stub/empty files, not judge art density.
  await requireIcon('packages/web/public/favicon.ico', 300);
  await requireIcon('packages/web/public/icons/apple-touch-icon.png', 1_024);

  const iconFiles = [72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
    path: `packages/web/public/icons/icon-${size}x${size}.png`,
    minBytes: 256,
  }));

  for (const size of [16, 32]) {
    iconFiles.push({ path: `packages/web/public/icons/favicon-${size}x${size}.png`, minBytes: 128 });
  }

  for (const name of ['generate-icon.png', 'drafts-icon.png']) {
    iconFiles.push({ path: `packages/web/public/icons/${name}`, minBytes: 256 });
  }

  for (const icon of iconFiles) {
    await requireIcon(icon.path, icon.minBytes);
  }

  // Every icon declared by the PWA manifest must exist in public/.
  const manifest = await readJson('packages/web/public/manifest.json');
  const manifestSources = [
    ...manifest.icons.map((icon) => icon.src),
    ...(manifest.shortcuts ?? []).flatMap((shortcut) => (shortcut.icons ?? []).map((icon) => icon.src)),
  ];

  for (const src of manifestSources) {
    const relativePath = path.join('packages/web/public', src);

    if (!(await statOrNull(relativePath))) {
      problems.push(`manifest.json declares ${src} but ${relativePath} does not exist`);
    }
  }

  // Every absolute href referenced by index.html must exist in public/.
  const indexHtml = await fs.readFile(path.join(repoRoot, 'packages/web/index.html'), 'utf8');
  const hrefs = [...indexHtml.matchAll(/href="(\/[^"]+)"/g)].map((match) => match[1]);

  for (const href of hrefs) {
    const relativePath = path.join('packages/web/public', href);

    if (!(await statOrNull(relativePath))) {
      problems.push(`index.html references ${href} but ${relativePath} does not exist`);
    }
  }


  notes.push(`web: favicon, ${iconFiles.length} icon file(s), manifest + index.html links resolve`);
}

async function checkDesktop() {
  const config = await readJson('packages/web/src-tauri/tauri.conf.json');
  const icons = config.bundle?.icon ?? [];

  if (icons.length === 0) {
    problems.push('tauri.conf.json declares no bundle icons');
  }

  for (const icon of icons) {
    await requireIcon(path.join('packages/web/src-tauri', icon), 512);
  }

  notes.push(`desktop: ${icons.length} tauri.conf.json bundle icon(s) present`);
}

const androidDensities = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
const splashDensities = ['drawable-mdpi', 'drawable-hdpi', 'drawable-xhdpi', 'drawable-xxhdpi', 'drawable-xxxhdpi'];
const androidResRoot = 'packages/mobile/android/app/src/main/res';

async function checkMobile() {
  for (const name of ['icon.png', 'adaptive-icon.png', 'splash-icon.png']) {
    await requireIcon(`packages/mobile/assets/${name}`, 20_000);
  }

  let launcherCount = 0;
  for (const density of androidDensities) {
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      // A clean 48px launcher PNG of flat art is ~170 bytes; the floor only
      // needs to catch stub/empty files.
      await requireIcon(`${androidResRoot}/${density}/${name}`, 120);
      launcherCount += 1;
    }

    // The template .webp launchers were replaced by PNG; AAPT would fail on
    // two resources with the same name, so leftovers mean a stale tree.
    const files = await fs.readdir(path.join(repoRoot, androidResRoot, density)).catch(() => []);
    const stale = files.filter((file) => file.endsWith('.webp'));

    if (stale.length > 0) {
      problems.push(`${androidResRoot}/${density} still contains ${stale.join(', ')} — run \`pnpm icons:generate\``);
    }
  }

  let splashCount = 0;
  for (const density of splashDensities) {
    await requireIcon(`${androidResRoot}/${density}/splashscreen_logo.png`, 1_024);
    splashCount += 1;
  }

  const appJson = await readJson('packages/mobile/app.json');
  const expoIcon = appJson.expo?.icon;

  if (!expoIcon) {
    problems.push('app.json has no expo.icon — future prebuilds would fall back to the default Expo art');
  } else if (!(await statOrNull(path.join('packages/mobile', expoIcon.replace('./', ''))))) {
    problems.push(`app.json expo.icon points at ${expoIcon} which does not exist`);
  }

  notes.push(`mobile: expo assets, ${launcherCount} launcher PNG(s), ${splashCount} splash logo(s), app.json wired`);
}

await checkWeb();
await checkDesktop();
await checkMobile();

if (problems.length > 0) {
  console.error('App icon check failed:');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

for (const note of notes) {
  console.log(`  ok  ${note}`);
}
console.log('App icon check passed.');
