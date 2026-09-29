import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { SparklesIcon, ClipboardIcon } from '../components/Icons';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '@char-gen/shared';
import type { HomeStackNavigationProp } from '../types/navigation';

const defaultGenreLines = ['Noir detective', 'Cyberpunk mercenary', 'Fantasy sorceress'].join('\n');

export default function SeedGeneratorScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'SeedGenerator'>>();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [genreLines, setGenreLines] = useState(defaultGenreLines);
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null);

  const seedMutation = useMutation({
    mutationFn: (request: { genre_lines: string; surprise_mode?: boolean }) => api.generateSeeds(request),
    onError: (error: unknown) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Seed generation failed');
    },
  });

  const seeds = seedMutation.data?.seeds ?? [];

  const handleGenerate = () => {
    if (!genreLines.trim()) {
      return;
    }
    seedMutation.mutate({ genre_lines: genreLines, surprise_mode: false });
  };

  const handleSurprise = () => {
    seedMutation.mutate({ genre_lines: '', surprise_mode: true });
  };

  const handleUseSeed = (seed: string) => {
    navigation.navigate('Generate', { seed });
  };

  const handleCopySeed = async (seed: string) => {
    await Clipboard.setStringAsync(seed);
    setCopiedSeed(seed);
    setTimeout(() => setCopiedSeed(null), 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Seed Generator</Text>
      <Text style={styles.subtitle}>Turn themes into usable seeds.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Genre or Theme Lines</Text>
        <Text style={styles.helperText}>One line per theme.</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={genreLines}
          onChangeText={setGenreLines}
          placeholder="fantasy&#10;cyberpunk noir&#10;Victorian horror"
          placeholderTextColor={colors.muted_text}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, (!genreLines.trim() || seedMutation.isPending) && styles.disabledButton]}
            onPress={handleGenerate}
            disabled={!genreLines.trim() || seedMutation.isPending}
          >
            {seedMutation.isPending && !seedMutation.variables?.surprise_mode ? (
              <ActivityIndicator color={colors.button_text} size="small" />
            ) : (
              <SparklesIcon color={colors.button_text} size={18} />
            )}
            <Text style={styles.primaryButtonText}>Generate Seeds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, seedMutation.isPending && styles.disabledButton]}
            onPress={handleSurprise}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending && seedMutation.variables?.surprise_mode ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <SparklesIcon color={colors.text} size={18} />
            )}
            <Text style={styles.secondaryButtonText}>Surprise Me</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CollapsibleTray
        title="Generated seeds"
        subtitle="Use or copy any result"
        initiallyExpanded={seeds.length > 0}
        preview={
          <Text style={styles.trayPreviewText}>
            {seeds.length} seed{seeds.length === 1 ? '' : 's'}
          </Text>
        }
        style={styles.card}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Results</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{seeds.length} seeds</Text>
          </View>
        </View>

        {seeds.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No seeds yet</Text>
            <Text style={styles.emptyText}>Generate a set to start exploring concepts.</Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {seeds.map((seed) => (
              <View key={seed} style={styles.seedCard}>
                <Text style={styles.seedText}>{seed}</Text>
                <View style={styles.seedActions}>
                  <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => handleUseSeed(seed)}>
                    <Text style={styles.primaryButtonText}>Use In Generate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButtonSmall} onPress={() => handleCopySeed(seed)}>
                    <ClipboardIcon color={colors.text} size={16} />
                    <Text style={styles.secondaryButtonText}>{copiedSeed === seed ? 'Copied' : 'Copy'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </CollapsibleTray>
    </ScrollView>
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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted_text,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trayPreviewText: {
      fontSize: 12,
      color: colors.muted_text,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    helperText: {
      fontSize: 12,
      color: colors.muted_text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.window,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 15,
    },
    textArea: {
      minHeight: 140,
      marginBottom: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.button,
      paddingVertical: 12,
      borderRadius: 8,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.window,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disabledButton: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: colors.button_text,
      fontSize: 14,
      fontWeight: '600',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    countBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.window,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    countText: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '500',
    },
    emptyState: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 13,
      textAlign: 'center',
    },
    resultsList: {
      gap: 12,
    },
    seedCard: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
    },
    seedText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 12,
    },
    seedActions: {
      flexDirection: 'row',
      gap: 8,
    },
    primaryButtonSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
    secondaryButtonSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.window,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}
