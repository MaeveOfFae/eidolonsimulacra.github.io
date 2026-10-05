/**
 * Report which of a screen's component-declared locals a JSX range uses.
 *
 * Extracting a screen section means turning its dependencies into props, and missing
 * one is a typecheck error while *inventing* one is a lint error — so this lists them
 * exactly rather than by eye. It reads the declarations inside the component
 * (`const x =`, `const [x, setX] =`, `const { a, b } =`, function declarations and the
 * component's own destructured parameters) and reports which appear in the range.
 */
import { readFileSync } from 'node:fs';

const [file, from, to] = process.argv.slice(2);
const lines = readFileSync(file, 'utf8').split(/\r?\n/);
const text = lines.join('\n');
const block = lines.slice(Number(from) - 1, Number(to)).join('\n');

const declared = new Set();

// const x = ... | const [x, setX] = ... | const { a, b } = ... | function x()
for (const match of text.matchAll(/^\s*const\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
  declared.add(match[1]);
}
for (const match of text.matchAll(/^\s*const\s*\[([^\]]+)\]\s*=/gm)) {
  for (const name of match[1].split(',')) {
    declared.add(name.trim().replace(/:.*$/, ''));
  }
}
for (const match of text.matchAll(/^\s*const\s*\{([^}]+)\}\s*=/gm)) {
  for (const name of match[1].split(',')) {
    declared.add(name.trim().replace(/:.*$/, ''));
  }
}
for (const match of text.matchAll(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) {
  declared.add(match[1]);
}

const used = [...declared].filter((name) => name && new RegExp(`(?<![\\w.$])${name}(?![\\w$])`).test(block)).sort();

// The component's own parameters and hooks are what a caller has to pass through.
const context = ['colors', 'styles', 'navigation', 'route', 'insets'].filter(
  (name) => declared.has(name) || new RegExp(`\\b${name}\\b`).test(block),
);

console.log(`range ${from}-${to}: ${block.split('\n').length} lines`);
console.log(`locals used (${used.length}): ${used.join(', ')}`);
console.log(`context also present: ${context.join(', ')}`);
