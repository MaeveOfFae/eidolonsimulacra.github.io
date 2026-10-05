import { Link } from 'react-router-dom';
import { Archive, ArrowLeft, Check, Download, Edit3, RotateCcw, ShieldCheck, Star, X } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';

/**
 * Page hero for the review screen.
 *
 * Extracted from `Review` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It carries the name
 * editor, the draft-state pills and metrics, and the action row that holds the
 * `review-actions` / `review-validate` / `review-export` tour anchors. The
 * name-editing state and the validate / favorite / archive / export mutations stay
 * in the parent, which owns the draft. Behavior is pinned by `Review.test.tsx`
 * through the parent.
 */

interface ReviewHeroProps {
  metadata: DraftMetadata;
  assetCountLabel: string;
  isEditingName: boolean;
  editName: string;
  isSavingName: boolean;
  onEditName: () => void;
  onEditNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelNameEdit: () => void;
  onValidate: () => void;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onExport: () => void;
}

export default function ReviewHero({
  metadata,
  assetCountLabel,
  isEditingName,
  editName,
  isSavingName,
  onEditName,
  onEditNameChange,
  onSaveName,
  onCancelNameEdit,
  onValidate,
  onToggleFavorite,
  onArchive,
  onExport,
}: ReviewHeroProps) {
  return (
    <section className="app-page-hero">
      <div className="app-page-hero-grid">
        <div className="space-y-2.5 sm:space-y-3">
          <Link
            to="/drafts"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
          <p className="app-page-eyebrow">Review</p>
          {isEditingName ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                value={editName}
                onChange={(event) => onEditNameChange(event.target.value)}
                placeholder="Character name"
                aria-label="Character name"
                className="w-full min-w-0 rounded-xl border border-input bg-background px-3 py-2 text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[18rem] sm:text-2xl"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              />
              <button
                onClick={onSaveName}
                disabled={isSavingName}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save Name
              </button>
              <button
                onClick={onCancelNameEdit}
                disabled={isSavingName}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <h1 className="app-page-title text-[clamp(2rem,4vw,3.4rem)]">
                {metadata.character_name || metadata.seed}
              </h1>
              <button
                onClick={onEditName}
                className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
              >
                <Edit3 className="h-3 w-3" />
                Edit Name
              </button>
            </div>
          )}
          <p className="app-page-summary max-w-4xl">{metadata.seed}</p>
        </div>

        <div className="app-panel-muted min-w-0 p-3.5 sm:p-5">
          <p className="app-page-eyebrow">Draft state</p>
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <span className="app-pill app-pill-muted">{assetCountLabel} assets</span>
            {metadata.mode ? <span className="app-pill app-pill-muted">{metadata.mode}</span> : null}
            {metadata.template_name ? <span className="app-pill app-pill-muted">{metadata.template_name}</span> : null}
            {metadata.genre ? <span className="app-pill app-pill-muted">{metadata.genre}</span> : null}
          </div>
          <div className="mt-4 hidden sm:grid app-page-metrics">
            <div className="app-page-metric">
              <p className="app-page-metric-label">Assets</p>
              <div className="app-page-metric-value text-2xl">{assetCountLabel}</div>
            </div>
            <div className="app-page-metric">
              <p className="app-page-metric-label">Mode</p>
              <div className="app-page-metric-value text-xl sm:text-2xl">{metadata.mode || 'Unset'}</div>
            </div>
            <div className="app-page-metric">
              <p className="app-page-metric-label">Template</p>
              <div className="app-page-metric-value text-base sm:text-xl">{metadata.template_name || 'Unset'}</div>
            </div>
          </div>

          <div data-tour-anchor="review-actions" className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
            <button
              onClick={onValidate}
              data-tour-anchor="review-validate"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
            >
              <ShieldCheck className="h-4 w-4" />
              Validate
            </button>
            <button
              onClick={onToggleFavorite}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
            >
              <Star className={`h-4 w-4 ${metadata.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {metadata.favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={onExport}
              data-tour-anchor="review-export"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={onArchive}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent sm:justify-start"
            >
              {metadata.archived_at ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {metadata.archived_at ? 'Restore' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
