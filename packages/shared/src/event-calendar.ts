/**
 * Event calendar: timeline events from every world ordered into one chronology.
 *
 * An event date is free text, so this module splits it in two honest ways: a
 * value that is exactly `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` is a real-world date
 * and sorts numerically, while anything else ("1204 AF", "the Long Winter") is
 * an in-world label whose events keep their recorded `sortOrder`. Events with no
 * date are listed last rather than dropped.
 */

import type { WorldTimelineEventRecord } from './types';

export type EventCalendarGroupKind = 'dated' | 'labelled' | 'undated';

export interface EventCalendarGroup {
  id: string;
  kind: EventCalendarGroupKind;
  label: string;
  /** For `dated` groups: the normalised `YYYY-MM-DD` used for sorting. */
  isoDate?: string;
  events: WorldTimelineEventRecord[];
}

export interface EventCalendar {
  groups: EventCalendarGroup[];
  eventCount: number;
  worldCount: number;
  timelineCount: number;
}

export interface ParsedEventDate {
  kind: 'dated' | 'labelled';
  /** The label as written, and the group key. */
  value: string;
  /** Normalised `YYYY-MM-DD`; present only for `dated` values. */
  iso?: string;
}

const REAL_WORLD_DATE = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function parseEventDate(raw: unknown): ParsedEventDate | null {
  const value = (typeof raw === 'string' ? raw : '').replace(/\s+/g, ' ').trim();
  if (!value) {
    return null;
  }

  const match = value.match(REAL_WORLD_DATE);
  if (!match) {
    return { kind: 'labelled', value };
  }

  const [, year, month, day] = match;
  return {
    kind: 'dated',
    value,
    iso: `${year}-${(month ?? '1').padStart(2, '0')}-${(day ?? '1').padStart(2, '0')}`,
  };
}

function bySortOrder(left: WorldTimelineEventRecord, right: WorldTimelineEventRecord): number {
  return left.sortOrder - right.sortOrder || compareText(left.title, right.title);
}

function minSortOrder(events: readonly WorldTimelineEventRecord[]): number {
  return events.reduce((lowest, event) => Math.min(lowest, event.sortOrder), Number.POSITIVE_INFINITY);
}

export function buildEventCalendar(events: readonly WorldTimelineEventRecord[]): EventCalendar {
  const dated = new Map<string, { iso: string; events: WorldTimelineEventRecord[] }>();
  const labelled = new Map<string, WorldTimelineEventRecord[]>();
  const undated: WorldTimelineEventRecord[] = [];

  for (const event of events) {
    const parsed = parseEventDate(event.eventDate);

    if (!parsed) {
      undated.push(event);
    } else if (parsed.kind === 'dated') {
      const bucket = dated.get(parsed.value) ?? { iso: parsed.iso!, events: [] };
      bucket.events.push(event);
      dated.set(parsed.value, bucket);
    } else {
      labelled.set(parsed.value, [...(labelled.get(parsed.value) ?? []), event]);
    }
  }

  const groups: EventCalendarGroup[] = [
    ...[...dated.entries()]
      .sort((left, right) => compareText(left[1].iso, right[1].iso) || compareText(left[0], right[0]))
      .map<EventCalendarGroup>(([value, bucket]) => ({
        id: `dated:${value}`,
        kind: 'dated',
        label: value,
        isoDate: bucket.iso,
        events: [...bucket.events].sort(bySortOrder),
      })),
    ...[...labelled.entries()]
      .sort((left, right) => minSortOrder(left[1]) - minSortOrder(right[1]) || compareText(left[0], right[0]))
      .map<EventCalendarGroup>(([value, list]) => ({
        id: `labelled:${value}`,
        kind: 'labelled',
        label: value,
        events: [...list].sort(bySortOrder),
      })),
  ];

  if (undated.length > 0) {
    groups.push({ id: 'undated', kind: 'undated', label: 'Undated', events: [...undated].sort(bySortOrder) });
  }

  return {
    groups,
    eventCount: events.length,
    worldCount: new Set(events.map((event) => event.worldId)).size,
    timelineCount: new Set(events.map((event) => event.timelineId)).size,
  };
}
