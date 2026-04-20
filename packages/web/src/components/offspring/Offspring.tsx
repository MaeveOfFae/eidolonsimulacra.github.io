import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Baby, Loader2, Users, CheckCircle, Square } from 'lucide-react';
import type { Blueprint, ContentMode, FeatureCategory, GenerationComplete, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { getBlueprintsForFeature, resolveBlueprintForFeature, toBlueprintOptions } from '@/lib/blueprints/featureSelection';
import {
  clearActiveOffspringSession,
  loadActiveOffspringSession,
  saveActiveOffspringSession,
} from '@/lib/services/generation-session';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import { BlueprintPanel } from '../common/BlueprintPanel';
import GenerationProgress from '../generation/GenerationProgress';
import { configManager } from '@/lib/config/manager';

type OffspringStage = 'idle' | 'loading_parents' | 'building_prompt' | 'generating' | 'review_seed' | 'generating_character' | 'saving' | 'complete' | 'cancelled' | 'error';

const OFFSPRING_STAGES: Array<{ key: Exclude<OffspringStage, 'idle' | 'error'>; label: string; detail: string }> = [
  { key: 'loading_parents', label: 'Load Parents', detail: 'Reading both parent drafts from local storage.' },
  { key: 'building_prompt', label: 'Build Prompt', detail: 'Combining parent suites with the offspring blueprint.' },
  { key: 'generating', label: 'Generate Seed', detail: 'Producing the descendant seed from both parent profiles.' },
  { key: 'review_seed', label: 'Review Seed', detail: 'Inspect or edit the synthesized offspring seed before compiling assets.' },
  { key: 'generating_character', label: 'Generate Character', detail: 'Running the normal character generator against the offspring seed.' },
  { key: 'saving', label: 'Save Draft', detail: 'Writing the offspring draft and lineage metadata to storage.' },
  { key: 'complete', label: 'Complete', detail: 'Offspring draft is ready for review.' },
];

const PLANNED_OFFSPRING_MODULES = [
  {
    name: 'Trait inheritance',
    description: 'Structured inheritance breakdowns remain staged until the generated offspring flow exposes durable trait data.',
  },
  {
    name: 'Breeding history',
    description: 'Longer breeding-chain views stay staged until lineage interactions and summaries have a clearer review surface.',
  },
];

const PAGE_FEATURE_CATEGORY: FeatureCategory = 'offspring_generation';

function getStageIndex(stage: OffspringStage): number {
  const index = OFFSPRING_STAGES.findIndex((entry) => entry.key === stage);
  return index;
}

function getStageLabel(stage: OffspringStage): string {
  const match = OFFSPRING_STAGES.find((entry) => entry.key === stage);
  if (match) {
    return match.label;
  }

  if (stage === 'error') {
    return 'Error';
  }

  if (stage === 'cancelled') {
    return 'Cancelled';
  }

  return 'Idle';
}

export default function Offspring() {
  const queryClient = useQueryClient();
  const [parent1, setParent1] = useState<string>('');
  const [parent2, setParent2] = useState<string>('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [template, setTemplate] = useState('');
  const [templateManuallySelected, setTemplateManuallySelected] = useState(false);
  const [isGeneratingSeed, setIsGeneratingSeed] = useState(false);
  const [isRunningAssetWorkflow, setIsRunningAssetWorkflow] = useState(false);
  const [output, setOutput] = useState('');
  const [offspringSeed, setOffspringSeed] = useState<string | null>(null);
  const [result, setResult] = useState<{ draftId: string; characterName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [stage, setStage] = useState<OffspringStage>('idle');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(true);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [selectedBlueprintPath, setSelectedBlueprintPath] = useState<string>(
    () => configManager.getConfig().feature_blueprints?.offspring_generation || 'blueprints/system/offspring_generator.md'
  );
  const [offspringBlueprintOverride, setOffspringBlueprintOverride] = useState<string | null>(null);
  const [availableBlueprints, setAvailableBlueprints] = useState<Array<{ name: string; label: string }>>([]);
  const isGenerating = isGeneratingSeed || isRunningAssetWorkflow;
  const restoredSessionRef = useRef(loadActiveOffspringSession());

  const abortRef = useRef<(() => void) | null>(null);

  // Fetch drafts for parent selection
  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await api.getBlueprints();
        const matching = getBlueprintsForFeature(list, PAGE_FEATURE_CATEGORY);
        setAvailableBlueprints(toBlueprintOptions(matching));

        const resolved = resolveBlueprintForFeature(
          list,
          PAGE_FEATURE_CATEGORY,
          selectedBlueprintPath
        );

        if (resolved) {
          setBlueprint(resolved);
          setSelectedBlueprintPath(resolved.path);
          setBlueprintError(null);
        } else {
          setBlueprintError('Offspring blueprint could not be resolved from feature_category metadata.');
        }
      } catch (loadError) {
        console.error('Failed to load offspring blueprint:', loadError);
        setBlueprintError('Failed to load offspring blueprint.');
      } finally {
        setBlueprintLoading(false);
      }
    })();
  }, [selectedBlueprintPath]);

  const getDraftMetadata = (draftId: string) => draftsData?.drafts.find((draft) => draft.review_id === draftId);
  const effectiveOffspringBlueprint = offspringBlueprintOverride ?? blueprint?.content;

  const selectedTemplate = templates.find((availableTemplate: Template) => availableTemplate.name === template);

  const getParentName = (draftId: string) => {
    const draft = getDraftMetadata(draftId);
    return draft?.character_name || draftId;
  };

  const parent1TemplateName = parent1 ? getDraftMetadata(parent1)?.template_name || null : null;
  const parent2TemplateName = parent2 ? getDraftMetadata(parent2)?.template_name || null : null;
  const sharedParentTemplate = parent1TemplateName && parent1TemplateName === parent2TemplateName
    ? parent1TemplateName
    : null;
  const isThirdTemplateChoice = Boolean(
    parent1TemplateName
    && parent2TemplateName
    && parent1TemplateName !== parent2TemplateName
    && template
    && template !== parent1TemplateName
    && template !== parent2TemplateName
  );

  useEffect(() => {
    if (templates.length === 0) {
      if (template) {
        setTemplate('');
      }
      return;
    }

    const sharedTemplateExists = sharedParentTemplate && templates.some((availableTemplate) => availableTemplate.name === sharedParentTemplate);

    if (!templateManuallySelected && sharedTemplateExists && template !== sharedParentTemplate) {
      setTemplate(sharedParentTemplate);
      return;
    }

    if (!template) {
      setTemplate(templates[0].name);
    }
  }, [sharedParentTemplate, template, templateManuallySelected, templates]);

  useEffect(() => {
    setTemplateManuallySelected(false);
  }, [parent1, parent2]);

  useEffect(() => {
    const restoredSession = restoredSessionRef.current;
    if (!restoredSession) {
      return;
    }

    setParent1(restoredSession.parent1Id);
    setParent2(restoredSession.parent2Id);
    setMode(restoredSession.mode);
    setTemplate(restoredSession.template || '');
    setTemplateManuallySelected(restoredSession.templateManuallySelected);
    setOutput(restoredSession.output);

    if (restoredSession.offspringSeed) {
      setOffspringSeed(restoredSession.offspringSeed);
    }

    if (restoredSession.status === 'generating_character' && restoredSession.offspringSeed) {
      setStage('generating_character');
      setIsRunningAssetWorkflow(true);
      setResumeNotice('Restored offspring asset workflow.');
    } else if (restoredSession.status === 'review_seed' && restoredSession.offspringSeed) {
      setStage('review_seed');
      setResumeNotice('Restored offspring seed review.');
    } else if (restoredSession.status === 'generating_seed') {
      setStage('idle');
      setResumeNotice('Seed generation was interrupted. Review the restored setup and regenerate to continue.');
    } else {
      setStage('idle');
      if (restoredSession.parent1Id || restoredSession.parent2Id) {
        setResumeNotice('Restored offspring setup.');
      }
    }

    restoredSessionRef.current = null;
  }, []);

  useEffect(() => {
    if (!isGenerating && !result && !(parent1 || parent2 || offspringSeed || output.trim())) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating, offspringSeed, output, parent1, parent2, result]);

  useAssistantScreenContext({
    parent1_id: parent1 || null,
    parent2_id: parent2 || null,
    parent1_name: parent1 ? getParentName(parent1) : null,
    parent2_name: parent2 ? getParentName(parent2) : null,
    parent1_template: parent1TemplateName,
    parent2_template: parent2TemplateName,
    mode,
    template_name: template || null,
    template_auto_selected: !templateManuallySelected,
    using_third_template_choice: isThirdTemplateChoice,
    is_generating: isGenerating,
    generation_stage: stage,
    has_result: Boolean(result),
    result_character: result?.characterName ?? null,
    output_length: output.length,
    offspring_seed_ready: Boolean(offspringSeed),
    available_drafts: draftsData?.drafts.length ?? 0,
    available_templates: templates.length,
  });

  const handleGenerate = async () => {
    if (!parent1 || !parent2 || parent1 === parent2) return;

    setIsGeneratingSeed(true);
    setIsRunningAssetWorkflow(false);
    clearActiveOffspringSession();
    setOffspringSeed(null);
    setOutput('');
    setResult(null);
    setError(null);
    setResumeNotice(null);
    setStage('loading_parents');

    try {
      const stream = api.generateOffspringSeed({
        parent1_id: parent1,
        parent2_id: parent2,
        mode,
        template,
        blueprint_override: effectiveOffspringBlueprint,
      });

      abortRef.current = () => stream.abort();

      stream.subscribe((event) => {
        if (event.event === 'status' && 'stage' in event.data) {
          const nextStage = event.data.stage as OffspringStage | undefined;
          if (nextStage) {
            setStage(nextStage);
          }
        }
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          setOutput((prev) => prev + data.content);
        }
        if (event.event === 'complete' && 'content' in event.data) {
          const data = event.data as { content?: string };
          const nextSeed = data.content?.trim();
          if (!nextSeed) {
            setError('Offspring generation finished without seed content.');
            setStage('error');
            setIsGeneratingSeed(false);
            return;
          }
          setOffspringSeed(nextSeed);
          setOutput(nextSeed);
          setStage('review_seed');
          setIsGeneratingSeed(false);
          saveActiveOffspringSession({
            version: 1,
            parent1Id: parent1,
            parent2Id: parent2,
            mode,
            template: template || undefined,
            templateManuallySelected,
            offspringSeed: nextSeed,
            output: nextSeed,
            status: 'review_seed',
            updatedAt: Date.now(),
          });
        }
      });

      stream.onError_((error) => {
        console.error('Offspring generation error:', error);
        setError(error);
        setStage('error');
        setIsGeneratingSeed(false);
        setResumeNotice(null);
        clearActiveOffspringSession();
      });

      stream.onComplete_(async () => {
        setIsGeneratingSeed(false);
        abortRef.current = null;
        await queryClient.invalidateQueries({ queryKey: ['drafts'] });
      });

      await stream.start();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate offspring');
      setStage('error');
      setIsGeneratingSeed(false);
      setResumeNotice(null);
      clearActiveOffspringSession();
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.();
    abortRef.current = null;
    setIsGeneratingSeed(false);
    setIsRunningAssetWorkflow(false);
    setOffspringSeed(null);
    setStage('cancelled');
    setError(null);
    setResumeNotice(null);
    clearActiveOffspringSession();
  };

  const handleWorkflowComplete = useCallback((data: GenerationComplete) => {
    void (async () => {
      if (!data.draft_id || !offspringSeed) {
        setError('Offspring asset workflow completed without a saved draft id.');
        setStage('error');
        setIsRunningAssetWorkflow(false);
        return;
      }

      await api.updateMetadata(data.draft_id, {
        seed: offspringSeed,
        parent_drafts: [parent1, parent2],
        offspring_type: 'offspring',
      });

      await queryClient.invalidateQueries({ queryKey: ['drafts'] });

      setResult({
        draftId: data.draft_id,
        characterName: data.character_name || 'Unknown',
      });
      setStage('complete');
      setIsRunningAssetWorkflow(false);
      setResumeNotice(null);
      clearActiveOffspringSession();
    })().catch((completionError) => {
      setError(completionError instanceof Error ? completionError.message : 'Failed to finalize offspring draft');
      setStage('error');
      setIsRunningAssetWorkflow(false);
      setResumeNotice(null);
      clearActiveOffspringSession();
    });
  }, [offspringSeed, parent1, parent2, queryClient]);

  const handleWorkflowError = useCallback((message: string) => {
    setError(message);
    setStage('error');
    setIsRunningAssetWorkflow(false);
    setResumeNotice(null);
    clearActiveOffspringSession();
  }, []);

  const handleWorkflowCancel = useCallback(() => {
    setIsRunningAssetWorkflow(false);
    setStage('review_seed');
    setResumeNotice('Returned to offspring seed review.');
    if (offspringSeed) {
      saveActiveOffspringSession({
        version: 1,
        parent1Id: parent1,
        parent2Id: parent2,
        mode,
        template: template || undefined,
        templateManuallySelected,
        offspringSeed,
        output,
        status: 'review_seed',
        updatedAt: Date.now(),
      });
    }
  }, [mode, offspringSeed, output, parent1, parent2, template, templateManuallySelected]);

  const handleSeedChange = (nextSeed: string) => {
    setOffspringSeed(nextSeed);
    setOutput(nextSeed);
    setResumeNotice(null);
  };

  const handleBlueprintSelect = async (path: string) => {
    try {
      const nextBlueprint = await api.getBlueprint(path);
      setBlueprint(nextBlueprint);
      setSelectedBlueprintPath(path);
      setOffspringBlueprintOverride(null);
      setBlueprintError(null);
    } catch (switchError) {
      console.error('Failed to switch offspring blueprint:', switchError);
      setBlueprintError('Failed to switch selected offspring blueprint.');
    }
  };

  const handleStartAssetWorkflow = () => {
    if (!offspringSeed?.trim()) {
      setError('Offspring seed is empty. Generate or edit a seed before continuing.');
      return;
    }

    setError(null);
    setResumeNotice(null);
    setStage('generating_character');
    setIsRunningAssetWorkflow(true);
    saveActiveOffspringSession({
      version: 1,
      parent1Id: parent1,
      parent2Id: parent2,
      mode,
      template: template || undefined,
      templateManuallySelected,
      offspringSeed: offspringSeed.trim(),
      output: offspringSeed.trim(),
      status: 'generating_character',
      updatedAt: Date.now(),
    });
  };

  useEffect(() => {
    if (result || stage === 'error' || stage === 'cancelled' || stage === 'complete') {
      return;
    }

    const hasPersistentState = Boolean(
      parent1
      || parent2
      || offspringSeed
      || output.trim()
      || templateManuallySelected
    );

    if (!hasPersistentState && !isGeneratingSeed) {
      clearActiveOffspringSession();
      return;
    }

    saveActiveOffspringSession({
      version: 1,
      parent1Id: parent1,
      parent2Id: parent2,
      mode,
      template: template || undefined,
      templateManuallySelected,
      offspringSeed: offspringSeed || undefined,
      output,
      status: isGeneratingSeed
        ? 'generating_seed'
        : isRunningAssetWorkflow
          ? 'generating_character'
          : offspringSeed
            ? 'review_seed'
            : 'configuring',
      updatedAt: Date.now(),
    });
  }, [isGeneratingSeed, isRunningAssetWorkflow, mode, offspringSeed, output, parent1, parent2, result, stage, template, templateManuallySelected]);

  useEffect(() => () => {
    abortRef.current?.();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];

  return (
    <div className="app-page max-w-5xl space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Character offspring</p>
            <h1 className="app-page-title">Create a descendant from two characters</h1>
            <p className="app-page-summary">
              Pick two parent drafts, synthesize offspring traits, then generate. The result inherits cues from both parents.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Generation state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{draftsData?.drafts.length ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-2xl">{mode}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Template</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">{template || 'Pending'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Stage</p>
                <div className="app-page-metric-value text-2xl">{getStageLabel(stage)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {blueprint && !blueprintLoading && (
        <BlueprintPanel
          blueprintName={selectedBlueprintPath}
          blueprintContent={effectiveOffspringBlueprint || blueprint.content}
          title="Offspring Blueprint"
          description={blueprint.description}
          editable
          availableBlueprints={availableBlueprints}
          onBlueprintSelect={handleBlueprintSelect}
          onContentChange={setOffspringBlueprintOverride}
        />
      )}

      {blueprintError && !blueprintLoading && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {blueprintError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="app-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Parent 1</h2>
          </div>
          <select
            value={parent1}
            onChange={(e) => setParent1(e.target.value)}
            aria-label="Parent 1"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select parent 1...</option>
            {draftsData?.drafts
              .filter((d) => d.review_id !== parent2)
              .map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.review_id}
                </option>
              ))}
          </select>
          {parent1 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {getParentName(parent1)}
            </p>
          )}
        </div>

        <div className="app-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">Parent 2</h2>
          </div>
          <select
            value={parent2}
            onChange={(e) => setParent2(e.target.value)}
            aria-label="Parent 2"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select parent 2...</option>
            {draftsData?.drafts
              .filter((d) => d.review_id !== parent1)
              .map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.review_id}
                </option>
              ))}
          </select>
          {parent2 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {getParentName(parent2)}
            </p>
          )}
        </div>
      </div>

      <div className="app-panel space-y-4 p-6">
        <h2 className="text-lg font-semibold">Options</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content Mode</label>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Template</label>
          <select
            value={template}
            onChange={(e) => {
              setTemplate(e.target.value);
              setTemplateManuallySelected(true);
            }}
            aria-label="Template"
            disabled={templatesLoading || templates.length === 0 || isGenerating}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading templates...
            </div>
          )}
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground">
              Selected layout: {selectedTemplate.assets.length} assets in {selectedTemplate.name}.
            </p>
          )}
          {sharedParentTemplate && template === sharedParentTemplate && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              Both parents use {sharedParentTemplate}, so offspring defaults to that same layout.
            </div>
          )}
          {isThirdTemplateChoice && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              Parent templates differ: {parent1TemplateName} and {parent2TemplateName}. You selected {template}, so the offspring will be compiled into a third layout.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleGenerate}
            disabled={!parent1 || !parent2 || !template || parent1 === parent2 || isGenerating || templates.length === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Offspring...
              </>
            ) : (
              <>
                <Baby className="h-5 w-5" />
                Generate Offspring
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={!isGeneratingSeed}
            className="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="h-4 w-4" />
            Cancel
          </button>
        </div>

        {parent1 && parent2 && parent1 === parent2 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Select two different parent drafts.
          </div>
        )}
      </div>

      <div className="app-panel min-w-0 overflow-hidden space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Generation Tracking</h2>
            <p className="text-sm text-muted-foreground">
              Seed synthesis happens first. After review, the normal asset-by-asset generator takes over below.
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${stage === 'error' ? 'bg-destructive/10 text-destructive' : stage === 'complete' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : stage === 'cancelled' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
            {getStageLabel(stage)}
          </span>
        </div>

        {stage === 'cancelled' && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            Offspring generation was cancelled before completion.
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {OFFSPRING_STAGES.map((entry, index) => {
            const currentIndex = getStageIndex(stage);
            const isComplete = stage === 'complete' || (currentIndex !== -1 && index < currentIndex);
            const isCurrent = stage === entry.key;

            return (
              <div
                key={entry.key}
                className={`min-w-0 rounded-md border p-4 ${isCurrent ? 'border-primary bg-primary/5' : isComplete ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-background/40'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{entry.label}</div>
                  <div className={`h-2.5 w-2.5 rounded-full ${isCurrent ? 'bg-primary' : isComplete ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{entry.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {resumeNotice && !error && (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          {resumeNotice}
        </div>
      )}

      {offspringSeed && !isGeneratingSeed && !isRunningAssetWorkflow && !result && (
        <div className="app-panel min-w-0 overflow-hidden space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Review Seed</h2>
              <p className="text-sm text-muted-foreground">
                Edit the synthesized offspring seed before compiling the selected template asset-by-asset.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              Seed Ready
            </span>
          </div>

          <textarea
            value={offspringSeed}
            onChange={(event) => handleSeedChange(event.target.value)}
            aria-label="Offspring seed"
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleStartAssetWorkflow}
              disabled={!offspringSeed.trim()}
              className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Per-Asset Workflow
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Regenerate Seed
            </button>
          </div>
        </div>
      )}

      {isRunningAssetWorkflow && offspringSeed && (
        <GenerationProgress
          seed={offspringSeed}
          mode={mode}
          template={template}
          templates={templates}
          onComplete={handleWorkflowComplete}
          onError={handleWorkflowError}
          onCancel={handleWorkflowCancel}
        />
      )}

      {result && (
        <div className="app-note border-green-500/50 bg-green-500/10 p-6 text-green-700 dark:text-green-400">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-green-500">Offspring Created!</h2>
          </div>
          <p className="text-sm mb-2">
            <strong>Character:</strong> {result.characterName}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Parents:</strong> {getParentName(parent1)} + {getParentName(parent2)}
          </p>
          <Link
            to={`/drafts/${encodeURIComponent(result.draftId)}`}
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View Character
          </Link>
        </div>
      )}

      {output && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Generated Seed</h2>
          <div className="app-panel max-h-96 overflow-auto p-4">
            <pre className="whitespace-pre-wrap break-words text-sm">{output}</pre>
          </div>
        </div>
      )}

      {!parent1 && !parent2 && !isGenerating && (
        <div className="app-panel p-8 text-center">
          <Baby className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select Two Parents</h3>
          <p className="text-muted-foreground">
            Choose two characters to combine their traits into a new character
          </p>
        </div>
      )}

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Staged offspring modules</h2>
            <p className="text-sm text-muted-foreground">
              The live offspring flow stops at seed review and draft creation. Deeper inheritance and breeding-chain analysis stay staged until their supporting data is real.
            </p>
          </div>
          <span className="app-pill app-pill-muted">Not live</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {PLANNED_OFFSPRING_MODULES.map((module) => (
            <article key={module.name} className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{module.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                </div>
                <span className="app-pill app-pill-muted">Staged</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
