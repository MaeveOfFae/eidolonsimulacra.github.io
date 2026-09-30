import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { releaseNotes, type ReleaseNoteEntry } from '@char-gen/shared';
import type { ThemeColors } from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import { ArrowUturnLeftIcon, ClockIcon, DocumentTextIcon } from '../components/Icons';
import {
  formatReleaseDate,
  getCurrentReleaseNote,
  mapReleaseNoteRoute,
  type ReleaseNoteDestination,
} from '../lib/whats-new';
import { useTheme } from '../theme/ThemeProvider';
import { navigateToMobileDestination } from '../lib/route-targets';
import type { HomeStackNavigationProp } from '../types/navigation';

export default function WhatsNewScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'WhatsNew'>>();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const notes = releaseNotes;
  const currentNote = getCurrentReleaseNote(notes);

  const handleOpenDestination = (to: string) => {
    const destination: ReleaseNoteDestination | null = mapReleaseNoteRoute(to);
    if (destination) {
      navigateToMobileDestination(navigation, destination);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ClockIcon color={colors.accent} size={28} />
        <Text style={styles.title}>What's New</Text>
      </View>
      <Text style={styles.subtitle}>
        Release notes are generated from the same source as the web and desktop apps, so every surface reports the same
        release line.
      </Text>

      {currentNote ? (
        <View style={styles.currentCard}>
          <View style={styles.currentHeaderRow}>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>{currentNote.badge.toUpperCase()}</Text>
            </View>
            <Text style={styles.currentVersion}>v{currentNote.version}</Text>
          </View>
          <Text style={styles.currentHeadline}>{currentNote.headline}</Text>
          <Text style={styles.currentMeta}>Released {formatReleaseDate(currentNote.releasedOn)}</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No release notes yet</Text>
          <Text style={styles.emptyText}>Release notes appear here as soon as the release tooling records them.</Text>
        </View>
      )}

      {notes.map((entry) => (
        <CollapsibleTray
          key={entry.version}
          title={entry.headline}
          subtitle={`v${entry.version} • ${formatReleaseDate(entry.releasedOn)}`}
          meta={<Text style={styles.trayMetaText}>{entry.badge}</Text>}
          initiallyExpanded={entry.version === notes[0]?.version}
        >
          <ReleaseNoteBody entry={entry} onOpenDestination={handleOpenDestination} />
        </CollapsibleTray>
      ))}

      <Text style={styles.footerNote}>
        Notes are maintained by the release tooling and shared with the browser and desktop builds.
      </Text>
    </ScrollView>
  );
}

function ReleaseNoteBody({
  entry,
  onOpenDestination,
}: {
  entry: ReleaseNoteEntry;
  onOpenDestination: (to: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <>
      <Text style={styles.summary}>{entry.summary}</Text>

      <Text style={styles.sectionLabel}>Highlights</Text>
      <View style={styles.highlightList}>
        {entry.highlights.map((highlight) => (
          <View key={highlight} style={styles.highlightRow}>
            <View style={styles.highlightDot} />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>

      {entry.links.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Related</Text>
          <View style={styles.linkList}>
            {entry.links.map((link) => {
              const destination = mapReleaseNoteRoute(link.to);

              if (!destination) {
                return (
                  <View key={`${entry.version}-${link.to}`} style={[styles.linkButton, styles.linkButtonInactive]}>
                    <DocumentTextIcon color={colors.muted_text} size={16} />
                    <Text style={styles.linkTextInactive}>{link.label}</Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={`${entry.version}-${link.to}`}
                  style={styles.linkButton}
                  onPress={() => onOpenDestination(link.to)}
                >
                  <ArrowUturnLeftIcon color={colors.accent_title} size={16} />
                  <Text style={styles.linkText}>{link.label}</Text>
                  <Text style={styles.linkTarget}>{destination}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : null}
    </>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    trayMetaText: {
      color: colors.muted_text,
      fontSize: 11,
      fontWeight: '600',
    },
    currentCard: {
      backgroundColor: colors.accent_bg,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 18,
      padding: 16,
      gap: 8,
    },
    currentHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    currentBadge: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    currentBadgeText: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    currentVersion: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    currentHeadline: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    currentMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    summary: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
    },
    sectionLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 4,
    },
    highlightList: {
      gap: 8,
    },
    highlightRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    highlightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
      marginTop: 7,
    },
    highlightText: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    linkList: {
      gap: 8,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    linkButtonInactive: {
      opacity: 0.6,
    },
    linkText: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    linkTextInactive: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      fontWeight: '600',
    },
    linkTarget: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '600',
    },
    emptyState: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      gap: 6,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 13,
      textAlign: 'center',
    },
    footerNote: {
      color: colors.muted_text,
      fontSize: 12,
      textAlign: 'center',
    },
  });
}
