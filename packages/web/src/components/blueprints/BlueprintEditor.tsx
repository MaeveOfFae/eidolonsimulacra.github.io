import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useBlocker } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Eye, Edit3, X, RotateCcw, Copy, Trash2, GitCompare, Loader2 } from 'lucide-react';
import type { Blueprint, FeatureCategory } from '@char-gen/shared';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface BlueprintFormData {
  name: string;
  description: string;
  invokable: boolean;
  versionMajor: number;
  versionMinor: number;
  featureCategory?: FeatureCategory;
}

export default function BlueprintEditor() {
  const params = useParams();
  const navigate = useNavigate();
  const blueprintPathParam = params['*'];
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [formData, setFormData] = useState<BlueprintFormData>({
    name: '',
    description: '',
    invokable: true,
    versionMajor: 1,
    versionMinor: 0,
    featureCategory: undefined,
  });
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modified, setModified] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'reset' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load blueprint on mount
  useEffect(() => {
    const loadBlueprint = async () => {
      if (!blueprintPathParam) return;

      try {
        const path = decodeURIComponent(blueprintPathParam);
        const data = await api.getBlueprint(path);
        setBlueprint(data);

        // Check for original content
        const original = api.getOriginalBlueprintContent(path);
        setOriginalContent(original);

        // Parse version from "X.Y" format
        const [major = 1, minor = 0] = data.version.split('.').map(Number);
        setFormData({
          name: data.name,
          description: data.description,
          invokable: data.invokable,
          versionMajor: major,
          versionMinor: minor,
          featureCategory: data.feature_category,
        });

        // Split content into frontmatter and body
        const blueprintContent = data.content;
        const frontmatterEnd = blueprintContent.indexOf('---', blueprintContent.indexOf('---') + 3);
        if (frontmatterEnd > 0) {
          setContent(blueprintContent.slice(frontmatterEnd + 3).trim());
        } else {
          setContent(blueprintContent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blueprint');
      }
    };

    loadBlueprint();
  }, [blueprintPathParam]);

  // Track modifications
  useEffect(() => {
    if (blueprint) {
      const hasChanges =
        formData.name !== blueprint.name ||
        formData.description !== blueprint.description ||
        formData.invokable !== blueprint.invokable ||
        `${formData.versionMajor}.${formData.versionMinor}` !== blueprint.version ||
        formData.featureCategory !== blueprint.feature_category ||
        content !== blueprint.content;
      setModified(hasChanges);
    }
  }, [formData, content, blueprint]);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      modified && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle confirmed navigation
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  const handleSave = async () => {
    if (!blueprintPathParam || !blueprint) return;

    setIsSaving(true);
    setError(null);

    try {
      // Build frontmatter with optional feature_category
      let frontmatter = `---
name: ${formData.name}
description: ${formData.description}
invokable: ${formData.invokable}
version: ${formData.versionMajor}.${formData.versionMinor}`;
      if (formData.featureCategory) {
        frontmatter += `\nfeature_category: ${formData.featureCategory}`;
      }
      frontmatter += `\n---`;

      // Combine frontmatter and content
      const fullContent = `${frontmatter}
${content.trim()}`;

      const updated = await api.updateBlueprint(blueprint.path, fullContent);
      setBlueprint(updated);
      setModified(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blueprint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!blueprintPathParam) return;
    setIsProcessing(true);
    try {
      await api.resetBlueprint(blueprintPathParam);
      setShowConfirmDialog(null);
      navigate('/blueprints');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset blueprint');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!blueprintPathParam) return;
    setIsProcessing(true);
    try {
      await api.resetBlueprint(blueprintPathParam);
      setShowConfirmDialog(null);
      navigate('/blueprints');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blueprint');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    if (!blueprint) return;
    const name = prompt('Enter name for the duplicate:', `${blueprint.name} Copy`);
    if (!name) return;

    setIsProcessing(true);
    try {
      const targetPath = `blueprints/custom/${name.toLowerCase().replace(/\s+/g, '_')}.md`;
      await api.duplicateBlueprint(blueprint.path, targetPath);
      navigate(`/blueprints/edit/${encodeURIComponent(targetPath)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate blueprint');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateYAMLPreview = () => {
    let yaml = `---
name: ${formData.name}
description: ${formData.description}
invokable: ${formData.invokable}
version: ${formData.versionMajor}.${formData.versionMinor}`;
    if (formData.featureCategory) {
      yaml += `\nfeature_category: ${formData.featureCategory}`;
    }
    yaml += `\n---`;
    return yaml;
  };

  const hasOverride = originalContent !== null && blueprint?.content !== originalContent;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <X className="h-5 w-5" />
          <h3 className="font-semibold">Error</h3>
        </div>
        <p className="text-sm text-destructive/80 mb-4">{error}</p>
        <Link
          to="/blueprints"
          className="inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blueprints
        </Link>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading blueprint...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/blueprints"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-muted-foreground">/</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{formData.name}</h1>
              {hasOverride && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Edited
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {blueprint.category}
            </p>
            <p className="text-sm text-muted-foreground">
              {blueprint.path}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasOverride && originalContent && (
            <button
              onClick={() => setShowDiff(true)}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              title="Compare with original"
            >
              <GitCompare className="h-4 w-4" />
              Diff
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => void handleDuplicate()}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            title="Duplicate blueprint"
          >
            <Copy className="h-4 w-4" />
          </button>
          {hasOverride && (
            <button
              onClick={() => setShowConfirmDialog('reset')}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              title="Reset to original"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!modified || isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Modified Warning */}
      {modified && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500">
          You have unsaved changes
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frontmatter Editor */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Frontmatter
          </h2>

          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="blueprint_name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description of this blueprint"
              />
            </div>

            {/* Version */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Version (Major)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.versionMajor}
                  onChange={(e) => setFormData({ ...formData, versionMajor: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Version (Minor)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.versionMinor}
                  onChange={(e) => setFormData({ ...formData, versionMinor: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Invokable */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.invokable}
                onChange={(e) => setFormData({ ...formData, invokable: e.target.checked })}
                className="rounded border-input"
              />
              Invokable (can be used as a tool)
            </label>

            {/* Feature Category */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Feature Category</label>
              <select
                value={formData.featureCategory || ''}
                onChange={(e) => setFormData({ ...formData, featureCategory: e.target.value as FeatureCategory || undefined })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">None (General Purpose)</option>
                <option value="character_generation">Character Generation</option>
                <option value="offspring_generation">Offspring Generation</option>
                <option value="validation">Validation</option>
                <option value="similarity">Similarity Analysis</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Assign to a feature to make it available as a default in Settings.
              </p>
            </div>

            {/* YAML Preview */}
            <div>
              <label className="block text-sm font-medium mb-1.5">YAML Preview</label>
              <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                {generateYAMLPreview()}
              </pre>
            </div>
          </div>
        </div>

        {/* Markdown Content Editor/Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content
          </h2>

          {showPreview ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[500px] rounded-md border-0 bg-transparent p-4 text-sm font-mono focus-visible:outline-none"
                placeholder="Enter markdown content here..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Diff Dialog */}
      {showDiff && originalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDiff(false)} />
          <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Compare: Original vs Current</h2>
              <button onClick={() => setShowDiff(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Original</h3>
                  <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto max-h-[60vh] whitespace-pre-wrap">
                    {originalContent}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Current</h3>
                  <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto max-h-[60vh] whitespace-pre-wrap">
                    {blueprint?.content}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowDiff(false)}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDiff(false);
                  setShowConfirmDialog('reset');
                }}
                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset to Original
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isProcessing && setShowConfirmDialog(null)} />
          <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold">
              {showConfirmDialog === 'reset' ? 'Reset Blueprint?' : 'Delete Blueprint?'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {showConfirmDialog === 'reset'
                ? 'This will revert the blueprint to its original content. Your changes will be lost.'
                : 'This will delete this blueprint. This action cannot be undone.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog === 'reset' ? handleReset : handleDelete}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Processing...' : showConfirmDialog === 'reset' ? 'Reset' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
