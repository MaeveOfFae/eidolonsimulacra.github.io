/**
 * Print the names a line range uses that are declared *outside* it — i.e. exactly the
 * parameters an extraction would need — plus what it declares itself.
 */
import { readFileSync } from 'node:fs';

const [, , file, fromArg, toArg] = process.argv;
const from = Number(fromArg);
const to = Number(toArg);

const lines = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
const text = lines.join('\n');
const block = lines.slice(from - 1, to).join('\n');
const lineOf = (index) => text.slice(0, index).split('\n').length;

const declared = new Map();
const add = (name, line) => {
  if (name && !declared.has(name)) {
    declared.set(name, line);
  }
};

for (const match of text.matchAll(/^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
  add(match[1], lineOf(match.index));
}
for (const match of text.matchAll(/^\s*(?:export\s+)?const\s*\[([^\]]+)\]\s*=/gm)) {
  for (const name of match[1].split(',')) {
    add(name.trim().replace(/:.*$/, ''), lineOf(match.index));
  }
}
for (const match of text.matchAll(/^\s*(?:export\s+)?const\s*\{([^}]+)\}\s*=/gm)) {
  for (const name of match[1].split(',')) {
    add(name.trim().replace(/:.*$/, ''), lineOf(match.index));
  }
}
for (const match of text.matchAll(/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) {
  add(match[1], lineOf(match.index));
}

const uses = (name) => new RegExp(`(?<![\\w.$])${name}(?![\\w$])`).test(block);

const params = [...declared]
  .filter(([name, line]) => (line < from || line > to) && uses(name))
  .map(([name]) => name)
  .sort();
const inner = [...declared].filter(([, line]) => line >= from && line <= to).map(([name]) => name);

console.log(`range ${from}-${to}: ${block.split('\n').length} lines`);
console.log(`PARAMS (${params.length}): ${params.join(', ')}`);
console.log(`declares (${inner.length}): ${inner.join(', ')}`);
