/**
 * Verify a split moved code verbatim: compare the code lines of the original ranges
 * with the lines in the new modules, ignoring comments, blank lines and the generated
 * import blocks, and normalising the `export ` prefixes the splitter adds.
 *
 * Node rather than PowerShell: git output and file contents decode differently there,
 * which produces convincing but false differences.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export function verifyMove({ source, dir, modules, keepRange, extraTransforms = [] }) {
  const head = execSync(`git show HEAD:${source}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split(/\r?\n/);

  const isComment = (line) => /^\s*(\/\*|\*|\/\/)/.test(line);
  const normalize = (line) => {
    let out = line.replace(/^export /, '');
    for (const [pattern, replacement] of extraTransforms) {
      out = out.replace(pattern, replacement);
    }
    return out.trim();
  };
  const keepLine = (line) => line.trim() !== '' && !isComment(line);

  const original = [...modules, ...(keepRange ? [keepRange] : [])]
    .flatMap(({ from, to }) => head.slice(from - 1, to))
    .map(normalize)
    .filter(keepLine);

  /** Everything after the generated import/re-export block. */
  const readBody = (path) => {
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);
    const lastImport = lines.findLastIndex((line) => /^(\} from |import |export \{|export type \{)/.test(line));
    return lines.slice(lastImport + 1);
  };

  const moved = [...modules.map(({ file }) => readBody(`${dir}/${file}`)), ...(keepRange ? [readBody(source)] : [])]
    .flat()
    .map(normalize)
    .filter(keepLine);

  const count = (list) => {
    const map = new Map();
    for (const line of list) {
      map.set(line, (map.get(line) ?? 0) + 1);
    }
    return map;
  };

  const originalCounts = count(original);
  const movedCounts = count(moved);
  const report = [];

  for (const [line, n] of originalCounts) {
    const delta = n - (movedCounts.get(line) ?? 0);
    if (delta > 0) {
      report.push(`- ${delta}x ${line.slice(0, 110)}`);
    }
  }
  for (const [line, n] of movedCounts) {
    const delta = n - (originalCounts.get(line) ?? 0);
    if (delta > 0) {
      report.push(`+ ${delta}x ${line.slice(0, 110)}`);
    }
  }

  return { originalLines: original.length, movedLines: moved.length, report };
}
