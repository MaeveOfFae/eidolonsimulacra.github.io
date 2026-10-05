import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const packagesDir = path.join(repoRoot, 'packages');

/**
 * Intentional staging exceptions. A placeholder listed here may exist without
 * being imported anywhere. Keep this empty unless a placeholder is deliberately
 * shipped ahead of the code that will consume it.
 */
const ALLOWED_UNWIRED = new Set([]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'target', 'gen', '.turbo', 'coverage']);

async function walk(directory, results = []) {
  let entries;

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      await walk(fullPath, results);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

async function collectSourceFiles() {
  const files = [];
  let packageEntries;

  try {
    packageEntries = await fs.readdir(packagesDir, { withFileTypes: true });
  } catch {
    throw new Error(`Unable to read the workspace packages directory at ${packagesDir}.`);
  }

  for (const entry of packageEntries) {
    if (!entry.isDirectory()) {
      continue;
    }
    await walk(path.join(packagesDir, entry.name, 'src'), files);
  }

  return files;
}

async function main() {
  const sourceFiles = await collectSourceFiles();
  const sources = await Promise.all(
    sourceFiles.map(async (file) => ({ file, content: await fs.readFile(file, 'utf8') })),
  );

  const placeholderFiles = sourceFiles.filter((file) => /Placeholder\.tsx?$/.test(file));
  const unwired = [];

  for (const placeholderFile of placeholderFiles) {
    const moduleName = path.basename(placeholderFile).replace(/\.tsx?$/, '');

    if (ALLOWED_UNWIRED.has(moduleName)) {
      continue;
    }

    const importPattern = new RegExp(`from\\s+['"][^'"]*\\b${moduleName}['"]`);
    const isWired = sources.some((entry) => entry.file !== placeholderFile && importPattern.test(entry.content));

    if (!isWired) {
      unwired.push(path.relative(repoRoot, placeholderFile).split(path.sep).join('/'));
    }
  }

  if (unwired.length > 0) {
    throw new Error(
      [
        'Unwired placeholder components found. Either wire the component into a screen or delete it:',
        ...unwired.map((file) => `  - ${file}`),
      ].join('\n'),
    );
  }

  console.log(
    `Placeholder wiring check passed: ${placeholderFiles.length} placeholder file(s) present, all referenced.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
