import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/mobile/src/screens/GenerateScreen.tsx',
  dir: 'packages/mobile/src/screens/generate',
  keepRange: { from: 38, to: 668 },
  modules: [{ file: 'styles.ts', from: 670, to: 1080 }],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 10)) {
  console.log(`  ${line}`);
}
