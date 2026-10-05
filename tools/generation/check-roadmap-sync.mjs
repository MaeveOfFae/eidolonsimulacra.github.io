/**
 * Keeps `packages/web/src/lib/roadmap.ts` and `docs/ROADMAP.md` in agreement.
 *
 * `docs/ROADMAP.md` is the source of truth for what is not finished, and its closing rule
 * says the two files are "the same claim in two formats" — but nothing enforced it. The 5.0
 * workspace release is what that cost: every one of its bars was green in the roadmap while
 * the in-app Upcoming Updates panel still listed all six as outstanding, because
 * `roadmap.ts` is what the panel renders and no test ever read it.
 *
 * Checked here, because it is mechanical:
 *   - every `ownerFiles` entry exists (the data file's own rule: "limited to files that exist")
 *   - a `shipped` group carries no items, and a `planned` or `partial` one carries at least one
 *   - every group's title and status match a `### <title> — `status`` heading in the roadmap,
 *     in both directions, so adding an area to one file and not the other fails
 *
 * Not checked, because it is not mechanical: whether an item's *wording* still describes
 * outstanding work. That is prose against prose, and keyword rules tried against it failed
 * on legitimately reworded items long before they would have caught anything real. Title,
 * status and file existence are the claims that actually drifted.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const dataPath = path.join(repoRoot, 'packages/web/src/lib/roadmap.ts');
const docPath = path.join(repoRoot, 'docs/ROADMAP.md');

/**
 * Read a source with its line endings normalised: this repo has both CRLF and LF files on
 * disk (git checks some of them out with the host's endings), and a pattern anchored on `\n`
 * silently matched nothing in the CRLF ones — which the positive control below caught.
 */
const readNormalised = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

/** Every single-quoted string in a fragment, unescaped. */
const stringsIn = (fragment) =>
  [...fragment.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((match) => match[1].replace(/\\'/g, "'"));

/** The groups, parsed out of the data file. Its shape is regular, and Prettier keeps it so. */
function readGroups() {
  const source = readNormalised(dataPath);
  const groups = source
    .split(/\n {2}\{\n/)
    .slice(1)
    .map((chunk) => {
      const id = chunk.match(/id: '((?:[^'\\]|\\.)*)'/)?.[1];
      const title = chunk.match(/title: '((?:[^'\\]|\\.)*)'/)?.[1];
      const status = chunk.match(/status: '(\w+)'/)?.[1];
      if (!id || !title || !status) {
        throw new Error(`Could not parse a roadmap group out of ${path.relative(repoRoot, dataPath)}.`);
      }
      return {
        title,
        status,
        ownerFiles: stringsIn(chunk.match(/ownerFiles:\s*\[([^\]]*)\]/s)?.[1] ?? ''),
        items: stringsIn(chunk.match(/items:\s*\[([^\]]*)\]/s)?.[1] ?? ''),
      };
    });
  // A positive control, so a parser that quietly found nothing cannot pass the checks below.
  const declaredGroups = [...source.matchAll(/^ {4}id: '/gm)].length;
  if (groups.length === 0 || groups.length !== declaredGroups) {
    throw new Error(`Parsed ${groups.length} roadmap groups but found ${declaredGroups} group ids.`);
  }
  return groups;
}

/** The areas, parsed out of the document: `### Title — \`status\`` headings only. */
function readAreas() {
  const source = readNormalised(docPath);
  return [...source.matchAll(/^### (.+?) — `(\w+)`$/gm)].map((match) => ({ title: match[1], status: match[2] }));
}

const groups = readGroups();
const areas = readAreas();

if (areas.length === 0) {
  throw new Error(`Could not parse any area headings out of ${path.relative(repoRoot, docPath)}.`);
}

// An owner file that does not exist points a reader at nothing.
for (const group of groups) {
  if (group.ownerFiles.length === 0) {
    throw new Error(`Roadmap group "${group.title}" lists no owner files.`);
  }
  for (const ownerFile of group.ownerFiles) {
    if (!existsSync(path.join(repoRoot, ownerFile))) {
      throw new Error(`Roadmap group "${group.title}" owns a file that does not exist: ${ownerFile}`);
    }
  }
}

// The panel renders each group's first item, so the two have to agree about emptiness.
for (const group of groups) {
  if (group.status === 'shipped' && group.items.length > 0) {
    throw new Error(`Roadmap group "${group.title}" is shipped but still lists outstanding items.`);
  }
  if (group.status !== 'shipped' && group.items.length === 0) {
    throw new Error(`Roadmap group "${group.title}" is ${group.status} but lists no outstanding work.`);
  }
}

// The same claim in two formats: same titles, same statuses, and neither file alone.
const areaStatuses = new Map(areas.map((area) => [area.title, area.status]));
for (const group of groups) {
  const status = areaStatuses.get(group.title);
  if (status === undefined) {
    throw new Error(`Roadmap group "${group.title}" has no "### ${group.title} — \`…\`" heading in docs/ROADMAP.md.`);
  }
  if (status !== group.status) {
    throw new Error(
      `Roadmap group "${group.title}" is "${group.status}" in roadmap.ts but "${status}" in docs/ROADMAP.md.`,
    );
  }
}
const groupTitles = new Set(groups.map((group) => group.title));
for (const area of areas) {
  if (!groupTitles.has(area.title)) {
    throw new Error(`docs/ROADMAP.md describes "${area.title}", which no roadmap group carries.`);
  }
}

console.log(`Roadmap sync check passed: ${groups.length} groups agree with ${path.relative(repoRoot, docPath)}.`);
