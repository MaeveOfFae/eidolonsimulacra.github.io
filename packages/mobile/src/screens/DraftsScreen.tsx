import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  buildDraftLibraryBadges,
  getLatestDraftSnapshotSummary,
  type DraftMetadata,
  type ContentMode,
  type Template,
} from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { exportAllDrafts, importDrafts } from '../local/draft-store';
import {
  ArrowUturnLeftIcon,
  ArchiveBoxIcon,
  StarIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
} from '../components/Icons';
import {
  isDraftArchived,
  resolveDraftArchiveAction,
  selectDraftListSource,
  type DraftFilterMode,
} from '../lib/draft-archive';
import {
  getMobileCompareSelection,
  setMobileCompareSelection,
  type MobileCompareSelection,
} from '../lib/compare-selection';
import type { DraftsStackNavigationProp } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { pickTextFile, saveTextFile } from '../utils/file-transfer';

type SortOption = 'created' | 'modified' | 'name';
type FilterMode = DraftFilterMode;

function formatTimestamp(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function DraftsScreen() {
  const navigation = useNavigation<DraftsStackNavigationProp<'DraftsList'>>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterContentMode, setFilterContentMode] = useState<ContentMode | 'all'>('all');
  const [importTemplateName, setImportTemplateName] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createSeed, setCreateSeed] = useState('');
  const [createName, setCreateName] = useState('');
  const [createGenre, setCreateGenre] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [createMode, setCreateMode] = useState<ContentMode | 'Auto'>('Auto');
  const [createTemplateName, setCreateTemplateName] = useState('');
  const [pendingCompareSelection, setPendingCompareSelection] = useState<MobileCompareSelection | null>(() =>
    getMobileCompareSelection(),
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const { data: archivedData, isLoading: archivedLoading } = useQuery({
    queryKey: ['drafts', 'archived'],
    queryFn: () => api.getDrafts({ archived: true }),
  });

  const archivedDrafts = useMemo(() => archivedData?.drafts ?? [], [archivedData?.drafts]);
  const archivedCount = data?.stats.archived_drafts ?? archivedDrafts.length;

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const selectedImportTemplate = useMemo(
    () => templates.find((candidate: Template) => candidate.name === importTemplateName),
    [importTemplateName, templates],
  );

  useEffect(() => {
    if (!importTemplateName && templates.length > 0) {
      setImportTemplateName(templates[0].name);
    }
  }, [importTemplateName, templates]);

  useEffect(() => {
    if (!createTemplateName && templates.length > 0) {
      setCreateTemplateName(templates[0].name);
    }
  }, [createTemplateName, templates]);

  useFocusEffect(
    useCallback(() => {
      setPendingCompareSelection(getMobileCompareSelection());
    }, []),
  );

  const createDraftMutation = useMutation({
    mutationFn: (request: {
      seed: string;
      templateName: string;
      mode?: ContentMode | 'Auto';
      characterName?: string;
      genre?: string;
      notes?: string;
    }) => api.createDraft(request),
    onSuccess: async (draft) => {
      await queryClient.invalidateQueries({ queryKey: ['drafts'] });
      setCreateModalVisible(false);
      setCreateSeed('');
      setCreateName('');
      setCreateGenre('');
      setCreateNotes('');
      navigation.navigate('DraftDetail', { draftId: draft.metadata.review_id });
    },
    onError: (mutationError: unknown) => {
      Alert.alert('Error', getErrorMessage(mutationError, 'Failed to create draft'));
    },
  });

  const archiveDraftMutation = useMutation({
    mutationFn: async (draft: DraftMetadata) => {
      const action = resolveDraftArchiveAction(draft);

      await api.createDraftSnapshot(draft.review_id, {
        label: action.snapshotLabel,
        reason: action.snapshotReason,
      });

      return action.kind === 'restore' ? api.restoreDraft(draft.review_id) : api.archiveDraft(draft.review_id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] }),
      ]);
    },
    onError: (mutationError: unknown) => {
      Alert.alert('Error', getErrorMessage(mutationError, 'Failed to update archive state'));
    },
  });

  const handleArchiveDraft = (draft: DraftMetadata) => {
    const action = resolveDraftArchiveAction(draft);

    Alert.alert(action.confirmationTitle, action.confirmationMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action.actionLabel,
        onPress: () => archiveDraftMutation.mutate(draft),
      },
    ]);
  };

  const filteredDrafts = useMemo(() => {
    let drafts = selectDraftListSource(data?.drafts || [], archivedDrafts, filterMode);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      drafts = drafts.filter(
        (draft) =>
          draft.character_name?.toLowerCase().includes(query) ||
          draft.seed.toLowerCase().includes(query) ||
          draft.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          draft.genre?.toLowerCase().includes(query),
      );
    }

    // Filter by favorites
    if (filterMode === 'favorites') {
      drafts = drafts.filter((draft) => draft.favorite);
    }

    // Filter by content mode
    if (filterContentMode !== 'all') {
      drafts = drafts.filter((draft) => draft.mode === filterContentMode);
    }

    // Sort
    drafts = [...drafts].sort((a, b) => {
      let comparison = 0;
      if (sortOption === 'name') {
        comparison = (a.character_name || a.seed).localeCompare(b.character_name || b.seed);
      } else if (sortOption === 'created') {
        comparison = new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime();
      } else if (sortOption === 'modified') {
        comparison = new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return drafts;
  }, [data?.drafts, archivedDrafts, searchQuery, filterMode, filterContentMode, sortOption, sortOrder]);

  const handleExportAll = async () => {
    try {
      const contents = await exportAllDrafts();
      const fileName = `eidolon-simulacra-mobile-drafts-${new Date().toISOString().split('T')[0]}.json`;
      const result = await saveTextFile(contents, fileName, 'application/json');

      if (!result.saved) {
        return;
      }

      Alert.alert(
        'Drafts exported',
        'A draft backup file was prepared and opened in the system share sheet. Save it to Files, Downloads, or another destination there.',
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export drafts'));
    }
  };

  const handleImportFile = async () => {
    try {
      const file = await pickTextFile(['application/json', 'text/markdown', 'text/plain']);
      if (!file) {
        return;
      }

      const result = await importDrafts(file.contents, { sourceName: file.name, template: selectedImportTemplate });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] }),
      ]);

      const remapMessage =
        result.remapped > 0
          ? `\n\n${result.remapped} draft IDs were remapped to avoid overwriting existing characters.`
          : '';
      Alert.alert(
        'Import complete',
        `Imported ${result.imported} draft${result.imported === 1 ? '' : 's'} from ${file.name}.${remapMessage}`,
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import drafts'));
    }
  };

  const closeCreateModal = () => {
    if (createDraftMutation.isPending) {
      return;
    }

    setCreateModalVisible(false);
  };

  const handleOpenCreateModal = () => {
    if (templates.length === 0) {
      Alert.alert('Templates unavailable', 'Create or import a template before starting a manual draft.');
      return;
    }

    if (!createTemplateName && templates[0]?.name) {
      setCreateTemplateName(templates[0].name);
    }
    setCreateModalVisible(true);
  };

  const handleCreateDraft = () => {
    const seed = createSeed.trim();
    if (!seed) {
      Alert.alert('Seed required', 'Enter a seed before creating a manual draft.');
      return;
    }

    if (!createTemplateName.trim()) {
      Alert.alert('Template required', 'Choose a template for this draft.');
      return;
    }

    createDraftMutation.mutate({
      seed,
      templateName: createTemplateName.trim(),
      mode: createMode,
      characterName: createName.trim() || undefined,
      genre: createGenre.trim() || undefined,
      notes: createNotes.trim() || undefined,
    });
  };

  const renderDraft = ({ item }: { item: DraftMetadata }) => {
    const latestSnapshot = getLatestDraftSnapshotSummary(item);
    const readinessBadges = buildDraftLibraryBadges(item).slice(0, 4);
    const archiveAction = resolveDraftArchiveAction(item);
    const canCompleteCompare = Boolean(
      pendingCompareSelection?.character1Id && pendingCompareSelection.character1Id !== item.review_id,
    );

    const handleCompareDraft = () => {
      const currentSelection = getMobileCompareSelection();

      if (currentSelection?.character1Id && currentSelection.character1Id !== item.review_id) {
        navigation.navigate('Home', {
          screen: 'Compare',
          params: {
            character1: currentSelection.character1Id,
            character2: item.review_id,
          },
        });
        return;
      }

      const nextSelection = {
        character1Id: item.review_id,
        character1Name: item.character_name || item.seed,
      } satisfies MobileCompareSelection;

      setMobileCompareSelection(nextSelection);
      setPendingCompareSelection(nextSelection);
      navigation.navigate('Home', {
        screen: 'Compare',
        params: { character1: item.review_id },
      });
    };

    return (
      <View style={styles.draftItem}>
        <TouchableOpacity
          style={styles.draftInfo}
          onPress={() => navigation.navigate('DraftDetail', { draftId: item.review_id })}
        >
          <View style={styles.draftHeader}>
            <Text style={styles.draftName} numberOfLines={1}>
              {item.character_name || item.seed}
            </Text>
            {item.favorite && <StarIcon color="#eab308" size={18} />}
          </View>
          <View style={styles.draftMeta}>
            {isDraftArchived(item) && (
              <View style={styles.archivedTag}>
                <Text style={styles.archivedTagText}>Archived</Text>
              </View>
            )}
            {item.mode && <Text style={styles.draftTag}>{item.mode}</Text>}
            {item.genre && <Text style={styles.draftTag}>{item.genre}</Text>}
            {item.template_name && <Text style={styles.draftTag}>{item.template_name}</Text>}
          </View>
          {readinessBadges.length > 0 ? (
            <View style={styles.readinessBadgeRow}>
              {readinessBadges.map((badge) => (
                <View
                  key={`${item.review_id}-${badge.label}`}
                  style={[
                    styles.readinessBadge,
                    badge.tone === 'warning'
                      ? styles.readinessBadgeWarning
                      : badge.tone === 'success'
                        ? styles.readinessBadgeSuccess
                        : styles.readinessBadgeMuted,
                  ]}
                >
                  <Text
                    style={[
                      styles.readinessBadgeText,
                      badge.tone === 'warning'
                        ? styles.readinessBadgeTextWarning
                        : badge.tone === 'success'
                          ? styles.readinessBadgeTextSuccess
                          : styles.readinessBadgeTextMuted,
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {item.created && <Text style={styles.draftDate}>{new Date(item.created).toLocaleDateString()}</Text>}
          {latestSnapshot && (
            <View style={styles.snapshotSummaryCard}>
              <Text style={styles.snapshotSummaryTitle} numberOfLines={1}>
                {latestSnapshot.label}
              </Text>
              <Text style={styles.snapshotSummaryMeta} numberOfLines={2}>
                {formatTimestamp(latestSnapshot.createdAt)}
                {latestSnapshot.reason ? ` • ${latestSnapshot.reason}` : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.draftActions}>
          {latestSnapshot ? (
            <TouchableOpacity
              style={[styles.draftActionButton, styles.draftActionButtonAccent]}
              onPress={() =>
                navigation.navigate('DraftDetail', {
                  draftId: item.review_id,
                  historySnapshotId: latestSnapshot.id,
                })
              }
            >
              <Text style={[styles.draftActionButtonText, styles.draftActionButtonTextAccent]}>
                Latest restore point
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.draftActionButton} onPress={handleCompareDraft}>
            <UsersIcon color="#9ca3af" size={14} />
            <Text style={styles.draftActionButtonText}>{canCompleteCompare ? 'Complete Compare' : 'Compare'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.draftActionButton}
            onPress={() => handleArchiveDraft(item)}
            disabled={archiveDraftMutation.isPending}
          >
            {archiveAction.kind === 'restore' ? (
              <ArrowUturnLeftIcon color="#9ca3af" size={14} />
            ) : (
              <ArchiveBoxIcon color="#9ca3af" size={14} />
            )}
            <Text style={styles.draftActionButtonText}>{archiveAction.actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading drafts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading drafts</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const contentModes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];
  const showingArchived = filterMode === 'archived';
  const hasActiveFilters =
    filterMode !== 'all' || filterContentMode !== 'all' || sortOption !== 'created' || sortOrder !== 'desc';
  const filterSummary = showingArchived ? 'archived' : filterMode === 'favorites' ? 'favorites' : 'all drafts';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        style={styles.toolbar}
        contentContainerStyle={styles.toolbarContent}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.toolbarButton} onPress={handleOpenCreateModal}>
          <PlusIcon color="#ffffff" size={16} />
          <Text style={styles.toolbarButtonText}>Create draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolbarButton, styles.toolbarButtonSecondary]}
          onPress={() => void handleImportFile()}
        >
          <Text style={styles.toolbarButtonSecondaryText}>Import file</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => void handleExportAll()}>
          <Text style={styles.toolbarButtonText}>Export all</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MagnifyingGlassIcon color="#6b7280" size={18} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search characters..."
            placeholderTextColor="#6b7280"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filtersTrayWrap}>
        <CollapsibleTray
          title="Filters & import"
          subtitle="Narrow the list and set the template used for imports"
          initiallyExpanded={hasActiveFilters}
          preview={
            <Text style={styles.filterSummaryText} numberOfLines={1}>
              {selectedImportTemplate?.name || 'No import template'} • {filterSummary} •{' '}
              {filterContentMode === 'all' ? 'all modes' : filterContentMode}
            </Text>
          }
        >
          {templates.length > 0 ? (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Import</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {templates.map((candidate: Template) => {
                    const selected = candidate.name === importTemplateName;

                    return (
                      <TouchableOpacity
                        key={candidate.name}
                        style={[styles.filterChip, selected && styles.filterChipActive]}
                        onPress={() => setImportTemplateName(candidate.name)}
                      >
                        <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
                          {candidate.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Show</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterMode === 'all' && styles.filterChipActive]}
                  onPress={() => setFilterMode('all')}
                >
                  <Text style={[styles.filterChipText, filterMode === 'all' && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterMode === 'favorites' && styles.filterChipActive]}
                  onPress={() => setFilterMode('favorites')}
                >
                  <StarIcon color={filterMode === 'favorites' ? '#fff' : '#9ca3af'} size={14} />
                  <Text style={[styles.filterChipText, filterMode === 'favorites' && styles.filterChipTextActive]}>
                    Favorites
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterMode === 'archived' && styles.filterChipActive]}
                  onPress={() => setFilterMode('archived')}
                >
                  <ArchiveBoxIcon color={filterMode === 'archived' ? '#fff' : '#9ca3af'} size={14} />
                  <Text style={[styles.filterChipText, filterMode === 'archived' && styles.filterChipTextActive]}>
                    Archived{archivedCount > 0 ? ` (${archivedCount})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Mode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterContentMode === 'all' && styles.filterChipActive]}
                  onPress={() => setFilterContentMode('all')}
                >
                  <Text style={[styles.filterChipText, filterContentMode === 'all' && styles.filterChipTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                {contentModes.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.filterChip, filterContentMode === mode && styles.filterChipActive]}
                    onPress={() => setFilterContentMode(mode)}
                  >
                    <Text style={[styles.filterChipText, filterContentMode === mode && styles.filterChipTextActive]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {(['created', 'modified', 'name'] as SortOption[]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.filterChip, sortOption === option && styles.filterChipActive]}
                    onPress={() => setSortOption(option)}
                  >
                    <Text style={[styles.filterChipText, sortOption === option && styles.filterChipTextActive]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.filterChip, sortOrder === 'desc' && styles.filterChipActive]}
                  onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <Text style={[styles.filterChipText, sortOrder === 'desc' && styles.filterChipTextActive]}>
                    {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </CollapsibleTray>
      </View>

      {/* Stats */}
      {data?.stats && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {filteredDrafts.length} of {showingArchived ? archivedDrafts.length : data.stats.total_drafts} characters
            {showingArchived && ' • Archived only'}
            {filterMode === 'favorites' && ' • Favorites only'}
            {archivedCount > 0 && !showingArchived && ` • ${archivedCount} archived`}
            {searchQuery.length > 0 && ' • Filtered'}
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredDrafts}
        keyExtractor={(item) => item.review_id}
        renderItem={renderDraft}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading || archivedLoading} onRefresh={refetch} tintColor="#7c3aed" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {showingArchived ? <ArchiveBoxIcon color="#6b7280" size={48} /> : <FolderIcon color="#6b7280" size={48} />}
            <Text style={styles.emptyTitle}>
              {searchQuery || filterMode !== 'all' || filterContentMode !== 'all'
                ? 'No matches found'
                : 'No drafts yet'}
            </Text>
            <Text style={styles.emptyText}>
              {showingArchived && !searchQuery && filterContentMode === 'all'
                ? 'Archived drafts you put aside will show up here until you restore or delete them'
                : searchQuery || filterMode !== 'all' || filterContentMode !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Generate a character or create a manual draft to get started'}
            </Text>
            {!searchQuery && filterMode === 'all' && filterContentMode === 'all' ? (
              <TouchableOpacity style={styles.emptyActionButton} onPress={handleOpenCreateModal}>
                <Text style={styles.emptyActionButtonText}>Create Manual Draft</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCreateModal}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCreateModal} disabled={createDraftMutation.isPending}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Draft</Text>
            <TouchableOpacity onPress={handleCreateDraft} disabled={createDraftMutation.isPending}>
              {createDraftMutation.isPending ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <Text style={styles.modalSaveText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={styles.modalHelpText}>Start a draft, then fill or refine assets in Draft Detail.</Text>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Character Name</Text>
              <TextInput
                style={styles.editInput}
                value={createName}
                onChangeText={setCreateName}
                placeholder="Optional display name"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {templates.map((candidate: Template) => {
                    const selected = candidate.name === createTemplateName;

                    return (
                      <TouchableOpacity
                        key={candidate.name}
                        style={[styles.filterChip, selected && styles.filterChipActive]}
                        onPress={() => setCreateTemplateName(candidate.name)}
                      >
                        <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
                          {candidate.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Seed</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={createSeed}
                onChangeText={setCreateSeed}
                placeholder="Describe the character concept or prompt"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Mode</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {(['Auto', 'SFW', 'NSFW', 'Platform-Safe'] as const).map((mode) => {
                    const selected = mode === createMode;

                    return (
                      <TouchableOpacity
                        key={mode}
                        style={[styles.filterChip, selected && styles.filterChipActive]}
                        onPress={() => setCreateMode(mode)}
                      >
                        <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{mode}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Genre</Text>
              <TextInput
                style={styles.editInput}
                value={createGenre}
                onChangeText={setCreateGenre}
                placeholder="Optional genre"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Notes</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={createNotes}
                onChangeText={setCreateNotes}
                placeholder="Optional review notes or canon reminders"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  toolbar: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  toolbarContent: {
    gap: 8,
    paddingRight: 12,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 118,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  toolbarButtonSecondary: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toolbarButtonSecondaryText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
    padding: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#fff',
    fontSize: 14,
  },
  clearButton: {
    color: '#6b7280',
    fontSize: 16,
    padding: 4,
  },
  filtersTrayWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  filterSummaryText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  filtersPanel: {
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    color: '#9ca3af',
    fontSize: 12,
    width: 60,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2f2f2f',
  },
  filterChipActive: {
    backgroundColor: '#7c3aed',
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  statsText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
  },
  draftItem: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  draftInfo: {
    flex: 1,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  draftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  draftMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  draftTag: {
    backgroundColor: '#2f2f2f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#9ca3af',
    fontSize: 12,
  },
  archivedTag: {
    backgroundColor: '#3f2d18',
    borderWidth: 1,
    borderColor: '#78350f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  archivedTagText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  readinessBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  readinessBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  readinessBadgeMuted: {
    borderColor: '#2f2f2f',
    backgroundColor: '#161616',
  },
  readinessBadgeWarning: {
    borderColor: '#7c3aed55',
    backgroundColor: '#3b1f42',
  },
  readinessBadgeSuccess: {
    borderColor: '#065f4688',
    backgroundColor: '#0f2d24',
  },
  readinessBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  readinessBadgeTextMuted: {
    color: '#d1d5db',
  },
  readinessBadgeTextWarning: {
    color: '#f5d0fe',
  },
  readinessBadgeTextSuccess: {
    color: '#a7f3d0',
  },
  draftDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  snapshotSummaryCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#161616',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  snapshotSummaryTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  snapshotSummaryMeta: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17,
  },
  draftActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  draftActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#161616',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  draftActionButtonAccent: {
    borderColor: '#4c1d95',
    backgroundColor: '#201235',
  },
  draftActionButtonText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  draftActionButtonTextAccent: {
    color: '#c4b5fd',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyActionButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  emptyActionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancelText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  modalSaveText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  modalHelpText: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  editTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
