import { describe, expect, it } from 'vitest';
import { infoPages } from '@char-gen/shared';
import type { HomeStackParamList, RootTabParamList } from '../types/navigation';
import {
  MOBILE_TAB_DESTINATIONS,
  isMobileTabDestination,
  mapWebRouteToMobileDestination,
  type MobileHomeStackDestination,
  type MobileTabDestination,
} from './route-targets';

/**
 * Compile-time guard: every destination this module can navigate to must be a
 * real route. Removing or renaming a screen fails `typecheck:mobile` here
 * instead of failing at runtime inside a screen.
 */
type AssertAssignable<_T extends U, U> = true;
type TabDestinationsAreRealRoutes = AssertAssignable<MobileTabDestination, keyof RootTabParamList>;
type HomeStackDestinationsAreRealRoutes = AssertAssignable<MobileHomeStackDestination, keyof HomeStackParamList>;
const compileTimeRouteGuards: [TabDestinationsAreRealRoutes, HomeStackDestinationsAreRealRoutes] = [true, true];

describe('mapWebRouteToMobileDestination', () => {
  it('maps the tab routes shared help and release notes link to', () => {
    expect(mapWebRouteToMobileDestination('/')).toBe('Home');
    expect(mapWebRouteToMobileDestination('/home')).toBe('Home');
    expect(mapWebRouteToMobileDestination('/generate')).toBe('Generate');
    expect(mapWebRouteToMobileDestination('/templates')).toBe('Templates');
    expect(mapWebRouteToMobileDestination('/drafts')).toBe('Drafts');
    expect(mapWebRouteToMobileDestination('/settings')).toBe('Settings');
  });

  it('maps web routes onto Home-stack screens mobile can open', () => {
    expect(mapWebRouteToMobileDestination('/help')).toBe('HelpCenter');
    expect(mapWebRouteToMobileDestination('/whats-new')).toBe('WhatsNew');
    expect(mapWebRouteToMobileDestination('/themes')).toBe('ThemePicker');
    expect(mapWebRouteToMobileDestination('/validation')).toBe('Validation');
    expect(mapWebRouteToMobileDestination('/blueprints')).toBe('Blueprints');
    expect(mapWebRouteToMobileDestination('/seed-generator')).toBe('SeedGenerator');
    expect(mapWebRouteToMobileDestination('/lineage')).toBe('Lineage');
    expect(mapWebRouteToMobileDestination('/tokenizer')).toBe('TokenOptimization');
    expect(mapWebRouteToMobileDestination('/optimize')).toBe('TokenOptimization');
    expect(mapWebRouteToMobileDestination('/batch')).toBe('BatchGenerate');
    expect(mapWebRouteToMobileDestination('/similarity')).toBe('Compare');
    expect(mapWebRouteToMobileDestination('/offspring')).toBe('Offspring');
  });

  it('maps every browser info route onto its mobile info screen', () => {
    expect(mapWebRouteToMobileDestination('/about')).toBe('About');
    expect(mapWebRouteToMobileDestination('/community')).toBe('Community');
    expect(mapWebRouteToMobileDestination('/license')).toBe('License');
    expect(mapWebRouteToMobileDestination('/terms')).toBe('Terms');
    expect(mapWebRouteToMobileDestination('/privacy')).toBe('Privacy');
    expect(mapWebRouteToMobileDestination('/security')).toBe('Security');
    expect(mapWebRouteToMobileDestination('/code-of-conduct')).toBe('CodeOfConduct');
  });

  it('resolves nested routes to the closest reachable parent screen', () => {
    expect(mapWebRouteToMobileDestination('/drafts/abc-123')).toBe('Drafts');
    expect(mapWebRouteToMobileDestination('/blueprints/edit/system/generator.md')).toBe('Blueprints');
  });

  it('returns null for routes with no mobile destination, external URLs, and empty input', () => {
    // `/data` is the browser Data Manager; mobile has no equivalent surface yet.
    expect(mapWebRouteToMobileDestination('/data')).toBeNull();
    expect(mapWebRouteToMobileDestination('/help/tours')).toBeNull();
    expect(mapWebRouteToMobileDestination('https://example.com')).toBeNull();
    expect(mapWebRouteToMobileDestination('')).toBeNull();
    expect(mapWebRouteToMobileDestination('   ')).toBeNull();
  });

  it('tolerates surrounding whitespace and casing', () => {
    expect(mapWebRouteToMobileDestination('  /Themes ')).toBe('ThemePicker');
  });
});

describe('isMobileTabDestination', () => {
  it('separates tab destinations from Home-stack destinations', () => {
    MOBILE_TAB_DESTINATIONS.forEach((destination) => {
      expect(isMobileTabDestination(destination)).toBe(true);
    });

    expect(isMobileTabDestination('HelpCenter')).toBe(false);
    expect(isMobileTabDestination('ThemePicker')).toBe(false);
  });
});

describe('destination catalogue', () => {
  it('keeps every mapped destination assignable to a real route', () => {
    // The real assertion is enforced by `typecheck:mobile`; referencing the
    // guard here keeps it from being dropped as dead code.
    expect(compileTimeRouteGuards).toEqual([true, true]);
  });

  it('reaches every info page the shared module declares', () => {
    // If shared ever adds an info page, this fails before the mobile app can
    // ship a screen that nothing links to.
    infoPages.forEach((page) => {
      expect(mapWebRouteToMobileDestination(page.webPath)).not.toBeNull();
    });
  });
});
