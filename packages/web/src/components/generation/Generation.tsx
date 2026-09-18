import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, XCircle, Loader2, Edit3, FileText, Upload, Users, Plus, X } from 'lucide-react';
import {
  MAX_CONNECTED_DRAFT_REFERENCES,
  type ContentMode,
  type FeatureCategory,
  type GenerationComplete,
  type ImportedCharacter,
  type Template,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import type { Blueprint } from '@char-gen/shared';
import {
  clearActiveGenerationSession,
  loadActiveGenerationSession,
} from '@/lib/services/generation-session';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import GenerationProgress from './GenerationProgress';
import DraftRefiner from './DraftRefiner';
import AssetRegenerator from '../drafts/AssetRegenerator';
import { BlueprintPanel } from '../common/BlueprintPanel';
import CollapsibleSection from '../common/CollapsibleSection';
import { getBlueprintsForFeature, resolveBlueprintForFeature, toBlueprintOptions } from '@/lib/blueprints/featureSelection';
import { configManager } from '@/lib/config/manager';
import ImportCharacterModal from '../common/ImportCharacterModal';
import { normalizeConnectedReferenceIds } from '@/lib/prompting/reference-context';

type TabId = 'generate' | 'refine' | 'assets';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'generate', label: 'New Draft', icon: Sparkles },
  { id: 'refine', label: 'Refine Draft', icon: Edit3 },
  { id: 'assets', label: 'Assets', icon: FileText },
];

const FEATURE_PREFERRED_PATHS: Partial<Record<FeatureCategory, string>> = {
  orchestration: 'blueprints/system/generator.md',
  intro_scene_generation: 'blueprints/system/intro_scene.md',
};

function getInitialGenerationBlueprintPaths(): Partial<Record<FeatureCategory, string>> {
  const configured = configManager.getConfig().feature_blueprints;

  return {
    orchestration: configured?.orchestration || FEATURE_PREFERRED_PATHS.orchestration,
    intro_scene_generation: configured?.intro_scene_generation || FEATURE_PREFERRED_PATHS.intro_scene_generation,
  };
}

