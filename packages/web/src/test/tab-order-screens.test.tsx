import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import { assertTabOrderAfter, findUnnamedTabStops, formatTabStops } from './tab-order';
import SeedGenerator from '@/components/generation/SeedGenerator';
import Validation from '@/components/validation/Validation';
import TokenOptimization from '@/components/optimization/TokenOptimization';
import Similarity from '@/components/similarity/Similarity';
import Offspring from '@/components/offspring/Offspring';
import Lineage from '@/components/lineage/Lineage';
import Timelines from '@/components/timelines/Timelines';
import Events from '@/components/worlds/Events';
import Worlds from '@/components/worlds/Worlds';
import Blueprints from '@/components/blueprints/Blueprints';
import Templates from '@/components/templates/Templates';

/**
 * One permissive API mock for every screen in this file.
 *
 * The tab-order check only needs the screen to *render*: what it reads is the DOM
 * order of whatever is focusable, and empty data still renders the real controls.
 * A single mock here is cheaper than eleven bespoke harnesses and cannot drift
 * into asserting a mock's shape instead of the screen's markup.
 */
vi.mock('@/lib/api', () => {
  const list = vi.fn(async () => []);
  const object = vi.fn(async () => ({}));

  return {
    api: {
      analyzeSimilarity: object,
      createDraftSnapshot: object,
      deleteBlueprint: object,
      deleteTemplate: object,
      duplicateBlueprint: object,
      duplicateTemplate: object,
      exportTemplate: object,
      generateOffspringSeed: object,
      generateSeeds: object,
      getBlueprint: object,
      getBlueprints: vi.fn(async () => ({ core: [], system: [], templates: { local: [] }, examples: [] })),
      getDrafts: vi.fn(async () => ({ drafts: [], stats: { total_drafts: 0, favorites: 0 }, filters: {} })),
      getLineage: vi.fn(async () => ({
        nodes: [],
        // `roots` is required: the tree builder calls `data.roots.forEach`.
        roots: [],
        stats: { generations: 0, root_characters: 0, total_characters: 0 },
      })),
      getOriginalBlueprintContent: object,
      getTemplateBlueprintContents: object,
      getTemplates: list,
      getWorld: object,
      getWorldCharacterDraftLinks: vi.fn(async () => ({ links: [] })),
      getWorldRelationshipAuditIssues: vi.fn(async () => ({ issues: [] })),
      getWorlds: vi.fn(async () => ({ worlds: [] })),
      hasBlueprintOverride: object,
      importTemplate: object,
      optimizeText: object,
      resetBlueprint: object,
      updateAsset: object,
      updateMetadata: object,
      validateDraft: object,
      validatePath: object,
      validateTemplate: object,
    },
  };
});

vi.mock('@/components/common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

vi.mock('@/components/common/GuidedTourContext', () => ({
  useGuidedTour: () => ({
    activeStepIndex: 0,
    activeTourId: null,
    closeTour: vi.fn(),
    goToCurrentStep: vi.fn(),
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

type OrderingAnchor = [before: string, after: string];

const SCREENS: Array<[string, ComponentType, OrderingAnchor[]]> = [
  ['Seed Generator', SeedGenerator, []],
  ['Validation', Validation, [['Validate path', 'Draft path']]],
  ['Token Optimization', TokenOptimization, []],
  ['Similarity', Similarity, []],
  ['Offspring', Offspring, []],
  ['Lineage', Lineage, []],
  ['Timelines', Timelines, []],
  ['Events', Events, []],
  ['Worlds', Worlds, []],
  ['Blueprints', Blueprints, []],
  ['Templates', Templates, []],
];

function renderScreen(Page: ComponentType) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Page />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe.each(SCREENS)('%s tab order', (name, Page, anchors) => {
  it('renders, keeps every stop named, and reads in visual order', async () => {
    const view = renderScreen(Page);

    // Let the initial queries settle so every conditional region has rendered.
    await vi.waitFor(() => {
      expect((view.container.textContent ?? '').trim().length).toBeGreaterThan(0);
    });

    const sequence = formatTabStops();

    expect(findUnnamedTabStops(sequence)).toEqual([]);

    for (const [before, after] of anchors) {
      assertTabOrderAfter(sequence, before, after);
    }
  });
});
