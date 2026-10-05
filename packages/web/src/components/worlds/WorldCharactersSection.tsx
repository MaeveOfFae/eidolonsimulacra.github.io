import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Check, Loader2, Plus, Users, X } from 'lucide-react';
import type { WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Characters tab of the world detail editor.
 *
 * Extracted from `WorldDetailEditorPanel` (5.0 workspace-release work stream:
 * decompose the giant screens into focused, individually testable sections).
 * Behavior is pinned by `WorldDetailEditorPanel.test.tsx` through the parent.
 */

interface WorldCharactersSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface CharacterFormState {
  characterName: string;
  role: string;
  notes: string;
}

const EMPTY_CHARACTER_FORM: CharacterFormState = {
  characterName: '',
  role: '',
  notes: '',
};

export default function WorldCharactersSection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldCharactersSectionProps) {
  const [characterForm, setCharacterForm] = useState<CharacterFormState>(EMPTY_CHARACTER_FORM);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingCharacterForm, setEditingCharacterForm] = useState<CharacterFormState>(EMPTY_CHARACTER_FORM);

  const addCharacter = useMutation({
    mutationFn: async () => {
      return api.addWorldCharacter(world.id, {
        characterName: characterForm.characterName.trim(),
        role: characterForm.role.trim() || undefined,
        notes: characterForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setCharacterForm(EMPTY_CHARACTER_FORM);
      onNotice('Character added.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const updateCharacter = useMutation({
    mutationFn: async () => {
      if (!editingCharacterId) {
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
      onNotice('Character updated.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const unlinkCharacterDraft = useMutation({
    mutationFn: async (characterId: string) => {
      return api.updateWorldCharacter(world.id, characterId, {
        draftId: '',
      });
    },
    onSuccess: async () => {
      onNotice('Draft link removed from character.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteCharacter = useMutation({
    mutationFn: async (characterId: string) => {
      return api.deleteWorldCharacter(world.id, characterId);
    },
    onSuccess: async () => {
      onNotice('Character removed.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
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

  const characters = world.characters ?? [];

  return (
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
              onChange={(event) => setCharacterForm((previous) => ({ ...previous, characterName: event.target.value }))}
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
                      aria-label="Character name"
                      value={editingCharacterForm.characterName}
                      onChange={(event) =>
                        setEditingCharacterForm((previous) => ({ ...previous, characterName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <input
                      aria-label="Character role"
                      value={editingCharacterForm.role}
                      onChange={(event) =>
                        setEditingCharacterForm((previous) => ({ ...previous, role: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      aria-label="Character notes"
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
  );
}
