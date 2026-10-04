import type { ReactNode } from 'react';
import { CheckCircle, Copy, Download, Palette, Pencil, Trash2 } from 'lucide-react';
import type { ThemePresetRecord } from '@/lib/themes/theme-helpers';

/**
 * One preset card in the theme manager grid.
 *
 * Extracted from `Themes` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It renders the preset's
 * header, swatches and actions; the duplicate / rename / detail forms for that
 * preset arrive as `children`, so the card's DOM stays exactly as it was when the
 * forms lived inline. Behavior is pinned by `Themes.test.tsx` through the parent.
 */

interface ThemeCardProps {
  theme: ThemePresetRecord;
  isActive: boolean;
  isCustom: boolean;
  isCompact: boolean;
  isBusy: boolean;
  onActivate: () => void;
  onExport: () => void;
  onOpenDuplicate: () => void;
  onOpenMetadata: () => void;
  onOpenRename: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

export default function ThemeCard({
  theme,
  isActive,
  isCustom,
  isCompact,
  isBusy,
  onActivate,
  onExport,
  onOpenDuplicate,
  onOpenMetadata,
  onOpenRename,
  onDelete,
  children,
}: ThemeCardProps) {
  const actionButtonClass = isCompact
    ? 'inline-flex items-center gap-1.5 rounded-md border border-input px-2 py-1.5 text-xs hover:bg-accent disabled:opacity-50'
    : 'inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent disabled:opacity-50';

  return (
    <div
      className={`rounded-lg border bg-card ${isCompact ? 'p-3' : 'p-4'} ${isActive ? 'border-primary' : 'border-border'}`}
    >
      <div className={`flex ${isCompact ? 'flex-col gap-3' : 'items-start justify-between gap-4'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{theme.display_name}</h3>
            {isActive && <CheckCircle className="h-4 w-4 text-primary" />}
          </div>
          <div className="text-xs text-muted-foreground">{theme.name}</div>
          {isCompact ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5">
                  {theme.is_builtin ? 'Built-in' : 'Custom'}
                </span>
                {theme.author && <span>By {theme.author}</span>}
              </div>
              {theme.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {theme.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${theme.name}-${tag}`}
                      className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {theme.tags.length > 3 && (
                    <span className="text-[11px] text-muted-foreground">+{theme.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">{theme.description || 'No description'}</p>
              {(theme.author || theme.based_on || theme.tags.length > 0) && (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {theme.author && <div>Author: {theme.author}</div>}
                  {theme.based_on && <div>Based on: {theme.based_on}</div>}
                  {theme.tags.length > 0 && <div>Tags: {theme.tags.join(', ')}</div>}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {[theme.colors.background, theme.colors.surface, theme.colors.accent, theme.colors.button].map(
            (color, index) => (
              <span
                key={`${theme.name}-${index}-${color}`}
                className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} rounded-full border border-black/10`}
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onActivate} disabled={isBusy} className={actionButtonClass}>
          <Palette className="h-4 w-4" />
          Activate
        </button>
        <button type="button" onClick={onExport} disabled={isBusy} className={actionButtonClass}>
          <Download className="h-4 w-4" />
          Export
        </button>
        <button type="button" onClick={onOpenDuplicate} disabled={isBusy} className={actionButtonClass}>
          <Copy className="h-4 w-4" />
          Duplicate
        </button>
        {isCustom && (
          <>
            <button type="button" onClick={onOpenMetadata} disabled={isBusy} className={actionButtonClass}>
              <Pencil className="h-4 w-4" />
              Edit details
            </button>
            <button type="button" onClick={onOpenRename} disabled={isBusy} className={actionButtonClass}>
              <Pencil className="h-4 w-4" />
              Rename
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isBusy}
              className={`${isCompact ? 'inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50' : 'inline-flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50'}`}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </>
        )}
      </div>
      {children}
    </div>
  );
}
