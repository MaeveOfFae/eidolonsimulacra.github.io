import { Link } from 'react-router-dom';

/**
 * World attachment and canon-relationship wiring for the review screen.
 *
 * Extracted from `Review` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It covers the
 * multi-attachment warning, the single-attachment move/detach controls, the linked
 * character's canon relationships with their record form, and both feedback
 * messages. **Desktop-only** — the parent keeps the `selfContainedDesktop` gate,
 * and the pending-selection state stays there because two parent effects keep it
 * valid. Behavior is pinned by `Review.test.tsx` through the parent.
 */

interface WorldOption {
  id: string;
  name: string;
}

interface WorldAttachmentRecord {
  characterId: string;
  worldId: string;
  worldName: string;
  characterName: string;
  role?: string;
}

interface WorldCharacterOption {
  id: string;
  characterName: string;
}

interface ReviewRelationshipRecord {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  label: string;
  notes?: string | null;
}

interface ReviewWorldAttachmentsSectionProps {
  hasMultipleWorldAttachments: boolean;
  linkedWorldAttachments: WorldAttachmentRecord[];
  linkedWorldAttachment: WorldAttachmentRecord | null;
  worlds: WorldOption[];
  pendingWorldId: string;
  onPendingWorldIdChange: (worldId: string) => void;
  isAttaching: boolean;
  isDetaching: boolean;
  onAttach: (worldId: string) => void;
  onDetach: () => void;
  linkedReviewCharacter: WorldCharacterOption | null;
  linkedReviewRelationships: ReviewRelationshipRecord[];
  linkedWorldCharacters: WorldCharacterOption[];
  linkedRelationshipTargets: WorldCharacterOption[];
  pendingRelationshipTargetId: string;
  onPendingRelationshipTargetIdChange: (characterId: string) => void;
  pendingRelationshipLabel: string;
  onPendingRelationshipLabelChange: (label: string) => void;
  pendingRelationshipNotes: string;
  onPendingRelationshipNotesChange: (notes: string) => void;
  isAddingRelationship: boolean;
  onAddRelationship: () => void;
  worldRelationshipFeedback: string | null;
  worldAttachmentFeedback: string | null;
}

