import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Loader2 } from 'lucide-react';
import { buildEventCalendar, type EventCalendarGroupKind } from '@char-gen/shared';
import { api } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import { useAssistantScreenContext } from '../common/useAssistantContext';

/**
 * Cross-world event calendar.
 *
 * Events are authored inside each world's timelines (Worlds → a timeline); this
 * screen is the date-aware view across all of them. `buildEventCalendar` splits
 * free-text dates into real-world dates (YYYY, YYYY-MM, YYYY-MM-DD) and in-world
 * labels, and lists undated events last rather than dropping them.
 */

const GROUP_KIND_LABEL: Record<EventCalendarGroupKind, string> = {
  dated: 'real-world date',
  labelled: 'in-world date',
  undated: 'undated',
};

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export default function Events() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [worldFilter, setWorldFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['world-timeline-events'],
    queryFn: () => api.getWorldTimelineEvents(),
    enabled: selfContainedDesktop,
  });

  const events = useMemo(() => data?.events ?? [], [data?.events]);

  const worldOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const event of events) {
      byId.set(event.worldId, event.worldName);
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => compareText(left.name, right.name));
  }, [events]);

  const visibleEvents = useMemo(
    () => (worldFilter === 'all' ? events : events.filter((event) => event.worldId === worldFilter)),
    [events, worldFilter],
  );
  const calendar = useMemo(() => buildEventCalendar(visibleEvents), [visibleEvents]);

  useAssistantScreenContext({
    selected_world: worldFilter === 'all' ? null : worldFilter,
    event_count: visibleEvents.length,
    // "Upcoming" needs a clock; in-world dates have none, so it stays 0.
    upcoming_events: 0,
    past_events: 0,
  });

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Events</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="app-page-title">Every timeline event across your worlds.</h1>
              <span className="app-pill app-pill-muted">{selfContainedDesktop ? 'Live' : 'Desktop only'}</span>
            </div>
            <p className="app-page-summary">
              Events are authored inside each world's timelines. This view groups them by date: values written as YYYY,
              YYYY-MM, or YYYY-MM-DD sort as real-world dates, anything else stays an in-world label in its recorded
              order, and undated events are listed last.
            </p>
          </div>
          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Calendar state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Events</p>
                <div className="app-page-metric-value text-2xl">{calendar.eventCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Worlds</p>
                <div className="app-page-metric-value text-2xl">{calendar.worldCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Timelines</p>
                <div className="app-page-metric-value text-2xl">{calendar.timelineCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {!selfContainedDesktop ? (
        <section className="app-panel p-5">
          <h2 className="text-lg font-semibold">The calendar reads your desktop worlds.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Persisted worlds, factions, locations, and timelines live in the desktop app's local store, so this calendar
            has nothing to show in the browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link className="text-primary hover:underline" to="/worlds">
              Open Worlds
            </Link>
            <Link className="text-primary hover:underline" to="/download">
              Get the desktop app
            </Link>
          </div>
        </section>
      ) : isLoading ? (
        <section className="app-panel flex items-center gap-2 p-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading events…
        </section>
      ) : calendar.groups.length === 0 ? (
        <section className="app-panel p-5">
          <h2 className="text-lg font-semibold">No events yet.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add events inside a world's timeline and they appear here, grouped by date.
          </p>
          <div className="mt-4">
            <Link className="text-primary hover:underline" to="/worlds">
              Open Worlds
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {worldOptions.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWorldFilter('all')}
                aria-pressed={worldFilter === 'all'}
                className={`app-pill ${worldFilter === 'all' ? 'border-primary text-primary' : 'app-pill-muted'}`}
              >
                All worlds ({events.length})
              </button>
              {worldOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setWorldFilter(option.id)}
                  aria-pressed={worldFilter === option.id}
                  className={`app-pill ${worldFilter === option.id ? 'border-primary text-primary' : 'app-pill-muted'}`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}

          {calendar.groups.map((group) => (
            <div key={group.id} className="app-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">{group.label}</h2>
                <span className="app-pill app-pill-muted">{GROUP_KIND_LABEL[group.kind]}</span>
                <span className="text-xs text-muted-foreground">
                  {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {group.events.map((event) => (
                  <li key={event.id} className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {event.worldName} · {event.timelineName}
                      </span>
                    </div>
                    {event.eventDate && <p className="mt-1 text-xs text-muted-foreground">Date: {event.eventDate}</p>}
                    {event.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{event.description}</p>
                    )}
                    {event.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
