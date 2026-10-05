/** Config for extracting the draft-detail pure helpers into a testable lib module. */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/draft-detail/use-draft-detail-state.tsx',
  dir: 'packages/mobile/src/lib',
  extension: '',
  cut: [{ from: 63, to: 226 }],
  external: [
    {
      specifier: '../screens/draft-detail/use-draft-detail-state',
      typeOnly: true,
      names: ['IntroCandidate'],
    },
  ],
  cutModule: {
    file: 'draft-detail-helpers.ts',
    doc: `/**
 * The pure helpers behind the draft detail screen: the saved-intro markers and
 * parsing, the export preset filenames and labels, asset labelling and visibility,
 * timestamp formatting, and the generation-stage description.
 *
 * These were closures inside the screen's state hook, so they were rebuilt on every
 * render; they are plain functions with no state, which is what makes them testable
 * from the logic-only mobile suite.
 */`,
  },
});

console.log(`use-draft-detail-state.tsx: ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
