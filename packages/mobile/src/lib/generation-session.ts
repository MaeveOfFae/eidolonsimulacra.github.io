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
  importedSource?: {
    label: string;
    source: string;
    assets: Record<string, string>;
  };
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
    (typeof session.importedSource === 'undefined' ||
      (!!session.importedSource &&
        typeof session.importedSource === 'object' &&
        typeof session.importedSource.label === 'string' &&
        typeof session.importedSource.source === 'string' &&
        !!session.importedSource.assets &&
        typeof session.importedSource.assets === 'object' &&
        Object.values(session.importedSource.assets).every((content) => typeof content === 'string'))) &&
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

/** Completed checkpoint assets in template order. */
export function orderedCompletedAssetNames(
  session: MobileGenerationSession,
  orderedAssetNames: readonly string[],
): string[] {
  return orderedAssetNames.filter((assetName) =>
    Object.prototype.hasOwnProperty.call(session.completedAssets, assetName),
  );
}

/**
 * Restart-from semantics for the mobile resume card: drop the named asset and
 * every asset after it in template order, keeping the approved prefix before
 * it so the resumed run regenerates from that point.
 */
export function trimSessionFromAsset(
  session: MobileGenerationSession,
  orderedAssetNames: readonly string[],
  restartFrom: string,
): MobileGenerationSession {
  const restartIndex = orderedAssetNames.indexOf(restartFrom);
  if (restartIndex < 0) {
    return session;
  }

  const keep = new Set(orderedAssetNames.slice(0, restartIndex));
  const completedAssets = Object.fromEntries(
    Object.entries(session.completedAssets).filter(([assetName]) => keep.has(assetName)),
  );

  return { ...session, completedAssets, updatedAt: Date.now() };
}
