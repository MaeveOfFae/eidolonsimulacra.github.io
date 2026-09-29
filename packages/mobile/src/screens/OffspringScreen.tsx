import { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ContentMode } from '@char-gen/shared';
import type { ThemeColors } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { BabyIcon, UsersIcon } from '../components/Icons';
import { useTheme } from '../theme/ThemeProvider';
import type { HomeStackNavigationProp, OffspringRouteProp } from '../types/navigation';

function summarizeText(content: string, maxLength = 160): string {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

export default function OffspringScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'Lineage'>>();
  const route = useRoute<OffspringRouteProp>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [parent1, setParent1] = useState<string>('');
  const [parent2, setParent2] = useState<string>('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<{ draftId: string; characterName: string } | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const getParentName = (id: string) => {
    const draft = draftsData?.drafts.find((d) => d.review_id === id);
    return draft?.character_name || id;
  };

  useEffect(() => {
    const params = route.params;
    if (!draftsData?.drafts || !params) {
      return;
    }

    if (
      params.parent1 &&
      draftsData.drafts.some((draft) => draft.review_id === params.parent1) &&
      params.parent1 !== parent1
    ) {
      setParent1(params.parent1);
    }

    if (
      params.parent2 &&
      draftsData.drafts.some((draft) => draft.review_id === params.parent2) &&
      params.parent2 !== parent2
    ) {
      setParent2(params.parent2);
    }
  }, [draftsData?.drafts, parent1, parent2, route.params]);

  const handleGenerate = async () => {
    if (!parent1 || !parent2) {
      Alert.alert('Error', 'Please select two parents');
      return;
    }

    setIsGenerating(true);
    setOutput('');
    setResult(null);

    try {
      const stream = api.generateOffspring({
        parent1_id: parent1,
        parent2_id: parent2,
        mode,
      });

      abortRef.current = () => stream.abort();

      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          setOutput((prev) => prev + data.content);
        }
        if (event.event === 'complete' && 'draft_id' in event.data) {
          const data = event.data as { draft_id?: string; character_name?: string };
          setResult({
            draftId: data.draft_id || '',
            characterName: data.character_name || 'Unknown',
          });
          // Refresh drafts list
          queryClient.invalidateQueries({ queryKey: ['drafts'] });
        }
      });

      stream.onError_((error) => {
        console.error('Offspring generation error:', error);
        Alert.alert('Error', 'Failed to generate offspring');
        setIsGenerating(false);
      });

      stream.onComplete_(() => {
        setIsGenerating(false);
      });

      await stream.start();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate offspring');
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current();
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];
  const drafts = draftsData?.drafts || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BabyIcon color={colors.accent} size={28} />
        <Text style={styles.title}>Offspring</Text>
      </View>
      <Text style={styles.subtitle}>Blend two drafts into a new character.</Text>

      <CollapsibleTray
        title="Parents"
        subtitle="Choose two source drafts"
        initiallyExpanded
        preview={
          <Text style={styles.trayPreviewText}>
            {parent1 ? getParentName(parent1) : 'Parent 1'} • {parent2 ? getParentName(parent2) : 'Parent 2'}
          </Text>
        }
      >
        <View style={styles.selectionContainer}>
          <View style={styles.parentCard}>
            <View style={styles.parentHeader}>
              <UsersIcon color={colors.accent} size={20} />
              <Text style={styles.parentLabel}>Parent 1</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {drafts
                  .filter((draft) => draft.review_id !== parent2)
                  .map((draft) => (
                    <TouchableOpacity
                      key={draft.review_id}
                      onPress={() => setParent1(draft.review_id)}
                      style={[styles.chip, parent1 === draft.review_id && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, parent1 === draft.review_id && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {draft.character_name || draft.review_id}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            {parent1 ? <Text style={styles.selectedText}>Selected: {getParentName(parent1)}</Text> : null}
          </View>

          <View style={styles.connector}>
            <View style={styles.connectorLine} />
            <BabyIcon color={colors.accent} size={20} />
            <View style={styles.connectorLine} />
          </View>

          <View style={styles.parentCard}>
            <View style={styles.parentHeader}>
              <UsersIcon color={colors.accent_title} size={20} />
              <Text style={styles.parentLabel}>Parent 2</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {drafts
                  .filter((draft) => draft.review_id !== parent1)
                  .map((draft) => (
                    <TouchableOpacity
                      key={draft.review_id}
                      onPress={() => setParent2(draft.review_id)}
                      style={[styles.chip, parent2 === draft.review_id && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, parent2 === draft.review_id && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {draft.character_name || draft.review_id}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            {parent2 ? <Text style={styles.selectedText}>Selected: {getParentName(parent2)}</Text> : null}
          </View>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Options"
        subtitle="Mode for the generated draft"
        preview={<Text style={styles.trayPreviewText}>{mode}</Text>}
      >
        <Text style={styles.sectionLabel}>Content Mode</Text>
        <View style={styles.modeContainer}>
          {modes.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </CollapsibleTray>

      <TouchableOpacity
        onPress={isGenerating ? handleCancel : handleGenerate}
        disabled={!parent1 || !parent2}
        style={[
          styles.generateButton,
          (!parent1 || !parent2) && styles.generateButtonDisabled,
          isGenerating && styles.generateButtonCancel,
        ]}
      >
        {isGenerating ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color={colors.button_text} size="small" />
            <Text style={styles.generateButtonText}>Cancel</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <BabyIcon color={colors.button_text} size={20} />
            <Text style={styles.generateButtonText}>Generate Offspring</Text>
          </View>
        )}
      </TouchableOpacity>

      {result && (
        <CollapsibleTray
          title="Result"
          subtitle={result.characterName}
          initiallyExpanded
          preview={
            <Text style={styles.trayPreviewText}>
              {getParentName(parent1)} + {getParentName(parent2)}
            </Text>
          }
        >
          <View style={styles.resultInfo}>
            <Text style={styles.resultLabel}>Character</Text>
            <Text style={styles.resultValue}>{result.characterName}</Text>
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultLabel}>Parents</Text>
            <Text style={styles.resultValue}>
              {getParentName(parent1)} + {getParentName(parent2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              if (result?.draftId) {
                navigation.navigate('Drafts', {
                  screen: 'DraftDetail',
                  params: { draftId: result.draftId },
                });
              } else {
                navigation.navigate('Drafts');
              }
            }}
          >
            <Text style={styles.viewButtonText}>View Character</Text>
          </TouchableOpacity>
        </CollapsibleTray>
      )}

      {output && (
        <CollapsibleTray
          title="Generation output"
          subtitle={isGenerating ? 'Streaming' : 'Complete'}
          initiallyExpanded={isGenerating}
          preview={<Text style={styles.trayPreviewText}>{summarizeText(output)}</Text>}
        >
          <Text style={styles.outputText}>{output}</Text>
        </CollapsibleTray>
      )}

      {!parent1 && !parent2 && !isGenerating && (
        <View style={styles.emptyState}>
          <BabyIcon color={colors.muted_text} size={48} />
          <Text style={styles.emptyTitle}>Select Two Parents</Text>
          <Text style={styles.emptyText}>Choose two drafts to blend into a new character.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function buildStyles(colors: ThemeColors) {
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
    content: {
      padding: 16,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted_text,
      marginBottom: 4,
    },
    trayPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    selectionContainer: {
      gap: 0,
    },
    parentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    parentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    parentLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    chipContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      backgroundColor: colors.border,
      borderRadius: 16,
    },
    chipActive: {
      backgroundColor: colors.button,
    },
    chipText: {
      color: colors.muted_text,
      fontSize: 13,
    },
    chipTextActive: {
      color: colors.button_text,
      fontWeight: '500',
    },
    selectedText: {
      color: colors.border,
      fontSize: 12,
      marginTop: 8,
    },
    connector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      justifyContent: 'center',
    },
    connectorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      color: colors.muted_text,
      fontSize: 14,
      marginBottom: 8,
    },
    modeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    modeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.window,
      borderRadius: 8,
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
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    generateButtonDisabled: {
      backgroundColor: colors.border,
    },
    generateButtonCancel: {
      backgroundColor: colors.danger_bg,
    },
    generateButtonText: {
      color: colors.button_text,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultCard: {
      backgroundColor: colors.success_bg,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.success_text,
      marginBottom: 24,
    },
    resultTitle: {
      color: colors.success_text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    resultInfo: {
      marginBottom: 8,
    },
    resultLabel: {
      color: colors.success_text,
      fontSize: 12,
      marginBottom: 2,
    },
    resultValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    viewButton: {
      backgroundColor: colors.success_bg,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    viewButtonText: {
      color: colors.success_text,
      fontSize: 14,
      fontWeight: '600',
    },
    outputCard: {
      backgroundColor: colors.window,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    outputTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    outputText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    emptyState: {
      backgroundColor: colors.window,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
