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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Worlds</h1>
          <p className="text-muted-foreground">
            Manage worldbuilding, canon libraries, and shared universe data for your characters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            disabled
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 opacity-50 cursor-not-allowed"
            disabled
          >
            <Plus className="h-4 w-4" />
            Create World
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Worlds</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Factions</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Worlds Yet</h3>
        <p className="text-muted-foreground">
          Create a world to start organizing your characters, locations, and lore.
        </p>
      </div>

      {/* Planned Worldbuilding Tooling */}
      <section className="rounded-lg border border-dashed border-border bg-card/50 p-5">
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
