import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Zap, BookOpen, XCircle, Loader2, Edit3, MessageSquarePlus } from 'lucide-react';
import type { ContentMode, FeatureCategory, GenerationComplete, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import type { Blueprint } from '@char-gen/shared';
import {
  clearActiveGenerationSession,
  loadActiveGenerationSession,
} from '@/lib/services/generation-session';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import GenerationProgress from './GenerationProgress';
import DraftRefiner from './DraftRefiner';
import IntroGenerator from './IntroGenerator';
import ApprovalWorkflowPlaceholder from './ApprovalWorkflowPlaceholder';
import CheckpointSessionPlaceholder from './CheckpointSessionPlaceholder';
import { BlueprintPanel } from '../common/BlueprintPanel';
import { getBlueprintsForFeature, resolveBlueprintForFeature, toBlueprintOptions } from '@/lib/blueprints/featureSelection';
import { configManager } from '@/lib/config/manager';

type TabId = 'generate' | 'refine' | 'intros';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'generate', label: 'New Draft', icon: Sparkles },
  { id: 'refine', label: 'Refine Draft', icon: Edit3 },
  { id: 'intros', label: 'Intros', icon: MessageSquarePlus },
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

export default function Generation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const [seed, setSeed] = useState('');
  const [mode, setMode] = useState<ContentMode>('NSFW');
  const [template, setTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(true);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [selectedBlueprintPaths, setSelectedBlueprintPaths] = useState<Partial<Record<FeatureCategory, string>>>(
    () => getInitialGenerationBlueprintPaths()
  );
  const [blueprintOverrides, setBlueprintOverrides] = useState<Partial<Record<FeatureCategory, string>>>({});
  const [availableBlueprints, setAvailableBlueprints] = useState<Array<{ name: string; label: string }>>([]);

  const activeFeatureCategory = useMemo<FeatureCategory | null>(() => {
    if (activeTab === 'generate') {
      return 'orchestration';
    }
    if (activeTab === 'intros') {
      return 'intro_scene_generation';
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

  useEffect(() => {
    if (!template && templates.length > 0) {
      setTemplate(templates[0].name);
    }
  }, [template, templates]);

  const selectedTemplate = templates.find((availableTemplate: Template) => availableTemplate.name === template);

  useAssistantScreenContext({
    seed_preview: seed.slice(0, 200),
    mode,
    template_name: template || null,
    is_generating: isGenerating,
    generation_error: generationError,
    available_templates: templates.length,
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
    setGenerationError(null);
    setResumeNotice('Restored an interrupted generation session.');
    setIsGenerating(true);
  }, []);

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
    clearActiveGenerationSession();
    setGenerationError(null);
    setResumeNotice(null);
    setIsGenerating(true);
  };

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

  const blueprintPanelTitle = activeFeatureCategory === 'intro_scene_generation'
    ? 'Intro Scene Blueprint'
    : 'Orchestration Blueprint';

  return (
    <div className="app-page space-y-12 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-5">
            <p className="app-page-eyebrow">Generate</p>
            <div className="space-y-3">
              <h1 className="app-page-title">Build a draft</h1>
              <p className="app-page-summary">
                Set the seed, pick the template, then run the pass.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/templates" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                <BookOpen className="h-4 w-4" />
                Review templates
              </Link>
              <Link to="/seed-generator" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                <Zap className="h-4 w-4" />
                Open seed generator
              </Link>
            </div>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Current setup</p>
            <div className="mt-4 app-page-metrics">
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
                <p className="app-page-metric-label">Available</p>
                <div className="app-page-metric-value text-2xl">{templates.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeFeatureCategory && blueprint && !blueprintLoading && (
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
      )}

      {activeFeatureCategory && blueprintError && !blueprintLoading && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {blueprintError}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="app-tab-group">
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
      ) : activeTab === 'intros' ? (
        <IntroGenerator templates={templates} blueprintContent={effectiveGenerationBlueprint} />
      ) : (
        <>
        <div className="grid gap-6 lg:grid-cols-2">
        {/* Seed Input Section */}
        <section className="space-y-3">
          <div data-tour-anchor="generation-seed" className="app-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Seed</h2>
                <p className="text-sm text-muted-foreground">
                  Start with one compact premise.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter a seed</label>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g., a lonely space pirate searching for redemption"
                className="mt-1.5 min-h-32 w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <div className="flex items-center gap-2">
                <Link
                  to="/seed-generator"
                  className="text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  Open Seed Generator →
                </Link>
              </div>
            </div>

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
          </div>
        </section>

        {/* Options Section */}
        <section className="space-y-3">
          <div className="app-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Options</h2>
                <p className="text-sm text-muted-foreground">
                  Pick the mode and template.
                </p>
              </div>
            </div>

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
                        className={`relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !seed.trim() || templates.length === 0}
              data-tour-anchor="generation-submit"
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate Character'}
            </button>
          </div>
        </section>
      </div>

      <section className="app-panel p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Approval tooling</h2>
            <p className="text-sm text-muted-foreground">
              Review checkpoints are staged here while the full workflow lands.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ApprovalWorkflowPlaceholder
            templateName={selectedTemplate?.name || template || undefined}
            assetCount={selectedTemplate?.assets.length}
          />
          <CheckpointSessionPlaceholder
            reviewId={undefined}
            resumeFromAsset={selectedTemplate?.assets[0]?.name}
          />
        </div>
      </section>

      {/* Progress Overlay */}
      {isGenerating && (
        <GenerationProgress
          seed={seed}
          mode={mode}
          template={template}
          templates={templates}
          onComplete={handleComplete}
          onError={handleError}
          onCancel={handleCancel}
        />
      )}
      </>
      )}
    </div>
  );
}
