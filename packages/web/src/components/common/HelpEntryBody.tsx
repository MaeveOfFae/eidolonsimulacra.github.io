import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, TriangleAlert } from 'lucide-react';
import {
  HELP_ENTRY_LABELS,
  buildHelpEntrySections,
  type HelpActionLink,
  type HelpEntryVariant,
  type PageHelpEntry,
} from '../../lib/help';

/**
 * The body of a per-page help entry: what to do, what to avoid, and the links out.
 *
 * Extracted because three renderers had grown apart while claiming to show the same
 * thing — the drawer showed every item and called its sections "What to do on this
 * page" / "Common mistakes to avoid", the hover card capped the lists and called them
 * "What to do" / "Avoid", and neither fact was decided anywhere. The copy, the
 * per-variant names and the item caps now live in `@char-gen/shared`'s
 * `help/presentation`, so the drawer, the popover card and mobile's tooltip cannot
 * disagree; this file owns the markup and the two variants' classes.
 *
 * The variants differ in more than size, deliberately:
 *
 *   - `full` labels its action row ("Useful next steps") and shows every item;
 *   - `compact` caps the lists, drops the action-row heading, and accepts an
 *     `extraAction` slot for the popover's own control.
 *
 * Two props are caller-specific pieces of the action row, and only one caller uses
 * each: `leadingLinks` for links the drawer adds ahead of the entry's own actions, and
 * `extraAction` for a control the popover owns. Everything else is shared.
 *
 * Spacing between the sections belongs to the caller: the drawer's scroll container is
 * `space-y-5` and relies on these being direct children, which is also why this
 * component returns a fragment rather than a wrapper element. The compact variant
 * carries its own top margins because the popover card is a plain flow.
 */
interface HelpEntryBodyProps {
  /** A full entry, or just the three lists — the popover passes them as separate props. */
  sections: Pick<PageHelpEntry, 'keyActions' | 'pitfalls' | 'actions'>;
  variant?: HelpEntryVariant;
  /** Links rendered before the entry's own actions. */
  leadingLinks?: HelpActionLink[];
  /** A control the caller owns, rendered first in the action row. */
  extraAction?: ReactNode;
  /** Called when any link is followed, so the caller can close itself. */
  onNavigate?: () => void;
}

/** Every variant carries every key, so `styles.x` needs no union narrowing. */
interface HelpEntryStyles {
  keyActionsSection: string;
  pitfallsSection: string;
  actionsSection: string;
  keyActionsHeading: string;
  pitfallsHeading: string;
  actionsHeading: string;
  headingRow: string;
  headingIcon: string;
  list: string;
  item: string;
  dot: string;
  itemText: string;
  actionsRow: string;
  actionLink: string;
  actionIcon: string;
}

const VARIANT_STYLES: Record<HelpEntryVariant, HelpEntryStyles> = {
  compact: {
    keyActionsSection: 'mt-4 rounded-xl border border-border/60 bg-background/40 p-3',
    pitfallsSection: 'mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3',
    actionsSection: '',
    keyActionsHeading: 'text-xs font-semibold uppercase tracking-[0.14em] text-foreground',
    pitfallsHeading: 'text-xs font-semibold uppercase tracking-[0.14em]',
    actionsHeading: '',
    headingRow: 'flex items-center gap-2 text-foreground',
    headingIcon: 'h-3.5 w-3.5 text-warning',
    list: 'mt-2 space-y-2',
    item: 'flex items-start gap-2 text-xs text-muted-foreground',
    dot: 'mt-1.5 h-1.5 w-1.5 rounded-full',
    itemText: 'leading-5',
    actionsRow: 'mt-4 flex flex-wrap gap-2',
    actionLink:
      'inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary',
    actionIcon: 'h-3 w-3',
  },
  full: {
    keyActionsSection: 'rounded-lg border border-border/60 bg-background/40 p-3.5',
    pitfallsSection: 'rounded-lg border border-warning/30 bg-warning/10 p-3.5',
    actionsSection: 'rounded-lg border border-border/60 bg-background/40 p-3.5',
    keyActionsHeading: 'font-semibold',
    pitfallsHeading: 'font-semibold',
    actionsHeading: 'font-semibold text-foreground',
    headingRow: 'flex items-center gap-2 text-foreground',
    headingIcon: 'h-4 w-4 text-warning',
    list: 'mt-3 space-y-3',
    item: 'flex items-start gap-3 text-sm text-muted-foreground',
    dot: 'mt-2 h-1.5 w-1.5 rounded-full',
    itemText: 'leading-6',
    actionsRow: 'mt-3 flex flex-wrap gap-2.5',
    actionLink:
      'inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary',
    actionIcon: 'h-4 w-4',
  },
};

