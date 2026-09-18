import { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import HoverHelpPopover from '../common/HoverHelpPopover';
import { useAssistantScreenContext } from '../common/useAssistantContext';

const PLANNED_EVENT_MODULES = [
  { label: 'Calendar view', icon: Calendar },
  { label: 'Event editor', icon: Clock },
  { label: 'Categories', icon: MapPin },
] as const;

export default function Events() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useAssistantScreenContext({
    selected_world: selectedWorld,
    event_count: 0,
    upcoming_events: 0,
    past_events: 0,
  });

  return (
    <div className="app-page space-y-6 pb-10 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Events</p>
            <h1 className="app-page-title">Event tracking is staged, not live.</h1>
            <p className="app-page-summary">
              This route is reserved for date-aware world changes, incidents, and shared chronology.
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
                <p className="app-page-metric-label">Events</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Modules</p>
                <div className="app-page-metric-value text-2xl">{PLANNED_EVENT_MODULES.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-start">
        <HoverHelpPopover
          title="Why events are still hidden"
          summary="Events remain hidden as a real workflow until timelines, locations, and shared participant state are wired into persistent world data."
          label="Why this route is staged"
        />
      </div>

      <section className="app-panel p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned modules</h2>
            <p className="text-sm text-muted-foreground">
              These are the event systems intended to land here once the route becomes active.
            </p>
          </div>
          <span className="app-pill app-pill-muted">Not live</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PLANNED_EVENT_MODULES.map(({ label, icon: Icon }) => (
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
