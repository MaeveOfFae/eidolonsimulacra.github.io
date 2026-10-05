/** Config for splitting `mobile/src/screens/SettingsScreen.tsx` (2,449 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/SettingsScreen.tsx',
  dir: 'packages/mobile/src/screens/settings',
  extension: '',
  keep: { from: 72, to: 1619 },
  modules: [
    {
      file: 'styles.ts',
      from: 1620,
      to: 2449,
      doc: 'The stylesheet for the settings screen, shared by the screen and the sections extracted from it.',
    },
  ],
});

console.log(`SettingsScreen.tsx: ${result.exports} exports, ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
