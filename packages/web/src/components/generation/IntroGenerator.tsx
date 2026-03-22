import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquarePlus,
  Loader2,
  Save,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Trash2,
  Star,
  Bookmark,
  Download,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { GenerationService } from '@/lib/services/generation';
import type { Draft, Template } from '@char-gen/shared';

interface IntroGeneratorProps {
  templates: Template[];
}

interface SavedIntro {
  id: string;
  content: string;
  timestamp: number;
}

// Export all intros as a markdown file
const exportIntrosAsMarkdown = (
  characterName: string,
  savedIntros: SavedIntro[],
  activeIntroContent: string | undefined
) => {
  const lines: string[] = [
    `# Intro Scenes for ${characterName}`,
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total intros: ${savedIntros.length}`,
    '',
    '---',
    '',
  ];

  if (activeIntroContent) {
    lines.push('## Currently Active Intro Scene', '');
    lines.push('```');
    lines.push(activeIntroContent);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  savedIntros.forEach((intro, index) => {
    const date = new Date(intro.timestamp).toLocaleString();
    lines.push(`## Intro Scene #${index + 1}`);
    lines.push(`*Created: ${date}*`);
    lines.push('');
    lines.push('```');
    lines.push(intro.content);
    lines.push('```');
    lines.push('');
    if (index < savedIntros.length - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export all intros as JSON
const exportIntrosAsJson = (
  characterName: string,
  savedIntros: SavedIntro[],
  activeIntroContent: string | undefined
) => {
  const data = {
    character_name: characterName,
    exported_at: new Date().toISOString(),
    active_intro: activeIntroContent || null,
    saved_intros: savedIntros.map(intro => ({
      id: intro.id,
      content: intro.content,
      created_at: new Date(intro.timestamp).toISOString(),
    })),
  };

  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function IntroGenerator({ templates }: IntroGeneratorProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState('');
  const [generatedIntros, setGeneratedIntros] = useState<SavedIntro[]>([]);
  const [expandedIntros, setExpandedIntros] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  const queryClient = useQueryClient();

  // Fetch all drafts for selection
  const { data: draftsResponse } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  // Fetch selected draft details
  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ['draft', selectedDraftId],
    queryFn: () => api.getDraft(selectedDraftId),
    enabled: !!selectedDraftId,
  });

  // Get template for the selected draft
  const draftTemplate = useMemo(() => {
    if (!draft || !templates.length) return undefined;
    return templates.find((t) => t.name === draft.metadata.template_name);
  }, [draft, templates]);

  // Load saved intros from draft metadata
  const savedIntros = useMemo((): SavedIntro[] => {
    if (!draft?.metadata.notes) return [];
    try {
      // Parse saved intros from notes (stored as JSON)
      const notes = draft.metadata.notes;
      const match = notes.match(/\[SAVED_INTROS\]([\s\S]*?)\[\/SAVED_INTROS\]/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  }, [draft]);

  // Update asset mutation
  const updateAsset = useMutation({
    mutationFn: ({ assetName, content }: { assetName: string; content: string }) =>
      api.updateAsset(selectedDraftId, assetName, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
    },
  });

  // Update metadata mutation
  const updateMetadata = useMutation({
    mutationFn: (metadata: Record<string, unknown>) =>
      api.updateMetadata(selectedDraftId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
    },
  });

  // Toggle intro expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedIntros((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Generate new intro
  const generateIntro = useCallback(async () => {
    if (!draft || !draftTemplate || isGenerating) return;

    setIsGenerating(true);
    setGeneratingContent('');

    // Get prior assets (everything except intro_scene)
    const priorAssets: Record<string, string> = {};
    for (const [name, content] of Object.entries(draft.assets)) {
      if (name !== 'intro_scene') {
        priorAssets[name] = content;
      }
    }

    // Add custom instructions if provided
    const enhancedSeed = customInstructions.trim()
      ? `${draft.metadata.seed}\n\nAdditional intro instructions: ${customInstructions.trim()}`
      : draft.metadata.seed;

    try {
      let fullContent = '';

      for await (const progress of GenerationService.generateAsset({
        seed: enhancedSeed,
        mode: draft.metadata.mode,
        template: draft.metadata.template_name,
        asset_name: 'intro_scene',
        prior_assets: priorAssets,
      })) {
        if (progress.type === 'chunk' && progress.content) {
          fullContent += progress.content;
          setGeneratingContent(fullContent);
        } else if (progress.type === 'asset' && progress.content) {
          fullContent = progress.content;
          setGeneratingContent(fullContent);
        }
      }

      if (fullContent) {
        const newIntro: SavedIntro = {
          id: `intro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          content: fullContent,
          timestamp: Date.now(),
        };
        setGeneratedIntros((prev) => [newIntro, ...prev]);
      }
    } catch (error) {
      console.error('Intro generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingContent('');
    }
  }, [draft, draftTemplate, isGenerating, customInstructions]);

  // Generate multiple intros
  const generateMultipleIntros = useCallback(async (count: number) => {
    for (let i = 0; i < count; i++) {
      await generateIntro();
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }, [generateIntro]);

  // Save intro to draft collection
  const saveToIntroCollection = useCallback(async (intro: SavedIntro) => {
    if (!draft) return;

    // Add to saved intros (avoid duplicates)
    const newSavedIntros = [...savedIntros];
    if (!newSavedIntros.find(i => i.id === intro.id)) {
      newSavedIntros.unshift(intro);
    }

    // Store in notes field as JSON
    const introsJson = JSON.stringify(newSavedIntros);
    const existingNotes = draft.metadata.notes || '';
    const notesWithoutIntros = existingNotes.replace(/\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g, '').trim();
    const newNotes = `${notesWithoutIntros}\n\n[SAVED_INTROS]${introsJson}[/SAVED_INTROS]`.trim();

    try {
      await updateMetadata.mutateAsync({ notes: newNotes });
      // Remove from generated list
      setGeneratedIntros((prev) => prev.filter((i) => i.id !== intro.id));
    } catch (error) {
      console.error('Failed to save intro to collection:', error);
    }
  }, [draft, savedIntros, updateMetadata]);

  // Set intro as active (write to intro_scene asset)
  const setAsActive = useCallback(async (intro: SavedIntro) => {
    if (!draft) return;

    try {
      await updateAsset.mutateAsync({ assetName: 'intro_scene', content: intro.content });
    } catch (error) {
      console.error('Failed to set active intro:', error);
    }
  }, [draft, updateAsset]);

  // Delete saved intro from collection
  const deleteSavedIntro = useCallback(async (introId: string) => {
    if (!draft) return;

    const newSavedIntros = savedIntros.filter(i => i.id !== introId);
    const introsJson = JSON.stringify(newSavedIntros);
    const existingNotes = draft.metadata.notes || '';
    const notesWithoutIntros = existingNotes.replace(/\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g, '').trim();
    const newNotes = newSavedIntros.length > 0
      ? `${notesWithoutIntros}\n\n[SAVED_INTROS]${introsJson}[/SAVED_INTROS]`.trim()
      : notesWithoutIntros;

    try {
      await updateMetadata.mutateAsync({ notes: newNotes });
    } catch (error) {
      console.error('Failed to delete intro:', error);
    }
  }, [draft, savedIntros, updateMetadata]);

  // Delete generated intro
  const deleteGeneratedIntro = useCallback((id: string) => {
    setGeneratedIntros((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Handle draft selection
  const handleDraftSelect = useCallback((draftId: string) => {
    setSelectedDraftId(draftId);
    setGeneratedIntros([]);
    setExpandedIntros(new Set());
    setCustomInstructions('');
  }, []);

  // Filter drafts that have templates supporting intro generation
  const eligibleDrafts = useMemo(() => {
    if (!draftsResponse?.drafts) return [];
    return draftsResponse.drafts.filter((d) => {
      const template = templates.find((t) => t.name === d.template_name);
      return template?.assets.some((a) => a.name === 'intro_scene');
    });
  }, [draftsResponse, templates]);

  // Check if intro matches current active intro_scene
  const isActiveIntro = useCallback((intro: SavedIntro) => {
    return draft?.assets.intro_scene === intro.content;
  }, [draft?.assets.intro_scene]);

  // Render an intro card
  const renderIntroCard = (intro: SavedIntro, index: number, isSaved: boolean) => {
    const isExpanded = expandedIntros.has(intro.id);
    const isCopied = copiedId === intro.id;
    const isActive = isActiveIntro(intro);

    return (
      <div
        key={intro.id}
        className={`rounded-xl border ${
          isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50'
        }`}
      >
        {/* Header */}
        <button
          onClick={() => toggleExpand(intro.id)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">
              Intro #{index + 1}
            </span>
            {isActive && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Star className="h-3 w-3 fill-primary" />
                active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {new Date(intro.timestamp).toLocaleTimeString()}
            <span>•</span>
            {intro.content.length} chars
          </div>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="border-t border-border/50 p-4 space-y-3">
            <div className="max-h-80 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
              {intro.content}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(intro.id, intro.content)}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>

              {!isSaved && (
                <button
                  onClick={() => void saveToIntroCollection(intro)}
                  disabled={updateMetadata.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 disabled:opacity-50"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Keep
                </button>
              )}

              <button
                onClick={() => void setAsActive(intro)}
                disabled={updateAsset.isPending || isActive}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" />
                {isActive ? 'Active' : 'Set Active'}
              </button>

              <button
                onClick={() => isSaved ? void deleteSavedIntro(intro.id) : deleteGeneratedIntro(intro.id)}
                disabled={isSaved && updateMetadata.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Draft Selector */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <MessageSquarePlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Generate Intro Scenes</h3>
            <p className="text-sm text-muted-foreground">
              Create and curate intro scenes for an existing character
            </p>
          </div>
        </div>

        <select
          value={selectedDraftId}
          onChange={(e) => handleDraftSelect(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a draft...</option>
          {eligibleDrafts.map((d) => (
            <option key={d.review_id} value={d.review_id}>
              {d.character_name || d.seed} ({d.template_name || 'default'})
            </option>
          ))}
        </select>

        {draftsResponse?.drafts && eligibleDrafts.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            No drafts with intro-capable templates found.
          </p>
        )}
      </div>

      {/* Loading State */}
      {draftLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading draft...</span>
        </div>
      )}

      {/* Draft Content */}
      {draft && !draftLoading && (
        <div className="space-y-6">
          {/* Draft Header */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{draft.metadata.character_name || draft.metadata.seed}</h2>
                <p className="text-sm text-muted-foreground">{draft.metadata.seed}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.metadata.mode && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {draft.metadata.mode}
                  </span>
                )}
                {draft.metadata.template_name && (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    {draft.metadata.template_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Instructions (optional)</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., Make it more romantic, start with action, focus on mystery..."
                className="w-full min-h-[80px] rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isGenerating}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Count:</label>
                <select
                  value={generationCount}
                  onChange={(e) => setGenerationCount(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  disabled={isGenerating}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <button
                onClick={() => void generateMultipleIntros(generationCount)}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate {generationCount} Intro{generationCount > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Currently Generating */}
          {isGenerating && generatingContent && (
            <div className="rounded-xl border border-primary/50 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Generating intro...</span>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                {generatingContent}
              </div>
            </div>
          )}

          {/* Saved Intros */}
          {savedIntros.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Saved Intros ({savedIntros.length})</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportIntrosAsMarkdown(
                      draft.metadata.character_name || draft.metadata.seed,
                      savedIntros,
                      draft.assets.intro_scene
                    )}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Export MD
                  </button>
                  <button
                    onClick={() => exportIntrosAsJson(
                      draft.metadata.character_name || draft.metadata.seed,
                      savedIntros,
                      draft.assets.intro_scene
                    )}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON
                  </button>
                </div>
              </div>
              {savedIntros.map((intro, index) => renderIntroCard(intro, index, true))}
            </div>
          )}

          {/* Generated Intros (not yet saved) */}
          {generatedIntros.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Intros ({generatedIntros.length})</h3>
                <button
                  onClick={() => setGeneratedIntros([])}
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Discard All
                </button>
              </div>
              {generatedIntros.map((intro, index) => renderIntroCard(intro, index, false))}
            </div>
          )}

          {/* Empty State */}
          {savedIntros.length === 0 && generatedIntros.length === 0 && !isGenerating && (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <MessageSquarePlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No intros yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate intros above. Click "Keep" to save them to the draft for curation,
                or "Set Active" to use one immediately.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
