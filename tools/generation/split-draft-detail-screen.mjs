/** Config for splitting `mobile/src/screens/DraftDetailScreen.tsx` (3,757 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/DraftDetailScreen.tsx',
  dir: 'packages/mobile/src/screens/draft-detail',
  extension: '',
  keep: { from: 62, to: 2837 },
  modules: [
    {
      file: 'styles.ts',
      from: 2838,
      to: 3757,
      doc: 'The stylesheet for the draft detail screen, shared by the screen and the sections extracted from it.',
    },
  ],
});

console.log(`DraftDetailScreen.tsx: ${result.exports} exports, ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
