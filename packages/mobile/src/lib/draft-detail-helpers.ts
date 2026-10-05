/**
 * The pure helpers behind the draft detail screen: the saved-intro markers and
 * parsing, the export preset filenames and labels, asset labelling and visibility,
 * timestamp formatting, and the generation-stage description.
 *
 * These were closures inside the screen's state hook, so they were rebuilt on every
 * render; they are plain functions with no state, which is what makes them testable
 * from the logic-only mobile suite.
 */

import { type DraftMetadata, type ExportFormat } from '@char-gen/shared';
import type { IntroCandidate } from '../screens/draft-detail/use-draft-detail-state';

export const SAVED_INTROS_BLOCK_PATTERN = /\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g;
export const SAVED_INTROS_CAPTURE_PATTERN = /\[SAVED_INTROS\]([\s\S]*?)\[\/SAVED_INTROS\]/;

/** Keeps the export chips, filenames and labels aligned with `ExportFormat`. */
export const EXPORT_EXTENSIONS: Record<ExportFormat, string> = {
  json: 'json',
  text: 'txt',
  combined: 'md',
  png: 'png',
  pdf: 'pdf',
};

export const EXPORT_LABELS: Record<ExportFormat, string> = {
  json: 'JSON',
  text: 'TXT',
  combined: 'Markdown bundle',
  png: 'PNG character card',
  pdf: 'PDF',
};

export function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function stripSavedIntrosBlock(notes?: string | null): string {
  return (notes || '').replace(SAVED_INTROS_BLOCK_PATTERN, '').trim();
}

export function parseSavedIntros(notes?: string | null): IntroCandidate[] {
  if (!notes) {
    return [];
  }

  try {
    const match = notes.match(SAVED_INTROS_CAPTURE_PATTERN);
    if (!match?.[1]) {
      return [];
    }

    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is IntroCandidate =>
        !!entry &&
        typeof entry === 'object' &&
        typeof entry.id === 'string' &&
        typeof entry.content === 'string' &&
        typeof entry.timestamp === 'number',
    );
  } catch {
    return [];
  }
}

export function mergeNotesWithSavedIntros(
  notes: string | undefined,
  savedIntros: IntroCandidate[],
): string | undefined {
  const baseNotes = stripSavedIntrosBlock(notes).trim();
  if (savedIntros.length === 0) {
    return baseNotes || undefined;
  }

  return `${baseNotes ? `${baseNotes}\n\n` : ''}[SAVED_INTROS]${JSON.stringify(savedIntros)}[/SAVED_INTROS]`;
}

export function createIntroCandidate(content: string): IntroCandidate {
  return {
    id: `intro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content,
    timestamp: Date.now(),
  };
}

export function summarizeText(content?: string | null, maxLength = 160): string {
  const trimmed = (content || '').replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

export function formatTimestamp(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function buildRevertedReviewAnnotations(
  currentAnnotations: DraftMetadata['review_annotations'],
  snapshotAnnotations: DraftMetadata['review_annotations'],
  assetName: string,
) {
  const nextAssetScores = { ...(currentAnnotations?.asset_scores ?? {}) };
  const nextAssetNotes = { ...(currentAnnotations?.asset_notes ?? {}) };
  const sourceScore = snapshotAnnotations?.asset_scores?.[assetName];
  const sourceNote = snapshotAnnotations?.asset_notes?.[assetName]?.trim() ?? '';

  if (sourceScore !== undefined) {
    nextAssetScores[assetName] = sourceScore;
  } else {
    delete nextAssetScores[assetName];
  }

  if (sourceNote) {
    nextAssetNotes[assetName] = sourceNote;
  } else {
    delete nextAssetNotes[assetName];
  }

  const hasScores = Object.keys(nextAssetScores).length > 0;
  const hasNotes = Object.keys(nextAssetNotes).length > 0;
  const summaryNotes = currentAnnotations?.notes?.trim() ?? '';

  if (!summaryNotes && !hasScores && !hasNotes) {
    return undefined;
  }

  return {
    ...(summaryNotes ? { notes: summaryNotes } : {}),
    ...(hasScores ? { asset_scores: nextAssetScores } : {}),
    ...(hasNotes ? { asset_notes: nextAssetNotes } : {}),
    updated_at: new Date().toISOString(),
  };
}

export function isVisibleDraftAsset(assetName: string): boolean {
  return assetName !== 'card_image';
}

export function describeGenerationStage(stage: string, progress?: number, asset?: string): string {
  const percent = typeof progress === 'number' ? ` (${Math.round(progress * 100)}%)` : '';
  const assetLabel = asset ? ` ${formatAssetLabel(asset)}` : '';

  switch (stage) {
    case 'building_asset_prompt':
      return `Preparing${assetLabel}${percent}`;
    case 'contacting_provider':
      return `Submitting${assetLabel} to provider${percent}`;
    case 'provider_generating':
      return `Provider is generating${assetLabel}${percent}`;
    case 'asset_complete':
      return `Completed${assetLabel}${percent}`;
    case 'complete':
      return 'Intro generation complete.';
    default:
      return `${stage.replace(/_/g, ' ')}${percent}`;
  }
}
