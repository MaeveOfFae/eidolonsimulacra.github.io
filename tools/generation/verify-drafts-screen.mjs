import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/mobile/src/screens/DraftsScreen.tsx',
  dir: 'packages/mobile/src/screens/drafts',
  keepRange: { from: 55, to: 829 },
  modules: [{ file: 'styles.ts', from: 830, to: 1211 }],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 10)) {
  console.log(`  ${line}`);
}
