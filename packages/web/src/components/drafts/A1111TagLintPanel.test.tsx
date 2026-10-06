import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { A1111LintIssue } from '@char-gen/shared';
import A1111TagLintPanel from './A1111TagLintPanel';
import { lintA1111Asset } from '@/lib/drafts/a1111-tag-lint';

vi.mock('@/lib/drafts/a1111-tag-lint', () => ({
  lintA1111Asset: vi.fn(),
}));

const mockedLint = vi.mocked(lintA1111Asset);

const CONTENT = '1girl, fiery_redhead\nschool_uniform\nindoors, night\nstanding\nportrait';

const ISSUES: A1111LintIssue[] = [
  {
    severity: 'error',
    code: 'line-count',
    message: 'Expected exactly 5 prompt lines (person, clothes, location, action, anchor); found 5.',
    line: 1,
  },
  {
    severity: 'warning',
    code: 'pseudo-tag',
    message: '"fiery_redhead" is an invented pseudo-tag; Danbooru\'s term is "red_hair".',
    line: 1,
    column: 8,
    tag: 'fiery_redhead',
    suggestion: 'red_hair',
  },
];

function renderPanel(onApplyFixes = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <A1111TagLintPanel content={CONTENT} onApplyFixes={onApplyFixes} />
    </QueryClientProvider>,
  );
  return { onApplyFixes, ...view };
}

describe('A1111TagLintPanel', () => {
  it('renders the lint summary and findings once the index loads', async () => {
    mockedLint.mockResolvedValue({ issues: ISSUES, tier: 'full', isReady: true, error: null });

    renderPanel();
    expect(await screen.findByText(/1 error · 1 warning/)).toBeInTheDocument();
    expect(screen.getByText('full index')).toBeInTheDocument();
    expect(screen.getByText(/fiery_redhead/)).toBeInTheDocument();
  });

  it('applies the mechanical fixes through the parent callback', async () => {
    mockedLint.mockResolvedValue({ issues: ISSUES, tier: 'full', isReady: true, error: null });
    const onApplyFixes = vi.fn();

    renderPanel(onApplyFixes);
    const applyButton = await screen.findByRole('button', { name: /apply 1 fix/i });
    fireEvent.click(applyButton);

    await waitFor(() => expect(onApplyFixes).toHaveBeenCalledTimes(1));
    expect(onApplyFixes.mock.calls[0]![0].split('\n')[0]).toBe('1girl, red_hair');
  });

  it('shows the pass state when there are no findings', async () => {
    mockedLint.mockResolvedValue({ issues: [], tier: 'core', isReady: true, error: null });

    renderPanel();
    expect(await screen.findByText(/Tags pass the Danbooru lint/)).toBeInTheDocument();
    expect(screen.getByText('bundled core index')).toBeInTheDocument();
  });
});
