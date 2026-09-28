import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Check, Copy, Download, Loader2, Plus, Save, Sparkles, Trash2, Upload, Users, X } from 'lucide-react';
import type { Blueprint, FeatureCategory } from '@char-gen/shared';
import { MAX_CONNECTED_DRAFT_REFERENCES } from '@char-gen/shared';
import { api } from '@/lib/api';
import {
  getBlueprintsForFeature,
  resolveBlueprintForFeature,
  toBlueprintOptions,
} from '@/lib/blueprints/featureSelection';
import { configManager } from '@/lib/config/manager';
import {
  deleteLorebookPacket,
  getLorebookPacketFilename,
  importLorebookPacketText,
  listSavedLorebookPackets,
  parseLorebookPacket,
  saveLorebookPacket,
  type SavedLorebookPacketRecord,
} from '@/lib/lorebook-packets';
import { pickFile, saveBlobDownload } from '@/utils/download';
import { BlueprintPanel } from '../common/BlueprintPanel';
import { useAssistantScreenContext } from '../common/useAssistantContext';

const PAGE_FEATURE_CATEGORY: FeatureCategory = 'worldbook_generation';

interface LorebookGeneratorPanelProps {
  canPromote?: boolean;
  promotionStatusMessage?: string | null;
  onWorldPromoted?: (worldId: string) => void;
}

