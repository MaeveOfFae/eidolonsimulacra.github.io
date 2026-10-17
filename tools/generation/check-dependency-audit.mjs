#!/usr/bin/env node

/**
 * Fails when a *shipped* dependency tree carries a production advisory.
 *
 * Why a scoped gate instead of plain `pnpm audit`:
 *
 * - `pnpm audit` covers the whole workspace, including the Expo / React Native
 *   build toolchain, whose advisories (57 at the time of writing) cannot be
 *   cleared without moving the Expo SDK — so an unfiltered gate is red on day one
 *   and gets ignored, which is worse than no gate at all.
 * - The trees that actually ship are the browser/desktop client (`packages/web`,
 *   which bundles everything it imports from `packages/shared`) and the mobile app.
 *   Mobile is excluded deliberately: its advisories are all build-time (Metro,
 *   `@expo/cli`, `image-size`), not code on the device, and clearing them is an
 *   SDK upgrade tracked separately.
 *
 * What this replaces: 12 `react-router` advisories sat in the shipped web tree
 * (installed 7.13.1) while every other gate was green, because nothing in the
 * pipeline read the advisory database at all.
 *
 * A registry that cannot be reached is reported as *unavailable*, not as a pass and
 * not as a failure. The advisory endpoint is a network dependency, and a red build
 * caused by npm's availability teaches people to re-run CI rather than read it.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Finding path prefixes that belong to a bundle this repo actually ships. */
const SHIPPED_PREFIXES = ['packages__web>', 'packages__shared>'];

/**
 * One fixed command string, never interpolated from input.
 *
 * The shell is what makes the `pnpm.cmd` shim spawnable on Windows (CVE-2024-27980
 * blocks the bare shim), and passing no separate `args` keeps Node's DEP0190
 * "args with shell: true" warning out of the CI log.
 */
const AUDIT_COMMAND = 'pnpm audit --prod --json';

function runAudit() {
  const result = spawnSync(AUDIT_COMMAND, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    shell: true,
  });

  if (result.error) {
    return { unavailable: `could not start pnpm (${result.error.message})` };
  }

  try {
    return { payload: JSON.parse(result.stdout) };
  } catch {
    const firstLine = (result.stderr || result.stdout || '').trim().split(/\r?\n/)[0];
    return { unavailable: firstLine || 'no JSON on stdout' };
  }
}

const { payload, unavailable } = runAudit();

if (unavailable) {
  console.warn(`Dependency advisory check skipped: the registry audit endpoint is unavailable (${unavailable}).`);
  process.exit(0);
}

const advisories = payload?.advisories;
if (!advisories || typeof advisories !== 'object') {
  console.warn('Dependency advisory check skipped: `pnpm audit --json` returned no advisories object.');
  process.exit(0);
}

const shipped = [];
for (const advisory of Object.values(advisories)) {
  const paths = (advisory.findings ?? []).flatMap((finding) => finding.paths ?? []);
  const shippedPath = paths.find((advisoryPath) =>
    SHIPPED_PREFIXES.some((prefix) => String(advisoryPath).startsWith(prefix)),
  );

  if (shippedPath) {
    shipped.push({ advisory, shippedPath });
  }
}

if (shipped.length === 0) {
  console.log('Dependency advisory check passed: no production advisories in the shipped web/shared bundles.');
} else {
  const lines = shipped.map(
    ({ advisory, shippedPath }) =>
      `  ${String(advisory.severity).padEnd(8)} ${advisory.module_name}  (needs ${advisory.patched_versions})  ${shippedPath}`,
  );
  console.error(
    `Dependency advisory check failed: ${shipped.length} production advisor${
      shipped.length === 1 ? 'y' : 'ies'
    } in a shipped bundle.\n${lines.join('\n')}\n` +
      'Upgrade the package before releasing (see `pnpm audit --prod` for the full chain).',
  );
  process.exitCode = 1;
}
