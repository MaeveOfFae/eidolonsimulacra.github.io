/**
 * The stylesheet for the drafts library screen, shared by the screen and the sections extracted from it.
 *
 * Split out of `DraftsScreen.tsx`, which is now a barrel over these modules.
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@char-gen/shared';

export function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    toolbar: {
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    toolbarContent: {
      gap: 8,
      paddingRight: 12,
    },
    toolbarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minWidth: 118,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: colors.button,
    },
    toolbarButtonSecondary: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toolbarButtonText: {
      color: colors.button_text,
      fontSize: 14,
      fontWeight: '600',
    },
    toolbarButtonSecondaryText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.muted_text,
      fontSize: 14,
      marginTop: 12,
    },
    errorText: {
      color: colors.error_text,
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.button,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: colors.text,
      fontSize: 16,
    },
    searchContainer: {
      padding: 12,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.window,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 8,
      color: colors.text,
      fontSize: 14,
    },
    clearButton: {
      color: colors.muted_text,
      fontSize: 16,
      padding: 4,
    },
    filtersTrayWrap: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    filterSummaryText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    filtersPanel: {
      padding: 0,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    filterLabel: {
      color: colors.muted_text,
      fontSize: 12,
      width: 60,
    },
    filterChips: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.window,
    },
    filterChipActive: {
      backgroundColor: colors.button,
    },
    filterChipText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    filterChipTextActive: {
      color: colors.button_text,
      fontWeight: '500',
    },
    statsBar: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsText: {
      color: colors.muted_text,
      fontSize: 13,
    },
    listContent: {
      padding: 16,
    },
    draftItem: {
      backgroundColor: colors.window,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    draftInfo: {
      flex: 1,
    },
    draftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    draftName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    draftMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 4,
    },
    draftTag: {
      backgroundColor: colors.window,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      color: colors.muted_text,
      fontSize: 12,
    },
    archivedTag: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.warning_text,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    archivedTagText: {
      color: colors.warning_text,
      fontSize: 12,
      fontWeight: '600',
    },
    readinessBadgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    readinessBadge: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    readinessBadgeMuted: {
      borderColor: colors.border,
      backgroundColor: colors.window,
    },
    readinessBadgeWarning: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    readinessBadgeSuccess: {
      borderColor: colors.success_text,
      backgroundColor: colors.success_bg,
    },
    readinessBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    readinessBadgeTextMuted: {
      color: colors.text,
    },
    readinessBadgeTextWarning: {
      color: colors.accent_title,
    },
    readinessBadgeTextSuccess: {
      color: colors.success_text,
    },
    draftDate: {
      color: colors.muted_text,
      fontSize: 12,
    },
    snapshotSummaryCard: {
      marginTop: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 4,
    },
    snapshotSummaryTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    snapshotSummaryMeta: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 17,
    },
    draftActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    draftActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    draftActionButtonAccent: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    draftActionButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    draftActionButtonTextAccent: {
      color: colors.accent_title,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 14,
      textAlign: 'center',
    },
    emptyActionButton: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.button,
    },
    emptyActionButtonText: {
      color: colors.button_text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
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
      padding: 20,
      paddingBottom: 32,
    },
    modalHelpText: {
      color: colors.muted_text,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    editField: {
      marginBottom: 20,
    },
    editLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    editInput: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 16,
    },
    editTextArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
  });
}
