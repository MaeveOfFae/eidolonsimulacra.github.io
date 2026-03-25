import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, Edit3, FileWarning, GitCompare, Loader2, RotateCcw, Save, Copy, X } from 'lucide-react';
import type { Blueprint } from '@char-gen/shared';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import { markdownComponents } from '../common/markdownComponents';
import { lintBlueprintContent, type BlueprintLintIssue } from './blueprintLint';

type ParsedBlueprintDocument = {
  metadata: {
    name: string;
    description: string;
    version: string;
    invokable: string;
    featureCategory?: string;
  };
  body: string;
};

function parseBlueprintDocument(rawContent: string): ParsedBlueprintDocument {
  const match = rawContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      metadata: {
        name: '',
        description: '',
        version: '',
        invokable: '',
        featureCategory: undefined,
      },
      body: rawContent,
    };
  }

  const metadataBlock = match[1];
  const body = match[2] ?? '';
  const readField = (field: string): string => {
    const fieldMatch = metadataBlock.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    return fieldMatch ? fieldMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };

  const featureCategory = readField('feature_category');

  return {
    metadata: {
      name: readField('name'),
      description: readField('description'),
      version: readField('version'),
      invokable: readField('invokable'),
      featureCategory: featureCategory || undefined,
    },
    body,
  };
}

function highlightBlueprintSource(source: string): string {
  const match = source.match(/^(---\n)([\s\S]*?)(\n---\n?)([\s\S]*)$/);
  if (!match) {
    return Prism.highlight(source, Prism.languages.markdown, 'markdown');
  }

  const [, openingFence, frontmatterBody, closingFence, markdownBody] = match;
  const highlightedFence = Prism.util.encode(`${openingFence}${closingFence.trimEnd()}`);
  const highlightedFrontmatter = Prism.highlight(frontmatterBody, Prism.languages.yaml, 'yaml');
  const highlightedBody = Prism.highlight(markdownBody, Prism.languages.markdown, 'markdown');

  return [
    `<span class="token punctuation">${Prism.util.encode(openingFence.trimEnd())}</span>`,
    highlightedFrontmatter,
    `<span class="token punctuation">${Prism.util.encode(closingFence)}</span>`,
    highlightedBody,
  ].join('');
}

function getLineStartIndex(content: string, lineNumber: number): number {
  if (lineNumber <= 1) {
    return 0;
  }

  let currentLine = 1;
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === '\n') {
      currentLine += 1;
      if (currentLine === lineNumber) {
        return index + 1;
      }
    }
  }

  return content.length;
}

