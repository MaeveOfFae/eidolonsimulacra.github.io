/** Config for cutting the draft-detail mutations and handlers into a second hook. */
import { split } from '../../tools/generation/split-source.mjs';

const PARAMS = [
  'draft',
  'templates',
  'draftId',
  'error',
  'exportReadiness',
  'generatedIntro',
  'introAbortRef',
  'introCancelRequestedRef',
  'introInstructions',
  'invalidateDraftQueries',
  'isGeneratingIntro',
  'isPersistingIntro',
  'navigation',
  'provenance',
  'queryClient',
  'reviewAssetNotesDraft',
  'reviewAssetScoresDraft',
  'reviewNotesDraft',
  'setEditModalVisible',
  'setGeneratedIntro',
  'setIntroGenerationStage',
  'setIntroInstructions',
  'setIntroModalVisible',
  'setIsGeneratingIntro',
  'setIsPersistingIntro',
  'setPendingCompareSelection',
  'setReviewAssetNotesDraft',
  'setReviewAssetScoresDraft',
  'setReviewNotesDraft',
  'setReviewSaveFeedback',
];

const result = split({
  source: 'packages/mobile/src/screens/draft-detail/use-draft-detail-state.tsx',
  dir: 'packages/mobile/src/screens/draft-detail',
  extension: '',
  cut: [{ from: 157, to: 914 }],
  cutInsertBefore: '^  return \\{',
  external: [
    {
      specifier: './use-draft-detail-state',
      typeOnly: true,
      names: ['useDraftDetailState', 'AssetEntry', 'IntroCandidate', 'AssetScoreMap', 'AssetNoteMap'],
    },
  ],
  cutCall: `{ ${PARAMS.join(', ')} }`,
  cutModule: {
    file: 'use-draft-detail-actions.tsx',
    doc: `/**
 * The draft detail screen's writes: the safeguard snapshots, the metadata and archive
 * mutations, the review-annotation saves, the snapshot create/restore/revert actions,
 * the comparison selection, and the intro generation and refinement handlers.
 *
 * Cut out of \`useDraftDetailState\` verbatim. It takes the state it needs as a
 * \`Pick\` of that hook's return type, so the typecheck proves both directions: a
 * missing parameter and a missing return entry are each a compile error.
 */`,
    wrap: {
      open: `export function useDraftDetailActions({\n${PARAMS.map((name) => `  ${name},`).join('\n')}\n}: Pick<\n  ReturnType<typeof useDraftDetailState>,\n  ${PARAMS.map((name) => `'${name}'`).join(' | ')}\n>) {`,
      close: '}',
      importName: 'useDraftDetailActions',
    },
  },
});

console.log(`use-draft-detail-state.tsx: ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
