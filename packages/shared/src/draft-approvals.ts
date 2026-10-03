import type { Draft, DraftAssetApproval, DraftAssetApprovalStatus, DraftReviewAnnotations } from './types';

export type AssetApprovalEntryStatus = 'approved' | 'changes_requested' | 'stale' | 'unapproved';

export interface AssetApprovalEntry {
  assetName: string;
  status: AssetApprovalEntryStatus;
  decidedAt?: string;
  note?: string;
}

export interface AssetApprovalSummary {
  entries: AssetApprovalEntry[];
  totalAssetCount: number;
  approvedCount: number;
  changesRequestedCount: number;
  staleCount: number;
  unapprovedCount: number;
  decidedCount: number;
  complete: boolean;
}

export interface DraftAssetApprovalDecision {
  status: DraftAssetApprovalStatus;
  note?: string;
}

const CARD_IMAGE_ASSET_NAME = 'card_image';

/**
 * Deterministic, dependency-free content fingerprint (djb2 variant). Not
 * cryptographic — it exists only to detect that an asset's content changed
 * after an approval decision was recorded.
 */
export function fingerprintAssetContent(content: string): string {
  let hash = 5381;
  for (let index = 0; index < content.length; index += 1) {
    hash = ((hash << 5) + hash + content.charCodeAt(index)) | 0;
  }
  return `${content.length.toString(36)}-${(hash >>> 0).toString(36)}`;
}

function resolveApprovalStatus(
  approval: DraftAssetApproval | undefined,
  content: string | undefined,
): AssetApprovalEntryStatus {
  if (!approval) {
    return 'unapproved';
  }

  if (content === undefined || approval.content_fingerprint !== fingerprintAssetContent(content)) {
    return 'stale';
  }

  return approval.status;
}

export function buildAssetApprovalSummary(draft: Draft | undefined): AssetApprovalSummary {
  const assetNames = Object.keys(draft?.assets ?? {}).filter((assetName) => assetName !== CARD_IMAGE_ASSET_NAME);
  const approvals = draft?.metadata.review_annotations?.asset_approvals ?? {};

  const entries = assetNames
    .map((assetName) => {
      const approval = approvals[assetName];
      const status = resolveApprovalStatus(approval, draft?.assets[assetName]);
      return {
        assetName,
        status,
        // A stale decision no longer describes the saved content, so it is
        // reported without its original decision metadata.
        decidedAt: status === 'stale' ? undefined : approval?.decided_at,
        note: status === 'stale' ? undefined : approval?.note,
      } satisfies AssetApprovalEntry;
    })
    .sort((left, right) => left.assetName.localeCompare(right.assetName));

  const approvedCount = entries.filter((entry) => entry.status === 'approved').length;
  const changesRequestedCount = entries.filter((entry) => entry.status === 'changes_requested').length;
  const staleCount = entries.filter((entry) => entry.status === 'stale').length;
  const unapprovedCount = entries.filter((entry) => entry.status === 'unapproved').length;

  return {
    entries,
    totalAssetCount: entries.length,
    approvedCount,
    changesRequestedCount,
    staleCount,
    unapprovedCount,
    decidedCount: approvedCount + changesRequestedCount,
    complete: entries.length > 0 && approvedCount === entries.length,
  };
}

/**
 * Pure decision builder: returns the next `review_annotations` value with the
 * asset's decision recorded against a fingerprint of its current content.
 * Passing `null` clears the recorded decision. Callers persist the result
 * (for example through the draft API's `updateMetadata`).
 */
export function decideAssetApproval(
  draft: Draft,
  assetName: string,
  decision: DraftAssetApprovalDecision | null,
): DraftReviewAnnotations {
  const annotations = draft.metadata.review_annotations ?? {};
  const approvals = { ...(annotations.asset_approvals ?? {}) };

  if (decision === null) {
    delete approvals[assetName];
  } else {
    const content = draft.assets[assetName];
    if (content === undefined) {
      throw new Error(`Asset ${assetName} has no saved content to approve`);
    }

    approvals[assetName] = {
      status: decision.status,
      decided_at: new Date().toISOString(),
      ...(decision.note?.trim() ? { note: decision.note.trim() } : {}),
      content_fingerprint: fingerprintAssetContent(content),
    };
  }

  return {
    ...annotations,
    asset_approvals: approvals,
    updated_at: new Date().toISOString(),
  };
}
