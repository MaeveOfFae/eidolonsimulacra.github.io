/**
 * The stylesheet for the draft detail screen, shared by the screen and the sections extracted from it.
 *
 * Split out of `DraftDetailScreen.tsx`, which is now a barrel over these modules.
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@char-gen/shared';

export function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.error_text,
      fontSize: 16,
      marginBottom: 16,
    },
    backText: {
      color: colors.accent,
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    refineHeaderButton: {
      padding: 8,
    },
    editHeaderButton: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    favoriteButton: {
      padding: 8,
    },
    tagsContainer: {
      maxHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tagsContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    tag: {
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    tagPrimary: {
      backgroundColor: colors.button,
    },
    tagText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    tagPrimaryText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
    },
    tagArchived: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.warning_text,
    },
    tagArchivedText: {
      color: colors.warning_text,
      fontSize: 12,
      fontWeight: '600',
    },
    actionsContainer: {
      paddingTop: 10,
      paddingBottom: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionsContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    actionButton: {
      minWidth: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      backgroundColor: colors.window,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    deleteActionButton: {
      borderColor: colors.error_text,
      backgroundColor: 'transparent',
    },
    actionButtonText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    deleteActionText: {
      color: colors.error_text,
    },
    exportTrayRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingHorizontal: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cardImagePreviewWrap: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    cardImagePreviewLabel: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    cardImagePreviewCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cardImagePreviewMeta: {
      color: colors.text,
      fontSize: 12,
    },
    exportChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    exportChipText: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '700',
    },
    exportReadinessCard: {
      width: '100%',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
    },
    exportReadinessCardWarning: {
      borderColor: colors.accent,
      backgroundColor: colors.window,
    },
    exportReadinessTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    exportReadinessText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
    },
    exportWarningList: {
      gap: 4,
    },
    exportWarningText: {
      color: colors.accent_title,
      fontSize: 12,
      lineHeight: 18,
    },
    metaContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    metaItem: {
      flex: 1,
    },
    metaLabel: {
      color: colors.muted_text,
      fontSize: 11,
      marginBottom: 2,
    },
    metaValue: {
      color: colors.text,
      fontSize: 12,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      gap: 16,
    },
    primaryTray: {
      marginBottom: 0,
    },
    overviewPreviewRow: {
      gap: 4,
    },
    overviewPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    metaGrid: {
      gap: 10,
    },
    metaCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    notesSection: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notesLabel: {
      color: colors.muted_text,
      fontSize: 12,
      marginBottom: 4,
    },
    notesText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    reviewSummarySection: {
      gap: 10,
    },
    reviewSummaryLabel: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    reviewTextArea: {
      minHeight: 104,
    },
    reviewEditorList: {
      gap: 12,
    },
    reviewEditorCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 10,
    },
    reviewScoreList: {
      gap: 8,
    },
    reviewScoreCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    reviewScoreTitle: {
      color: colors.text,
      fontSize: 13,
      flex: 1,
    },
    reviewScoreValue: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    reviewScoreChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    reviewScoreChip: {
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    reviewScoreChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    reviewScoreChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    reviewScoreChipTextActive: {
      color: colors.text,
    },
    reviewAssetNoteInput: {
      minHeight: 88,
    },
    reviewAssetNoteList: {
      gap: 10,
    },
    reviewAssetNoteCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 6,
    },
    reviewAssetNoteTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    reviewAssetNoteText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    reviewSaveRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 6,
    },
    reviewSaveButton: {
      flex: 1,
    },
    reviewResetButton: {
      flex: 1,
    },
    reviewSaveFeedback: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    snapshotSection: {
      gap: 12,
    },
    snapshotCardList: {
      gap: 10,
    },
    snapshotCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    snapshotCardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    snapshotCardHeader: {
      gap: 4,
    },
    snapshotCardTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    snapshotCardMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    snapshotCardReason: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    snapshotCardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    snapshotCardActionText: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '600',
    },
    snapshotRestoreButton: {
      minWidth: 96,
    },
    snapshotPreviewPanel: {
      gap: 12,
    },
    snapshotCompareChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    snapshotCompareChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    snapshotCompareChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    snapshotCompareChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    snapshotCompareChipTextActive: {
      color: colors.text,
    },
    snapshotSummaryCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 6,
    },
    snapshotSummaryText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
    },
    snapshotSummaryMetric: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    snapshotDiffList: {
      gap: 10,
    },
    snapshotDiffCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    snapshotDiffTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    snapshotDiffMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    snapshotDiffLineList: {
      gap: 8,
    },
    snapshotDiffLinePair: {
      gap: 8,
    },
    snapshotDiffLineCard: {
      backgroundColor: colors.window,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      gap: 6,
    },
    snapshotDiffLineLabel: {
      color: colors.muted_text,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    snapshotDiffLineText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: 'monospace',
    },
    snapshotEmptyCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    snapshotEmptyText: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 18,
    },
    savedIntroList: {
      gap: 12,
    },
    savedIntroCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 12,
    },
    savedIntroCardActive: {
      borderColor: colors.accent,
    },
    savedIntroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    savedIntroTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    savedIntroMeta: {
      color: colors.muted_text,
      fontSize: 11,
      flex: 1,
      textAlign: 'right',
    },
    savedIntroActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    introActionButton: {
      minWidth: 104,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
    },
    introActionButtonPrimary: {
      backgroundColor: colors.button,
      borderColor: colors.accent,
    },
    introActionButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    introActionButtonPrimaryText: {
      color: colors.text,
    },
    missingSummaryCard: {
      backgroundColor: colors.window,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.accent,
      marginBottom: 0,
    },
    trayPreviewText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
    },
    trayPreviewTextMuted: {
      color: colors.muted_text,
    },
    missingAssetList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    missingAssetPill: {
      backgroundColor: colors.accent_bg,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    missingAssetPillText: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '600',
    },
    missingSummaryTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    missingSummaryText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    assetSection: {
      marginBottom: 24,
    },
    assetStatusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    assetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    assetTitleBlock: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginRight: 12,
    },
    assetTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    requiredBadge: {
      color: colors.text,
      backgroundColor: colors.window,
      overflow: 'hidden',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      fontSize: 10,
      fontWeight: '700',
    },
    missingBadge: {
      color: colors.accent_title,
      backgroundColor: colors.accent,
      overflow: 'hidden',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      fontSize: 10,
      fontWeight: '700',
    },
    assetDescription: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 8,
    },
    assetActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    assetActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.window,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    assetActionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    assetActionTextAccent: {
      color: colors.accent_title,
    },
    assetContent: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    assetText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'monospace',
      lineHeight: 20,
    },
    assetPlaceholderText: {
      color: colors.muted_text,
      fontSize: 14,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalKeyboardContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    modalHeaderSpacer: {
      width: 48,
    },
    modalCancelText: {
      color: colors.muted_text,
      fontSize: 16,
    },
    modalSaveText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
    },
    modalContent: {
      flex: 1,
    },
    modalContentContainer: {
      padding: 16,
    },
    modalHelpText: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 16,
    },
    editField: {
      marginBottom: 20,
    },
    editLabel: {
      color: colors.muted_text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    editInput: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editTextArea: {
      minHeight: 100,
    },
    assetEditorInput: {
      minHeight: 280,
      textAlignVertical: 'top',
    },
    editHint: {
      color: colors.muted_text,
      fontSize: 12,
      marginTop: 4,
    },
    modalStatusText: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 10,
    },
    assetPicker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    assetChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
    },
    assetChipActive: {
      backgroundColor: colors.button,
      borderColor: colors.accent,
    },
    assetChipText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    assetChipTextActive: {
      color: colors.text,
    },
    previewSection: {
      marginTop: 20,
    },
    previewLabel: {
      color: colors.muted_text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    previewBox: {
      backgroundColor: colors.window,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      maxHeight: 220,
    },
    previewText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'monospace',
      lineHeight: 20,
    },
    previewPlaceholder: {
      color: colors.muted_text,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    primaryButton: {
      backgroundColor: colors.button,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullWidthButton: {
      marginTop: 20,
    },
    modalActionButton: {
      flex: 1,
    },
    primaryButtonText: {
      color: colors.button_text,
      fontSize: 15,
      fontWeight: '600',
    },
    secondaryModalButton: {
      flex: 1,
      backgroundColor: colors.window,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryModalButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
}
