/**
 * Mobile Help Center presentation logic.
 *
 * Pure so it can be unit-tested in the node Vitest environment: the guide,
 * topic, and tour content comes from `@char-gen/shared`, and the navigation and
 * persistence calls stay in the screen.
 */

import {
  guidedTours,
  gettingStartedSteps,
  helpCategories,
  helpTopics,
  type GuidedTour,
  type GuidedTourStep,
  type HelpGuideStep,
  type HelpTopic,
} from '@char-gen/shared';
import { mapWebRouteToMobileDestination, type MobileDestination } from './route-targets';

export interface HelpTopicGroup {
  category: HelpTopic['category'];
  topics: HelpTopic[];
}

/**
 * Groups topics under the authored category order. Empty categories are kept
 * out so the screen never renders a heading with nothing under it.
 */
export function groupHelpTopicsByCategory(topics: readonly HelpTopic[] = helpTopics): HelpTopicGroup[] {
  return helpCategories
    .map((category) => ({
      category,
      topics: topics.filter((topic) => topic.category === category),
    }))
    .filter((group) => group.topics.length > 0);
}

/** Resolves a shared help/guide link target, or null when mobile cannot reach it. */
export function mapHelpTarget(to: string): MobileDestination | null {
  return mapWebRouteToMobileDestination(to);
}

export function isTourCompleted(tourId: string, completedTourIds: readonly string[] = []): boolean {
  return completedTourIds.includes(tourId);
}

/** `6 min • 5 steps` — the metadata line shared by the tour list and the runner. */
export function buildTourMetaLabel(tour: GuidedTour): string {
  const minutes = `${tour.estimatedMinutes} min`;
  const stepCount = tour.steps.length;
  return `${minutes} • ${stepCount} ${stepCount === 1 ? 'step' : 'steps'}`;
}

/** `3 of 6 tours completed` — the Home quick-link preview, mirroring `buildWhatsNewPreview`. */
export function buildHelpCenterSummary(completedTourIds: readonly string[] = []): string {
  const completed = guidedTours.filter((tour) => isTourCompleted(tour.id, completedTourIds)).length;
  return `${completed} of ${guidedTours.length} tours completed`;
}

export function getNextIncompleteTour(completedTourIds: readonly string[] = []): GuidedTour | null {
  return guidedTours.find((tour) => !isTourCompleted(tour.id, completedTourIds)) ?? null;
}

/** The step a runner should open on: the first one, clamped into range. */
export function clampTourStepIndex(index: number, tour: GuidedTour): number {
  if (tour.steps.length === 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), tour.steps.length - 1);
}

/**
 * Advances the runner. `null` means the walkthrough is on its last step, so the
 * caller offers "Mark tour complete" instead of "Next".
 */
export function getNextTourStepIndex(index: number, tour: GuidedTour): number | null {
  const next = index + 1;
  return next >= tour.steps.length ? null : next;
}

export function getPreviousTourStepIndex(index: number): number | null {
  const previous = index - 1;
  return previous < 0 ? null : previous;
}

/** `Step 2 of 5` — the runner progress label. */
export function buildTourStepLabel(index: number, tour: GuidedTour): string {
  return `Step ${clampTourStepIndex(index, tour) + 1} of ${tour.steps.length}`;
}

/** `3. Review the draft — Drafts` — one line of the tour's step list. */
export function buildTourStepPreview(index: number, step: GuidedTourStep): string {
  return `${index + 1}. ${step.title} — ${step.routeLabel}`;
}

/** Adds a tour to the completed set without duplicating an existing entry. */
export function addCompletedTour(completedTourIds: readonly string[] = [], tourId: string): string[] {
  return Array.from(new Set([...completedTourIds, tourId]));
}

/** The shared getting-started steps, with any link targets mobile cannot reach resolved to null. */
export function buildMobileGettingStartedSteps(
  steps: readonly HelpGuideStep[] = gettingStartedSteps,
): { step: HelpGuideStep; destination: MobileDestination | null }[] {
  return steps.map((step) => ({ step, destination: mapHelpTarget(step.to) }));
}
