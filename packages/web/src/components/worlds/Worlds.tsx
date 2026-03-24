import { useState } from 'react';
import { Globe, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import CanonLibraryPlaceholder from './CanonLibraryPlaceholder';
import WorldbookPlaceholder from './WorldbookPlaceholder';
import RelationshipMapPlaceholder from './RelationshipMapPlaceholder';
import FactionManagerPlaceholder from './FactionManagerPlaceholder';
import LocationManagerPlaceholder from './LocationManagerPlaceholder';
import UniverseNotesPlaceholder from './UniverseNotesPlaceholder';
import CanonLockPlaceholder from './CanonLockPlaceholder';

export default function Worlds() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useAssistantScreenContext({
    selected_world: selectedWorld,
    world_count: 0,
    total_characters: 0,
    total_factions: 0,
    total_locations: 0,
  });

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Shared setting layer</p>
            <h1 className="app-page-title">Stage worldbuilding, canon locks, and lore scaffolding around your character drafts.</h1>
            <p className="app-page-summary">
              The worldbuilding system is still largely planned, but this route defines where cross-character setting data, faction state, and location context will attach once it moves beyond placeholders.
            </p>
          </div>
          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">World state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Worlds</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Factions</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Locations</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-2xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent"
          disabled
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground opacity-50"
          disabled
        >
          <Plus className="h-4 w-4" />
          Create World
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="app-panel p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Worlds</div>
        </div>
        <div className="app-panel p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </div>
        <div className="app-panel p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Factions</div>
        </div>
        <div className="app-panel p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
      </div>

      <div className="app-panel p-8 text-center">
        <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Worlds Yet</h3>
        <p className="text-muted-foreground">
          Create a world to start organizing your characters, locations, and lore.
        </p>
      </div>

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Worldbuilding Features</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where worldbuilding and canon management features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <CanonLibraryPlaceholder
            worldId={selectedWorld ?? undefined}
            entryCount={0}
          />
          <WorldbookPlaceholder
            worldName={selectedWorld ?? undefined}
            settingCount={0}
            characterCount={0}
          />
          <RelationshipMapPlaceholder
            characterCount={0}
            relationshipCount={0}
          />
          <FactionManagerPlaceholder
            worldId={selectedWorld ?? undefined}
            factionCount={0}
          />
          <LocationManagerPlaceholder
            worldId={selectedWorld ?? undefined}
            locationCount={0}
          />
          <UniverseNotesPlaceholder
            worldId={selectedWorld ?? undefined}
            noteCount={0}
          />
        </div>

        <div className="mt-4">
          <CanonLockPlaceholder
            worldId={selectedWorld ?? undefined}
            lockedFactCount={0}
          />
        </div>
      </section>
    </div>
  );
}
