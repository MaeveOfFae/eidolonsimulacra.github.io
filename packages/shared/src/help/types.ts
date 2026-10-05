/**
 * The vocabulary of the help system: the tour and guide ids, and the record shapes the content and the lookups use.
 *
 * Split out of `help.ts`, which is now a barrel over these modules.
 */

export const GETTING_STARTED_GUIDE_ID = 'getting-started';
export const GETTING_STARTED_TOUR_ID = 'getting-started';
export const SAFE_STORAGE_TOUR_ID = 'protect-your-work';
export const REVIEW_EXPORT_TOUR_ID = 'review-and-export';
export const DRAFT_LIBRARY_TOUR_ID = 'draft-library';
export const VALIDATION_TOUR_ID = 'validation-workflow';
export const BLUEPRINTS_SAFETY_TOUR_ID = 'blueprints-safety';

export interface HelpActionLink {
  label: string;
  to: string;
}

export interface HelpGuideStep {
  id: string;
  title: string;
  description: string;
  to: string;
  actionLabel: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  category: 'Getting Started' | 'Concepts' | 'Troubleshooting';
  summary: string;
  bullets: string[];
  actions: HelpActionLink[];
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  to: string;
  routeLabel: string;
  bullets: string[];
  matchMode?: 'exact' | 'prefix';
  targetId?: string;
  targetLabel?: string;
}

export interface GuidedTour {
  id: string;
  title: string;
  summary: string;
  audience: string;
  estimatedMinutes: number;
  steps: GuidedTourStep[];
}

export interface PageHelpEntry {
  id: string;
  match: string;
  matchMode: 'exact' | 'prefix';
  title: string;
  summary: string;
  keyActions: string[];
  pitfalls: string[];
  actions: HelpActionLink[];
  relatedTopicIds: string[];
}

export interface RouteCoverageManifestEntry {
  route: string;
  pageHelpId: string;
  coverage: 'complete';
}

export interface AppRouteHelpCoverageEntry {
  path: string;
  pageHelpId: string;
}

export interface GuidedTourTargetCatalogEntry {
  id: string;
  route: string;
}
