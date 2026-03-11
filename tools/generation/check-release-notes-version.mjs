import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const webPackageJsonPath = path.join(repoRoot, 'packages/web/package.json');
const releaseNotesPath = path.join(repoRoot, 'packages/web/src/lib/whats-new.ts');

async function main() {
  const webPackageJson = JSON.parse(await fs.readFile(webPackageJsonPath, 'utf8'));
  const releaseNotesSource = await fs.readFile(releaseNotesPath, 'utf8');
  const firstVersionMatch = releaseNotesSource.match(/version:\s*'([^']+)'/);

  if (!firstVersionMatch) {
    throw new Error('Unable to find the latest release note version in packages/web/src/lib/whats-new.ts.');
  }

  const latestReleaseVersion = firstVersionMatch[1];

  if (latestReleaseVersion !== webPackageJson.version) {
    throw new Error(
      `Release note version mismatch: latest release note is ${latestReleaseVersion}, but packages/web/package.json is ${webPackageJson.version}.`,
    );
  }

  console.log(`Release note version check passed: ${latestReleaseVersion}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});