/**
 * Honest roadmap data for the in-app "Upcoming Updates" surface.
 *
 * `status` describes how much of the area is actually delivered today:
 * - `shipped`  the area is live end to end; `items` is typically empty
 * - `partial`  core of the area is live, specific work below is still outstanding
 * - `planned`  nothing in the area has shipped yet
 *
 * `items` lists ONLY outstanding work. Shipped capability belongs in README.md.
 * Keep `ownerFiles` limited to files that exist in the repo.
 */
export type RoadmapStatus = 'shipped' | 'partial' | 'planned';

export interface RoadmapGroup {
  id: string;
  title: string;
  status: RoadmapStatus;
  ownerFiles: string[];
  items: string[];
}

export const roadmapGroups: RoadmapGroup[] = [
  {
    id: 'generation-workflow',
    title: 'Generation Workflow',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/generation/Generation.tsx',
      'packages/web/src/components/generation/GenerationProgress.tsx',
      'packages/web/src/components/generation/SeedGenerator.tsx',
      'packages/web/src/components/batch/BatchGenerate.tsx',
      'packages/web/src/components/compare/Compare.tsx',
      'packages/web/src/lib/services/generation.ts',
    ],
    items: [
      'Comparison runs across multiple seeds at once rather than one seed per run',
      'Batch run history with priorities and retry policies',
      'Assistant suggestions for strengthening weak or underspecified seeds',
      'Offline/local-model optimized workflow presets',
    ],
  },
  {
    id: 'image-pipeline',
    title: 'Image Pipeline',
    status: 'partial',
    ownerFiles: [
      'packages/shared/src/a1111/tag-linter.ts',
      'packages/shared/src/comfyui/client.ts',
      'packages/web/src/components/drafts/A1111TagLintPanel.tsx',
      'packages/web/src/components/drafts/ComfyRenderPanel.tsx',
      'packages/web/src/components/settings/SettingsImagePipelineSection.tsx',
    ],
    items: [
      'Mobile linting surface running on the bundled core Danbooru index',
      'Render history and a saved-render gallery attached to each draft',
      'Seed pinning and variation batches launched from the render panel',
      'WebSocket progress streaming during renders instead of history polling',
      'Render outputs saved as draft assets rather than living only in the ComfyUI output folder',
    ],
  },
  {
    id: 'review-and-editing',
    title: 'Review and Editing',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/drafts/Review.tsx',
      'packages/web/src/components/drafts/Drafts.tsx',
      'packages/web/src/components/drafts/DraftComparisonPanel.tsx',
      'packages/web/src/components/drafts/ReviewChecklistPanel.tsx',
      'packages/web/src/components/drafts/VersionHistoryPanel.tsx',
    ],
    items: [
      'Provenance view showing which upstream assets influenced each generated asset',
      'Asset health scoring based on completeness, consistency, and format compliance',
      'Draft branching system for exploring alternate versions of the same character',
      'Focus mode for reviewing one asset with its immediate dependencies visible',
      'Assistant tools for rewriting a single asset while preserving established canon',
      'Read-only review links for sharing a draft state without enabling edits',
    ],
  },
  {
    id: 'templates-and-blueprints',
    title: 'Templates and Blueprints',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/templates/Templates.tsx',
      'packages/web/src/components/templates/TemplateWizard.tsx',
      'packages/web/src/components/templates/TemplateComparisonPanel.tsx',
      'packages/web/src/components/blueprints/Blueprints.tsx',
      'packages/web/src/components/blueprints/BlueprintEditor.tsx',
      'packages/web/src/components/blueprints/BlueprintLintPanel.tsx',
      'packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx',
    ],
    items: [
      'Template migration assistant for updating older drafts to newer template versions',
      'Visual dependency graph for template assets and generation order',
      'Template marketplace or import/export bundle format for sharing templates',
      'Template starter kits for common character-card formats and content styles',
      'Expanded blueprint preview sandbox with prior-asset context sets and reusable test cases',
      'Prompt experimentation lab for testing orchestrator and blueprint variants',
      'Shared blueprint snippet library for reusable sections and control blocks',
    ],
  },
  {
    id: 'draft-library-and-organization',
    title: 'Draft Library and Organization',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/drafts/Drafts.tsx',
      'packages/web/src/components/drafts/DraftListSidebar.tsx',
      'packages/web/src/components/drafts/DraftDuplicatesPanel.tsx',
    ],
    items: [
      'Semantic search across draft content, not just metadata',
      'Auto-tagging suggestions based on generated content',
      'Custom foldering or collection system beyond saved searches',
      'Recently viewed and recently edited lists for faster navigation',
      'Pinning beyond draft favourites, for templates and presets',
      'Custom metadata fields for project-specific cataloging',
      'Library summary dashboard with counts by template, mode, and generation source',
    ],
  },
  {
    id: 'canon-worldbuilding-and-relationships',
    title: 'Canon, Worldbuilding, and Relationships',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/lineage/Lineage.tsx',
      'packages/web/src/components/similarity/Similarity.tsx',
      'packages/web/src/components/offspring/Offspring.tsx',
      'packages/web/src/components/worlds/Worlds.tsx',
      'packages/web/src/components/worlds/WorldDetailEditorPanel.tsx',
      'packages/web/src/components/timelines/Timelines.tsx',
    ],
    items: [
      'Canon library module for curated, reusable setting material',
      'Worldbook module for exportable setting entries',
      'Universe notes module for free-form canon context',
      'Canon lock system for facts that should remain stable across derivative drafts',
      'Relationship map visualization inside the world detail editor',
      'Family tree and affiliation visualizations for related characters',
      'Cross-draft continuity assistant for keeping related characters aligned',
      'Event calendar with in-world and real-world date tracking',
      'World event storage, ordering, and editing',
      'Continuity checking for canon conflicts across drafts',
    ],
  },
  {
    id: 'export-and-publishing',
    title: 'Export and Publishing',
    status: 'partial',
    ownerFiles: ['packages/web/src/components/common/ExportModal.tsx', 'packages/shared/src/export/presets.ts'],
    items: [
      'Preset preview mode showing exactly which files and names an export will produce',
      'Platform capability matrix for checking which presets work with which templates',
      'Character pack publishing flow for producing a polished shareable bundle',
      'Export profiles with saved naming, packaging, and metadata rules',
      'One-click export bundles for common targets and sharing destinations',
      'Shareable web preview page for a generated character pack',
      'Metadata manifest export for preserving provenance, model info, and template info alongside assets',
      'Export dry-run mode that shows mapped outputs before creating files',
    ],
  },
  {
    id: 'analysis-and-evaluation',
    title: 'Analysis and Evaluation',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/similarity/Similarity.tsx',
      'packages/web/src/components/validation/Validation.tsx',
      'packages/web/src/components/insights/Insights.tsx',
      'packages/web/src/components/drafts/ReviewChecklistPanel.tsx',
    ],
    items: [
      'Golden sample packs for template quality benchmarking',
      'Evaluation dashboard for model quality and format success rate beyond the shipped token and latency rollups',
      'Quality trend tracking across model changes and template revisions',
      'Regression benchmark suite for measuring structural compliance over time',
      'Review analytics showing which assets most often need human edits',
      'Generation time breakdown by pipeline stage beyond the per-provider and per-asset averages',
      'Similarity clustering across a draft library rather than two drafts at a time',
    ],
  },
  {
    id: 'collaboration-and-sharing',
    title: 'Collaboration and Sharing',
    status: 'planned',
    ownerFiles: [
      'packages/web/src/components/drafts/Review.tsx',
      'packages/web/src/components/templates/Templates.tsx',
      'packages/web/src/components/common/ExportModal.tsx',
    ],
    items: [
      'Collaboration-friendly review notes attached to individual assets',
      'Shared workspaces for teams curating the same draft library',
      'Commentable template reviews before publishing a new template version',
      'Import/export package format for moving drafts with metadata and history intact',
      'Team preset libraries for shared export and validation standards',
      'Curated featured templates and starter packs surfaced in-app',
      'Community template discovery with tags, screenshots, and example outputs',
      'Public/private visibility controls for shared templates and draft bundles',
      'Lightweight approval workflow for team-owned templates and presets',
      'Activity feed for recent library changes, exports, and published templates',
    ],
  },
  {
    id: 'ux-and-platform-surfaces',
    title: 'UX and Platform Surfaces',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/App.tsx',
      'packages/web/src/components/Layout.tsx',
      'packages/web/src/components/Home.tsx',
      'packages/mobile/src/screens',
    ],
    items: [
      'Desktop-native drag-and-drop import/export flows',
      'Responsive split-pane editor optimized for wide and narrow displays',
      'Pinned dashboard widgets for recent drafts, saved searches, and active queues',
      'Customizable home screen tailored to the most common workflow',
    ],
  },
  {
    id: 'assistant-and-automation',
    title: 'Assistant and Automation',
    status: 'partial',
    ownerFiles: [
      'packages/web/src/components/Layout.tsx',
      'packages/web/src/components/common/AssistantContext.tsx',
      'packages/web/src/components/common/ChatPanel.tsx',
      'packages/web/src/components/Home.tsx',
    ],
    items: [
      'Assistant tools for proposing alternate tones or styles for a selected asset',
      'Assistant-generated metadata suggestions like tags, summaries, and archetypes',
      'Auto-generated draft summaries for quick browsing in large libraries',
      'Conversational template helper for explaining what each asset does and depends on',
      'Smart recommendations for next actions after generation, review, or export',
      'Workflow automations for repeated sequences like generate, validate, review, and export',
      'Scheduled batch runs for seed lists or nightly model comparisons',
      'Auto-generated handoff notes summarizing what changed between draft revisions',
      'Safety profile presets tuned for different platforms or use cases',
      'Assistant-backed onboarding that adapts to the selected template and workflow',
    ],
  },
];
