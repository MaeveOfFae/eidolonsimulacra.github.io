import { describe, expect, it } from 'vitest';
import {
  GETTING_STARTED_TOUR_ID,
  gettingStartedSteps,
  guidedTours,
  helpCategories,
  helpTopics,
  type GuidedTour,
} from '@char-gen/shared';
import {
  addCompletedTour,
  buildHelpCenterSummary,
  buildMobileGettingStartedSteps,
  buildTourMetaLabel,
  buildTourStepLabel,
  buildTourStepPreview,
  clampTourStepIndex,
  getNextIncompleteTour,
  getNextTourStepIndex,
  getPreviousTourStepIndex,
  groupHelpTopicsByCategory,
  isTourCompleted,
  mapHelpTarget,
} from './help';

function buildTour(overrides: Partial<GuidedTour> = {}): GuidedTour {
  return {
    id: 'sample-tour',
    title: 'Sample tour',
    summary: 'Walks through something.',
    audience: 'Anyone',
    estimatedMinutes: 3,
    steps: [
      { id: 'one', title: 'First', description: 'First step', to: '/generate', routeLabel: 'Generate', bullets: ['a'] },
      { id: 'two', title: 'Second', description: 'Second step', to: '/drafts', routeLabel: 'Drafts', bullets: ['b'] },
    ],
    ...overrides,
  };
}

describe('groupHelpTopicsByCategory', () => {
  it('groups the shared topics in the authored category order', () => {
    const groups = groupHelpTopicsByCategory();

    expect(groups.map((group) => group.category)).toEqual([...helpCategories]);

    const groupedTopicCount = groups.reduce((total, group) => total + group.topics.length, 0);
    expect(groupedTopicCount).toBe(helpTopics.length);
    groups.forEach((group) => {
      expect(group.topics.length).toBeGreaterThan(0);
      group.topics.forEach((topic) => expect(topic.category).toBe(group.category));
    });
  });

  it('drops categories with no topics instead of rendering empty headings', () => {
    const groups = groupHelpTopicsByCategory([helpTopics[0]!]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.topics).toEqual([helpTopics[0]]);
  });
});

describe('mapHelpTarget', () => {
  it('resolves the shared help targets mobile can open', () => {
    expect(mapHelpTarget('/generate')).toBe('Generate');
    expect(mapHelpTarget('/settings')).toBe('Settings');
    expect(mapHelpTarget('/drafts')).toBe('Drafts');
    expect(mapHelpTarget('/about')).toBe('About');
    expect(mapHelpTarget('/privacy')).toBe('Privacy');
    expect(mapHelpTarget('/code-of-conduct')).toBe('CodeOfConduct');
  });

  it('leaves targets with no mobile destination unmapped so the screen renders them inert', () => {
    // `/data` is the browser Data Manager; mobile ships no equivalent screen.
    expect(mapHelpTarget('/data')).toBeNull();
    expect(mapHelpTarget('https://example.com')).toBeNull();
  });
});

describe('tour state helpers', () => {
  it('reports completion against the stored tour ids', () => {
    expect(isTourCompleted('sample-tour', ['sample-tour'])).toBe(true);
    expect(isTourCompleted('sample-tour', [])).toBe(false);
    expect(isTourCompleted('sample-tour')).toBe(false);
  });

  it('adds a completed tour once even if it is marked twice', () => {
    const completed = addCompletedTour(['sample-tour'], 'sample-tour');
    expect(completed).toEqual(['sample-tour']);

    const withSecond = addCompletedTour(completed, 'other-tour');
    expect(withSecond).toEqual(['sample-tour', 'other-tour']);
  });

  it('finds the next incomplete tour from the shared set', () => {
    const allButLast = guidedTours.slice(0, -1).map((tour) => tour.id);
    expect(getNextIncompleteTour(allButLast)?.id).toBe(guidedTours[guidedTours.length - 1]?.id);

    const all = guidedTours.map((tour) => tour.id);
    expect(getNextIncompleteTour(all)).toBeNull();
  });

  it('builds the tour metadata line and handles the single-step case', () => {
    expect(buildTourMetaLabel(buildTour())).toBe('3 min • 2 steps');
    expect(buildTourMetaLabel(buildTour({ estimatedMinutes: 1, steps: [buildTour().steps[0]!] }))).toBe(
      '1 min • 1 step',
    );
  });

  describe('tour runner stepping', () => {
    it('clamps an out-of-range step index into the tour', () => {
      const tour = buildTour();

      expect(clampTourStepIndex(-4, tour)).toBe(0);
      expect(clampTourStepIndex(9, tour)).toBe(tour.steps.length - 1);
      expect(clampTourStepIndex(0, buildTour({ steps: [] }))).toBe(0);
    });

    it('advances until the last step and then reports the tour is finished', () => {
      const tour = buildTour();

      expect(getNextTourStepIndex(0, tour)).toBe(1);
      expect(getNextTourStepIndex(1, tour)).toBeNull();
    });

    it('reports when there is no earlier step to go back to', () => {
      expect(getPreviousTourStepIndex(1)).toBe(0);
      expect(getPreviousTourStepIndex(0)).toBeNull();
    });

    it('labels the current position and never exceeds the final step', () => {
      const tour = buildTour();

      expect(buildTourStepLabel(0, tour)).toBe('Step 1 of 2');
      expect(buildTourStepLabel(1, tour)).toBe('Step 2 of 2');
      expect(buildTourStepLabel(7, tour)).toBe('Step 2 of 2');
    });

    it('numbers the tour step list lines', () => {
      const tour = buildTour();

      expect(buildTourStepPreview(0, tour.steps[0]!)).toBe('1. First — Generate');
      expect(buildTourStepPreview(1, tour.steps[1]!)).toBe('2. Second — Drafts');
    });
  });

  describe('shared getting-started guide on mobile', () => {
    it('renders every shared step with its resolved destination', () => {
      const steps = buildMobileGettingStartedSteps();

      expect(steps).toHaveLength(gettingStartedSteps.length);
      steps.forEach(({ step, destination }) => {
        expect(step.title.length).toBeGreaterThan(0);
        if (destination === null) {
          // `/data` is the only starter-guide target mobile cannot open today
          // (the browser Data Manager has no mobile counterpart).
          expect(step.to).toBe('/data');
        }
      });
    });

    it('resolves the destinations mobile actually ships', () => {
      const destinations = buildMobileGettingStartedSteps().map((entry) => entry.destination);

      expect(destinations).toContain('Generate');
      expect(destinations).toContain('Settings');
      expect(destinations).toContain('Templates');
      expect(destinations).toContain('Drafts');
    });

    it('keeps the tour identifier in sync with the shared data', () => {
      expect(guidedTours.some((tour) => tour.id === GETTING_STARTED_TOUR_ID)).toBe(true);
    });
  });

  it('summarises progress across the shared tour set', () => {
    expect(buildHelpCenterSummary([])).toBe(`0 of ${guidedTours.length} tours completed`);

    const everyTour = guidedTours.map((tour) => tour.id);
    expect(buildHelpCenterSummary(everyTour)).toBe(`${guidedTours.length} of ${guidedTours.length} tours completed`);
  });
});
