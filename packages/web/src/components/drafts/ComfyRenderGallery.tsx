import { useEffect, useMemo, useRef, useState } from 'react';
import { Film } from 'lucide-react';
import { comfyViewUrl, normalizeComfyRenderHistory, type ComfyRenderRecord } from '@char-gen/shared';
import { getComfyFetch } from '@/lib/comfyui/transport';
import { configManager } from '@/lib/config';

/**
 * The render gallery: past renders from `metadata.comfy_renders` (thumbnails fetched
 * from ComfyUI's `/view` through the runtime transport, cached as object URLs, dropped
 * on unmount) alongside renders the user saved into the draft as `render_<n>` data-URL
 * assets, which need no fetch at all. Tiles carry the panel's per-record actions.
 */
export interface ComfyRenderGalleryProps {
  /** Raw `comfy_renders` value; normalized internally. */
  history: unknown;
  /** Saved draft assets named `render_<n>`. */
  savedRenders: Array<{ assetName: string; dataUrl: string }>;
  disabled?: boolean;
  onPinSeed: (seed: number) => void;
  onUseAsCardImage: (record: ComfyRenderRecord) => void;
  onSaveToDraft: (record: ComfyRenderRecord) => void;
  busyPromptId: string | null;
}

type ThumbnailState = { url: string } | 'error';

const MAX_TILES = 16;

function ageLabel(iso: string): string {
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

export default function ComfyRenderGallery({
  history,
  savedRenders,
  disabled = false,
  onPinSeed,
  onUseAsCardImage,
  onSaveToDraft,
  busyPromptId,
}: ComfyRenderGalleryProps) {
  const records = useMemo(() => normalizeComfyRenderHistory(history), [history]);
  const [thumbnails, setThumbnails] = useState<Record<string, ThumbnailState>>({});
  const attemptedRef = useRef<Set<string>>(new Set());
  const ownedUrlsRef = useRef<string[]>([]);

  // Load each visible record's first output once; a failure degrades to a
  // metadata-only tile instead of an error state (CORS, stopped server).
  useEffect(() => {
    const baseUrl = configManager.getConfig().comfyui?.base_url ?? 'http://127.0.0.1:8188';
    const fetchFn = getComfyFetch();
    let cancelled = false;

    for (const record of records.slice(0, MAX_TILES)) {
      if (record.images.length === 0 || attemptedRef.current.has(record.prompt_id)) {
        continue;
      }
      attemptedRef.current.add(record.prompt_id);
      fetchFn(comfyViewUrl(baseUrl, record.images[0]!))
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return URL.createObjectURL(await response.blob());
        })
        .then((url) => {
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          ownedUrlsRef.current.push(url);
          setThumbnails((previous) => ({ ...previous, [record.prompt_id]: { url } }));
        })
        .catch(() => {
          if (!cancelled) {
            setThumbnails((previous) => ({ ...previous, [record.prompt_id]: 'error' }));
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [records]);

  useEffect(() => {
    const owned = ownedUrlsRef.current;
    return () => {
      for (const url of owned) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  if (records.length === 0 && savedRenders.length === 0) {
    return null;
  }

  return (
    <section aria-label="Render gallery" className="mt-3 space-y-2 border-t border-border/60 pt-2">
      <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Film className="h-3.5 w-3.5" />
        Render gallery
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {savedRenders.slice(0, MAX_TILES).map((saved) => (
          <a
            key={saved.assetName}
            href={saved.dataUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open saved render ${saved.assetName}`}
            className="block overflow-hidden rounded-lg border border-success/50"
          >
            <img src={saved.dataUrl} alt={`Saved render ${saved.assetName}`} className="h-24 w-full object-cover" />
            <span className="block px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {saved.assetName} · saved to draft
            </span>
          </a>
        ))}

        {records.slice(0, MAX_TILES).map((record) => {
          const thumbnail = thumbnails[record.prompt_id];
          return (
            <div key={record.prompt_id} className="overflow-hidden rounded-lg border border-border/60">
              {thumbnail && thumbnail !== 'error' ? (
                <a
                  href={thumbnail.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open render seed ${record.seed}`}
                  className="block"
                >
                  <img src={thumbnail.url} alt={`Render seed ${record.seed}`} className="h-24 w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-24 w-full items-center justify-center bg-background/60 text-[10px] text-muted-foreground">
                  {thumbnail === 'error' ? 'preview unavailable' : 'loading…'}
                </div>
              )}
              <div className="space-y-1 px-1.5 py-1 text-[10px] text-muted-foreground">
                <p>
                  seed <span className="font-mono">{record.seed}</span> · {ageLabel(record.rendered_at)}
                </p>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => onPinSeed(record.seed)}
                    disabled={disabled}
                    className="rounded border border-input bg-background px-1 py-0.5 text-[10px] hover:bg-accent disabled:opacity-50"
                    aria-label={`Pin seed ${record.seed}`}
                  >
                    Pin seed
                  </button>
                  <button
                    type="button"
                    onClick={() => onUseAsCardImage(record)}
                    disabled={disabled || busyPromptId === record.prompt_id}
                    className="rounded border border-input bg-background px-1 py-0.5 text-[10px] hover:bg-accent disabled:opacity-50"
                    aria-label={`Use render ${record.prompt_id.slice(0, 8)} as card image`}
                  >
                    {busyPromptId === record.prompt_id ? '…' : 'Card image'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveToDraft(record)}
                    disabled={disabled || busyPromptId === record.prompt_id}
                    className="rounded border border-input bg-background px-1 py-0.5 text-[10px] hover:bg-accent disabled:opacity-50"
                    aria-label={`Save render ${record.prompt_id.slice(0, 8)} to draft`}
                  >
                    {busyPromptId === record.prompt_id ? '…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
