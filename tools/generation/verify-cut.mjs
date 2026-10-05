/**
 * Verify a `cut`-mode split: the union of the cut module's lines and the retained
 * file's lines must account for every code line of the original. Lines the splitter
 * generates (the hook signature, its `return {` block and the screen's destructure)
 * are expected extras; the property that matters is that nothing is missing.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [, , source, ...outputs] = process.argv;

const head = execSync(`git show HEAD:${source}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/);

const isComment = (line) => /^\s*(\/\*|\*|\/\/)/.test(line);
const normalize = (line) => line.replace(/\s+/g, ' ').replace(/^ /, '').trim();
const keep = (line) => line.trim() !== '' && !isComment(line) && !/^(import |\} from |export type \{)/.test(line);

const original = head.map(normalize).filter(keep);
const moved = outputs
  .flatMap((path) => readFileSync(path, 'utf8').split(/\r?\n/))
  .map(normalize)
  .filter(keep);

const count = (list) => {
  const map = new Map();
  for (const line of list) {
    map.set(line, (map.get(line) ?? 0) + 1);
  }
  return map;
};

const originalCounts = count(original);
const movedCounts = count(moved);
const missing = [];
const added = [];

for (const [line, n] of originalCounts) {
  const delta = n - (movedCounts.get(line) ?? 0);
  if (delta > 0) {
    missing.push(`${delta}x ${line.slice(0, 100)}`);
  }
}
for (const [line, n] of movedCounts) {
  const delta = n - (originalCounts.get(line) ?? 0);
  if (delta > 0) {
    added.push(`${delta}x ${line.slice(0, 100)}`);
  }
}

console.log(`original code lines: ${original.length} | moved: ${moved.length}`);
console.log(`MISSING (must be 0): ${missing.length}`);
for (const line of missing.slice(0, 10)) {
  console.log(`  - ${line}`);
}
console.log(`added by the splitter: ${added.length}`);
for (const line of added.slice(0, 8)) {
  console.log(`  + ${line}`);
}
