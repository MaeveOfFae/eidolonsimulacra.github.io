import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';
import { cn } from '@/utils/cn';
import {
  buildQuickActionsSections,
  clampActiveIndex,
  flattenQuickActions,
  moveActiveIndex,
  type QuickAction,
} from '@/lib/navigation/quick-actions';

interface QuickActionsPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: readonly DraftMetadata[];
}

const LIST_ID = 'quick-actions-list';

/**
 * Keyboard-first palette over the route catalog plus recent drafts.
 *
 * Follows the ARIA combobox/listbox pattern: focus stays in the input and the
 * highlight moves with `aria-activedescendant`, so the list items are options
 * rather than extra tab stops.
 */
export default function QuickActionsPalette({ isOpen, onClose, drafts }: QuickActionsPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sections = useMemo(() => buildQuickActionsSections({ query, drafts }), [query, drafts]);
  const actions = useMemo(() => flattenQuickActions(sections), [sections]);
  const indexByActionId = useMemo(() => new Map(actions.map((action, index) => [action.id, index])), [actions]);
  const safeActiveIndex = clampActiveIndex(activeIndex, actions.length);
  const activeAction = actions[safeActiveIndex] ?? null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuery('');
    setActiveIndex(0);
    document.body.classList.add('modal-open');
    inputRef.current?.focus();

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const runAction = (action: QuickAction) => {
    onClose();
    navigate(action.to);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => moveActiveIndex(clampActiveIndex(current, actions.length), delta, actions.length));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeAction) {
        runAction(activeAction);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[10vh] sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick actions"
        className="relative flex max-h-[min(70vh,32rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={LIST_ID}
            aria-activedescendant={activeAction ? `${LIST_ID}-${safeActiveIndex}` : undefined}
            aria-label="Search screens and recent drafts"
            placeholder="Search screens and recent drafts"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div id={LIST_ID} role="listbox" aria-label="Quick actions" className="min-h-0 flex-1 overflow-y-auto p-2">
          {sections.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No screens or drafts match that search.
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.label}
                </p>
                {section.actions.map((action) => {
                  const index = indexByActionId.get(action.id) ?? 0;
                  const isActive = index === safeActiveIndex;
                  const Icon = action.icon;

                  return (
                    <div
                      key={action.id}
                      id={`${LIST_ID}-${index}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => runAction(action)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                        isActive ? 'bg-primary/12 text-foreground' : 'text-muted-foreground hover:bg-background/60',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{action.label}</div>
                        <div className="truncate text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
