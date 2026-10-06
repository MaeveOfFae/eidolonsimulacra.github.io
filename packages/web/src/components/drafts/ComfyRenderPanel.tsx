import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Image as ImageIcon, Loader2, RefreshCw, Send } from 'lucide-react';
import {
  appendComfyRenderRecord,
  comfyViewUrl,
  createDefaultComfyUIConfig,
  type ComfyProgressEvent,
  type ComfyRenderRecord,
  type ComfyUIConfig,
  type Draft,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import type { ComfyRenderResult } from '@/lib/comfyui/run';
import { nextRenderAssetName, runComfyVariationBatch } from '@/lib/comfyui/run';
import { describeComfyTransportError, getComfyFetch } from '@/lib/comfyui/transport';
import { configManager } from '@/lib/config';
import ComfyRenderGallery from './ComfyRenderGallery';

/**
 * Approve → render → review, without leaving the app: sends the approved a1111 asset
 * to the configured ComfyUI server (one variation or a batch of up to four), shows live
 * websocket progress when the transport allows it, and displays the outputs inline.
 * The send action is gated on the asset's approval decision, matching the review
 * workflow's contract that only approved content flows downstream.
 *
 * Finished renders append to `metadata.comfy_renders`, and `ComfyRenderGallery` turns
 * that history plus any `render_<n>` draft assets into browsable tiles with per-record
 * actions (re-pin seed, promote to card image, save to draft). The panel pulls the
 * draft id from the route and talks to the API directly so the (line-budgeted) review
 * screen stays untouched.
 */
export interface ComfyRenderPanelProps {
  content: string;
  approved: boolean;
  /** Draft card image (data URL) used as the IPAdapter reference when enabled in settings. */
  referenceImageDataUrl?: string;
}

type RenderState =
  | { phase: 'idle' }
  | { phase: 'rendering' }
  | { phase: 'done'; results: ComfyRenderResult[]; warnings: string[] }
  | { phase: 'error'; message: string };

async function blobToPngDataUrl(blob: Blob): Promise<string | null> {
  if (blob.type !== 'image/png') {
    return null;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(blob);
  });
}

