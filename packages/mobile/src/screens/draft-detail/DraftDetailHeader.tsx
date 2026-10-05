/**
 * The draft detail header: the title and status line, the favourite and archive buttons, the tag row, the action buttons, and the export tray summary.
 *
 * Extracted from `DraftDetailScreen` verbatim: the screen passes the state it renders as
 * `Pick`s of the three draft-detail hooks — state, mutations and handlers — so a missing
 * prop and a missing state entry are both compile errors rather than blank sections.
 */
import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  StarIcon,
  ArrowLeftIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  DocumentTextIcon,
  ChatBubbleIcon,
  PencilIcon,
  SparklesIcon,
  UsersIcon,
} from '../../components/Icons';
import { isDraftArchived } from '../../lib/draft-archive';
import { useTheme } from '../../theme/ThemeProvider';
import type { useDraftDetailState } from './use-draft-detail-state';
import type { useDraftDetailMutations } from './use-draft-detail-mutations';
import type { useDraftDetailDerived } from './use-draft-detail-derived';
import type { useDraftDetailHandlers } from './use-draft-detail-handlers';
import { buildStyles } from './styles';

type Props = Pick<
  ReturnType<typeof useDraftDetailState>,
  'draft' | 'draftId' | 'exportTrayExpanded' | 'navigation' | 'pendingCompareSelection' | 'setExportTrayExpanded'
> &
  Pick<ReturnType<typeof useDraftDetailMutations>, 'archiveMutation' | 'hasIntroScene' | 'toggleFavorite'> &
  Pick<ReturnType<typeof useDraftDetailDerived>, 'exportReadiness'> &
  Pick<
    ReturnType<typeof useDraftDetailHandlers>,
    | 'handleArchive'
    | 'handleAttachCardImage'
    | 'handleClearCardImage'
    | 'handleCompareDraft'
    | 'handleDelete'
    | 'handleExportPreset'
    | 'handleOpenEditModal'
    | 'handleOpenIntroModal'
    | 'handleRefine'
  >;

export default function DraftDetailHeader({
  archiveMutation,
  draft,
  draftId,
  exportReadiness,
  exportTrayExpanded,
  handleArchive,
  handleAttachCardImage,
  handleClearCardImage,
  handleCompareDraft,
  handleDelete,
  handleExportPreset,
  handleOpenEditModal,
  handleOpenIntroModal,
  handleRefine,
  hasIntroScene,
  navigation,
  pendingCompareSelection,
  setExportTrayExpanded,
  toggleFavorite,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  // The screen only renders this once its loading and error guards have passed.
  if (!draft) {
    return null;
  }

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={colors.muted_text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {draft.metadata.character_name || 'Character'}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleOpenEditModal} style={styles.editHeaderButton}>
              <PencilIcon color={colors.accent} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRefine()} style={styles.refineHeaderButton}>
              <ChatBubbleIcon color={colors.accent} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite.mutate()} style={styles.favoriteButton}>
              <StarIcon color={draft.metadata.favorite ? colors.warning_text : colors.muted_text} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tags */}
      <ScrollView horizontal style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
        {isDraftArchived(draft.metadata) && (
          <View style={[styles.tag, styles.tagArchived]}>
            <Text style={styles.tagArchivedText}>Archived</Text>
          </View>
        )}
        {draft.metadata.mode && (
          <View style={[styles.tag, styles.tagPrimary]}>
            <Text style={styles.tagPrimaryText}>{draft.metadata.mode}</Text>
          </View>
        )}
        {draft.metadata.genre && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.genre}</Text>
          </View>
        )}
        {draft.metadata.template_name && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.template_name}</Text>
          </View>
        )}
        {draft.metadata.tags?.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
          <TouchableOpacity style={styles.actionButton} onPress={() => void handleAttachCardImage()}>
            <DocumentTextIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>Attach PNG</Text>
          </TouchableOpacity>
          {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => void handleClearCardImage()}>
              <TrashIcon color={colors.muted_text} size={18} />
              <Text style={styles.actionButtonText}>Clear PNG</Text>
            </TouchableOpacity>
          ) : null}
          {hasIntroScene ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenIntroModal}>
              <SparklesIcon color={colors.accent} size={18} />
              <Text style={styles.actionButtonText}>Intros</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleCompareDraft}>
            <UsersIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>
              {pendingCompareSelection?.character1Id && pendingCompareSelection.character1Id !== draftId
                ? 'Complete Compare'
                : 'Compare'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, exportTrayExpanded && styles.actionButtonActive]}
            onPress={() => setExportTrayExpanded((current) => !current)}
          >
            <DocumentTextIcon color={colors.accent} size={18} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleArchive} disabled={archiveMutation.isPending}>
            {isDraftArchived(draft.metadata) ? (
              <ArrowUturnLeftIcon color={colors.accent} size={18} />
            ) : (
              <ArchiveBoxIcon color={colors.accent} size={18} />
            )}
            <Text style={styles.actionButtonText}>{isDraftArchived(draft.metadata) ? 'Restore' : 'Archive'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteActionButton]} onPress={handleDelete}>
            <TrashIcon color={colors.error_text} size={18} />
            <Text style={[styles.actionButtonText, styles.deleteActionText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {exportTrayExpanded ? (
        <View style={styles.exportTrayRow}>
          <View
            style={[
              styles.exportReadinessCard,
              exportReadiness.requiresAcknowledgement && styles.exportReadinessCardWarning,
            ]}
          >
            <Text style={styles.exportReadinessTitle}>Export readiness</Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.validationState === 'checking'
                ? 'Validation is still checking.'
                : exportReadiness.validationState === 'passing'
                  ? 'Validation currently passes.'
                  : 'Validation currently fails.'}
            </Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.reviewedAssetCount} rated â€¢ {exportReadiness.unratedAssetCount} unrated â€¢{' '}
              {exportReadiness.assetNoteCount} note{exportReadiness.assetNoteCount === 1 ? '' : 's'}
            </Text>
            {exportReadiness.blockingWarnings.length > 0 ? (
              <View style={styles.exportWarningList}>
                {exportReadiness.blockingWarnings.map((warning) => (
                  <Text key={warning} style={styles.exportWarningText}>{`- ${warning}`}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.exportReadinessText}>
                No current export blockers flagged from validation or saved review scores.
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('png')}>
            <Text style={styles.exportChipText}>PNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('text')}>
            <Text style={styles.exportChipText}>TXT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('combined')}>
            <Text style={styles.exportChipText}>MD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('json')}>
            <Text style={styles.exportChipText}>JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('pdf')}>
            <Text style={styles.exportChipText}>PDF</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
        <View style={styles.cardImagePreviewWrap}>
          <Text style={styles.cardImagePreviewLabel}>Attached card image</Text>
          <View style={styles.cardImagePreviewCard}>
            <Text style={styles.cardImagePreviewMeta}>PNG image attached for standard card export.</Text>
          </View>
        </View>
      ) : null}

      {/* Assets */}
    </>
  );
}
