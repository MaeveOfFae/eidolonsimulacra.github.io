/**
 * Mobile wrapper for the a1111 tag linter.
 *
 * Mobile runs on the **bundled core** Danbooru index (`@char-gen/shared/danbooru-core`
 * subpath — the top ~12k tags, no alias table) because a phone has no static assets to
 * fetch and the core is exactly the offline tier that subpath exists for. Pseudo-tag
 * corrections still work (they live in the overlay, not the alias table); alias →
 * canonical resolution is the web/desktop tier's job.
 *
 * The linter itself is shared (`@char-gen/shared` → `a1111/tag-linter`); this module
 * only owns the mobile index loading, the tray-facing summary, and the fix application,
 * so it stays unit-testable without React Native.
 */
import { applyA1111TagFixes, lintA1111Tags, type A1111LintIssue, type DanbooruTagIndex } from '@char-gen/shared';

let coreIndexPromise: Promise<DanbooruTagIndex> | null = null;

function loadMobileCoreIndex(): Promise<DanbooruTagIndex> {
  coreIndexPromise ??= import('@char-gen/shared/danbooru-core').then((module) => module.loadCoreDanbooruTagIndex());
  return coreIndexPromise;
}

/** Test-only escape hatch for the memoized index load. */
export function resetMobileCoreIndexCache(): void {
  coreIndexPromise = null;
}

export interface A1111LintSummary {
  issues: A1111LintIssue[];
  errorCount: number;
  warningCount: number;
  /** Issues `applyA1111TagFixes` can correct (alias / pseudo-tag / duplicate). */
  fixCount: number;
  headline: string;
}

/** Counts and the one-line tray headline. Pure, so the tray tests need no index. */
export function summarizeA1111LintIssues(issues: A1111LintIssue[]): A1111LintSummary {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.length - errorCount;
  const fixCount = issues.filter(
    (issue) => issue.code === 'alias' || issue.code === 'pseudo-tag' || issue.code === 'duplicate-tag',
  ).length;

  let headline: string;
  if (issues.length === 0) {
    headline = 'Tags pass the Danbooru lint (bundled core index)';
  } else {
    const parts = [
      `${errorCount} error${errorCount === 1 ? '' : 's'}`,
      `${warningCount} warning${warningCount === 1 ? '' : 's'}`,
    ];
    headline = parts.join(' · ');
  }

  return { issues, errorCount, warningCount, fixCount, headline };
}

/** Lint an a1111 asset against the bundled core index. */
export async function lintA1111AssetForMobile(content: string): Promise<A1111LintSummary> {
  const index = await loadMobileCoreIndex();
  return summarizeA1111LintIssues(lintA1111Tags(content, index));
}

/** Apply the mechanical fixes and return just the corrected content. */
export function applyA1111AssetFixes(content: string, issues: A1111LintIssue[]): string {
  return applyA1111TagFixes(content, issues).content;
}
