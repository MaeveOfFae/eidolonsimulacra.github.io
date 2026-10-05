import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/shared/src/import/character-parser.ts',
  dir: 'packages/shared/src/import/character-parser',
  modules: [
    { file: 'card-readers.ts', from: 24, to: 395 },
    { file: 'field-mapping.ts', from: 396, to: 854 },
    { file: 'parsers.ts', from: 855, to: 1226 },
  ],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 12)) {
  console.log(`  ${line}`);
}
