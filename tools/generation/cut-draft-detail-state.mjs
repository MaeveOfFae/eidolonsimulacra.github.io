/** Config for extracting the draft detail screen's helpers and state into a hook. */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/screens/DraftDetailScreen.tsx',
  dir: 'packages/mobile/src/screens/draft-detail',
  extension: '',
  cut: [
    { from: 62, to: 242 },
    { from: 244, to: 1471 },
    { from: 1491, to: 1493 },
  ],
  cutCall: '',
  cutModule: {
    file: 'use-draft-detail-state.tsx',
    doc: `/**
 * The draft detail screen's helpers and state: the asset and review-annotation types,
 * the saved-intro parsing, the export tables, and everything the screen keeps in state
 * — the draft queries and mutations, the review editors, the comparison and lineage
 * data, and the export flow.
 *
 * Cut out of \`DraftDetailScreen\` verbatim — the screen keeps its JSX and destructures
 * what it renders, so the two halves cannot drift: a name the JSX needs is either on
 * this hook's return or a typecheck error.
 */`,
    wrap: {
      open: 'export function useDraftDetailState() {',
      close: '}',
      importName: 'useDraftDetailState',
    },
  },
});

console.log(`DraftDetailScreen.tsx: ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
