/**
 * Builds the local Danbooru tag index used by the a1111 tag linter.
 *
 * Two artifacts come out of one run, deliberately split by size:
 *
 *   1. `packages/shared/src/generated/danbooru-tags.ts` — a compact "core" index
 *      (top tags by post count) that ships inside the shared bundle so web, desktop
 *      and mobile all get offline linting without a download. Guarded to stay small,
 *      because tsup bundles shared with `splitting: false`, so anything reachable from
 *      the export graph lands in the initial chunk.
 *   2. `packages/web/public/danbooru/tags.csv` + `tag-aliases.csv` — the fuller index,
 *      fetched lazily by the web/desktop linter and served as static assets. Mobile
 *      never fetches these; it runs on the core index alone.
 *
 * Source data: the `deepghs/site_tags` Hugging Face dataset (CC-BY-4.0), which mirrors
 * Danbooru's `tags` and `tag_aliases` tables. The full `tags.csv` is ~200 MB, so this
 * is a maintainer step (`pnpm tags:build`), never a CI step; `pnpm tags:check` verifies
 * the committed artifacts instead (see `check-danbooru-index.mjs`).
 *
 * Usage:
 *   node tools/generation/build-danbooru-index.mjs [--cutoff 20] [--core-limit 12000]
 *     [--revision main|<sha>] [--refresh] [--offline] [--skip-public]
 *
 * Downloads are cached under `node_modules/.cache/char-gen-danbooru/` so re-runs with
 * different cutoffs are instant until `--refresh` is passed.
 */
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const DATASET = 'deepghs/site_tags';
const TAGS_PATH_IN_REPO = 'danbooru.donmai.us/tags.csv';
const ALIASES_PATH_IN_REPO = 'danbooru.donmai.us/tag_aliases.csv';

const sharedGeneratedTs = path.join(repoRoot, 'packages/shared/src/generated/danbooru-tags.ts');
const publicDir = path.join(repoRoot, 'packages/web/public/danbooru');
const publicTagsCsv = path.join(publicDir, 'tags.csv');
const publicAliasesCsv = path.join(publicDir, 'tag-aliases.csv');

const cacheDir = path.join(repoRoot, 'node_modules/.cache/char-gen-danbooru');
const cachedTagsCsv = path.join(cacheDir, 'tags.csv');
const cachedAliasesCsv = path.join(cacheDir, 'tag_aliases.csv');

const TAGS_HEADER = 'name,category,post_count,deprecated';
const ALIASES_HEADER = 'alias,canonical';

/** Size guards: the shared-bundle artifact must stay small, the public assets bounded. */
const CORE_BYTE_LIMIT = 420_000;
const FULL_BYTE_LIMIT = 12_000_000;
const ALIAS_BYTE_LIMIT = 5_000_000;
/** Chain-following bound when resolving alias → canonical → … at build time. */
const MAX_ALIAS_CHAIN = 10;

const args = process.argv.slice(2);
const flagValue = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 || index + 1 >= args.length ? fallback : args[index + 1];
};
const hasFlag = (name) => args.includes(`--${name}`);

const cutoffFull = Number.parseInt(flagValue('cutoff', '20'), 10);
const coreLimit = Number.parseInt(flagValue('core-limit', '12000'), 10);
const revision = flagValue('revision', 'main');
const refresh = hasFlag('refresh');
const offline = hasFlag('offline');
const skipPublic = hasFlag('skip-public');

if (!Number.isFinite(cutoffFull) || cutoffFull < 1) {
  throw new Error('--cutoff must be a positive integer (minimum post_count kept in the full index).');
}
if (!Number.isFinite(coreLimit) || coreLimit < 100) {
  throw new Error('--core-limit must be an integer of at least 100.');
}

function log(message) {
  console.log(`[danbooru-index] ${message}`);
}

async function resolveRevisionSha() {
  const url = `https://huggingface.co/api/datasets/${DATASET}/revision/${revision}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'char-gen-tag-index-builder' } });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = (await response.json()) ?? {};
    if (typeof payload.sha !== 'string' || payload.sha.length === 0) {
      throw new Error('response carried no sha');
    }
    return payload.sha;
  } catch (error) {
    log(
      `could not resolve the dataset revision sha (${
        error instanceof Error ? error.message : error
      }); recording the requested revision instead.`,
    );
    return revision;
  }
}

async function downloadTo(url, destination) {
  const response = await fetch(url, { headers: { 'User-Agent': 'char-gen-tag-index-builder' } });
  if (!response.ok || !response.body) {
    throw new Error(`download failed for ${url}: HTTP ${response.status}`);
  }

  const totalBytes = Number.parseInt(response.headers.get('content-length') ?? '0', 10);
  let seen = 0;
  let lastReport = 0;
  mkdirSync(path.dirname(destination), { recursive: true });

  const { pipeline } = await import('node:stream/promises');
  const { Transform } = await import('node:stream');
  const sink = createWriteStream(destination);

  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      seen += chunk.length;
      if (totalBytes && seen - lastReport > 25_000_000) {
        lastReport = seen;
        log(
          `downloading ${path.basename(destination)}: ${(seen / 1_000_000).toFixed(0)} / ${(totalBytes / 1_000_000).toFixed(0)} MB`,
        );
      }
      callback(null, chunk);
    },
  });

  await pipeline(response.body, counter, sink);
  log(`downloaded ${path.basename(destination)} (${(seen / 1_000_000).toFixed(1)} MB)`);
}

async function ensureSource(localPath, repoPath) {
  if (existsSync(localPath) && !refresh) {
    log(`using cached ${path.basename(localPath)}`);
    return;
  }
  if (offline) {
    throw new Error(`${path.basename(localPath)} is not cached and --offline was passed; run once without --offline.`);
  }
  const url = `https://huggingface.co/datasets/${DATASET}/resolve/${revision}/${repoPath}`;
  await downloadTo(url, localPath);
}

