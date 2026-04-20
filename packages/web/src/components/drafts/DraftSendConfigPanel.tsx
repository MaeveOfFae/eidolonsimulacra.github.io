import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, RotateCcw, Save } from 'lucide-react';
import type { Draft, DraftMetadata, Template } from '@char-gen/shared';
import {
  getDefaultDraftComponentSendOrder,
  getDraftSendOrderWarnings,
  getEffectiveDraftComponentSendOrder,
  normalizeDraftComponentSendOrderForSave,
} from '@/lib/drafts/send-config';

interface DraftSendConfigPanelProps {
  draft: Draft;
  template?: Template;
  onSave: (updates: Partial<DraftMetadata>) => Promise<void>;
  isSaving?: boolean;
  title?: string;
  description?: string;
  transientInstructions?: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
    placeholder?: string;
  };
}

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export default function DraftSendConfigPanel({
  draft,
  template,
  onSave,
  isSaving = false,
  title = 'Outbound Send Settings',
  description = 'Saved instructions and send order used when this draft is sent back through generation tools.',
  transientInstructions,
}: DraftSendConfigPanelProps) {
  const persistedInstructions = draft.metadata.custom_instructions ?? '';
  const persistedOrder = useMemo(
    () => getEffectiveDraftComponentSendOrder(draft, template),
    [draft, template]
  );
  const defaultOrder = useMemo(
    () => getDefaultDraftComponentSendOrder(draft, template),
    [draft, template]
  );
  const persistedOrderKey = persistedOrder.join('\u0000');
  const defaultOrderKey = defaultOrder.join('\u0000');

  const [savedInstructions, setSavedInstructions] = useState(persistedInstructions);
  const [componentOrder, setComponentOrder] = useState<string[]>(persistedOrder);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSavedInstructions(persistedInstructions);
    setComponentOrder(persistedOrder);
    setSaveNotice(null);
    setSaveError(null);
  }, [persistedInstructions, persistedOrderKey]);

  const sendOrderWarnings = useMemo(
    () => getDraftSendOrderWarnings(componentOrder, template),
    [componentOrder, template]
  );
  const templateAssetNames = useMemo(
    () => new Set(template?.assets.map((asset) => asset.name) ?? []),
    [template]
  );
  const hasUnsavedChanges = savedInstructions !== persistedInstructions || !arraysEqual(componentOrder, persistedOrder);

  const moveAsset = (assetName: string, direction: -1 | 1) => {
    setComponentOrder((previous) => {
      const index = previous.indexOf(assetName);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleReset = () => {
    setSavedInstructions(persistedInstructions);
    setComponentOrder(persistedOrder);
    setSaveNotice(null);
    setSaveError(null);
  };

  const handleRestoreDefaultOrder = () => {
    setComponentOrder(defaultOrder);
    setSaveNotice(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    try {
      setSaveError(null);
      await onSave({
        custom_instructions: savedInstructions.trim() || undefined,
        component_send_order: normalizeDraftComponentSendOrderForSave(componentOrder, draft, template),
      });
      setSaveNotice('Saved outbound draft settings.');
    } catch (error) {
      setSaveNotice(null);
      setSaveError(error instanceof Error ? error.message : 'Failed to save outbound draft settings.');
    }
  };

  return (
    <section className="app-panel space-y-4 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        These settings affect outbound generation context only. They do not change the asset card order shown elsewhere on the page.
      </div>

      {(saveNotice || saveError) && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${saveError ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/30 bg-primary/10 text-foreground'}`}>
          {saveError || saveNotice}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="draft-send-custom-instructions">Saved draft instructions</label>
        <textarea
          id="draft-send-custom-instructions"
          value={savedInstructions}
          onChange={(event) => {
            setSavedInstructions(event.target.value);
            setSaveNotice(null);
            setSaveError(null);
          }}
          placeholder="Describe what should consistently be emphasized whenever this draft is sent back through generation."
          className="min-h-[112px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          This block is persisted with the draft and merged into later refinement or regeneration requests.
        </p>
      </div>

      {transientInstructions && (
        <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-4">
          <label className="text-sm font-medium" htmlFor="draft-send-transient-instructions">
            {transientInstructions.label || 'Transient send-only instructions'}
          </label>
          <textarea
            id="draft-send-transient-instructions"
            value={transientInstructions.value}
            onChange={(event) => transientInstructions.onChange(event.target.value)}
            placeholder={transientInstructions.placeholder || 'Temporary instructions for this session only.'}
            className="min-h-[96px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={transientInstructions.disabled}
          />
          <p className="text-xs text-muted-foreground">
            {transientInstructions.description || 'Merged with the saved instructions above for the current generation action only.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Component send order</h3>
            <p className="text-xs text-muted-foreground">
              Reorder the component context used when building prior assets for later generation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRestoreDefaultOrder}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
            disabled={defaultOrderKey === componentOrder.join('\u0000')}
          >
            <RotateCcw className="h-4 w-4" />
            Use template order
          </button>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3 sm:p-4">
          {componentOrder.map((assetName, index) => {
            const templateAsset = template?.assets.find((asset) => asset.name === assetName);
            const assetExists = Object.prototype.hasOwnProperty.call(draft.assets, assetName);
            const isTemplateAsset = templateAssetNames.has(assetName);

            return (
              <div key={assetName} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
                <div className="w-7 text-center text-xs font-medium text-muted-foreground">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium capitalize">{formatAssetLabel(assetName)}</span>
                    {!assetExists && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                        Missing
                      </span>
                    )}
                    {!isTemplateAsset && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-secondary-foreground">
                        Extra
                      </span>
                    )}
                  </div>
                  {templateAsset?.depends_on.length ? (
                    <p className="truncate text-xs text-muted-foreground">
                      Depends on: {templateAsset.depends_on.join(', ')}
                    </p>
                  ) : (
                    <p className="truncate text-xs text-muted-foreground">No declared dependencies.</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveAsset(assetName, -1)}
                    className="rounded-md border border-input bg-background p-2 hover:bg-accent disabled:opacity-40"
                    disabled={index === 0}
                    aria-label={`Move ${formatAssetLabel(assetName)} up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAsset(assetName, 1)}
                    className="rounded-md border border-input bg-background p-2 hover:bg-accent disabled:opacity-40"
                    disabled={index === componentOrder.length - 1}
                    aria-label={`Move ${formatAssetLabel(assetName)} down`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {sendOrderWarnings.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Dependency warnings
            </div>
            <div className="mt-2 space-y-1 text-xs sm:text-sm">
              {sendOrderWarnings.map((warning) => (
                <p key={`${warning.assetName}-${warning.dependencyNames.join('-')}`}>
                  {formatAssetLabel(warning.assetName)} now appears before {warning.dependencyNames.map(formatAssetLabel).join(', ')}. This is allowed, but later generation will follow your chosen order.
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!hasUnsavedChanges || isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save outbound settings
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasUnsavedChanges || isSaving}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset unsaved changes
        </button>
      </div>
    </section>
  );
}