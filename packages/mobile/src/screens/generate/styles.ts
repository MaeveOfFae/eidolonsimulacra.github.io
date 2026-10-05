/**
 * The stylesheet for the generate screen, shared by the screen and the sections extracted from it.
 *
 * Split out of `GenerateScreen.tsx`, which is now a barrel over these modules.
 */
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@char-gen/shared';

export function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted_text,
      marginBottom: 4,
    },
    form: {
      gap: 16,
    },
    heroCard: {
      backgroundColor: colors.window,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    helperText: {
      color: colors.muted_text,
      fontSize: 12,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    secondaryActionButton: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryActionButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    setupPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    importedSourceCard: {
      backgroundColor: colors.accent_bg,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.accent,
      gap: 10,
    },
    importedSourceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    importedSourceInfo: {
      flex: 1,
    },
    importedSourceTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    importedSourceMeta: {
      color: colors.accent_title,
      fontSize: 12,
      marginBottom: 2,
    },
    clearImportedButton: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: colors.danger_bg,
    },
    importedAssetChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.accent_bg,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    importedAssetChipText: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '500',
    },
    templateChips: {
      flexDirection: 'row',
      gap: 8,
    },
    templateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
    },
    templateChipActive: {
      backgroundColor: colors.button,
      borderColor: colors.button,
    },
    templateChipText: {
      color: colors.muted_text,
      fontSize: 13,
    },
    templateChipTextActive: {
      color: colors.button_text,
      fontWeight: '500',
    },
    modeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionalAssetList: {
      gap: 8,
    },
    optionalAssetRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    optionalAssetRowEnabled: {
      borderColor: colors.button,
      backgroundColor: colors.accent_bg,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxEnabled: {
      borderColor: colors.button,
      backgroundColor: colors.button,
    },
    checkboxMark: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '700',
      lineHeight: 12,
    },
    optionalAssetTextWrap: {
      flex: 1,
      gap: 2,
    },
    optionalAssetName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    optionalAssetDescription: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 16,
    },
    modeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeButtonActive: {
      backgroundColor: colors.button,
      borderColor: colors.button,
    },
    modeButtonText: {
      color: colors.muted_text,
      fontSize: 14,
    },
    modeButtonTextActive: {
      color: colors.text,
      fontWeight: '500',
    },
    generateButton: {
      backgroundColor: colors.button,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    generateButtonDisabled: {
      backgroundColor: colors.border,
    },
    generateButtonText: {
      color: colors.button_text,
      fontSize: 16,
      fontWeight: '600',
    },
    resumeCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      marginBottom: 4,
    },
    resumeAssetList: {
      marginTop: 12,
      gap: 6,
    },
    resumeAssetHint: {
      color: colors.muted_text,
      fontSize: 12,
      marginBottom: 2,
    },
    resumeAssetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    resumeAssetName: {
      color: colors.text,
      fontSize: 13,
    },
    resumeAssetAction: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '500',
    },
    resumeTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    resumeSubtitle: {
      color: colors.muted_text,
      fontSize: 13,
      marginTop: 4,
    },
    resumeActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    resumePrimaryButton: {
      backgroundColor: colors.button,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    resumeDiscardButton: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    resumeDiscardButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    errorBox: {
      backgroundColor: colors.danger_bg,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.error_text,
    },
    errorTitle: {
      color: colors.error_text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    errorText: {
      color: colors.error_text,
      fontSize: 14,
    },
    successBox: {
      backgroundColor: colors.success_bg,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.success_text,
    },
    successTitle: {
      color: colors.success_text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    successInfo: {
      marginBottom: 8,
    },
    successLabel: {
      color: colors.success_text,
      fontSize: 12,
      marginBottom: 2,
    },
    successValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    viewButton: {
      backgroundColor: colors.success_bg,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    viewButtonText: {
      color: colors.success_text,
      fontSize: 14,
      fontWeight: '600',
    },
    outputContainer: {
      marginTop: 0,
    },
    outputBox: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outputText: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'monospace',
      lineHeight: 18,
    },
    typingIndicator: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 8,
      alignItems: 'center',
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.button,
    },
    typingDot2: {
      opacity: 0.7,
    },
    typingDot3: {
      opacity: 0.4,
    },
  });
}
