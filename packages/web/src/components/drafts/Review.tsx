import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Star,
  Download,
  Archive,
  RotateCcw,
  Edit3,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
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
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-2.5 sm:space-y-3">
            <Link
              to="/drafts"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Link>
            <p className="app-page-eyebrow">Review</p>
            {isEditingName ? (
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Character name"
                  className="w-full min-w-0 rounded-xl border border-input bg-background px-3 py-2 text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[18rem] sm:text-2xl"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Save Name
                </button>
                <button
                  onClick={handleCancelNameEdit}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <h1 className="app-page-title text-[clamp(2rem,4vw,3.4rem)]">
                  {draft.metadata.character_name || draft.metadata.seed}
                </h1>
                <button
                  onClick={handleEditName}
                  className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit Name
                </button>
              </div>
            )}
            <p className="app-page-summary max-w-4xl">{draft.metadata.seed}</p>
          </div>

          <div className="app-panel-muted min-w-0 p-3.5 sm:p-5">
            <p className="app-page-eyebrow">Draft state</p>
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              <span className="app-pill app-pill-muted">{assetCountLabel} assets</span>
              {draft.metadata.mode ? <span className="app-pill app-pill-muted">{draft.metadata.mode}</span> : null}
              {draft.metadata.template_name ? (
                <span className="app-pill app-pill-muted">{draft.metadata.template_name}</span>
              ) : null}
              {draft.metadata.genre ? <span className="app-pill app-pill-muted">{draft.metadata.genre}</span> : null}
            </div>
            <div className="mt-4 hidden sm:grid app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Assets</p>
                <div className="app-page-metric-value text-2xl">{assetCountLabel}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-xl sm:text-2xl">{draft.metadata.mode || 'Unset'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Template</p>
                <div className="app-page-metric-value text-base sm:text-xl">
                  {draft.metadata.template_name || 'Unset'}
                </div>
              </div>
            </div>

            <div data-tour-anchor="review-actions" className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              <button
                onClick={() => validateDraft.mutate()}
                data-tour-anchor="review-validate"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <ShieldCheck className="h-4 w-4" />
                Validate
              </button>
              <button
                onClick={() => toggleFavorite.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <Star className={`h-4 w-4 ${draft.metadata.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {draft.metadata.favorite ? 'Favorited' : 'Favorite'}
              </button>
              <button
                onClick={() => {
                  setTourManagedExportModal(false);
                  setShowExportModal(true);
                }}
                data-tour-anchor="review-export"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => archiveDraft.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
              >
                {draft.metadata.archived_at ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {draft.metadata.archived_at ? 'Restore' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <CollapsibleSection
        title="Overview"
        subtitle="Tags, validation, lineage, and archive state"
        preview={overviewPreview || 'No extra metadata'}
        defaultExpanded={Boolean(
          validationMessage ||
          draft.metadata.parent_drafts?.length ||
          draft.metadata.archived_at ||
          mergeProvenanceSummary ||
          (selfContainedDesktop && (hasMultipleWorldAttachments || linkedWorldAttachment || worldsData?.worlds.length)),
        )}
        density="compact"
        className="app-panel"
        bodyClassName="space-y-2.5"
      >
        <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
          {draft.metadata.mode && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary sm:px-3 sm:text-sm">
              {draft.metadata.mode}
            </span>
          )}
          {draft.metadata.template_name && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
              {draft.metadata.template_name}
            </span>
          )}
          {draft.metadata.genre && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">{draft.metadata.genre}</span>
          )}
          {draft.metadata.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
              {tag}
            </span>
          ))}
        </div>

        {validationMessage ? (
          <div className="app-note p-4 text-sm">
            {validationMessage}.{' '}
            <Link to="/validation" className="text-primary hover:underline">
              Open Validation screen
            </Link>
          </div>
        ) : null}

        {missingAssetCount > 0 ? (
          <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            This draft is missing {missingAssetCount} template asset{missingAssetCount === 1 ? '' : 's'}.{' '}
            {missingAssetCount === 1 ? 'Create it' : 'Create them'} with AI from the existing draft context or add{' '}
            {missingAssetCount === 1 ? 'it' : 'them'} manually before export.
          </div>
        ) : null}

        <div
          className={`rounded-xl border p-4 text-sm ${exportReadiness.requiresAcknowledgement ? 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100' : 'border-emerald-500/30 bg-emerald-500/10 text-muted-foreground'}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {exportReadiness.requiresAcknowledgement ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                )}
                <div className="font-medium text-foreground">Export readiness</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {exportReadiness.validationState === 'checking'
                  ? 'Checking validation and saved review annotations.'
                  : exportReadiness.requiresAcknowledgement
                    ? 'This draft still has review blockers that will require acknowledgment in the export modal.'
                    : 'Validation and saved review annotations do not currently show export blockers.'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
                Validation{' '}
                {exportReadiness.validationState === 'checking'
                  ? 'checking'
                  : exportReadiness.validationState === 'passing'
                    ? 'passing'
                    : 'failing'}
              </span>
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
                {exportReadiness.reviewedAssetCount}/{assetNames.length} scored
              </span>
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
                {exportReadiness.assetNoteCount} asset note{exportReadiness.assetNoteCount === 1 ? '' : 's'}
              </span>
              {assetApprovals.totalAssetCount > 0 && (
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
                  {assetApprovals.approvedCount}/{assetApprovals.totalAssetCount} approved
                </span>
              )}
            </div>
          </div>

          {exportReadiness.reviewerSummary ? (
            <div className="mt-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              Reviewer summary saved.
            </div>
          ) : null}

          {exportReadiness.blockingWarnings.length > 0 ? (
            <div className="mt-3 space-y-2 rounded-lg border border-amber-500/40 bg-background/60 p-3 text-xs text-amber-800 dark:text-amber-200">
              {exportReadiness.blockingWarnings.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
              {exportReadiness.lowScoreEntries.length > 0 && (
                <div>
                  Low-score assets:{' '}
                  {exportReadiness.lowScoreEntries
                    .map(({ assetName, score }) => `${assetName.replace(/_/g, ' ')} (${score}/5)`)
                    .join(', ')}
                </div>
              )}
            </div>
          ) : exportReadiness.unratedAssetCount > 0 ? (
            <div className="mt-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              {exportReadiness.unratedAssetCount} asset{exportReadiness.unratedAssetCount === 1 ? '' : 's'} do not have
              saved review scores yet.
            </div>
          ) : null}
        </div>

        {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 ? (
          <div className="app-note px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Lineage:</span> Offspring of:{' '}
            {draft.metadata.parent_drafts.join(' + ')}
          </div>
        ) : null}

        {selfContainedDesktop && (
          <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-foreground">World attachment</div>
                <div className="mt-1 text-muted-foreground">
                  Attach this draft to a persisted world through its world-character record.
                </div>
              </div>
              <Link
                to="/worlds"
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Open Worlds
              </Link>
            </div>

            {hasMultipleWorldAttachments ? (
              <div className="mt-3 space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-100">
                <div className="font-medium text-foreground">Multiple world links found</div>
                <div>
                  This draft is linked to more than one persisted world character. Review-side move and detach actions
                  are disabled until the extra links are cleaned up from Worlds.
                </div>
                <div className="space-y-1">
                  {linkedWorldAttachments.map((attachment) => (
                    <div key={attachment.characterId}>
                      {attachment.worldName}: {attachment.characterName}
                      {attachment.role ? ` · ${attachment.role}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            ) : linkedWorldAttachment ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">Attached to {linkedWorldAttachment.worldName}</div>
                  <div className="mt-1">
                    Character record: {linkedWorldAttachment.characterName}
                    {linkedWorldAttachment.role ? ` · ${linkedWorldAttachment.role}` : ''}
                  </div>
                </div>
                {worldsData?.worlds.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={pendingWorldId}
                      onChange={(event) => setPendingWorldId(event.target.value)}
                      className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                      aria-label="Move draft to world"
                    >
                      {worldsData.worlds.map((world) => (
                        <option key={world.id} value={world.id}>
                          {world.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => pendingWorldId && attachDraftToWorld.mutate(pendingWorldId)}
                      disabled={
                        !pendingWorldId ||
                        pendingWorldId === linkedWorldAttachment.worldId ||
                        attachDraftToWorld.isPending ||
                        detachDraftFromWorld.isPending
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {attachDraftToWorld.isPending ? 'Moving...' : 'Move to selected world'}
                    </button>
                    <button
                      type="button"
                      onClick={() => detachDraftFromWorld.mutate()}
                      disabled={attachDraftToWorld.isPending || detachDraftFromWorld.isPending}
                      className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                    >
                      {detachDraftFromWorld.isPending ? 'Detaching...' : 'Detach from world'}
                    </button>
                  </div>
                ) : null}
                {linkedReviewCharacter && (
                  <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Canon relationships</div>
                    <div className="mt-1">
                      Record ties for {linkedReviewCharacter.characterName} without leaving review.
                    </div>

                    {linkedReviewRelationships.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {linkedReviewRelationships.map((relationship) => {
                          const sourceName =
                            linkedWorldCharacters.find((character) => character.id === relationship.sourceCharacterId)
                              ?.characterName ?? relationship.sourceCharacterId;
                          const targetName =
                            linkedWorldCharacters.find((character) => character.id === relationship.targetCharacterId)
                              ?.characterName ?? relationship.targetCharacterId;

                          return (
                            <div
                              key={relationship.id}
                              className="rounded-md border border-border/50 bg-background/70 px-2.5 py-2"
                            >
                              <div className="font-medium text-foreground">
                                {sourceName}
                                {' -> '}
                                {targetName}
                              </div>
                              <div className="mt-1">{relationship.label}</div>
                              {relationship.notes ? (
                                <div className="mt-1 text-[11px] text-muted-foreground">{relationship.notes}</div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-md border border-border/50 bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground">
                        No canon relationships recorded for this character yet.
                      </div>
                    )}

                    {linkedRelationshipTargets.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        <select
                          value={pendingRelationshipTargetId}
                          onChange={(event) => setPendingRelationshipTargetId(event.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                          aria-label="Relationship target"
                        >
                          <option value="">Target character...</option>
                          {linkedRelationshipTargets.map((character) => (
                            <option key={character.id} value={character.id}>
                              {character.characterName}
                            </option>
                          ))}
                        </select>
                        <input
                          value={pendingRelationshipLabel}
                          onChange={(event) => setPendingRelationshipLabel(event.target.value)}
                          placeholder="Relationship label"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <textarea
                          value={pendingRelationshipNotes}
                          onChange={(event) => setPendingRelationshipNotes(event.target.value)}
                          placeholder="Relationship notes"
                          className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => addRelationshipFromReview.mutate()}
                          disabled={
                            !pendingRelationshipTargetId ||
                            !pendingRelationshipLabel.trim() ||
                            addRelationshipFromReview.isPending
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {addRelationshipFromReview.isPending ? 'Saving relationship...' : 'Add relationship to world'}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-md border border-border/50 bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground">
                        Add another character to this world before recording relationships from review.
                      </div>
                    )}

                    {worldRelationshipFeedback && (
                      <div className="mt-3 text-[11px] text-muted-foreground">{worldRelationshipFeedback}</div>
                    )}
                  </div>
                )}
              </div>
            ) : worldsData?.worlds.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={pendingWorldId}
                  onChange={(event) => setPendingWorldId(event.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                  aria-label="Attach draft to world"
                >
                  {worldsData.worlds.map((world) => (
                    <option key={world.id} value={world.id}>
                      {world.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => pendingWorldId && attachDraftToWorld.mutate(pendingWorldId)}
                  disabled={!pendingWorldId || attachDraftToWorld.isPending || detachDraftFromWorld.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {attachDraftToWorld.isPending ? 'Attaching...' : 'Attach to world'}
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                No persisted worlds yet. Create or promote one from the Worlds route first.
              </div>
            )}

            {worldAttachmentFeedback && (
              <div className="mt-3 text-xs text-muted-foreground">{worldAttachmentFeedback}</div>
            )}
          </div>
        )}

        {mergeProvenanceSummary ? (
          <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-foreground">Merge provenance</div>
                <div className="mt-1 text-muted-foreground">
                  {mergeProvenanceSummary.strategyLabel} recorded {mergeProvenanceSummary.createdAt}.
                </div>
              </div>
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs text-foreground">
                {mergeProvenanceSummary.strategyLabel}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                <div className="font-medium uppercase tracking-[0.14em] text-muted-foreground">Source</div>
                <Link
                  to={`/drafts/${encodeURIComponent(mergeProvenanceSummary.sourceDraftId)}`}
                  className="mt-1 block text-sm font-medium text-foreground hover:underline"
                >
                  {mergeProvenanceSummary.sourceName}
                </Link>
                <div className="mt-1">
                  {mergeProvenanceSummary.sourceSide} side
                  {mergeProvenanceSummary.sourceSnapshotLabel ? ` · ${mergeProvenanceSummary.sourceSnapshotLabel}` : ''}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                <div className="font-medium uppercase tracking-[0.14em] text-muted-foreground">Base branch</div>
                <Link
                  to={`/drafts/${encodeURIComponent(mergeProvenanceSummary.baseDraftId)}`}
                  className="mt-1 block text-sm font-medium text-foreground hover:underline"
                >
                  {mergeProvenanceSummary.baseName}
                </Link>
                <div className="mt-1">
                  {mergeProvenanceSummary.baseSide} side
                  {mergeProvenanceSummary.baseSnapshotLabel ? ` · ${mergeProvenanceSummary.baseSnapshotLabel}` : ''}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Merged assets</div>
              <div className="mt-1">{mergeProvenanceSummary.assetNames.join(', ')}</div>
            </div>
          </div>
        ) : null}

        {draft.metadata.archived_at ? (
          <div className="app-note px-4 py-3 text-sm text-muted-foreground">
            Archived{' '}
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(draft.metadata.archived_at),
            )}
          </div>
        ) : null}

        <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">Draft card image</div>
              <div className="mt-1 text-muted-foreground">
                {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')
                  ? 'PNG card image attached. Standard PNG card export is available.'
                  : 'No PNG card image attached yet. PNG export needs one.'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleAttachCardImage()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Attach PNG image
              </button>
              {(draft.assets.card_image ||
                draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
                <button
                  type="button"
                  onClick={() => void handleClearCardImage()}
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  Clear image
                </button>
              )}
            </div>
          </div>
          {(draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
            <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/60 p-3">
              <img
                src={draft.assets.card_image || draft.metadata.card_metadata?.avatar || ''}
                alt={`${draft.metadata.character_name || draft.metadata.seed} card image`}
                className="mx-auto max-h-72 rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

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
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <CollapsibleSection
          title="Connected references"
          subtitle={`Attach up to ${MAX_CONNECTED_DRAFT_REFERENCES} saved drafts to this draft`}
          preview={
            editableConnectedDraftIds.length > 0
              ? editableConnectedDraftIds
                  .map((draftId) => relatedDraftLookup.get(draftId)?.character_name || draftId)
                  .join(' • ')
              : 'None saved'
          }
          defaultExpanded={false}
          forceExpanded={hasConnectedDraftChanges}
          density="compact"
          className="app-panel"
          bodyClassName="space-y-2.5"
        >
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Connected characters:</span>{' '}
            {editableConnectedDraftIds.length > 0
              ? editableConnectedDraftIds.map((draftId, index) => (
                  <span key={draftId}>
                    {index > 0 ? ', ' : ''}
                    <Link to={`/drafts/${encodeURIComponent(draftId)}`} className="text-primary hover:underline">
                      {relatedDraftLookup.get(draftId)?.character_name || draftId}
                    </Link>
                  </span>
                ))
              : 'None saved'}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={pendingConnectedDraftId}
              onChange={(event) => setPendingConnectedDraftId(event.target.value)}
              disabled={
                saveDraftSendConfig.isPending ||
                availableConnectedDrafts.length === 0 ||
                editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
              }
              aria-label="Review connected draft reference"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Add a saved draft...</option>
              {availableConnectedDrafts.map((entry) => (
                <option key={entry.review_id} value={entry.review_id}>
                  {entry.character_name || entry.review_id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddConnectedDraft}
              disabled={
                !pendingConnectedDraftId ||
                saveDraftSendConfig.isPending ||
                editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Add reference
            </button>
          </div>

          {editableConnectedDraftIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editableConnectedDraftIds.map((draftId) => (
                <span
                  key={draftId}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {relatedDraftLookup.get(draftId)?.character_name || draftId}
                  <button
                    type="button"
                    onClick={() => handleRemoveConnectedDraft(draftId)}
                    disabled={saveDraftSendConfig.isPending}
                    aria-label={`Remove ${relatedDraftLookup.get(draftId)?.character_name || draftId}`}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSaveConnectedDrafts()}
              disabled={!hasConnectedDraftChanges || saveDraftSendConfig.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save references
            </button>
            <button
              type="button"
              onClick={handleResetConnectedDrafts}
              disabled={!hasConnectedDraftChanges || saveDraftSendConfig.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </CollapsibleSection>

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
