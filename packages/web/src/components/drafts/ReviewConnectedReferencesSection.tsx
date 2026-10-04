import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { MAX_CONNECTED_DRAFT_REFERENCES } from '@char-gen/shared';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Connected references panel for the review screen.
 *
 * Extracted from `Review` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It lists the connected
 * draft characters, adds and removes references (capped by
 * `MAX_CONNECTED_DRAFT_REFERENCES`), and saves or resets the pending change set.
 * The editable-reference state and the save mutation stay in the parent, which
 * seeds them from the draft. Behavior is pinned by `Review.test.tsx` through the
 * parent.
 */

interface ConnectedDraftOption {
  review_id: string;
  character_name?: string | null;
}

interface ReviewConnectedReferencesSectionProps {
  editableConnectedDraftIds: string[];
  relatedDraftLookup: Map<string, { character_name?: string | null }>;
  availableConnectedDrafts: ConnectedDraftOption[];
  pendingConnectedDraftId: string;
  onPendingConnectedDraftIdChange: (draftId: string) => void;
  isSaving: boolean;
  hasConnectedDraftChanges: boolean;
  onAddReference: () => void;
  onRemoveReference: (draftId: string) => void;
  onSaveReferences: () => void | Promise<unknown>;
  onResetReferences: () => void;
}

export default function ReviewConnectedReferencesSection({
  editableConnectedDraftIds,
  relatedDraftLookup,
  availableConnectedDrafts,
  pendingConnectedDraftId,
  onPendingConnectedDraftIdChange,
  isSaving,
  hasConnectedDraftChanges,
  onAddReference,
  onRemoveReference,
  onSaveReferences,
  onResetReferences,
}: ReviewConnectedReferencesSectionProps) {
  return (
    <CollapsibleSection
      title="Connected references"
      subtitle={`Attach up to ${MAX_CONNECTED_DRAFT_REFERENCES} saved drafts to this draft`}
      preview={
        editableConnectedDraftIds.length > 0
          ? editableConnectedDraftIds
              .map((draftId) => relatedDraftLookup.get(draftId)?.character_name || draftId)
              .join(' • ')
          : 'None saved'
      }
      defaultExpanded={false}
      forceExpanded={hasConnectedDraftChanges}
      density="compact"
      className="app-panel"
      bodyClassName="space-y-2.5"
    >
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Connected characters:</span>{' '}
        {editableConnectedDraftIds.length > 0
          ? editableConnectedDraftIds.map((draftId, index) => (
              <span key={draftId}>
                {index > 0 ? ', ' : ''}
                <Link to={`/drafts/${encodeURIComponent(draftId)}`} className="text-primary hover:underline">
                  {relatedDraftLookup.get(draftId)?.character_name || draftId}
                </Link>
              </span>
            ))
          : 'None saved'}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={pendingConnectedDraftId}
          onChange={(event) => onPendingConnectedDraftIdChange(event.target.value)}
          disabled={
            isSaving ||
            availableConnectedDrafts.length === 0 ||
            editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
          }
          aria-label="Review connected draft reference"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="">Add a saved draft...</option>
          {availableConnectedDrafts.map((entry) => (
            <option key={entry.review_id} value={entry.review_id}>
              {entry.character_name || entry.review_id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddReference}
          disabled={
            !pendingConnectedDraftId || isSaving || editableConnectedDraftIds.length >= MAX_CONNECTED_DRAFT_REFERENCES
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          Add reference
        </button>
      </div>

      {editableConnectedDraftIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {editableConnectedDraftIds.map((draftId) => (
            <span
              key={draftId}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
            >
              {relatedDraftLookup.get(draftId)?.character_name || draftId}
              <button
                type="button"
                onClick={() => onRemoveReference(draftId)}
                disabled={isSaving}
                aria-label={`Remove ${relatedDraftLookup.get(draftId)?.character_name || draftId}`}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onSaveReferences()}
          disabled={!hasConnectedDraftChanges || isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Save references
        </button>
        <button
          type="button"
          onClick={onResetReferences}
          disabled={!hasConnectedDraftChanges || isSaving}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </CollapsibleSection>
  );
}
