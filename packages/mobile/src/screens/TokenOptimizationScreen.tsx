import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { estimateTextStats, type OptimizeTextRequest } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { DocumentTextIcon, SparklesIcon } from '../components/Icons';
import type { HomeStackNavigationProp, HomeStackParamList } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TokenOptimizationRouteProp = RouteProp<HomeStackParamList, 'TokenOptimization'>;

export default function TokenOptimizationScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'TokenOptimization'>>();
  const route = useRoute<TokenOptimizationRouteProp>();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [targetReduction, setTargetReduction] = useState(25);
  const [preserveFormat, setPreserveFormat] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState<'input' | 'output' | null>(null);

  const sourceDraftId = route.params?.draftId;
  const sourceAssetName = route.params?.assetName;

  const optimizeMutation = useMutation({
    mutationFn: (request: OptimizeTextRequest) => new Promise<string>((resolve, reject) => {
      const stream = api.optimizeText(request);
      let fullContent = '';

      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          fullContent += data.content;
          setOutput(fullContent);
        }

        if (event.event === 'complete' && 'content' in event.data) {
          const data = event.data as { content: string };
          const finalContent = data.content || fullContent;
          setOutput(finalContent);
          resolve(finalContent);
        }
      });

      stream.onError_((error) => reject(new Error(error)));

      void stream.start().catch(reject);
    }),
    onError: (error: unknown) => {
      Alert.alert('Optimization failed', error instanceof Error ? error.message : 'Failed to optimize text');
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!sourceDraftId || !sourceAssetName || !output.trim()) {
        throw new Error('No draft asset target available.');
      }

      await api.updateAsset(sourceDraftId, sourceAssetName, output.trim());
    },
    onSuccess: () => {
      Alert.alert('Applied', `Updated ${sourceAssetName}.`);
    },
    onError: (error: unknown) => {
      Alert.alert('Apply failed', error instanceof Error ? error.message : 'Failed to update asset');
    },
  });

  useEffect(() => {
    if (!route.params?.text || input.length > 0) {
      return;
    }

    setInput(route.params.text);
  }, [input.length, route.params?.text]);

  const inputStats = useMemo(() => estimateTextStats(input), [input]);
  const outputStats = useMemo(() => estimateTextStats(output), [output]);
  const tokenDelta = Math.max(0, inputStats.estimatedTokens - outputStats.estimatedTokens);
  const tokenReductionPercent = inputStats.estimatedTokens > 0
    ? Math.max(0, Math.round((tokenDelta / inputStats.estimatedTokens) * 100))
    : 0;

  const handleOptimize = () => {
    if (!input.trim() || optimizeMutation.isPending) {
      return;
    }

    setOutput('');
    optimizeMutation.mutate({
      text: input,
      target_reduction: targetReduction,
      preserve_format: preserveFormat,
    });
  };

  const handleCopy = async (value: string, source: 'input' | 'output') => {
    if (!value.trim()) {
      return;
    }

    await Clipboard.setStringAsync(value);
    setCopied(source);
    setTimeout(() => {
      setCopied((current) => current === source ? null : current);
    }, 1500);
  };

  const handleReplaceInput = () => {
    if (!output.trim()) {
      return;
    }

    setInput(output);
    setOutput('');
  };

  const handleApplyToAsset = () => {
    if (!sourceDraftId || !sourceAssetName || !output.trim() || applyMutation.isPending) {
      return;
    }

    applyMutation.mutate();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom + 72 }]}>
      <Text style={styles.title}>Token Optimization</Text>
      <Text style={styles.subtitle}>Shorten text without removing relevant data.</Text>

      <CollapsibleTray
        title="Controls"
        subtitle="Compression target and format handling"
        initiallyExpanded
        preview={<Text style={styles.trayPreviewText}>{targetReduction}% target • {preserveFormat ? 'preserve format' : 'light reformat'}</Text>}
      >
        <Text style={styles.sectionTitle}>Optimization Controls</Text>
        <Text style={styles.helperText}>Aim for shorter phrasing, less repetition, and lower token usage without deleting meaningful content.</Text>

        <Text style={styles.fieldLabel}>Target reduction: {targetReduction}%</Text>
        <View style={styles.rangeRow}>
          {[10, 25, 40, 60].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.presetChip, targetReduction === value && styles.presetChipActive]}
              onPress={() => setTargetReduction(value)}
              disabled={optimizeMutation.isPending}
            >
              <Text style={[styles.presetChipText, targetReduction === value && styles.presetChipTextActive]}>{value}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.toggleChip, preserveFormat && styles.toggleChipActive]}
          onPress={() => setPreserveFormat((current) => !current)}
          disabled={optimizeMutation.isPending}
        >
          <Text style={[styles.toggleChipText, preserveFormat && styles.toggleChipTextActive]}>
            {preserveFormat ? 'Preserve Format: On' : 'Preserve Format: Off'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, (!input.trim() || optimizeMutation.isPending) && styles.disabledButton]}
          onPress={handleOptimize}
          disabled={!input.trim() || optimizeMutation.isPending}
        >
          {optimizeMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <SparklesIcon color="#fff" size={18} />
          )}
          <Text style={styles.primaryButtonText}>{optimizeMutation.isPending ? 'Optimizing...' : 'Optimize Text'}</Text>
        </TouchableOpacity>

        {sourceDraftId && sourceAssetName ? (
          <TouchableOpacity
            style={[styles.secondaryButton, (!output.trim() || applyMutation.isPending) && styles.disabledButton]}
            onPress={handleApplyToAsset}
            disabled={!output.trim() || applyMutation.isPending}
          >
            {applyMutation.isPending ? <ActivityIndicator color="#d1d5db" size="small" /> : null}
            <Text style={styles.secondaryButtonText}>{applyMutation.isPending ? 'Applying...' : `Apply to ${sourceAssetName}`}</Text>
          </TouchableOpacity>
        ) : null}
      </CollapsibleTray>

      <CollapsibleTray
        title="Input"
        subtitle="Paste the source text"
        initiallyExpanded
        preview={<Text style={styles.trayPreviewText}>{inputStats.characters} chars • ~{inputStats.estimatedTokens} tokens</Text>}
      >
        <View style={styles.statsRow}>
          <Text style={styles.helperText}>{inputStats.characters} chars • {inputStats.words} words • ~{inputStats.estimatedTokens} tokens</Text>
          <TouchableOpacity onPress={() => void handleCopy(input, 'input')} disabled={!input.trim()}>
            <Text style={[styles.linkText, !input.trim() && styles.disabledText]}>{copied === 'input' ? 'Copied' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={input}
          onChangeText={setInput}
          placeholder="Paste prompt, rules, blueprint text, scene text, or other content to tighten."
          placeholderTextColor="#6b7280"
          multiline
          textAlignVertical="top"
          scrollEnabled
        />
      </CollapsibleTray>

      <CollapsibleTray
        title="Optimized output"
        subtitle="Shorter wording with meaning preserved"
        initiallyExpanded={Boolean(output)}
        preview={<Text style={styles.trayPreviewText}>{outputStats.characters} chars • ~{outputStats.estimatedTokens} tokens</Text>}
      >
        <View style={styles.statsRow}>
          <Text style={styles.helperText}>{outputStats.characters} chars • {outputStats.words} words • ~{outputStats.estimatedTokens} tokens</Text>
          <View style={styles.inlineActionRow}>
            <TouchableOpacity onPress={handleReplaceInput} disabled={!output.trim()}>
              <Text style={[styles.linkText, !output.trim() && styles.disabledText]}>Replace input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void handleCopy(output, 'output')} disabled={!output.trim()}>
              <Text style={[styles.linkText, !output.trim() && styles.disabledText]}>{copied === 'output' ? 'Copied' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={output}
          onChangeText={setOutput}
          placeholder="Optimized text will appear here."
          placeholderTextColor="#6b7280"
          multiline
          textAlignVertical="top"
          scrollEnabled
        />
      </CollapsibleTray>

      <CollapsibleTray
        title="Comparison"
        subtitle="Estimated size change"
        preview={<Text style={styles.trayPreviewText}>{tokenDelta} saved • {output ? `${tokenReductionPercent}%` : '--'}</Text>}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <DocumentTextIcon color="#7c3aed" size={20} />
            <View>
              <Text style={styles.summaryLabel}>Estimated tokens saved</Text>
              <Text style={styles.summaryValue}>{tokenDelta}</Text>
            </View>
          </View>
          <View style={styles.summaryMetric}>
            <DocumentTextIcon color="#7c3aed" size={20} />
            <View>
              <Text style={styles.summaryLabel}>Reduction</Text>
              <Text style={styles.summaryValue}>{output ? `${tokenReductionPercent}%` : '--'}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.helperText}>This estimate is approximate and intended for before/after comparison, not provider billing accuracy.</Text>
      </CollapsibleTray>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  trayPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  helperText: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  presetChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  presetChipText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: '#fff',
  },
  toggleChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  toggleChipActive: {
    backgroundColor: '#2a1a45',
    borderColor: '#7c3aed',
  },
  toggleChipText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },
  toggleChipTextActive: {
    color: '#fff',
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    fontSize: 14,
  },
  textArea: {
    minHeight: 220,
    maxHeight: 420,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  inlineActionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#27272a',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  linkText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  summaryCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  summaryMetric: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