export default function ReviewWorldAttachmentsSection({
  hasMultipleWorldAttachments,
  linkedWorldAttachments,
  linkedWorldAttachment,
  worlds,
  pendingWorldId,
  onPendingWorldIdChange,
  isAttaching,
  isDetaching,
  onAttach,
  onDetach,
  linkedReviewCharacter,
  linkedReviewRelationships,
  linkedWorldCharacters,
  linkedRelationshipTargets,
  pendingRelationshipTargetId,
  onPendingRelationshipTargetIdChange,
  pendingRelationshipLabel,
  onPendingRelationshipLabelChange,
  pendingRelationshipNotes,
  onPendingRelationshipNotesChange,
  isAddingRelationship,
  onAddRelationship,
  worldRelationshipFeedback,
  worldAttachmentFeedback,
}: ReviewWorldAttachmentsSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-medium text-foreground">World attachment</div>
          <div className="mt-1 text-muted-foreground">
            Attach this draft to a persisted world through its world-character record.
          </div>
        </div>
        <Link
          to="/worlds"
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
        >
          Open Worlds
        </Link>
      </div>

      {hasMultipleWorldAttachments ? (
        <div className="mt-3 space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          <div className="font-medium text-foreground">Multiple world links found</div>
          <div>
            This draft is linked to more than one persisted world character. Review-side move and detach actions are
            disabled until the extra links are cleaned up from Worlds.
          </div>
          <div className="space-y-1">
            {linkedWorldAttachments.map((attachment) => (
              <div key={attachment.characterId}>
                {attachment.worldName}: {attachment.characterName}
                {attachment.role ? ` · ${attachment.role}` : ''}
              </div>
            ))}
          </div>
        </div>
      ) : linkedWorldAttachment ? (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Attached to {linkedWorldAttachment.worldName}</div>
            <div className="mt-1">
              Character record: {linkedWorldAttachment.characterName}
              {linkedWorldAttachment.role ? ` · ${linkedWorldAttachment.role}` : ''}
            </div>
          </div>
          {worlds.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pendingWorldId}
                onChange={(event) => onPendingWorldIdChange(event.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                aria-label="Move draft to world"
              >
                {worlds.map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => pendingWorldId && onAttach(pendingWorldId)}
                disabled={
                  !pendingWorldId || pendingWorldId === linkedWorldAttachment.worldId || isAttaching || isDetaching
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isAttaching ? 'Moving...' : 'Move to selected world'}
              </button>
              <button
                type="button"
                onClick={() => onDetach()}
                disabled={isAttaching || isDetaching}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {isDetaching ? 'Detaching...' : 'Detach from world'}
              </button>
            </div>
          ) : null}
          {linkedReviewCharacter && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Canon relationships</div>
              <div className="mt-1">Record ties for {linkedReviewCharacter.characterName} without leaving review.</div>

              {linkedReviewRelationships.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {linkedReviewRelationships.map((relationship) => {
                    const sourceName =
                      linkedWorldCharacters.find((character) => character.id === relationship.sourceCharacterId)
                        ?.characterName ?? relationship.sourceCharacterId;
                    const targetName =
                      linkedWorldCharacters.find((character) => character.id === relationship.targetCharacterId)
                        ?.characterName ?? relationship.targetCharacterId;

                    return (
                      <div
                        key={relationship.id}
                        className="rounded-md border border-border/50 bg-background/70 px-2.5 py-2"
                      >
                        <div className="font-medium text-foreground">
                          {sourceName}
                          {' -> '}
                          {targetName}
                        </div>
                        <div className="mt-1">{relationship.label}</div>
                        {relationship.notes ? (
                          <div className="mt-1 text-[11px] text-muted-foreground">{relationship.notes}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-border/50 bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground">
                  No canon relationships recorded for this character yet.
                </div>
              )}

              {linkedRelationshipTargets.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <select
                    value={pendingRelationshipTargetId}
                    onChange={(event) => onPendingRelationshipTargetIdChange(event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                    aria-label="Relationship target"
                  >
                    <option value="">Target character...</option>
                    {linkedRelationshipTargets.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.characterName}
                      </option>
                    ))}
                  </select>
                  <input
                    value={pendingRelationshipLabel}
                    onChange={(event) => onPendingRelationshipLabelChange(event.target.value)}
                    placeholder="Relationship label"
                    aria-label="Relationship label"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                  <textarea
                    value={pendingRelationshipNotes}
                    onChange={(event) => onPendingRelationshipNotesChange(event.target.value)}
                    placeholder="Relationship notes"
                    aria-label="Relationship notes"
                    className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => onAddRelationship()}
                    disabled={!pendingRelationshipTargetId || !pendingRelationshipLabel.trim() || isAddingRelationship}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isAddingRelationship ? 'Saving relationship...' : 'Add relationship to world'}
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-border/50 bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground">
                  Add another character to this world before recording relationships from review.
                </div>
              )}

              {worldRelationshipFeedback && (
                <div className="mt-3 text-[11px] text-muted-foreground">{worldRelationshipFeedback}</div>
              )}
            </div>
          )}
        </div>
      ) : worlds.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={pendingWorldId}
            onChange={(event) => onPendingWorldIdChange(event.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
            aria-label="Attach draft to world"
          >
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => pendingWorldId && onAttach(pendingWorldId)}
            disabled={!pendingWorldId || isAttaching || isDetaching}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isAttaching ? 'Attaching...' : 'Attach to world'}
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
          No persisted worlds yet. Create or promote one from the Worlds route first.
        </div>
      )}

      {worldAttachmentFeedback && <div className="mt-3 text-xs text-muted-foreground">{worldAttachmentFeedback}</div>}
    </div>
  );
}
