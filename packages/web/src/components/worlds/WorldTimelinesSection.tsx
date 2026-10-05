import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Calendar, Check, Loader2, Plus, X } from 'lucide-react';
import type { TimelineRecord, WorldRecord } from '@char-gen/shared';
import { api } from '@/lib/api';

/**
 * Timelines tab of the world detail editor: timeline CRUD plus per-timeline
 * event editing with reorder arrows.
 *
 * Extracted from `WorldDetailEditorPanel` (5.0 workspace-release work stream:
 * decompose the giant screens into focused, individually testable sections).
 * Behavior is pinned by `WorldDetailEditorPanel.test.tsx` through the parent.
 */

interface WorldTimelinesSectionProps {
  world: WorldRecord;
  canEdit: boolean;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

interface TimelineFormState {
  name: string;
  description: string;
}

interface EventFormState {
  title: string;
  eventDate: string;
  description: string;
}

const EMPTY_TIMELINE_FORM: TimelineFormState = {
  name: '',
  description: '',
};

const EMPTY_EVENT_FORM: EventFormState = {
  title: '',
  eventDate: '',
  description: '',
};

export default function WorldTimelinesSection({
  world,
  canEdit,
  onNotice,
  onError,
  onRefresh,
}: WorldTimelinesSectionProps) {
  const [timelineForm, setTimelineForm] = useState<TimelineFormState>(EMPTY_TIMELINE_FORM);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editingTimelineForm, setEditingTimelineForm] = useState<TimelineFormState>(EMPTY_TIMELINE_FORM);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventForm, setEditingEventForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTimelineId((current) => {
      if (current && world.timelines?.some((timeline) => timeline.id === current)) {
        return current;
      }

      return world.timelines?.[0]?.id ?? null;
    });
  }, [world]);

  const { data: selectedTimelineData, refetch: refetchTimeline } = useQuery({
    queryKey: ['timeline-detail', selectedTimelineId],
    queryFn: () => api.getTimeline(selectedTimelineId!),
    enabled: Boolean(selectedTimelineId),
  });

  const selectedTimeline: TimelineRecord | undefined = selectedTimelineData?.timeline;
  const selectedTimelineEvents = selectedTimeline?.events ?? [];
  const firstTimelineEventId = selectedTimelineEvents[0]?.id ?? null;
  const lastTimelineEventId = selectedTimelineEvents[selectedTimelineEvents.length - 1]?.id ?? null;

  const addTimeline = useMutation({
    mutationFn: async () => {
      return api.createTimeline({
        worldId: world.id,
        name: timelineForm.name.trim(),
        description: timelineForm.description.trim() || undefined,
      });
    },
    onSuccess: async (result) => {
      setTimelineForm(EMPTY_TIMELINE_FORM);
      setSelectedTimelineId(result.timeline.id);
      onNotice('Timeline created.');
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const updateTimeline = useMutation({
    mutationFn: async () => {
      if (!editingTimelineId) {
        throw new Error('No timeline selected');
      }

      return api.updateTimeline(editingTimelineId, {
        name: editingTimelineForm.name.trim(),
        description: editingTimelineForm.description.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEditingTimelineId(null);
      setEditingTimelineForm(EMPTY_TIMELINE_FORM);
      onNotice('Timeline updated.');
      await onRefresh();
      await refetchTimeline();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteTimeline = useMutation({
    mutationFn: async (timelineId: string) => api.deleteTimeline(timelineId),
    onSuccess: async () => {
      onNotice('Timeline deleted.');
      setSelectedTimelineId(null);
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const addTimelineEvent = useMutation({
    mutationFn: async () => {
      if (!selectedTimelineId) {
        throw new Error('Select a timeline first');
      }

      return api.addTimelineEvent(selectedTimelineId, {
        title: eventForm.title.trim(),
        eventDate: eventForm.eventDate.trim() || undefined,
        description: eventForm.description.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEventForm(EMPTY_EVENT_FORM);
      onNotice('Timeline event added.');
      await refetchTimeline();
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const updateTimelineEvent = useMutation({
    mutationFn: async () => {
      if (!selectedTimelineId || !editingEventId) {
        throw new Error('No event selected');
      }

      return api.updateTimelineEvent(selectedTimelineId, editingEventId, {
        title: editingEventForm.title.trim(),
        eventDate: editingEventForm.eventDate.trim() || undefined,
        description: editingEventForm.description.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEditingEventId(null);
      setEditingEventForm(EMPTY_EVENT_FORM);
      onNotice('Timeline event updated.');
      await refetchTimeline();
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const deleteTimelineEvent = useMutation({
    mutationFn: async (eventId: string) => {
      if (!selectedTimelineId) {
        throw new Error('Select a timeline first');
      }

      return api.deleteTimelineEvent(selectedTimelineId, eventId);
    },
    onSuccess: async () => {
      onNotice('Timeline event deleted.');
      await refetchTimeline();
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const reorderTimelineEvents = useMutation({
    mutationFn: async ({ eventId, direction }: { eventId: string; direction: 'up' | 'down' }) => {
      if (!selectedTimelineId || !selectedTimeline?.events?.length) {
        throw new Error('No timeline events available to reorder');
      }

      const currentEvents = [...selectedTimeline.events];
      const currentIndex = currentEvents.findIndex((event) => event.id === eventId);
      if (currentIndex === -1) {
        throw new Error('Timeline event not found');
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentEvents.length) {
        return;
      }

      const [movedEvent] = currentEvents.splice(currentIndex, 1);
      currentEvents.splice(targetIndex, 0, movedEvent);

      await Promise.all(
        currentEvents.map((event, index) =>
          api.updateTimelineEvent(selectedTimelineId, event.id, { sortOrder: index }),
        ),
      );
    },
    onSuccess: async () => {
      onNotice('Timeline event order updated.');
      await refetchTimeline();
      await onRefresh();
    },
    onError: (mutationError: Error) => {
      onError(mutationError.message);
    },
  });

  const startEditingTimeline = (timeline: NonNullable<WorldRecord['timelines']>[number]) => {
    setEditingTimelineId(timeline.id);
    setEditingTimelineForm({
      name: timeline.name,
      description: timeline.description || '',
    });
  };

  const cancelEditingTimeline = () => {
    setEditingTimelineId(null);
    setEditingTimelineForm(EMPTY_TIMELINE_FORM);
  };

  const startEditingEvent = (event: NonNullable<TimelineRecord['events']>[number]) => {
    setEditingEventId(event.id);
    setEditingEventForm({
      title: event.title,
      eventDate: event.eventDate || '',
      description: event.description || '',
    });
  };

  const cancelEditingEvent = () => {
    setEditingEventId(null);
    setEditingEventForm(EMPTY_EVENT_FORM);
  };

  const timelines = world.timelines ?? [];

  return (
    <section className="rounded-xl border border-border/60 bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Canon timelines</h4>
      </div>
      <div className="space-y-3">
        {canEdit && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3">
            <input
              value={timelineForm.name}
              onChange={(event) => setTimelineForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="Timeline name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              value={timelineForm.description}
              onChange={(event) => setTimelineForm((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Timeline description"
              className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => void addTimeline.mutateAsync()}
              disabled={!timelineForm.name.trim() || addTimeline.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
            >
              {addTimeline.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add timeline
            </button>
          </div>
        )}

        <div className="space-y-2">
          {timelines.length > 0 ? (
            timelines.map((timeline) => (
              <div
                key={timeline.id}
                className={`rounded-lg border p-3 ${selectedTimelineId === timeline.id ? 'border-primary bg-primary/10' : 'border-border/60 bg-background/60'}`}
              >
                {editingTimelineId === timeline.id ? (
                  <div className="space-y-2">
                    <input
                      aria-label="Timeline name"
                      value={editingTimelineForm.name}
                      onChange={(event) =>
                        setEditingTimelineForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      aria-label="Timeline description"
                      value={editingTimelineForm.description}
                      onChange={(event) =>
                        setEditingTimelineForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateTimeline.mutateAsync()}
                        disabled={!editingTimelineForm.name.trim() || updateTimeline.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                      >
                        {updateTimeline.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingTimeline}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => setSelectedTimelineId(timeline.id)} className="text-left">
                      <div className="text-sm font-medium text-foreground">{timeline.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {timeline.description || 'No timeline description.'}
                      </div>
                    </button>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingTimeline(timeline)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteTimeline.mutateAsync(timeline.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">{timeline._count?.events ?? 0} events</div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No timelines yet.</p>
          )}
        </div>

        {selectedTimeline && (
          <div className="space-y-3 rounded-lg border border-border/50 bg-background/60 p-3">
            <div>
              <div className="text-sm font-medium text-foreground">{selectedTimeline.name}</div>
              <div className="text-xs text-muted-foreground">{selectedTimeline.description || 'No description.'}</div>
            </div>
            {canEdit && (
              <div className="space-y-2">
                <input
                  value={eventForm.title}
                  onChange={(event) => setEventForm((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Event title"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  value={eventForm.eventDate}
                  onChange={(event) => setEventForm((previous) => ({ ...previous, eventDate: event.target.value }))}
                  placeholder="Event date (optional)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <textarea
                  value={eventForm.description}
                  onChange={(event) => setEventForm((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Event description"
                  className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => void addTimelineEvent.mutateAsync()}
                  disabled={!eventForm.title.trim() || addTimelineEvent.isPending}
                  className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
                >
                  {addTimelineEvent.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add event
                </button>
              </div>
            )}

            <div className="space-y-2">
              {selectedTimelineEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-border/60 bg-background p-3 text-sm">
                  {editingEventId === event.id ? (
                    <div className="space-y-2">
                      <input
                        aria-label="Event title"
                        value={editingEventForm.title}
                        onChange={(eventChange) =>
                          setEditingEventForm((previous) => ({ ...previous, title: eventChange.target.value }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <input
                        aria-label="Event date"
                        value={editingEventForm.eventDate}
                        onChange={(eventChange) =>
                          setEditingEventForm((previous) => ({ ...previous, eventDate: eventChange.target.value }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <textarea
                        aria-label="Event description"
                        value={editingEventForm.description}
                        onChange={(eventChange) =>
                          setEditingEventForm((previous) => ({
                            ...previous,
                            description: eventChange.target.value,
                          }))
                        }
                        className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void updateTimelineEvent.mutateAsync()}
                          disabled={!editingEventForm.title.trim() || updateTimelineEvent.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                        >
                          {updateTimelineEvent.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingEvent}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs hover:bg-accent"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.eventDate || 'No date set'}</div>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void reorderTimelineEvents.mutateAsync({ eventId: event.id, direction: 'up' })
                              }
                              disabled={reorderTimelineEvents.isPending || firstTimelineEventId === event.id}
                              aria-label="Move event up"
                              className="text-xs text-muted-foreground hover:underline disabled:opacity-40"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void reorderTimelineEvents.mutateAsync({ eventId: event.id, direction: 'down' })
                              }
                              disabled={reorderTimelineEvents.isPending || lastTimelineEventId === event.id}
                              aria-label="Move event down"
                              className="text-xs text-muted-foreground hover:underline disabled:opacity-40"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingEvent(event)}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteTimelineEvent.mutateAsync(event.id)}
                              className="text-xs text-destructive hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{event.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
              {selectedTimelineEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">No events in this timeline yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
