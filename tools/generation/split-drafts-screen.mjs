/** Config for splitting `mobile/src/screens/DraftsScreen.tsx` (1,211 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/DraftsScreen.tsx',
  dir: 'packages/mobile/src/screens/drafts',
  extension: '',
  keep: { from: 55, to: 829 },
  modules: [
    {
      file: 'styles.ts',
      from: 830,
      to: 1211,
      doc: 'The stylesheet for the drafts library screen, shared by the screen and the sections extracted from it.',
    },
  ],
});

console.log(`DraftsScreen.tsx: ${result.exports} exports, ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
