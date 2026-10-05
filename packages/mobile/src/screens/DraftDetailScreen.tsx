import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type DraftAssetReviewScore } from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import ReviewApprovalTray from '../components/ReviewApprovalTray';
import {
  StarIcon,
  ArrowLeftIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  DocumentTextIcon,
  ChatBubbleIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  SparklesIcon,
  UsersIcon,
  CheckIcon,
} from '../components/Icons';
import { isDraftArchived } from '../lib/draft-archive';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={colors.muted_text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {draft.metadata.character_name || 'Character'}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleOpenEditModal} style={styles.editHeaderButton}>
              <PencilIcon color={colors.accent} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRefine()} style={styles.refineHeaderButton}>
              <ChatBubbleIcon color={colors.accent} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite.mutate()} style={styles.favoriteButton}>
              <StarIcon color={draft.metadata.favorite ? colors.warning_text : colors.muted_text} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tags */}
      <ScrollView horizontal style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
        {isDraftArchived(draft.metadata) && (
          <View style={[styles.tag, styles.tagArchived]}>
            <Text style={styles.tagArchivedText}>Archived</Text>
          </View>
        )}
        {draft.metadata.mode && (
          <View style={[styles.tag, styles.tagPrimary]}>
            <Text style={styles.tagPrimaryText}>{draft.metadata.mode}</Text>
          </View>
        )}
        {draft.metadata.genre && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.genre}</Text>
          </View>
        )}
        {draft.metadata.template_name && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.template_name}</Text>
          </View>
        )}
        {draft.metadata.tags?.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
          <TouchableOpacity style={styles.actionButton} onPress={() => void handleAttachCardImage()}>
            <DocumentTextIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>Attach PNG</Text>
          </TouchableOpacity>
          {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => void handleClearCardImage()}>
              <TrashIcon color={colors.muted_text} size={18} />
              <Text style={styles.actionButtonText}>Clear PNG</Text>
            </TouchableOpacity>
          ) : null}
          {hasIntroScene ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenIntroModal}>
              <SparklesIcon color={colors.accent} size={18} />
              <Text style={styles.actionButtonText}>Intros</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleCompareDraft}>
            <UsersIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>
              {pendingCompareSelection?.character1Id && pendingCompareSelection.character1Id !== draftId
                ? 'Complete Compare'
                : 'Compare'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, exportTrayExpanded && styles.actionButtonActive]}
            onPress={() => setExportTrayExpanded((current) => !current)}
          >
            <DocumentTextIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleArchive} disabled={archiveMutation.isPending}>
            {isDraftArchived(draft.metadata) ? (
              <ArrowUturnLeftIcon color={colors.accent} size={18} />
            ) : (
              <ArchiveBoxIcon color={colors.accent} size={18} />
            )}
            <Text style={styles.actionButtonText}>{isDraftArchived(draft.metadata) ? 'Restore' : 'Archive'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteActionButton]} onPress={handleDelete}>
            <TrashIcon color={colors.error_text} size={18} />
            <Text style={[styles.actionButtonText, styles.deleteActionText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {exportTrayExpanded ? (
        <View style={styles.exportTrayRow}>
          <View
            style={[
              styles.exportReadinessCard,
              exportReadiness.requiresAcknowledgement && styles.exportReadinessCardWarning,
            ]}
          >
            <Text style={styles.exportReadinessTitle}>Export readiness</Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.validationState === 'checking'
                ? 'Validation is still checking.'
                : exportReadiness.validationState === 'passing'
                  ? 'Validation currently passes.'
                  : 'Validation currently fails.'}
            </Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.reviewedAssetCount} rated â€¢ {exportReadiness.unratedAssetCount} unrated â€¢{' '}
              {exportReadiness.assetNoteCount} note{exportReadiness.assetNoteCount === 1 ? '' : 's'}
            </Text>
            {exportReadiness.blockingWarnings.length > 0 ? (
              <View style={styles.exportWarningList}>
                {exportReadiness.blockingWarnings.map((warning) => (
                  <Text key={warning} style={styles.exportWarningText}>{`- ${warning}`}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.exportReadinessText}>
                No current export blockers flagged from validation or saved review scores.
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('png')}>
            <Text style={styles.exportChipText}>PNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('text')}>
            <Text style={styles.exportChipText}>TXT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('combined')}>
            <Text style={styles.exportChipText}>MD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('json')}>
            <Text style={styles.exportChipText}>JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('pdf')}>
            <Text style={styles.exportChipText}>PDF</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
        <View style={styles.cardImagePreviewWrap}>
          <Text style={styles.cardImagePreviewLabel}>Attached card image</Text>
          <View style={styles.cardImagePreviewCard}>
            <Text style={styles.cardImagePreviewMeta}>PNG image attached for standard card export.</Text>
          </View>
        </View>
      ) : null}

      {/* Assets */}
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
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Details</Text>
              <TouchableOpacity onPress={handleSaveMetadata} disabled={updateMetadataMutation.isPending}>
                {updateMetadataMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              {/* Character Name */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Character Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter character name"
                  placeholderTextColor={colors.muted_text}
                />
              </View>

              {/* Genre */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Genre</Text>
                <TextInput
                  style={styles.editInput}
                  value={editGenre}
                  onChangeText={setEditGenre}
                  placeholder="e.g., Fantasy, Sci-Fi, Romance"
                  placeholderTextColor={colors.muted_text}
                />
              </View>

              {/* Tags */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Tags</Text>
                <TextInput
                  style={styles.editInput}
                  value={editTags}
                  onChangeText={setEditTags}
                  placeholder="Comma-separated tags"
                  placeholderTextColor={colors.muted_text}
                />
                <Text style={styles.editHint}>Separate multiple tags with commas</Text>
              </View>

              {/* Notes */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Notes</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add personal notes about this character..."
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={refineModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRefineModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeRefineModal} disabled={isRefining || isApplyingRefinement}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Refine Asset</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate a replacement for an existing asset, or draft the first version of a missing template asset and
                review it before saving.
              </Text>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Asset</Text>
                <View style={styles.assetPicker}>
                  {assetEntries.map((assetEntry) => {
                    const isActive = assetEntry.name === selectedRefineAsset;
                    return (
                      <TouchableOpacity
                        key={assetEntry.name}
                        style={[styles.assetChip, isActive && styles.assetChipActive]}
                        onPress={() => handleSelectRefineAsset(assetEntry.name)}
                        disabled={isRefining || isApplyingRefinement}
                      >
                        <Text style={[styles.assetChipText, isActive && styles.assetChipTextActive]}>
                          {formatAssetLabel(assetEntry.name)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                    ? 'Revision Request'
                    : 'Generation Direction'}
                </Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={refineRequest}
                  onChangeText={setRefineRequest}
                  placeholder={
                    selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                      ? 'Describe the change you want to make'
                      : 'Describe the first version you want AI to draft for this asset'
                  }
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isRefining && !isApplyingRefinement}
                  maxLength={1500}
                />
                <Text style={styles.editHint}>
                  {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                    ? 'Refinement replaces only the selected asset after you apply it.'
                    : 'AI generation drafts only the selected missing asset after you apply it.'}
                </Text>
              </View>

              {selectedRefineAsset ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Current {formatAssetLabel(selectedRefineAsset)}</Text>
                  <ScrollView style={styles.previewBox} nestedScrollEnabled>
                    <Text style={styles.previewText}>
                      {draft.assets[selectedRefineAsset] || 'No saved content yet.'}
                    </Text>
                  </ScrollView>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement) &&
                    styles.disabledButton,
                ]}
                onPress={handleRunRefine}
                disabled={!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement}
              >
                {isRefining ? (
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {refinePreview
                      ? 'Regenerate Preview'
                      : selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                        ? 'Preview Changes'
                        : 'Generate Preview'}
                  </Text>
                )}
              </TouchableOpacity>

              {isRefining && refineStatusText ? <Text style={styles.modalStatusText}>{refineStatusText}</Text> : null}

              {isRefining || refinePreview ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Refined Preview</Text>
                  <ScrollView style={styles.previewBox} nestedScrollEnabled>
                    {refinePreview ? (
                      <Text style={styles.previewText}>{refinePreview}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>Generating preview...</Text>
                    )}
                  </ScrollView>
                </View>
              ) : null}

              {refinePreview ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                    onPress={handleDiscardRefinement}
                    disabled={isApplyingRefinement}
                  >
                    <Text style={styles.secondaryModalButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                    onPress={handleOptimizeRefinement}
                    disabled={isApplyingRefinement}
                  >
                    <Text style={styles.secondaryModalButtonText}>Optimize</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.modalActionButton,
                      isApplyingRefinement && styles.disabledButton,
                    ]}
                    onPress={handleApplyRefinement}
                    disabled={isApplyingRefinement}
                  >
                    {isApplyingRefinement ? (
                      <ActivityIndicator size="small" color={colors.button_text} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Apply Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={assetEditorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAssetEditor}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeAssetEditor} disabled={isSavingAsset}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAssetName ? formatAssetLabel(editingAssetName) : 'Edit Asset'}
              </Text>
              <TouchableOpacity onPress={() => void handleSaveAssetEdit()} disabled={isSavingAsset}>
                {isSavingAsset ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Write or revise the raw asset text directly. Saving will create the asset if it did not exist yet.
              </Text>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Asset Content</Text>
                <TextInput
                  style={[styles.editInput, styles.assetEditorInput]}
                  value={editingAssetContent}
                  onChangeText={setEditingAssetContent}
                  placeholder="Enter asset content"
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={14}
                  textAlignVertical="top"
                  editable={!isSavingAsset}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={introModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
                disabled={isPersistingIntro}
              >
                <Text style={styles.modalCancelText}>{isGeneratingIntro ? 'Cancel' : 'Close'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Additional Intros</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate alternate intro scenes without replacing the active one. Keep the good ones, then activate
                whichever intro fits best.
              </Text>

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Current Active Intro</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>{draft.assets.intro_scene || 'No intro scene saved.'}</Text>
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Direction</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={introInstructions}
                  onChangeText={setIntroInstructions}
                  placeholder="Optional guidance for the next intro scene"
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isGeneratingIntro && !isPersistingIntro}
                  maxLength={1500}
                />
                <Text style={styles.editHint}>This applies only to the next generated intro candidate.</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name) && styles.disabledButton,
                ]}
                onPress={() => void handleGenerateAdditionalIntro()}
                disabled={isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name}
              >
                {isGeneratingIntro ? (
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Generate Additional Intro</Text>
                )}
              </TouchableOpacity>

              {isGeneratingIntro && introGenerationStage ? (
                <Text style={styles.modalStatusText}>{introGenerationStage}</Text>
              ) : null}

              {!draft.metadata.template_name ? (
                <Text style={styles.editHint}>
                  This draft needs a saved template before mobile can generate intro variants.
                </Text>
              ) : null}

              {isGeneratingIntro || generatedIntro ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Generated Intro Preview</Text>
                  <View style={styles.previewBox}>
                    {generatedIntro?.content ? (
                      <Text style={styles.previewText}>{generatedIntro.content}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>
                        {introGenerationStage || 'Generating intro scene...'}
                      </Text>
                    )}
                  </View>
                </View>
              ) : null}

              {generatedIntro ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => setGeneratedIntro(null)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.secondaryModalButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleKeepGeneratedIntro()}
                    disabled={isPersistingIntro}
                  >
                    {isPersistingIntro ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={styles.secondaryModalButtonText}>Keep</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.modalActionButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleSetActiveIntro(generatedIntro.content)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.primaryButtonText}>Make Active</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {savedIntros.length > 0 ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Saved Additional Intros</Text>
                  <View style={styles.savedIntroList}>
                    {savedIntros.map((intro, index) => {
                      const isActive = draft.assets.intro_scene?.trim() === intro.content.trim();
                      return (
                        <View key={intro.id} style={[styles.savedIntroCard, isActive && styles.savedIntroCardActive]}>
                          <View style={styles.savedIntroHeader}>
                            <Text style={styles.savedIntroTitle}>Intro #{index + 1}</Text>
                            <Text style={styles.savedIntroMeta}>{new Date(intro.timestamp).toLocaleString()}</Text>
                          </View>
                          <View style={styles.previewBox}>
                            <Text style={styles.previewText}>{intro.content}</Text>
                          </View>
                          <View style={styles.savedIntroActions}>
                            <TouchableOpacity
                              style={styles.introActionButton}
                              onPress={() => void handleCopyAsset('intro_scene', intro.content)}
                            >
                              <Text style={styles.introActionButtonText}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.introActionButton,
                                styles.introActionButtonPrimary,
                                isPersistingIntro && styles.disabledButton,
                              ]}
                              onPress={() => void handleSetActiveIntro(intro.content)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={[styles.introActionButtonText, styles.introActionButtonPrimaryText]}>
                                {isActive ? 'Active' : 'Make Active'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.introActionButton, isPersistingIntro && styles.disabledButton]}
                              onPress={() => void handleRemoveSavedIntro(intro.id)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={styles.introActionButtonText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
