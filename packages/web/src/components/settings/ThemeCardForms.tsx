/**
 * Duplicate, rename and detail forms shown inside a theme preset card.
 *
 * Extracted from `Themes` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). The parent owns the
 * drafts and the mutations, and passes only the draft belonging to the card being
 * edited (the others are `null`), so this renders at most one form. Behavior is
 * pinned by `Themes.test.tsx` through the parent.
 */

export interface ThemeDuplicateDraft {
  sourceName: string;
  newName: string;
  displayName: string;
  description: string;
  author: string;
  tags: string;
  basedOn: string;
}

export interface ThemeRenameDraft {
  sourceName: string;
  newName: string;
  displayName: string;
}

export interface ThemeMetadataDraft {
  sourceName: string;
  displayName: string;
  description: string;
  author: string;
  tags: string;
  basedOn: string;
}

interface ThemeCardFormsProps {
  duplicateDraft: ThemeDuplicateDraft | null;
  renameDraft: ThemeRenameDraft | null;
  metadataDraft: ThemeMetadataDraft | null;
  isSubmittingDuplicate: boolean;
  isSubmittingRename: boolean;
  isSavingMetadata: boolean;
  onDuplicateDraftChange: (draft: ThemeDuplicateDraft) => void;
  onRenameDraftChange: (draft: ThemeRenameDraft) => void;
  onMetadataDraftChange: (draft: ThemeMetadataDraft) => void;
  onSubmitDuplicate: () => void;
  onSubmitRename: () => void;
  onSubmitMetadata: () => void;
  onCancelDuplicate: () => void;
  onCancelRename: () => void;
  onCancelMetadata: () => void;
}

export default function ThemeCardForms({
  duplicateDraft,
  renameDraft,
  metadataDraft,
  isSubmittingDuplicate,
  isSubmittingRename,
  isSavingMetadata,
  onDuplicateDraftChange,
  onRenameDraftChange,
  onMetadataDraftChange,
  onSubmitDuplicate,
  onSubmitRename,
  onSubmitMetadata,
  onCancelDuplicate,
  onCancelRename,
  onCancelMetadata,
}: ThemeCardFormsProps) {
  return (
    <>
      {metadataDraft && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-background/60 p-3">
          <div className="text-sm font-medium">Edit Theme Details</div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              aria-label="Display name"
              value={metadataDraft.displayName}
              onChange={(event) => onMetadataDraftChange({ ...metadataDraft, displayName: event.target.value })}
              placeholder="display name"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              aria-label="Author"
              value={metadataDraft.author}
              onChange={(event) => onMetadataDraftChange({ ...metadataDraft, author: event.target.value })}
              placeholder="author"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <textarea
            aria-label="Description"
            value={metadataDraft.description}
            onChange={(event) => onMetadataDraftChange({ ...metadataDraft, description: event.target.value })}
            rows={2}
            placeholder="description"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              aria-label="Based on"
              value={metadataDraft.basedOn}
              onChange={(event) => onMetadataDraftChange({ ...metadataDraft, basedOn: event.target.value })}
              placeholder="based on"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              aria-label="Tags"
              value={metadataDraft.tags}
              onChange={(event) => onMetadataDraftChange({ ...metadataDraft, tags: event.target.value })}
              placeholder="warm, editorial, night"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelMetadata}
              className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitMetadata}
              disabled={isSavingMetadata || !metadataDraft.displayName.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSavingMetadata ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </div>
      )}

      {duplicateDraft && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-background/60 p-3">
          <div className="text-sm font-medium">Duplicate Theme</div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              aria-label="New theme name"
              value={duplicateDraft.newName}
              onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, newName: event.target.value })}
              placeholder="theme name"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              aria-label="Display name"
              value={duplicateDraft.displayName}
              onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, displayName: event.target.value })}
              placeholder="display name"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <textarea
            aria-label="Description"
            value={duplicateDraft.description}
            onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, description: event.target.value })}
            rows={2}
            placeholder="description"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              aria-label="Author"
              value={duplicateDraft.author}
              onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, author: event.target.value })}
              placeholder="author"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              aria-label="Based on"
              value={duplicateDraft.basedOn}
              onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, basedOn: event.target.value })}
              placeholder="based on"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            aria-label="Tags"
            value={duplicateDraft.tags}
            onChange={(event) => onDuplicateDraftChange({ ...duplicateDraft, tags: event.target.value })}
            placeholder="warm, editorial, night"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelDuplicate}
              className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitDuplicate}
              disabled={isSubmittingDuplicate || !duplicateDraft.newName.trim() || !duplicateDraft.displayName.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmittingDuplicate ? 'Duplicating...' : 'Create copy'}
            </button>
          </div>
        </div>
      )}

      {renameDraft && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-background/60 p-3">
          <div className="text-sm font-medium">Rename Theme</div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              aria-label="New theme name"
              value={renameDraft.newName}
              onChange={(event) => onRenameDraftChange({ ...renameDraft, newName: event.target.value })}
              placeholder="theme name"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              aria-label="Display name"
              value={renameDraft.displayName}
              onChange={(event) => onRenameDraftChange({ ...renameDraft, displayName: event.target.value })}
              placeholder="display name"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelRename}
              className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitRename}
              disabled={isSubmittingRename || !renameDraft.newName.trim() || !renameDraft.displayName.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmittingRename ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
