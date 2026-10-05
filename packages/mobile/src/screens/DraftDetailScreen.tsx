import DraftDetailModals from './draft-detail/DraftDetailModals';
import DraftDetailHeader from './draft-detail/DraftDetailHeader';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { type DraftAssetReviewScore } from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import ReviewApprovalTray from '../components/ReviewApprovalTray';
import { ChatBubbleIcon, ClipboardDocumentIcon, PencilIcon, SparklesIcon, CheckIcon } from '../components/Icons';
import { useDraftDetailState } from './draft-detail/use-draft-detail-state';

export default function DraftDetailScreen() {
  const {
    approvalQueue,
    archiveMutation,
    assetEditorVisible,
    assetEntries,
    assetNames,
    closeAssetEditor,
    closeIntroModal,
    closeRefineModal,
    colors,
    compareSnapshot,
    compareSnapshotId,
    compareSnapshotOptions,
    createSnapshotMutation,
    draft,
    draftId,
    editGenre,
    editModalVisible,
    editName,
    editNotes,
    editTags,
    editingAssetContent,
    editingAssetName,
    error,
    exportReadiness,
    exportTrayExpanded,
    formatAssetLabel,
    formatTimestamp,
    generatedIntro,
    handleApplyRefinement,
    handleArchive,
    handleAttachCardImage,
    handleCancelIntroGeneration,
    handleClearCardImage,
    handleCompareDraft,
    handleCopyAsset,
    handleDelete,
    handleDiscardRefinement,
    handleExportPreset,
    handleGenerateAdditionalIntro,
    handleKeepGeneratedIntro,
    handleOpenAssetEditor,
    handleOpenEditModal,
    handleOpenIntroModal,
    handleOptimizeRefinement,
    handleRefine,
    handleRemoveSavedIntro,
    handleRunRefine,
    handleSaveAssetEdit,
    handleSaveMetadata,
    handleSelectRefineAsset,
    handleSetActiveIntro,
    hasIntroScene,
    hasReviewSummary,
    introGenerationStage,
    introInstructions,
    introModalVisible,
    isApplyingRefinement,
    isGeneratingIntro,
    isLoading,
    isPersistingIntro,
    isRefining,
    isSavingAsset,
    mergeHistoryEntries,
    missingAssetCount,
    missingAssets,
    modalBottomPadding,
    navigation,
    pendingCompareSelection,
    refineModalVisible,
    refinePreview,
    refineRequest,
    refineStatusText,
    relatedDraftLookup,
    resetReviewAnnotations,
    restoreSnapshotMutation,
    revertMergedAssetMutation,
    reviewAnnotations,
    reviewAssetNames,
    reviewAssetNotesDraft,
    reviewAssetScoresDraft,
    reviewAverageScore,
    reviewNoteEntries,
    reviewNotesDraft,
    reviewSaveFeedback,
    reviewScoreEntries,
    revisionSnapshots,
    saveAssetApprovalMutation,
    saveReviewAnnotationsMutation,
    savedIntros,
    selectedRefineAsset,
    selectedSnapshot,
    selectedSnapshotActiveAssetName,
    selectedSnapshotAssetPreviews,
    selectedSnapshotCandidateAssets,
    selectedSnapshotDiffSummary,
    selectedSnapshotId,
    setCompareSnapshotId,
    setEditGenre,
    setEditModalVisible,
    setEditName,
    setEditNotes,
    setEditTags,
    setEditingAssetContent,
    setExportTrayExpanded,
    setGeneratedIntro,
    setIntroInstructions,
    setRefineRequest,
    setReviewAssetNote,
    setReviewAssetScore,
    setReviewNotesDraft,
    setReviewSaveFeedback,
    setSelectedSnapshotAssetName,
    setSelectedSnapshotId,
    snapshotCompareBaseLabel,
    styles,
    summarizeText,
    toggleFavorite,
    updateMetadataMutation,
    visibleNotes,
  } = useDraftDetailState();
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !draft) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading draft</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <DraftDetailHeader
        {...{
          archiveMutation,
          draft,
          draftId,
          exportReadiness,
          exportTrayExpanded,
          handleArchive,
          handleAttachCardImage,
          handleClearCardImage,
          handleCompareDraft,
          handleDelete,
          handleExportPreset,
          handleOpenEditModal,
          handleOpenIntroModal,
          handleRefine,
          hasIntroScene,
          navigation,
          pendingCompareSelection,
          setExportTrayExpanded,
          toggleFavorite,
        }}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <CollapsibleTray
          title="Overview"
          subtitle={`${assetNames.length} saved asset${assetNames.length === 1 ? '' : 's'}${savedIntros.length > 0 ? ` â€¢ ${savedIntros.length} extra intro${savedIntros.length === 1 ? '' : 's'}` : ''}`}
          initiallyExpanded={Boolean(visibleNotes)}
          preview={
            <View style={styles.overviewPreviewRow}>
              {draft.metadata.created ? (
                <Text style={styles.overviewPreviewText}>
                  Created {new Date(draft.metadata.created).toLocaleDateString()}
                </Text>
              ) : null}
              {draft.metadata.model ? (
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {draft.metadata.model}
                </Text>
              ) : null}
              {visibleNotes ? (
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {summarizeText(visibleNotes, 90)}
                </Text>
              ) : null}
            </View>
          }
          style={styles.primaryTray}
        >
          {visibleNotes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{visibleNotes}</Text>
            </View>
          ) : null}

          <View style={styles.metaGrid}>
            {draft.metadata.created ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Created</Text>
                <Text style={styles.metaValue}>{new Date(draft.metadata.created).toLocaleDateString()}</Text>
              </View>
            ) : null}
            {draft.metadata.model ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Model</Text>
                <Text style={styles.metaValue} numberOfLines={2}>
                  {draft.metadata.model}
                </Text>
              </View>
            ) : null}
            {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Parents</Text>
                <Text style={styles.metaValue}>{draft.metadata.parent_drafts.join(' + ')}</Text>
              </View>
            ) : null}
          </View>
        </CollapsibleTray>

        <CollapsibleTray
          title="Asset approvals"
          subtitle={approvalQueue.progressLabel}
          initiallyExpanded={approvalQueue.pendingEntries.length > 0}
          meta={approvalQueue.complete ? <CheckIcon color={colors.success_text} size={16} /> : null}
        >
          <ReviewApprovalTray
            queue={approvalQueue}
            pendingAssetName={
              saveAssetApprovalMutation.isPending ? (saveAssetApprovalMutation.variables?.assetName ?? null) : null
            }
            onDecide={(assetName, status) => saveAssetApprovalMutation.mutate({ assetName, status })}
          />
        </CollapsibleTray>

        {hasReviewSummary ? (
          <CollapsibleTray
            title="Review Summary"
            subtitle={`${reviewScoreEntries.length} scored asset${reviewScoreEntries.length === 1 ? '' : 's'}${reviewNoteEntries.length > 0 ? ` â€¢ ${reviewNoteEntries.length} asset note${reviewNoteEntries.length === 1 ? '' : 's'}` : ''}`}
            initiallyExpanded={Boolean(reviewNotesDraft.trim() || reviewNoteEntries.length > 0)}
            preview={
              <View style={styles.overviewPreviewRow}>
                {reviewAverageScore !== null ? (
                  <Text style={styles.overviewPreviewText}>Average {reviewAverageScore.toFixed(1)}/5</Text>
                ) : null}
                {reviewAnnotations?.updated_at ? (
                  <Text style={styles.overviewPreviewText}>
                    Updated {new Date(reviewAnnotations.updated_at).toLocaleDateString()}
                  </Text>
                ) : null}
                {reviewNotesDraft.trim() ? (
                  <Text style={styles.overviewPreviewText} numberOfLines={1}>
                    {summarizeText(reviewNotesDraft, 90)}
                  </Text>
                ) : null}
              </View>
            }
          >
            {reviewAnnotations?.updated_at ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Last reviewed</Text>
                <Text style={styles.metaValue}>{new Date(reviewAnnotations.updated_at).toLocaleString()}</Text>
              </View>
            ) : null}

            <View style={styles.reviewSummarySection}>
              <Text style={styles.reviewSummaryLabel}>Reviewer summary</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea, styles.reviewTextArea]}
                value={reviewNotesDraft}
                onChangeText={(value) => {
                  setReviewNotesDraft(value);
                  setReviewSaveFeedback(null);
                }}
                placeholder="Capture consistency concerns, export blockers, or follow-up edits worth revisiting later."
                placeholderTextColor={colors.muted_text}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {reviewAssetNames.length > 0 ? (
              <View style={styles.reviewSummarySection}>
                <Text style={styles.reviewSummaryLabel}>Asset scores</Text>
                <View style={styles.reviewEditorList}>
                  {reviewAssetNames.map((assetName) => {
                    const assetScore = reviewAssetScoresDraft[assetName];
                    return (
                      <View key={`review-${assetName}`} style={styles.reviewEditorCard}>
                        <View style={styles.reviewScoreCard}>
                          <Text style={styles.reviewScoreTitle}>{formatAssetLabel(assetName)}</Text>
                          <Text style={styles.reviewScoreValue}>{assetScore ? `${assetScore}/5` : 'Unrated'}</Text>
                        </View>
                        <View style={styles.reviewScoreChipRow}>
                          {[1, 2, 3, 4, 5].map((score) => {
                            const isActive = assetScore === score;
                            return (
                              <TouchableOpacity
                                key={`${assetName}-score-${score}`}
                                style={[styles.reviewScoreChip, isActive && styles.reviewScoreChipActive]}
                                onPress={() => setReviewAssetScore(assetName, score as DraftAssetReviewScore)}
                              >
                                <Text
                                  style={[styles.reviewScoreChipText, isActive && styles.reviewScoreChipTextActive]}
                                >
                                  {score}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                          <TouchableOpacity
                            style={styles.reviewScoreChip}
                            onPress={() => setReviewAssetScore(assetName, undefined)}
                          >
                            <Text style={styles.reviewScoreChipText}>Clear</Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={[styles.editInput, styles.editTextArea, styles.reviewAssetNoteInput]}
                          value={reviewAssetNotesDraft[assetName] ?? ''}
                          onChangeText={(value) => setReviewAssetNote(assetName, value)}
                          placeholder="Asset-specific follow-up, blocking issues, or rationale for the score."
                          placeholderTextColor={colors.muted_text}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>Generate or import draft assets before rating them.</Text>
              </View>
            )}

            <View style={styles.reviewSaveRow}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.reviewSaveButton,
                  saveReviewAnnotationsMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => saveReviewAnnotationsMutation.mutate()}
                disabled={saveReviewAnnotationsMutation.isPending}
              >
                {saveReviewAnnotationsMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Save Review Notes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.secondaryModalButton,
                  styles.reviewResetButton,
                  saveReviewAnnotationsMutation.isPending && styles.disabledButton,
                ]}
                onPress={resetReviewAnnotations}
                disabled={saveReviewAnnotationsMutation.isPending}
              >
                <Text style={styles.secondaryModalButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {reviewSaveFeedback ? <Text style={styles.reviewSaveFeedback}>{reviewSaveFeedback}</Text> : null}
          </CollapsibleTray>
        ) : null}

        <CollapsibleTray
          title="Restore Points"
          subtitle={`${revisionSnapshots.length} saved restore point${revisionSnapshots.length === 1 ? '' : 's'}`}
          initiallyExpanded={Boolean(revisionSnapshots.length)}
          preview={
            selectedSnapshot ? (
              <View style={styles.overviewPreviewRow}>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {selectedSnapshot.label || 'Restore point'}
                </Text>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {formatTimestamp(selectedSnapshot.created_at)}
                </Text>
              </View>
            ) : (
              <Text style={styles.trayPreviewText}>Save a restore point before risky edits.</Text>
            )
          }
        >
          <TouchableOpacity
            style={[styles.primaryButton, createSnapshotMutation.isPending && styles.disabledButton]}
            onPress={() => createSnapshotMutation.mutate()}
            disabled={createSnapshotMutation.isPending}
          >
            {createSnapshotMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.button_text} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Restore Point</Text>
            )}
          </TouchableOpacity>

          {revisionSnapshots.length === 0 ? (
            <View style={styles.snapshotEmptyCard}>
              <Text style={styles.snapshotEmptyText}>No restore points saved yet.</Text>
            </View>
          ) : (
            <View style={styles.snapshotSection}>
              <View style={styles.snapshotCardList}>
                {revisionSnapshots.slice(0, 6).map((snapshot) => {
                  const isActive = snapshot.id === selectedSnapshotId;
                  return (
                    <TouchableOpacity
                      key={snapshot.id}
                      style={[styles.snapshotCard, isActive && styles.snapshotCardActive]}
                      onPress={() => setSelectedSnapshotId(snapshot.id)}
                    >
                      <View style={styles.snapshotCardHeader}>
                        <Text style={styles.snapshotCardTitle}>{snapshot.label || 'Restore point'}</Text>
                        <Text style={styles.snapshotCardMeta}>{formatTimestamp(snapshot.created_at)}</Text>
                      </View>
                      {snapshot.reason ? <Text style={styles.snapshotCardReason}>{snapshot.reason}</Text> : null}
                      <View style={styles.snapshotCardActions}>
                        <Text style={styles.snapshotCardActionText}>{isActive ? 'Previewing' : 'Tap to preview'}</Text>
                        <TouchableOpacity
                          style={[
                            styles.introActionButton,
                            styles.snapshotRestoreButton,
                            restoreSnapshotMutation.isPending && styles.disabledButton,
                          ]}
                          onPress={() =>
                            Alert.alert(
                              'Restore this point?',
                              'The current draft state will be saved as a safeguard restore point first.',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Restore',
                                  style: 'destructive',
                                  onPress: () => restoreSnapshotMutation.mutate(snapshot.id),
                                },
                              ],
                            )
                          }
                          disabled={restoreSnapshotMutation.isPending}
                        >
                          <Text style={styles.introActionButtonText}>
                            {restoreSnapshotMutation.isPending ? 'Restoring...' : 'Restore'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedSnapshot ? (
                <View style={styles.snapshotPreviewPanel}>
                  <Text style={styles.previewLabel}>Compare Against</Text>
                  <View style={styles.snapshotCompareChips}>
                    <TouchableOpacity
                      style={[styles.snapshotCompareChip, !compareSnapshotId && styles.snapshotCompareChipActive]}
                      onPress={() => setCompareSnapshotId('')}
                    >
                      <Text
                        style={[
                          styles.snapshotCompareChipText,
                          !compareSnapshotId && styles.snapshotCompareChipTextActive,
                        ]}
                      >
                        Current draft
                      </Text>
                    </TouchableOpacity>
                    {compareSnapshotOptions.slice(0, 4).map((snapshot) => {
                      const isActive = compareSnapshotId === snapshot.id;
                      return (
                        <TouchableOpacity
                          key={`compare-${snapshot.id}`}
                          style={[styles.snapshotCompareChip, isActive && styles.snapshotCompareChipActive]}
                          onPress={() => setCompareSnapshotId(snapshot.id)}
                        >
                          <Text
                            style={[styles.snapshotCompareChipText, isActive && styles.snapshotCompareChipTextActive]}
                            numberOfLines={1}
                          >
                            {snapshot.label || 'Restore point'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.snapshotSummaryCard}>
                    <Text style={styles.snapshotSummaryText}>Comparing against {snapshotCompareBaseLabel}.</Text>
                    {selectedSnapshotDiffSummary ? (
                      <>
                        <Text style={styles.snapshotSummaryMetric}>
                          {selectedSnapshotDiffSummary.assetDeltaCount} asset change
                          {selectedSnapshotDiffSummary.assetDeltaCount === 1 ? '' : 's'}
                        </Text>
                        <Text style={styles.snapshotSummaryMetric}>
                          {selectedSnapshotDiffSummary.metadataChanges.length > 0
                            ? `Metadata: ${selectedSnapshotDiffSummary.metadataChanges.join(', ')}`
                            : 'No metadata drift'}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  {selectedSnapshotCandidateAssets.length > 1 ? (
                    <View style={styles.assetPicker}>
                      {selectedSnapshotCandidateAssets.map((assetName) => {
                        const isActive = assetName === selectedSnapshotActiveAssetName;
                        return (
                          <TouchableOpacity
                            key={`snapshot-asset-${assetName}`}
                            style={[styles.assetChip, isActive && styles.assetChipActive]}
                            onPress={() => setSelectedSnapshotAssetName(assetName)}
                          >
                            <Text style={[styles.assetChipText, isActive && styles.assetChipTextActive]}>
                              {formatAssetLabel(assetName)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {selectedSnapshotAssetPreviews.length > 0 ? (
                    <View style={styles.snapshotDiffList}>
                      {selectedSnapshotAssetPreviews.map((preview) => (
                        <View key={`${selectedSnapshot.id}-${preview.assetName}`} style={styles.snapshotDiffCard}>
                          <Text style={styles.snapshotDiffTitle}>{formatAssetLabel(preview.assetName)}</Text>
                          <Text style={styles.snapshotDiffMeta}>
                            {preview.changedLineCount} changed line{preview.changedLineCount === 1 ? '' : 's'}
                          </Text>
                          <View style={styles.snapshotDiffLineList}>
                            {preview.previewLines.map((line) => (
                              <View
                                key={`${preview.assetName}-${line.lineNumber}-${line.status}`}
                                style={styles.snapshotDiffLinePair}
                              >
                                <View style={styles.snapshotDiffLineCard}>
                                  <Text style={styles.snapshotDiffLineLabel}>
                                    {compareSnapshot ? 'Baseline snapshot' : 'Current'} Â· line {line.lineNumber}
                                  </Text>
                                  <Text style={styles.snapshotDiffLineText}>{line.currentLine || '(empty)'}</Text>
                                </View>
                                <View style={styles.snapshotDiffLineCard}>
                                  <Text style={styles.snapshotDiffLineLabel}>Snapshot Â· line {line.lineNumber}</Text>
                                  <Text style={styles.snapshotDiffLineText}>{line.snapshotLine || '(empty)'}</Text>
                                </View>
                              </View>
                            ))}
                            {preview.omittedDifferenceCount > 0 ? (
                              <Text style={styles.snapshotDiffMeta}>
                                +{preview.omittedDifferenceCount} more differing line
                                {preview.omittedDifferenceCount === 1 ? '' : 's'}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.snapshotEmptyCard}>
                      <Text style={styles.snapshotEmptyText}>This restore point matches the selected baseline.</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          )}
        </CollapsibleTray>

        {mergeHistoryEntries.length > 0 ? (
          <CollapsibleTray
            title="Merge History"
            subtitle={`${mergeHistoryEntries.length} merge event${mergeHistoryEntries.length === 1 ? '' : 's'}`}
            initiallyExpanded={false}
            preview={
              <View style={styles.overviewPreviewRow}>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {mergeHistoryEntries[0]?.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'}
                </Text>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {formatTimestamp(mergeHistoryEntries[0]?.created_at)}
                </Text>
              </View>
            }
          >
            <View style={styles.savedIntroList}>
              {mergeHistoryEntries.map((entry) => {
                const sourceDraft = relatedDraftLookup.get(entry.source_draft_id);
                const baseDraft = relatedDraftLookup.get(entry.base_draft_id);
                const sourceSnapshotLabel = entry.source_snapshot_id
                  ? sourceDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.source_snapshot_id)
                      ?.label || 'Selected restore point'
                  : null;
                const baseSnapshotLabel = entry.base_snapshot_id
                  ? baseDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.base_snapshot_id)?.label ||
                    'Selected restore point'
                  : null;
                const undoSnapshot = entry.undo_snapshot_id
                  ? (revisionSnapshots.find((snapshot) => snapshot.id === entry.undo_snapshot_id) ?? null)
                  : null;

                return (
                  <View key={entry.id} style={styles.savedIntroCard}>
                    <View style={styles.savedIntroHeader}>
                      <Text style={styles.savedIntroTitle}>
                        {entry.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'}
                      </Text>
                      <Text style={styles.savedIntroMeta}>{formatTimestamp(entry.created_at)}</Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Source</Text>
                      <Text style={styles.metaValue}>
                        {sourceDraft?.character_name || sourceDraft?.seed || entry.source_draft_id} ({entry.source_side}
                        ){sourceSnapshotLabel ? ` â€¢ ${sourceSnapshotLabel}` : ''}
                      </Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Base branch</Text>
                      <Text style={styles.metaValue}>
                        {baseDraft?.character_name || baseDraft?.seed || entry.base_draft_id} ({entry.base_side})
                        {baseSnapshotLabel ? ` â€¢ ${baseSnapshotLabel}` : ''}
                      </Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Merged assets</Text>
                      <Text style={styles.metaValue}>
                        {entry.asset_names.map((assetName) => formatAssetLabel(assetName)).join(', ')}
                      </Text>
                    </View>

                    {entry.asset_resolutions?.length ? (
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Resolution details</Text>
                        <View style={styles.reviewAssetNoteList}>
                          {entry.asset_resolutions.map((resolution) => (
                            <View key={`${entry.id}-${resolution.asset_name}`} style={styles.reviewAssetNoteCard}>
                              <Text style={styles.reviewAssetNoteTitle}>{formatAssetLabel(resolution.asset_name)}</Text>
                              <Text style={styles.reviewAssetNoteText}>
                                {resolution.reason === 'content-drift'
                                  ? 'Content drift'
                                  : resolution.reason === 'review-drift'
                                    ? 'Review drift'
                                    : resolution.reason === 'left-only'
                                      ? 'Left-only asset'
                                      : 'Right-only asset'}
                                {' â€¢ '}
                                {resolution.target_previously_had_asset ? 'updated existing slot' : 'added new slot'}
                                {' â€¢ '}
                                {resolution.review_context_applied
                                  ? 'review context copied'
                                  : 'review context not copied'}
                              </Text>
                              {undoSnapshot && resolution.target_previously_had_asset ? (
                                <TouchableOpacity
                                  style={[
                                    styles.introActionButton,
                                    revertMergedAssetMutation.isPending && styles.disabledButton,
                                  ]}
                                  onPress={() =>
                                    revertMergedAssetMutation.mutate({
                                      eventId: entry.id,
                                      assetName: resolution.asset_name,
                                    })
                                  }
                                  disabled={revertMergedAssetMutation.isPending}
                                >
                                  <Text style={styles.introActionButtonText}>
                                    {revertMergedAssetMutation.isPending ? 'Revertingâ€¦' : 'Revert Asset'}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {undoSnapshot ? (
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Undo available</Text>
                        <Text style={styles.metaValue}>
                          {undoSnapshot.label || 'Restore point'} can restore the draft to its pre-merge state.
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.savedIntroActions}>
                      <TouchableOpacity
                        style={styles.introActionButton}
                        onPress={() =>
                          navigation.navigate('DraftDetail', {
                            draftId: entry.source_draft_id,
                            ...(entry.source_snapshot_id ? { historySnapshotId: entry.source_snapshot_id } : {}),
                          })
                        }
                      >
                        <Text style={styles.introActionButtonText}>Open Source</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.introActionButton}
                        onPress={() =>
                          navigation.navigate('DraftDetail', {
                            draftId: entry.base_draft_id,
                            ...(entry.base_snapshot_id ? { historySnapshotId: entry.base_snapshot_id } : {}),
                          })
                        }
                      >
                        <Text style={styles.introActionButtonText}>Open Base</Text>
                      </TouchableOpacity>
                      {undoSnapshot ? (
                        <TouchableOpacity
                          style={[styles.introActionButton, restoreSnapshotMutation.isPending && styles.disabledButton]}
                          onPress={() =>
                            Alert.alert(
                              'Undo this merge?',
                              'The current draft state will be saved as a safeguard restore point first.',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Restore',
                                  style: 'destructive',
                                  onPress: () => restoreSnapshotMutation.mutate(undoSnapshot.id),
                                },
                              ],
                            )
                          }
                          disabled={restoreSnapshotMutation.isPending}
                        >
                          <Text style={styles.introActionButtonText}>
                            {restoreSnapshotMutation.isPending ? 'Undoingâ€¦' : 'Undo Merge'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </CollapsibleTray>
        ) : null}

        {missingAssetCount > 0 ? (
          <CollapsibleTray
            title="Missing assets"
            subtitle={`${missingAssetCount} slot${missingAssetCount === 1 ? '' : 's'} still need content before export.`}
            initiallyExpanded={false}
            preview={
              <Text style={styles.trayPreviewText} numberOfLines={1}>
                {missingAssets
                  .slice(0, 3)
                  .map((entry) => formatAssetLabel(entry.name))
                  .join(' â€¢ ')}
                {missingAssets.length > 3 ? ` â€¢ +${missingAssets.length - 3} more` : ''}
              </Text>
            }
            style={styles.missingSummaryCard}
          >
            <View style={styles.missingAssetList}>
              {missingAssets.map((entry) => (
                <View key={entry.name} style={styles.missingAssetPill}>
                  <Text style={styles.missingAssetPillText}>{formatAssetLabel(entry.name)}</Text>
                </View>
              ))}
            </View>
          </CollapsibleTray>
        ) : null}

        {assetEntries.map((assetEntry) => {
          const assetName = assetEntry.name;
          const assetExists = assetEntry.exists;
          const assetContent = draft.assets[assetName];

          return (
            <CollapsibleTray
              key={assetName}
              title={formatAssetLabel(assetName)}
              subtitle={assetEntry.description}
              initiallyExpanded={false}
              preview={
                <Text style={[styles.trayPreviewText, !assetExists && styles.trayPreviewTextMuted]} numberOfLines={2}>
                  {assetExists ? summarizeText(assetContent) : 'No saved content yet.'}
                </Text>
              }
              style={styles.assetSection}
            >
              {assetEntry.required || !assetExists ? (
                <View style={styles.assetStatusRow}>
                  {!assetExists ? <Text style={styles.missingBadge}>Missing</Text> : null}
                  {assetEntry.required ? <Text style={styles.requiredBadge}>Req</Text> : null}
                </View>
              ) : null}
              <View style={styles.assetActions}>
                {assetExists ? (
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={() => handleCopyAsset(assetName, assetContent)}
                  >
                    <ClipboardDocumentIcon color={colors.muted_text} size={16} />
                    <Text style={styles.assetActionText}>Copy</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.assetActionButton} onPress={() => handleOpenAssetEditor(assetName)}>
                  <PencilIcon color={assetExists ? colors.muted_text : colors.accent} size={16} />
                  <Text style={[styles.assetActionText, !assetExists && styles.assetActionTextAccent]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assetActionButton} onPress={() => handleRefine(assetName)}>
                  <ChatBubbleIcon color={colors.accent} size={16} />
                  <Text style={styles.assetActionTextAccent}>Refine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.assetActionButton}
                  onPress={() =>
                    navigation.navigate('Home', {
                      screen: 'TokenOptimization',
                      params: {
                        draftId,
                        assetName,
                        text: assetContent || '',
                      },
                    })
                  }
                >
                  <SparklesIcon color={colors.accent} size={16} />
                  <Text style={styles.assetActionTextAccent}>Optimize</Text>
                </TouchableOpacity>
                {assetName === 'intro_scene' ? (
                  <TouchableOpacity style={styles.assetActionButton} onPress={handleOpenIntroModal}>
                    <SparklesIcon color={colors.accent} size={16} />
                    <Text style={styles.assetActionTextAccent}>Intros</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.assetContent}>
                {assetExists ? (
                  <Text style={styles.assetText}>{assetContent}</Text>
                ) : (
                  <Text style={styles.assetPlaceholderText}>No saved content yet.</Text>
                )}
              </View>
            </CollapsibleTray>
          );
        })}
      </ScrollView>

      {/* Edit Metadata Modal */}
      <DraftDetailModals
        {...{
          assetEditorVisible,
          assetEntries,
          closeAssetEditor,
          closeIntroModal,
          closeRefineModal,
          draft,
          editGenre,
          editModalVisible,
          editName,
          editNotes,
          editTags,
          editingAssetContent,
          editingAssetName,
          formatAssetLabel,
          generatedIntro,
          handleApplyRefinement,
          handleCancelIntroGeneration,
          handleCopyAsset,
          handleDiscardRefinement,
          handleGenerateAdditionalIntro,
          handleKeepGeneratedIntro,
          handleOptimizeRefinement,
          handleRemoveSavedIntro,
          handleRunRefine,
          handleSaveAssetEdit,
          handleSaveMetadata,
          handleSelectRefineAsset,
          handleSetActiveIntro,
          introGenerationStage,
          introInstructions,
          introModalVisible,
          isApplyingRefinement,
          isGeneratingIntro,
          isPersistingIntro,
          isRefining,
          isSavingAsset,
          modalBottomPadding,
          refineModalVisible,
          refinePreview,
          refineRequest,
          refineStatusText,
          savedIntros,
          selectedRefineAsset,
          setEditGenre,
          setEditModalVisible,
          setEditName,
          setEditNotes,
          setEditTags,
          setEditingAssetContent,
          setGeneratedIntro,
          setIntroInstructions,
          setRefineRequest,
          updateMetadataMutation,
        }}
      />
    </View>
  );
}
