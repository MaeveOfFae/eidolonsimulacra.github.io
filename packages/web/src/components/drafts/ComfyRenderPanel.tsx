import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, RefreshCw, Send } from 'lucide-react';
import { createDefaultComfyUIConfig } from '@char-gen/shared';
import type { ComfyRenderResult } from '@/lib/comfyui/run';
import { runComfyRender } from '@/lib/comfyui/run';
import { describeComfyTransportError } from '@/lib/comfyui/transport';
import { configManager } from '@/lib/config';

/**
 * Approve → render → review, without leaving the app: sends the approved a1111 asset
 * to the configured ComfyUI server, polls until the render finishes, and shows the
 * outputs inline. The send action is gated on the asset's approval decision, matching
 * the review workflow's contract that only approved content flows downstream.
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

export default function ComfyRenderPanel({ content, approved, referenceImageDataUrl }: ComfyRenderPanelProps) {
  const [state, setState] = useState<RenderState>({ phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

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

    try {
      const result = await runComfyRender({
        config: configManager.getConfig().comfyui ?? createDefaultComfyUIConfig(),
        a1111Content: content,
        referenceImageDataUrl,
        signal: controller.signal,
      });
      setState({ phase: 'done', result });
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ phase: 'idle' });
        return;
      }
      setState({ phase: 'error', message: describeComfyTransportError(error) });
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
            Saved to the ComfyUI output folder; review here, keep the seed to iterate.
          </p>
        </div>
      )}
    </section>
  );
}
