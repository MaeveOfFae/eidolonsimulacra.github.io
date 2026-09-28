import { lazy, Suspense, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Download, FileText, Loader2, Pencil, Plus, ShieldCheck, Star, Trash2, Upload } from 'lucide-react';
import type { AssetDefinition, CreateTemplateRequest, Template } from '@char-gen/shared';
import { api } from '@/lib/api';
import { pickFile, saveDownload } from '../../utils/download';
import CollapsibleSection from '../common/CollapsibleSection';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import TemplateComparisonPanel from './TemplateComparisonPanel';

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
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingTemplateData, setEditingTemplateData] = useState<CreateTemplateRequest | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { errors: string[]; warnings: string[] }>>(
    {},
  );
  const queryClient = useQueryClient();

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
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

  const handleImport = async () => {
    const file = await pickFile({ accept: '.json,.zip' }, importInputRef.current);
    if (!file) {
      return;
    }

    importMutation.mutate(file);
  };

  const wizardInitialData: CreateTemplateRequest | undefined = editingTemplateData ?? undefined;
  const templatesList = templates ?? [];
  const templateCount = templatesList.length;
  const officialCount = templatesList.filter((template) => template.is_official).length;
  const customCount = templateCount - officialCount;

  useAssistantScreenContext({
    template_count: templateCount,
    editing_template: editingTemplate?.name ?? null,
    wizard_open: showWizard,
    validation_templates: Object.keys(validationResults),
    pending_action: deleteMutation.isPending
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

      <div className="app-page space-y-8 pb-10 sm:space-y-10 sm:pb-12">
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
              <p className="app-page-summary">Asset graphs, order, and export contracts.</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => void handleImport()}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent sm:justify-start"
                >
                  <Upload className="h-4 w-4" />
                  Import Template
                </button>
                <input ref={importInputRef} type="file" accept=".json,.zip" className="hidden" />
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setEditingTemplateData(null);
                    setShowWizard(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:justify-start"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </button>
              </div>
            </div>

            <div className="app-panel-muted p-4 sm:p-5">
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
            <CollapsibleSection
              key={template.name}
              title={template.name}
              subtitle={template.description || `${template.assets.length} assets in flow`}
              preview={`${template.assets.length} assets • v${template.version}`}
              meta={template.is_official ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : null}
              defaultExpanded={Boolean(template.is_default)}
              className="app-panel"
              bodyClassName="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Assets ({template.assets.length})</h3>
                <div className="space-y-2">
                  {template.assets.map((asset: AssetDefinition) => (
                    <div
                      key={asset.name}
                      className="app-panel-muted flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={asset.required ? 'text-primary' : 'text-muted-foreground'}>{asset.name}</span>
                        {asset.depends_on.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            depends on {asset.depends_on.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {asset.required && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">required</span>
                        )}
                        {asset.blueprint_file && (
                          <span className="break-all text-xs text-muted-foreground">{asset.blueprint_file}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {validationResults[template.name] && (
                <div className="app-panel-muted p-3 text-sm">
                  {validationResults[template.name].errors.length === 0 &&
                  validationResults[template.name].warnings.length === 0 ? (
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

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-3">
                <button
                  onClick={() => handleValidate(template.name)}
                  className="inline-flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary sm:justify-start"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Validate
                </button>
                <button
                  onClick={() => handleDuplicate(template.name)}
                  disabled={duplicateMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary disabled:opacity-50 sm:justify-start"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleExport(template.name)}
                  className="inline-flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary sm:justify-start"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                {!template.is_official && (
                  <button
                    onClick={() => handleEdit(template)}
                    className="inline-flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary sm:justify-start"
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
                    className="col-span-2 inline-flex items-center justify-center gap-2 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50 sm:col-auto sm:justify-start"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Template
                  </button>
                )}
              </div>
            </CollapsibleSection>
          ))}
        </div>

        {templatesList.length === 0 && (
          <div className="app-panel p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="text-muted-foreground">Create one to define a custom generation flow.</p>
          </div>
        )}

        <CollapsibleSection
          title="Compare templates"
          subtitle="Check ordering and contract differences before switching flows"
          preview={
            templatesList.length > 1
              ? `${templatesList[0]?.name ?? 'Template'} vs ${templatesList[1]?.name ?? 'Template'}`
              : 'Select two templates'
          }
        >
          <TemplateComparisonPanel
            templates={templatesList}
            leftTemplate={templatesList[0]?.name}
            rightTemplate={templatesList[1]?.name}
          />
        </CollapsibleSection>
      </div>
    </>
  );
}
