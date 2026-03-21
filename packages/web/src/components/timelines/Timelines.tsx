import { useState } from 'react';
import { Clock, Plus, RefreshCw, Calendar, GitBranch, AlertTriangle } from 'lucide-react';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import GenerationHistoryPlaceholder from './GenerationHistoryPlaceholder';
import EventTimelinePlaceholder from './EventTimelinePlaceholder';
import ContinuityAssistantPlaceholder from './ContinuityAssistantPlaceholder';

export default function Timelines() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useAssistantScreenContext({
    selected_world: selectedWorld,
    timeline_count: 0,
    event_count: 0,
    conflict_count: 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Timelines</h1>
          <p className="text-muted-foreground">
            View generation history, world events, and continuity across your characters and drafts.
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
            Add Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Lineage Branches</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Events</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Generations</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">0</span>
          </div>
          <div className="text-sm text-muted-foreground">Conflicts</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Timeline Data</h3>
        <p className="text-muted-foreground">
          Generate characters and create worlds to start building your timeline.
        </p>
      </div>

      {/* Planned Timeline Tooling */}
      <section className="rounded-lg border border-dashed border-border bg-card/50 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Timeline Features</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where timeline and continuity features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <GenerationHistoryPlaceholder
            draftCount={0}
          />
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
