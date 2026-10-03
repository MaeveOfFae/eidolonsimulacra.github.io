import type { ContentMode } from '@char-gen/shared';

/**
 * Checkpoint model for interrupted mobile generation runs.
 *
 * Mirrors the web's `ActiveGenerationSession` at the level mobile needs: the
 * run parameters plus every asset that completed before the interruption.
 * The screen offers a resume card while a resumable checkpoint exists; the
 * local API writes the checkpoint as each asset completes and clears it when
 * the draft is saved.
 */
export interface MobileGenerationSession {
  version: 1;
  seed: string;
  mode?: ContentMode;
  template: string;
  selectedAssets?: string[];
  completedAssets: Record<string, string>;
  updatedAt: number;
}

export function isMobileGenerationSession(value: unknown): value is MobileGenerationSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<MobileGenerationSession>;
  return (
    session.version === 1 &&
    typeof session.seed === 'string' &&
    (typeof session.mode === 'string' || typeof session.mode === 'undefined') &&
    typeof session.template === 'string' &&
    (typeof session.selectedAssets === 'undefined' ||
      (Array.isArray(session.selectedAssets) && session.selectedAssets.every((name) => typeof name === 'string'))) &&
    !!session.completedAssets &&
    typeof session.completedAssets === 'object' &&
    Object.values(session.completedAssets).every((content) => typeof content === 'string') &&
    typeof session.updatedAt === 'number'
  );
}

/** A session is only worth resuming once at least one asset completed. */
export function isResumableMobileGenerationSession(value: unknown): value is MobileGenerationSession {
  return isMobileGenerationSession(value) && Object.keys(value.completedAssets).length > 0;
}

/** Ordered asset names that still need generation for the stored checkpoint. */
export function remainingAssetNames(session: MobileGenerationSession, orderedAssetNames: readonly string[]): string[] {
  return orderedAssetNames.filter(
    (assetName) => !Object.prototype.hasOwnProperty.call(session.completedAssets, assetName),
  );
}
