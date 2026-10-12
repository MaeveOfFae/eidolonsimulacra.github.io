/**
 * The file a drop handed to a screen that is not on screen yet.
 *
 * A dropped `File` cannot be put in a URL, so a drop that belongs elsewhere has to be
 * carried across the navigation in memory. This is that carrier: one slot with the kind it
 * was classified as, and the file itself.
 *
 * Deliberately not persisted. A dropped file is not serialisable, and a stale drop that
 * survived a reload would mean a screen importing something from a session that has ended.
 */
import type { DroppedFileKind } from './file-drop';

export interface PendingDrop {
  kind: DroppedFileKind;
  file: File;
  fileName: string;
}

/** Lets a screen that is *already mounted* react, instead of waiting for a remount. */
export const PENDING_DROP_EVENT = 'eidolon:file-drop-pending';

let pending: PendingDrop | null = null;

export function setPendingDrop(drop: PendingDrop): void {
  pending = drop;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PENDING_DROP_EVENT, { detail: { kind: drop.kind } }));
  }
}

/**
 * The pending drop for this kind, removed as it is handed over.
 *
 * Taking rather than reading is what makes a file import once: the mount path and the
 * event path both run for a navigation, and only one of them should get the file.
 */
export function takePendingDrop(kind: DroppedFileKind): PendingDrop | null {
  if (!pending || pending.kind !== kind) {
    return null;
  }

  const drop = pending;
  pending = null;
  return drop;
}

export function clearPendingDrop(): void {
  pending = null;
}
