/**
 * Finish the draft-detail actions split. The actions hook must not be called from the
 * state hook (that makes `Pick<ReturnType<typeof useDraftDetailState>, …>` circular), so
 * the *screen* composes the two: state first, then actions over it.
 *
 *   1. state hook: drop the generated import and call, and the 31 names it no longer owns
 *   2. screen: call both hooks and split the destructure between them
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ACTIONS = [
  'archiveMutation',
  'assetEntries',
  'closeIntroModal',
  'createSafeguardSnapshot',
  'createSnapshotMutation',
  'handleArchive',
  'handleAttachCardImage',
  'handleCancelIntroGeneration',
  'handleClearCardImage',
  'handleCompareDraft',
  'handleCopyAsset',
  'handleDelete',
  'handleExportPreset',
  'handleGenerateAdditionalIntro',
  'handleKeepGeneratedIntro',
  'handleOpenIntroModal',
  'handleSetActiveIntro',
  'hasIntroScene',
  'persistSavedIntros',
  'resetReviewAnnotations',
  'restoreSnapshotMutation',
  'revertMergedAssetMutation',
  'saveAssetApprovalMutation',
  'saveReviewAnnotationsMutation',
  'savedIntros',
  'setReviewAssetNote',
  'setReviewAssetScore',
  'template',
  'toggleFavorite',
  'updateMetadataMutation',
  'visibleNotes',
];

const STATE_HOOK = 'packages/mobile/src/screens/draft-detail/use-draft-detail-state.tsx';
const ACTIONS_HOOK = 'packages/mobile/src/screens/draft-detail/use-draft-detail-actions.tsx';
const SCREEN = 'packages/mobile/src/screens/DraftDetailScreen.tsx';

const read = (path) => readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const write = (path, text, eol) => writeFileSync(path, text.replace(/\n/g, eol), 'utf8');

/* 1. the state hook no longer calls the actions hook */
{
  const raw = read(STATE_HOOK);
  const eol = eolOf(raw);
  const actions = new Set(ACTIONS);
  const kept = raw
    .split(/\r?\n/)
    .filter((line) => !/^import \{ useDraftDetailActions \}/.test(line))
    .filter((line) => !/useDraftDetailActions\(/.test(line))
    .filter((line) => !actions.has(line.trim().replace(/,$/, '')) || !/^    \w+,$/.test(line));

  write(STATE_HOOK, `${kept.join('\n')}\n`, eol);
  console.log(`state hook: ${kept.length} lines`);
}

/* 2. the screen calls both hooks and destructures from each */
{
  const raw = read(SCREEN);
  const eol = eolOf(raw);
  const lines = raw.split(/\r?\n/);
  const index = lines.findIndex((line) => /^  const \{ .*\} = useDraftDetailState\(\);$/.test(line));
  if (index < 0) {
    throw new Error('Could not find the state destructure in the screen');
  }

  const names = lines[index]
    .replace(/^  const \{ /, '')
    .replace(/ \} = useDraftDetailState\(\);$/, '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  const actions = new Set(ACTIONS);
  const stateNames = names.filter((name) => !actions.has(name));
  const actionNames = names.filter((name) => actions.has(name));

  lines.splice(
    index,
    1,
    '  const state = useDraftDetailState();',
    `  const { ${stateNames.join(', ')} } = state;`,
    `  const { ${actionNames.join(', ')} } = useDraftDetailActions(state);`,
  );

  const importIndex = lines.findIndex((line) => /^import \{ useDraftDetailState \}/.test(line));
  if (importIndex >= 0) {
    lines.splice(
      importIndex + 1,
      0,
      "import { useDraftDetailActions } from './draft-detail/use-draft-detail-actions';",
    );
  }

  write(SCREEN, lines.join('\n'), eol);
  console.log(`screen: ${stateNames.length} names from state, ${actionNames.length} from actions`);
}

console.log(`actions hook: ${read(ACTIONS_HOOK).split(/\r?\n/).length} lines`);