export default function LorebookGeneratorPanel({
  canPromote = false,
  promotionStatusMessage,
  onWorldPromoted,
}: LorebookGeneratorPanelProps) {
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [pendingDraftId, setPendingDraftId] = useState('');
  const [focus, setFocus] = useState('');
  const [promotionWorldName, setPromotionWorldName] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('idle');
  const [savedPackets, setSavedPackets] = useState<SavedLorebookPacketRecord[]>(() => listSavedLorebookPackets());
  const [activePacketId, setActivePacketId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBlueprintPath, setSelectedBlueprintPath] = useState<string>(
    () =>
      configManager.getConfig().feature_blueprints?.worldbook_generation || 'blueprints/system/lorebook_generator.md',
  );
  const [blueprintOverride, setBlueprintOverride] = useState<string | null>(null);

  const { data: draftsData, isLoading: draftsLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const { data: blueprintList, isLoading: blueprintLoading } = useQuery({
    queryKey: ['worldbook-generation-blueprints'],
    queryFn: () => api.getBlueprints(),
  });

  const blueprint = useMemo<Blueprint | null>(() => {
    if (!blueprintList) {
      return null;
    }

    return resolveBlueprintForFeature(blueprintList, PAGE_FEATURE_CATEGORY, selectedBlueprintPath);
  }, [blueprintList, selectedBlueprintPath]);

  const availableBlueprints = useMemo(
    () => (blueprintList ? toBlueprintOptions(getBlueprintsForFeature(blueprintList, PAGE_FEATURE_CATEGORY)) : []),
    [blueprintList],
  );

  const draftLookup = useMemo(
    () => new Map((draftsData?.drafts ?? []).map((draft) => [draft.review_id, draft] as const)),
    [draftsData],
  );

  const availableDrafts = useMemo(
    () => (draftsData?.drafts ?? []).filter((draft) => !selectedDraftIds.includes(draft.review_id)),
    [draftsData, selectedDraftIds],
  );

  const effectiveBlueprint = blueprintOverride ?? blueprint?.content;
  const parsedPacket = useMemo(() => parseLorebookPacket(output), [output]);

  const restoreKnownDraftIds = (draftIds: string[]) => draftIds.filter((draftId) => draftLookup.has(draftId));
  const effectivePromotionWorldName = promotionWorldName.trim() || parsedPacket.title;

  useAssistantScreenContext({
    lorebook_reference_count: selectedDraftIds.length,
    lorebook_focus: focus.slice(0, 240),
    lorebook_generating: isGenerating,
    lorebook_output_length: output.length,
    lorebook_stage: generationStage,
    lorebook_saved_count: savedPackets.length,
    lorebook_promotable: canPromote,
  });

  const resolveDraftIdsForLinkedDrafts = (linkedDrafts: string[]): string[] => {
    const normalizedLinkedDrafts = linkedDrafts.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
    const resolvedDraftIds: string[] = [];
    for (const draftId of selectedDraftIds) {
      const draft = draftLookup.get(draftId);
      const candidates = [draftId, draft?.character_name]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim().toLowerCase());

      if (candidates.some((candidate) => normalizedLinkedDrafts.includes(candidate))) {
        resolvedDraftIds.push(draftId);
      }
    }

    return resolvedDraftIds;
  };

  const handleAddDraft = () => {
    if (!pendingDraftId) {
      return;
    }

    setSelectedDraftIds((previous) => {
      if (previous.includes(pendingDraftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
        return previous;
      }

      return [...previous, pendingDraftId];
    });
    setPendingDraftId('');
  };

  const handleRemoveDraft = (draftId: string) => {
    setSelectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleGenerate = async () => {
    if (selectedDraftIds.length === 0 || !effectiveBlueprint) {
      return;
    }

    setOutput('');
    setError(null);
    setNotice(null);
    setIsGenerating(true);
    setGenerationStage('loading_references');
    setActivePacketId(null);

    try {
      const stream = api.generateLorebook({
        draft_ids: selectedDraftIds,
        focus: focus.trim() || undefined,
        blueprint_content: effectiveBlueprint,
        blueprint_path: selectedBlueprintPath,
      });

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
        setError(message);
        setNotice(null);
        setIsGenerating(false);
      });

      stream.onComplete_(() => {
        setIsGenerating(false);
        setGenerationStage('complete');
      });

      await stream.start();
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Lorebook generation failed');
      setNotice(null);
      setIsGenerating(false);
    }
  };

  const handleCopyOutput = async () => {
    if (!output.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setNotice('Lorebook packet copied to clipboard.');
      window.setTimeout(() => setCopied(false), 1600);
    } catch (copyError) {
      console.error('Failed to copy lorebook output:', copyError);
    }
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
      blueprintPath: selectedBlueprintPath,
      blueprintOverride,
    });
    const savedPacket = nextPackets[0];
    setSavedPackets(nextPackets);
    setActivePacketId(savedPacket?.id ?? null);
    setNotice(savedPacket ? `Saved packet: ${savedPacket.title}` : 'Lorebook packet saved locally.');
    setError(null);
  };

  const handlePromoteToWorld = async () => {
    if (!output.trim()) {
      return;
    }

    if (!canPromote) {
      setError(promotionStatusMessage || 'Persisted world promotion is currently only available in the desktop app.');
      return;
    }

    const worldName = effectivePromotionWorldName.trim();
    if (!worldName) {
      setError('A world name is required before promoting this packet.');
      return;
    }

    setIsPromoting(true);
    setError(null);
    setNotice(null);

    try {
      const worldTags = Array.from(
        new Set(parsedPacket.entries.flatMap((entry) => [entry.type, ...entry.keywords])),
      ).slice(0, 12);
      const { world } = await api.createWorld({
        name: worldName,
        description: parsedPacket.scope,
        notes: output,
        tags: worldTags,
      });

      const characterEntries = parsedPacket.entries.filter((entry) => entry.type === 'character');
      for (const entry of characterEntries) {
        const linkedDraftIds = resolveDraftIdsForLinkedDrafts(entry.linkedDrafts);
        await api.addWorldCharacter(world.id, {
          draftId: linkedDraftIds[0],
          characterName: entry.title,
          role: entry.continuityRole || undefined,
          notes: [entry.summary, entry.content].filter(Boolean).join('\n\n') || undefined,
        });
      }

      const factionEntries = parsedPacket.entries.filter((entry) => entry.type === 'faction');
      for (const entry of factionEntries) {
        await api.addWorldFaction(world.id, {
          name: entry.title,
          description: entry.summary || undefined,
          role: entry.continuityRole || undefined,
          notes: entry.content || undefined,
          tags: [entry.type, ...entry.keywords].slice(0, 10),
          draftIds: resolveDraftIdsForLinkedDrafts(entry.linkedDrafts),
        });
      }

      const locationEntries = parsedPacket.entries.filter((entry) => entry.type === 'place');
      for (const entry of locationEntries) {
        await api.addWorldLocation(world.id, {
          name: entry.title,
          description: entry.summary || undefined,
          category: entry.continuityRole || undefined,
          notes: entry.content || undefined,
          tags: [entry.type, ...entry.keywords].slice(0, 10),
          draftIds: resolveDraftIdsForLinkedDrafts(entry.linkedDrafts),
        });
      }

      const eventEntries = parsedPacket.entries.filter((entry) => entry.type === 'event' || entry.type === 'moment');
      if (eventEntries.length > 0) {
        const { timeline } = await api.createTimeline({
          worldId: world.id,
          name: 'Canon Events',
          description: 'Generated from a lorebook packet promotion.',
          tags: ['canon', 'lorebook'],
        });

        for (const [index, entry] of eventEntries.entries()) {
          await api.addTimelineEvent(timeline.id, {
            title: entry.title,
            description: [entry.summary, entry.content].filter(Boolean).join('\n\n') || undefined,
            sortOrder: index,
            tags: [entry.type, ...entry.keywords].slice(0, 10),
            metadata: {
              linkedDrafts: entry.linkedDrafts,
              continuityRole: entry.continuityRole || undefined,
            },
          });
        }
      }

      setNotice(`Promoted packet to world: ${world.name}`);
      onWorldPromoted?.(world.id);
    } catch (promotionError) {
      setError(
        promotionError instanceof Error ? promotionError.message : 'Failed to promote lorebook packet into a world',
      );
    } finally {
      setIsPromoting(false);
    }
  };

  const handleLoadPacket = (packet: SavedLorebookPacketRecord) => {
    setOutput(packet.content);
    const restoredDraftIds = restoreKnownDraftIds(packet.draftIds);
    setSelectedDraftIds(restoredDraftIds);
    setFocus(packet.focus ?? '');
    setPromotionWorldName(packet.title);
    if (packet.blueprintPath) {
      setSelectedBlueprintPath(packet.blueprintPath);
    }
    setBlueprintOverride(packet.blueprintOverride ?? null);
    setActivePacketId(packet.id);
    setGenerationStage('loaded');
    setNotice(
      restoredDraftIds.length === packet.draftIds.length
        ? `Loaded saved packet: ${packet.title}`
        : `Loaded saved packet: ${packet.title}. Some source draft identifiers could not be matched to current saved drafts.`,
    );
    setError(null);
  };

  const handleDeletePacket = (packetId: string) => {
    const nextPackets = deleteLorebookPacket(packetId);
    setSavedPackets(nextPackets);
    if (activePacketId === packetId) {
      setActivePacketId(null);
    }
    setNotice('Saved lorebook packet deleted.');
  };

  const handleDownloadPacket = async (extension: 'md' | 'txt') => {
    if (!output.trim()) {
      return;
    }

    const activeTitle = savedPackets.find((packet) => packet.id === activePacketId)?.title || 'Lorebook Packet';
    const blob = new Blob([output], { type: extension === 'md' ? 'text/markdown' : 'text/plain' });
    await saveBlobDownload(blob, getLorebookPacketFilename(activeTitle, extension), blob.type);
    setNotice(`Lorebook packet sent to ${extension.toUpperCase()} download flow.`);
  };

  const handleImportPacket = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const nextPackets = importLorebookPacketText({
        content: text,
        blueprintPath: selectedBlueprintPath,
        blueprintOverride,
      });
      const importedPacket = nextPackets[0];
      setSavedPackets(nextPackets);
      setOutput(importedPacket.content);
      const restoredDraftIds = restoreKnownDraftIds(importedPacket.draftIds);
      setSelectedDraftIds(restoredDraftIds);
      setFocus(importedPacket.focus ?? '');
      setPromotionWorldName(importedPacket.title);
      setActivePacketId(importedPacket.id);
      setGenerationStage('imported');
      setError(null);
      setNotice(
        restoredDraftIds.length === importedPacket.draftIds.length
          ? `Imported lorebook packet: ${importedPacket.title}`
          : `Imported lorebook packet: ${importedPacket.title}. Source drafts were recorded, but some could not be restored to active selections.`,
      );
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Failed to import lorebook packet');
      setNotice(null);
    }
  };

  const handlePickImportPacket = async () => {
    const file = await pickFile({ accept: '.md,.txt,text/markdown,text/plain' }, fileInputRef.current);
    await handleImportPacket(file);
  };

  return (
    <section className="space-y-6">
      <div className="app-panel p-4 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white shadow-lg shadow-emerald-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lorebook Generator</h2>
            <p className="text-sm text-muted-foreground">
              Generate a connected lorebook/worldbook packet from existing drafts instead of creating a new character.
            </p>
          </div>
        </div>

        {effectiveBlueprint && !blueprintLoading && blueprint && (
          <BlueprintPanel
            blueprintName={selectedBlueprintPath}
            blueprintContent={effectiveBlueprint}
            title="Lorebook Blueprint"
            description={blueprint.description}
            editable
            availableBlueprints={availableBlueprints}
            onBlueprintSelect={(path) => {
              setSelectedBlueprintPath(path);
              setBlueprintOverride(null);
            }}
            onContentChange={setBlueprintOverride}
            defaultExpanded={false}
          />
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Reference drafts</label>
              <p className="mb-3 text-xs text-muted-foreground">
                Select the drafts that should define shared canon. Best results come from drafts that already imply
                overlapping people, places, debts, incidents, or faction pressure.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={pendingDraftId}
                  onChange={(event) => setPendingDraftId(event.target.value)}
                  disabled={
                    isGenerating ||
                    draftsLoading ||
                    availableDrafts.length === 0 ||
                    selectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
                  }
                  aria-label="Lorebook reference draft"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Add a saved draft...</option>
                  {availableDrafts.map((draft) => (
                    <option key={draft.review_id} value={draft.review_id}>
                      {draft.character_name || draft.review_id}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddDraft}
                  disabled={
                    !pendingDraftId || isGenerating || selectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add reference
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {selectedDraftIds.length} reference draft{selectedDraftIds.length === 1 ? '' : 's'} selected
              </div>
              {selectedDraftIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedDraftIds.map((draftId) => (
                    <span
                      key={draftId}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {draftLookup.get(draftId)?.character_name || draftId}
                      <button
                        type="button"
                        onClick={() => handleRemoveDraft(draftId)}
                        disabled={isGenerating}
                        aria-label={`Remove ${draftLookup.get(draftId)?.character_name || draftId}`}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No drafts selected yet.</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Optional focus</label>
              <textarea
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                disabled={isGenerating}
                placeholder="Examples: extract faction pressure and recurring port locations; emphasize shared incidents and rival houses; focus on connected moments around the checkpoint fire."
                className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Promotion world name</label>
              <input
                value={promotionWorldName}
                onChange={(event) => setPromotionWorldName(event.target.value)}
                disabled={isGenerating || isPromoting}
                placeholder={parsedPacket.title || 'World name'}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used when promoting this packet into a persisted world. Defaults to the packet title.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating || selectedDraftIds.length === 0 || !effectiveBlueprint}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? 'Generating lorebook…' : 'Generate Lorebook Packet'}
              </button>
              <span className="text-xs text-muted-foreground">
                Uses up to {MAX_CONNECTED_DRAFT_REFERENCES} reference drafts. Save locally or promote into a persisted
                world when sync is available.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handlePromoteToWorld()}
                disabled={isGenerating || isPromoting || !output.trim() || !canPromote}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isPromoting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
                {isPromoting ? 'Promoting world…' : 'Promote to persisted world'}
              </button>
              {!canPromote && (
                <span className="text-xs text-muted-foreground">
                  {promotionStatusMessage || 'Open the desktop app to persist worlds from this packet.'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSavePacket}
                disabled={!output.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {activePacketId ? 'Update saved packet' : 'Save locally'}
              </button>
              <button
                type="button"
                onClick={() => void handlePickImportPacket()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent"
              >
                <Upload className="h-3.5 w-3.5" />
                Import .md/.txt
              </button>
              <button
                type="button"
                onClick={() => void handleDownloadPacket('md')}
                disabled={!output.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download .md
              </button>
              <button
                type="button"
                onClick={() => void handleDownloadPacket('txt')}
                disabled={!output.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download .txt
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                className="hidden"
                aria-label="Import lorebook packet"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {notice && !error && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                {notice}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Generated packet</h3>
                <p className="text-xs text-muted-foreground">Stage: {generationStage.replace(/_/g, ' ')}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyOutput()}
                disabled={!output.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy output'}
              </button>
            </div>
            <textarea
              value={output}
              onChange={(event) => setOutput(event.target.value)}
              placeholder="Generated lorebook/worldbook output will appear here."
              className="min-h-[520px] w-full rounded-2xl border border-input bg-background px-3 py-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Saved packets</h4>
                  <p className="text-xs text-muted-foreground">
                    Stored locally in this browser until world persistence lands.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{savedPackets.length} saved</span>
              </div>
              {savedPackets.length > 0 ? (
                <div className="space-y-2">
                  {savedPackets.map((packet) => (
                    <div key={packet.id} className="rounded-xl border border-border/60 bg-background px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-foreground">{packet.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {packet.draftIds.length} refs • updated {new Date(packet.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadPacket(packet)}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePacket(packet.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No saved lorebook packets yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
