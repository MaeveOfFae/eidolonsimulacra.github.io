import { describe, expect, it } from 'vitest';
import { buildEventCalendar, parseEventDate } from './event-calendar';
import type { WorldTimelineEventRecord } from './types';

function event(overrides: Partial<WorldTimelineEventRecord> = {}): WorldTimelineEventRecord {
  return {
    id: 'e1',
    timelineId: 't1',
    title: 'An event',
    sortOrder: 0,
    tags: [],
    metadata: {},
    createdAt: '',
    updatedAt: '',
    worldId: 'w1',
    worldName: 'Ashfall',
    timelineName: 'Main',
    ...overrides,
  };
}

describe('parseEventDate', () => {
  it('treats YYYY, YYYY-MM and YYYY-MM-DD as real-world dates', () => {
    expect(parseEventDate('2026')).toEqual({ kind: 'dated', value: '2026', iso: '2026-01-01' });
    expect(parseEventDate('2026-03')).toEqual({ kind: 'dated', value: '2026-03', iso: '2026-03-01' });
    expect(parseEventDate('2026-03-14')).toEqual({ kind: 'dated', value: '2026-03-14', iso: '2026-03-14' });
    expect(parseEventDate(' 2026-3-4 ')).toEqual({ kind: 'dated', value: '2026-3-4', iso: '2026-03-04' });
  });

  it('treats everything else as an in-world label', () => {
    expect(parseEventDate('1204 AF')).toEqual({ kind: 'labelled', value: '1204 AF' });
    expect(parseEventDate('the  Long Winter')).toEqual({ kind: 'labelled', value: 'the Long Winter' });
  });

  it('returns null for a missing or non-string date', () => {
    expect(parseEventDate(undefined)).toBeNull();
    expect(parseEventDate('   ')).toBeNull();
    expect(parseEventDate(42)).toBeNull();
  });
});

describe('buildEventCalendar', () => {
  it('orders dated groups first, then in-world labels, then undated', () => {
    const calendar = buildEventCalendar([
      event({ id: 'a', eventDate: '2026-03-14', title: 'Later' }),
      event({ id: 'b', eventDate: '2024-01', title: 'Earlier' }),
      event({ id: 'c', eventDate: '1204 AF', title: 'Ashfall founded', sortOrder: 2 }),
      event({ id: 'd', eventDate: '900 AF', title: 'The First Silence', sortOrder: 1 }),
      event({ id: 'e', title: 'Floating rumour' }),
    ]);

    expect(calendar.groups.map((group) => [group.kind, group.label])).toEqual([
      ['dated', '2024-01'],
      ['dated', '2026-03-14'],
      ['labelled', '900 AF'],
      ['labelled', '1204 AF'],
      ['undated', 'Undated'],
    ]);
  });

  it('orders the events inside a group by their recorded sort order', () => {
    const calendar = buildEventCalendar([
      event({ id: 'a', eventDate: '2026-03-14', title: 'Second', sortOrder: 2 }),
      event({ id: 'b', eventDate: '2026-03-14', title: 'First', sortOrder: 1 }),
    ]);

    expect(calendar.groups).toHaveLength(1);
    expect(calendar.groups[0].isoDate).toBe('2026-03-14');
    expect(calendar.groups[0].events.map((entry) => entry.title)).toEqual(['First', 'Second']);
  });

  it('counts the events, worlds, and timelines it covers', () => {
    const calendar = buildEventCalendar([
      event({ id: 'a', worldId: 'w1', timelineId: 't1', eventDate: '2026' }),
      event({ id: 'b', worldId: 'w2', timelineId: 't2', eventDate: '2027' }),
      event({ id: 'c', worldId: 'w1', timelineId: 't1' }),
    ]);

    expect(calendar.eventCount).toBe(3);
    expect(calendar.worldCount).toBe(2);
    expect(calendar.timelineCount).toBe(2);
  });

  it('returns an empty calendar when there are no events', () => {
    expect(buildEventCalendar([])).toEqual({
      groups: [],
      eventCount: 0,
      worldCount: 0,
      timelineCount: 0,
    });
  });
});
