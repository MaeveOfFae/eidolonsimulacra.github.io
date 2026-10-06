import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { History, Image as ImageIcon, Loader2, RefreshCw, Send } from 'lucide-react';
import {
  appendComfyRenderRecord,
  comfyViewUrl,
  createDefaultComfyUIConfig,
  normalizeComfyRenderHistory,
  type ComfyRenderRecord,
  type ComfyUIConfig,
  type Draft,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import type { ComfyRenderResult } from '@/lib/comfyui/run';
import { runComfyRender } from '@/lib/comfyui/run';
import { describeComfyTransportError, getComfyFetch } from '@/lib/comfyui/transport';
import { configManager } from '@/lib/config';

/**
 * Approve → render → review, without leaving the app: sends the approved a1111 asset
 * to the configured ComfyUI server, polls until the render finishes, and shows the
 * outputs inline. The send action is gated on the asset's approval decision, matching
 * the review workflow's contract that only approved content flows downstream.
 *
 * Every finished render is appended to `metadata.comfy_renders` (newest first, capped),
 * and the history rows can re-pin their seed or promote their first output to the
 * draft's card image — which then feeds the IPAdapter reference on the next render.
 * The panel pulls the draft id from the route and talks to the API directly so the
 * (line-budgeted) review screen stays untouched.
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
  | { phase: 'done'; result: ComfyRenderResult }
  | { phase: 'error'; message: string };

const MAX_VISIBLE_HISTORY = 5;

function formatRenderAge(iso: string): string {
  const renderedAt = new Date(iso).getTime();
  if (!Number.isFinite(renderedAt)) {
    return '';
  }
  const minutes = Math.round((Date.now() - renderedAt) / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.round(hours / 24)}d ago`;
}

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
  const [cardImageNotice, setCardImageNotice] = useState<string | null>(null);
  const [promotingPromptId, setPromotingPromptId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const draftQuery = useQuery({
    queryKey: ['draft', reviewId],
    queryFn: () => api.getDraft(reviewId!),
    enabled: Boolean(reviewId),
  });
  const renderHistory = useMemo(
    () => normalizeComfyRenderHistory(draftQuery.data?.metadata.comfy_renders),
    [draftQuery.data?.metadata.comfy_renders],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (state.phase === 'done') {
        for (const url of state.result.objectUrls) {
          URL.revokeObjectURL(url);
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
    setCardImageNotice(null);

    const config: ComfyUIConfig = configManager.getConfig().comfyui ?? createDefaultComfyUIConfig();
    const pinnedSeed = Number.parseInt(seedInput, 10);
    try {
      const result = await runComfyRender({
        config,
        a1111Content: content,
        referenceImageDataUrl,
        ...(Number.isFinite(pinnedSeed) ? { seed: pinnedSeed } : {}),
        signal: controller.signal,
      });
      // Surface the used seed so "Render again" iterates on it reproducibly; clearing
      // the field returns to random seeds.
      setSeedInput(String(result.seed));
      setState({ phase: 'done', result });

      if (reviewId) {
        const record: ComfyRenderRecord = {
          prompt_id: result.promptId,
          seed: result.seed,
          rendered_at: new Date().toISOString(),
          workflow_preset: config.workflow_preset,
          image_count: result.images.length,
          images: result.images,
        };
        // Read the draft from the query cache at record time: the closure's query data
        // can be stale if the render finished before the draft query resolved.
        const cachedDraft = queryClient.getQueryData<Draft>(['draft', reviewId]);
        api
          .updateMetadata(reviewId, {
            comfy_renders: appendComfyRenderRecord(cachedDraft?.metadata.comfy_renders, record),
          })
          .then(() => queryClient.invalidateQueries({ queryKey: ['draft', reviewId] }))
          .catch((historyError: unknown) => {
            console.warn('Failed to record the ComfyUI render history', historyError);
          });
      }
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ phase: 'idle' });
        return;
      }
      setState({ phase: 'error', message: describeComfyTransportError(error) });
    }
  };

  const handlePromoteToCardImage = async (record: ComfyRenderRecord) => {
    if (!reviewId || record.images.length === 0) {
      return;
    }
    const config = configManager.getConfig().comfyui ?? createDefaultComfyUIConfig();
    setPromotingPromptId(record.prompt_id);
    setCardImageNotice(null);
    try {
      const response = await getComfyFetch()(comfyViewUrl(config.base_url, record.images[0]!));
      if (!response.ok) {
        throw new Error(`Fetching the render failed with HTTP ${response.status}.`);
      }
      const dataUrl = await blobToPngDataUrl(await response.blob());
      if (!dataUrl) {
        throw new Error('Only PNG renders can become the card image.');
      }
      await api.updateAsset(reviewId, 'card_image', dataUrl, { overwrite: true });
      await queryClient.invalidateQueries({ queryKey: ['draft', reviewId] });
      setCardImageNotice('Render promoted to the draft card image — it now feeds the IPAdapter reference too.');
    } catch (error) {
      setCardImageNotice(describeComfyTransportError(error));
    } finally {
      setPromotingPromptId(null);
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
      <div className="mt-2 flex items-center gap-2">
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
        <span className="text-xs text-muted-foreground">
          {seedInput.trim().length > 0 ? 'pinned — renders repeat this seed' : 'leave empty for a random seed'}
        </span>
      </div>
      {state.phase === 'rendering' && (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Rendering on ComfyUI… this can take a minute on cold models.
        </p>
      )}
      {state.phase === 'error' && (
        <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {state.message}
        </p>
      )}
      {state.phase === 'done' && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            Rendered · seed <span className="font-mono">{state.result.seed}</span> · {state.result.images.length} image
            {state.result.images.length === 1 ? '' : 's'} ·{' '}
            <span className="font-mono">{state.result.promptId.slice(0, 8)}</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {state.result.objectUrls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open rendered image ${index + 1}`}
                className="block overflow-hidden rounded-lg border border-border/60"
              >
                <img src={url} alt={`ComfyUI render ${index + 1}`} className="h-auto w-full" />
              </a>
            ))}
          </div>
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
      {renderHistory.length > 0 && (
        <div className="mt-2 space-y-1.5">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Recent renders ({renderHistory.length})
          </p>
          {renderHistory.slice(0, MAX_VISIBLE_HISTORY).map((record) => (
            <div
              key={record.prompt_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-2 py-1.5 text-xs"
            >
              <span className="text-muted-foreground">
                seed <span className="font-mono">{record.seed}</span> · {record.image_count} img ·{' '}
                {formatRenderAge(record.rendered_at)} · {record.workflow_preset}
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSeedInput(String(record.seed))}
                  className="rounded-md border border-input bg-background px-1.5 py-0.5 text-xs hover:bg-accent"
                  aria-label={`Pin seed ${record.seed}`}
                >
                  Pin seed
                </button>
                <button
                  type="button"
                  onClick={() => void handlePromoteToCardImage(record)}
                  disabled={promotingPromptId === record.prompt_id}
                  className="rounded-md border border-input bg-background px-1.5 py-0.5 text-xs hover:bg-accent disabled:opacity-50"
                  aria-label={`Use render ${record.prompt_id.slice(0, 8)} as card image`}
                >
                  {promotingPromptId === record.prompt_id ? 'Promoting…' : 'Use as card image'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
