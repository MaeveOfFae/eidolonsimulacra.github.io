/**
 * How a per-page help entry is presented: what each section is called, how many
 * items a surface shows, and the slicing itself.
 *
 * This is data rather than markup because three surfaces render the same
 * `PageHelpEntry` — the web hover card, the web drawer, and mobile's tooltip —
 * and they had already drifted. The hover card cut key actions at three and
 * pitfalls at two while the drawer showed everything, and the two disagreed
 * about the section names ("What to do" / "Avoid" against "What to do on this
 * page" / "Common mistakes to avoid") for no reason beyond copy-paste. Copy and
 * limits live here; only the markup stays per-surface.
 *
 * Split out alongside `guides.ts` / `tours.ts` / `pages.ts`; `help.ts` is the
 * barrel over these modules.
 */
import type { HelpActionLink, PageHelpEntry } from './types.js';

/** `compact` is the popover/tooltip card, `full` is the drawer or a page. */
export type HelpEntryVariant = 'compact' | 'full';

/** `null` means "render every item" — what the `full` variant uses. */
export type HelpSectionLimit = number | null;

export interface HelpSectionLimits {
  keyActions: HelpSectionLimit;
  pitfalls: HelpSectionLimit;
  actions: HelpSectionLimit;
}

export const HELP_SECTION_LIMITS: Record<HelpEntryVariant, HelpSectionLimits> = {
  compact: { keyActions: 3, pitfalls: 2, actions: 2 },
  full: { keyActions: null, pitfalls: null, actions: null },
};

export interface HelpEntryLabels {
  keyActions: string;
  pitfalls: string;
  /** Only `full` prints a heading above its action links. */
  actions?: string;
}

export const HELP_ENTRY_LABELS: Record<HelpEntryVariant, HelpEntryLabels> = {
  compact: {
    keyActions: 'What to do',
    pitfalls: 'Avoid',
  },
  full: {
    keyActions: 'What to do on this page',
    pitfalls: 'Common mistakes to avoid',
    actions: 'Useful next steps',
  },
};

/** The kicker each surface prints above the entry title. */
export const HELP_ENTRY_EYEBROWS: Record<HelpEntryVariant, string> = {
  compact: 'Hover Help',
  full: 'Contextual Help',
};

export interface HelpEntrySections {
  keyActions: string[];
  pitfalls: string[];
  actions: HelpActionLink[];
}

function take<T>(items: readonly T[], limit: HelpSectionLimit): T[] {
  return limit === null ? [...items] : items.slice(0, limit);
}

/**
 * The three lists as the given surface should render them.
 *
 * Copies rather than views: the entries are module-level shared data, so a caller
 * that sorted or spliced the result in place would corrupt help for every other
 * surface in the process.
 */
export function buildHelpEntrySections(
  entry: Pick<PageHelpEntry, 'keyActions' | 'pitfalls' | 'actions'>,
  variant: HelpEntryVariant = 'full',
): HelpEntrySections {
  const limits = HELP_SECTION_LIMITS[variant];

  return {
    keyActions: take(entry.keyActions, limits.keyActions),
    pitfalls: take(entry.pitfalls, limits.pitfalls),
    actions: take(entry.actions, limits.actions),
  };
}
