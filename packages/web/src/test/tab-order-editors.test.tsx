import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ComponentType, ReactNode } from 'react';
import { findUnnamedTabStops, formatTabStops } from './tab-order';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import BlueprintEditor from '@/components/blueprints/BlueprintEditor';
import DataManager from '@/components/common/DataManager';
import TokenizerThemeStudio from '@/components/themes/TokenizerThemeStudio';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  const object = vi.fn(async () => ({}));

  return {
    // Spread the real module so exported constants (`THEMES_SYNCED_EVENT`, event
    // names) keep working, and stub only the API surface.
    ...actual,
    api: {
      deleteBlueprint: object,
      duplicateBlueprint: object,
      getBlueprint: vi.fn(async () => ({
        content: '# Generator\n\nBody',
        description: 'Builds the system prompt',
        name: 'Generator',
        path: 'system/generator.md',
      })),
      getBlueprints: vi.fn(async () => ({ core: [], examples: [], system: [], templates: { local: [] } })),
      getConfig: vi.fn(async () => ({ model: 'gpt-4o', provider: 'openai' })),
      // The theme provider seeds its queries from snapshots, so the harness needs
      // those too or it throws before anything renders.
      getConfigSnapshot: () => ({ model: 'gpt-4o', provider: 'openai' }),
      getThemesSnapshot: () => [],
      getOriginalBlueprintContent: vi.fn(async () => ({ content: '# Generator\n\nBody' })),
      getTemplates: vi.fn(async () => []),
      getThemes: vi.fn(async () => []),
      hasBlueprintOverride: vi.fn(async () => false),
      resetBlueprint: object,
      updateBlueprint: object,
    },
  };
});

vi.mock('@/components/common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

function renderAt(entry: string, element: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        {/* The tokenizer previews themes, so it needs the provider around it. */}
        <ThemeProvider>
          <Routes>
            <Route path="/blueprints/edit/*" element={element} />
            <Route path="*" element={element} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const SCREENS: Array<[string, string, ComponentType]> = [
  ['Blueprint Editor', '/blueprints/edit/system/generator.md', BlueprintEditor],
  ['Data Manager', '/data', DataManager],
  ['Tokenizer', '/tokenizer', TokenizerThemeStudio],
];

describe.each(SCREENS)('%s tab order', (name, entry, Page) => {
  it('renders and keeps every tab stop named', async () => {
    const view = renderAt(entry, <Page />);

    await vi.waitFor(() => {
      expect((view.container.textContent ?? '').trim().length).toBeGreaterThan(50);
    });

    expect(findUnnamedTabStops(formatTabStops())).toEqual([]);
  });
});
