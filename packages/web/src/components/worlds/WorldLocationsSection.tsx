import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Check, Loader2, MapPin, Plus, X } from 'lucide-react';
import type { DraftMetadata, WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Locations tab of the world detail editor.
 *
 * Extracted from `WorldDetailEditorPanel` (5.0 workspace-release work stream:
 * decompose the giant screens into focused, individually testable sections).
 * Behavior is unchanged: the same forms, mutations, and linked-draft chips,
 * with notices and errors surfaced through the parent's callbacks.
 */

interface WorldLocationsSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  draftOptions: DraftMetadata[];
  draftNameById: Map<string, string>;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface LocationFormState {
  name: string;
  category: string;
  description: string;
  draftIds: string[];
}

const EMPTY_LOCATION_FORM: LocationFormState = {
  name: '',
  category: '',
  description: '',
  draftIds: [],
};

export default function WorldLocationsSection({
  world,
  canEdit,
  draftOptions,
  draftNameById,
  onNotice,
  onError,
  onRefresh,
}: WorldLocationsSectionProps) {
  const [locationForm, setLocationForm] = useState<LocationFormState>(EMPTY_LOCATION_FORM);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationForm, setEditingLocationForm] = useState<LocationFormState>(EMPTY_LOCATION_FORM);
  const [pendingLocationDraftId, setPendingLocationDraftId] = useState('');
  const [editingLocationPendingDraftId, setEditingLocationPendingDraftId] = useState('');

  const addLocation = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.addWorldLocation(world.id, {
        name: locationForm.name.trim(),
        category: locationForm.category.trim() || undefined,
        description: locationForm.description.trim() || undefined,
        draftIds: locationForm.draftIds,
      });
    },
    onSuccess: async () => {
      setLocationForm(EMPTY_LOCATION_FORM);
      setPendingLocationDraftId('');
      onNotice('Location added.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const updateLocation = useMutation({
    mutationFn: async () => {
      if (!world || !editingLocationId) {
        throw new Error('No location selected');
      }

      return api.updateWorldLocation(world.id, editingLocationId, {
        name: editingLocationForm.name.trim(),
        category: editingLocationForm.category.trim() || undefined,
        description: editingLocationForm.description.trim() || undefined,
        draftIds: editingLocationForm.draftIds,
      });
    },
    onSuccess: async () => {
      setEditingLocationId(null);
      setEditingLocationForm(EMPTY_LOCATION_FORM);
      setEditingLocationPendingDraftId('');
      onNotice('Location updated.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (locationId: string) => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.deleteWorldLocation(world.id, locationId);
    },
    onSuccess: async () => {
      onNotice('Location removed.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const startEditingLocation = (location: NonNullable<WorldRecord['locations']>[number]) => {
    setEditingLocationId(location.id);
    setEditingLocationForm({
      name: location.name,
      category: location.category || '',
      description: location.description || '',
      draftIds: location.draftIds ?? [],
    });
    setEditingLocationPendingDraftId('');
  };

  const cancelEditingLocation = () => {
    setEditingLocationId(null);
    setEditingLocationForm(EMPTY_LOCATION_FORM);
    setEditingLocationPendingDraftId('');
  };

  const addLocationDraftLink = (draftId: string, editing = false) => {
    if (!draftId) {
      return;
    }

    if (editing) {
      setEditingLocationForm((previous) =>
        previous.draftIds.includes(draftId) ? previous : { ...previous, draftIds: [...previous.draftIds, draftId] },
      );
      setEditingLocationPendingDraftId('');
      return;
    }

    setLocationForm((previous) =>
      previous.draftIds.includes(draftId) ? previous : { ...previous, draftIds: [...previous.draftIds, draftId] },
    );
    setPendingLocationDraftId('');
  };

  const removeLocationDraftLink = (draftId: string, editing = false) => {
    if (editing) {
      setEditingLocationForm((previous) => ({
        ...previous,
        draftIds: previous.draftIds.filter((candidate) => candidate !== draftId),
      }));
      return;
    }

    setLocationForm((previous) => ({
      ...previous,
      draftIds: previous.draftIds.filter((candidate) => candidate !== draftId),
    }));
  };

  const locations = world.locations ?? [];

  return (
    <section className="rounded-xl border border-border/60 bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Locations</h4>
      </div>
      <div className="space-y-3">
        {canEdit && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3">
            <input
              value={locationForm.name}
              onChange={(event) => setLocationForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="Location name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              value={locationForm.category}
              onChange={(event) => setLocationForm((previous) => ({ ...previous, category: event.target.value }))}
              placeholder="Category"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              value={locationForm.description}
              onChange={(event) => setLocationForm((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Location description"
              className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="space-y-2 rounded-lg border border-border/50 bg-background/40 p-3">
              <div>
                <div className="text-xs font-medium text-foreground">Linked drafts</div>
                <div className="text-[11px] text-muted-foreground">
                  Attach supporting draft continuity to this location.
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  aria-label="Linked drafts"
                  value={pendingLocationDraftId}
                  onChange={(event) => setPendingLocationDraftId(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Add a saved draft...</option>
                  {draftOptions
                    .filter((draft) => !locationForm.draftIds.includes(draft.review_id))
                    .map((draft) => (
                      <option key={`location-create-${draft.review_id}`} value={draft.review_id}>
                        {draft.character_name || draft.seed}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => addLocationDraftLink(pendingLocationDraftId)}
                  disabled={!pendingLocationDraftId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add draft
                </button>
              </div>
              {locationForm.draftIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {locationForm.draftIds.map((draftId) => (
                    <span
                      key={`location-create-chip-${draftId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
                    >
                      {draftNameById.get(draftId) ?? draftId}
                      <button
                        type="button"
                        onClick={() => removeLocationDraftLink(draftId)}
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
              onClick={() => void addLocation.mutateAsync()}
              disabled={!locationForm.name.trim() || addLocation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
            >
              {addLocation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add location
            </button>
          </div>
        )}

        <div className="space-y-2">
          {locations.length > 0 ? (
            locations.map((location) => (
              <div key={location.id} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                {editingLocationId === location.id ? (
                  <div className="space-y-2">
                    <input
                      aria-label="Location name"
                      value={editingLocationForm.name}
                      onChange={(event) =>
                        setEditingLocationForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <input
                      aria-label="Location category"
                      value={editingLocationForm.category}
                      onChange={(event) =>
                        setEditingLocationForm((previous) => ({ ...previous, category: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      aria-label="Location description"
                      value={editingLocationForm.description}
                      onChange={(event) =>
                        setEditingLocationForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="space-y-2 rounded-lg border border-border/50 bg-background/40 p-3">
                      <div>
                        <div className="text-xs font-medium text-foreground">Linked drafts</div>
                        <div className="text-[11px] text-muted-foreground">
                          Curate which drafts support this location entry.
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          aria-label="Linked drafts"
                          value={editingLocationPendingDraftId}
                          onChange={(event) => setEditingLocationPendingDraftId(event.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Add a saved draft...</option>
                          {draftOptions
                            .filter((draft) => !editingLocationForm.draftIds.includes(draft.review_id))
                            .map((draft) => (
                              <option key={`location-edit-${draft.review_id}`} value={draft.review_id}>
                                {draft.character_name || draft.seed}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => addLocationDraftLink(editingLocationPendingDraftId, true)}
                          disabled={!editingLocationPendingDraftId}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add draft
                        </button>
                      </div>
                      {editingLocationForm.draftIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editingLocationForm.draftIds.map((draftId) => (
                            <span
                              key={`location-edit-chip-${draftId}`}
                              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
                            >
                              {draftNameById.get(draftId) ?? draftId}
                              <button
                                type="button"
                                onClick={() => removeLocationDraftLink(draftId, true)}
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
                        onClick={() => void updateLocation.mutateAsync()}
                        disabled={!editingLocationForm.name.trim() || updateLocation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                      >
                        {updateLocation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingLocation}
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
                      <div className="font-medium text-foreground">{location.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.category || location.description || 'No location summary set'}
                      </div>
                      {location.draftIds?.length ? (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-medium uppercase tracking-[0.14em]">Linked drafts</span>
                          {location.draftIds.map((draftId) => (
                            <Link
                              key={`${location.id}-${draftId}`}
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
                          onClick={() => startEditingLocation(location)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteLocation.mutateAsync(location.id)}
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
            <p className="text-xs text-muted-foreground">No locations yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
