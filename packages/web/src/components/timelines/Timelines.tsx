import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Plus, RefreshCw, Calendar, GitBranch, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import GenerationHistoryPanel from './GenerationHistoryPanel';
import EventTimelinePlaceholder from './EventTimelinePlaceholder';
import ContinuityAssistantPlaceholder from './ContinuityAssistantPlaceholder';

export default function Timelines() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ['drafts', 'timelines'],
    queryFn: () => api.getDrafts(),
  });

  const drafts = data?.drafts ?? [];
  const branchCount = drafts.filter((draft) => (draft.parent_drafts?.length ?? 0) > 0).length;
  const generationCount = drafts.length;

  useAssistantScreenContext({
    selected_world: selectedWorld,
    timeline_count: branchCount,
    event_count: 0,
    conflict_count: 0,
  });

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Chronology layer</p>
            <h1 className="app-page-title">Track generation history, continuity pressure, and world chronology across the draft graph.</h1>
            <p className="app-page-summary">
              Generation history is live from the saved draft graph. World events and continuity tooling are still staged behind the broader timeline surface.
            </p>
          </div>
          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Timeline state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Branches</p>
                <div className="app-page-metric-value text-2xl">{branchCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Events</p>
                <div className="app-page-metric-value text-2xl">0</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Conflicts</p>
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
          Add Event
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{branchCount}</span>
          </div>
          <div className="text-sm text-muted-foreground">Lineage Branches</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Events</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{generationCount}</span>
          </div>
          <div className="text-sm text-muted-foreground">Generations</div>
        </div>
        <div className="app-panel p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Conflicts</div>
        </div>
      </div>

      <div className="app-panel p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{generationCount === 0 ? 'No Timeline Data' : 'Timeline Shell Ready'}</h3>
        <p className="text-muted-foreground">
          {generationCount === 0
            ? 'Generate characters and create worlds to start building your timeline.'
            : 'Saved drafts now feed the generation history view. World events and continuity analysis still need dedicated timeline data.'}
        </p>
      </div>

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Timeline Tooling</h2>
            <p className="text-sm text-muted-foreground">
              Generation history is live now from saved drafts. Event and continuity tooling remain staged here.
            </p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            Partial
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <GenerationHistoryPanel drafts={drafts} />
          <EventTimelinePlaceholder
            worldId={selectedWorld ?? undefined}
            eventCount={0}
          />
          <ContinuityAssistantPlaceholder
            worldId={selectedWorld ?? undefined}
            conflictCount={0}
          />
        </div>
      </section>
    </div>
  );
}
