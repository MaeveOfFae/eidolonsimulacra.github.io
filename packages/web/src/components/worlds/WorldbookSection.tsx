import { useMemo, useState } from 'react';
import { BookMarked, Copy, Download } from 'lucide-react';
import {
  buildWorldbook,
  getWorldbookFilename,
  renderWorldbookPacket,
  renderWorldbookWorldInfo,
  type LorebookPacketEntryType,
  type WorldRecord,
} from '@char-gen/shared';
import { saveBlobDownload } from '@/utils/download';

/**
 * Worldbook tab of the world detail editor.
 *
 * A worldbook is this world's canon projected into portable setting entries:
 * the packet plaintext the repo's own importer reads, and a SillyTavern-style
 * world-info JSON. The projection itself is pure (`buildWorldbook`); this tab
 * previews the entries and hands off the two files.
 */

interface WorldbookSectionProps {
  world: WorldRecord;
}

const ENTRY_TYPE_ORDER: LorebookPacketEntryType[] = [
  'character',
  'place',
  'event',
  'faction',
  'object',
  'custom',
  'rumor',
  'moment',
];

export default function WorldbookSection({ world }: WorldbookSectionProps) {
  const worldbook = useMemo(() => buildWorldbook(world), [world]);
  const [typeFilter, setTypeFilter] = useState<'all' | LorebookPacketEntryType>('all');
  const [copied, setCopied] = useState<'packet' | 'worldinfo' | null>(null);

  const presentTypes = useMemo(() => {
    const types = new Set(worldbook.entries.map((entry) => entry.type));
    return ENTRY_TYPE_ORDER.filter((type) => types.has(type));
  }, [worldbook.entries]);

  const visibleEntries = useMemo(
    () => (typeFilter === 'all' ? worldbook.entries : worldbook.entries.filter((entry) => entry.type === typeFilter)),
    [typeFilter, worldbook.entries],
  );

  async function copyExport(kind: 'packet' | 'worldinfo') {
    const text = kind === 'packet' ? renderWorldbookPacket(worldbook) : renderWorldbookWorldInfo(worldbook);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch (error) {
      console.error('Failed to copy the worldbook', error);
    }
  }

  async function downloadExport(extension: 'md' | 'json') {
    const text = extension === 'md' ? renderWorldbookPacket(worldbook) : renderWorldbookWorldInfo(worldbook);
    const blob = new Blob([text], { type: extension === 'md' ? 'text/markdown' : 'application/json' });
    await saveBlobDownload(blob, getWorldbookFilename(worldbook.title, extension), blob.type);
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-background p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{worldbook.title}</h4>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{worldbook.scope}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {worldbook.entries.length} {worldbook.entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyExport('packet')}
              disabled={worldbook.entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === 'packet' ? 'Copied packet' : 'Copy packet'}
            </button>
            <button
              type="button"
              onClick={() => void downloadExport('md')}
              disabled={worldbook.entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Packet .md
            </button>
            <button
              type="button"
              onClick={() => void copyExport('worldinfo')}
              disabled={worldbook.entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === 'worldinfo' ? 'Copied world-info' : 'Copy world-info'}
            </button>
            <button
              type="button"
              onClick={() => void downloadExport('json')}
              disabled={worldbook.entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              World-info .json
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {worldbook.entries.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            This world has no canon yet. Add a description, characters, factions, locations, timelines, canon locks, or
            canon library entries and they appear here as setting entries.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                aria-pressed={typeFilter === 'all'}
                className={`app-pill ${typeFilter === 'all' ? 'border-primary text-primary' : 'app-pill-muted'}`}
              >
                All ({worldbook.entries.length})
              </button>
              {presentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  aria-pressed={typeFilter === type}
                  className={`app-pill ${typeFilter === type ? 'border-primary text-primary' : 'app-pill-muted'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {visibleEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="app-pill app-pill-muted">{entry.type}</span>
                  <h5 className="text-sm font-semibold text-foreground">{entry.title}</h5>
                </div>
                {entry.summary && <p className="mt-2 text-sm text-foreground">{entry.summary}</p>}
                {entry.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Canon text</summary>
                  <p className="mt-1 whitespace-pre-wrap">{entry.content}</p>
                </details>
              </article>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
