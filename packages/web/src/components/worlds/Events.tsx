import { useState } from 'react';
import { Calendar, Plus, RefreshCw, Clock, MapPin, Users } from 'lucide-react';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import EventCalendarPlaceholder from './EventCalendarPlaceholder';
import EventEditorPlaceholder from './EventEditorPlaceholder';
import EventCategoriesPlaceholder from './EventCategoriesPlaceholder';

export default function Events() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useAssistantScreenContext({
    selected_world: selectedWorld,
    event_count: 0,
    upcoming_events: 0,
    past_events: 0,
  });

  return (
    <div className="app-page space-y-6 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Event registry</p>
            <h1 className="app-page-title">Stage world milestones, story beats, and participant lists on a shared chronology.</h1>
            <p className="app-page-summary">
              Events are still a planned system, but this route will anchor date-aware world changes, location-specific incidents, and the character participation layer that timelines depend on.
            </p>
          </div>
          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Event state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Total</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Upcoming</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Past</p>
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
          Create Event
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Upcoming</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Participants</div>
        </div>
      </div>

      <div className="app-panel p-8 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Events Yet</h3>
        <p className="text-muted-foreground">
          Create events to track story beats, world milestones, and character interactions.
        </p>
      </div>

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Event Features</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where event management features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <EventCalendarPlaceholder
            worldId={selectedWorld ?? undefined}
            eventCount={0}
          />
          <EventEditorPlaceholder
            eventId={undefined}
          />
          <EventCategoriesPlaceholder
            worldId={selectedWorld ?? undefined}
            categoryCount={0}
          />
        </div>
      </section>
    </div>
  );
}
