import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy, Loader2, Lock, Plus, Save, Trash2 } from 'lucide-react';
import {
  CANON_LOCK_TARGET_KINDS,
  buildCanonLockConstraintLines,
  type CanonLockTargetKind,
  type WorldCanonLockRecord,
  type WorldRecord,
} from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Canon locks tab of the world detail editor.
 *
 * A canon lock is a fact that derivative drafts must not change. Locks are
 * persisted on the world and, when a draft is linked to that world, injected as
 * additional rules into per-asset regeneration and refinement, so the
 * constraint block previewed here is exactly what generation receives.
 */

interface WorldCanonLocksSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface CanonLockFormState {
  targetKind: CanonLockTargetKind;
  targetId: string;
  statement: string;
  notes: string;
}

const EMPTY_CANON_LOCK_FORM: CanonLockFormState = {
  targetKind: 'world',
  targetId: '',
  statement: '',
  notes: '',
};

/** The selectable targets of a given kind, read from the world's own records. */
function targetOptionsFor(kind: CanonLockTargetKind, world: WorldRecord): Array<{ id: string; label: string }> {
  switch (kind) {
    case 'character':
      return (world.characters ?? []).map((character) => ({ id: character.id, label: character.characterName }));
    case 'faction':
      return (world.factions ?? []).map((faction) => ({ id: faction.id, label: faction.name }));
    case 'location':
      return (world.locations ?? []).map((location) => ({ id: location.id, label: location.name }));
    case 'timeline':
      return (world.timelines ?? []).map((timeline) => ({ id: timeline.id, label: timeline.name }));
    default:
      return [];
  }
}

function findTargetLabel(kind: CanonLockTargetKind, targetId: string, world: WorldRecord): string {
  return targetOptionsFor(kind, world).find((option) => option.id === targetId)?.label ?? '';
}

export default function WorldCanonLocksSection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldCanonLocksSectionProps) {
  const locks = useMemo(() => world.canonLocks ?? [], [world.canonLocks]);
  const [form, setForm] = useState<CanonLockFormState>(EMPTY_CANON_LOCK_FORM);
  const [editingLockId, setEditingLockId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const constraintLines = useMemo(() => buildCanonLockConstraintLines(locks), [locks]);
  const targetOptions = targetOptionsFor(form.targetKind, world);
  const statementReady = form.statement.trim().length > 0;
  const targetReady = form.targetKind === 'world' || form.targetId.length > 0;

  const saveLock = useMutation({
    mutationFn: async () => {
      const payload = {
        targetKind: form.targetKind,
        targetId: form.targetKind === 'world' ? undefined : form.targetId,
        targetLabel: form.targetKind === 'world' ? undefined : findTargetLabel(form.targetKind, form.targetId, world),
        statement: form.statement,
        notes: form.notes.trim() || undefined,
      };

      if (editingLockId) {
        return api.updateCanonLock(world.id, editingLockId, payload);
      }

      return api.createCanonLock(world.id, payload);
    },
    onSuccess: async () => {
      onNotice(editingLockId ? 'Canon lock updated.' : 'Canon lock added.');
      setForm(EMPTY_CANON_LOCK_FORM);
      setEditingLockId(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteLock = useMutation({
    mutationFn: async (lockId: string) => api.deleteCanonLock(world.id, lockId),
    onSuccess: async (_result, lockId) => {
      onNotice('Canon lock removed.');
      if (editingLockId === lockId) {
        setEditingLockId(null);
        setForm(EMPTY_CANON_LOCK_FORM);
      }
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  function beginEdit(lock: WorldCanonLockRecord) {
    setEditingLockId(lock.id);
    setForm({
      targetKind: lock.targetKind,
      targetId: lock.targetId ?? '',
      statement: lock.statement,
      notes: lock.notes ?? '',
    });
  }

  function cancelEdit() {
    setEditingLockId(null);
    setForm(EMPTY_CANON_LOCK_FORM);
  }

  async function copyConstraints() {
    try {
      await navigator.clipboard.writeText(constraintLines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Failed to copy canon constraints', error);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-background p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            {editingLockId ? 'Edit canon lock' : 'Add a canon lock'}
          </h4>
        </div>

        {canEdit ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                Scope
                <select
                  aria-label="Canon lock scope"
                  value={form.targetKind}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      targetKind: event.target.value as CanonLockTargetKind,
                      targetId: '',
                    }))
                  }
                  disabled={saveLock.isPending}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {CANON_LOCK_TARGET_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </label>

              {form.targetKind !== 'world' && (
                <label className="space-y-1 text-xs font-medium text-muted-foreground">
                  Target
                  <select
                    aria-label="Canon lock target"
                    value={form.targetId}
                    onChange={(event) => setForm((previous) => ({ ...previous, targetId: event.target.value }))}
                    disabled={saveLock.isPending}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">Select a {form.targetKind}…</option>
                    {targetOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <textarea
              aria-label="Canon lock statement"
              value={form.statement}
              onChange={(event) => setForm((previous) => ({ ...previous, statement: event.target.value }))}
              disabled={saveLock.isPending}
              placeholder="The fact that must stay stable, e.g. Vesna's surname is Vale and never changes."
              className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              aria-label="Canon lock notes"
              value={form.notes}
              onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
              disabled={saveLock.isPending}
              placeholder="Notes (optional)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void saveLock.mutateAsync()}
                disabled={!statementReady || !targetReady || saveLock.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveLock.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingLockId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingLockId ? 'Save lock' : 'Add lock'}
              </button>
              {editingLockId && (
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
          <p className="text-sm text-muted-foreground">Canon locks are edited in the desktop app.</p>
        )}
      </div>

      <div className="space-y-3">
        {locks.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            No canon locks yet. Lock the facts a derivative draft must never change.
          </div>
        ) : (
          locks.map((lock) => (
            <article key={lock.id} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="app-pill app-pill-muted">
                    {lock.targetKind === 'world'
                      ? 'World'
                      : `${lock.targetLabel || lock.targetKind} (${lock.targetKind})`}
                  </span>
                  <p className="mt-2 text-sm text-foreground">{lock.statement}</p>
                  {lock.notes && <p className="mt-1 text-xs text-muted-foreground">{lock.notes}</p>}
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => beginEdit(lock)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${lock.statement}`}
                      onClick={() => void deleteLock.mutateAsync(lock.id)}
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
          <h4 className="text-sm font-semibold text-foreground">Constraint block sent to generation</h4>
          <button
            type="button"
            onClick={() => void copyConstraints()}
            disabled={constraintLines.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {constraintLines.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing is sent until at least one lock has a statement.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {constraintLines.map((line) => (
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