function getDefaultSelectedTemplateAssets(templateDefinition?: Template): string[] {
  if (!templateDefinition) {
    return [];
  }

  return templateDefinition.assets
    .filter((asset) => {
      if (asset.required) {
        return true;
      }

      // Keep these optional by default for the built-in generation flow.
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
  const requiredNames = new Set(
    templateDefinition.assets.filter((asset) => asset.required).map((asset) => asset.name)
  );
  const selected = new Set<string>();

  selection.forEach((name) => {
    if (templateAssetNames.has(name)) {
      selected.add(name);
    }
  });

  requiredNames.forEach((name) => selected.add(name));

  return templateDefinition.assets
    .map((asset) => asset.name)
    .filter((name) => selected.has(name));
}

export default function Generation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const [seed, setSeed] = useState('');
  const [mode, setMode] = useState<ContentMode>('NSFW');
  const [template, setTemplate] = useState('');
  const [selectedConnectedDraftIds, setSelectedConnectedDraftIds] = useState<string[]>([]);
  const [pendingConnectedDraftId, setPendingConnectedDraftId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [importedCharacter, setImportedCharacter] = useState<Pick<ImportedCharacter, 'name' | 'sourceFormat' | 'sourcePreset' | 'assets'> | null>(null);
  const [importedTemplateName, setImportedTemplateName] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(true);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [selectedBlueprintPaths, setSelectedBlueprintPaths] = useState<Partial<Record<FeatureCategory, string>>>(
    () => getInitialGenerationBlueprintPaths()
  );
  const [blueprintOverrides, setBlueprintOverrides] = useState<Partial<Record<FeatureCategory, string>>>({});
  const [availableBlueprints, setAvailableBlueprints] = useState<Array<{ name: string; label: string }>>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTemplateAssets, setSelectedTemplateAssets] = useState<string[]>([]);

  const activeFeatureCategory = useMemo<FeatureCategory | null>(() => {
    if (activeTab === 'generate') {
      return 'orchestration';
    }
    return null;
  }, [activeTab]);

  const selectedBlueprintPathForActiveFeature = useMemo(() => {
    if (!activeFeatureCategory) {
      return undefined;
    }

    return selectedBlueprintPaths[activeFeatureCategory] || FEATURE_PREFERRED_PATHS[activeFeatureCategory];
  }, [activeFeatureCategory, selectedBlueprintPaths]);

  useEffect(() => {
    if (!activeFeatureCategory) {
      setBlueprint(null);
      setAvailableBlueprints([]);
      setBlueprintError(null);
      setBlueprintLoading(false);
      return;
    }

    setBlueprintLoading(true);
    (async () => {
      try {
        const list = await api.getBlueprints();
        const matching = getBlueprintsForFeature(list, activeFeatureCategory);
        setAvailableBlueprints(toBlueprintOptions(matching));

        const resolved = resolveBlueprintForFeature(
          list,
          activeFeatureCategory,
          selectedBlueprintPathForActiveFeature
        );

        if (resolved) {
          setBlueprint(resolved);
          setSelectedBlueprintPaths((previous) => {
            if (previous[activeFeatureCategory] === resolved.path) {
              return previous;
            }

            return {
              ...previous,
              [activeFeatureCategory]: resolved.path,
            };
          });
          setBlueprintError(null);
        } else {
          setBlueprintError('Blueprint could not be resolved from feature_category metadata.');
        }
      } catch (error) {
        console.error('Failed to load page blueprint:', error);
        setBlueprintError('Failed to load page blueprint.');
      } finally {
        setBlueprintLoading(false);
      }
    })();
  }, [activeFeatureCategory, selectedBlueprintPathForActiveFeature]);

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const { data: draftsData, isLoading: draftsLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  useEffect(() => {
    if (!template && templates.length > 0) {
      setTemplate(templates[0].name);
    }
  }, [template, templates]);

  const selectedTemplate = templates.find((availableTemplate: Template) => availableTemplate.name === template);
  const optionalTemplateAssets = useMemo(
    () => selectedTemplate?.assets.filter((asset) => !asset.required) ?? [],
    [selectedTemplate]
  );
  const connectedDraftLookup = useMemo(
    () => new Map((draftsData?.drafts ?? []).map((draft) => [draft.review_id, draft] as const)),
    [draftsData]
  );
  const availableConnectedDrafts = useMemo(
    () => (draftsData?.drafts ?? []).filter((draft) => !selectedConnectedDraftIds.includes(draft.review_id)),
    [draftsData, selectedConnectedDraftIds]
  );

  useAssistantScreenContext({
    seed_preview: seed.slice(0, 200),
    mode,
    template_name: template || null,
    is_generating: isGenerating,
    generation_error: generationError,
    available_templates: templates.length,
    connected_reference_count: selectedConnectedDraftIds.length,
    imported_asset_count: importedCharacter ? Object.keys(importedCharacter.assets).length : 0,
  });

  useEffect(() => {
    const nextSeed = (location.state as { seed?: string } | null)?.seed;
    if (nextSeed) {
      setSeed(nextSeed);
    }
  }, [location.state]);

  useEffect(() => {
    const session = loadActiveGenerationSession();
    if (!session) {
      return;
    }

    setSeed(session.seed);
    setMode(session.mode);
    setTemplate(session.template || '');
    setSelectedConnectedDraftIds(normalizeConnectedReferenceIds(session.connectedDraftIds));
    setImportedCharacter(session.importedCharacter ?? null);
    setImportedTemplateName(session.importedCharacter?.templateName ?? null);
    setSelectedTemplateAssets(session.selectedAssets ?? []);
    setGenerationError(null);
    setResumeNotice('Restored an interrupted generation session.');
    setIsGenerating(true);
  }, []);

  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplateAssets([]);
      return;
    }

    setSelectedTemplateAssets((previous) => {
      const hasTemplateAwareSelection = previous.length > 0;
      if (!hasTemplateAwareSelection) {
        return getDefaultSelectedTemplateAssets(selectedTemplate);
      }

      return normalizeAssetSelection(previous, selectedTemplate);
    });
  }, [selectedTemplate]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  const handleGenerate = () => {
    if (!seed.trim()) return;

    if (importedCharacter && importedTemplateName && selectedTemplate?.name && importedTemplateName !== selectedTemplate.name) {
      setGenerationError(`Imported source was mapped for ${importedTemplateName}. Re-import it after switching to ${selectedTemplate.name}.`);
      return;
    }

    clearActiveGenerationSession();
    setGenerationError(null);
    setResumeNotice(null);
    setIsGenerating(true);
  };

  const handleAddConnectedDraft = () => {
    if (!pendingConnectedDraftId) {
      return;
    }

    setSelectedConnectedDraftIds((previous) => {
      if (previous.includes(pendingConnectedDraftId) || previous.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
        return previous;
      }

      return [...previous, pendingConnectedDraftId];
    });
    setPendingConnectedDraftId('');
  };

  const handleRemoveConnectedDraft = (draftId: string) => {
    setSelectedConnectedDraftIds((previous) => previous.filter((candidate) => candidate !== draftId));
  };

  const handleToggleOptionalAsset = useCallback((assetName: string) => {
    if (!selectedTemplate) {
      return;
    }

    const requiredAsset = selectedTemplate.assets.find((asset) => asset.name === assetName)?.required;
    if (requiredAsset) {
      return;
    }

    setSelectedTemplateAssets((previous) => {
      const nextSet = new Set(previous);
      if (nextSet.has(assetName)) {
        nextSet.delete(assetName);
      } else {
        nextSet.add(assetName);
      }

      return normalizeAssetSelection(Array.from(nextSet), selectedTemplate);
    });
  }, [selectedTemplate]);

  const handleComplete = useCallback((data: GenerationComplete) => {
    clearActiveGenerationSession();
    setIsGenerating(false);
    setResumeNotice(null);
    if (data.draft_id) {
      navigate(`/drafts/${encodeURIComponent(data.draft_id)}`);
      return;
    }
    navigate('/drafts');
  }, [navigate]);

  const handleError = useCallback((error: string) => {
    clearActiveGenerationSession();
    setGenerationError(error);
    setResumeNotice(null);
    setIsGenerating(false);
  }, []);

  const handleCancel = useCallback(() => {
    clearActiveGenerationSession();
    setResumeNotice(null);
    setIsGenerating(false);
  }, []);

  const MODE_OPTIONS: { value: ContentMode; label: string; color: string }[] = [
    { value: 'SFW', label: 'Safe For Work', color: 'from-emerald-500 to-green-500' },
    { value: 'NSFW', label: 'Not Safe For Work', color: 'from-violet-500 to-purple-500' },
    { value: 'Platform-Safe', label: 'Platform Safe', color: 'from-amber-500 to-orange-500' },
    { value: 'Auto', label: 'Auto Detect', color: 'from-slate-500 to-gray-500' },
  ];

  const selectedBlueprintPath = activeFeatureCategory ? selectedBlueprintPaths[activeFeatureCategory] || '' : '';
  const activeBlueprintOverride = activeFeatureCategory ? blueprintOverrides[activeFeatureCategory] : undefined;
  const effectiveGenerationBlueprint = activeBlueprintOverride ?? blueprint?.content;

  const handleBlueprintSelect = async (path: string) => {
    if (!activeFeatureCategory) {
      return;
    }

    try {
      const nextBlueprint = await api.getBlueprint(path);
      setBlueprint(nextBlueprint);
      setSelectedBlueprintPaths((previous) => ({
        ...previous,
        [activeFeatureCategory]: path,
      }));
      setBlueprintOverrides((previous) => {
        const next = { ...previous };
        delete next[activeFeatureCategory];
        return next;
      });
      setBlueprintError(null);
    } catch (error) {
      console.error('Failed to switch blueprint:', error);
      setBlueprintError('Failed to switch selected blueprint.');
    }
  };

  const handleBlueprintContentChange = (content: string) => {
    if (!activeFeatureCategory) {
      return;
    }

    setBlueprintOverrides((previous) => ({
      ...previous,
      [activeFeatureCategory]: content,
    }));
  };

  const handleImportCharacter = useCallback((character: ImportedCharacter) => {
    setImportedCharacter({
      name: character.name,
      sourceFormat: character.sourceFormat,
      sourcePreset: character.sourcePreset,
      assets: character.assets,
    });
    setImportedTemplateName(selectedTemplate?.name ?? null);
    setSeed((previous) => previous.trim() || character.name);
    setGenerationError(null);
    setResumeNotice('Imported character source loaded. Rehash will use the imported assets as structured source material.');
    setShowImportModal(false);
  }, [selectedTemplate?.name]);

  const clearImportedCharacter = useCallback(() => {
    setImportedCharacter(null);
    setImportedTemplateName(null);
    setResumeNotice(null);
  }, []);

  const blueprintPanelTitle = 'Orchestration Blueprint';

  return (
    <div className="app-page space-y-8 pb-10 sm:space-y-12 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4 sm:space-y-5">
            <p className="app-page-eyebrow">Generate</p>
            <div className="space-y-3">
              <h1 className="app-page-title">Build a draft</h1>
              <p className="app-page-summary">
                Set the seed, pick the template, then run the pass.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link to="/templates" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary sm:justify-start">
                <BookOpen className="h-4 w-4" />
                Review templates
              </Link>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/20 sm:justify-start"
              >
                <Upload className="h-4 w-4" />
                Import character
              </button>
            </div>
          </div>

          <div className="app-panel-muted p-3.5 sm:p-5">
            <p className="app-page-eyebrow">Current setup</p>
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              <span className="app-pill app-pill-muted">{template || 'Pending template'}</span>
              <span className="app-pill app-pill-muted">{mode}</span>
              <span className="app-pill app-pill-muted">{selectedTemplate?.assets.length ?? '--'} assets</span>
              <span className="app-pill app-pill-muted">{selectedConnectedDraftIds.length} refs</span>
            </div>
            <div className="mt-4 hidden sm:grid app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Template</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">{template || 'Pending'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-2xl">{mode}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Assets</p>
                <div className="app-page-metric-value text-2xl">{selectedTemplate?.assets.length ?? '--'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">References</p>
                <div className="app-page-metric-value text-2xl">{selectedConnectedDraftIds.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-1 sm:justify-center">
        <div className="app-tab-group min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-active={isActive ? 'true' : 'false'}
                className="app-tab-button"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'refine' ? (
        <DraftRefiner templates={templates} />
      ) : activeTab === 'assets' ? (
        <AssetRegenerator
          templates={templates}
          enableDraftSelection
          enableAssetSelection
          embedded
        />
      ) : (
        <>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Seed Input Section */}
        <section className="space-y-3">
          <div data-tour-anchor="generation-seed">
          <CollapsibleSection
            title="Seed"
            subtitle="Start with one compact premise"
            preview={seed.trim() ? `${seed.trim().slice(0, 120)}${seed.trim().length > 120 ? '...' : ''}` : 'No seed yet'}
            defaultExpanded
            className="app-panel"
            bodyClassName="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter a seed</label>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g., a lonely space pirate searching for redemption"
                className="mt-1.5 min-h-28 w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none sm:min-h-32"
              />
              <div className="flex items-center gap-2">
                <Link
                  to="/seed-generator"
                  className="text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  Open Seed Generator
                </Link>
              </div>
            </div>

            {importedCharacter && (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">Imported source loaded</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {importedCharacter.name} · {importedCharacter.sourcePreset || importedCharacter.sourceFormat} · {Object.keys(importedCharacter.assets).length} mapped asset{Object.keys(importedCharacter.assets).length === 1 ? '' : 's'}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {importedTemplateName ? `Mapped for ${importedTemplateName}. ` : ''}Rehash keeps these assets structured instead of flattening them into the seed.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearImportedCharacter}
                    className="rounded-lg border border-border/60 bg-background/60 p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear imported source"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {generationError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2.5 text-sm text-destructive">
                <XCircle className="h-4 w-4 inline-flex" />
                <span className="ml-2">{generationError}</span>
              </div>
            )}

            {resumeNotice && !generationError && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-foreground">
                <span>{resumeNotice}</span>
              </div>
            )}
          </CollapsibleSection>
          </div>
        </section>

        {/* Options Section */}
        <section className="space-y-3">
          <CollapsibleSection
            title="Setup"
            subtitle="Mode, template, and connected references"
            preview={`${mode} • ${template || 'No template'}${selectedConnectedDraftIds.length > 0 ? ` • ${selectedConnectedDraftIds.length} refs` : ''}`}
            defaultExpanded
            className="app-panel"
            bodyClassName="space-y-4"
          >
            <div className="space-y-4">
              {/* Content Mode */}
              <div data-tour-anchor="generation-content-mode">
                <label className="text-sm font-medium mb-3 block">Content Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODE_OPTIONS.map((option) => {
                    const isSelected = mode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMode(option.value)}
                        disabled={isGenerating}
                        className={`relative overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed sm:p-3 sm:text-base sm:hover:scale-105 ${
                          isSelected
                            ? `bg-gradient-to-br ${option.color} text-white shadow-lg`
                            : 'bg-background/50 border border-border/50 hover:border-border'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 -z-10" />
                        )}
                        <div className="relative">
                          <div className="font-semibold">{option.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Selection */}
              <div data-tour-anchor="generation-template">
                <label className="text-sm font-medium mb-3 block">Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  disabled={templatesLoading || templates.length === 0 || isGenerating}
                  aria-label="Template"
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed sm:py-3"
                >
                  {templates.length === 0 ? (
                    <option value="">No templates available</option>
                  ) : (
                    templates.map((availableTemplate: Template) => (
                      <option key={availableTemplate.name} value={availableTemplate.name}>
                        {availableTemplate.name}
                      </option>
                    ))
                  )}
                </select>
                {templatesLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading templates...
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Connected character references</label>
                  <p className="text-xs text-muted-foreground">
                    Inject up to {MAX_CONNECTED_DRAFT_REFERENCES} saved drafts into every asset prompt, then save those links on the new draft.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={pendingConnectedDraftId}
                    onChange={(e) => setPendingConnectedDraftId(e.target.value)}
                    disabled={isGenerating || draftsLoading || availableConnectedDrafts.length === 0 || selectedConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES}
                    aria-label="Connected draft reference"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Add a saved draft...</option>
                    {availableConnectedDrafts.map((draft) => (
                      <option key={draft.review_id} value={draft.review_id}>
                        {draft.character_name || draft.review_id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddConnectedDraft}
                    disabled={!pendingConnectedDraftId || isGenerating || selectedConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add reference
                  </button>
                </div>
                {draftsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading drafts...
                  </div>
                )}
                {selectedConnectedDraftIds.length > 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      {selectedConnectedDraftIds.length} connected reference{selectedConnectedDraftIds.length === 1 ? '' : 's'} selected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedConnectedDraftIds.map((draftId) => (
                        <span key={draftId} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                          {connectedDraftLookup.get(draftId)?.character_name || draftId}
                          <button
                            type="button"
                            onClick={() => handleRemoveConnectedDraft(draftId)}
                            disabled={isGenerating}
                            aria-label={`Remove ${(connectedDraftLookup.get(draftId)?.character_name || draftId)}`}
                            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No connected references selected.</p>
                )}
              </div>

              {selectedTemplate && optionalTemplateAssets.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Optional blueprint assets</label>
                    <p className="text-xs text-muted-foreground">
                      Toggle non-required assets for this generation run. Required assets are always included.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {optionalTemplateAssets.map((asset) => {
                      const checked = selectedTemplateAssets.includes(asset.name);
                      return (
                        <label
                          key={asset.name}
                          className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleOptionalAsset(asset.name)}
                            disabled={isGenerating}
                            className="mt-1 rounded border-input"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground">{asset.name}</span>
                            {asset.description && (
                              <span className="block text-xs text-muted-foreground">{asset.description}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !seed.trim() || templates.length === 0}
              data-tour-anchor="generation-submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-accent/90 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5"
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate Character'}
            </button>
          </CollapsibleSection>
        </section>
      </div>

      {/* Progress Overlay */}
      {isGenerating && (
        <GenerationProgress
          seed={seed}
          mode={mode}
          template={template}
          selectedAssets={selectedTemplateAssets}
          connectedDraftIds={selectedConnectedDraftIds}
          importedCharacter={importedCharacter}
          importedCharacterTemplateName={importedTemplateName}
          templates={templates}
          onComplete={handleComplete}
          onError={handleError}
          onCancel={handleCancel}
        />
      )}

      {activeTab === 'generate' && activeFeatureCategory && (
        <CollapsibleSection
          title="Blueprint override"
          subtitle="Inspect or replace the generation blueprint only when you need to change compilation behavior"
          preview={selectedBlueprintPath || blueprint?.path || 'No blueprint selected'}
          className="app-panel-muted"
        >
          {blueprintLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading blueprint controls...
            </div>
          )}

          {activeFeatureCategory && blueprintError && !blueprintLoading && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              {blueprintError}
            </div>
          )}

          {blueprint && !blueprintLoading && !blueprintError && (
            <div>
              <BlueprintPanel
                blueprintName={selectedBlueprintPath}
                blueprintContent={effectiveGenerationBlueprint || blueprint.content}
                title={blueprintPanelTitle}
                description={blueprint.description}
                editable
                availableBlueprints={availableBlueprints}
                onBlueprintSelect={handleBlueprintSelect}
                onContentChange={handleBlueprintContentChange}
              />
            </div>
          )}
        </CollapsibleSection>
      )}
      </>
      )}

      {/* Import Character Modal */}
      {showImportModal && (
        <ImportCharacterModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCharacter}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}
