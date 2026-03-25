import { lazy, Suspense, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type { AssetDefinition, CreateTemplateRequest, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { saveDownload } from '../../utils/download';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import TemplateComparisonPanel from './TemplateComparisonPanel';
import TemplateMigrationPlaceholder from './TemplateMigrationPlaceholder';

const TemplateWizard = lazy(() => import('./TemplateWizard'));

function TemplateWizardFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading template editor...
      </div>
    </div>
  );
}

export default function Templates() {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingTemplateData, setEditingTemplateData] = useState<CreateTemplateRequest | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { errors: string[]; warnings: string[] }>>({});
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deleteTemplate(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setFeedback({ type: 'success', message: 'Template deleted.' });
    },
    onError: (mutationError: Error) => {
      setFeedback({ type: 'error', message: mutationError.message });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ name, newName }: { name: string; newName: string }) =>
      api.duplicateTemplate(name, { name: newName, version: '1.0' }),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setFeedback({ type: 'success', message: `Duplicated template as ${template.name}.` });
    },
    onError: (mutationError: Error) => {
      setFeedback({ type: 'error', message: mutationError.message });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => api.importTemplate(file),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setFeedback({ type: 'success', message: `Imported template ${template.name}.` });
    },
    onError: (mutationError: Error) => {
      setFeedback({ type: 'error', message: mutationError.message });
    },
  });

  const toggleExpand = (name: string) => {
    setExpandedTemplate((current) => (current === name ? null : name));
  };

  const handleValidate = async (name: string) => {
    try {
      const result = await api.validateTemplate(name);
      setValidationResults((previous) => ({ ...previous, [name]: result }));
      setFeedback({
        type: result.errors.length > 0 ? 'error' : 'success',
        message:
          result.errors.length > 0 || result.warnings.length > 0
            ? `Validation finished for ${name}.`
            : `${name} is valid and ready to use.`,
      });
    } catch (validationError) {
      setFeedback({
        type: 'error',
        message: validationError instanceof Error ? validationError.message : 'Validation failed',
      });
    }
  };

  const handleDuplicate = (name: string) => {
    const newName = prompt('Name for duplicated template:', `${name} Copy`);
    if (!newName?.trim()) {
      return;
    }
    duplicateMutation.mutate({ name, newName: newName.trim() });
  };

  const handleExport = async (name: string) => {
    try {
      const download = await api.exportTemplate(name);
      const result = await saveDownload(download, `${name.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}.json`);

      if (result.saved) {
        setFeedback({ type: 'success', message: `Exported ${name}.` });
      }
    } catch (exportError) {
      setFeedback({ type: 'error', message: exportError instanceof Error ? exportError.message : 'Export failed' });
    }
  };

  const handleEdit = async (template: Template) => {
    try {
      const response = await api.getTemplateBlueprintContents(template.name);
      const isBuiltinTemplate = Boolean(template.is_official || template.is_default);
      const existingNames = new Set((templates ?? []).map((entry) => entry.name));
      let suggestedName = template.name;

      if (isBuiltinTemplate) {
        const baseName = `${template.name} Copy`;
        suggestedName = baseName;
        let suffix = 2;
        while (existingNames.has(suggestedName)) {
          suggestedName = `${baseName} ${suffix}`;
          suffix += 1;
        }
      }

      setEditingTemplate(template);
      setEditingTemplateData({
        name: suggestedName,
        version: template.version,
        description: template.description,
        assets: template.assets,
        blueprint_contents: response.blueprint_contents,
      });
      setShowWizard(true);
    } catch (editError) {
      setFeedback({
        type: 'error',
        message: editError instanceof Error ? editError.message : 'Failed to load template editor',
      });
    }
  };

  const handleImportChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    importMutation.mutate(file);
    event.target.value = '';
  };

  const wizardInitialData: CreateTemplateRequest | undefined = editingTemplateData ?? undefined;
  const templatesList = templates ?? [];
  const templateCount = templatesList.length;
  const officialCount = templatesList.filter((template) => template.is_official).length;
  const customCount = templateCount - officialCount;

  useAssistantScreenContext({
    template_count: templateCount,
    expanded_template: expandedTemplate,
    editing_template: editingTemplate?.name ?? null,
    wizard_open: showWizard,
    validation_templates: Object.keys(validationResults),
    pending_action:
      deleteMutation.isPending
        ? 'delete'
        : duplicateMutation.isPending
          ? 'duplicate'
          : importMutation.isPending
            ? 'import'
            : null,
    feedback_message: feedback?.message ?? null,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        Error loading templates: {error.message}
      </div>
    );
  }

  return (
    <>
      {showWizard && (
        <Suspense fallback={<TemplateWizardFallback />}>
          <TemplateWizard
            open={showWizard}
            onClose={() => {
              setShowWizard(false);
              setEditingTemplate(null);
              setEditingTemplateData(null);
            }}
            initialData={wizardInitialData}
            templateName={editingTemplate?.name}
            forkMode={Boolean(editingTemplate?.is_official || editingTemplate?.is_default)}
          />
        </Suspense>
      )}

      <div className="app-page space-y-10 pb-12">
        {feedback && (
          <div
            className={`app-note p-4 text-sm ${
              feedback.type === 'error'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <section className="app-page-hero">
          <div className="app-page-hero-grid">
            <div className="space-y-4">
              <p className="app-page-eyebrow">Templates</p>
              <h1 className="app-page-title">Manage templates</h1>
              <p className="app-page-summary">
                Each template defines the asset set, order, and export contract.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  Import Template
                  <input type="file" accept=".json,.zip" className="hidden" onChange={handleImportChange} />
                </label>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setEditingTemplateData(null);
                    setShowWizard(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </button>
              </div>
            </div>

            <div className="app-panel-muted p-5">
              <p className="app-page-eyebrow">Library</p>
              <div className="mt-4 app-page-metrics">
                <div className="app-page-metric">
                  <p className="app-page-metric-label">Templates</p>
                  <div className="app-page-metric-value text-2xl">{templateCount}</div>
                </div>
                <div className="app-page-metric">
                  <p className="app-page-metric-label">Official</p>
                  <div className="app-page-metric-value text-2xl">{officialCount}</div>
                </div>
                <div className="app-page-metric">
                  <p className="app-page-metric-label">Custom</p>
                  <div className="app-page-metric-value text-2xl">{customCount}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          {templatesList.map((template: Template) => (
            <div key={template.name} className="app-panel overflow-hidden">
              <button
                onClick={() => toggleExpand(template.name)}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border/60 bg-background/55 p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{template.name}</span>
                      {template.is_official && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description || `${template.assets.length} assets in flow`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">v{template.version}</span>
                  {expandedTemplate === template.name ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedTemplate === template.name && (
                <div className="space-y-4 border-t border-border/60 p-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-foreground">Assets ({template.assets.length})</h3>
                    <div className="space-y-2">
                      {template.assets.map((asset: AssetDefinition) => (
                        <div key={asset.name} className="app-panel-muted flex items-center justify-between gap-3 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={asset.required ? 'text-primary' : 'text-muted-foreground'}>{asset.name}</span>
                            {asset.depends_on.length > 0 && (
                              <span className="text-xs text-muted-foreground">depends on {asset.depends_on.join(', ')}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {asset.required && (
                              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">required</span>
                            )}
                            {asset.blueprint_file && (
                              <span className="text-xs text-muted-foreground">{asset.blueprint_file}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {validationResults[template.name] && (
                    <div className="app-panel-muted p-3 text-sm">
                      {validationResults[template.name].errors.length === 0 && validationResults[template.name].warnings.length === 0 ? (
                        <p className="text-green-700 dark:text-green-400">No validation issues found.</p>
                      ) : (
                        <div className="space-y-2">
                          {validationResults[template.name].errors.length > 0 && (
                            <div>
                              <p className="font-medium text-destructive">Errors</p>
                              <ul className="list-disc pl-5 text-destructive">
                                {validationResults[template.name].errors.map((issue) => (
                                  <li key={issue}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {validationResults[template.name].warnings.length > 0 && (
                            <div>
                              <p className="font-medium text-yellow-700 dark:text-yellow-400">Warnings</p>
                              <ul className="list-disc pl-5 text-yellow-700 dark:text-yellow-400">
                                {validationResults[template.name].warnings.map((issue) => (
                                  <li key={issue}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleValidate(template.name)}
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Validate
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.name)}
                      disabled={duplicateMutation.isPending}
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleExport(template.name)}
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    {!template.is_official && (
                      <button
                        onClick={() => handleEdit(template)}
                        className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {!template.is_official && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete template "${template.name}"?`)) {
                            deleteMutation.mutate(template.name);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Template
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {templatesList.length === 0 && (
          <div className="app-panel p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="text-muted-foreground">Create one to define a custom generation flow.</p>
            <div className="mt-6 text-left">
              <TemplateMigrationPlaceholder templateName="first template" />
            </div>
          </div>
        )}

        <section className="app-panel p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Compare templates</h2>
              <p className="text-sm text-muted-foreground">
                Check ordering and contract differences before switching flows.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">Advanced</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TemplateMigrationPlaceholder templateName={templatesList[0]?.name} draftId={undefined} />
            <TemplateComparisonPanel templates={templatesList} leftTemplate={templatesList[0]?.name} rightTemplate={templatesList[1]?.name} />
          </div>
        </section>
      </div>
    </>
  );
}
