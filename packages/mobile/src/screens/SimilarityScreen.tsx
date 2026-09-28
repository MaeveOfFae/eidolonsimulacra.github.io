import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { type ContentMode, type SimilarityResult } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { UsersIcon } from '../components/Icons';
import { clearMobileCompareSelection, setMobileCompareSelection } from '../lib/compare-selection';
import type { CompareRouteProp } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';

export default function SimilarityScreen() {
  const route = useRoute<CompareRouteProp>();
  const [char1, setChar1] = useState<string>('');
  const [char2, setChar2] = useState<string>('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [useLlm, setUseLlm] = useState(false);
  const [result, setResult] = useState<SimilarityResult | null>(null);

  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const compareMutation = useMutation({
    mutationFn: () =>
      api.compareCharacters({
        draft1_id: char1,
        draft2_id: char2,
        mode,
        use_llm: useLlm,
      }),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to compare characters'));
    },
  });

  const getCharName = (id: string) => {
    const draft = draftsData?.drafts.find((d) => d.review_id === id);
    return draft?.character_name || id;
  };

  useEffect(() => {
    const params = route.params;
    if (!draftsData?.drafts || !params) {
      return;
    }

    if (
      params.character1 &&
      draftsData.drafts.some((draft) => draft.review_id === params.character1) &&
      params.character1 !== char1
    ) {
      setChar1(params.character1);
    }

    if (
      params.character2 &&
      draftsData.drafts.some((draft) => draft.review_id === params.character2) &&
      params.character2 !== char2
    ) {
      setChar2(params.character2);
    }
  }, [char1, char2, draftsData?.drafts, route.params]);

  useEffect(() => {
    if (!draftsData?.drafts) {
      return;
    }

    if (!char1) {
      clearMobileCompareSelection();
      return;
    }

    const primaryDraft = draftsData.drafts.find((draft) => draft.review_id === char1);
    if (!primaryDraft) {
      return;
    }

    setMobileCompareSelection({
      character1Id: char1,
      character1Name: primaryDraft.character_name || primaryDraft.seed,
    });
  }, [char1, draftsData?.drafts]);

  const handleCompare = () => {
    if (!char1 || !char2) {
      Alert.alert('Error', 'Please select two characters to compare');
      return;
    }
    setResult(null);
    compareMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];
  const drafts = draftsData?.drafts || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Compare</Text>
      <Text style={styles.subtitle}>Analyze overlap between two drafts.</Text>

      <CollapsibleTray
        title="Characters"
        subtitle="Pick the two drafts to compare"
        initiallyExpanded
        preview={
          <Text style={styles.trayPreviewText}>
            {char1 ? getCharName(char1) : 'Character 1'} • {char2 ? getCharName(char2) : 'Character 2'}
          </Text>
        }
      >
        <View style={styles.selectionContainer}>
          <View style={styles.characterCard}>
            <View style={styles.characterHeader}>
              <UsersIcon color="#7c3aed" size={20} />
              <Text style={styles.characterLabel}>Character 1</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {drafts
                  .filter((draft) => draft.review_id !== char2)
                  .map((draft) => (
                    <TouchableOpacity
                      key={draft.review_id}
                      onPress={() => setChar1(draft.review_id)}
                      style={[styles.chip, char1 === draft.review_id && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, char1 === draft.review_id && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {draft.character_name || draft.seed}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            {char1 ? <Text style={styles.selectedText}>Selected: {getCharName(char1)}</Text> : null}
          </View>

          <View style={styles.characterCard}>
            <View style={styles.characterHeader}>
              <UsersIcon color="#a78bfa" size={20} />
              <Text style={styles.characterLabel}>Character 2</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {drafts
                  .filter((draft) => draft.review_id !== char1)
                  .map((draft) => (
                    <TouchableOpacity
                      key={draft.review_id}
                      onPress={() => setChar2(draft.review_id)}
                      style={[styles.chip, char2 === draft.review_id && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, char2 === draft.review_id && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {draft.character_name || draft.seed}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            {char2 ? <Text style={styles.selectedText}>Selected: {getCharName(char2)}</Text> : null}
          </View>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Options"
        subtitle="Mode and depth of analysis"
        preview={
          <Text style={styles.trayPreviewText}>
            {mode} • {useLlm ? 'deep analysis' : 'fast analysis'}
          </Text>
        }
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

        <TouchableOpacity onPress={() => setUseLlm(!useLlm)} style={styles.toggleContainer}>
          <View style={[styles.toggleTrack, useLlm && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, useLlm && styles.toggleThumbActive]} />
          </View>
          <Text style={styles.toggleLabel}>Use LLM for deep analysis</Text>
        </TouchableOpacity>
      </CollapsibleTray>

      {/* Compare Button */}
      <TouchableOpacity
        onPress={handleCompare}
        disabled={!char1 || !char2 || compareMutation.isPending}
        style={[styles.compareButton, (!char1 || !char2 || compareMutation.isPending) && styles.compareButtonDisabled]}
      >
        {compareMutation.isPending ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.compareButtonText}>Analyzing...</Text>
          </View>
        ) : (
          <Text style={styles.compareButtonText}>Compare Characters</Text>
        )}
      </TouchableOpacity>

      {result && (
        <CollapsibleTray
          title="Results"
          subtitle={`${getCharName(char1)} vs ${getCharName(char2)}`}
          initiallyExpanded
          preview={
            <Text style={styles.trayPreviewText}>
              {result.overall_score !== undefined
                ? `${(result.overall_score * 100).toFixed(0)}% match`
                : 'Analysis ready'}
              {result.llm_analysis ? ' • deep analysis' : ''}
            </Text>
          }
        >
          {result.overall_score !== undefined && (
            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>Similarity Score</Text>
              <Text style={styles.scoreValue}>{(result.overall_score * 100).toFixed(0)}%</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${result.overall_score * 100}%` }]} />
              </View>
            </View>
          )}

          {result.commonalities && result.commonalities.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Commonalities</Text>
              {result.commonalities.map((item: string, idx: number) => (
                <View key={idx} style={styles.resultItem}>
                  <View style={styles.commonalityDot} />
                  <Text style={styles.resultItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {result.differences && result.differences.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Differences</Text>
              {result.differences.map((item: string, idx: number) => (
                <View key={idx} style={styles.resultItem}>
                  <View style={styles.differenceDot} />
                  <Text style={styles.resultItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {result.llm_analysis && (
            <View style={styles.llmSection}>
              <Text style={styles.resultSectionTitle}>LLM Analysis</Text>
              <Text style={styles.llmText}>{result.llm_analysis.relationship_potential}</Text>

              {result.llm_analysis.conflict_areas.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Conflict Areas</Text>
                  {result.llm_analysis.conflict_areas.map((item, idx) => (
                    <View key={`conflict-${idx}`} style={styles.resultItem}>
                      <View style={styles.differenceDot} />
                      <Text style={styles.resultItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {result.llm_analysis.synergy_areas.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Synergy Areas</Text>
                  {result.llm_analysis.synergy_areas.map((item, idx) => (
                    <View key={`synergy-${idx}`} style={styles.resultItem}>
                      <View style={styles.commonalityDot} />
                      <Text style={styles.resultItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {result.llm_analysis.story_hooks.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Story Hooks</Text>
                  {result.llm_analysis.story_hooks.map((item, idx) => (
                    <View key={`hook-${idx}`} style={styles.resultItem}>
                      <View style={styles.commonalityDot} />
                      <Text style={styles.resultItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </CollapsibleTray>
      )}

      {!char1 && !char2 && !compareMutation.isPending && (
        <View style={styles.emptyState}>
          <UsersIcon color="#6b7280" size={48} />
          <Text style={styles.emptyTitle}>Select Two Characters</Text>
          <Text style={styles.emptyText}>Choose two drafts to compare traits and overlap.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  trayPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  selectionContainer: {
    gap: 16,
  },
  characterCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  characterLabel: {
    color: '#fff',
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
    backgroundColor: '#2f2f2f',
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: '#7c3aed',
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedText: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#a1a1aa',
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
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  modeButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  modeButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    backgroundColor: '#2f2f2f',
    borderRadius: 12,
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#7c3aed',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  compareButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  compareButtonDisabled: {
    backgroundColor: '#3f3f46',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
    marginBottom: 24,
  },
  resultTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2f2f2f',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  commonalityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginTop: 6,
  },
  differenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginTop: 6,
  },
  resultItemText: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
  },
  llmSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2f2f2f',
  },
  llmText: {
    color: '#d4d4d8',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
