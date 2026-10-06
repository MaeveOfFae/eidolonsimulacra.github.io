/**
 * Verifies the committed Danbooru tag index artifacts without re-downloading the
 * ~200 MB source dump (that is what `pnpm tags:build` is for).
 *
 * Checked here, because it is mechanical:
 *   - `packages/shared/src/generated/danbooru-tags.ts` exists and its embedded core CSV
 *     parses: header, sorted unique names, well-formed columns, manifest counts and
 *     checksums match the extracted data
 *   - `packages/web/public/danbooru/tags.csv` + `tag-aliases.csv` exist and pass the same
 *     structural checks, their checksums match the manifest, every alias target is a
 *     canonical name in the full index, and every core tag is present in the full index
 *
 * Not checked: whether a rebuild today would produce identical data — the upstream dump
 * moves daily, so that would make CI flaky for no product reason. Refresh deliberately
 * with `pnpm tags:build --refresh` and commit the result together with the new manifest.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const generatedTsPath = path.join(repoRoot, 'packages/shared/src/generated/danbooru-tags.ts');
const publicTagsPath = path.join(repoRoot, 'packages/web/public/danbooru/tags.csv');
const publicAliasesPath = path.join(repoRoot, 'packages/web/public/danbooru/tag-aliases.csv');

const TAGS_HEADER = 'name,category,post_count,deprecated';
const ALIASES_HEADER = 'alias,canonical';

const readNormalised = (file) => readFileSync(file, 'utf8');
const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

const failures = [];
const check = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

function parseManifestField(source, field) {
  const match = source.match(new RegExp(`^\\s*${field}: ('(?:[^']|\\\\.)*'|-?\\d+),?$`, 'm'));
  if (!match) {
    return undefined;
  }
  const value = match[1];
  return value.startsWith("'") ? value.slice(1, -1).replace(/\\'/g, "'") : Number(value);
}

function parseTagsCsv(csv) {
  const rows = [];
  let sorted = true;
  let previousName = '';
  for (const line of csv.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === TAGS_HEADER) {
      continue;
    }
    const fields = trimmed.split(',');
    if (fields.length !== 4) {
      failures.push(`malformed tag row: ${trimmed.slice(0, 80)}`);
      continue;
    }
    const [name, category, postCount, deprecated] = fields;
    if (name <= previousName) {
      sorted = false;
    }
    previousName = name;
    rows.push({ name, category, postCount, deprecated });
  }
  return { rows, sorted };
}

function parseAliasesCsv(csv) {
  const rows = [];
  let sorted = true;
  let previousAlias = '';
  for (const line of csv.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === ALIASES_HEADER) {
      continue;
    }
    const separator = trimmed.indexOf(',');
    if (separator === -1) {
      failures.push(`malformed alias row: ${trimmed.slice(0, 80)}`);
      continue;
    }
    const alias = trimmed.slice(0, separator);
    const canonical = trimmed.slice(separator + 1);
    if (alias <= previousAlias) {
      sorted = false;
    }
    previousAlias = alias;
    rows.push({ alias, canonical });
  }
  return { rows, sorted };
}

if (!existsSync(generatedTsPath)) {
  throw new Error('packages/shared/src/generated/danbooru-tags.ts is missing; run pnpm tags:build.');
}
for (const publicPath of [publicTagsPath, publicAliasesPath]) {
  check(existsSync(publicPath), `missing artifact: ${path.relative(repoRoot, publicPath)}`);
}

const generatedSource = readNormalised(generatedTsPath).replace(/\r\n/g, '\n');
const coreCsvMatch = generatedSource.match(/export const DANBOORU_TAGS_CORE_CSV = `([^`]*)`;/);
check(Boolean(coreCsvMatch), 'could not extract DANBOORU_TAGS_CORE_CSV from the generated module.');

if (!coreCsvMatch) {
  console.error('[danbooru-index-check] the generated module is unreadable.');
  process.exitCode = 1;
} else {
  const coreCsv = coreCsvMatch[1];

  for (const field of [
    'dataset',
    'revision',
    'generatedAt',
    'cutoffFullPostCount',
    'coreTagLimit',
    'fullTagCount',
    'coreTagCount',
    'aliasCount',
    'coreCsvSha256',
    'fullCsvSha256',
    'aliasesCsvSha256',
  ]) {
    check(parseManifestField(generatedSource, field) !== undefined, `manifest is missing ${field}.`);
  }

  const core = parseTagsCsv(coreCsv);
  check(core.sorted, 'the core CSV is not sorted by name ascending (unique + binary-searchable).');
  check(
    core.rows.every(
      (row) => /^\d+$/.test(row.category) && /^\d+$/.test(row.postCount) && /^[01]$/.test(row.deprecated),
    ),
    'the core CSV has a malformed category / post_count / deprecated column.',
  );
  check(core.rows.length > 5000, `the core CSV is suspiciously small (${core.rows.length} rows).`);
  check(
    parseManifestField(generatedSource, 'coreTagCount') === core.rows.length,
    `manifest coreTagCount does not match the extracted core rows (${core.rows.length}).`,
  );
  check(
    parseManifestField(generatedSource, 'coreCsvSha256') === sha256(coreCsv),
    'manifest coreCsvSha256 does not match the extracted core CSV.',
  );

  if (existsSync(publicTagsPath)) {
    const fullCsvText = readNormalised(publicTagsPath);
    const full = parseTagsCsv(fullCsvText);
    check(full.sorted, 'packages/web/public/danbooru/tags.csv is not sorted by name ascending.');
    check(
      parseManifestField(generatedSource, 'fullTagCount') === full.rows.length,
      `manifest fullTagCount does not match the public tags.csv rows (${full.rows.length}).`,
    );
    check(
      parseManifestField(generatedSource, 'fullCsvSha256') === sha256(fullCsvText),
      'manifest fullCsvSha256 does not match packages/web/public/danbooru/tags.csv.',
    );

    const coreNames = new Set(core.rows.map((row) => row.name));
    const fullNames = new Set(full.rows.map((row) => row.name));
    const missingFromFull = [...coreNames].filter((name) => !fullNames.has(name)).slice(0, 5);
    check(missingFromFull.length === 0, `core tags missing from the full index: ${missingFromFull.join(', ')}`);

    if (existsSync(publicAliasesPath)) {
      const aliasesCsvText = readNormalised(publicAliasesPath);
      const aliases = parseAliasesCsv(aliasesCsvText);
      check(aliases.sorted, 'packages/web/public/danbooru/tag-aliases.csv is not sorted by alias ascending.');
      check(
        parseManifestField(generatedSource, 'aliasCount') === aliases.rows.length,
        `manifest aliasCount does not match the public tag-aliases.csv rows (${aliases.rows.length}).`,
      );
      check(
        parseManifestField(generatedSource, 'aliasesCsvSha256') === sha256(aliasesCsvText),
        'manifest aliasesCsvSha256 does not match packages/web/public/danbooru/tag-aliases.csv.',
      );
      const dangling = aliases.rows.filter((row) => !fullNames.has(row.canonical)).slice(0, 5);
      check(
        dangling.length === 0,
        `alias targets missing from the full index: ${dangling.map((row) => row.alias).join(', ')}`,
      );
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`[danbooru-index-check] ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Danbooru index check passed: core ${core.rows.length.toLocaleString()} tags, ` +
        `public ${parseManifestField(generatedSource, 'fullTagCount')?.toLocaleString()} tags, ` +
        `${parseManifestField(generatedSource, 'aliasCount')?.toLocaleString()} aliases.`,
    );
  }
}
