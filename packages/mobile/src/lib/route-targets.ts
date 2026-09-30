/**
 * Web-route → mobile destination mapping.
 *
 * Shared help and release-note data store link targets as browser routes
 * (`/settings`, `/blueprints`, …). Mobile only owns a subset of those
 * destinations, so this module is the single place that decides what a link
 * may deep-link into. Anything unmapped returns null and the screens render it
 * as inert text rather than pretending the link does something.
 */

/** Mobile tabs a link can deep-link into (mirrors `RootTabParamList`). */
export type MobileTabDestination = 'Home' | 'Generate' | 'Drafts' | 'Templates' | 'Settings';

/** Home-stack screens a link can deep-link into (mirrors `HomeStackParamList`). */
export type MobileHomeStackDestination =
  | 'HelpCenter'
  | 'About'
  | 'Download'
  | 'Community'
  | 'License'
  | 'Terms'
  | 'Privacy'
  | 'Security'
  | 'CodeOfConduct'
  | 'SeedGenerator'
  | 'LorebookGenerator'
  | 'WhatsNew'
  | 'ThemePicker'
  | 'Validation'
  | 'TokenOptimization'
  | 'Lineage'
  | 'Blueprints'
  | 'BatchGenerate'
  | 'Compare'
  | 'Offspring';

export type MobileDestination = MobileTabDestination | MobileHomeStackDestination;

export const MOBILE_TAB_DESTINATIONS: readonly MobileTabDestination[] = [
  'Home',
  'Generate',
  'Drafts',
  'Templates',
  'Settings',
];

/**
 * Exact web routes. Only destinations that can be reached without navigation
 * params are listed: a target like `/blueprints/edit/<path>` cannot be honoured
 * from a plain link, so it resolves through the prefix table to the list screen
 * instead.
 */
const EXACT_ROUTE_TARGETS: Record<string, MobileDestination> = {
  '/': 'Home',
  '/home': 'Home',
  '/generate': 'Generate',
  '/templates': 'Templates',
  '/drafts': 'Drafts',
  '/settings': 'Settings',
  '/help': 'HelpCenter',
  '/about': 'About',
  '/download': 'Download',
  '/community': 'Community',
  '/license': 'License',
  '/terms': 'Terms',
  '/privacy': 'Privacy',
  '/security': 'Security',
  '/code-of-conduct': 'CodeOfConduct',
  '/whats-new': 'WhatsNew',
  '/themes': 'ThemePicker',
  '/validation': 'Validation',
  '/blueprints': 'Blueprints',
  '/seed-generator': 'SeedGenerator',
  '/lineage': 'Lineage',
  '/tokenizer': 'TokenOptimization',
  '/optimize': 'TokenOptimization',
  '/batch': 'BatchGenerate',
  '/similarity': 'Compare',
  '/offspring': 'Offspring',
};

/** Nested web routes that should land on the closest reachable parent screen. */
const PREFIX_ROUTE_TARGETS: readonly { prefix: string; destination: MobileDestination }[] = [
  { prefix: '/drafts/', destination: 'Drafts' },
  { prefix: '/blueprints/', destination: 'Blueprints' },
];

export function isMobileTabDestination(destination: MobileDestination): destination is MobileTabDestination {
  return (MOBILE_TAB_DESTINATIONS as readonly string[]).includes(destination);
}

/**
 * Maps a shared link target onto a mobile destination. Unknown routes — browser
 * info pages mobile does not ship, external URLs, empty strings — return null.
 */
export function mapWebRouteToMobileDestination(to: string): MobileDestination | null {
  const normalized = to.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const exact = EXACT_ROUTE_TARGETS[normalized];
  if (exact) {
    return exact;
  }

  const prefixMatch = PREFIX_ROUTE_TARGETS.filter((entry) => normalized.startsWith(entry.prefix)).sort(
    (left, right) => right.prefix.length - left.prefix.length,
  )[0];

  return prefixMatch?.destination ?? null;
}

/**
 * Navigates to a resolved destination.
 *
 * React Navigation types `navigate` per route name, so a union spanning two
 * navigators cannot be passed through directly. Passing the screen's typed
 * `navigation` prop as `unknown` and casting once here keeps this table the
 * single source of truth instead of repeating a long switch in every screen —
 * and `route-targets.test.ts` fails `typecheck:mobile` if a destination stops
 * being a real route, so the cast cannot hide a typo.
 */
export function navigateToMobileDestination(navigation: unknown, destination: MobileDestination): void {
  const navigator = navigation as { navigate: (name: MobileDestination) => void };
  navigator.navigate(destination);
}
