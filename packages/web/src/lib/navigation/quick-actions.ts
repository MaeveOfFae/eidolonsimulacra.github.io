/**
 * Pure logic behind the quick-actions palette (⌘K / Ctrl-K).
 *
 * Everything the palette shows is derived here so the behaviour that is easy to
 * get wrong — recency ordering, query filtering, wrap-around arrow movement, and
 * keeping the highlight valid when the list shrinks — is unit-testable without
 * rendering a dialog.
 *
 * The screens half comes straight from `route-catalog`, which is why the palette
 * reaches every route (including the detail and legal screens that are not in the
 * sidebar) without a second list to maintain.
 */
import type { DraftMetadata } from '@char-gen/shared';
import { FileText } from 'lucide-react';
import type { RouteCatalogEntry, RouteIcon } from './route-catalog';
import { searchRouteCatalog } from './route-catalog';
import type { WorkspaceModeId } from './workspace-modes';

export type QuickActionKind = 'route' | 'draft';

export interface QuickAction {
  /** Stable React key and keyboard-selection key. */
  id: string;
  label: string;
  description: string;
  icon: RouteIcon;
  /** Router target. */
  to: string;
  kind: QuickActionKind;
}

export type QuickActionsSectionId = 'screens' | 'recent-drafts';

export interface QuickActionsSection {
  id: QuickActionsSectionId;
  label: string;
  actions: QuickAction[];
}

export const RECENT_DRAFT_LIMIT = 4;
export const DEFAULT_SCREEN_LIMIT = 8;

export function routeAction(entry: RouteCatalogEntry): QuickAction {
  return {
    id: `route:${entry.path}`,
    label: entry.label,
    description: entry.description,
    icon: entry.icon,
    to: entry.path,
    kind: 'route',
  };
}

export function draftAction(draft: DraftMetadata): QuickAction {
  return {
    id: `draft:${draft.review_id}`,
    label: draft.character_name?.trim() || draft.seed || 'Untitled draft',
    description: draft.seed ? `Open draft · ${draft.seed}` : 'Open draft',
    icon: FileText,
    to: `/drafts/${encodeURIComponent(draft.review_id)}`,
    kind: 'draft',
  };
}

/** Most recently touched first, falling back from `modified` to `created`. */
export function sortDraftsByRecency(drafts: readonly DraftMetadata[]): DraftMetadata[] {
  return [...drafts].sort((left, right) => {
    const leftStamp = left.modified ?? left.created ?? '';
    const rightStamp = right.modified ?? right.created ?? '';
    return rightStamp.localeCompare(leftStamp);
  });
}

export interface RecentDraftOptions {
  query?: string;
  limit?: number;
}

/**
 * Recent drafts as actions. A non-empty query matches the character name, the
 * seed, or the template name, so typing a seed you remember still reaches it.
 */
export function buildRecentDraftActions(
  drafts: readonly DraftMetadata[],
  { query = '', limit = RECENT_DRAFT_LIMIT }: RecentDraftOptions = {},
): QuickAction[] {
  const needle = query.trim().toLowerCase();
  const matches =
    needle.length === 0
      ? drafts
      : drafts.filter((draft) =>
          [draft.character_name ?? '', draft.seed, draft.template_name ?? ''].some((value) =>
            value.toLowerCase().includes(needle),
          ),
        );

  return sortDraftsByRecency(matches)
    .slice(0, limit)
    .map((draft) => draftAction(draft));
}

export interface QuickActionsInput {
  query: string;
  drafts: readonly DraftMetadata[];
  screenLimit?: number;
  draftLimit?: number;
  /** Screens the active workspace mode promotes rank first. */
  modeId?: WorkspaceModeId | null;
}

/** Empty sections are dropped so the palette only shows what the query reaches. */
export function buildQuickActionsSections({
  query,
  drafts,
  screenLimit = DEFAULT_SCREEN_LIMIT,
  draftLimit = RECENT_DRAFT_LIMIT,
  modeId = null,
}: QuickActionsInput): QuickActionsSection[] {
  const sections: QuickActionsSection[] = [
    {
      id: 'screens',
      label: 'Screens',
      actions: searchRouteCatalog(query, { limit: screenLimit, modeId }).map((result) => routeAction(result.entry)),
    },
    {
      id: 'recent-drafts',
      label: 'Recent drafts',
      actions: buildRecentDraftActions(drafts, { query, limit: draftLimit }),
    },
  ];

  return sections.filter((section) => section.actions.length > 0);
}

/** Flat order for keyboard navigation, matching the rendered order. */
export function flattenQuickActions(sections: readonly QuickActionsSection[]): QuickAction[] {
  return sections.flatMap((section) => section.actions);
}

/** Arrow-key movement. Wraps at both ends; an empty list stays at 0. */
export function moveActiveIndex(current: number, delta: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (current + delta + total) % total;
}

/** Keeps the highlight valid when the list shrinks under the user. */
export function clampActiveIndex(current: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.max(current, 0), total - 1);
}

/** `⌘K` on Apple platforms, `Ctrl K` elsewhere — for the palette's shortcut hint. */
export function quickActionsShortcutLabel(platform: string): string {
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘K' : 'Ctrl K';
}
