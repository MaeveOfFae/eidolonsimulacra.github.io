/**
 * The lookups and validators over the content: page help for a path, a tour by id, whether a step is active, and the coverage and configuration checks.
 *
 * Split out of `help.ts`, which is now a barrel over these modules.
 */
import type {
  AppRouteHelpCoverageEntry,
  GuidedTour,
  GuidedTourStep,
  GuidedTourTargetCatalogEntry,
  PageHelpEntry,
} from './types.js';
import { guidedTours } from './tours.js';
import { pageHelpEntries } from './pages.js';

export function normalizeRoutePattern(path: string): string {
  const withoutWildcard = path.replace(/\*$/, '');
  const withoutParams = withoutWildcard.replace(/:[^/]+/g, '');
  return withoutParams.endsWith('/') || withoutParams === '/' ? withoutParams : `${withoutParams}`;
}

export function routeSupportsPath(routePath: string, stepPath: string, matchMode: 'exact' | 'prefix'): boolean {
  const normalizedRoute = normalizeRoutePattern(routePath);

  if (matchMode === 'exact') {
    return routePath === stepPath || normalizedRoute === stepPath;
  }

  return stepPath.startsWith(normalizedRoute) || normalizedRoute.startsWith(stepPath);
}

export function resolvePageHelp(pathname: string): PageHelpEntry | null {
  const matches = pageHelpEntries.filter((entry) =>
    entry.matchMode === 'exact' ? pathname === entry.match : pathname.startsWith(entry.match),
  );

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((left, right) => right.match.length - left.match.length)[0] ?? null;
}

export function getGuidedTour(tourId: string): GuidedTour | null {
  return guidedTours.find((tour) => tour.id === tourId) ?? null;
}

export function isGuidedTourStepActive(pathname: string, step: GuidedTourStep): boolean {
  const matchMode = step.matchMode ?? 'exact';
  return matchMode === 'exact' ? pathname === step.to : pathname.startsWith(step.to);
}

export function validateHelpRouteCoverage(routeEntries: readonly AppRouteHelpCoverageEntry[]): string[] {
  const pageHelpIds = new Set(pageHelpEntries.map((entry) => entry.id));
  const seenRoutes = new Set<string>();
  const issues: string[] = [];

  for (const entry of routeEntries) {
    if (seenRoutes.has(entry.path)) {
      issues.push(`Duplicate help coverage route: ${entry.path}`);
      continue;
    }

    seenRoutes.add(entry.path);

    if (!pageHelpIds.has(entry.pageHelpId)) {
      issues.push(`Missing page help entry for route ${entry.path}: ${entry.pageHelpId}`);
    }
  }

  for (const pageHelpEntry of pageHelpEntries) {
    const routeExists = routeEntries.some((entry) => entry.pageHelpId === pageHelpEntry.id);
    if (!routeExists) {
      issues.push(`Page help entry is not mapped to an app route: ${pageHelpEntry.id}`);
    }
  }

  return issues;
}

export function validateGuidedTourConfiguration(
  routeEntries: readonly AppRouteHelpCoverageEntry[],
  targetEntries: readonly GuidedTourTargetCatalogEntry[],
): string[] {
  const targetCatalog = new Map(targetEntries.map((entry) => [entry.id, entry.route]));
  const issues: string[] = [];

  for (const tour of guidedTours) {
    for (const step of tour.steps) {
      const matchMode = step.matchMode ?? 'exact';
      const routeExists = routeEntries.some((entry) => routeSupportsPath(entry.path, step.to, matchMode));

      if (!routeExists) {
        issues.push(`Guided tour step points to an unmapped route: ${tour.id}/${step.id} -> ${step.to}`);
      }

      if (!step.targetId) {
        continue;
      }

      const targetRoute = targetCatalog.get(step.targetId);
      if (!targetRoute) {
        issues.push(`Guided tour step references an unknown target anchor: ${tour.id}/${step.id} -> ${step.targetId}`);
        continue;
      }

      if (!routeSupportsPath(targetRoute, step.to, matchMode)) {
        issues.push(
          `Guided tour step target route mismatch: ${tour.id}/${step.id} -> ${step.targetId} is cataloged for ${targetRoute}, step route is ${step.to}`,
        );
      }
    }
  }

  return issues;
}
