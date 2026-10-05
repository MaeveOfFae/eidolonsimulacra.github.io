import { useEffect, useMemo, useState } from 'react';

import { getOrderedAssets } from '@char-gen/shared';
import {
  isResumableMobileGenerationSession,
  orderedCompletedAssetNames,
  trimSessionFromAsset,
  type MobileGenerationSession,
} from '../lib/generation-session';
import { clearGenerationSession, loadGenerationSession } from '../storage/generation-session';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  detectAndParseCharacter,
  type ContentMode,
  type GenerationComplete,
  type ImportedCharacter,
  type Template,
} from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { SparklesIcon, DocumentTextIcon, TrashIcon } from '../components/Icons';
import { useTheme } from '../theme/ThemeProvider';
import type { GenerateRouteProp, RootTabNavigationProp } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { pickCharacterImportFile } from '../utils/file-transfer';
import { buildStyles } from './generate/styles';

function getDefaultSelectedTemplateAssets(templateDefinition?: Template): string[] {
  if (!templateDefinition) {
    return [];
  }

  return templateDefinition.assets
    .filter((asset) => {
      if (asset.required) {
        return true;
      }

      if (asset.name === 'system_prompt' || asset.name === 'post_history') {
        return false;
      }

      return true;
    })
    .map((asset) => asset.name);
}

function normalizeAssetSelection(selection: readonly string[], templateDefinition?: Template): string[] {
  if (!templateDefinition) {
    return [];
  }

  const templateAssetNames = new Set(templateDefinition.assets.map((asset) => asset.name));
  const requiredAssetNames = new Set(
    templateDefinition.assets.filter((asset) => asset.required).map((asset) => asset.name),
  );
  const selected = new Set<string>();

  selection.forEach((assetName) => {
    if (templateAssetNames.has(assetName)) {
      selected.add(assetName);
    }
  });

  requiredAssetNames.forEach((assetName) => selected.add(assetName));

  return templateDefinition.assets.map((asset) => asset.name).filter((assetName) => selected.has(assetName));
}

