/** Config for splitting `mobile/src/screens/GenerateScreen.tsx` (1,080 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/GenerateScreen.tsx',
  dir: 'packages/mobile/src/screens/generate',
  extension: '',
  keep: { from: 38, to: 668 },
  modules: [
    {
      file: 'styles.ts',
      from: 670,
      to: 1080,
      doc: 'The stylesheet for the generate screen, shared by the screen and the sections extracted from it.',
    },
  ],
});

console.log(`GenerateScreen.tsx: ${result.exports} exports, ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
