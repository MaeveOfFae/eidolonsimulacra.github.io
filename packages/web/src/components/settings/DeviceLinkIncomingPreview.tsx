import type { DesktopCompanionSyncPreview } from '../../lib/device-link.js';

/**
 * Incoming sync preview card for the device-link settings screen.
 *
 * Extracted from `DeviceLinkSettings` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). Renders the four domain
 * summaries (drafts, templates, blueprints, config), the model-impact line, and the
 * conflicting/new item lists for a bundle the desktop companion is holding. It is pure
 * presentation plus three props, so every count comes from the preview payload it is
 * given. Behavior is pinned by `DeviceLinkSettings.test.tsx`.
 */

interface DeviceLinkIncomingPreviewProps {
  preview: DesktopCompanionSyncPreview | null;
  previewLoading: boolean;
  incomingSourceTrusted: boolean;
}

export default function DeviceLinkIncomingPreview({
  preview,
  previewLoading,
  incomingSourceTrusted,
}: DeviceLinkIncomingPreviewProps) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Incoming Sync Preview</div>
        {previewLoading && <span className="text-xs">Loading…</span>}
      </div>

      {preview ? (
        <>
          {preview.source && (
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-xs ${incomingSourceTrusted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'}`}
            >
              Incoming from {preview.source.name} ({preview.source.platform}/{preview.source.runtime})
              {incomingSourceTrusted ? ' • trusted sender' : ' • untrusted sender'}.
              {!incomingSourceTrusted && ' Review before applying or mark this sender as trusted.'}
            </div>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Drafts</div>
              <div className="mt-1 text-sm text-foreground">{preview.domains.drafts.incomingCount} incoming</div>
              <div className="mt-1 text-xs">
                {preview.domains.drafts.conflictingReviewIds} conflicts · {preview.domains.drafts.identicalReviewIds}{' '}
                same · {preview.domains.drafts.newReviewIds} new
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Templates</div>
              <div className="mt-1 text-sm text-foreground">{preview.domains.templates.incomingCount} incoming</div>
              <div className="mt-1 text-xs">
                {preview.domains.templates.conflictingNames} copies · {preview.domains.templates.identicalNames} same ·{' '}
                {preview.domains.templates.newNames} new
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Blueprints</div>
              <div className="mt-1 text-sm text-foreground">{preview.domains.blueprints.incomingCount} incoming</div>
              <div className="mt-1 text-xs">
                {preview.domains.blueprints.conflictingPaths} copies · {preview.domains.blueprints.overridingPaths}{' '}
                overrides · {preview.domains.blueprints.newPaths} new
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Config</div>
              <div className="mt-1 text-sm text-foreground">
                {preview.domains.config.hasConfig ? 'Included' : 'Not included'}
              </div>
              <div className="mt-1 text-xs">
                {preview.domains.config.importedSettingFields} fields would merge ·{' '}
                {preview.domains.config.importedApiKeys} API keys would fill
              </div>
            </div>
          </div>

          {preview.domains.config.hasConfig && (
            <p className="mt-3 text-xs">
              Model impact: incoming {preview.domains.config.incomingModel || 'unset'} → current{' '}
              {preview.domains.config.currentModel || 'unset'}
              {preview.domains.config.modelWillChange ? ' (will change).' : ' (unchanged).'}
            </p>
          )}
          {preview.domains.drafts.conflictingDrafts.length > 0 && (
            <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conflicting Drafts
              </div>
              <div className="mt-2 space-y-1 text-xs">
                {preview.domains.drafts.conflictingDrafts.slice(0, 6).map((draft) => (
                  <div key={draft.reviewId}>
                    <span className="text-foreground">{draft.reviewId}</span>: incoming{' '}
                    <span className="text-foreground">{draft.incomingName}</span> vs current{' '}
                    <span className="text-foreground">{draft.currentName}</span> · will preserve as a copy
                  </div>
                ))}
                {preview.domains.drafts.conflictingDrafts.length > 6 && (
                  <div>+{preview.domains.drafts.conflictingDrafts.length - 6} more conflicting drafts</div>
                )}
              </div>
            </div>
          )}
          {preview.domains.drafts.newDrafts.length > 0 && (
            <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">New drafts</div>
              <div className="mt-2 space-y-1 text-xs">
                {preview.domains.drafts.newDrafts.slice(0, 6).map((draft) => (
                  <div key={draft.reviewId}>
                    <span className="text-foreground">{draft.incomingName}</span>{' '}
                    <span className="text-muted-foreground">({draft.reviewId})</span>
                  </div>
                ))}
                {preview.domains.drafts.newDrafts.length > 6 && (
                  <div>+{preview.domains.drafts.newDrafts.length - 6} more new drafts</div>
                )}
              </div>
            </div>
          )}
          {preview.domains.templates.incomingCount > 0 && (
            <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Templates</div>
              <div className="mt-2 text-xs">
                {preview.domains.templates.conflictingTemplates.length > 0 && (
                  <div>
                    Conflicting copies:{' '}
                    {preview.domains.templates.conflictingTemplates
                      .slice(0, 4)
                      .map((template) => `${template.incomingName} -> ${template.importedName}`)
                      .join(', ')}
                    {preview.domains.templates.conflictingTemplates.length > 4 ? '…' : ''}
                  </div>
                )}
                {preview.domains.templates.newTemplateNames.length > 0 && (
                  <div className="mt-1">
                    New: {preview.domains.templates.newTemplateNames.slice(0, 6).join(', ')}
                    {preview.domains.templates.newTemplateNames.length > 6 ? '…' : ''}
                  </div>
                )}
                {preview.domains.templates.identicalNames > 0 && (
                  <div className="mt-1">Unchanged matches: {preview.domains.templates.identicalNames}</div>
                )}
              </div>
            </div>
          )}
          {preview.domains.blueprints.incomingCount > 0 && (
            <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Blueprint Overrides
              </div>
              <div className="mt-2 text-xs">
                {preview.domains.blueprints.conflictingBlueprints.length > 0 && (
                  <div>
                    Conflicting copies:{' '}
                    {preview.domains.blueprints.conflictingBlueprints
                      .slice(0, 3)
                      .map((blueprint) => `${blueprint.incomingPath} -> ${blueprint.importedPath}`)
                      .join(', ')}
                    {preview.domains.blueprints.conflictingBlueprints.length > 3 ? '…' : ''}
                  </div>
                )}
                {preview.domains.blueprints.overridingBlueprintPaths.length > 0 && (
                  <div className="mt-1">
                    Incoming overrides: {preview.domains.blueprints.overridingBlueprintPaths.slice(0, 4).join(', ')}
                    {preview.domains.blueprints.overridingBlueprintPaths.length > 4 ? '…' : ''}
                  </div>
                )}
                {preview.domains.blueprints.newBlueprintPaths.length > 0 && (
                  <div className="mt-1">
                    New: {preview.domains.blueprints.newBlueprintPaths.slice(0, 4).join(', ')}
                    {preview.domains.blueprints.newBlueprintPaths.length > 4 ? '…' : ''}
                  </div>
                )}
                {preview.domains.blueprints.identicalPaths > 0 && (
                  <div className="mt-1">Unchanged matches: {preview.domains.blueprints.identicalPaths}</div>
                )}
              </div>
            </div>
          )}
          <p className="mt-2 text-xs">Snapshot exported at {new Date(preview.exportedAt).toLocaleString()}.</p>
          <p className="mt-2 text-xs">
            Sync apply is additive. New records are imported directly, and conflicting drafts are preserved as copies
            instead of overwriting the current desktop version.
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs">No preview is available yet for the incoming sync snapshot.</p>
      )}
    </div>
  );
}
