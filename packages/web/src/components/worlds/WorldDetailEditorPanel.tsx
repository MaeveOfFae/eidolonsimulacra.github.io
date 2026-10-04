import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Loader2, Plus, Save, Trash2, Users, X } from 'lucide-react';
import type { WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';
import RelationshipMapPlaceholder from './RelationshipMapPlaceholder';
import WorldFactionsSection from './WorldFactionsSection';
import WorldLocationsSection from './WorldLocationsSection';
import WorldTimelinesSection from './WorldTimelinesSection';

interface WorldDetailEditorPanelProps {
  world: WorldRecord | null;
  canEdit: boolean;
  onRefresh: () => void | Promise<unknown>;
  onDeleted?: () => void;
}

interface WorldMetadataForm {
  name: string;
  description: string;
  genre: string;
  setting: string;
  notes: string;
}

interface CharacterFormState {
  characterName: string;
  role: string;
  notes: string;
}

interface RelationshipFormState {
  sourceCharacterId: string;
  targetCharacterId: string;
  label: string;
  notes: string;
}

type WorldDetailTab = 'details' | 'characters' | 'relationships' | 'timelines' | 'factions' | 'locations';

const EMPTY_WORLD_FORM: WorldMetadataForm = {
  name: '',
  description: '',
  genre: '',
  setting: '',
  notes: '',
};

const EMPTY_CHARACTER_FORM: CharacterFormState = {
  characterName: '',
  role: '',
  notes: '',
};

const EMPTY_RELATIONSHIP_FORM: RelationshipFormState = {
  sourceCharacterId: '',
  targetCharacterId: '',
  label: '',
  notes: '',
};

export default function WorldDetailEditorPanel({ world, canEdit, onRefresh, onDeleted }: WorldDetailEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<WorldDetailTab>('details');
  const [metadataForm, setMetadataForm] = useState<WorldMetadataForm>(EMPTY_WORLD_FORM);
  const [characterForm, setCharacterForm] = useState<CharacterFormState>(EMPTY_CHARACTER_FORM);
  const [relationshipForm, setRelationshipForm] = useState<RelationshipFormState>(EMPTY_RELATIONSHIP_FORM);

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingCharacterForm, setEditingCharacterForm] = useState<CharacterFormState>(EMPTY_CHARACTER_FORM);
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  const [editingRelationshipForm, setEditingRelationshipForm] =
    useState<RelationshipFormState>(EMPTY_RELATIONSHIP_FORM);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!world) {
      setMetadataForm(EMPTY_WORLD_FORM);
      setEditingCharacterId(null);
      setEditingRelationshipId(null);
      return;
    }

    setMetadataForm({
      name: world.name,
      description: world.description || '',
      genre: world.genre || '',
      setting: world.setting || '',
      notes: world.notes || '',
    });
  }, [world]);

  const hasMetadataChanges = useMemo(() => {
    if (!world) {
      return false;
    }

    return (
      metadataForm.name !== world.name ||
      metadataForm.description !== (world.description || '') ||
      metadataForm.genre !== (world.genre || '') ||
      metadataForm.setting !== (world.setting || '') ||
      metadataForm.notes !== (world.notes || '')
    );
  }, [metadataForm, world]);

  const { data: draftListData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
    enabled: Boolean(world),
  });

  const draftNameById = useMemo(
    () =>
      new Map(
        (draftListData?.drafts ?? []).map((draft) => [draft.review_id, draft.character_name || draft.seed] as const),
      ),
    [draftListData?.drafts],
  );
  const draftOptions = draftListData?.drafts ?? [];

  const saveWorld = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.updateWorld(world.id, {
        name: metadataForm.name.trim(),
        description: metadataForm.description.trim() || undefined,
        genre: metadataForm.genre.trim() || undefined,
        setting: metadataForm.setting.trim() || undefined,
        notes: metadataForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setNotice('World details saved.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const deleteWorld = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.deleteWorld(world.id);
    },
    onSuccess: async () => {
      setNotice('World deleted.');
      setError(null);
      await onRefresh();
      onDeleted?.();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const addCharacter = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.addWorldCharacter(world.id, {
        characterName: characterForm.characterName.trim(),
        role: characterForm.role.trim() || undefined,
        notes: characterForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setCharacterForm(EMPTY_CHARACTER_FORM);
      setNotice('Character added.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const updateCharacter = useMutation({
    mutationFn: async () => {
      if (!world || !editingCharacterId) {
        throw new Error('No character selected');
      }

      return api.updateWorldCharacter(world.id, editingCharacterId, {
        characterName: editingCharacterForm.characterName.trim(),
        role: editingCharacterForm.role.trim() || undefined,
        notes: editingCharacterForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEditingCharacterId(null);
      setEditingCharacterForm(EMPTY_CHARACTER_FORM);
      setNotice('Character updated.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const unlinkCharacterDraft = useMutation({
    mutationFn: async (characterId: string) => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.updateWorldCharacter(world.id, characterId, {
        draftId: '',
      });
    },
    onSuccess: async () => {
      setNotice('Draft link removed from character.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const deleteCharacter = useMutation({
    mutationFn: async (characterId: string) => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.deleteWorldCharacter(world.id, characterId);
    },
    onSuccess: async () => {
      setNotice('Character removed.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const addRelationship = useMutation({
    mutationFn: async () => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.addWorldRelationship(world.id, {
        sourceCharacterId: relationshipForm.sourceCharacterId,
        targetCharacterId: relationshipForm.targetCharacterId,
        label: relationshipForm.label.trim(),
        notes: relationshipForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setRelationshipForm(EMPTY_RELATIONSHIP_FORM);
      setNotice('Relationship added.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const updateRelationship = useMutation({
    mutationFn: async () => {
      if (!world || !editingRelationshipId) {
        throw new Error('No relationship selected');
      }

      return api.updateWorldRelationship(world.id, editingRelationshipId, {
        sourceCharacterId: editingRelationshipForm.sourceCharacterId,
        targetCharacterId: editingRelationshipForm.targetCharacterId,
        label: editingRelationshipForm.label.trim(),
        notes: editingRelationshipForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEditingRelationshipId(null);
      setEditingRelationshipForm(EMPTY_RELATIONSHIP_FORM);
      setNotice('Relationship updated.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const deleteRelationship = useMutation({
    mutationFn: async (relationshipId: string) => {
      if (!world) {
        throw new Error('No world selected');
      }

      return api.deleteWorldRelationship(world.id, relationshipId);
    },
    onSuccess: async () => {
      setNotice('Relationship removed.');
      setError(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  const startEditingCharacter = (character: NonNullable<WorldRecord['characters']>[number]) => {
    setEditingCharacterId(character.id);
    setEditingCharacterForm({
      characterName: character.characterName,
      role: character.role || '',
      notes: character.notes || '',
    });
  };

  const cancelEditingCharacter = () => {
    setEditingCharacterId(null);
    setEditingCharacterForm(EMPTY_CHARACTER_FORM);
  };

  const startEditingRelationship = (relationship: NonNullable<WorldRecord['relationships']>[number]) => {
    setEditingRelationshipId(relationship.id);
    setEditingRelationshipForm({
      sourceCharacterId: relationship.sourceCharacterId,
      targetCharacterId: relationship.targetCharacterId,
      label: relationship.label,
      notes: relationship.notes || '',
    });
  };

  const cancelEditingRelationship = () => {
    setEditingRelationshipId(null);
    setEditingRelationshipForm(EMPTY_RELATIONSHIP_FORM);
  };

  if (!world) {
    return (
      <div className="app-note p-4 text-sm text-muted-foreground">
        Select a world to inspect or edit its canon nodes.
      </div>
    );
  }

  const characters = world.characters ?? [];
  const factions = world.factions ?? [];
  const locations = world.locations ?? [];
  const relationships = world.relationships ?? [];
  const timelines = world.timelines ?? [];
  const tabs: Array<{ id: WorldDetailTab; label: string; count: number | null }> = [
    { id: 'details', label: 'World', count: null },
    { id: 'characters', label: 'Characters', count: characters.length },
    { id: 'relationships', label: 'Relationships', count: relationships.length },
    { id: 'timelines', label: 'Timelines', count: timelines.length },
    { id: 'factions', label: 'Factions', count: factions.length },
    { id: 'locations', label: 'Locations', count: locations.length },
  ];
  const createRelationshipTargets = characters.filter(
    (character) => character.id !== relationshipForm.sourceCharacterId,
  );
  const editingRelationshipTargets = characters.filter(
    (character) => character.id !== editingRelationshipForm.sourceCharacterId,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{world.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{world.description || 'No world description yet.'}</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => void deleteWorld.mutateAsync()}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/15"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete world
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      )}

      <div className="flex overflow-x-auto pb-1">
        <div className="app-tab-group min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id ? 'true' : 'false'}
              className="app-tab-button"
            >
              <span>{tab.label}</span>
              {tab.count !== null && <span className="text-[11px] opacity-80">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'details' && (
        <section className="rounded-xl border border-border/60 bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">World details</h4>
          </div>
          <div className="space-y-3">
            <input
              value={metadataForm.name}
              onChange={(event) => setMetadataForm((previous) => ({ ...previous, name: event.target.value }))}
              disabled={!canEdit || saveWorld.isPending}
              placeholder="World name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              value={metadataForm.genre}
              onChange={(event) => setMetadataForm((previous) => ({ ...previous, genre: event.target.value }))}
              disabled={!canEdit || saveWorld.isPending}
              placeholder="Genre"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              value={metadataForm.setting}
              onChange={(event) => setMetadataForm((previous) => ({ ...previous, setting: event.target.value }))}
              disabled={!canEdit || saveWorld.isPending}
              placeholder="Setting"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <textarea
              value={metadataForm.description}
              onChange={(event) => setMetadataForm((previous) => ({ ...previous, description: event.target.value }))}
              disabled={!canEdit || saveWorld.isPending}
              placeholder="Description"
              className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <textarea
              value={metadataForm.notes}
              onChange={(event) => setMetadataForm((previous) => ({ ...previous, notes: event.target.value }))}
              disabled={!canEdit || saveWorld.isPending}
              placeholder="World notes"
              className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            {canEdit && (
              <button
                type="button"
                onClick={() => void saveWorld.mutateAsync()}
                disabled={!hasMetadataChanges || saveWorld.isPending || !metadataForm.name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveWorld.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save world details
              </button>
            )}
          </div>
        </section>
      )}

      {activeTab === 'characters' && (
        <section className="rounded-xl border border-border/60 bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Characters</h4>
          </div>
          <div className="space-y-3">
            {canEdit && (
              <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3">
                <input
                  value={characterForm.characterName}
                  onChange={(event) =>
                    setCharacterForm((previous) => ({ ...previous, characterName: event.target.value }))
                  }
                  placeholder="Character name"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  value={characterForm.role}
                  onChange={(event) => setCharacterForm((previous) => ({ ...previous, role: event.target.value }))}
                  placeholder="Role"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <textarea
                  value={characterForm.notes}
                  onChange={(event) => setCharacterForm((previous) => ({ ...previous, notes: event.target.value }))}
                  placeholder="Character notes"
                  className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => void addCharacter.mutateAsync()}
                  disabled={!characterForm.characterName.trim() || addCharacter.isPending}
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                >
                  {addCharacter.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add character
                </button>
              </div>
            )}

            <div className="space-y-2">
              {characters.length > 0 ? (
                characters.map((character) => (
                  <div key={character.id} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                    {editingCharacterId === character.id ? (
                      <div className="space-y-2">
                        <input
                          value={editingCharacterForm.characterName}
                          onChange={(event) =>
                            setEditingCharacterForm((previous) => ({ ...previous, characterName: event.target.value }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <input
                          value={editingCharacterForm.role}
                          onChange={(event) =>
                            setEditingCharacterForm((previous) => ({ ...previous, role: event.target.value }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <textarea
                          value={editingCharacterForm.notes}
                          onChange={(event) =>
                            setEditingCharacterForm((previous) => ({ ...previous, notes: event.target.value }))
                          }
                          className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void updateCharacter.mutateAsync()}
                            disabled={!editingCharacterForm.characterName.trim() || updateCharacter.isPending}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                          >
                            {updateCharacter.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingCharacter}
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
                          <div className="font-medium text-foreground">{character.characterName}</div>
                          <div className="text-xs text-muted-foreground">{character.role || 'No role set'}</div>
                          {character.draftId && (
                            <Link
                              to={`/drafts/${encodeURIComponent(character.draftId)}`}
                              className="mt-1 inline-flex text-xs text-primary hover:underline"
                            >
                              Open linked draft
                            </Link>
                          )}
                          {character.notes && (
                            <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{character.notes}</p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            {character.draftId && (
                              <button
                                type="button"
                                onClick={() => void unlinkCharacterDraft.mutateAsync(character.id)}
                                disabled={unlinkCharacterDraft.isPending}
                                className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                              >
                                Unlink draft
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditingCharacter(character)}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteCharacter.mutateAsync(character.id)}
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
                <p className="text-xs text-muted-foreground">No characters yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'timelines' && (
        <WorldTimelinesSection
          world={world}
          canEdit={canEdit}
          onNotice={(message) => {
            setNotice(message);
            setError(null);
          }}
          onError={(message) => {
            setError(message);
            setNotice(null);
          }}
          onRefresh={onRefresh}
        />
      )}
      {activeTab === 'relationships' && (
        <section className="rounded-xl border border-border/60 bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Relationships</h4>
          </div>
          <div className="space-y-3">
            <RelationshipMapPlaceholder characterCount={characters.length} relationshipCount={relationships.length} />

            {characters.length < 2 ? (
              <div className="app-note p-4 text-sm text-muted-foreground">
                Add at least two characters before creating relationships.
              </div>
            ) : canEdit ? (
              <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3">
                <select
                  value={relationshipForm.sourceCharacterId}
                  onChange={(event) =>
                    setRelationshipForm((previous) => ({
                      ...previous,
                      sourceCharacterId: event.target.value,
                      targetCharacterId:
                        previous.targetCharacterId === event.target.value ? '' : previous.targetCharacterId,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Source character...</option>
                  {characters.map((character) => (
                    <option key={`relationship-source-${character.id}`} value={character.id}>
                      {character.characterName}
                    </option>
                  ))}
                </select>
                <select
                  value={relationshipForm.targetCharacterId}
                  onChange={(event) =>
                    setRelationshipForm((previous) => ({ ...previous, targetCharacterId: event.target.value }))
                  }
                  disabled={!relationshipForm.sourceCharacterId}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Target character...</option>
                  {createRelationshipTargets.map((character) => (
                    <option key={`relationship-target-${character.id}`} value={character.id}>
                      {character.characterName}
                    </option>
                  ))}
                </select>
                <input
                  value={relationshipForm.label}
                  onChange={(event) => setRelationshipForm((previous) => ({ ...previous, label: event.target.value }))}
                  placeholder="Relationship label"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <textarea
                  value={relationshipForm.notes}
                  onChange={(event) => setRelationshipForm((previous) => ({ ...previous, notes: event.target.value }))}
                  placeholder="Relationship notes"
                  className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => void addRelationship.mutateAsync()}
                  disabled={
                    !relationshipForm.sourceCharacterId ||
                    !relationshipForm.targetCharacterId ||
                    !relationshipForm.label.trim() ||
                    addRelationship.isPending
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                >
                  {addRelationship.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add relationship
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              {relationships.length > 0 ? (
                relationships.map((relationship) => {
                  const sourceCharacterName =
                    characters.find((character) => character.id === relationship.sourceCharacterId)?.characterName ??
                    relationship.sourceCharacterId;
                  const targetCharacterName =
                    characters.find((character) => character.id === relationship.targetCharacterId)?.characterName ??
                    relationship.targetCharacterId;

                  return (
                    <div key={relationship.id} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                      {editingRelationshipId === relationship.id ? (
                        <div className="space-y-2">
                          <select
                            value={editingRelationshipForm.sourceCharacterId}
                            onChange={(event) =>
                              setEditingRelationshipForm((previous) => ({
                                ...previous,
                                sourceCharacterId: event.target.value,
                                targetCharacterId:
                                  previous.targetCharacterId === event.target.value ? '' : previous.targetCharacterId,
                              }))
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">Source character...</option>
                            {characters.map((character) => (
                              <option key={`relationship-edit-source-${character.id}`} value={character.id}>
                                {character.characterName}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingRelationshipForm.targetCharacterId}
                            onChange={(event) =>
                              setEditingRelationshipForm((previous) => ({
                                ...previous,
                                targetCharacterId: event.target.value,
                              }))
                            }
                            disabled={!editingRelationshipForm.sourceCharacterId}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            <option value="">Target character...</option>
                            {editingRelationshipTargets.map((character) => (
                              <option key={`relationship-edit-target-${character.id}`} value={character.id}>
                                {character.characterName}
                              </option>
                            ))}
                          </select>
                          <input
                            value={editingRelationshipForm.label}
                            onChange={(event) =>
                              setEditingRelationshipForm((previous) => ({ ...previous, label: event.target.value }))
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <textarea
                            value={editingRelationshipForm.notes}
                            onChange={(event) =>
                              setEditingRelationshipForm((previous) => ({ ...previous, notes: event.target.value }))
                            }
                            className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void updateRelationship.mutateAsync()}
                              disabled={
                                !editingRelationshipForm.sourceCharacterId ||
                                !editingRelationshipForm.targetCharacterId ||
                                !editingRelationshipForm.label.trim() ||
                                updateRelationship.isPending
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                            >
                              {updateRelationship.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingRelationship}
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
                            <div className="font-medium text-foreground">
                              {sourceCharacterName}
                              {' -> '}
                              {targetCharacterName}
                            </div>
                            <div className="text-xs text-muted-foreground">{relationship.label}</div>
                            {relationship.notes && (
                              <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                                {relationship.notes}
                              </p>
                            )}
                          </div>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditingRelationship(relationship)}
                                className="text-xs text-muted-foreground hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteRelationship.mutateAsync(relationship.id)}
                                className="text-xs text-destructive hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No relationships yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'factions' && (
        <WorldFactionsSection
          world={world}
          canEdit={canEdit}
          draftOptions={draftOptions}
          draftNameById={draftNameById}
          onNotice={(message) => {
            setNotice(message);
            setError(null);
          }}
          onError={(message) => {
            setError(message);
            setNotice(null);
          }}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'locations' && (
        <WorldLocationsSection
          world={world}
          canEdit={canEdit}
          draftOptions={draftOptions}
          draftNameById={draftNameById}
          onNotice={(message) => {
            setNotice(message);
            setError(null);
          }}
          onError={(message) => {
            setError(message);
            setNotice(null);
          }}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
