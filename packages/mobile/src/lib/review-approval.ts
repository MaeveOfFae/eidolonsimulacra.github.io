import {
  buildAssetApprovalSummary,
  buildExportReadinessSummary,
  type AssetApprovalEntryStatus,
  type Draft,
  type DraftAssetApprovalDecision,
  type DraftAssetApprovalStatus,
  type ValidationResponse,
} from '@char-gen/shared';

/**
 * Mobile-first review/approval.
 *
 * The approval engine itself is shared and framework-free (`@char-gen/shared`'s
 * `buildAssetApprovalSummary` / `decideAssetApproval`, which the web review screen
 * already drives), so this module deliberately contains no approval *rules* — it
 * would be a second source of truth if it did. What it adds is the part that is
 * specific to reviewing on a phone: a decision-first ordering, status vocabulary
 * that fits a chip, a progress line for the header, and the one note field the
 * reviewer has on this surface standing in for the decision note.
 */

/** The two decisions the mobile surface offers, in the order it offers them. */
export const MOBILE_APPROVAL_DECISIONS: Array<{ status: DraftAssetApprovalStatus; label: string }> = [
  { status: 'approved', label: 'Approve' },
  { status: 'changes_requested', label: 'Request changes' },
];

export interface MobileApprovalEntry {
  assetName: string;
  label: string;
  status: AssetApprovalEntryStatus;
  statusLabel: string;
  decidedAt?: string;
  note?: string;
  /** Whether this asset still needs a decision, i.e. it is not simply approved. */
  needsDecision: boolean;
}

export interface MobileApprovalQueue {
  /** Decision-first ordering: what needs work is above what is already done. */
  entries: MobileApprovalEntry[];
  pendingEntries: MobileApprovalEntry[];
  totalCount: number;
  approvedCount: number;
  changesRequestedCount: number;
  staleCount: number;
  unapprovedCount: number;
  decidedCount: number;
  /** Header line for the tray, for example `3 of 7 approved`. */
  progressLabel: string;
  complete: boolean;
  /** The asset a one-handed reviewer should open next, if any. */
  nextAssetName?: string;
  /** Readiness warnings that also mention approvals, so the two stay in step. */
  blockingWarnings: string[];
  requiresAcknowledgement: boolean;
}

const STATUS_LABELS: Record<AssetApprovalEntryStatus, string> = {
  approved: 'Approved',
  changes_requested: 'Changes requested',
  stale: 'Needs re-review',
  unapproved: 'Not reviewed',
};

/**
 * Order in which a reviewer wants to see assets: what is blocked or wrong first,
 * then what has never been looked at, then what is finished.
 */
const STATUS_ORDER: Record<AssetApprovalEntryStatus, number> = {
  changes_requested: 0,
  stale: 1,
  unapproved: 2,
  approved: 3,
};

export function describeApprovalStatus(status: AssetApprovalEntryStatus): string {
  return STATUS_LABELS[status];
}

/** `changes_requested` becomes `Changes requested`, and so on. */
export function formatApprovalAssetLabel(assetName: string): string {
  return assetName
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildMobileApprovalQueue(
  draft: Draft | undefined,
  validation?: ValidationResponse,
): MobileApprovalQueue {
  const summary = buildAssetApprovalSummary(draft);

  const entries = summary.entries
    .map((entry) => ({
      assetName: entry.assetName,
      label: formatApprovalAssetLabel(entry.assetName),
      status: entry.status,
      statusLabel: describeApprovalStatus(entry.status),
      decidedAt: entry.decidedAt,
      note: entry.note,
      needsDecision: entry.status !== 'approved',
    }))
    .sort(
      (left, right) =>
        STATUS_ORDER[left.status] - STATUS_ORDER[right.status] || left.assetName.localeCompare(right.assetName),
    );

  const readiness = buildExportReadinessSummary(draft, validation);
  const pendingEntries = entries.filter((entry) => entry.needsDecision);

  return {
    entries,
    pendingEntries,
    totalCount: summary.totalAssetCount,
    approvedCount: summary.approvedCount,
    changesRequestedCount: summary.changesRequestedCount,
    staleCount: summary.staleCount,
    unapprovedCount: summary.unapprovedCount,
    decidedCount: summary.decidedCount,
    progressLabel:
      summary.totalAssetCount === 0
        ? 'No assets to approve'
        : summary.complete
          ? 'All approved'
          : `${summary.approvedCount} of ${summary.totalAssetCount} approved`,
    complete: summary.complete,
    nextAssetName: pendingEntries[0]?.assetName,
    blockingWarnings: readiness.blockingWarnings,
    requiresAcknowledgement: readiness.requiresAcknowledgement,
  };
}

/**
 * The mobile surface has one note field per asset (the review note the detail
 * screen already collects), so that note doubles as the decision note rather than
 * asking the reviewer to write the same thing twice.
 */
export function buildAssetApprovalDecision(
  draft: Draft,
  assetName: string,
  status: DraftAssetApprovalStatus,
): DraftAssetApprovalDecision {
  const note = draft.metadata.review_annotations?.asset_notes?.[assetName]?.trim();

  return note ? { status, note } : { status };
}
