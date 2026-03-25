import { useState } from 'react';
import { Globe, ShieldCheck, Users, MapPin, BookOpen, Lock } from 'lucide-react';
import { useAssistantScreenContext } from '../common/useAssistantContext';

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
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useAssistantScreenContext({
    selected_world: selectedWorld,
    world_count: 0,
    total_characters: 0,
    total_factions: 0,
    total_locations: 0,
  });

  return (
    <div className="app-page space-y-8 pb-10 sm:space-y-10 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Worlds</p>
            <h1 className="app-page-title">Worldbuilding is staged, not live.</h1>
            <p className="app-page-summary">
              This route is reserved for shared setting data that sits above individual drafts.
            </p>
          </div>
          <div className="app-panel-muted p-4 sm:p-5">
            <p className="app-page-eyebrow">Status</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Availability</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">Planned</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Worlds</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Modules</p>
                <div className="app-page-metric-value text-2xl">{PLANNED_WORLD_MODULES.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="app-note p-4 text-sm text-muted-foreground">
        World routes are intentionally held back until shared canon, factions, locations, and timeline data have real persistence and cross-draft behavior.
      </div>

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