/** Minimal quote-aware single-line CSV parser (the sources quote fields but never embed newlines). */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

/** Async row iterator that tolerates quoted fields spanning physical lines. */
async function* csvRows(filePath) {
  const reader = readline.createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  let buffered = null;
  for await (const line of reader) {
    buffered = buffered === null ? line : `${buffered}\n${line}`;
    const quoteCount = (buffered.match(/"/g) ?? []).length;
    if (quoteCount % 2 === 1) {
      continue; // an open quote: the row continues on the next physical line
    }
    yield buffered;
    buffered = null;
  }
  if (buffered !== null) {
    yield buffered;
  }
}

function csvField(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function isPlausibleTagName(name) {
  // Names carrying quotes, commas, backslashes or backticks (a few dozen oddities like
  // `"""pile_'em_up"""_(genshin_impact)` or `\m/`) are dropped rather than CSV-quoted or
  // escaped, so every artifact stays quote-free and a naive comma split parses it
  // everywhere. Backslash/backtick/`${` sequences would additionally corrupt the
  // generated TS template literal, hence the blanket rejection.
  return name.length > 0 && name.length <= 120 && !/[",`\\\n\r]/.test(name) && !name.includes('${');
}

async function readTags() {
  const kept = [];
  let total = 0;
  for await (const row of csvRows(cachedTagsCsv)) {
    if (total === 0 && row.startsWith('id,name,post_count')) {
      continue; // header
    }
    total += 1;
    const fields = parseCsvLine(row);
    const name = fields[1];
    const count = Number.parseInt(fields[2] ?? '', 10);
    if (name === undefined || !Number.isFinite(count) || count < cutoffFull) {
      continue;
    }
    if (!isPlausibleTagName(name)) {
      continue;
    }
    kept.push({
      name,
      postCount: count,
      category: Number.parseInt(fields[3] ?? '0', 10) || 0,
      deprecated: fields[6] === 'True' ? 1 : 0,
    });
  }
  return { kept, totalRowsSeen: total };
}

async function readAliases() {
  const rows = [];
  for await (const row of csvRows(cachedAliasesCsv)) {
    if (rows.length === 0 && row === 'alias,tag') {
      continue; // header
    }
    const [alias, canonical] = parseCsvLine(row);
    if (alias && canonical && isPlausibleTagName(alias) && isPlausibleTagName(canonical)) {
      rows.push([alias, canonical]);
    }
  }
  return rows;
}

/** Follow alias → canonical → … so the runtime map always points at a kept canonical name. */
function resolveAliasChains(rows, canonicalNames) {
  const direct = new Map(rows);
  const resolved = [];
  for (const [alias, firstTarget] of rows) {
    if (canonicalNames.has(alias)) {
      continue; // the alias text is itself a live tag; leave it alone
    }
    let target = firstTarget;
    let depth = 0;
    while (direct.has(target) && depth < MAX_ALIAS_CHAIN) {
      const next = direct.get(target);
      if (next === target) {
        break;
      }
      target = next;
      depth += 1;
    }
    if (target !== alias && canonicalNames.has(target)) {
      resolved.push([alias, target]);
    }
  }
  resolved.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return resolved;
}

const byNameAsc = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

function renderTagsCsv(entries) {
  const lines = [TAGS_HEADER];
  for (const entry of entries) {
    lines.push(`${csvField(entry.name)},${entry.category},${entry.postCount},${entry.deprecated}`);
  }
  return lines.join('\n');
}

function renderAliasesCsv(rows) {
  const lines = [ALIASES_HEADER];
  for (const [alias, canonical] of rows) {
    lines.push(`${csvField(alias)},${csvField(canonical)}`);
  }
  return lines.join('\n');
}

function writeGeneratedModule({ coreCsv, manifest }) {
  // JSON, but Prettier-clean: bare keys, single-quoted values, trailing comma. The
  // values hold no quotes (ids, hex digests, dates, URLs), so this is a safe transform.
  const manifestLiteral = JSON.stringify(manifest, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"([^"]*)"/g, "'$1'")
    .replace(/\n\}/, ',\n}');
  const source = `// GENERATED FILE — do not edit by hand.
// Regenerate with: pnpm tags:build
// Source: ${DATASET} revision ${manifest.revision}, mirroring Danbooru's
// tags / tag_aliases tables (CC-BY-4.0). See tools/generation/build-danbooru-index.mjs.

export interface DanbooruTagsManifest {
  dataset: string;
  revision: string;
  revisionUrl: string;
  generatedAt: string;
  cutoffFullPostCount: number;
  coreTagLimit: number;
  sourceTagRows: number;
  fullTagCount: number;
  coreTagCount: number;
  aliasCount: number;
  coreCsvSha256: string;
  fullCsvSha256: string;
  aliasesCsvSha256: string;
}

export const DANBOORU_TAGS_CORE_CSV = \`${coreCsv}\`;

export const DANBOORU_TAGS_MANIFEST: DanbooruTagsManifest = ${manifestLiteral};
`;
  writeFileSync(sharedGeneratedTs, source, 'utf8');
}

async function main() {
  log(`building the Danbooru tag index (cutoff >= ${cutoffFull} posts, core top ${coreLimit})`);
  mkdirSync(cacheDir, { recursive: true });

  const revisionSha = offline ? revision : await resolveRevisionSha();
  await ensureSource(cachedTagsCsv, TAGS_PATH_IN_REPO);
  await ensureSource(cachedAliasesCsv, ALIASES_PATH_IN_REPO);

  log('parsing tags.csv …');
  const { kept, totalRowsSeen } = await readTags();
  log(`kept ${kept.length.toLocaleString()} of ${totalRowsSeen.toLocaleString()} tags at post_count >= ${cutoffFull}`);

  const fullEntries = [...kept].sort(byNameAsc);
  const fullNames = new Set(fullEntries.map((entry) => entry.name));

  const coreEntries = [...kept]
    .sort((a, b) => b.postCount - a.postCount || byNameAsc(a, b))
    .slice(0, coreLimit)
    .sort(byNameAsc);

  log('parsing tag_aliases.csv …');
  const aliasRows = await readAliases();
  const resolvedAliases = resolveAliasChains(aliasRows, fullNames);
  log(
    `kept ${resolvedAliases.length.toLocaleString()} of ${aliasRows.length.toLocaleString()} aliases ` +
      '(target must exist in the full index; chains resolved)',
  );

  const coreCsv = renderTagsCsv(coreEntries);
  const fullCsv = renderTagsCsv(fullEntries);
  const aliasesCsv = renderAliasesCsv(resolvedAliases);

  const coreBytes = Buffer.byteLength(coreCsv, 'utf8');
  const fullBytes = Buffer.byteLength(fullCsv, 'utf8');
  const aliasBytes = Buffer.byteLength(aliasesCsv, 'utf8');
  log(
    `sizes — core: ${(coreBytes / 1024).toFixed(0)} KiB, full: ${(fullBytes / 1_000_000).toFixed(1)} MB, aliases: ${(aliasBytes / 1_000_000).toFixed(2)} MB`,
  );

  if (coreBytes > CORE_BYTE_LIMIT) {
    throw new Error(
      `the core index is ${coreBytes} bytes (limit ${CORE_BYTE_LIMIT}). Lower --core-limit so the shared bundle stays small.`,
    );
  }
  if (!skipPublic && (fullBytes > FULL_BYTE_LIMIT || aliasBytes > ALIAS_BYTE_LIMIT)) {
    throw new Error('the public index exceeded its byte limit; raise --cutoff before committing larger assets.');
  }

  const manifest = {
    dataset: DATASET,
    revision: revisionSha,
    revisionUrl: `https://huggingface.co/datasets/${DATASET}/tree/${revisionSha}/danbooru.donmai.us`,
    generatedAt: new Date().toISOString().slice(0, 10),
    cutoffFullPostCount: cutoffFull,
    coreTagLimit: coreLimit,
    sourceTagRows: totalRowsSeen,
    fullTagCount: fullEntries.length,
    coreTagCount: coreEntries.length,
    aliasCount: resolvedAliases.length,
    coreCsvSha256: sha256(coreCsv),
    fullCsvSha256: sha256(fullCsv),
    aliasesCsvSha256: sha256(aliasesCsv),
  };

  writeGeneratedModule({ coreCsv, manifest });
  log(`wrote ${path.relative(repoRoot, sharedGeneratedTs)}`);

  if (!skipPublic) {
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(publicTagsCsv, fullCsv, 'utf8');
    writeFileSync(publicAliasesCsv, aliasesCsv, 'utf8');
    log(`wrote ${path.relative(repoRoot, publicTagsCsv)} and ${path.relative(repoRoot, publicAliasesCsv)}`);
  }

  log('done.');
}

main().catch((error) => {
  console.error(`[danbooru-index] ${error instanceof Error ? error.stack : error}`);
  process.exitCode = 1;
});