export default function BlueprintEditor() {
  const params = useParams();
  const navigate = useNavigate();
  const blueprintPathParam = params['*'];
  const blueprintPath = blueprintPathParam ? decodeURIComponent(blueprintPathParam) : null;
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [rawContent, setRawContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modified, setModified] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'reset' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const sourceSyncRef = useRef(false);
  const previewSyncRef = useRef(false);

  // Load blueprint on mount
  useEffect(() => {
    const loadBlueprint = async () => {
      if (!blueprintPath) return;

      try {
        const data = await api.getBlueprint(blueprintPath);
        setBlueprint(data);

        // Check for original content
        const original = api.getOriginalBlueprintContent(blueprintPath);
        setOriginalContent(original);
        setRawContent(data.content);
        setShowPreview(false);
        setNotice(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blueprint');
      }
    };

    loadBlueprint();
  }, [blueprintPath]);

  // Track modifications
  useEffect(() => {
    if (blueprint) {
      setModified(rawContent !== blueprint.content);
    }
  }, [rawContent, blueprint]);

  // Warn on tab close / reload when there are unsaved changes.
  useEffect(() => {
    if (!modified) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modified]);

  useEffect(() => {
    const editorTextarea = document.getElementById('blueprint-source-editor') as HTMLTextAreaElement | null;
    const editorMirror = editorContainerRef.current?.querySelector('pre') as HTMLPreElement | null;

    if (!editorTextarea || !editorMirror) {
      return undefined;
    }

    const syncEditorMirror = () => {
      editorMirror.scrollTop = editorTextarea.scrollTop;
      editorMirror.scrollLeft = editorTextarea.scrollLeft;
    };

    const handleEditorMirrorScroll = () => {
      syncEditorMirror();
    };

    syncEditorMirror();
    editorTextarea.addEventListener('scroll', handleEditorMirrorScroll, { passive: true });

    return () => {
      editorTextarea.removeEventListener('scroll', handleEditorMirrorScroll);
    };
  }, [rawContent]);

  useEffect(() => {
    if (!showPreview) {
      return undefined;
    }

    const editorTextarea = document.getElementById('blueprint-source-editor') as HTMLTextAreaElement | null;
    const previewElement = previewContainerRef.current;

    if (!editorTextarea || !previewElement) {
      return undefined;
    }

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      const maxSourceScroll = source.scrollHeight - source.clientHeight;
      const maxTargetScroll = target.scrollHeight - target.clientHeight;

      if (maxSourceScroll <= 0 || maxTargetScroll <= 0) {
        target.scrollTop = 0;
        return;
      }

      const ratio = source.scrollTop / maxSourceScroll;
      target.scrollTop = ratio * maxTargetScroll;
    };

    const handleEditorScroll = () => {
      if (previewSyncRef.current) {
        previewSyncRef.current = false;
        return;
      }

      sourceSyncRef.current = true;
      syncScroll(editorTextarea, previewElement);
      window.requestAnimationFrame(() => {
        sourceSyncRef.current = false;
      });
    };

    const handlePreviewScroll = () => {
      if (sourceSyncRef.current) {
        sourceSyncRef.current = false;
        return;
      }

      previewSyncRef.current = true;
      syncScroll(previewElement, editorTextarea);
      window.requestAnimationFrame(() => {
        previewSyncRef.current = false;
      });
    };

    editorTextarea.addEventListener('scroll', handleEditorScroll, { passive: true });
    previewElement.addEventListener('scroll', handlePreviewScroll, { passive: true });

    return () => {
      editorTextarea.removeEventListener('scroll', handleEditorScroll);
      previewElement.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [showPreview, rawContent]);

  const confirmDiscardChanges = (): boolean => {
    if (!modified) {
      return true;
    }

    return window.confirm('You have unsaved changes. Are you sure you want to leave?');
  };

  const handleBackNavigation = () => {
    if (confirmDiscardChanges()) {
      navigate('/blueprints');
    }
  };

  const handleLintIssueClick = (issue: BlueprintLintIssue) => {
    const editorTextarea = document.getElementById('blueprint-source-editor') as HTMLTextAreaElement | null;
    if (!editorTextarea) {
      return;
    }

    const targetIndex = getLineStartIndex(rawContent, issue.line);
    const nextLineIndex = rawContent.indexOf('\n', targetIndex);
    const selectionEnd = nextLineIndex === -1 ? rawContent.length : nextLineIndex;

    setShowPreview(false);

    window.requestAnimationFrame(() => {
      editorTextarea.focus();
      editorTextarea.setSelectionRange(targetIndex, selectionEnd);

      const computedStyle = window.getComputedStyle(editorTextarea);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 26;
      const targetScrollTop = Math.max(0, (issue.line - 1) * lineHeight - lineHeight * 2);
      editorTextarea.scrollTop = targetScrollTop;
      editorTextarea.dispatchEvent(new Event('scroll'));
    });
  };

  const handleSave = async () => {
    if (!blueprint || !blueprintPath) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await api.updateBlueprint(blueprint.path, rawContent);
      setBlueprint(updated);
      setRawContent(updated.content);
      setOriginalContent(api.getOriginalBlueprintContent(updated.path));
      setModified(false);
      setNotice(
        updated.path !== blueprint.path
          ? `Created personal copy at ${updated.path}.`
          : `Saved ${updated.path}.`
      );
      if (updated.path !== blueprint.path) {
        navigate(`/blueprints/edit/${encodeURIComponent(updated.path)}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blueprint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!blueprint) return;
    setIsProcessing(true);
    try {
      await api.resetBlueprint(blueprint.path);
      setShowConfirmDialog(null);
      navigate('/blueprints');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset blueprint');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!blueprint) return;
    setIsProcessing(true);
    try {
      await api.deleteBlueprint(blueprint.path);
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

  const parsedDocument = parseBlueprintDocument(rawContent);
  const lintIssues = useMemo(() => lintBlueprintContent(rawContent, blueprint ? {
    category: blueprint.category,
    path: blueprint.path,
    featureCategory: blueprint.feature_category,
  } : undefined), [rawContent, blueprint]);
  const lintErrorCount = lintIssues.filter((issue) => issue.severity === 'error').length;
  const lintWarningCount = lintIssues.filter((issue) => issue.severity === 'warning').length;
  const displayName = parsedDocument.metadata.name || blueprint?.name || 'Blueprint';
  const displayDescription = parsedDocument.metadata.description || blueprint?.description || 'No description';
  const displayVersion = parsedDocument.metadata.version || blueprint?.version || 'unknown';
  const displayInvokable = parsedDocument.metadata.invokable || (blueprint ? String(blueprint.invokable) : 'unknown');
  const displayFeatureCategory = parsedDocument.metadata.featureCategory || blueprint?.feature_category || 'none';

  const hasOverride = originalContent !== null && blueprint?.content !== originalContent;
  const saveCreatesCopy = originalContent !== null && Boolean(blueprint && !blueprint.path.startsWith('blueprints/custom/'));

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
            onClick={(event) => {
              event.preventDefault();
              handleBackNavigation();
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-muted-foreground">/</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {hasOverride && (
                <span className="app-pill app-pill-amber !px-2 !py-1 !text-[11px]">
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
              className="app-button app-button-secondary"
              title="Compare with original"
            >
              <GitCompare className="h-4 w-4" />
              Diff
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="app-button app-button-secondary"
          >
            {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => void handleDuplicate()}
            disabled={isProcessing}
            className="app-button app-button-secondary"
            title="Duplicate blueprint"
          >
            <Copy className="h-4 w-4" />
          </button>
          {hasOverride && (
            <button
              onClick={() => setShowConfirmDialog('reset')}
              className="app-button app-button-secondary"
              title="Reset to original"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!modified || isSaving}
            className="app-button app-button-primary"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : saveCreatesCopy ? 'Save Copy' : 'Save'}
          </button>
        </div>
      </div>

      {/* Modified Warning */}
      {modified && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500">
          You have unsaved changes
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {notice}
        </div>
      )}

      {saveCreatesCopy && (
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          This is a built-in blueprint. Saving will create a custom copy in local storage or your synced account instead of overwriting the default.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Blueprint Summary</h2>

          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Path</p>
              <p className="mt-1 break-all font-mono text-sm">{blueprint.path}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-muted-foreground">{displayDescription}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Version</p>
                <p className="mt-1 text-sm font-medium">{displayVersion || 'unknown'}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invokable</p>
                <p className="mt-1 text-sm font-medium">{displayInvokable}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Feature</p>
                <p className="mt-1 text-sm font-medium">{displayFeatureCategory}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Editing mode</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This editor works on the full blueprint source, including YAML frontmatter. Treat it like a markdown contract surface, not a structured form.
              </p>
            </div>
          </div>

          <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">Live Lint</h3>
                <p className="mt-2">Runs the same lightweight blueprint checks against the content currently in the editor.</p>
              </div>
              {lintIssues.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <FileWarning className="h-5 w-5 text-amber-500" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="app-pill app-pill-muted">{lintErrorCount} errors</span>
              <span className="app-pill app-pill-muted">{lintWarningCount} warnings</span>
            </div>

            {lintIssues.length === 0 ? (
              <div className="mt-4 rounded-md border border-green-500/40 bg-green-500/10 p-3 text-green-700 dark:text-green-300">
                No obvious lint issues found.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {lintIssues.map((issue) => (
                  <button
                    key={`${issue.severity}-${issue.line}-${issue.message}`}
                    type="button"
                    onClick={() => handleLintIssueClick(issue)}
                    className={`flex items-start gap-2 rounded-md border p-3 ${issue.severity === 'error' ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{issue.message}</span>
                    <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide dark:bg-white/10">
                      line {issue.line}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Blueprint Source
          </h2>

          <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            <div ref={editorContainerRef} className="rounded-lg border border-border bg-card">
              <Editor
                value={rawContent}
                onValueChange={setRawContent}
                highlight={highlightBlueprintSource}
                padding={16}
                textareaClassName="blueprint-code-editor__textarea"
                preClassName="blueprint-code-editor__pre"
                className="blueprint-code-editor min-h-[70vh] text-sm leading-6"
                textareaId="blueprint-source-editor"
              />
            </div>

            {showPreview ? (
              <div ref={previewContainerRef} className="max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card p-4">
                <div className="mb-4 rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {rawContent.match(/^---\n[\s\S]*?\n---/)?.[0] || 'No frontmatter detected'}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{parsedDocument.body || '*No markdown body yet*'}</ReactMarkdown>
                </div>
              </div>
            ) : null}
          </div>
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
                    {rawContent}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowDiff(false)}
                className="app-button app-button-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDiff(false);
                  setShowConfirmDialog('reset');
                }}
                className="app-button app-button-destructive"
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
                className="app-button app-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog === 'reset' ? handleReset : handleDelete}
                disabled={isProcessing}
                className="app-button app-button-destructive"
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
