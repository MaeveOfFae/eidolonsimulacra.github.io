import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import {
  MAX_CONNECTED_DRAFT_REFERENCES,
  buildAssetApprovalSummary,
  type DraftAssetApprovalDecision,
  type DraftMetadata,
  type Template,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import { buildExportReadinessSummary } from '@/lib/drafts/export-readiness';
import { formatAssetLabel } from '@/lib/drafts/asset-display';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import { pickFile } from '@/utils/download';
import CollapsibleSection from '../common/CollapsibleSection';
import ExportModal from '../common/ExportModal';
import ChatPanel from '../common/ChatPanel';
import { useGuidedTour } from '../common/GuidedTourContext';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import DraftSendConfigPanel from './DraftSendConfigPanel';
import ReviewAssetCards, { type ReviewAssetEntry } from './ReviewAssetCards';
import ReviewConnectedReferencesSection from './ReviewConnectedReferencesSection';
import ReviewHero from './ReviewHero';
import ReviewOverviewSection from './ReviewOverviewSection';
import ReviewWorldAttachmentsSection from './ReviewWorldAttachmentsSection';
import ReviewChecklistPanel from './ReviewChecklistPanel';
import VersionHistoryPanel from './VersionHistoryPanel';

function isVisibleDraftAsset(assetName: string): boolean {
  return assetName !== 'card_image';
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read PNG image'));
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  });
}

