import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { DraftAssetApprovalStatus, ThemeColors } from '@char-gen/shared';
import { CheckIcon, XMarkIcon } from './Icons';
import { useTheme } from '../theme/ThemeProvider';
import { MOBILE_APPROVAL_DECISIONS, type MobileApprovalEntry, type MobileApprovalQueue } from '../lib/review-approval';

/**
 * The content of the "Asset approvals" tray. The collapsible shell is the screen's
 * job (it owns `CollapsibleTray`), so this stays a plain list of decisions: every
 * row is one asset, the status it is in, and the two things a reviewer can do
 * about it.
 */
type ReviewApprovalTrayProps = {
  queue: MobileApprovalQueue;
  /** The asset with a decision in flight, so only its row shows a spinner. */
  pendingAssetName?: string | null;
  disabled?: boolean;
  onDecide: (assetName: string, status: DraftAssetApprovalStatus) => void;
};

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 12,
    },
    progressCard: {
      backgroundColor: colors.window,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
    },
    progressLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    gatingText: {
      color: colors.warning_text,
      fontSize: 12,
      lineHeight: 17,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    row: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    rowTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    chip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    rowMeta: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 17,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    action: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      paddingVertical: 9,
    },
    actionActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    actionDisabled: {
      opacity: 0.5,
    },
    actionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    actionTextActive: {
      color: colors.accent,
    },
  });
}

function resolveChipColors(entry: MobileApprovalEntry, colors: ThemeColors) {
  switch (entry.status) {
    case 'approved':
      return { backgroundColor: colors.success_bg, borderColor: colors.success_bg, color: colors.success_text };
    case 'changes_requested':
      return { backgroundColor: colors.danger_bg, borderColor: colors.danger_bg, color: colors.error_text };
    case 'stale':
      return { backgroundColor: colors.window, borderColor: colors.border, color: colors.warning_text };
    default:
      return { backgroundColor: colors.window, borderColor: colors.border, color: colors.muted_text };
  }
}

export default function ReviewApprovalTray({
  queue,
  pendingAssetName,
  disabled = false,
  onDecide,
}: ReviewApprovalTrayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  if (queue.totalCount === 0) {
    return <Text style={styles.emptyText}>No reviewable assets yet. Generate a draft to approve assets.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>{queue.progressLabel}</Text>
        {queue.requiresAcknowledgement
          ? queue.blockingWarnings.map((warning) => (
              <Text key={warning} style={styles.gatingText}>
                {warning}
              </Text>
            ))
          : null}
      </View>

      {queue.entries.map((entry) => {
        const chip = resolveChipColors(entry, colors);
        const rowPending = pendingAssetName === entry.assetName;
        const rowDisabled = disabled || rowPending;

        return (
          <View key={entry.assetName} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowTitle}>{entry.label}</Text>
              <View style={[styles.chip, { backgroundColor: chip.backgroundColor, borderColor: chip.borderColor }]}>
                <Text style={[styles.chipText, { color: chip.color }]}>{entry.statusLabel}</Text>
              </View>
            </View>

            {entry.note && entry.status !== 'unapproved' ? (
              <Text style={styles.rowMeta} numberOfLines={3}>
                {`Reviewer note: ${entry.note}`}
              </Text>
            ) : null}

            {entry.decidedAt ? (
              <Text style={styles.rowMeta}>{`Decided ${new Date(entry.decidedAt).toLocaleString()}`}</Text>
            ) : null}

            <View style={styles.actions}>
              {MOBILE_APPROVAL_DECISIONS.map((decision) => {
                const isCurrent = entry.status === decision.status;

                return (
                  <TouchableOpacity
                    key={decision.status}
                    style={[styles.action, isCurrent && styles.actionActive, rowDisabled && styles.actionDisabled]}
                    disabled={rowDisabled}
                    activeOpacity={0.85}
                    onPress={() => onDecide(entry.assetName, decision.status)}
                    accessibilityRole="button"
                    accessibilityLabel={`${decision.label} ${entry.label}`}
                    accessibilityState={{ disabled: rowDisabled, selected: isCurrent }}
                  >
                    {rowPending ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <>
                        {decision.status === 'approved' ? (
                          <CheckIcon color={isCurrent ? colors.accent : colors.muted_text} size={14} />
                        ) : (
                          <XMarkIcon color={isCurrent ? colors.accent : colors.muted_text} size={14} />
                        )}
                        <Text style={[styles.actionText, isCurrent && styles.actionTextActive]}>{decision.label}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
