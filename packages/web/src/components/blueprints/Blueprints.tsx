import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, FileJson, Lightbulb, Package, Search, Edit3, RotateCcw, Copy, Trash2, MoreVertical, Plus } from 'lucide-react';
import type { Blueprint } from '@char-gen/shared';
import { api } from '@/lib/api';
import { BLUEPRINTS_SAFETY_TOUR_ID } from '@/lib/help';
import InlineHelpTip from '../common/InlineHelpTip';
import { useGuidedTour } from '../common/GuidedTourContext';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import BlueprintLintPanel from './BlueprintLintPanel';
import BlueprintSandboxPanel from './BlueprintSandboxPanel';
import BlueprintCreateDialog from './BlueprintCreateDialog';

type Section = {
  title: string;
  blueprints: Blueprint[];
  icon: React.ReactNode;
};

export default function Blueprints() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'delete'; blueprint: Blueprint } | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState<Blueprint | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();
  const { data, isLoading, error } = useQuery({
    queryKey: ['blueprints'],
    queryFn: () => api.getBlueprints(),
  });

  // Track which blueprints have overrides
  const overridePaths = useMemo(() => {
    if (!data) return new Set<string>();
    const allBlueprints = [
      ...data.core,
      ...data.system,
      ...Object.values(data.templates).flat(),
      ...data.examples,
    ];
    return new Set(
      allBlueprints
        .filter((bp) => api.getOriginalBlueprintContent(bp.path) !== null && api.hasBlueprintOverride(bp.path))
        .map((bp) => bp.path)
    );
  }, [data]);

  const handleReset = async (blueprint: Blueprint) => {
    setIsProcessing(true);
    try {
      await api.resetBlueprint(blueprint.path);
      await queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to reset blueprint:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (blueprint: Blueprint) => {
    // Only allow deleting blueprints that are user-created (have overrides and no original)
    const hasOriginal = api.getOriginalBlueprintContent(blueprint.path) !== null;
    if (hasOriginal) {
      // If there's an original, just reset
      await handleReset(blueprint);
      return;
    }
    setIsProcessing(true);
    try {
      await api.deleteBlueprint(blueprint.path);
      await queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to delete blueprint:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateDialog || !duplicateName.trim()) return;
    setIsProcessing(true);
    try {
      const targetPath = `blueprints/custom/${duplicateName.trim().toLowerCase().replace(/\s+/g, '_')}.md`;
      await api.duplicateBlueprint(duplicateDialog.path, targetPath);
      await queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      setDuplicateDialog(null);
      setDuplicateName('');
    } catch (err) {
      console.error('Failed to duplicate blueprint:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sections = useMemo<Section[]>(() => {
    if (!data) {
      return [];
    }

    const customBlueprints = data.core.filter((blueprint) => blueprint.path.startsWith('blueprints/custom/'));
    const coreBlueprints = data.core.filter((blueprint) => !blueprint.path.startsWith('blueprints/custom/'));

    return [
      { title: 'Root Blueprints', blueprints: coreBlueprints, icon: <BookOpen className="h-5 w-5 text-primary" /> },
      { title: 'System Blueprints', blueprints: data.system, icon: <FileJson className="h-5 w-5 text-primary" /> },
      { title: 'Custom Blueprints', blueprints: customBlueprints, icon: <Edit3 className="h-5 w-5 text-primary" /> },
      {
        title: 'Template-Scoped Blueprints',
        blueprints: Object.values(data.templates).flat(),
        icon: <Package className="h-5 w-5 text-primary" />,
      },
      { title: 'Example Blueprints', blueprints: data.examples, icon: <Lightbulb className="h-5 w-5 text-primary" /> },
    ];
  }, [data]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = sections
    .map((section) => ({
      ...section,
      blueprints: section.blueprints.filter((blueprint) => {
        if (!normalizedQuery) {
          return true;
        }
        return (
          blueprint.name.toLowerCase().includes(normalizedQuery) ||
          blueprint.description.toLowerCase().includes(normalizedQuery) ||
          blueprint.path.toLowerCase().includes(normalizedQuery)
        );
      }),
    }))
    .filter((section) => section.blueprints.length > 0);

  const highlightedBlueprint = filteredSections[0]?.blueprints[0] ?? sections[0]?.blueprints[0];
  const totalBlueprints = sections.reduce((count, section) => count + section.blueprints.length, 0);
  const visibleBlueprints = filteredSections.reduce((count, section) => count + section.blueprints.length, 0);

  useAssistantScreenContext({
    search_query: query,
    visible_sections: filteredSections.map((section) => section.title),
    total_visible_blueprints: visibleBlueprints,
    total_blueprints: totalBlueprints,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading blueprints...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        Error loading blueprints: {error.message}
      </div>
    );
  }

  return (
    <div className="app-page space-y-6 pb-12">
      <InlineHelpTip
        tipId="blueprints-advanced-surface-tip"
        title="Blueprints are an advanced editing surface"
        description="If you are not deliberately changing generation structure, stay with templates instead. Blueprint edits can break parser-facing output even when the text still looks readable."
        actionLabel={isTourCompleted(BLUEPRINTS_SAFETY_TOUR_ID) ? 'Replay Blueprint Safety Tour' : 'Start Blueprint Safety Tour'}
        onAction={() => (isTourCompleted(BLUEPRINTS_SAFETY_TOUR_ID) ? restartTour(BLUEPRINTS_SAFETY_TOUR_ID) : startTour(BLUEPRINTS_SAFETY_TOUR_ID))}
      />

      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Blueprint source control</p>
            <h1 className="app-page-title">Inspect the live blueprint catalog without confusing it with template manifests.</h1>
            <p className="app-page-summary">
              This screen lists Markdown blueprint files from the browser catalog: system prompts, example assets, template-scoped blueprint files, and any custom copies saved under blueprints/custom. Template manifests and asset graphs still belong in Templates.
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Blueprint
            </button>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Catalog state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Visible</p>
                <div className="app-page-metric-value text-2xl">{visibleBlueprints}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Total</p>
                <div className="app-page-metric-value text-2xl">{totalBlueprints}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Overrides</p>
                <div className="app-page-metric-value text-2xl">{overridePaths.size}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="app-panel-muted p-4">
          <p className="text-sm font-medium text-foreground">What belongs here</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Markdown blueprint sources that drive generation behavior or provide reusable examples.
          </p>
        </div>
        <div className="app-panel-muted p-4">
          <p className="text-sm font-medium text-foreground">What does not</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Template TOML manifests, asset dependency design, and routine draft editing. Use Templates for those.
          </p>
        </div>
        <div className="app-panel-muted p-4">
          <p className="text-sm font-medium text-foreground">Safe workflow</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Duplicate or create a custom blueprint first, then edit the copy so parser-facing defaults stay intact.
          </p>
        </div>
      </section>

      <div data-tour-anchor="blueprints-search" className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blueprint files by name, description, or path"
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <section data-tour-anchor="blueprints-tools" className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Blueprint Tools</h2>
            <p className="text-sm text-muted-foreground">
              Linting and sandbox preview run against the selected blueprint file so you can test edits before wiring them into a template.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Live
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BlueprintLintPanel blueprintPath={highlightedBlueprint?.path} />
          <BlueprintSandboxPanel
            blueprintPath={highlightedBlueprint?.path}
            seed={normalizedQuery || 'preview seed'}
          />
        </div>
      </section>

      {filteredSections.length === 0 ? (
        <div className="app-panel p-8 text-center text-muted-foreground">
          No blueprints match the current search.
        </div>
      ) : (
        <div data-tour-anchor="blueprints-list" className="space-y-6">
          {filteredSections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-center gap-2">
                {section.icon}
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <span className="text-sm text-muted-foreground">{section.blueprints.length}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.blueprints.map((blueprint) => {
                  const hasOverride = overridePaths.has(blueprint.path);
                  const editorPath = `/blueprints/edit/${encodeURIComponent(blueprint.path)}`;
                  return (
                  <div
                    key={blueprint.path}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(editorPath)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(editorPath);
                      }
                    }}
                    className="group app-panel cursor-pointer p-4 transition-colors hover:border-primary hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={editorPath}
                        onClick={(event) => event.stopPropagation()}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{blueprint.name}</h3>
                          {hasOverride && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                              Edited
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground truncate">{blueprint.description || 'No description'}</p>
                      </Link>
                      <div className="flex items-center gap-1">
                        <Link
                          to={editorPath}
                          onClick={(event) => event.stopPropagation()}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === blueprint.path ? null : blueprint.path);
                            }}
                            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                            title="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {actionMenuOpen === blueprint.path && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-border bg-card py-1 shadow-lg">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setDuplicateDialog(blueprint);
                                    setDuplicateName(`${blueprint.name} Copy`);
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </button>
                                {hasOverride && (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setConfirmAction({ type: 'reset', blueprint });
                                      setActionMenuOpen(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                  </button>
                                )}
                                {hasOverride && (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setConfirmAction({ type: 'delete', blueprint });
                                      setActionMenuOpen(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{blueprint.path}</span>
                      <span>v{blueprint.version}</span>
                    </div>
                  </div>
                )})}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Confirm Reset/Delete Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isProcessing && setConfirmAction(null)} />
          <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold">
              {confirmAction.type === 'reset' ? 'Reset Blueprint?' : 'Delete Blueprint?'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {confirmAction.type === 'reset'
                ? `This will revert "${confirmAction.blueprint.name}" to its original content. Your changes will be lost.`
                : `This will delete "${confirmAction.blueprint.name}". This action cannot be undone.`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'reset') {
                    void handleReset(confirmAction.blueprint);
                  } else {
                    void handleDelete(confirmAction.blueprint);
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : confirmAction.type === 'reset' ? 'Reset' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Dialog */}
      {duplicateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isProcessing && setDuplicateDialog(null)} />
          <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold">Duplicate Blueprint</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a copy of "{duplicateDialog.name}" with a new name.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5">New Name</label>
              <input
                type="text"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Blueprint name"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDuplicateDialog(null);
                  setDuplicateName('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDuplicate()}
                disabled={isProcessing || !duplicateName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isProcessing ? 'Duplicating...' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BlueprintCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={(path) => {
          void queryClient.invalidateQueries({ queryKey: ['blueprints'] });
        }}
      />
    </div>
  );
}