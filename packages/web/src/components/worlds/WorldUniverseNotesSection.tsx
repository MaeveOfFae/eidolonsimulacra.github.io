import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy, Loader2, Pin, Plus, Save, Trash2 } from 'lucide-react';
import {
  buildUniverseNoteContextLines,
  sortUniverseNotes,
  type WorldRecord,
  type WorldUniverseNoteRecord,
} from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Universe notes tab of the world detail editor.
 *
 * A note is free-form canon context — tone rules, continuity reminders, how
 * magic feels. Pinned notes lead the list and the context block, which is the
 * same block `resolveCanonContext` adds to generation for drafts linked to this
 * world.
 */

interface WorldUniverseNotesSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface UniverseNoteFormState {
  title: string;
  body: string;
  pinned: boolean;
}

const EMPTY_UNIVERSE_NOTE_FORM: UniverseNoteFormState = { title: '', body: '', pinned: false };

export default function WorldUniverseNotesSection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldUniverseNotesSectionProps) {
  const notes = useMemo(() => sortUniverseNotes(world.universeNotes ?? []), [world.universeNotes]);
  const [form, setForm] = useState<UniverseNoteFormState>(EMPTY_UNIVERSE_NOTE_FORM);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleNotes = useMemo(() => (pinnedOnly ? notes.filter((note) => note.pinned) : notes), [notes, pinnedOnly]);
  const contextLines = useMemo(() => buildUniverseNoteContextLines(notes), [notes]);
  const titleReady = form.title.trim().length > 0;

  const saveNote = useMutation({
    mutationFn: async () => {
      const payload = { title: form.title, body: form.body, pinned: form.pinned };

      if (editingNoteId) {
        return api.updateUniverseNote(world.id, editingNoteId, payload);
      }

      return api.createUniverseNote(world.id, payload);
    },
    onSuccess: async () => {
      onNotice(editingNoteId ? 'Universe note updated.' : 'Universe note added.');
      setForm(EMPTY_UNIVERSE_NOTE_FORM);
      setEditingNoteId(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => api.deleteUniverseNote(world.id, noteId),
    onSuccess: async (_result, noteId) => {
      onNotice('Universe note removed.');
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setForm(EMPTY_UNIVERSE_NOTE_FORM);
      }
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const togglePin = useMutation({
    mutationFn: async (note: WorldUniverseNoteRecord) =>
      api.updateUniverseNote(world.id, note.id, { pinned: !note.pinned }),
    onSuccess: async () => {
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  function beginEdit(note: WorldUniverseNoteRecord) {
    setEditingNoteId(note.id);
    setForm({ title: note.title, body: note.body, pinned: note.pinned });
  }

  function cancelEdit() {
    setEditingNoteId(null);
    setForm(EMPTY_UNIVERSE_NOTE_FORM);
  }

  async function copyContext() {
    try {
      await navigator.clipboard.writeText(contextLines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Failed to copy the universe-note context', error);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-background p-4">
        <div className="mb-3 flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            {editingNoteId ? 'Edit universe note' : 'Add a universe note'}
          </h4>
        </div>

        {canEdit ? (
          <div className="space-y-3">
            <input
              aria-label="Universe note title"
              value={form.title}
              onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
              disabled={saveNote.isPending}
              placeholder="Title, e.g. How magic feels"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <textarea
              aria-label="Universe note body"
              value={form.body}
              onChange={(event) => setForm((previous) => ({ ...previous, body: event.target.value }))}
              disabled={saveNote.isPending}
              placeholder="Free-form canon context — as long as you need."
              className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) => setForm((previous) => ({ ...previous, pinned: event.target.checked }))}
                disabled={saveNote.isPending}
                className="h-4 w-4 rounded border-input"
              />
              Pin this note — pinned notes lead the list and the context block
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void saveNote.mutateAsync()}
                disabled={!titleReady || saveNote.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveNote.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingNoteId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingNoteId ? 'Save note' : 'Add note'}
              </button>
              {editingNoteId && (
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
          <p className="text-sm text-muted-foreground">Universe notes are edited in the desktop app.</p>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPinnedOnly(false)}
            aria-pressed={!pinnedOnly}
            className={`app-pill ${!pinnedOnly ? 'border-primary text-primary' : 'app-pill-muted'}`}
          >
            All ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setPinnedOnly(true)}
            aria-pressed={pinnedOnly}
            className={`app-pill ${pinnedOnly ? 'border-primary text-primary' : 'app-pill-muted'}`}
          >
            Pinned ({notes.filter((note) => note.pinned).length})
          </button>
        </div>

        {visibleNotes.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            {notes.length === 0
              ? 'No universe notes yet. Pin the context you keep re-explaining.'
              : 'No pinned notes yet.'}
          </div>
        ) : (
          visibleNotes.map((note) => (
            <article key={note.id} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {note.pinned ? <span className="app-pill app-pill-muted">pinned</span> : null}
                    <h5 className="text-sm font-semibold text-foreground">{note.title}</h5>
                  </div>
                  {note.body && <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>}
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void togglePin.mutateAsync(note)}
                      aria-pressed={note.pinned}
                      aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                      className="rounded-md border border-input bg-background p-1.5 text-foreground hover:bg-accent"
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => beginEdit(note)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${note.title}`}
                      onClick={() => void deleteNote.mutateAsync(note.id)}
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
          <h4 className="text-sm font-semibold text-foreground">Context block sent to generation</h4>
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
          <p className="mt-2 text-sm text-muted-foreground">Every note with a title is listed here for reuse.</p>
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
