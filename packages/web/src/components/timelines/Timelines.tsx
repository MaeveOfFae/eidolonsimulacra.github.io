import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import HoverHelpPopover from '../common/HoverHelpPopover';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import GenerationHistoryPanel from './GenerationHistoryPanel';

// Event storage, ordering, and editing shipped inside the world editor
// (Worlds → each timeline), so they are no longer listed as staged here.
const PLANNED_TIMELINE_MODULES = [
  {
    name: 'Continuity assistant',
    status: 'Staged',
    description: 'Conflict detection still needs dedicated timeline data beyond saved draft branches.',
  },
];

export default function Timelines() {
  const { data } = useQuery({
    queryKey: ['drafts', 'timelines'],
    queryFn: () => api.getDrafts(),
  });

  const drafts = data?.drafts ?? [];
  const branchCount = drafts.filter((draft) => (draft.parent_drafts?.length ?? 0) > 0).length;
  const generationCount = drafts.length;

  useAssistantScreenContext({
    selected_world: null,
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="app-page-title">Track generation history across the saved draft graph.</h1>
              <span className="app-pill app-pill-muted">Partial</span>
            </div>
            <p className="app-page-summary">
              Generation history is live from saved drafts. Event editing and continuity tooling are still staged until
              the app has dedicated timeline data.
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GenerationHistoryPanel drafts={drafts} />

        <section className="app-panel border-dashed p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Staged timeline modules</h2>
              <p className="text-sm text-muted-foreground">
                The live chronology view here stops at draft history. World events and their ordering are edited on the
                Worlds screen, inside each timeline; what is still staged is listed below.
              </p>
            </div>
            <span className="app-pill app-pill-muted">Not live</span>
          </div>

          <div className="space-y-3">
            {PLANNED_TIMELINE_MODULES.map((module) => (
              <article key={module.name} className="rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{module.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <span className="app-pill app-pill-muted">{module.status}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex justify-start">
            <HoverHelpPopover
              title="When this screen becomes useful"
              summary={
                generationCount === 0
                  ? 'Generate and save drafts first. Timeline history only becomes useful once there is branch data to inspect.'
                  : 'Saved drafts already populate the history panel. Event and conflict tooling should stay out of the way until the underlying timeline model is real.'
              }
              label="When timeline history matters"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
