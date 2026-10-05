import { verifyMove } from '../../tools/generation/verify-move.mjs';

const result = verifyMove({
  source: 'packages/mobile/src/local/api.ts',
  dir: 'packages/mobile/src/local/api',
  keepRange: { from: 872, to: 1665 },
  modules: [
    { file: 'stream-types.ts', from: 97, to: 121 },
    { file: 'config.ts', from: 122, to: 254 },
    { file: 'prompts.ts', from: 255, to: 571 },
    { file: 'streaming.ts', from: 572, to: 871 },
  ],
});

console.log(`original code lines: ${result.originalLines} | moved: ${result.movedLines}`);
console.log(`differences: ${result.report.length}`);
for (const line of result.report.slice(0, 10)) {
  console.log(`  ${line}`);
}
