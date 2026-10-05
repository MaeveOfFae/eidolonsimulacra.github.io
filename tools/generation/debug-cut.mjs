import { execSync } from 'node:child_process';

const head = execSync('git show HEAD:packages/mobile/src/screens/SettingsScreen.tsx', {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
}).replace(/^\uFEFF/, '');
const lines = head.replace(/\r\n/g, '\n').split('\n');

const cuts = [
  { from: 24, to: 45 },
  { from: 47, to: 718 },
];
const inCut = (index) => cuts.some(({ from, to }) => index + 1 >= from && index + 1 <= to);

const firstImportIndex = lines.findIndex((line) => /^import /.test(line));
let importEnd = firstImportIndex;
while (importEnd < lines.length) {
  const line = lines[importEnd];
  if (
    /^(?:import |\} from |^$|\s)/.test(line) &&
    !/^(?:const|function|class|interface|type|export|let|var|async) /.test(line)
  ) {
    importEnd += 1;
    continue;
  }
  break;
}

const cutBody = lines.filter((_, index) => inCut(index)).join('\n');
const retainedBody = lines.filter((_, index) => index >= importEnd && !inCut(index)).join('\n');

console.log(`importEnd (0-based) = ${importEnd} -> line ${importEnd + 1}`);
console.log(`first retained line: ${JSON.stringify(retainedBody.split('\n')[0])}`);
console.log(`styles in raw retained: ${/\bstyles\b/.test(retainedBody)}`);

const stripped = retainedBody
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/'[^'\n]*'|"[^"\n]*"/g, "''");
console.log(`styles in stripped retained: ${/\bstyles\b/.test(stripped)}`);
console.log(
  `declared in cut: ${[...cutBody.matchAll(/^(?:export )?(?:async function|function|const|let|class|interface|type) (\w+)/gm)].map((m) => m[1]).join(', ')}`,
);
