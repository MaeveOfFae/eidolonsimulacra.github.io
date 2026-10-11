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
  pageHelpEntries,
  type GuidedTour,
  type GuidedTourStep,
  type HelpGuideStep,
  type HelpTopic,
  type PageHelpEntry,
} from '@char-gen/shared';
import { mapWebRouteToMobileDestination, type MobileDestination } from './route-targets';
import type { DraftsStackParamList, HomeStackParamList, RootTabParamList } from '../types/navigation';

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

/**
 * Every screen the app can show, from the navigators' own param lists.
 *
 * Typed from `types/navigation` rather than hand-listed: a screen added to either
 * navigator joins this union, so `mobileScreenHelpIds` below stops type-checking until
 * someone decides what help it gets. That decision is the point — the alternative is a
 * new screen that silently offers no help at all.
 */
export type MobileHelpScreen = keyof RootTabParamList | keyof HomeStackParamList | keyof DraftsStackParamList;

/**
 * Which shared page-help entry describes each screen.
 *
 * The web app resolves this by route, and those entries are keyed by browser path
 * (`/generate`, `/drafts/:id`). Mobile's screens are not those routes, so the mapping is
 * explicit rather than derived from a prefix rule — and `null` is a real answer: three
 * screens have no honest counterpart (the chat, the lorebook packet generator and the
 * download page are mobile-only or describe themselves), and pointing them at another
 * screen's entry would be worse than saying nothing.
 */
export const mobileScreenHelpIds: Record<MobileHelpScreen, string | null> = {
  // Tabs. A tab and its stack's root screen are the same surface to the user, so they
  // share an entry rather than each getting their own wording of it.
  Home: 'home',
  HomeRoot: 'home',
  Generate: 'generate',
  Drafts: 'drafts',
  DraftsList: 'drafts',
  DraftDetail: 'draft-review',
  Templates: 'templates',
  Settings: 'settings',
  // Home stack.
  SeedGenerator: 'seed-generator',
  LorebookGenerator: null,
  WhatsNew: 'whats-new',
  HelpCenter: 'help-center',
  About: 'about',
  Download: null,
  Community: 'community',
  License: 'license',
  Terms: 'terms',
  Privacy: 'privacy',
  Security: 'security',
  CodeOfConduct: 'code-of-conduct',
  ThemePicker: 'themes',
  Validation: 'validation',
  TokenOptimization: 'token-optimization',
  Lineage: 'lineage',
  Blueprints: 'blueprints',
  BlueprintEditor: 'blueprint-editor',
  BatchGenerate: 'batch',
  Compare: 'similarity',
  Offspring: 'offspring',
  // Drafts stack.
  Chat: null,
};

/**
 * The screens that deliberately have no page help.
 *
 * Exported so the choice is visible and testable: a screen joining this list is a
 * decision someone made, not a mapping somebody forgot.
 */
export function listScreensWithoutHelp(
  ids: Readonly<Record<MobileHelpScreen, string | null>> = mobileScreenHelpIds,
): MobileHelpScreen[] {
  return (Object.keys(ids) as MobileHelpScreen[]).filter((screen) => ids[screen] === null);
}

/**
 * The page help for a screen, or null when there is none.
 *
 * Returns null rather than throwing for an unmapped id: `pageHelpEntries` is shared
 * data that can legitimately lose an entry, and a missing help entry must not be able
 * to crash a screen whose only mistake was asking for help.
 */
export function resolveMobileScreenHelp(
  screen: MobileHelpScreen,
  entries: readonly PageHelpEntry[] = pageHelpEntries,
): PageHelpEntry | null {
  const id = mobileScreenHelpIds[screen];
  if (!id) {
    return null;
  }

  return entries.find((entry) => entry.id === id) ?? null;
}

/** Every screen that has help, in the union's own order, for the Help Center index. */
export function listScreensWithHelp(
  ids: Readonly<Record<MobileHelpScreen, string | null>> = mobileScreenHelpIds,
): MobileHelpScreen[] {
  return (Object.keys(ids) as MobileHelpScreen[]).filter((screen) => ids[screen] !== null);
}

/**
 * The screen name to print for an entry.
 *
 * The authored titles end in "help" (`Generate help`, `Draft review help`) because that
 * is what the web drawer's heading wants. An index of screens wants the screen name, so
 * the suffix is stripped here rather than every screen name being authored a second time
 * in mobile — where it would drift the first time a title was reworded.
 */
export function buildHelpEntryLabel(entry: Pick<PageHelpEntry, 'title'>): string {
  return entry.title.replace(/\s+help$/i, '').trim();
}

/** One row of the Help Center's screen index. */
export interface MobileHelpIndexRow {
  screen: MobileHelpScreen;
  label: string;
  summary: string;
  entry: PageHelpEntry;
}

/**
 * Every screen that has page help, as the Help Center's index.
 *
 * A tab and its stack root resolve to the same entry (`Home` and `HomeRoot`), so rows
 * are de-duplicated by entry id: this is a list of screens, and showing one screen twice
 * because it has two navigation names would be a visible bug.
 */
export function buildMobileHelpIndex(entries: readonly PageHelpEntry[] = pageHelpEntries): MobileHelpIndexRow[] {
  const rows: MobileHelpIndexRow[] = [];
  const seenEntryIds = new Set<string>();

  for (const screen of listScreensWithHelp()) {
    const entry = resolveMobileScreenHelp(screen, entries);
    if (!entry || seenEntryIds.has(entry.id)) {
      continue;
    }

    seenEntryIds.add(entry.id);
    rows.push({ screen, label: buildHelpEntryLabel(entry), summary: entry.summary, entry });
  }

  return rows;
}
