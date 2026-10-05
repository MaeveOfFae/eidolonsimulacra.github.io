/**
 * The draft detail modals: the metadata editor, the refinement editor, the intro picker, and the asset editor.
 *
 * Extracted from `DraftDetailScreen` verbatim: the screen passes the state it renders as
 * `Pick`s of the three draft-detail hooks — state, mutations and handlers — so a missing
 * prop and a missing state entry are both compile errors rather than blank sections.
 */
import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import type { useDraftDetailState } from './use-draft-detail-state';
import type { useDraftDetailMutations } from './use-draft-detail-mutations';
import type { useDraftDetailHandlers } from './use-draft-detail-handlers';
import { buildStyles } from './styles';

type Props = Pick<
  ReturnType<typeof useDraftDetailState>,
  | 'assetEditorVisible'
  | 'draft'
  | 'editGenre'
  | 'editModalVisible'
  | 'editName'
  | 'editNotes'
  | 'editTags'
  | 'editingAssetContent'
  | 'editingAssetName'
  | 'formatAssetLabel'
  | 'generatedIntro'
  | 'introGenerationStage'
  | 'introInstructions'
  | 'introModalVisible'
  | 'isApplyingRefinement'
  | 'isGeneratingIntro'
  | 'isPersistingIntro'
  | 'isRefining'
  | 'isSavingAsset'
  | 'modalBottomPadding'
  | 'refineModalVisible'
  | 'refinePreview'
  | 'refineRequest'
  | 'refineStatusText'
  | 'selectedRefineAsset'
  | 'setEditGenre'
  | 'setEditModalVisible'
  | 'setEditName'
  | 'setEditNotes'
  | 'setEditTags'
  | 'setEditingAssetContent'
  | 'setGeneratedIntro'
  | 'setIntroInstructions'
  | 'setRefineRequest'
> &
  Pick<ReturnType<typeof useDraftDetailMutations>, 'assetEntries' | 'savedIntros' | 'updateMetadataMutation'> &
  Pick<
    ReturnType<typeof useDraftDetailHandlers>,
    | 'closeAssetEditor'
    | 'closeIntroModal'
    | 'closeRefineModal'
    | 'handleApplyRefinement'
    | 'handleCancelIntroGeneration'
    | 'handleCopyAsset'
    | 'handleDiscardRefinement'
    | 'handleGenerateAdditionalIntro'
    | 'handleKeepGeneratedIntro'
    | 'handleOptimizeRefinement'
    | 'handleRemoveSavedIntro'
    | 'handleRunRefine'
    | 'handleSaveAssetEdit'
    | 'handleSaveMetadata'
    | 'handleSelectRefineAsset'
    | 'handleSetActiveIntro'
  >;

