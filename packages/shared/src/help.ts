/**
 * Help content and the lookups over it: the getting-started guide, the topics, the
 * guided tours, the per-page entries and the route-coverage manifests.
 *
 * This module is now a barrel: the content lives in `./help/`, split into the types,
 * the guide and topic content, the tours, the per-page entries, and the lookups and
 * validators. The export list is pinned by `help.test.ts`, because twenty-one modules
 * import this path through the package root.
 */
export {
  GETTING_STARTED_GUIDE_ID,
  GETTING_STARTED_TOUR_ID,
  SAFE_STORAGE_TOUR_ID,
  REVIEW_EXPORT_TOUR_ID,
  DRAFT_LIBRARY_TOUR_ID,
  VALIDATION_TOUR_ID,
  BLUEPRINTS_SAFETY_TOUR_ID,
} from './help/types.js';
export type {
  HelpActionLink,
  HelpGuideStep,
  HelpTopic,
  GuidedTourStep,
  GuidedTour,
  PageHelpEntry,
  RouteCoverageManifestEntry,
  AppRouteHelpCoverageEntry,
  GuidedTourTargetCatalogEntry,
} from './help/types.js';

export { gettingStartedSteps, helpTopics, helpCategories } from './help/guides.js';

export { guidedTours } from './help/tours.js';

export { pageHelpEntries, routeCoverageManifest, appRouteHelpCoverage, guidedTourTargetCatalog } from './help/pages.js';

export {
  resolvePageHelp,
  getGuidedTour,
  isGuidedTourStepActive,
  validateHelpRouteCoverage,
  validateGuidedTourConfiguration,
} from './help/lookup.js';
