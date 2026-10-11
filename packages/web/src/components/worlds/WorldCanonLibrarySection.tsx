import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, Copy, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  CANON_ENTRY_CATEGORIES,
  buildCanonContextLines,
  type CanonEntryCategory,
  type WorldCanonEntryRecord,
  type WorldRecord,
} from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Canon library tab of the world detail editor.
 *
 * A library entry is curated, reusable setting material: a titled, categorised
 * one-liner (with an optional long-form body and tags) that describes how the
 * setting works. The context block at the bottom is the citation form — the
 * same lines `buildCanonContextLines` produces anywhere else.
 */

interface WorldCanonLibrarySectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface CanonEntryFormState {
  title: string;
  category: CanonEntryCategory;
  summary: string;
  body: string;
  tags: string;
}

const EMPTY_CANON_ENTRY_FORM: CanonEntryFormState = {
  title: '',
  category: 'lore',
  summary: '',
  body: '',
  tags: '',
};

/** Comma-separated tag input into a trimmed, de-duplicated list. */
function parseTagList(input: string): string[] {
  return [
    ...new Set(
      input
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  ];
}

export default function WorldCanonLibrarySection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldCanonLibrarySectionProps) {
  const entries = useMemo(() => world.canonEntries ?? [], [world.canonEntries]);
  const [form, setForm] = useState<CanonEntryFormState>(EMPTY_CANON_ENTRY_FORM);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | CanonEntryCategory>('all');
  const [copied, setCopied] = useState(false);

  const visibleEntries = useMemo(
    () => (categoryFilter === 'all' ? entries : entries.filter((entry) => entry.category === categoryFilter)),
    [categoryFilter, entries],
  );
  const contextLines = useMemo(() => buildCanonContextLines(entries), [entries]);
  const titleReady = form.title.trim().length > 0;

  const saveEntry = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        category: form.category,
        summary: form.summary,
        body: form.body.trim() || undefined,
        tags: parseTagList(form.tags),
      };

      if (editingEntryId) {
        return api.updateCanonEntry(world.id, editingEntryId, payload);
      }

      return api.createCanonEntry(world.id, payload);
    },
    onSuccess: async () => {
      onNotice(editingEntryId ? 'Canon entry updated.' : 'Canon entry added.');
      setForm(EMPTY_CANON_ENTRY_FORM);
      setEditingEntryId(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => api.deleteCanonEntry(world.id, entryId),
    onSuccess: async (_result, entryId) => {
      onNotice('Canon entry removed.');
      if (editingEntryId === entryId) {
        setEditingEntryId(null);
        setForm(EMPTY_CANON_ENTRY_FORM);
      }
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  function beginEdit(entry: WorldCanonEntryRecord) {
    setEditingEntryId(entry.id);
    setForm({
      title: entry.title,
      category: entry.category,
      summary: entry.summary,
      body: entry.body ?? '',
      tags: entry.tags.join(', '),
    });
  }

  function cancelEdit() {
    setEditingEntryId(null);
    setForm(EMPTY_CANON_ENTRY_FORM);
  }

  async function copyContext() {
    try {
      await navigator.clipboard.writeText(contextLines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Failed to copy canon context', error);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-background p-4">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            {editingEntryId ? 'Edit canon entry' : 'Add a canon entry'}
          </h4>
        </div>

        {canEdit ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                aria-label="Canon entry title"
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                disabled={saveEntry.isPending}
                placeholder="Title, e.g. The Blood Price"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              <select
                aria-label="Canon entry category"
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, category: event.target.value as CanonEntryCategory }))
                }
                disabled={saveEntry.isPending}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {CANON_ENTRY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              aria-label="Canon entry summary"
              value={form.summary}
              onChange={(event) => setForm((previous) => ({ ...previous, summary: event.target.value }))}
              disabled={saveEntry.isPending}
              placeholder="One-line summary — the citable form of the fact"
              className="min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <textarea
              aria-label="Canon entry body"
              value={form.body}
              onChange={(event) => setForm((previous) => ({ ...previous, body: event.target.value }))}
              disabled={saveEntry.isPending}
              placeholder="Longer notes (optional)"
              className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              aria-label="Canon entry tags"
              value={form.tags}
              onChange={(event) => setForm((previous) => ({ ...previous, tags: event.target.value }))}
              disabled={saveEntry.isPending}
              placeholder="Tags, comma separated (optional)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void saveEntry.mutateAsync()}
                disabled={!titleReady || saveEntry.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveEntry.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingEntryId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingEntryId ? 'Save entry' : 'Add entry'}
              </button>
              {editingEntryId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Canon library entries are edited in the desktop app.</p>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            aria-pressed={categoryFilter === 'all'}
            className={`app-pill ${categoryFilter === 'all' ? 'border-primary text-primary' : 'app-pill-muted'}`}
          >
            All ({entries.length})
          </button>
          {CANON_ENTRY_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              aria-pressed={categoryFilter === category}
              className={`app-pill ${categoryFilter === category ? 'border-primary text-primary' : 'app-pill-muted'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {visibleEntries.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            {entries.length === 0
              ? 'No canon entries yet. Add the setting material this world should be able to cite.'
              : 'No entries in this category.'}
          </div>
        ) : (
          visibleEntries.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="app-pill app-pill-muted">{entry.category}</span>
                    <h5 className="text-sm font-semibold text-foreground">{entry.title}</h5>
                  </div>
                  {entry.summary && <p className="mt-2 text-sm text-foreground">{entry.summary}</p>}
                  {entry.body && (
                    <details className="mt-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer">Full text</summary>
                      <p className="mt-1 whitespace-pre-wrap">{entry.body}</p>
                    </details>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => beginEdit(entry)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.title}`}
                      onClick={() => void deleteEntry.mutateAsync(entry.id)}
                      className="rounded-md border border-input bg-background p-1.5 text-destructive hover:bg-accent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-foreground">Canon context block</h4>
          <button
            type="button"
            onClick={() => void copyContext()}
            disabled={contextLines.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {contextLines.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Every entry with a title is listed here for reuse.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {contextLines.map((line) => (
              <li key={line} className="font-mono text-xs">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
