/**
 * Workspace modes — the third part of the roadmap's IA item: solo drafting,
 * review, and bulk.
 *
 * A mode is a **lens over the same 36 routes, never a filter**. It does two
 * things and deliberately nothing else:
 *
 *   1. promotes its own screens to the top of the quick-actions palette's
 *      default list and — for an explicitly chosen mode — to the top of the
 *      sidebar. A follow-screen (Auto) mode names things but never moves the
 *      sidebar, so clicking around the nav can't reshuffle it, and
 *   2. gives the app frame a name for what you are doing.
 *
 * Nothing is ever hidden. The palette still reaches every route in every mode,
 * so a mode cannot strand a screen the way the pre-catalog IA stranded `/data`.
 *
 * Each path is owned by **exactly one** mode, which is what makes "which mode am
 * I in" answerable rather than a guess; `validateRouteCatalog` enforces that and
 * that every mode path is a real, literal route.
 */
import { Layers, ShieldCheck, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { readPersistedString, removePersistedValues, writePersistedString } from '../persistence/storage';

export type WorkspaceModeId = 'draft' | 'review' | 'bulk';

export interface WorkspaceMode {
  id: WorkspaceModeId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Where the mode sends you when you switch to it, and pick it deliberately. */
  defaultRoute: string;
  /** Screens the mode promotes. Disjoint across modes, literal paths only. */
  primaryPaths: string[];
}

export const WORKSPACE_MODES: WorkspaceMode[] = [
  {
    id: 'draft',
    label: 'Solo drafting',
    description: 'One character at a time: seed, generate, refine.',
    icon: Sparkles,
    defaultRoute: '/generate',
    primaryPaths: ['/generate', '/seed-generator', '/templates'],
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Inspect, validate, and export the drafts you already have.',
    icon: ShieldCheck,
    defaultRoute: '/drafts',
    primaryPaths: ['/drafts', '/validation', '/optimize'],
  },
  {
    id: 'bulk',
    label: 'Bulk',
    description: 'Throughput: batches, model comparisons, and what they cost.',
    icon: Layers,
    defaultRoute: '/batch',
    primaryPaths: ['/batch', '/compare', '/insights'],
  },
];

export const WORKSPACE_MODE_STORAGE_KEY = 'eidolon.web.workspaceMode';

export function isWorkspaceModeId(value: unknown): value is WorkspaceModeId {
  return typeof value === 'string' && WORKSPACE_MODES.some((mode) => mode.id === value);
}

export function findWorkspaceMode(modeId: WorkspaceModeId): WorkspaceMode {
  const mode = WORKSPACE_MODES.find((candidate) => candidate.id === modeId);
  if (!mode) {
    throw new Error(`Unknown workspace mode: ${modeId}`);
  }

  return mode;
}

function pathMatches(modePath: string, pathname: string): boolean {
  return pathname === modePath || pathname.startsWith(`${modePath}/`);
}

/** The mode that owns a pathname, or `null` for screens no mode claims. */
export function workspaceModeForPath(pathname: string): WorkspaceModeId | null {
  const owner = WORKSPACE_MODES.find((mode) => mode.primaryPaths.some((path) => pathMatches(path, pathname)));
  return owner?.id ?? null;
}

/** Whether a pathname is one of the screens a mode promotes. */
export function isModePrimaryPath(modeId: WorkspaceModeId, pathname: string): boolean {
  return findWorkspaceMode(modeId).primaryPaths.some((path) => pathMatches(path, pathname));
}

/**
 * An explicit choice always wins; otherwise the mode follows the screen you are
 * on, so switching to Review's screens reports "Review" without being told.
 */
export function resolveActiveWorkspaceMode(
  explicitModeId: WorkspaceModeId | null,
  pathname: string,
): WorkspaceModeId | null {
  return explicitModeId ?? workspaceModeForPath(pathname);
}

/**
 * Stable partition: the mode's own items first, in the mode's order, then
 * everything else in its original order. A `null` mode leaves the list alone.
 */
export function orderByMode<T>(items: readonly T[], modeId: WorkspaceModeId | null, getPath: (item: T) => string): T[] {
  if (!modeId) {
    return [...items];
  }

  const promoted = findWorkspaceMode(modeId).primaryPaths;
  const promotedItems: T[] = [];
  const rest: T[] = [];

  for (const item of items) {
    const rank = promoted.findIndex((path) => pathMatches(path, getPath(item)));
    if (rank >= 0) {
      promotedItems[rank] = item;
    } else {
      rest.push(item);
    }
  }

  return [...promotedItems.filter(Boolean), ...rest];
}

/** `orderByMode` for anything shaped like a catalog entry. */
export function orderEntriesForMode<T extends { path: string }>(
  entries: readonly T[],
  modeId: WorkspaceModeId | null,
): T[] {
  return orderByMode(entries, modeId, (entry) => entry.path);
}

/** The stored explicit choice, or `null` when unset or unrecognised. */
export function readStoredWorkspaceMode(): WorkspaceModeId | null {
  const stored = readPersistedString(WORKSPACE_MODE_STORAGE_KEY);
  if (!stored || !isWorkspaceModeId(stored.value)) {
    return null;
  }

  return stored.value;
}

export function writeStoredWorkspaceMode(modeId: WorkspaceModeId): void {
  writePersistedString(WORKSPACE_MODE_STORAGE_KEY, [], modeId);
}

/** Back to "follow the screen I am on". */
export function clearStoredWorkspaceMode(): void {
  removePersistedValues([WORKSPACE_MODE_STORAGE_KEY]);
}
