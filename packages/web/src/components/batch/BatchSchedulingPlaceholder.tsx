export interface BatchSchedulingPlaceholderProps {
  scheduledCount?: number;
  nextRunTime?: string;
}

export function BatchSchedulingPlaceholder({
  scheduledCount,
  nextRunTime,
}: BatchSchedulingPlaceholderProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">Batch Scheduling</h3>
      <p className="mt-2">
        Planned integration point for scheduling batch generation jobs to run at specific times,
        setting up recurring batch runs, and managing job queues.
      </p>
      <div className="mt-3 space-y-1">
        <p>Scheduled jobs: {scheduledCount ?? 0}</p>
        <p>Next run: {nextRunTime ?? 'no scheduled runs'}</p>
      </div>
    </section>
  );
}

export default BatchSchedulingPlaceholder;
