import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, Loader2, Save } from 'lucide-react';
import type { WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * World details tab of the world detail editor: the metadata form and its
 * dirty-tracking save.
 *
 * Extracted from `WorldDetailEditorPanel` (5.0 workspace-release work stream:
 * decompose the giant screens into focused, individually testable sections).
 * Behavior is pinned by `WorldDetailEditorPanel.test.tsx` through the parent.
 */

interface WorldDetailsSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface WorldMetadataForm {
  name: string;
  description: string;
  genre: string;
  setting: string;
  notes: string;
}

const EMPTY_WORLD_FORM: WorldMetadataForm = {
  name: '',
  description: '',
  genre: '',
  setting: '',
  notes: '',
};

export default function WorldDetailsSection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldDetailsSectionProps) {
  const [metadataForm, setMetadataForm] = useState<WorldMetadataForm>(EMPTY_WORLD_FORM);

  useEffect(() => {
    setMetadataForm({
      name: world.name,
      description: world.description || '',
      genre: world.genre || '',
      setting: world.setting || '',
      notes: world.notes || '',
    });
  }, [world]);

  const hasMetadataChanges = useMemo(() => {
    return (
      metadataForm.name !== world.name ||
      metadataForm.description !== (world.description || '') ||
      metadataForm.genre !== (world.genre || '') ||
      metadataForm.setting !== (world.setting || '') ||
      metadataForm.notes !== (world.notes || '')
    );
  }, [metadataForm, world]);

  const saveWorld = useMutation({
    mutationFn: async () => {
      return api.updateWorld(world.id, {
        name: metadataForm.name.trim(),
        description: metadataForm.description.trim() || undefined,
        genre: metadataForm.genre.trim() || undefined,
        setting: metadataForm.setting.trim() || undefined,
        notes: metadataForm.notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      onNotice('World details saved.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  return (
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
  );
}
