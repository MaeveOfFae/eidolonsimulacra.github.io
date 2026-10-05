import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/shared/src/help.ts',
  dir: 'packages/shared/src/help',
  modules: [
    { file: 'types.ts', from: 1, to: 79 },
    { file: 'guides.ts', from: 80, to: 214 },
    { file: 'tours.ts', from: 215, to: 611 },
    { file: 'pages.ts', from: 612, to: 1197 },
    { file: 'lookup.ts', from: 1198, to: 1298 },
  ],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 12)) {
  console.log(`  ${line}`);
}