export default function GenerateScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const navigation = useNavigation<RootTabNavigationProp<'Generate'>>();
  const route = useRoute<GenerateRouteProp>();
  const queryClient = useQueryClient();
  const [seed, setSeed] = useState('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [template, setTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationComplete | null>(null);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [importedCharacter, setImportedCharacter] = useState<Pick<
    ImportedCharacter,
    'name' | 'sourceFormat' | 'sourcePreset' | 'assets'
  > | null>(null);
  const [importedTemplateName, setImportedTemplateName] = useState<string | null>(null);
  const [selectedTemplateAssets, setSelectedTemplateAssets] = useState<string[]>([]);
  const [resumableSession, setResumableSession] = useState<MobileGenerationSession | null>(null);

  // Checkpointed sessions: surface a resume card when an earlier run left a
  // resumable checkpoint behind (app kill, navigation, provider failure).
  useEffect(() => {
    const stored = loadGenerationSession();
    setResumableSession(isResumableMobileGenerationSession(stored) ? stored : null);
  }, []);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const selectedTemplate = useMemo(
    () =>
      templates?.find((candidate: Template) => candidate.name === template) ??
      templates?.find((candidate: Template) => candidate.is_default) ??
      templates?.[0],
    [template, templates],
  );
  const effectiveImportTemplateName = selectedTemplate?.name ?? null;
  const importedAssetNames = importedCharacter ? Object.keys(importedCharacter.assets) : [];
  const optionalTemplateAssets = useMemo(
    () => selectedTemplate?.assets.filter((asset) => !asset.required) ?? [],
    [selectedTemplate],
  );

  useEffect(() => {
    const incomingSeed = route.params?.seed;
    if (incomingSeed && incomingSeed !== seed) {
      setSeed(incomingSeed);
    }
  }, [route.params, seed]);

  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplateAssets([]);
      return;
    }

    setSelectedTemplateAssets((previous) => {
      if (previous.length === 0) {
        return getDefaultSelectedTemplateAssets(selectedTemplate);
      }

      return normalizeAssetSelection(previous, selectedTemplate);
    });
  }, [selectedTemplate]);

  const handleImportCharacter = async () => {
    if (!selectedTemplate) {
      Alert.alert('Templates loading', 'Wait for templates to finish loading before importing a character.');
      return;
    }

    try {
      const file = await pickCharacterImportFile();
      if (!file) {
        return;
      }

      const character = detectAndParseCharacter(file.payload, file.name, {
        template: selectedTemplate,
      });
      setImportedCharacter({
        name: character.name,
        sourceFormat: character.sourceFormat,
        sourcePreset: character.sourcePreset,
        assets: character.assets,
      });
      setImportedTemplateName(effectiveImportTemplateName);
      setSeed((current) => current.trim() || character.name);
      setError('');
      Alert.alert('Character imported', `${character.name} loaded as structured source material for rehash.`);
    } catch (importError) {
      Alert.alert('Import failed', getErrorMessage(importError, 'Failed to import character file'));
    }
  };

  const handleClearImportedCharacter = () => {
    setImportedCharacter(null);
    setImportedTemplateName(null);
  };

  const handleToggleOptionalAsset = (assetName: string) => {
    if (!selectedTemplate) {
      return;
    }

    const isRequired = selectedTemplate.assets.find((asset) => asset.name === assetName)?.required;
    if (isRequired) {
      return;
    }

    setSelectedTemplateAssets((previous) => {
      const next = new Set(previous);
      if (next.has(assetName)) {
        next.delete(assetName);
      } else {
        next.add(assetName);
      }

      return normalizeAssetSelection(Array.from(next), selectedTemplate);
    });
  };

  const handleGenerate = async (override?: {
    seed?: string;
    mode?: ContentMode;
    template?: string;
    selectedAssets?: string[];
    resumeAssets?: Record<string, string>;
    importedSource?: { label: string; source: string; assets: Record<string, string> };
  }) => {
    const effectiveSeed = override?.seed ?? seed;
    const effectiveMode = override?.mode ?? mode;
    const effectiveTemplate = override?.template ?? template;
    const effectiveSelectedAssets = override?.selectedAssets ?? selectedTemplateAssets;
    if (!effectiveSeed.trim()) return;

    if (
      importedCharacter &&
      importedTemplateName &&
      effectiveImportTemplateName &&
      importedTemplateName !== effectiveImportTemplateName
    ) {
      Alert.alert(
        'Re-import required',
        `Imported source was mapped for ${importedTemplateName}. Re-import it after changing the template to ${effectiveImportTemplateName}.`,
      );
      return;
    }

    setIsGenerating(true);
    setOutput('');
    setError('');
    setResult(null);
    setGenerationStage('Preparing local generation...');

    try {
      const stream = api.generate({
        seed: effectiveSeed,
        mode: effectiveMode,
        template: effectiveTemplate || undefined,
        stream: true,
        selected_assets: effectiveSelectedAssets,
        resume_assets: override?.resumeAssets,
        imported_source:
          override?.importedSource ??
          (importedCharacter
            ? {
                label: importedCharacter.name,
                source: importedCharacter.sourcePreset || importedCharacter.sourceFormat,
                assets: importedCharacter.assets,
              }
            : undefined),
      });

      stream.subscribe((event) => {
        if (event.event === 'status' && 'stage' in event.data) {
          const data = event.data as { stage?: string; progress?: number; asset?: string };
          if (data.stage) {
            setGenerationStage(describeGenerationStage(data.stage, data.progress, data.asset));
          }
        }
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          setOutput((prev) => prev + data.content);
        }
        if (event.event === 'complete') {
          const data = event.data as GenerationComplete;
          setResult(data);
          setGenerationStage('Generation complete.');
          setResumableSession(null);
          // Refresh drafts list
          queryClient.invalidateQueries({ queryKey: ['drafts'] });
        }
      });

      stream.onError_((err) => {
        setError(err);
        setGenerationStage('');
        setIsGenerating(false);
      });

      stream.onComplete_(() => {
        setIsGenerating(false);
      });

      await stream.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setGenerationStage('');
      setIsGenerating(false);
    }
  };

  const handleResumeSession = () => {
    if (!resumableSession) {
      return;
    }

    const session = resumableSession;
    setResumableSession(null);

    // Restore an imported source captured by the checkpoint so resumed runs
    // keep the original import context. The stored source merges preset and
    // format into one string, so the format is cast back on restore.
    if (session.importedSource) {
      setImportedCharacter({
        name: session.importedSource.label,
        sourceFormat: session.importedSource.source as ImportedCharacter['sourceFormat'],
        assets: session.importedSource.assets,
      });
      setImportedTemplateName(null);
    }

    void handleGenerate({
      seed: session.seed,
      mode: session.mode,
      template: session.template,
      selectedAssets: session.selectedAssets ?? [],
      resumeAssets: { ...session.completedAssets },
      importedSource: session.importedSource,
    });
  };

  const handleDiscardSession = () => {
    clearGenerationSession();
    setResumableSession(null);
  };

  const resumeOrderedAssetNames = useMemo(() => {
    if (!resumableSession) {
      return [];
    }

    const templateDefinition = templates?.find((candidate: Template) => candidate.name === resumableSession.template);
    return templateDefinition ? getOrderedAssets(templateDefinition).map((asset) => asset.name) : [];
  }, [resumableSession, templates]);

  const handleRestartSessionFrom = (assetName: string) => {
    if (!resumableSession) {
      return;
    }

    setResumableSession(trimSessionFromAsset(resumableSession, resumeOrderedAssetNames, assetName));
  };

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Generate</Text>
      <Text style={styles.subtitle}>Start from a seed or imported source.</Text>

      {resumableSession && !isGenerating && (
        <View style={styles.resumeCard}>
          <Text style={styles.resumeTitle}>
            Interrupted generation — {Object.keys(resumableSession.completedAssets).length} asset
            {Object.keys(resumableSession.completedAssets).length === 1 ? '' : 's'} completed
          </Text>
          <Text style={styles.resumeSubtitle}>Resume from the checkpoint, or discard it to start fresh.</Text>
          {orderedCompletedAssetNames(resumableSession, resumeOrderedAssetNames).length > 0 && (
            <View style={styles.resumeAssetList}>
              <Text style={styles.resumeAssetHint}>
                Tap an asset to restart from it (it and later assets regenerate).
              </Text>
              {orderedCompletedAssetNames(resumableSession, resumeOrderedAssetNames).map((assetName) => (
                <TouchableOpacity
                  key={assetName}
                  style={styles.resumeAssetRow}
                  onPress={() => handleRestartSessionFrom(assetName)}
                >
                  <Text style={styles.resumeAssetName}>{assetName.replace(/_/g, ' ')}</Text>
                  <Text style={styles.resumeAssetAction}>Restart here</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.resumeActions}>
            <TouchableOpacity style={styles.resumePrimaryButton} onPress={handleResumeSession}>
              <Text style={styles.generateButtonText}>Resume generation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resumeDiscardButton} onPress={handleDiscardSession}>
              <Text style={styles.resumeDiscardButtonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.heroCard}>
          <Text style={styles.label}>Seed</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={seed}
            onChangeText={setSeed}
            placeholder="e.g., a lonely space pirate..."
            placeholderTextColor={colors.muted_text}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.generateButton, (!seed.trim() || isGenerating) && styles.generateButtonDisabled]}
            onPress={() => void handleGenerate()}
            disabled={!seed.trim() || isGenerating}
          >
            {isGenerating ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color={colors.button_text} size="small" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <SparklesIcon color={colors.button_text} size={20} />
                <Text style={styles.generateButtonText}>Generate</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CollapsibleTray
          title="Setup"
          subtitle="Template, mode, and import source"
          initiallyExpanded={Boolean(importedCharacter)}
          preview={
            <Text style={styles.setupPreviewText} numberOfLines={1}>
              {selectedTemplate?.name || 'Default'} • {mode}
              {importedCharacter ? ` • ${importedCharacter.name}` : ''}
            </Text>
          }
        >
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => void handleImportCharacter()}
            disabled={isGenerating || templatesLoading || !selectedTemplate}
          >
            <View style={styles.buttonContent}>
              <DocumentTextIcon color={colors.text} size={18} />
              <Text style={styles.secondaryActionButtonText}>
                {templatesLoading ? 'Loading templates...' : 'Import source'}
              </Text>
            </View>
          </TouchableOpacity>

          {importedCharacter ? (
            <View style={styles.importedSourceCard}>
              <View style={styles.importedSourceHeader}>
                <View style={styles.importedSourceInfo}>
                  <Text style={styles.importedSourceTitle}>{importedCharacter.name}</Text>
                  <Text style={styles.importedSourceMeta}>
                    {importedCharacter.sourcePreset || importedCharacter.sourceFormat}
                    {importedTemplateName ? ` • ${importedTemplateName}` : ''}
                  </Text>
                  <Text style={styles.importedSourceMeta}>
                    {importedAssetNames.length} mapped asset{importedAssetNames.length === 1 ? '' : 's'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.clearImportedButton}
                  onPress={handleClearImportedCharacter}
                  disabled={isGenerating}
                >
                  <TrashIcon color={colors.error_text} size={18} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.templateChips}>
                  {importedAssetNames.map((assetName) => (
                    <View key={assetName} style={styles.importedAssetChip}>
                      <Text style={styles.importedAssetChipText}>{assetName}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.templateChips}>
                <TouchableOpacity
                  style={[styles.templateChip, !template && styles.templateChipActive]}
                  onPress={() => setTemplate('')}
                >
                  <Text style={[styles.templateChipText, !template && styles.templateChipTextActive]}>Default</Text>
                </TouchableOpacity>
                {templates?.map((t) => (
                  <TouchableOpacity
                    key={t.name}
                    style={[styles.templateChip, template === t.name && styles.templateChipActive]}
                    onPress={() => setTemplate(t.name)}
                  >
                    <DocumentTextIcon color={template === t.name ? colors.button_text : colors.muted_text} size={14} />
                    <Text style={[styles.templateChipText, template === t.name && styles.templateChipTextActive]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content Mode</Text>
            <View style={styles.modeButtons}>
              {modes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeButton, mode === m && styles.modeButtonActive]}
                  onPress={() => setMode(m)}
                >
                  <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {optionalTemplateAssets.length > 0 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Optional blueprint assets</Text>
              <Text style={styles.helperText}>Toggle non-required assets for this run.</Text>
              <View style={styles.optionalAssetList}>
                {optionalTemplateAssets.map((asset) => {
                  const enabled = selectedTemplateAssets.includes(asset.name);
                  return (
                    <TouchableOpacity
                      key={asset.name}
                      style={[styles.optionalAssetRow, enabled && styles.optionalAssetRowEnabled]}
                      onPress={() => handleToggleOptionalAsset(asset.name)}
                      disabled={isGenerating}
                    >
                      <View style={[styles.checkbox, enabled && styles.checkboxEnabled]}>
                        {enabled ? <Text style={styles.checkboxMark}>✓</Text> : null}
                      </View>
                      <View style={styles.optionalAssetTextWrap}>
                        <Text style={styles.optionalAssetName}>{asset.name}</Text>
                        {asset.description ? (
                          <Text style={styles.optionalAssetDescription}>{asset.description}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </CollapsibleTray>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Success Result */}
      {result && (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>Character Created!</Text>
          <View style={styles.successInfo}>
            <Text style={styles.successLabel}>Name</Text>
            <Text style={styles.successValue}>{result.character_name || 'Unknown'}</Text>
          </View>
          <View style={styles.successInfo}>
            <Text style={styles.successLabel}>Duration</Text>
            <Text style={styles.successValue}>{(result.duration_ms / 1000).toFixed(1)}s</Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              if (result?.draft_id) {
                navigation.navigate('Drafts', {
                  screen: 'DraftDetail',
                  params: { draftId: result.draft_id },
                });
              } else {
                navigation.navigate('Drafts');
              }
            }}
          >
            <Text style={styles.viewButtonText}>View Character</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Output Preview */}
      {isGenerating && generationStage && !output && !result ? (
        <CollapsibleTray title="Status" subtitle={generationStage} initiallyExpanded style={styles.outputContainer}>
          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{generationStage}</Text>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          </View>
        </CollapsibleTray>
      ) : null}

      {output && !result && (
        <CollapsibleTray
          title="Live output"
          subtitle={generationStage || 'Streaming preview'}
          initiallyExpanded
          style={styles.outputContainer}
        >
          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{output}</Text>
            {isGenerating && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            )}
          </View>
        </CollapsibleTray>
      )}

      {/* Full Output (after completion) */}
      {output && result && (
        <CollapsibleTray
          title="Generated content"
          subtitle={`${result.character_name || 'Character'} • ${(result.duration_ms / 1000).toFixed(1)}s`}
          initiallyExpanded
          style={styles.outputContainer}
        >
          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        </CollapsibleTray>
      )}
    </ScrollView>
  );
}

function describeGenerationStage(stage: string, progress?: number, asset?: string): string {
  const percent = typeof progress === 'number' ? ` (${Math.round(progress * 100)}%)` : '';
  const assetLabel = asset ? ` ${asset.replace(/_/g, ' ')}` : '';

  switch (stage) {
    case 'initializing':
      return `Initializing local generation${percent}`;
    case 'loading_references':
      return `Loading local references${percent}`;
    case 'building_asset_prompt':
      return `Preparing${assetLabel}${percent}`;
    case 'contacting_provider':
      return `Submitting${assetLabel} to provider${percent}`;
    case 'provider_generating':
      return `Provider is generating${assetLabel}${percent}`;
    case 'asset_complete':
      return `Completed${assetLabel}${percent}`;
    case 'saving':
      return `Saving draft locally${percent}`;
    case 'complete':
      return 'Generation complete.';
    case 'deriving_seed':
      return 'Deriving offspring seed...';
    default:
      return `${stage.replace(/_/g, ' ')}${percent}`;
  }
}
