import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Check, Loader2, Plus, ShieldCheck, X } from 'lucide-react';
import type { DraftMetadata, WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Factions tab of the world detail editor.
 *
 * Extracted from `WorldDetailEditorPanel` (5.0 workspace-release work stream:
 * decompose the giant screens into focused, individually testable sections).
 * Behavior is pinned by `WorldDetailEditorPanel.test.tsx` through the parent.
 */

interface WorldFactionsSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  draftOptions: DraftMetadata[];
  draftNameById: Map<string, string>;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface FactionFormState {
  name: string;
  role: string;
  description: string;
  draftIds: string[];
}

const EMPTY_FACTION_FORM: FactionFormState = {
  name: '',
  role: '',
  description: '',
  draftIds: [],
};

export default function WorldFactionsSection({
  world,
  canEdit,
  draftOptions,
  draftNameById,
  onNotice,
  onError,
  onRefresh,
}: WorldFactionsSectionProps) {
  const [factionForm, setFactionForm] = useState<FactionFormState>(EMPTY_FACTION_FORM);
  const [editingFactionId, setEditingFactionId] = useState<string | null>(null);
  const [editingFactionForm, setEditingFactionForm] = useState<FactionFormState>(EMPTY_FACTION_FORM);
  const [pendingFactionDraftId, setPendingFactionDraftId] = useState('');
  const [editingFactionPendingDraftId, setEditingFactionPendingDraftId] = useState('');

  const addFaction = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.addWorldFaction(world.id, {
        name: factionForm.name.trim(),
        role: factionForm.role.trim() || undefined,
        description: factionForm.description.trim() || undefined,
        draftIds: factionForm.draftIds,
      });
    },
    onSuccess: async () => {
      setFactionForm(EMPTY_FACTION_FORM);
      setPendingFactionDraftId('');
      onNotice('Faction added.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const updateFaction = useMutation({
    mutationFn: async () => {
      if (!world || !editingFactionId) {
        throw new Error('No faction selected');
      }

      return api.updateWorldFaction(world.id, editingFactionId, {
        name: editingFactionForm.name.trim(),
        role: editingFactionForm.role.trim() || undefined,
        description: editingFactionForm.description.trim() || undefined,
        draftIds: editingFactionForm.draftIds,
      });
    },
    onSuccess: async () => {
      setEditingFactionId(null);
      setEditingFactionForm(EMPTY_FACTION_FORM);
      setEditingFactionPendingDraftId('');
      onNotice('Faction updated.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteFaction = useMutation({
    mutationFn: async (factionId: string) => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.deleteWorldFaction(world.id, factionId);
    },
    onSuccess: async () => {
      onNotice('Faction removed.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const startEditingFaction = (faction: NonNullable<WorldRecord['factions']>[number]) => {
    setEditingFactionId(faction.id);
    setEditingFactionForm({
      name: faction.name,
      role: faction.role || '',
      description: faction.description || '',
      draftIds: faction.draftIds ?? [],
    });
    setEditingFactionPendingDraftId('');
  };

  const cancelEditingFaction = () => {
    setEditingFactionId(null);
    setEditingFactionForm(EMPTY_FACTION_FORM);
    setEditingFactionPendingDraftId('');
  };

  const addFactionDraftLink = (draftId: string, editing = false) => {
    if (!draftId) {
      return;
    }

    if (editing) {
      setEditingFactionForm((previous) =>
        previous.draftIds.includes(draftId) ? previous : { ...previous, draftIds: [...previous.draftIds, draftId] },
      );
      setEditingFactionPendingDraftId('');
      return;
    }

    setFactionForm((previous) =>
      previous.draftIds.includes(draftId) ? previous : { ...previous, draftIds: [...previous.draftIds, draftId] },
    );
    setPendingFactionDraftId('');
  };

  const removeFactionDraftLink = (draftId: string, editing = false) => {
    if (editing) {
      setEditingFactionForm((previous) => ({
        ...previous,
        draftIds: previous.draftIds.filter((candidate) => candidate !== draftId),
      }));
      return;
    }

    setFactionForm((previous) => ({
      ...previous,
      draftIds: previous.draftIds.filter((candidate) => candidate !== draftId),
    }));
  };

  const factions = world.factions ?? [];

  return (
    <section className="rounded-xl border border-border/60 bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Factions</h4>
      </div>
      <div className="space-y-3">
        {canEdit && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3">
            <input
              value={factionForm.name}
              onChange={(event) => setFactionForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="Faction name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={factionForm.role}
              onChange={(event) => setFactionForm((previous) => ({ ...previous, role: event.target.value }))}
              placeholder="Role / pressure"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              value={factionForm.description}
              onChange={(event) => setFactionForm((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Faction description"
              className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="space-y-2 rounded-lg border border-border/50 bg-background/40 p-3">
              <div>
                <div className="text-xs font-medium text-foreground">Linked drafts</div>
                <div className="text-[11px] text-muted-foreground">
                  Attach supporting draft continuity to this faction.
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  aria-label="Linked drafts"
                  value={pendingFactionDraftId}
                  onChange={(event) => setPendingFactionDraftId(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Add a saved draft...</option>
                  {draftOptions
                    .filter((draft) => !factionForm.draftIds.includes(draft.review_id))
                    .map((draft) => (
                      <option key={`faction-create-${draft.review_id}`} value={draft.review_id}>
                        {draft.character_name || draft.seed}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => addFactionDraftLink(pendingFactionDraftId)}
                  disabled={!pendingFactionDraftId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add draft
                </button>
              </div>
              {factionForm.draftIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {factionForm.draftIds.map((draftId) => (
                    <span
                      key={`faction-create-chip-${draftId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
                    >
                      {draftNameById.get(draftId) ?? draftId}
                      <button
                        type="button"
                        onClick={() => removeFactionDraftLink(draftId)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove linked draft"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No linked drafts yet.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void addFaction.mutateAsync()}
              disabled={!factionForm.name.trim() || addFaction.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
            >
              {addFaction.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add faction
            </button>
          </div>
        )}

        <div className="space-y-2">
          {factions.length > 0 ? (
            factions.map((faction) => (
              <div key={faction.id} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                {editingFactionId === faction.id ? (
                  <div className="space-y-2">
                    <input
                      aria-label="Faction name"
                      value={editingFactionForm.name}
                      onChange={(event) =>
                        setEditingFactionForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <input
                      aria-label="Faction role"
                      value={editingFactionForm.role}
                      onChange={(event) =>
                        setEditingFactionForm((previous) => ({ ...previous, role: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      aria-label="Faction description"
                      value={editingFactionForm.description}
                      onChange={(event) =>
                        setEditingFactionForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="space-y-2 rounded-lg border border-border/50 bg-background/40 p-3">
                      <div>
                        <div className="text-xs font-medium text-foreground">Linked drafts</div>
                        <div className="text-[11px] text-muted-foreground">
                          Curate which drafts support this faction entry.
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          aria-label="Linked drafts"
                          value={editingFactionPendingDraftId}
                          onChange={(event) => setEditingFactionPendingDraftId(event.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Add a saved draft...</option>
                          {draftOptions
                            .filter((draft) => !editingFactionForm.draftIds.includes(draft.review_id))
                            .map((draft) => (
                              <option key={`faction-edit-${draft.review_id}`} value={draft.review_id}>
                                {draft.character_name || draft.seed}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => addFactionDraftLink(editingFactionPendingDraftId, true)}
                          disabled={!editingFactionPendingDraftId}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add draft
                        </button>
                      </div>
                      {editingFactionForm.draftIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editingFactionForm.draftIds.map((draftId) => (
                            <span
                              key={`faction-edit-chip-${draftId}`}
                              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
                            >
                              {draftNameById.get(draftId) ?? draftId}
                              <button
                                type="button"
                                onClick={() => removeFactionDraftLink(draftId, true)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Remove linked draft"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">No linked drafts yet.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateFaction.mutateAsync()}
                        disabled={!editingFactionForm.name.trim() || updateFaction.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                      >
                        {updateFaction.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingFaction}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">{faction.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {faction.role || faction.description || 'No faction summary set'}
                      </div>
                      {faction.draftIds?.length ? (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-medium uppercase tracking-[0.14em]">Linked drafts</span>
                          {faction.draftIds.map((draftId) => (
                            <Link
                              key={`${faction.id}-${draftId}`}
                              to={`/drafts/${encodeURIComponent(draftId)}`}
                              className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] text-foreground hover:border-primary/40 hover:text-primary"
                            >
                              {draftNameById.get(draftId) ?? draftId}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingFaction(faction)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteFaction.mutateAsync(faction.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No factions yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