export default function ComfyRenderPanel({ content, approved, referenceImageDataUrl }: ComfyRenderPanelProps) {
  const { id: reviewId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [state, setState] = useState<RenderState>({ phase: 'idle' });
  const [seedInput, setSeedInput] = useState('');
  const [variationCount, setVariationCount] = useState('1');
  const [progress, setProgress] = useState<ComfyProgressEvent | null>(null);
  const [cardImageNotice, setCardImageNotice] = useState<string | null>(null);
  const [promotingPromptId, setPromotingPromptId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const draftQuery = useQuery({
    queryKey: ['draft', reviewId],
    queryFn: () => api.getDraft(reviewId!),
    enabled: Boolean(reviewId),
  });
  const savedRenders = useMemo(() => {
    const assets = draftQuery.data?.assets ?? {};
    return Object.entries(assets)
      .filter(([name, value]) => /^render_\d+$/.test(name) && typeof value === 'string' && value.startsWith('data:'))
      .map(([assetName, value]) => ({ assetName, dataUrl: value as string }))
      .sort((a, b) => Number(a.assetName.slice('render_'.length)) - Number(b.assetName.slice('render_'.length)));
  }, [draftQuery.data?.assets]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (state.phase === 'done') {
        for (const result of state.results) {
          for (const url of result.objectUrls) {
            URL.revokeObjectURL(url);
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ phase: 'rendering' });
    setProgress(null);
    setCardImageNotice(null);

    const config: ComfyUIConfig = configManager.getConfig().comfyui ?? createDefaultComfyUIConfig();
    const pinnedSeed = Number.parseInt(seedInput, 10);
    const count = Math.max(1, Math.min(4, Number.parseInt(variationCount, 10) || 1));

    const batch = await runComfyVariationBatch({
      config,
      a1111Content: content,
      referenceImageDataUrl,
      count,
      ...(Number.isFinite(pinnedSeed) ? { seed: pinnedSeed } : {}),
      signal: controller.signal,
      onProgress: (event) => setProgress(event),
    });
    setProgress(null);

    if (controller.signal.aborted) {
      for (const result of batch.results) {
        for (const url of result.objectUrls) {
          URL.revokeObjectURL(url);
        }
      }
      setState({ phase: 'idle' });
      return;
    }
    if (batch.results.length === 0) {
      setState({ phase: 'error', message: batch.errors[0] ?? 'Rendering failed.' });
      return;
    }

    // Surface the first used seed so "Render again" iterates reproducibly; clearing
    // the field returns to random seeds (pinned seeds ladder across the batch).
    setSeedInput(String(batch.results[0].seed));
    setState({ phase: 'done', results: batch.results, warnings: batch.errors });

    if (reviewId) {
      const renderedAt = new Date().toISOString();
      const records: ComfyRenderRecord[] = batch.results.map((result) => ({
        prompt_id: result.promptId,
        seed: result.seed,
        rendered_at: renderedAt,
        workflow_preset: config.workflow_preset,
        image_count: result.images.length,
        images: result.images,
      }));
      // Read the draft from the query cache at record time: the closure's query data
      // can be stale if the render finished before the draft query resolved.
      const cachedDraft = queryClient.getQueryData<Draft>(['draft', reviewId]);
      let upcoming = cachedDraft?.metadata.comfy_renders;
      for (const record of records) {
        upcoming = appendComfyRenderRecord(upcoming, record);
      }
      api
        .updateMetadata(reviewId, { comfy_renders: upcoming })
        .then(() => queryClient.invalidateQueries({ queryKey: ['draft', reviewId] }))
        .catch((historyError: unknown) => {
          console.warn('Failed to record the ComfyUI render history', historyError);
        });
    }
  };

  /** Fetch a record's first output through the transport and convert it to a PNG data URL. */
  const fetchRecordPng = async (record: ComfyRenderRecord): Promise<string> => {
    const config = configManager.getConfig().comfyui ?? createDefaultComfyUIConfig();
    const response = await getComfyFetch()(comfyViewUrl(config.base_url, record.images[0]!));
    if (!response.ok) {
      throw new Error(`Fetching the render failed with HTTP ${response.status}.`);
    }
    const dataUrl = await blobToPngDataUrl(await response.blob());
    if (!dataUrl) {
      throw new Error('Only PNG renders can be saved into the draft.');
    }
    return dataUrl;
  };

  const persistDataUrlAsset = async (assetName: string, dataUrl: string): Promise<void> => {
    await api.updateAsset(reviewId!, assetName, dataUrl, { overwrite: true });
    await queryClient.invalidateQueries({ queryKey: ['draft', reviewId] });
  };

  const handlePromoteToCardImage = async (record: ComfyRenderRecord) => {
    if (!reviewId || record.images.length === 0) {
      return;
    }
    setPromotingPromptId(record.prompt_id);
    setCardImageNotice(null);
    try {
      const dataUrl = await fetchRecordPng(record);
      await persistDataUrlAsset('card_image', dataUrl);
      setCardImageNotice('Render promoted to the draft card image — it now feeds the IPAdapter reference too.');
    } catch (error) {
      setCardImageNotice(describeComfyTransportError(error));
    } finally {
      setPromotingPromptId(null);
    }
  };

  const handleSaveRecordToDraft = async (record: ComfyRenderRecord) => {
    if (!reviewId || record.images.length === 0) {
      return;
    }
    setPromotingPromptId(record.prompt_id);
    setCardImageNotice(null);
    try {
      const dataUrl = await fetchRecordPng(record);
      const assetName = nextRenderAssetName(draftQuery.data?.assets ?? {});
      await persistDataUrlAsset(assetName, dataUrl);
      setCardImageNotice(`${assetName} saved into the draft — it shows up in the gallery below.`);
    } catch (error) {
      setCardImageNotice(describeComfyTransportError(error));
    } finally {
      setPromotingPromptId(null);
    }
  };

  /** Save one of the just-rendered images (already a local object URL) as a draft asset. */
  const handleSaveCurrentRender = async (objectUrl: string) => {
    if (!reviewId) {
      return;
    }
    setCardImageNotice(null);
    try {
      const response = await fetch(objectUrl);
      const dataUrl = await blobToPngDataUrl(await response.blob());
      if (!dataUrl) {
        throw new Error('Only PNG renders can be saved into the draft.');
      }
      const assetName = nextRenderAssetName(draftQuery.data?.assets ?? {});
      await persistDataUrlAsset(assetName, dataUrl);
      setCardImageNotice(`${assetName} saved into the draft.`);
    } catch (error) {
      setCardImageNotice(describeComfyTransportError(error));
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setState({ phase: 'idle' });
  };

  return (
    <section aria-label="ComfyUI render" className="rounded-xl border border-border/60 bg-background/45 p-2.5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          ComfyUI handoff
        </div>
        <div className="flex items-center gap-2">
          {state.phase === 'rendering' ? (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!approved || content.trim().length === 0}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {state.phase === 'done' ? <RefreshCw className="h-3 w-3" /> : <Send className="h-3 w-3" />}
              {state.phase === 'done' ? 'Render again' : 'Send to ComfyUI'}
            </button>
          )}
        </div>
      </div>

      {!approved && (
        <p className="mt-2 text-xs text-muted-foreground">
          Approve the a1111 asset first — only approved prompts are sent to the image pipeline.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor="comfy-seed" className="text-xs font-medium text-muted-foreground">
          Seed
        </label>
        <input
          id="comfy-seed"
          type="number"
          min={0}
          className="w-32 rounded-lg border border-input bg-background px-2 py-1 text-xs"
          value={seedInput}
          placeholder="random"
          onChange={(event) => setSeedInput(event.target.value)}
          disabled={state.phase === 'rendering'}
        />
        <label htmlFor="comfy-variations" className="text-xs font-medium text-muted-foreground">
          Variations
        </label>
        <input
          id="comfy-variations"
          type="number"
          min={1}
          max={4}
          className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-xs"
          value={variationCount}
          onChange={(event) => setVariationCount(event.target.value)}
          disabled={state.phase === 'rendering'}
        />
        <span className="text-xs text-muted-foreground">
          {seedInput.trim().length > 0
            ? 'pinned — a batch ladders seed, seed+1, …'
            : 'leave the seed empty for random rolls'}
        </span>
      </div>
      {state.phase === 'rendering' && (
        <div className="mt-2 space-y-1.5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Rendering on ComfyUI… this can take a minute on cold models.
            {progress?.value !== undefined && progress.max ? (
              <span className="font-mono">
                step {progress.value}/{progress.max}
                {progress.node ? ` · ${progress.node}` : ''}
              </span>
            ) : null}
          </p>
          {progress?.value !== undefined && progress.max ? (
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.max}
              aria-valuenow={progress.value}
              className="h-1.5 overflow-hidden rounded-full bg-background/60"
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }}
              />
            </div>
          ) : null}
        </div>
      )}
      {state.phase === 'error' && (
        <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {state.message}
        </p>
      )}
      {state.phase === 'done' && (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-muted-foreground">
            {state.results.length === 1 ? 'Rendered' : `Rendered ${state.results.length} variations`} ·{' '}
            {state.results.reduce((total, result) => total + result.images.length, 0)} image
            {state.results.reduce((total, result) => total + result.images.length, 0) === 1 ? '' : 's'}
            {state.warnings.length > 0 && (
              <span className="text-destructive"> · {state.warnings.length} variation failed</span>
            )}
          </p>
          {state.results.map((result) => (
            <div key={result.promptId} className="space-y-1">
              <p className="text-xs text-muted-foreground">
                seed <span className="font-mono">{result.seed}</span> ·{' '}
                <span className="font-mono">{result.promptId.slice(0, 8)}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.objectUrls.map((url, index) => (
                  <div key={url} className="overflow-hidden rounded-lg border border-border/60">
                    <a href={url} target="_blank" rel="noreferrer" aria-label={`Open render ${result.seed}`}>
                      <img src={url} alt={`ComfyUI render ${result.seed}-${index + 1}`} className="h-auto w-full" />
                    </a>
                    <div className="px-1.5 py-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => void handleSaveCurrentRender(url)}
                        className="rounded border border-input bg-background px-1.5 py-0.5 text-[10px] hover:bg-accent"
                        aria-label={`Save render ${result.seed} to draft`}
                      >
                        Save to draft
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Saved to the ComfyUI output folder. The seed is pinned above — Render again iterates on it, or clear it for
            a new roll.
          </p>
        </div>
      )}
      {cardImageNotice && (
        <p className="mt-2 rounded-md border border-border/60 bg-background/60 p-2 text-xs text-muted-foreground">
          {cardImageNotice}
        </p>
      )}
      <ComfyRenderGallery
        history={draftQuery.data?.metadata.comfy_renders}
        savedRenders={savedRenders}
        disabled={state.phase === 'rendering'}
        busyPromptId={promotingPromptId}
        onPinSeed={(seed) => setSeedInput(String(seed))}
        onUseAsCardImage={(record) => void handlePromoteToCardImage(record)}
        onSaveToDraft={(record) => void handleSaveRecordToDraft(record)}
      />
    </section>
  );
}
