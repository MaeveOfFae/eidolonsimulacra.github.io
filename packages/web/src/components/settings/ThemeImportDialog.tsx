import { AlertTriangle, Loader2, Save, Upload } from 'lucide-react';
import type { ThemeColors } from '@char-gen/shared';
import {
  palettePreviewKeys,
  renderColorValue,
  sanitizeThemeName,
  type ThemePresetRecord,
} from '@/lib/themes/theme-helpers';

/**
 * Import-conflict dialog for the theme manager.
 *
 * Extracted from `Themes` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It shows the existing and
 * imported presets side by side with a palette diff, then offers the two real
 * resolutions: overwrite (custom presets only, since built-ins are read-only) or
 * import under a new name. The parent owns the draft, the diff and the mutation,
 * so this takes them as props plus four callbacks. Behavior is pinned by
 * `Themes.test.tsx` through the parent.
 */

export interface ImportedThemePayload {
  name: string;
  displayName: string;
  description: string;
  author: string;
  tags: string[];
  basedOn: string;
  colors: ThemeColors;
}

export interface ThemeImportDraft {
  file: File;
  imported: ImportedThemePayload;
  targetName: string;
  conflictTheme: ThemePresetRecord;
}

export interface ThemeImportDiffSection {
  title: string;
  changes: Array<{ label: string; existingValue: string; importedValue: string }>;
}

interface ThemeImportDialogProps {
  importDraft: ThemeImportDraft;
  importDiffCount: number;
  importDiffSections: ThemeImportDiffSection[];
  isImporting: boolean;
  onDismiss: () => void;
  onTargetNameChange: (targetName: string) => void;
  onOverwrite: () => void;
  onImportRenamed: () => void;
}

export default function ThemeImportDialog({
  importDraft,
  importDiffCount,
  importDiffSections,
  isImporting,
  onDismiss,
  onTargetNameChange,
  onOverwrite,
  onImportRenamed,
}: ThemeImportDialogProps) {
  return (
    <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Import conflict detected
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {importDraft.imported.displayName} wants to use the preset name{' '}
            {sanitizeThemeName(importDraft.imported.name)}, which already exists as{' '}
            {importDraft.conflictTheme.display_name}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {importDiffCount === 0
              ? 'The palettes are identical.'
              : `${importDiffCount} palette values differ across the imported and existing presets.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
        >
          Dismiss
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Existing preset</div>
              <div className="text-xs text-muted-foreground">{importDraft.conflictTheme.display_name}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">{importDraft.conflictTheme.name}</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {palettePreviewKeys.map((key) => (
              <span
                key={`existing-${key}`}
                className="h-8 w-8 rounded-full border border-black/10"
                style={{ backgroundColor: importDraft.conflictTheme.colors[key] }}
              />
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {importDraft.conflictTheme.description || 'No description'}
          </div>
          {(importDraft.conflictTheme.author ||
            importDraft.conflictTheme.based_on ||
            importDraft.conflictTheme.tags.length > 0) && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {importDraft.conflictTheme.author && <div>Author: {importDraft.conflictTheme.author}</div>}
              {importDraft.conflictTheme.based_on && <div>Based on: {importDraft.conflictTheme.based_on}</div>}
              {importDraft.conflictTheme.tags.length > 0 && (
                <div>Tags: {importDraft.conflictTheme.tags.join(', ')}</div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Imported preset</div>
              <div className="text-xs text-muted-foreground">{importDraft.imported.displayName}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {sanitizeThemeName(importDraft.imported.name)}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {palettePreviewKeys.map((key) => (
              <span
                key={`imported-${key}`}
                className="h-8 w-8 rounded-full border border-black/10"
                style={{ backgroundColor: importDraft.imported.colors[key] }}
              />
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {importDraft.imported.description || 'No description'}
          </div>
          {(importDraft.imported.author || importDraft.imported.basedOn || importDraft.imported.tags.length > 0) && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {importDraft.imported.author && <div>Author: {importDraft.imported.author}</div>}
              {importDraft.imported.basedOn && <div>Based on: {importDraft.imported.basedOn}</div>}
              {importDraft.imported.tags.length > 0 && <div>Tags: {importDraft.imported.tags.join(', ')}</div>}
            </div>
          )}
        </div>
      </div>

      {importDiffSections.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
          <div className="text-sm font-medium">Palette diff</div>
          <div className="mt-3 space-y-4">
            {importDiffSections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </div>
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="text-xs font-medium text-muted-foreground">Field</div>
                  <div className="text-xs font-medium text-muted-foreground">Existing</div>
                  <div className="text-xs font-medium text-muted-foreground">Imported</div>
                  {section.changes.map((change) => (
                    <>
                      <div
                        key={`${section.title}-${change.label}-label`}
                        className="rounded-md border border-border px-3 py-2 text-sm"
                      >
                        {change.label}
                      </div>
                      <div
                        key={`${section.title}-${change.label}-existing`}
                        className="rounded-md border border-border px-3 py-2"
                      >
                        {renderColorValue(change.existingValue)}
                      </div>
                      <div
                        key={`${section.title}-${change.label}-imported`}
                        className="rounded-md border border-border px-3 py-2"
                      >
                        {renderColorValue(change.importedValue)}
                      </div>
                    </>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        {!importDraft.conflictTheme.is_builtin && (
          <button
            type="button"
            onClick={onOverwrite}
            disabled={isImporting}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Overwrite existing custom preset
          </button>
        )}

        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="text-sm font-medium">Import as new preset</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Built-in presets cannot be overwritten. Rename the imported preset and keep both versions.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              type="text"
              value={importDraft.targetName}
              onChange={(event) => onTargetNameChange(event.target.value)}
              placeholder="new preset name"
              aria-label="New preset name"
              className="min-w-[220px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={onImportRenamed}
              disabled={isImporting || !importDraft.targetName.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import renamed preset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
