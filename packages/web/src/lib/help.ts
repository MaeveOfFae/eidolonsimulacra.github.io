/**
 * Re-export shim over `@char-gen/shared`'s help module.
 *
 * The guide/topic/tour data and the coverage validators now live in shared so
 * the mobile Help Center renders the same source instead of forking it. Only
 * the React overlay components (`GuidedTourOverlay`, `ContextualHelpPanel`,
 * …) stay web-specific.
 */

export {
  BLUEPRINTS_SAFETY_TOUR_ID,
  DRAFT_LIBRARY_TOUR_ID,
  GETTING_STARTED_GUIDE_ID,
  GETTING_STARTED_TOUR_ID,
  REVIEW_EXPORT_TOUR_ID,
  SAFE_STORAGE_TOUR_ID,
  VALIDATION_TOUR_ID,
  appRouteHelpCoverage,
  getGuidedTour,
  gettingStartedSteps,
  guidedTourTargetCatalog,
  guidedTours,
  helpCategories,
  helpTopics,
  isGuidedTourStepActive,
  pageHelpEntries,
  resolvePageHelp,
  routeCoverageManifest,
  validateGuidedTourConfiguration,
  validateHelpRouteCoverage,
} from '@char-gen/shared';

export type {
  AppRouteHelpCoverageEntry,
  GuidedTour,
  GuidedTourStep,
  GuidedTourTargetCatalogEntry,
  HelpActionLink,
  HelpGuideStep,
  HelpTopic,
  PageHelpEntry,
  RouteCoverageManifestEntry,
} from '@char-gen/shared';
