import { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HELP_ENTRY_EYEBROWS, buildHelpEntrySections, type PageHelpEntry, type ThemeColors } from '@char-gen/shared';
import { mapHelpTarget } from '../lib/help';
import { useTheme } from '../theme/ThemeProvider';
import { XMarkIcon } from './Icons';

interface HelpSheetProps {
  entry: PageHelpEntry | null;
  visible: boolean;
  onClose: () => void;
  /** Follows a link the entry offers. Unreachable routes render as inert text instead. */
  onOpenTarget: (to: string) => void;
}

/**
 * A page-help entry as a bottom sheet: the touch counterpart of the web's drawer and
 * tooltip, and a sheet rather than a tooltip on purpose — content that appears on hover
 * and vanishes when the pointer leaves has no meaning without a pointer, and content
 * that dismisses itself cannot be read at arm's length.
 *
 * It renders the same `buildHelpEntrySections` output as web, so the section names and
 * how much of each list is shown are decided once in `@char-gen/shared` rather than
 * twice on two platforms.
 *
 * Android's back button closes it through `onRequestClose` — the platform's Escape —
 * and the backdrop does the same by touch.
 */
export default function HelpSheet({ entry, visible, onClose, onOpenTarget }: HelpSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  if (!entry) {
    return null;
  }

  const sections = buildHelpEntrySections(entry, 'full');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>{HELP_ENTRY_EYEBROWS.full}</Text>
              <Text style={styles.title}>{entry.title}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close help"
            >
              <XMarkIcon color={colors.muted_text} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.summary}>{entry.summary}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to do on this page</Text>
              {sections.keyActions.map((action) => (
                <View key={action} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </View>

            {sections.pitfalls.length > 0 ? (
              <View style={[styles.section, styles.warningSection]}>
                <Text style={styles.sectionTitle}>Common mistakes to avoid</Text>
                {sections.pitfalls.map((pitfall) => (
                  <View key={pitfall} style={styles.bulletRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.warning_text }]} />
                    <Text style={styles.bulletText}>{pitfall}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {sections.actions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Useful next steps</Text>
                {sections.actions.map((action) => {
                  // A route mobile cannot reach stays visible as text with the route
                  // shown, rather than a button that does nothing when tapped.
                  const reachable = mapHelpTarget(action.to) !== null;

                  return reachable ? (
                    <TouchableOpacity
                      key={action.to}
                      style={styles.actionLink}
                      onPress={() => onOpenTarget(action.to)}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                    >
                      <Text style={styles.actionLinkText}>{action.label}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text key={action.to} style={styles.unreachableLink}>
                      {`${action.label} — ${action.to} is not in the mobile app`}
                    </Text>
                  );
                })}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 22,
      maxHeight: '85%',
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    eyebrow: {
      color: colors.accent_title,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    closeButton: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      padding: 6,
    },
    body: {
      flexGrow: 0,
    },
    bodyContent: {
      gap: 14,
      paddingBottom: 4,
    },
    summary: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    section: {
      backgroundColor: colors.window,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    warningSection: {
      borderColor: colors.warning_text,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    bulletRow: {
      flexDirection: 'row',
      gap: 10,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
    },
    bulletText: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    actionLink: {
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    actionLinkText: {
      color: colors.accent_title,
      fontSize: 13,
      fontWeight: '600',
    },
    unreachableLink: {
      color: colors.muted_text,
      fontSize: 12,
      fontStyle: 'italic',
      lineHeight: 18,
    },
  });
}
