import { useMemo, useRef, useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { MAX_CONNECTED_DRAFT_REFERENCES, parseLorebookPacket } from '@char-gen/shared';
import type { ThemeColors } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { useTheme } from '../theme/ThemeProvider';
import {
  BookOpenIcon,
  BookmarkSquareIcon,
  ClipboardIcon,
  SparklesIcon,
  SquareArrowDownIcon,
  SquareArrowUpIcon,
  TrashIcon,
} from '../components/Icons';
import {
  DEFAULT_LOREBOOK_BLUEPRINT_PATH,
  countLorebookPacketEntries,
  restoreKnownLorebookDraftIds,
} from '../lib/lorebook';
import {
  deleteLorebookPacket,
  getLorebookPacketFilename,
  importLorebookPacketText,
  listSavedLorebookPackets,
  saveLorebookPacket,
  type SavedLorebookPacketRecord,
} from '../local/lorebook-packets';
import { pickTextFile, saveTextFile } from '../utils/file-transfer';
import { getErrorMessage } from '../utils/errors';

export default function LorebookGeneratorScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [focus, setFocus] = useState('');
  const [output, setOutput] = useState('');
  const [generationStage, setGenerationStage] = useState('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPackets, setSavedPackets] = useState<SavedLorebookPacketRecord[]>(() => listSavedLorebookPackets());
  const [activePacketId, setActivePacketId] = useState<string | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const { data: draftsData, isLoading: draftsLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const drafts = useMemo(() => draftsData?.drafts ?? [], [draftsData]);
  const draftLookup = useMemo(() => new Map(drafts.map((draft) => [draft.review_id, draft] as const)), [drafts]);
  const availableDrafts = useMemo(
    () => drafts.filter((draft) => !selectedDraftIds.includes(draft.review_id)),
    [drafts, selectedDraftIds],
  );
  const atReferenceLimit = selectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES;
  const parsedPacket = useMemo(() => parseLorebookPacket(output), [output]);
  const entryCount = countLorebookPacketEntries(output);
  const getDraftName = (draftId: string) => draftLookup.get(draftId)?.character_name || draftId;
  const selectedCountLabel = `${selectedDraftIds.length}/${MAX_CONNECTED_DRAFT_REFERENCES}`;

  const handleRemoveDraft = (draftId: string) => {
    setSelectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleAddDraft = (draftId: string) => {
    setSelectedDraftIds((previous) =>
      previous.includes(draftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES
        ? previous
        : [...previous, draftId],
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setOutput('');
    setGenerationStage('loading_references');
    setActivePacketId(null);

    const stream = api.generateLorebook({
      draft_ids: selectedDraftIds,
      focus: focus.trim() || undefined,
      blueprint_path: DEFAULT_LOREBOOK_BLUEPRINT_PATH,
    });

    abortRef.current = () => stream.abort();

    stream.subscribe((event) => {
      if (event.event === 'status' && 'stage' in event.data) {
        setGenerationStage(event.data.stage || 'generating');
      }
      if (event.event === 'chunk' && 'content' in event.data) {
        setOutput((previous) => previous + event.data.content);
      }
      if (event.event === 'complete' && 'content' in event.data) {
        setOutput(event.data.content || '');
      }
    });

    stream.onError_((message) => {
      Alert.alert('Error', message);
      setIsGenerating(false);
    });

    stream.onComplete_(() => {
      setIsGenerating(false);
      setGenerationStage('complete');
    });

    void stream.start();
  };

  const handleToggleGeneration = () => {
    if (isGenerating) {
      abortRef.current?.();
      setIsGenerating(false);
      return;
    }

    handleGenerate();
  };

  const handleCopyOutput = async () => {
    if (!output.trim()) {
      return;
    }

    await Clipboard.setStringAsync(output);
    Alert.alert('Copied', 'Lorebook packet copied to clipboard.');
  };

  const handleSavePacket = () => {
    if (!output.trim()) {
      return;
    }

    const nextPackets = saveLorebookPacket({
      id: activePacketId ?? undefined,
      content: output,
      draftIds: selectedDraftIds,
      focus: focus.trim() || undefined,
      blueprintPath: DEFAULT_LOREBOOK_BLUEPRINT_PATH,
    });

    setSavedPackets(nextPackets);
    setActivePacketId(nextPackets[0]?.id ?? null);
    Alert.alert('Saved', nextPackets[0] ? `Saved packet: ${nextPackets[0].title}` : 'Lorebook packet saved locally.');
  };

  const handleDownloadPacket = async (extension: 'md' | 'txt') => {
    if (!output.trim()) {
      return;
    }

    try {
      const activeTitle = savedPackets.find((packet) => packet.id === activePacketId)?.title || parsedPacket.title;
      const result = await saveTextFile(
        output,
        getLorebookPacketFilename(activeTitle, extension),
        extension === 'md' ? 'text/markdown' : 'text/plain',
      );

      if (result.saved) {
        Alert.alert('Export ready', `Lorebook packet prepared as ${extension.toUpperCase()}.`);
      }
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export lorebook packet'));
    }
  };

  const applyLoadedPacket = (packet: SavedLorebookPacketRecord, stage: string): string[] => {
    setOutput(packet.content);
    setFocus(packet.focus ?? '');
    setActivePacketId(packet.id);
    setGenerationStage(stage);

    const restoredDraftIds = restoreKnownLorebookDraftIds(packet.draftIds, draftLookup.keys());
    setSelectedDraftIds(restoredDraftIds);

    return restoredDraftIds;
  };

  const handleImportPacket = async () => {
    try {
      const file = await pickTextFile(['text/markdown', 'text/plain']);
      if (!file) {
        return;
      }

      const nextPackets = importLorebookPacketText({
        content: file.contents,
        blueprintPath: DEFAULT_LOREBOOK_BLUEPRINT_PATH,
      });
      const imported = nextPackets[0];
      if (!imported) {
        return;
      }

      setSavedPackets(nextPackets);
      const restoredDraftIds = applyLoadedPacket(imported, 'imported');

      Alert.alert(
        'Imported',
        restoredDraftIds.length === imported.draftIds.length
          ? `Imported lorebook packet: ${imported.title}`
          : `Imported: ${imported.title}. Some source drafts could not be restored to the active selection.`,
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import lorebook packet'));
    }
  };

  const handleLoadPacket = (packet: SavedLorebookPacketRecord) => {
    const restoredDraftIds = applyLoadedPacket(packet, 'loaded');

    Alert.alert(
      'Loaded',
      restoredDraftIds.length === packet.draftIds.length
        ? `Loaded saved packet: ${packet.title}`
        : `Loaded: ${packet.title}. Some source drafts could not be matched to saved drafts.`,
    );
  };

  const handleDeletePacket = (packetId: string) => {
    const nextPackets = deleteLorebookPacket(packetId);
    setSavedPackets(nextPackets);
    if (activePacketId === packetId) {
      setActivePacketId(null);
    }
  };

  if (draftsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BookOpenIcon color={colors.accent} size={28} />
        <Text style={styles.title}>Lorebook Generator</Text>
      </View>
      <Text style={styles.subtitle}>
        Generate a connected lorebook/worldbook packet from existing drafts instead of creating a new character.
      </Text>

      <CollapsibleTray
        title="Reference drafts"
        subtitle={`${selectedCountLabel} selected`}
        initiallyExpanded
        preview={
          <Text style={styles.trayPreviewText}>
            {selectedDraftIds.length > 0 ? selectedDraftIds.map(getDraftName).join(' + ') : 'No references selected'}
          </Text>
        }
        meta={
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedCountLabel}</Text>
          </View>
        }
      >
        <Text style={styles.helperText}>
          Select the drafts that should define shared canon. Best results come from drafts that already imply
          overlapping people, places, debts, incidents, or faction pressure.
        </Text>

        {selectedDraftIds.length > 0 ? (
          <View style={styles.chipWrap}>
            {selectedDraftIds.map((draftId) => (
              <TouchableOpacity
                key={draftId}
                style={[styles.chip, styles.chipActive]}
                onPress={() => handleRemoveDraft(draftId)}
              >
                <Text style={[styles.chipText, styles.chipTextActive]} numberOfLines={1}>
                  {getDraftName(draftId)}
                </Text>
                <TrashIcon color={colors.accent_title} size={13} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Add a saved draft</Text>
        {availableDrafts.length === 0 ? (
          <Text style={styles.helperText}>
            {drafts.length === 0
              ? 'Generate a draft first, then return here to synthesize shared canon.'
              : 'All saved drafts are already selected.'}
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipWrap}>
              {availableDrafts.map((draft) => (
                <TouchableOpacity
                  key={draft.review_id}
                  onPress={() => handleAddDraft(draft.review_id)}
                  disabled={atReferenceLimit}
                  style={[styles.chip, atReferenceLimit && styles.disabledButton]}
                >
                  <Text style={styles.chipText} numberOfLines={1}>
                    {draft.character_name || draft.review_id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {atReferenceLimit ? (
          <Text style={styles.helperText}>
            Reference limit reached ({MAX_CONNECTED_DRAFT_REFERENCES}). Remove one to add another.
          </Text>
        ) : null}
      </CollapsibleTray>

      <CollapsibleTray
        title="Focus"
        subtitle="Optional guidance for the packet"
        preview={<Text style={styles.trayPreviewText}>{focus.trim() || 'No focus set'}</Text>}
      >
        <Text style={styles.label}>Focus</Text>
        <Text style={styles.helperText}>Leave blank to let the blueprint decide the shape of the packet.</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={focus}
          onChangeText={setFocus}
          placeholder="Extract faction pressure and recurring places."
          placeholderTextColor={colors.muted_text}
          multiline
          textAlignVertical="top"
          editable={!isGenerating}
        />
        <Text style={styles.helperText}>Blueprint: {DEFAULT_LOREBOOK_BLUEPRINT_PATH}</Text>
      </CollapsibleTray>

      <TouchableOpacity
        onPress={handleToggleGeneration}
        disabled={selectedDraftIds.length === 0 && !isGenerating}
        style={[
          styles.primaryButton,
          selectedDraftIds.length === 0 && !isGenerating && styles.disabledButton,
          isGenerating && styles.cancelButton,
        ]}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator color={colors.button_text} size="small" />
            <Text style={styles.primaryButtonText}>Cancel</Text>
          </>
        ) : (
          <>
            <SparklesIcon color={colors.button_text} size={20} />
            <Text style={styles.primaryButtonText}>Generate Lorebook Packet</Text>
          </>
        )}
      </TouchableOpacity>

      <CollapsibleTray
        title="Packet output"
        subtitle={`Stage: ${generationStage.replace(/_/g, ' ')}`}
        initiallyExpanded={Boolean(output)}
        preview={
          <Text style={styles.trayPreviewText}>{output ? `${entryCount} entries` : 'No packet generated yet'}</Text>
        }
      >
        {output.trim().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No packet yet</Text>
            <Text style={styles.emptyText}>
              Generated lorebook/worldbook output will appear here once you run a generation.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.packetCard}>
              <Text style={styles.packetTitle} numberOfLines={2}>
                {parsedPacket.title}
              </Text>
              <Text style={styles.helperText}>
                {entryCount} entries{parsedPacket.scope ? ` â€¢ ${parsedPacket.scope}` : ''}
              </Text>
            </View>

            <TextInput
              style={[styles.input, styles.outputArea]}
              value={output}
              onChangeText={setOutput}
              multiline
              textAlignVertical="top"
              editable={!isGenerating}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.smallSecondaryButton} onPress={() => void handleCopyOutput()}>
                <ClipboardIcon color={colors.text} size={16} />
                <Text style={styles.secondaryButtonText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallPrimaryButton} onPress={handleSavePacket}>
                <BookmarkSquareIcon color={colors.button_text} size={16} />
                <Text style={styles.primaryButtonText}>Save packet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.smallSecondaryButton} onPress={() => void handleDownloadPacket('md')}>
                <SquareArrowDownIcon color={colors.text} size={16} />
                <Text style={styles.secondaryButtonText}>Export .md</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallSecondaryButton} onPress={() => void handleDownloadPacket('txt')}>
                <SquareArrowDownIcon color={colors.text} size={16} />
                <Text style={styles.secondaryButtonText}>Export .txt</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </CollapsibleTray>

      <CollapsibleTray
        title="Saved packets"
        subtitle="Stored locally on this device"
        preview={<Text style={styles.trayPreviewText}>{savedPackets.length} saved</Text>}
        meta={
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{savedPackets.length}</Text>
          </View>
        }
      >
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void handleImportPacket()}>
          <SquareArrowUpIcon color={colors.text} size={16} />
          <Text style={styles.secondaryButtonText}>Import packet file</Text>
        </TouchableOpacity>

        {savedPackets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No saved lorebook packets yet</Text>
            <Text style={styles.emptyText}>Save a generated packet to keep it available on this device.</Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {savedPackets.map((packet) => (
              <View key={packet.id} style={styles.packetCard}>
                <Text style={styles.packetTitle} numberOfLines={1}>
                  {packet.title}
                </Text>
                <Text style={styles.helperText}>
                  {packet.draftIds.length} refs â€¢ updated {new Date(packet.updatedAt).toLocaleString()}
                </Text>
                <View style={styles.packetActions}>
                  <TouchableOpacity style={styles.packetActionButton} onPress={() => handleLoadPacket(packet)}>
                    <Text style={styles.packetActionText}>Load</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.packetActionButton} onPress={() => handleDeletePacket(packet.id)}>
                    <TrashIcon color={colors.error_text} size={14} />
                    <Text style={[styles.packetActionText, styles.dangerText]}>Delete</Text>
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
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
    },
    trayPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    helperText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    countBadge: {
      backgroundColor: colors.window,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    countText: {
      color: colors.muted_text,
      fontSize: 11,
      fontWeight: '600',
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      maxWidth: 220,
    },
    chipActive: {
      backgroundColor: colors.accent_bg,
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.text,
      fontSize: 13,
    },
    chipTextActive: {
      color: colors.accent_title,
    },
    input: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      fontSize: 14,
    },
    textArea: {
      minHeight: 90,
    },
    outputArea: {
      minHeight: 300,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 19,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.button,
      borderRadius: 10,
      paddingVertical: 14,
    },
    cancelButton: {
      backgroundColor: colors.danger_bg,
    },
    primaryButtonText: {
      color: colors.button_text,
      fontSize: 14,
      fontWeight: '600',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    smallPrimaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.button,
      borderRadius: 8,
      paddingVertical: 10,
    },
    smallSecondaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
    },
    disabledButton: {
      opacity: 0.5,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
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
    resultsList: {
      gap: 10,
    },
    packetCard: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      gap: 6,
    },
    packetTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    packetActions: {
      flexDirection: 'row',
      gap: 8,
    },
    packetActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    packetActionText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    dangerText: {
      color: colors.error_text,
    },
  });
}
