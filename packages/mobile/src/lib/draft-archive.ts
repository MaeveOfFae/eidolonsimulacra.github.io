import { isArchivedDraft, type DraftMetadata } from '@char-gen/shared';

/**
 * The "Show" filter modes for the draft library. `archived` reads from the
 * archived list query instead of the active one; the other two read the active
 * list, and `all` is what the active list already excludes archived drafts from.
 */
export type DraftFilterMode = 'all' | 'favorites' | 'archived';

export interface DraftArchiveAction {
  /** Direction of the transition this action performs. */
  kind: 'archive' | 'restore';
  /** Metadata patch applied by `archiveDraft` / `restoreDraft`. */
  updates: { archived_at: string | undefined };
  snapshotLabel: string;
  snapshotReason: string;
  /** Button label for the transition offered by the current state. */
  actionLabel: string;
  confirmationTitle: string;
  confirmationMessage: string;
}

export function isDraftArchived(metadata: DraftMetadata): boolean {
  return isArchivedDraft(metadata);
}

/**
 * Resolves the archive transition a draft currently offers, mirroring the web
 * review screen: archived drafts offer "Restore", everything else "Archive".
 * Both directions take a safeguard snapshot first so the previous state stays
 * recoverable from revision history.
 */
export function resolveDraftArchiveAction(
  metadata: DraftMetadata,
  nowIso: string = new Date().toISOString(),
): DraftArchiveAction {
  const displayName = metadata.character_name || metadata.seed;

  if (isDraftArchived(metadata)) {
    return {
      kind: 'restore',
      updates: { archived_at: undefined },
      snapshotLabel: 'Before restoring from archive',
      snapshotReason: 'pre-draft-restore',
      actionLabel: 'Restore',
      confirmationTitle: 'Restore Character',
      confirmationMessage: `Restore "${displayName}" to the active library? A safeguard restore point is saved first.`,
    };
  }

  return {
    kind: 'archive',
    updates: { archived_at: nowIso },
    snapshotLabel: 'Before archiving draft',
    snapshotReason: 'pre-draft-archive',
    actionLabel: 'Archive',
    confirmationTitle: 'Archive Character',
    confirmationMessage: `Archive "${displayName}"? It moves out of the active library, keeps its data, and can be restored later.`,
  };
}

/**
 * Picks which query result backs the visible list. Archived drafts live in a
 * separate query because the active list never includes them.
 */
export function selectDraftListSource(
  activeDrafts: DraftMetadata[],
  archivedDrafts: DraftMetadata[],
  filterMode: DraftFilterMode,
): DraftMetadata[] {
  return filterMode === 'archived' ? archivedDrafts : activeDrafts;
}