export default function HelpEntryBody({
  sections,
  variant = 'full',
  leadingLinks = [],
  extraAction,
  onNavigate,
}: HelpEntryBodyProps) {
  const resolved = buildHelpEntrySections(sections, variant);
  const labels = HELP_ENTRY_LABELS[variant];
  const styles = VARIANT_STYLES[variant];
  const compact = variant === 'compact';
  const Heading = compact ? 'h4' : 'h3';

  // Prefixed keys because the two lists can hold the same target: the drawer adds its
  // own "Open Help Center" link, and several entries already carry one.
  const actionLinks = [
    ...leadingLinks.map((link) => ({ link, key: `leading-${link.to}` })),
    ...resolved.actions.map((link) => ({ link, key: `action-${link.to}` })),
  ];

  return (
    <>
      {/* Key actions, hidden when empty: a heading with nothing under it announces that
          help exists for this page and then says nothing. */}
      {resolved.keyActions.length > 0 && (
        <section className={styles.keyActionsSection}>
          {compact ? (
            <Heading className={styles.keyActionsHeading}>{labels.keyActions}</Heading>
          ) : (
            <div className={styles.headingRow}>
              <BookOpen className="h-4 w-4 text-primary" />
              <Heading className={styles.keyActionsHeading}>{labels.keyActions}</Heading>
            </div>
          )}
          <div className={styles.list}>
            {resolved.keyActions.map((action) => (
              <div key={action} className={styles.item}>
                <div className={`${styles.dot} bg-primary`} />
                <p className={styles.itemText}>{action}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {resolved.pitfalls.length > 0 && (
        <section className={styles.pitfallsSection}>
          <div className={styles.headingRow}>
            <TriangleAlert className={styles.headingIcon} />
            <Heading className={styles.pitfallsHeading}>{labels.pitfalls}</Heading>
          </div>
          <div className={styles.list}>
            {resolved.pitfalls.map((pitfall) => (
              <div key={pitfall} className={styles.item}>
                <div className={`${styles.dot} bg-warning`} />
                <p className={styles.itemText}>{pitfall}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The action row. Only the full variant has a heading for it and a card to sit
          in; the compact card renders the links inline under the sections. */}
      {(actionLinks.length > 0 || extraAction) &&
        (compact ? (
          <div className={styles.actionsRow}>
            {extraAction}
            {actionLinks.map(({ link, key }) => (
              <HelpActionLink key={key} link={link} styles={styles} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <section className={styles.actionsSection}>
            <Heading className={styles.actionsHeading}>{labels.actions}</Heading>
            <div className={styles.actionsRow}>
              {extraAction}
              {actionLinks.map(({ link, key }) => (
                <HelpActionLink key={key} link={link} styles={styles} onNavigate={onNavigate} />
              ))}
            </div>
          </section>
        ))}
    </>
  );
}

function HelpActionLink({ link, styles, onNavigate }: HelpActionLinkProps) {
  return (
    <Link to={link.to} onClick={onNavigate} className={styles.actionLink}>
      {link.label}
      <ArrowRight className={styles.actionIcon} />
    </Link>
  );
}

interface HelpActionLinkProps {
  link: HelpActionLink;
  styles: HelpEntryStyles;
  onNavigate?: () => void;
}
