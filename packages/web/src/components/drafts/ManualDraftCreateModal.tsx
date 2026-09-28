import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Template } from '@char-gen/shared';
import type { CreateDraftRequest } from '@/lib/api';

interface ManualDraftCreateModalProps {
  templates: Template[];
  onClose: () => void;
  onCreate: (request: CreateDraftRequest) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const CONTENT_MODES = ['Auto', 'SFW', 'NSFW', 'Platform-Safe'] as const;

export default function ManualDraftCreateModal({
  templates,
  onClose,
  onCreate,
  isSubmitting = false,
  error = null,
}: ManualDraftCreateModalProps) {
  const [seed, setSeed] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [templateName, setTemplateName] = useState(templates[0]?.name ?? '');
  const [mode, setMode] = useState<CreateDraftRequest['mode']>('Auto');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    if (!templates.some((template) => template.name === templateName)) {
      setTemplateName(templates[0]?.name ?? '');
    }
  }, [templateName, templates]);

  const canSubmit = useMemo(() => {
    return templateName.trim().length > 0 && !isSubmitting;
  }, [isSubmitting, templateName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSeed = seed.trim();
    if (!trimmedSeed) {
      setValidationError('Seed is required.');
      return;
    }

    if (!templateName.trim()) {
      setValidationError('Template is required.');
      return;
    }

    setValidationError(null);
    onCreate({
      seed: trimmedSeed,
      characterName: characterName.trim() || undefined,
      templateName: templateName.trim(),
      mode,
      genre: genre.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative flex h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg sm:h-auto sm:max-h-[min(88vh,56rem)]">
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Create Draft</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start a saved draft from a seed and template, then fill the asset slots manually or with AI in review.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              title="Close"
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-4 pb-2">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
              The draft starts with metadata only. The review screen will expose every template asset so you can add
              content manually or ask the LLM to generate each missing section.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Character name</span>
                <input
                  aria-label="Character name"
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                  placeholder="Optional display name"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Template</span>
                <select
                  aria-label="Template"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {templates.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Seed</span>
              <textarea
                aria-label="Seed"
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                placeholder="Describe the character concept, constraints, or prompt you want to build from"
                className="min-h-[132px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Mode</span>
                <select
                  aria-label="Mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as CreateDraftRequest['mode'])}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CONTENT_MODES.map((contentMode) => (
                    <option key={contentMode} value={contentMode}>
                      {contentMode}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Genre</span>
                <input
                  aria-label="Genre"
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                  placeholder="Optional genre tag"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Notes</span>
              <textarea
                aria-label="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional reviewer notes, canon reminders, or editing goals"
                className="min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            {(validationError || error) && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {validationError || error}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating…' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
