import type { DraftMetadata } from '@char-gen/shared';
import {
  buildQuickActionsSections,
  buildRecentDraftActions,
  clampActiveIndex,
  DEFAULT_SCREEN_LIMIT,
  draftAction,
  flattenQuickActions,
  moveActiveIndex,
  quickActionsShortcutLabel,
  RECENT_DRAFT_LIMIT,
  routeAction,
  sortDraftsByRecency,
} from './quick-actions';
import { routeCatalog } from './route-catalog';

function draft(overrides: Partial<DraftMetadata> & { review_id: string }): DraftMetadata {
  return { seed: '', favorite: false, ...overrides };
}

const DRAFTS: DraftMetadata[] = [
  draft({ review_id: 'old', seed: 'old seed', modified: '2024-01-01T00:00:00.000Z', character_name: 'Old' }),
  draft({ review_id: 'newest', seed: 'newest seed', modified: '2024-06-01T00:00:00.000Z', character_name: 'Newest' }),
  draft({
    review_id: 'middle',
    seed: 'middle seed',
    created: '2024-03-01T00:00:00.000Z',
    character_name: 'Middle',
  }),
  draft({ review_id: 'undated', seed: 'undated seed', character_name: 'Undated' }),
];

describe('quick-action construction', () => {
  it('builds a route action from a catalog entry', () => {
    const entry = routeCatalog.find((candidate) => candidate.path === '/data')!;

    expect(routeAction(entry)).toEqual({
      id: 'route:/data',
      label: 'Data Manager',
      description: entry.description,
      icon: entry.icon,
      to: '/data',
      kind: 'route',
    });
  });

  it('prefers the character name, falls back to the seed, then to a placeholder', () => {
    expect(draftAction(draft({ review_id: 'a', seed: 'seed', character_name: '  Iris  ' })).label).toBe('Iris');
    expect(draftAction(draft({ review_id: 'b', seed: 'fallback seed' })).label).toBe('fallback seed');
    expect(draftAction(draft({ review_id: 'c' })).label).toBe('Untitled draft');
  });

  it('escapes the draft id in the link target', () => {
    expect(draftAction(draft({ review_id: 'review 1/2' })).to).toBe('/drafts/review%201%2F2');
  });

  it('keeps the seed searchable through the description', () => {
    expect(draftAction(draft({ review_id: 'a', seed: 'a frost giant' })).description).toBe(
      'Open draft · a frost giant',
    );
  });
});

describe('recent draft ordering', () => {
  it('sorts by modified time, falling back to created', () => {
    expect(sortDraftsByRecency(DRAFTS).map((entry) => entry.review_id)).toEqual(['newest', 'middle', 'old', 'undated']);
  });

  it('does not mutate the input list', () => {
    const original = [...DRAFTS];
    sortDraftsByRecency(DRAFTS);

    expect(DRAFTS).toEqual(original);
  });

  it('caps the list at the recent limit by default', () => {
    expect(buildRecentDraftActions(DRAFTS)).toHaveLength(RECENT_DRAFT_LIMIT);
    expect(buildRecentDraftActions(DRAFTS, { limit: 2 }).map((action) => action.id)).toEqual([
      'draft:newest',
      'draft:middle',
    ]);
  });
});

describe('recent draft search', () => {
  it('matches the character name, the seed, or the template name', () => {
    const withTemplate = [
      draft({ review_id: 't', seed: 'zzz', character_name: 'Nobody', template_name: 'Expanded V3' }),
      draft({ review_id: 'u', seed: 'a specific premise', character_name: 'Someone' }),
    ];

    expect(buildRecentDraftActions(withTemplate, { query: 'expanded' }).map((a) => a.id)).toEqual(['draft:t']);
    expect(buildRecentDraftActions(withTemplate, { query: 'SPECIFIC' }).map((a) => a.id)).toEqual(['draft:u']);
    expect(buildRecentDraftActions(withTemplate, { query: 'someone' }).map((a) => a.id)).toEqual(['draft:u']);
    expect(buildRecentDraftActions(withTemplate, { query: 'nomatch' })).toEqual([]);
  });

  it('returns the plain recency list for an empty query', () => {
    expect(buildRecentDraftActions(DRAFTS, { query: '   ' }).map((action) => action.id)).toEqual([
      'draft:newest',
      'draft:middle',
      'draft:old',
      'draft:undated',
    ]);
  });
});

describe('palette sections', () => {
  it('lists screens then recent drafts for an empty query', () => {
    const sections = buildQuickActionsSections({ query: '', drafts: DRAFTS });

    expect(sections.map((section) => section.id)).toEqual(['screens', 'recent-drafts']);
    expect(sections[0].actions).toHaveLength(DEFAULT_SCREEN_LIMIT);
    expect(sections[0].actions[0].to).toBe('/');
  });

  it('drops a section that the query cannot reach', () => {
    const sections = buildQuickActionsSections({ query: 'backup', drafts: DRAFTS });

    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('screens');
    expect(sections[0].actions[0].to).toBe('/data');
  });

  it('drops the screens section when only a draft matches', () => {
    const sections = buildQuickActionsSections({ query: 'newest seed', drafts: DRAFTS });

    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('recent-drafts');
    expect(sections[0].actions[0].id).toBe('draft:newest');
  });

  it('honours the screen limit', () => {
    const sections = buildQuickActionsSections({ query: '', drafts: [], screenLimit: 3 });

    expect(sections).toHaveLength(1);
    expect(sections[0].actions.map((action) => action.to)).toEqual(['/', '/generate', '/compare']);
  });

  it('flattens in render order for keyboard navigation', () => {
    const sections = buildQuickActionsSections({
      query: 'seed',
      drafts: DRAFTS,
      screenLimit: 1,
      draftLimit: 2,
    });

    expect(flattenQuickActions(sections).map((action) => action.id)).toEqual([
      'route:/seed-generator',
      'draft:newest',
      'draft:middle',
    ]);
  });
});

describe('keyboard index movement', () => {
  it('wraps in both directions', () => {
    expect(moveActiveIndex(0, 1, 3)).toBe(1);
    expect(moveActiveIndex(2, 1, 3)).toBe(0);
    expect(moveActiveIndex(0, -1, 3)).toBe(2);
  });

  it('stays at zero for an empty list', () => {
    expect(moveActiveIndex(0, 1, 0)).toBe(0);
    expect(clampActiveIndex(4, 0)).toBe(0);
  });

  it('clamps the highlight when the list shrinks', () => {
    expect(clampActiveIndex(7, 3)).toBe(2);
    expect(clampActiveIndex(-1, 3)).toBe(0);
    expect(clampActiveIndex(1, 3)).toBe(1);
  });
});

describe('shortcut label', () => {
  it('uses the command glyph on Apple platforms and Ctrl elsewhere', () => {
    expect(quickActionsShortcutLabel('MacIntel')).toBe('⌘K');
    expect(quickActionsShortcutLabel('iPhone')).toBe('⌘K');
    expect(quickActionsShortcutLabel('Win32')).toBe('Ctrl K');
    expect(quickActionsShortcutLabel('')).toBe('Ctrl K');
  });
});
