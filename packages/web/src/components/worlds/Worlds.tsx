import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, ShieldCheck, Users, MapPin, BookOpen, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import { serverClient } from '@/lib/server';
import HoverHelpPopover from '../common/HoverHelpPopover';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import WorldDetailEditorPanel from './WorldDetailEditorPanel';
import LorebookGeneratorPanel from './LorebookGeneratorPanel';

const PLANNED_WORLD_MODULES = [
  { label: 'Canon library', icon: BookOpen },
  { label: 'Worldbook', icon: Globe },
  { label: 'Relationships', icon: Users },
  { label: 'Factions', icon: ShieldCheck },
  { label: 'Locations', icon: MapPin },
  { label: 'Universe notes', icon: BookOpen },
  { label: 'Canon locks', icon: Lock },
] as const;

export default function Worlds() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  const { data: serverStatus } = useQuery({
    queryKey: ['worlds-server-status'],
    queryFn: () => serverClient.checkStatus(),
    enabled: !selfContainedDesktop,
    refetchInterval: selfContainedDesktop ? false : 15000,
  });

  const { data: worldsData, refetch: refetchWorlds } = useQuery({
    queryKey: ['worlds-list'],
    queryFn: () => api.getWorlds({ includePublic: false }),
    enabled: selfContainedDesktop || serverStatus?.authenticated === true,
  });

  const worlds = worldsData?.worlds ?? [];
  const worldCount = worlds.length;
  const totalCharacters = worlds.reduce((sum, world) => sum + (world._count?.characters ?? 0), 0);
  const totalFactions = worlds.reduce((sum, world) => sum + (world._count?.factions ?? 0), 0);
  const totalLocations = worlds.reduce((sum, world) => sum + (world._count?.locations ?? 0), 0);
  const selectedWorldRecord = worlds.find((world) => world.id === selectedWorld) ?? worlds[0] ?? null;

  const { data: selectedWorldData, refetch: refetchSelectedWorld } = useQuery({
    queryKey: ['world-detail', selectedWorldRecord?.id],
    queryFn: () => api.getWorld(selectedWorldRecord!.id),
    enabled: Boolean((selfContainedDesktop || serverStatus?.authenticated) && selectedWorldRecord?.id),
  });

  const selectedWorldDetail = selectedWorldData?.world;

  useAssistantScreenContext({
    selected_world: selectedWorldRecord?.id ?? selectedWorld,
    world_count: worldCount,
    total_characters: totalCharacters,
    total_factions: totalFactions,
    total_locations: totalLocations,
  });

  return (
    <div className="app-page space-y-8 pb-10 sm:space-y-10 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Worlds</p>
            <h1 className="app-page-title">{selfContainedDesktop ? 'Worldbuilding is now locally persistent.' : 'Worldbuilding is partially live.'}</h1>
            <p className="app-page-summary">
              {selfContainedDesktop
                ? 'Generate connected lorebook packets from saved drafts, promote them into local worlds, and keep characters, factions, locations, and timelines entirely on-device.'
                : 'Generate connected lorebook packets from existing drafts now; persistent world editing is still staged.'}
            </p>
          </div>
          <div className="app-panel-muted p-4 sm:p-5">
            <p className="app-page-eyebrow">Status</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Availability</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">Partial</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Worlds</p>
                <div className="app-page-metric-value text-2xl">{worldCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Modules</p>
                <div className="app-page-metric-value text-2xl">{PLANNED_WORLD_MODULES.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Canon Nodes</p>
                <div className="app-page-metric-value text-2xl">{totalCharacters + totalFactions + totalLocations}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-start">
        <HoverHelpPopover
          title={selfContainedDesktop ? 'Why worlds are local here' : 'Why this screen is still partial'}
          summary={selfContainedDesktop
            ? 'This desktop build keeps world data locally. Promote lorebook packets into worlds, then edit canon nodes and timelines without any sync server.'
            : 'Shared world persistence is still staged, but lorebook synthesis from existing drafts is live here now. Use it to extract connected canon before persistent world data lands.'}
          label="Why this screen behaves this way"
        />
      </div>

      <LorebookGeneratorPanel
        canPromote={selfContainedDesktop || serverStatus?.authenticated === true}
        promotionStatusMessage={
          selfContainedDesktop
            ? null
            : serverStatus?.authenticated
            ? null
            : serverStatus?.connected
              ? 'Sign in to the sync server to promote lorebook packets into persisted worlds.'
              : 'Enable and connect server sync to promote lorebook packets into persisted worlds.'
        }
        onWorldPromoted={(worldId) => {
          setSelectedWorld(worldId);
          void refetchWorlds();
          void refetchSelectedWorld();
        }}
      />

      <section className="app-panel p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Persisted worlds</h2>
            <p className="text-sm text-muted-foreground">
              {selfContainedDesktop
                ? 'Persisted world editing is unavailable in the self-contained desktop build today. Lorebook packet synthesis remains local.'
                : 'Worlds promoted from lorebook packets live on the sync server and can already hold linked characters, factions, locations, and canonical event timelines.'}
            </p>
          </div>
          <span className="app-pill app-pill-muted">{selfContainedDesktop ? 'Local-only' : 'Server-backed'}</span>
        </div>

        {!selfContainedDesktop && serverStatus?.authenticated !== true ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            {selfContainedDesktop
              ? 'Persisted worlds are not available in the self-contained desktop build yet.'
              : serverStatus?.connected
              ? 'Sign in to the sync server to view or promote persisted worlds.'
              : 'Connect and sign in to the sync server to persist worlds beyond the local lorebook packet store.'}
          </div>
        ) : worlds.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            No persisted worlds yet. Promote a generated lorebook packet to create your first server-backed world.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {worlds.map((world) => (
                <button
                  key={world.id}
                  type="button"
                  onClick={() => setSelectedWorld(world.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedWorldRecord?.id === world.id ? 'border-primary bg-primary/10' : 'border-border bg-background/40 hover:bg-accent/40'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{world.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{world.description || 'No description yet.'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{world._count?.characters ?? 0} chars</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {world.genre && <span className="rounded-full bg-muted px-2 py-1">{world.genre}</span>}
                    <span className="rounded-full bg-muted px-2 py-1">{world._count?.factions ?? 0} factions</span>
                    <span className="rounded-full bg-muted px-2 py-1">{world._count?.locations ?? 0} locations</span>
                    {world.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-1">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-4">
              <WorldDetailEditorPanel
                world={selectedWorldDetail ?? null}
                canEdit={selfContainedDesktop || serverStatus?.authenticated === true}
                onRefresh={async () => {
                  await refetchWorlds();
                  await refetchSelectedWorld();
                }}
                onDeleted={() => {
                  setSelectedWorld(null);
                  void refetchWorlds();
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="app-panel p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned modules</h2>
            <p className="text-sm text-muted-foreground">
              These are the systems intended to land here once world data becomes editable.
            </p>
          </div>
          <span className="app-pill app-pill-muted">Not live</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PLANNED_WORLD_MODULES.map(({ label, icon: Icon }) => (
            <div key={label} className="app-panel-muted flex items-center gap-3 p-3">
              <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
