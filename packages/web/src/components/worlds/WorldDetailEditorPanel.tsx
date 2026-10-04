import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';
import WorldCharactersSection from './WorldCharactersSection';
import WorldDetailsSection from './WorldDetailsSection';
import WorldFactionsSection from './WorldFactionsSection';
import WorldLocationsSection from './WorldLocationsSection';
import WorldRelationshipsSection from './WorldRelationshipsSection';
import WorldTimelinesSection from './WorldTimelinesSection';

interface WorldDetailEditorPanelProps {
  world: WorldRecord | null;
  canEdit: boolean;
  onRefresh: () => void | Promise<unknown>;
  onDeleted?: () => void;
}

type WorldDetailTab = 'details' | 'characters' | 'relationships' | 'timelines' | 'factions' | 'locations';

export default function WorldDetailEditorPanel({ world, canEdit, onRefresh, onDeleted }: WorldDetailEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<WorldDetailTab>('details');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <WorldDetailsSection
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
      {activeTab === 'characters' && (
        <WorldCharactersSection
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
        <WorldRelationshipsSection
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