export default function DraftDetailModals({
  assetEditorVisible,
  assetEntries,
  closeAssetEditor,
  closeIntroModal,
  closeRefineModal,
  draft,
  editGenre,
  editModalVisible,
  editName,
  editNotes,
  editTags,
  editingAssetContent,
  editingAssetName,
  formatAssetLabel,
  generatedIntro,
  handleApplyRefinement,
  handleCancelIntroGeneration,
  handleCopyAsset,
  handleDiscardRefinement,
  handleGenerateAdditionalIntro,
  handleKeepGeneratedIntro,
  handleOptimizeRefinement,
  handleRemoveSavedIntro,
  handleRunRefine,
  handleSaveAssetEdit,
  handleSaveMetadata,
  handleSelectRefineAsset,
  handleSetActiveIntro,
  introGenerationStage,
  introInstructions,
  introModalVisible,
  isApplyingRefinement,
  isGeneratingIntro,
  isPersistingIntro,
  isRefining,
  isSavingAsset,
  modalBottomPadding,
  refineModalVisible,
  refinePreview,
  refineRequest,
  refineStatusText,
  savedIntros,
  selectedRefineAsset,
  setEditGenre,
  setEditModalVisible,
  setEditName,
  setEditNotes,
  setEditTags,
  setEditingAssetContent,
  setGeneratedIntro,
  setIntroInstructions,
  setRefineRequest,
  updateMetadataMutation,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  // The screen only renders this once its loading and error guards have passed.
  if (!draft) {
    return null;
  }

  return (
    <>
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Details</Text>
              <TouchableOpacity onPress={handleSaveMetadata} disabled={updateMetadataMutation.isPending}>
                {updateMetadataMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              {/* Character Name */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Character Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter character name"
                  placeholderTextColor={colors.muted_text}
                />
              </View>

              {/* Genre */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Genre</Text>
                <TextInput
                  style={styles.editInput}
                  value={editGenre}
                  onChangeText={setEditGenre}
                  placeholder="e.g., Fantasy, Sci-Fi, Romance"
                  placeholderTextColor={colors.muted_text}
                />
              </View>

              {/* Tags */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Tags</Text>
                <TextInput
                  style={styles.editInput}
                  value={editTags}
                  onChangeText={setEditTags}
                  placeholder="Comma-separated tags"
                  placeholderTextColor={colors.muted_text}
                />
                <Text style={styles.editHint}>Separate multiple tags with commas</Text>
              </View>

              {/* Notes */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Notes</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add personal notes about this character..."
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={refineModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRefineModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeRefineModal} disabled={isRefining || isApplyingRefinement}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Refine Asset</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate a replacement for an existing asset, or draft the first version of a missing template asset and
                review it before saving.
              </Text>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Asset</Text>
                <View style={styles.assetPicker}>
                  {assetEntries.map((assetEntry) => {
                    const isActive = assetEntry.name === selectedRefineAsset;
                    return (
                      <TouchableOpacity
                        key={assetEntry.name}
                        style={[styles.assetChip, isActive && styles.assetChipActive]}
                        onPress={() => handleSelectRefineAsset(assetEntry.name)}
                        disabled={isRefining || isApplyingRefinement}
                      >
                        <Text style={[styles.assetChipText, isActive && styles.assetChipTextActive]}>
                          {formatAssetLabel(assetEntry.name)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                    ? 'Revision Request'
                    : 'Generation Direction'}
                </Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={refineRequest}
                  onChangeText={setRefineRequest}
                  placeholder={
                    selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                      ? 'Describe the change you want to make'
                      : 'Describe the first version you want AI to draft for this asset'
                  }
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isRefining && !isApplyingRefinement}
                  maxLength={1500}
                />
                <Text style={styles.editHint}>
                  {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                    ? 'Refinement replaces only the selected asset after you apply it.'
                    : 'AI generation drafts only the selected missing asset after you apply it.'}
                </Text>
              </View>

              {selectedRefineAsset ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Current {formatAssetLabel(selectedRefineAsset)}</Text>
                  <ScrollView style={styles.previewBox} nestedScrollEnabled>
                    <Text style={styles.previewText}>
                      {draft.assets[selectedRefineAsset] || 'No saved content yet.'}
                    </Text>
                  </ScrollView>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement) &&
                    styles.disabledButton,
                ]}
                onPress={handleRunRefine}
                disabled={!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement}
              >
                {isRefining ? (
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {refinePreview
                      ? 'Regenerate Preview'
                      : selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                        ? 'Preview Changes'
                        : 'Generate Preview'}
                  </Text>
                )}
              </TouchableOpacity>

              {isRefining && refineStatusText ? <Text style={styles.modalStatusText}>{refineStatusText}</Text> : null}

              {isRefining || refinePreview ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Refined Preview</Text>
                  <ScrollView style={styles.previewBox} nestedScrollEnabled>
                    {refinePreview ? (
                      <Text style={styles.previewText}>{refinePreview}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>Generating preview...</Text>
                    )}
                  </ScrollView>
                </View>
              ) : null}

              {refinePreview ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                    onPress={handleDiscardRefinement}
                    disabled={isApplyingRefinement}
                  >
                    <Text style={styles.secondaryModalButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                    onPress={handleOptimizeRefinement}
                    disabled={isApplyingRefinement}
                  >
                    <Text style={styles.secondaryModalButtonText}>Optimize</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.modalActionButton,
                      isApplyingRefinement && styles.disabledButton,
                    ]}
                    onPress={handleApplyRefinement}
                    disabled={isApplyingRefinement}
                  >
                    {isApplyingRefinement ? (
                      <ActivityIndicator size="small" color={colors.button_text} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Apply Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={assetEditorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAssetEditor}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeAssetEditor} disabled={isSavingAsset}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAssetName ? formatAssetLabel(editingAssetName) : 'Edit Asset'}
              </Text>
              <TouchableOpacity onPress={() => void handleSaveAssetEdit()} disabled={isSavingAsset}>
                {isSavingAsset ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Write or revise the raw asset text directly. Saving will create the asset if it did not exist yet.
              </Text>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Asset Content</Text>
                <TextInput
                  style={[styles.editInput, styles.assetEditorInput]}
                  value={editingAssetContent}
                  onChangeText={setEditingAssetContent}
                  placeholder="Enter asset content"
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={14}
                  textAlignVertical="top"
                  editable={!isSavingAsset}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={introModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
                disabled={isPersistingIntro}
              >
                <Text style={styles.modalCancelText}>{isGeneratingIntro ? 'Cancel' : 'Close'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Additional Intros</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate alternate intro scenes without replacing the active one. Keep the good ones, then activate
                whichever intro fits best.
              </Text>

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Current Active Intro</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>{draft.assets.intro_scene || 'No intro scene saved.'}</Text>
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Direction</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={introInstructions}
                  onChangeText={setIntroInstructions}
                  placeholder="Optional guidance for the next intro scene"
                  placeholderTextColor={colors.muted_text}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isGeneratingIntro && !isPersistingIntro}
                  maxLength={1500}
                />
                <Text style={styles.editHint}>This applies only to the next generated intro candidate.</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name) && styles.disabledButton,
                ]}
                onPress={() => void handleGenerateAdditionalIntro()}
                disabled={isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name}
              >
                {isGeneratingIntro ? (
                  <ActivityIndicator size="small" color={colors.button_text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Generate Additional Intro</Text>
                )}
              </TouchableOpacity>

              {isGeneratingIntro && introGenerationStage ? (
                <Text style={styles.modalStatusText}>{introGenerationStage}</Text>
              ) : null}

              {!draft.metadata.template_name ? (
                <Text style={styles.editHint}>
                  This draft needs a saved template before mobile can generate intro variants.
                </Text>
              ) : null}

              {isGeneratingIntro || generatedIntro ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Generated Intro Preview</Text>
                  <View style={styles.previewBox}>
                    {generatedIntro?.content ? (
                      <Text style={styles.previewText}>{generatedIntro.content}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>
                        {introGenerationStage || 'Generating intro scene...'}
                      </Text>
                    )}
                  </View>
                </View>
              ) : null}

              {generatedIntro ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => setGeneratedIntro(null)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.secondaryModalButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleKeepGeneratedIntro()}
                    disabled={isPersistingIntro}
                  >
                    {isPersistingIntro ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={styles.secondaryModalButtonText}>Keep</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.modalActionButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleSetActiveIntro(generatedIntro.content)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.primaryButtonText}>Make Active</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {savedIntros.length > 0 ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Saved Additional Intros</Text>
                  <View style={styles.savedIntroList}>
                    {savedIntros.map((intro, index) => {
                      const isActive = draft.assets.intro_scene?.trim() === intro.content.trim();
                      return (
                        <View key={intro.id} style={[styles.savedIntroCard, isActive && styles.savedIntroCardActive]}>
                          <View style={styles.savedIntroHeader}>
                            <Text style={styles.savedIntroTitle}>Intro #{index + 1}</Text>
                            <Text style={styles.savedIntroMeta}>{new Date(intro.timestamp).toLocaleString()}</Text>
                          </View>
                          <View style={styles.previewBox}>
                            <Text style={styles.previewText}>{intro.content}</Text>
                          </View>
                          <View style={styles.savedIntroActions}>
                            <TouchableOpacity
                              style={styles.introActionButton}
                              onPress={() => void handleCopyAsset('intro_scene', intro.content)}
                            >
                              <Text style={styles.introActionButtonText}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.introActionButton,
                                styles.introActionButtonPrimary,
                                isPersistingIntro && styles.disabledButton,
                              ]}
                              onPress={() => void handleSetActiveIntro(intro.content)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={[styles.introActionButtonText, styles.introActionButtonPrimaryText]}>
                                {isActive ? 'Active' : 'Make Active'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.introActionButton, isPersistingIntro && styles.disabledButton]}
                              onPress={() => void handleRemoveSavedIntro(intro.id)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={styles.introActionButtonText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
