import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Edit2, Copy, Check } from 'lucide-react';

interface BlueprintPanelProps {
  /** Blueprint name (used as key) */
  blueprintName: string;
  /** Full blueprint content (markdown with frontmatter) */
  blueprintContent: string;
  /** Title to display */
  title?: string;
  /** Description */
  description?: string;
  /** Available blueprints to choose from */
  availableBlueprints?: Array<{ name: string; label: string }>;
  /** Callback when blueprint is selected */
  onBlueprintSelect?: (name: string) => void;
  /** Callback when content is edited (for runtime override) */
  onContentChange?: (content: string) => void;
  /** Whether editing is enabled */
  editable?: boolean;
  /** Expand panel content initially */
  defaultExpanded?: boolean;
}

export function BlueprintPanel({
  blueprintName,
  blueprintContent,
  title = 'Blueprint',
  description,
  availableBlueprints,
  onBlueprintSelect,
  onContentChange,
  editable = false,
  defaultExpanded = true,
}: BlueprintPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(blueprintContent);
  const [copiedContent, setCopiedContent] = useState(false);
  const normalizedBlueprintContent = useMemo(() => blueprintContent.replace(/\r\n?/g, '\n'), [blueprintContent]);

  useEffect(() => {
    setEditedContent(blueprintContent);
    setIsEditing(false);
  }, [blueprintContent, blueprintName]);

  // Extract frontmatter info
  const frontmatterMatch = useMemo(() => {
    const match = normalizedBlueprintContent.match(/^---\n([\s\S]*?)\n---/);
    return match?.[1] || '';
  }, [normalizedBlueprintContent]);

  const bodyContent = useMemo(() => {
    const match = normalizedBlueprintContent.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
    if (!match) {
      return normalizedBlueprintContent;
    }

    return match[1].trim();
  }, [normalizedBlueprintContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blueprintContent);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (error) {
      console.error('Failed to copy blueprint', error);
    }
  };

  const handleSaveEdit = () => {
    if (onContentChange) {
      onContentChange(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(blueprintContent);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40 bg-background/40">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1 opacity-75">
              Blueprint: <code className="bg-background/60 px-1.5 py-0.5 rounded text-[10px]">{blueprintName}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editable && (
            <button
              type="button"
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
          >
            {copiedContent ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-background/60 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Blueprint Selector */}
      {availableBlueprints && availableBlueprints.length > 0 && (
        <div className="px-4 py-3 border-b border-border/40 bg-background/50">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Choose blueprint
          </label>
          <select
            value={blueprintName}
            onChange={(e) => onBlueprintSelect?.(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm font-medium bg-background text-foreground"
          >
            {availableBlueprints.map((bp) => (
              <option key={bp.name} value={bp.name}>
                {bp.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {isEditing ? (
            <div className="p-4 space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-64 p-3 rounded-md border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-2 rounded-md border border-border/60 text-sm font-medium text-foreground hover:bg-background/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {frontmatterMatch && (
                <div className="bg-background/60 rounded-md p-3 text-xs">
                  <p className="text-muted-foreground font-semibold mb-2">Frontmatter:</p>
                  <pre className="text-[10px] text-muted-foreground overflow-x-auto font-mono whitespace-pre-wrap break-words">
                    {frontmatterMatch}
                  </pre>
                </div>
              )}

              <div className="bg-background/60 rounded-md p-3">
                <p className="text-muted-foreground font-semibold text-xs mb-2">Content:</p>
                <pre className="text-[11px] text-foreground overflow-x-auto font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto leading-relaxed">
                  {bodyContent}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
