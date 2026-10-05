import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import { findUnnamedTabStops, formatTabStops } from './tab-order';
import About from '@/components/info/About';
import CommunityPage from '@/components/info/CommunityPage';
import CodeOfConductPage from '@/components/info/CodeOfConductPage';
import DownloadPage from '@/components/info/DownloadPage';
import HelpCenterPage from '@/components/info/HelpCenterPage';
import LicensePage from '@/components/info/LicensePage';
import PrivacyPage from '@/components/info/PrivacyPage';
import SecurityPage from '@/components/info/SecurityPage';
import TermsPage from '@/components/info/TermsPage';
import WhatsNewPage from '@/components/info/WhatsNewPage';

vi.mock('@/components/common/GuidedTourContext', () => ({
  useGuidedTour: () => ({
    activeStepIndex: 0,
    activeTourId: null,
    closeTour: vi.fn(),
    goToCurrentStep: vi.fn(),
    // The full helpState shape: Help Center reads `dismissed_tips.length`, and a
    // partial mock fails there rather than at a place worth debugging.
    helpState: {
      completed_guides: [],
      completed_tours: [],
      dismissed_tips: [],
      first_run_completed: true,
      show_inline_tips: true,
    },
    isTourCompleted: () => true,
    restartTour: vi.fn(),
    startTour: vi.fn(),
  }),
}));

/**
 * The info and legal pages are data-driven from the shared modules, so they need
 * no API mocks — which makes them cheap to cover in one file. What they need is
 * the check no other test makes: that every focusable thing on them announces as
 * something, in an order nobody has reordered with CSS.
 */
const PAGES: Array<[string, ComponentType]> = [
  ['About', About],
  ['Download', DownloadPage],
  ['Help Center', HelpCenterPage],
  ['Community', CommunityPage],
  ["What's New", WhatsNewPage],
  ['License', LicensePage],
  ['Terms', TermsPage],
  ['Privacy', PrivacyPage],
  ['Security', SecurityPage],
  ['Code of Conduct', CodeOfConductPage],
];

describe.each(PAGES)('%s page tab order', (name, Page) => {
  it('renders without an unnamed tab stop', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Page />
      </MemoryRouter>,
    );

    const sequence = formatTabStops();

    // The page rendered real content...
    expect((document.body.textContent ?? '').trim().length).toBeGreaterThan(200);

    // ...and every stop on it announces as something. Note that License, Terms and
    // Privacy are plain documents with nothing focusable at all, which is why this
    // does not assert a non-empty sequence.
    expect(findUnnamedTabStops(sequence)).toEqual([]);
  });
});

describe('info page link targets', () => {
  it('points every internal link at a catalog route', async () => {
    const { findRouteEntry } = await import('@/lib/navigation/route-catalog');

    render(
      <MemoryRouter initialEntries={['/about']}>
        <About />
      </MemoryRouter>,
    );

    const hrefs = [
      ...new Set(
        screen
          .getAllByRole('link')
          .map((link) => link.getAttribute('href') ?? '')
          .filter((href) => href.startsWith('/')),
      ),
    ];

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(findRouteEntry(href), `About links to ${href}, which has no catalog entry`).not.toBeNull();
    }
  });
});
