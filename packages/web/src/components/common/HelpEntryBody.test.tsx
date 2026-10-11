import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HelpEntryBody from './HelpEntryBody';

/**
 * Longer than either variant renders, so a cap that stops applying shows up as a
 * visible item rather than as an arithmetic claim.
 */
const sections = {
  keyActions: [
    'Choose the template before refining the seed',
    'Keep the seed concrete',
    'Review the draft before exporting',
    'Never ship a draft you have not read',
  ],
  pitfalls: ['A missing API key fails generation.', 'Switching templates late invalidates review.'],
  actions: [
    { label: 'Open templates', to: '/templates' },
    { label: 'Open Settings', to: '/settings' },
    { label: 'Open library', to: '/drafts' },
  ],
};

function renderBody(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('HelpEntryBody', () => {
  it('shows every item and the drawer labels in the full variant', () => {
    renderBody(<HelpEntryBody sections={sections} />);

    expect(screen.getByRole('heading', { name: 'What to do on this page' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Common mistakes to avoid' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Useful next steps' })).toBeInTheDocument();

    sections.keyActions.forEach((action) => {
      expect(screen.getByText(action)).toBeInTheDocument();
    });
    sections.pitfalls.forEach((pitfall) => {
      expect(screen.getByText(pitfall)).toBeInTheDocument();
    });
    sections.actions.forEach((action) => {
      expect(screen.getByRole('link', { name: action.label })).toBeInTheDocument();
    });
  });

  it('caps the lists and renames the sections in the compact variant', () => {
    renderBody(<HelpEntryBody sections={sections} variant="compact" />);

    expect(screen.getByRole('heading', { name: 'What to do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Avoid' })).toBeInTheDocument();

    // The two labels the drawer uses are not the ones the card uses, and the card
    // has no heading above its action links.
    expect(screen.queryByRole('heading', { name: 'What to do on this page' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Useful next steps' })).toBeNull();

    // Third and fourth key actions, and the third link, are dropped.
    expect(screen.getByText('Choose the template before refining the seed')).toBeInTheDocument();
    expect(screen.queryByText('Never ship a draft you have not read')).toBeNull();
    expect(screen.getByRole('link', { name: 'Open templates' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open library' })).toBeNull();
  });

  it('renders the leading links the caller adds, before the entry actions', () => {
    renderBody(<HelpEntryBody sections={sections} leadingLinks={[{ label: 'Open Help Center', to: '/help' }]} />);

    const links = screen.getAllByRole('link').map((link) => link.textContent);
    expect(links[0]).toBe('Open Help Center');
    expect(links).toEqual(['Open Help Center', 'Open templates', 'Open Settings', 'Open library']);
  });

  it('renders the caller-owned control first in the compact action row', () => {
    renderBody(
      <HelpEntryBody
        sections={sections}
        variant="compact"
        extraAction={<button type="button">Start guided tour</button>}
      />,
    );

    const row = screen.getByRole('button', { name: 'Start guided tour' }).parentElement;
    expect(row).not.toBeNull();
    expect(row?.firstElementChild).toBe(screen.getByRole('button', { name: 'Start guided tour' }));
    expect(row?.textContent).toContain('Open templates');
  });

  it('reports a followed link so the caller can close itself', () => {
    const onNavigate = vi.fn();
    renderBody(
      <HelpEntryBody
        sections={sections}
        leadingLinks={[{ label: 'Open Help Center', to: '/help' }]}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open Help Center' }));
    fireEvent.click(screen.getByRole('link', { name: 'Open Settings' }));

    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('renders nothing at all for an empty entry, rather than empty headings', () => {
    const view = renderBody(<HelpEntryBody sections={{ keyActions: [], pitfalls: [], actions: [] }} />);

    expect(view.container).toBeEmptyDOMElement();
  });
});
