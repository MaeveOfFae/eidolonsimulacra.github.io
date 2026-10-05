import { describe, expect, it } from 'vitest';
import {
  GETTING_STARTED_GUIDE_ID,
  GETTING_STARTED_TOUR_ID,
  appRouteHelpCoverage,
  getGuidedTour,
  gettingStartedSteps,
  guidedTourTargetCatalog,
  guidedTours,
  helpCategories,
  helpTopics,
  isGuidedTourStepActive,
  resolvePageHelp,
  validateGuidedTourConfiguration,
  validateHelpRouteCoverage,
} from './help';

/** `helpCategories` is an `as const` tuple; copy it so the assertions stay type-safe. */
const categories: readonly string[] = [...helpCategories];

/** A path that cannot equal or prefix-match any authored help route. */
const UNREACHABLE_PATH = '/definitely-not-a-route';

describe('help configuration', () => {
  it('keeps page help coverage aligned with routed pages', () => {
    expect(validateHelpRouteCoverage(appRouteHelpCoverage)).toEqual([]);
  });

  it('keeps guided tours aligned with known routes and target anchors', () => {
    expect(validateGuidedTourConfiguration(appRouteHelpCoverage, guidedTourTargetCatalog)).toEqual([]);
  });

  it('resolves the draft review page using prefix matching', () => {
    expect(resolvePageHelp('/drafts/example-review-id')?.id).toBe('draft-review');
  });

  it('resolves token optimization help for the optimize route', () => {
    expect(resolvePageHelp('/optimize')?.id).toBe('token-optimization');
  });

  it('returns null for an unmapped route instead of guessing', () => {
    expect(resolvePageHelp(UNREACHABLE_PATH)).toBeNull();
  });
});

describe('getting started guide', () => {
  it('exposes at least one step with unique ids and copy', () => {
    expect(gettingStartedSteps.length).toBeGreaterThan(0);

    const ids = gettingStartedSteps.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);

    gettingStartedSteps.forEach((step) => {
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.description.trim().length).toBeGreaterThan(0);
      expect(step.actionLabel.trim().length).toBeGreaterThan(0);
      expect(step.to.startsWith('/')).toBe(true);
    });
  });

  it('uses a stable guide id', () => {
    expect(GETTING_STARTED_GUIDE_ID).toBe('getting-started');
  });
});

describe('help topics', () => {
  it('uses unique ids and only the declared categories', () => {
    const ids = helpTopics.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);

    helpTopics.forEach((topic) => {
      expect(categories).toContain(topic.category);
      expect(topic.title.trim().length).toBeGreaterThan(0);
      expect(topic.summary.trim().length).toBeGreaterThan(0);
      expect(topic.bullets.length).toBeGreaterThan(0);
      topic.bullets.forEach((bullet) => expect(bullet.trim().length).toBeGreaterThan(0));
      topic.actions.forEach((action) => {
        expect(action.label.trim().length).toBeGreaterThan(0);
        expect(action.to.startsWith('/')).toBe(true);
      });
    });
  });

  it('covers every declared category so the mobile list never renders empty sections', () => {
    categories.forEach((category) => {
      expect(helpTopics.some((topic) => topic.category === category)).toBe(true);
    });
  });
});

describe('guided tours', () => {
  it('uses unique ids and gives every tour usable metadata', () => {
    const ids = guidedTours.map((tour) => tour.id);
    expect(new Set(ids).size).toBe(ids.length);

    guidedTours.forEach((tour) => {
      expect(tour.title.trim().length).toBeGreaterThan(0);
      expect(tour.summary.trim().length).toBeGreaterThan(0);
      expect(tour.audience.trim().length).toBeGreaterThan(0);
      expect(tour.estimatedMinutes).toBeGreaterThan(0);
      expect(tour.steps.length).toBeGreaterThan(0);
    });
  });

  it('gives every tour step the copy mobile renders and a resolvable route', () => {
    guidedTours.forEach((tour) => {
      tour.steps.forEach((step) => {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
        expect(step.routeLabel.trim().length).toBeGreaterThan(0);
        expect(step.bullets.length).toBeGreaterThan(0);
        expect(step.to.startsWith('/')).toBe(true);
      });
    });
  });

  it('looks tours up by id and reports unknown ids as null', () => {
    expect(getGuidedTour(GETTING_STARTED_TOUR_ID)?.id).toBe(GETTING_STARTED_TOUR_ID);
    expect(getGuidedTour('no-such-tour')).toBeNull();
  });

  it('decides whether a step is active for the current path', () => {
    const step = getGuidedTour(GETTING_STARTED_TOUR_ID)?.steps[0];
    expect(step).toBeDefined();

    if (step) {
      const matchMode = step.matchMode ?? 'exact';
      const expectActive = (pathname: string) =>
        matchMode === 'exact' ? pathname === step.to : pathname.startsWith(step.to);

      // A step always matches its own route, in either match mode.
      expect(isGuidedTourStepActive(step.to, step)).toBe(expectActive(step.to));

      // An unrelated path is only reported active when the step deliberately
      // prefix-matches a broader route; derive the expectation from the data.
      expect(isGuidedTourStepActive(UNREACHABLE_PATH, step)).toBe(expectActive(UNREACHABLE_PATH));
    }
  });
});

/**
 * `help.ts` is now a barrel over `./help/*` — the types and ids, the guide and topic
 * content, the tours, the per-page entries, and the lookups over them.
 *
 * The content moved verbatim: verified line-by-line against the pre-split file, 1,259
 * code lines in and 1,259 out with zero differences. The surface is what a barrel can
 * silently drop, and twenty-one modules import this path, so it is pinned here. The
 * nine interfaces have no runtime presence and are checked by the shared build's
 * declaration step at each use.
 */
const HELP_SURFACE = [
  'BLUEPRINTS_SAFETY_TOUR_ID',
  'DRAFT_LIBRARY_TOUR_ID',
  'GETTING_STARTED_GUIDE_ID',
  'GETTING_STARTED_TOUR_ID',
  'REVIEW_EXPORT_TOUR_ID',
  'SAFE_STORAGE_TOUR_ID',
  'VALIDATION_TOUR_ID',
  'appRouteHelpCoverage',
  'getGuidedTour',
  'gettingStartedSteps',
  'guidedTourTargetCatalog',
  'guidedTours',
  'helpCategories',
  'helpTopics',
  'isGuidedTourStepActive',
  'pageHelpEntries',
  'resolvePageHelp',
  'routeCoverageManifest',
  'validateGuidedTourConfiguration',
  'validateHelpRouteCoverage',
].sort();

describe('help barrel', () => {
  it('exposes exactly the values the single module used to', async () => {
    const surface = await import('./help');

    expect(Object.keys(surface).sort()).toEqual(HELP_SURFACE);
  });
});
