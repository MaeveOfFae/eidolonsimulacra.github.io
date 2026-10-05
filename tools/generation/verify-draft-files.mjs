import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/shared/src/draft-files.ts',
  dir: 'packages/shared/src/draft-files',
  modules: [
    { file: 'normalizers.ts', from: 23, to: 599 },
    { file: 'importing.ts', from: 601, to: 984 },
    { file: 'exporting.ts', from: 986, to: 1433 },
  ],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 12)) {
  console.log(`  ${line}`);
}
