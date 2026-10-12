import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { listResumableRuns, type ResumableRun } from '@/lib/dashboard-data';

/**
 * Work parked mid-run, or finished and waiting on a decision.
 *
 * This is the panel the dashboard item was actually for: an interrupted batch, an
 * offspring blend stopped before its character was written, a draft whose assets were
 * refined and never accepted — each was only discoverable by navigating back to the
 * screen that started it. Nothing else in the app reads these sessions.
 *
 * Renders nothing when nothing is in flight, because a panel whose only job is to surface
 * parked work has no business occupying space when there is none.
 *
 * Re-reads on focus and on tab visibility: the sessions are written by other screens, and
 * Home can sit open in one tab while a run starts in another.
 */
export default function InFlightPanel() {
  const [runs, setRuns] = useState<ResumableRun[]>(() => listResumableRuns());

  useEffect(() => {
    const refresh = () => setRuns(listResumableRuns());

    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  if (runs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          In flight
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Runs that are parked or waiting on a decision, most recently touched first.
        </p>
      </div>

      <div className="grid gap-2">
        {runs.map((run) => (
          <Link
            key={run.id}
            to={run.to}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/35 hover:bg-background/60"
          >
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                run.state === 'in-progress' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary'
              }`}
            >
              {run.state === 'in-progress' ? 'Parked' : 'Ready'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{run.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{run.detail}</span>
            </span>
            <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <ArrowRight className="sr-only" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