export default function Review() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingBaseContent, setEditingBaseContent] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);
  const [assetActionError, setAssetActionError] = useState<string | null>(null);
  const [tourManagedExportModal, setTourManagedExportModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [pendingConnectedDraftId, setPendingConnectedDraftId] = useState('');
  const [pendingWorldId, setPendingWorldId] = useState('');
  const [pendingRelationshipTargetId, setPendingRelationshipTargetId] = useState('');
  const [pendingRelationshipLabel, setPendingRelationshipLabel] = useState('');
  const [pendingRelationshipNotes, setPendingRelationshipNotes] = useState('');
  const [editableConnectedDraftIds, setEditableConnectedDraftIds] = useState<string[]>([]);
  const [worldAttachmentFeedback, setWorldAttachmentFeedback] = useState<string | null>(null);
  const [worldRelationshipFeedback, setWorldRelationshipFeedback] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { activeStepIndex, activeTourId } = useGuidedTour();
  const queryClient = useQueryClient();
  const historyAssetParam = searchParams.get('historyAsset');
  const historySnapshotParam = searchParams.get('historySnapshot');
  const invalidateDraftQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['draft', id] });
    queryClient.invalidateQueries({ queryKey: ['drafts'] });
  };

  const reviewId = decodeURIComponent(id || '');
  const invalidateWorldAttachmentQueries = async (worldIds: string[] = []) => {
    const uniqueWorldIds = [...new Set(worldIds.filter(Boolean))];

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['world-character-draft-links', reviewId] }),
      queryClient.invalidateQueries({ queryKey: ['world-relationship-audit'] }),
      queryClient.invalidateQueries({ queryKey: ['world-character-draft-links'] }),
      queryClient.invalidateQueries({ queryKey: ['worlds-list'] }),
      ...uniqueWorldIds.map((worldId) => queryClient.invalidateQueries({ queryKey: ['world-detail', worldId] })),
    ]);
  };

  const {
    data: draft,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['draft', id],
    queryFn: () => api.getDraft(reviewId),
    enabled: !!id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const { data: draftListData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });
  const { data: exportReadinessValidation } = useQuery({
    queryKey: ['draft', reviewId, 'export-readiness-validation'],
    queryFn: () => api.validateDraft(reviewId),
    enabled: Boolean(reviewId),
  });
  const { data: worldsData } = useQuery({
    queryKey: ['worlds-list', 'review-attachment'],
    queryFn: () => api.getWorlds({ includePublic: false }),
    enabled: selfContainedDesktop,
  });
  const { data: worldDraftLinksData } = useQuery({
    queryKey: ['world-character-draft-links', reviewId],
    queryFn: () => api.getWorldCharacterDraftLinks({ draftIds: [reviewId] }),
    enabled: selfContainedDesktop && Boolean(reviewId),
  });

  const template = useMemo(() => {
    if (!draft) {
      return undefined;
    }

    return templates.find((entry: Template) => entry.name === draft.metadata.template_name);
  }, [draft, templates]);

  const relatedDraftLookup = useMemo(
    () => new Map((draftListData?.drafts ?? []).map((entry) => [entry.review_id, entry] as const)),
    [draftListData],
  );
  const availableConnectedDrafts = useMemo(
    () =>
      (draftListData?.drafts ?? []).filter(
        (entry) => entry.review_id !== reviewId && !editableConnectedDraftIds.includes(entry.review_id),
      ),
    [draftListData, editableConnectedDraftIds, reviewId],
  );
  const hasConnectedDraftChanges = useMemo(() => {
    const saved = draft?.metadata.connected_drafts ?? [];
    if (saved.length !== editableConnectedDraftIds.length) {
      return true;
    }

    return saved.some((draftId, index) => draftId !== editableConnectedDraftIds[index]);
  }, [draft?.metadata.connected_drafts, editableConnectedDraftIds]);

  const assetEntries = useMemo((): ReviewAssetEntry[] => {
    if (!draft) {
      return [];
    }

    const entries: ReviewAssetEntry[] = [];
    const seenAssets = new Set<string>();

    if (template) {
      for (const asset of template.assets) {
        entries.push({
          name: asset.name,
          exists: Object.prototype.hasOwnProperty.call(draft.assets, asset.name),
          description: asset.description,
          required: asset.required,
        });
        seenAssets.add(asset.name);
      }
    }

    for (const assetName of Object.keys(draft.assets)) {
      if (seenAssets.has(assetName) || !isVisibleDraftAsset(assetName)) {
        continue;
      }

      entries.push({
        name: assetName,
        exists: true,
      });
    }

    return entries;
  }, [draft, template]);
  const exportReadiness = useMemo(
    () => buildExportReadinessSummary(draft, exportReadinessValidation),
    [draft, exportReadinessValidation],
  );
  const assetApprovals = useMemo(() => buildAssetApprovalSummary(draft), [draft]);
  const linkedWorldAttachments = worldDraftLinksData?.links ?? [];
  const linkedWorldAttachment = linkedWorldAttachments[0] ?? null;
  const hasMultipleWorldAttachments = linkedWorldAttachments.length > 1;
  const { data: linkedWorldData } = useQuery({
    queryKey: ['world-detail', linkedWorldAttachment?.worldId],
    queryFn: () => api.getWorld(linkedWorldAttachment!.worldId),
    enabled: selfContainedDesktop && Boolean(linkedWorldAttachment?.worldId) && !hasMultipleWorldAttachments,
  });
  const linkedWorld = linkedWorldData?.world ?? null;
  const linkedWorldCharacters = linkedWorld?.characters ?? [];
  const linkedWorldRelationships = linkedWorld?.relationships ?? [];
  const linkedReviewCharacter =
    linkedWorldCharacters.find((character) => character.id === linkedWorldAttachment?.characterId) ?? null;
  const linkedRelationshipTargets = linkedWorldCharacters.filter(
    (character) => character.id !== linkedWorldAttachment?.characterId,
  );
  const linkedReviewRelationships = linkedWorldRelationships.filter(
    (relationship) =>
      relationship.sourceCharacterId === linkedWorldAttachment?.characterId ||
      relationship.targetCharacterId === linkedWorldAttachment?.characterId,
  );
  const mergeProvenanceSummary = useMemo(() => {
    const mergeProvenance = draft?.metadata.merge_provenance;
    if (!mergeProvenance) {
      return null;
    }

    const sourceDraft = relatedDraftLookup.get(mergeProvenance.source_draft_id);
    const baseDraft = relatedDraftLookup.get(mergeProvenance.base_draft_id);
    const sourceSnapshotLabel = mergeProvenance.source_snapshot_id
      ? sourceDraft?.revision_snapshots?.find((snapshot) => snapshot.id === mergeProvenance.source_snapshot_id)
          ?.label || 'Selected restore point'
      : null;
    const baseSnapshotLabel = mergeProvenance.base_snapshot_id
      ? baseDraft?.revision_snapshots?.find((snapshot) => snapshot.id === mergeProvenance.base_snapshot_id)?.label ||
        'Selected restore point'
      : null;

    return {
      strategyLabel: mergeProvenance.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge',
      sourceName: sourceDraft?.character_name || sourceDraft?.seed || mergeProvenance.source_draft_id,
      baseName: baseDraft?.character_name || baseDraft?.seed || mergeProvenance.base_draft_id,
      sourceDraftId: mergeProvenance.source_draft_id,
      baseDraftId: mergeProvenance.base_draft_id,
      sourceSide: mergeProvenance.source_side,
      baseSide: mergeProvenance.base_side,
      sourceSnapshotLabel,
      baseSnapshotLabel,
      assetNames: mergeProvenance.asset_names.map(formatAssetLabel),
      createdAt: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(mergeProvenance.created_at),
      ),
    };
  }, [draft?.metadata.merge_provenance, relatedDraftLookup]);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      await api.createDraftSnapshot(reviewId, {
        label: draft?.metadata.favorite ? 'Before removing favorite' : 'Before marking favorite',
        reason: draft?.metadata.favorite ? 'pre-favorite-remove' : 'pre-favorite-add',
      });

      return api.updateMetadata(reviewId, {
        favorite: !draft?.metadata.favorite,
      });
    },
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const recordAssetApproval = useMutation({
    mutationFn: (input: { assetName: string; decision: DraftAssetApprovalDecision | null }) =>
      api.setAssetApproval(reviewId, input.assetName, input.decision),
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const archiveDraft = useMutation({
    mutationFn: async () => {
      await api.createDraftSnapshot(reviewId, {
        label: draft?.metadata.archived_at ? 'Before restoring from archive' : 'Before archiving draft',
        reason: draft?.metadata.archived_at ? 'pre-draft-restore' : 'pre-draft-archive',
      });

      return draft?.metadata.archived_at ? api.restoreDraft(reviewId) : api.archiveDraft(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] });
      if (draft?.metadata.archived_at) {
        return;
      }
      navigate('/drafts?tab=archive');
    },
  });

  const attachDraftToWorld = useMutation({
    mutationFn: async (worldId: string) => {
      if (!draft) {
        throw new Error('Draft must be loaded before it can be attached to a world.');
      }

      const draftCharacterName = draft.metadata.character_name || draft.metadata.seed;

      if (hasMultipleWorldAttachments) {
        throw new Error(
          'This draft is linked to multiple persisted world characters. Resolve the extra links from Worlds before managing it here.',
        );
      }

      if (!linkedWorldAttachment) {
        await api.addWorldCharacter(worldId, {
          draftId: reviewId,
          characterName: draftCharacterName,
        });

        return {
          action: 'attached' as const,
          worldIds: [worldId],
        };
      }

      if (linkedWorldAttachment.worldId === worldId) {
        return {
          action: 'unchanged' as const,
          worldIds: [worldId],
        };
      }

      const currentWorld = await api.getWorld(linkedWorldAttachment.worldId);
      const currentCharacter = (currentWorld.world.characters ?? []).find(
        (character) => character.id === linkedWorldAttachment.characterId,
      );

      await api.updateWorldCharacter(linkedWorldAttachment.worldId, linkedWorldAttachment.characterId, {
        draftId: '',
      });

      try {
        await api.addWorldCharacter(worldId, {
          draftId: reviewId,
          characterName: currentCharacter?.characterName || linkedWorldAttachment.characterName || draftCharacterName,
          role: currentCharacter?.role || linkedWorldAttachment.role,
          notes: currentCharacter?.notes,
        });
      } catch (mutationError) {
        await api.updateWorldCharacter(linkedWorldAttachment.worldId, linkedWorldAttachment.characterId, {
          draftId: reviewId,
        });

        throw mutationError;
      }

      return {
        action: 'moved' as const,
        worldIds: [linkedWorldAttachment.worldId, worldId],
      };
    },
    onSuccess: async (result) => {
      setWorldAttachmentFeedback(
        result.action === 'moved'
          ? 'Draft moved to selected world.'
          : result.action === 'unchanged'
            ? 'This draft is already linked to that world.'
            : 'Draft linked to world.',
      );
      await invalidateWorldAttachmentQueries(result.worldIds);
    },
    onError: (mutationError: Error) => {
      setWorldAttachmentFeedback(mutationError.message);
    },
  });

  const detachDraftFromWorld = useMutation({
    mutationFn: async () => {
      if (!linkedWorldAttachment) {
        throw new Error('This draft is not linked to a persisted world character.');
      }

      if (hasMultipleWorldAttachments) {
        throw new Error(
          'This draft is linked to multiple persisted world characters. Resolve the extra links from Worlds before detaching it here.',
        );
      }

      await api.updateWorldCharacter(linkedWorldAttachment.worldId, linkedWorldAttachment.characterId, {
        draftId: '',
      });

      return {
        worldIds: [linkedWorldAttachment.worldId],
      };
    },
    onSuccess: async (result) => {
      setWorldAttachmentFeedback('Draft detached from world.');
      await invalidateWorldAttachmentQueries(result.worldIds);
    },
    onError: (mutationError: Error) => {
      setWorldAttachmentFeedback(mutationError.message);
    },
  });

  const addRelationshipFromReview = useMutation({
    mutationFn: async () => {
      if (!linkedWorldAttachment) {
        throw new Error('Attach this draft to a persisted world character before creating canon relationships.');
      }

      if (!pendingRelationshipTargetId || !pendingRelationshipLabel.trim()) {
        throw new Error('Choose a target character and add a relationship label.');
      }

      return api.addWorldRelationship(linkedWorldAttachment.worldId, {
        sourceCharacterId: linkedWorldAttachment.characterId,
        targetCharacterId: pendingRelationshipTargetId,
        label: pendingRelationshipLabel.trim(),
        notes: pendingRelationshipNotes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setWorldRelationshipFeedback('Relationship added to world.');
      setPendingRelationshipTargetId('');
      setPendingRelationshipLabel('');
      setPendingRelationshipNotes('');
      if (linkedWorldAttachment) {
        await invalidateWorldAttachmentQueries([linkedWorldAttachment.worldId]);
      }
    },
    onError: (mutationError: Error) => {
      setWorldRelationshipFeedback(mutationError.message);
    },
  });

  const updateMetadata = useMutation({
    mutationFn: async (metadata: { character_name?: string }) => {
      if (draft?.metadata.character_name !== metadata.character_name) {
        await api.createDraftSnapshot(reviewId, {
          label: 'Before renaming draft',
          reason: 'pre-draft-rename',
        });
      }

      return api.updateMetadata(reviewId, metadata);
    },
    onSuccess: () => {
      invalidateDraftQueries();
      setIsEditingName(false);
    },
  });

  const saveDraftSendConfig = useMutation({
    mutationFn: async ({
      metadata,
      snapshot,
    }: {
      metadata: Partial<DraftMetadata>;
      snapshot?: { label?: string; reason?: string; enabled?: boolean };
    }) => {
      const currentDraft = await api.getDraft(reviewId);
      const hasChanges = Object.entries(metadata).some(([key, value]) => {
        const currentValue = currentDraft.metadata[key as keyof DraftMetadata];
        return JSON.stringify(currentValue ?? null) !== JSON.stringify(value ?? null);
      });

      if (hasChanges && snapshot?.enabled !== false) {
        await api.createDraftSnapshot(reviewId, {
          label: snapshot?.label ?? 'Before draft metadata update',
          reason: snapshot?.reason ?? 'pre-draft-metadata-update',
        });
      }

      return api.updateMetadata(reviewId, metadata);
    },
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const saveAsset = useMutation({
    mutationFn: async ({
      assetName,
      content,
      expectedPreviousContent,
      overwrite,
    }: {
      assetName: string;
      content: string;
      expectedPreviousContent: string | null;
      overwrite: boolean;
    }) => {
      if (expectedPreviousContent !== content) {
        await api.createDraftSnapshot(reviewId, {
          label: `Before editing ${formatAssetLabel(assetName)}`,
          reason: `pre-asset-edit:${assetName}`,
        });
      }

      return api.updateAsset(reviewId, assetName, content, {
        expectedPreviousContent,
        overwrite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      setEditingAsset(null);
      setEditingBaseContent(null);
      setEditContent('');
      setAssetActionError(null);
    },
    onError: (mutationError: Error) => {
      setAssetActionError(mutationError.message);
    },
  });

  const validateDraft = useMutation({
    mutationFn: () => api.validateDraft(reviewId),
    onSuccess: (result) => {
      setValidationMessage(result.success ? 'Validation passed' : 'Validation failed');
    },
    onError: (mutationError: Error) => {
      setValidationMessage(mutationError.message);
    },
  });

  useAssistantScreenContext({
    draft_id: reviewId,
    character_name: draft?.metadata.character_name || '',
    mode: draft?.metadata.mode || '',
    template_name: draft?.metadata.template_name || '',
    asset_names: draft ? Object.keys(draft.assets) : [],
    editing_asset: editingAsset || '',
    favorite: draft?.metadata.favorite ?? false,
    has_lineage: Boolean(draft?.metadata.parent_drafts?.length),
    connected_character_count: draft?.metadata.connected_drafts?.length ?? 0,
  });

  const handleEditAsset = (assetName: string) => {
    if (!draft) {
      return;
    }

    const baseContent = Object.prototype.hasOwnProperty.call(draft.assets, assetName) ? draft.assets[assetName] : null;

    setEditingAsset(assetName);
    setEditingBaseContent(baseContent);
    setEditContent(baseContent ?? '');
    setAssetActionError(null);
  };

  const handleEditName = () => {
    setEditName(draft?.metadata.character_name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    updateMetadata.mutate({
      character_name: editName.trim() || undefined,
    });
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setEditName('');
  };

  const worlds = worldsData?.worlds;

  useEffect(() => {
    if (!worlds?.length) {
      if (pendingWorldId) {
        setPendingWorldId('');
      }
      return;
    }

    const selectedWorldExists = worlds.some((world) => world.id === pendingWorldId);
    const linkedWorldExists = linkedWorldAttachment
      ? worlds.some((world) => world.id === linkedWorldAttachment.worldId)
      : false;

    if (linkedWorldAttachment?.worldId && linkedWorldExists && pendingWorldId !== linkedWorldAttachment.worldId) {
      setPendingWorldId(linkedWorldAttachment.worldId);
      return;
    }

    if (!selectedWorldExists) {
      setPendingWorldId(worlds[0].id);
    }
  }, [linkedWorldAttachment, pendingWorldId, worlds]);

  useEffect(() => {
    if (!linkedWorldAttachment) {
      setPendingRelationshipTargetId('');
      setPendingRelationshipLabel('');
      setPendingRelationshipNotes('');
      setWorldRelationshipFeedback(null);
      return;
    }

    if (!linkedRelationshipTargets.some((character) => character.id === pendingRelationshipTargetId)) {
      setPendingRelationshipTargetId('');
    }
  }, [linkedRelationshipTargets, linkedWorldAttachment, pendingRelationshipTargetId]);

  const handleSaveAsset = () => {
    if (editingAsset) {
      saveAsset.mutate({
        assetName: editingAsset,
        content: editContent,
        expectedPreviousContent: editingBaseContent,
        overwrite: editingBaseContent !== null,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setEditingBaseContent(null);
    setEditContent('');
    setAssetActionError(null);
  };

  const handleAssetRefined = (assetName: string, newContent: string) => {
    const expectedPreviousContent =
      draft && Object.prototype.hasOwnProperty.call(draft.assets, assetName) ? draft.assets[assetName] : null;

    saveAsset.mutate({
      assetName,
      content: newContent,
      expectedPreviousContent,
      overwrite: expectedPreviousContent !== null,
    });
  };

  const handleAddConnectedDraft = () => {
    if (!pendingConnectedDraftId) {
      return;
    }

    setEditableConnectedDraftIds((previous) => {
      if (previous.includes(pendingConnectedDraftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
        return previous;
      }

      return [...previous, pendingConnectedDraftId];
    });
    setPendingConnectedDraftId('');
  };

  const handleRemoveConnectedDraft = (draftId: string) => {
    setEditableConnectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleSaveConnectedDrafts = async () => {
    await saveDraftSendConfig.mutateAsync({
      metadata: {
        connected_drafts: editableConnectedDraftIds,
      },
      snapshot: {
        label: 'Before updating connected references',
        reason: 'pre-connected-reference-update',
      },
    });
  };

  const handleResetConnectedDrafts = () => {
    if (!draft) {
      return;
    }

    setEditableConnectedDraftIds(draft.metadata.connected_drafts ?? []);
    setPendingConnectedDraftId('');
  };

  const handleCopyAsset = async (assetName: string) => {
    const content = editingAsset === assetName ? editContent : (draft?.assets[assetName] ?? '');

    try {
      await navigator.clipboard.writeText(content);
      setCopiedAsset(assetName);
      window.setTimeout(() => {
        setCopiedAsset((currentAsset) => (currentAsset === assetName ? null : currentAsset));
      }, 1600);
    } catch (copyError) {
      console.error('Failed to copy asset', copyError);
    }
  };

  const handleApplyA1111Fixes = (nextContent: string) => {
    if (!draft) {
      return;
    }
    saveAsset.mutate({
      assetName: 'a1111',
      content: nextContent,
      expectedPreviousContent: draft.assets.a1111 ?? null,
      overwrite: true,
    });
  };

  const handleAttachCardImage = async () => {
    try {
      const file = await pickFile({ accept: '.png,image/png' }, imageInputRef.current);
      if (!file || !draft) {
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl.startsWith('data:image/png;base64,')) {
        setAssetActionError('Only PNG images are supported for card export.');
        return;
      }

      await saveAsset.mutateAsync({
        assetName: 'card_image',
        content: dataUrl,
        expectedPreviousContent: Object.prototype.hasOwnProperty.call(draft.assets, 'card_image')
          ? draft.assets.card_image
          : null,
        overwrite: Object.prototype.hasOwnProperty.call(draft.assets, 'card_image'),
      });

      const nextCardMetadata = {
        ...(draft.metadata.card_metadata ?? {}),
        avatar: dataUrl,
      };

      await saveDraftSendConfig.mutateAsync({
        metadata: {
          card_metadata: nextCardMetadata,
        },
        snapshot: {
          enabled: false,
        },
      });
      setAssetActionError(null);
    } catch (error) {
      setAssetActionError(error instanceof Error ? error.message : 'Failed to attach PNG image.');
    }
  };

  const handleClearCardImage = async () => {
    if (!draft) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(draft.assets, 'card_image')) {
      await saveAsset.mutateAsync({
        assetName: 'card_image',
        content: '',
        expectedPreviousContent: draft.assets.card_image,
        overwrite: true,
      });
    }

    if (draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) {
      const nextCardMetadata = { ...draft.metadata.card_metadata };
      delete nextCardMetadata.avatar;
      await saveDraftSendConfig.mutateAsync({
        metadata: {
          card_metadata: Object.keys(nextCardMetadata).length > 0 ? nextCardMetadata : undefined,
        },
        snapshot: {
          enabled: false,
        },
      });
    }
  };

  useEffect(() => {
    if (activeTourId !== REVIEW_EXPORT_TOUR_ID) {
      if (tourManagedExportModal && showExportModal) {
        setShowExportModal(false);
      }
      if (tourManagedExportModal) {
        setTourManagedExportModal(false);
      }
      return;
    }

    const activeStep = getGuidedTour(activeTourId)?.steps[activeStepIndex];
    const needsExportModal =
      activeStep?.targetId === 'export-preset-selection' || activeStep?.targetId === 'export-confirm';

    if (needsExportModal && !showExportModal) {
      setTourManagedExportModal(true);
      setShowExportModal(true);
      return;
    }

    if (!needsExportModal && showExportModal && tourManagedExportModal) {
      setShowExportModal(false);
      setTourManagedExportModal(false);
    }
  }, [activeStepIndex, activeTourId, showExportModal, tourManagedExportModal]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    setEditableConnectedDraftIds(draft.metadata.connected_drafts ?? []);
    setPendingConnectedDraftId('');
  }, [draft]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading draft...</div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="space-y-4">
        <Link to="/drafts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading draft
        </div>
      </div>
    );
  }

  const assetNames = Object.keys(draft.assets).filter(isVisibleDraftAsset);
  const historyAssetName = historyAssetParam && assetNames.includes(historyAssetParam) ? historyAssetParam : undefined;
  const historySnapshotId =
    historySnapshotParam && draft.metadata.revision_snapshots?.some((snapshot) => snapshot.id === historySnapshotParam)
      ? historySnapshotParam
      : undefined;
  const missingAssetCount = assetEntries.filter((asset) => !asset.exists).length;
  const assetCountLabel = template ? `${assetNames.length}/${template.assets.length}` : `${assetNames.length}`;
  const overviewPreview = [
    `${assetCountLabel} assets`,
    draft.metadata.mode,
    draft.metadata.template_name,
    draft.metadata.genre,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="app-page space-y-5 pb-10 sm:space-y-6 sm:pb-12">
      <input ref={imageInputRef} type="file" accept=".png,image/png" title="Attach PNG image" className="hidden" />
      <ReviewHero
        metadata={draft.metadata}
        assetCountLabel={assetCountLabel}
        isEditingName={isEditingName}
        editName={editName}
        isSavingName={updateMetadata.isPending}
        onEditName={handleEditName}
        onEditNameChange={setEditName}
        onSaveName={handleSaveName}
        onCancelNameEdit={handleCancelNameEdit}
        onValidate={() => validateDraft.mutate()}
        onToggleFavorite={() => toggleFavorite.mutate()}
        onArchive={() => archiveDraft.mutate()}
        onExport={() => {
          setTourManagedExportModal(false);
          setShowExportModal(true);
        }}
      />

      <ReviewOverviewSection
        metadata={draft.metadata}
        assets={draft.assets}
        overviewPreview={overviewPreview}
        defaultExpanded={Boolean(
          validationMessage ||
          draft.metadata.parent_drafts?.length ||
          draft.metadata.archived_at ||
          mergeProvenanceSummary ||
          (selfContainedDesktop && (hasMultipleWorldAttachments || linkedWorldAttachment || worldsData?.worlds.length)),
        )}
        validationMessage={validationMessage}
        missingAssetCount={missingAssetCount}
        exportReadiness={exportReadiness}
        assetNames={assetNames}
        assetApprovals={assetApprovals}
        mergeProvenanceSummary={mergeProvenanceSummary}
        onAttachCardImage={handleAttachCardImage}
        onClearCardImage={handleClearCardImage}
        worldAttachments={
          selfContainedDesktop && (
            <ReviewWorldAttachmentsSection
              hasMultipleWorldAttachments={hasMultipleWorldAttachments}
              linkedWorldAttachments={linkedWorldAttachments}
              linkedWorldAttachment={linkedWorldAttachment}
              worlds={worldsData?.worlds ?? []}
              pendingWorldId={pendingWorldId}
              onPendingWorldIdChange={setPendingWorldId}
              isAttaching={attachDraftToWorld.isPending}
              isDetaching={detachDraftFromWorld.isPending}
              onAttach={(worldId) => attachDraftToWorld.mutate(worldId)}
              onDetach={() => detachDraftFromWorld.mutate()}
              linkedReviewCharacter={linkedReviewCharacter}
              linkedReviewRelationships={linkedReviewRelationships}
              linkedWorldCharacters={linkedWorldCharacters}
              linkedRelationshipTargets={linkedRelationshipTargets}
              pendingRelationshipTargetId={pendingRelationshipTargetId}
              onPendingRelationshipTargetIdChange={setPendingRelationshipTargetId}
              pendingRelationshipLabel={pendingRelationshipLabel}
              onPendingRelationshipLabelChange={setPendingRelationshipLabel}
              pendingRelationshipNotes={pendingRelationshipNotes}
              onPendingRelationshipNotesChange={setPendingRelationshipNotes}
              isAddingRelationship={addRelationshipFromReview.isPending}
              onAddRelationship={() => addRelationshipFromReview.mutate()}
              worldRelationshipFeedback={worldRelationshipFeedback}
              worldAttachmentFeedback={worldAttachmentFeedback}
            />
          )
        }
      />

      {assetActionError && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {assetActionError}
        </div>
      )}

      <ReviewAssetCards
        reviewId={reviewId}
        assets={draft.assets}
        assetEntries={assetEntries}
        assetApprovals={assetApprovals}
        editingAsset={editingAsset}
        editingBaseContent={editingBaseContent}
        editContent={editContent}
        copiedAsset={copiedAsset}
        isSaving={saveAsset.isPending}
        isRecordingApproval={recordAssetApproval.isPending}
        onCopyAsset={handleCopyAsset}
        onStartEdit={handleEditAsset}
        onSaveAsset={handleSaveAsset}
        onCancelEdit={handleCancelEdit}
        onEditContentChange={setEditContent}
        onRecordApproval={(assetName, decision) => recordAssetApproval.mutate({ assetName, decision })}
        onApplyA1111Fixes={handleApplyA1111Fixes}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ReviewConnectedReferencesSection
          editableConnectedDraftIds={editableConnectedDraftIds}
          relatedDraftLookup={relatedDraftLookup}
          availableConnectedDrafts={availableConnectedDrafts}
          pendingConnectedDraftId={pendingConnectedDraftId}
          onPendingConnectedDraftIdChange={setPendingConnectedDraftId}
          isSaving={saveDraftSendConfig.isPending}
          hasConnectedDraftChanges={hasConnectedDraftChanges}
          onAddReference={handleAddConnectedDraft}
          onRemoveReference={handleRemoveConnectedDraft}
          onSaveReferences={() => void handleSaveConnectedDrafts()}
          onResetReferences={handleResetConnectedDrafts}
        />

        <DraftSendConfigPanel
          draft={draft}
          template={template}
          onSave={async (updates) => {
            await saveDraftSendConfig.mutateAsync({
              metadata: updates,
              snapshot: {
                label: 'Before updating outbound draft settings',
                reason: 'pre-send-config-update',
              },
            });
          }}
          isSaving={saveDraftSendConfig.isPending}
          description="Saved instructions and outbound component order for later refinement or regeneration."
        />
      </div>

      <CollapsibleSection
        title="Review aids"
        subtitle="Checklist and local activity panels"
        preview="Secondary"
        defaultExpanded={Boolean(historyAssetName || historySnapshotId)}
        density="compact"
        className="app-panel"
      >
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ReviewChecklistPanel draftId={reviewId} />
          <VersionHistoryPanel draftId={reviewId} assetName={historyAssetName} snapshotId={historySnapshotId} />
        </div>
      </CollapsibleSection>

      {showExportModal && (
        <ExportModal
          draftId={reviewId}
          characterName={draft.metadata.character_name || draft.metadata.seed}
          onClose={() => {
            setShowExportModal(false);
            setTourManagedExportModal(false);
          }}
        />
      )}

      <ChatPanel draftId={reviewId} onAssetRefined={handleAssetRefined} />
    </div>
  );
}
