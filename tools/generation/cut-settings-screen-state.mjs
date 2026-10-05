/** Config for extracting the settings screen's state into a hook. */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/SettingsScreen.tsx',
  dir: 'packages/mobile/src/screens/settings',
  extension: '',
  cut: [
    { from: 24, to: 45 },
    { from: 47, to: 718 },
  ],
  cutCall: '{ navigation, route }',
  cutModule: {
    file: 'use-settings-screen.ts',
    doc: `/**
 * The settings screen's state: the config query and its mutations, the provider and
 * model editors, the desktop-companion pairing and probe state, the derived flags the
 * screen renders, and every handler it wires up.
 *
 * Cut out of \`SettingsScreen\` verbatim — the screen keeps its JSX and destructures
 * what it renders, so the two halves cannot drift: a name the JSX needs is either on
 * this hook's return or a typecheck error.
 */`,
    wrap: {
      open: 'export function useSettingsScreen({ navigation, route }: SettingsScreenProps) {',
      close: '}',
      importName: 'useSettingsScreen',
    },
  },
});

console.log(`SettingsScreen.tsx: ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
