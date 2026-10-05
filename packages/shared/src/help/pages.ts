/**
 * Per-page help and the route-coverage manifests, plus the guided-tour target catalog.
 *
 * Split out of `help.ts`, which is now a barrel over these modules.
 */
import type {
  AppRouteHelpCoverageEntry,
  GuidedTourTargetCatalogEntry,
  PageHelpEntry,
  RouteCoverageManifestEntry,
} from './types.js';

export const pageHelpEntries: PageHelpEntry[] = [
  {
    id: 'home',
    match: '/',
    matchMode: 'exact',
    title: 'Home help',
    summary:
      'Use Home as a focused dashboard for the next step, recent work, guided setup, and a compact set of supporting tools.',
    keyActions: [
      'Follow the starter checklist if this is your first run.',
      'Use the next-steps panel to move from setup into generation and review.',
      'Jump back into recent drafts instead of scanning the full library when possible.',
    ],
    pitfalls: [
      'Do not assume your work syncs automatically. This browser profile is the storage location by default.',
      'Do not skip Settings if generation cannot start; most early issues begin there.',
    ],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'generate',
    match: '/generate',
    matchMode: 'exact',
    title: 'Generate help',
    summary:
      'Generation is where you choose the template, seed, provider, and content mode that become a full draft pack.',
    keyActions: [
      'Choose the template before you spend time refining the seed.',
      'Keep the seed concrete enough that the model has something to preserve across assets.',
      'Use review after generation instead of trying to perfect everything in one pass.',
    ],
    pitfalls: [
      'A missing or invalid API key will usually fail generation before useful output appears.',
      'Changing template assumptions late can invalidate your review expectations.',
    ],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open templates', to: '/templates' },
    ],
    relatedTopicIds: ['api-key-setup', 'what-is-a-template'],
  },
  {
    id: 'token-optimization',
    match: '/optimize',
    matchMode: 'exact',
    title: 'Token optimization help',
    summary:
      'Token Optimization shortens wording and removes bloat while preserving relevant content and structure as much as possible.',
    keyActions: [
      'Paste the full text you want to compress before deciding whether formatting should be preserved.',
      'Use the output comparison to confirm that names, constraints, and required details survived the rewrite.',
      'Treat this as compression, not summarization; rerun with a lower target if important nuance becomes too compressed.',
    ],
    pitfalls: [
      'A high reduction target can pressure the model to compress more aggressively than you actually want.',
      'Estimated token counts are approximate and useful for comparison, not billing precision.',
    ],
    actions: [
      { label: 'Open Generate', to: '/generate' },
      { label: 'Open Blueprints', to: '/blueprints' },
    ],
    relatedTopicIds: ['what-is-a-template', 'common-blockers'],
  },
  {
    id: 'seed-generator',
    match: '/seed-generator',
    matchMode: 'exact',
    title: 'Seed Generator help',
    summary: 'Use Seed Generator when you need raw concept material before you commit to a full draft workflow.',
    keyActions: [
      'Generate multiple seeds and keep the one with the clearest identity.',
      'Pass the best seed into Generate instead of trying to export from here.',
    ],
    pitfalls: ['A seed is not a finished draft; it still needs a template and generation pass.'],
    actions: [
      { label: 'Open Generate', to: '/generate' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'validation',
    match: '/validation',
    matchMode: 'exact',
    title: 'Validation help',
    summary:
      'Validation helps you catch structural issues before export, especially on strict templates or edited drafts.',
    keyActions: [
      'Validate after major edits and before export.',
      'Treat missing required assets or unresolved placeholders as blockers, not cosmetic warnings.',
    ],
    pitfalls: ['Passing generation does not guarantee export readiness.'],
    actions: [
      { label: 'Open Library', to: '/drafts' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['first-draft-review', 'common-blockers'],
  },
  {
    id: 'batch',
    match: '/batch',
    matchMode: 'exact',
    title: 'Batch help',
    summary: 'Batch generation is for running multiple drafts in sequence without driving the app one draft at a time.',
    keyActions: [
      'Keep concurrency conservative until you know your provider limits.',
      'Use batch for throughput, not for first-time learning of the workflow.',
    ],
    pitfalls: ['High concurrency can make failures harder to interpret.'],
    actions: [
      { label: 'Open Generate', to: '/generate' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'drafts',
    match: '/drafts',
    matchMode: 'exact',
    title: 'Library help',
    summary:
      'The library is where you reopen saved work, check metadata, and decide which draft should move into review or export.',
    keyActions: [
      'Open the review page for the draft you want to polish or export.',
      'Use metadata and favorites to keep the library manageable as it grows.',
    ],
    pitfalls: ['Deleting a draft removes the browser-local copy unless you already exported or backed it up.'],
    actions: [
      { label: 'Open Data Manager', to: '/data' },
      { label: 'Open Validation', to: '/validation' },
    ],
    relatedTopicIds: ['first-draft-review', 'common-blockers'],
  },
  {
    id: 'draft-review',
    match: '/drafts/',
    matchMode: 'prefix',
    title: 'Draft review help',
    summary:
      'Review is where you inspect generated assets, refine weak spots, validate structure, and export only when the pack is coherent.',
    keyActions: [
      'Check the character name, core traits, and tone across multiple assets before exporting.',
      'Use refine tools for targeted edits instead of regenerating the whole draft immediately.',
      'Validate after meaningful edits.',
    ],
    pitfalls: [
      'A draft that reads well in one asset can still fail export because another asset drifted or broke format.',
      'Do not ignore placeholders or empty required sections in strict assets.',
    ],
    actions: [
      { label: 'Open Validation', to: '/validation' },
      { label: 'Open Data Manager', to: '/data' },
    ],
    relatedTopicIds: ['first-draft-review', 'how-export-works'],
  },
  {
    id: 'templates',
    match: '/templates',
    matchMode: 'exact',
    title: 'Templates help',
    summary:
      'Templates define which assets exist, how they depend on each other, and what export structure needs to remain valid.',
    keyActions: [
      'Use the built-in template first so you understand the app’s baseline workflow.',
      'Treat template changes as structural decisions, not cosmetic ones.',
    ],
    pitfalls: ['Changing template expectations late can invalidate assumptions in review and export.'],
    actions: [
      { label: 'Open Generate', to: '/generate' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['what-is-a-template'],
  },
  {
    id: 'blueprints',
    match: '/blueprints',
    matchMode: 'exact',
    title: 'Blueprints help',
    summary:
      'Blueprints are advanced prompt/compiler definitions. They are powerful, but they are not a safe first editing surface for non-technical users.',
    keyActions: [
      'Prefer templates unless you are intentionally changing generation structure.',
      'Preserve parser-facing formats and placeholders carefully when editing.',
    ],
    pitfalls: ['A casual blueprint edit can break validation or export even if the text still looks readable.'],
    actions: [
      { label: 'Open templates', to: '/templates' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['what-is-a-template'],
  },
  {
    id: 'blueprint-editor',
    match: '/blueprints/edit',
    matchMode: 'prefix',
    title: 'Blueprint editor help',
    summary:
      'The editor is for advanced changes to blueprint text and should be treated as a strict contract surface, not a freeform note field.',
    keyActions: [
      'Keep output structures intact when the target asset expects rigid formatting.',
      'Validate edits before using them in a generation workflow.',
    ],
    pitfalls: ['Unfilled placeholders, broken structure, or dependency mistakes can cascade through later assets.'],
    actions: [
      { label: 'Open Validation', to: '/validation' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['what-is-a-template', 'common-blockers'],
  },
  {
    id: 'similarity',
    match: '/similarity',
    matchMode: 'exact',
    title: 'Similarity help',
    summary:
      'Similarity helps you inspect overlap between drafts so you can catch repeats, redundancy, or near-duplicates.',
    keyActions: ['Use it after building a larger draft library or batch output set.'],
    pitfalls: ['Similarity is analysis support, not a replacement for human review.'],
    actions: [
      { label: 'Open Library', to: '/drafts' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['first-draft-review'],
  },
  {
    id: 'offspring',
    match: '/offspring',
    matchMode: 'exact',
    title: 'Offspring help',
    summary:
      'Offspring combines parent drafts into a derivative result, so parent quality and consistency matter before you start.',
    keyActions: ['Choose parents that are already reviewed and structurally healthy.'],
    pitfalls: ['Using unstable or contradictory parents gives unstable offspring output.'],
    actions: [
      { label: 'Open Library', to: '/drafts' },
      { label: 'Open Validation', to: '/validation' },
    ],
    relatedTopicIds: ['first-draft-review'],
  },
  {
    id: 'lineage',
    match: '/lineage',
    matchMode: 'exact',
    title: 'Lineage help',
    summary: 'Lineage shows how related drafts connect over time so you can track derivations and review ancestry.',
    keyActions: ['Use lineage when you need provenance, not when you need direct editing.'],
    pitfalls: [
      'Lineage helps you understand relationships, but it does not repair structural draft issues on its own.',
    ],
    actions: [
      { label: 'Open Library', to: '/drafts' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['first-draft-review'],
  },
  {
    id: 'themes',
    match: '/themes',
    matchMode: 'exact',
    title: 'Themes help',
    summary:
      'Themes control the browser UI appearance. Runtime theme behavior lives in the app, not in the reference TOML files under resources.',
    keyActions: ['Use presets as a base and save customizations intentionally.'],
    pitfalls: ['Editing reference theme files in the repo is not the same as changing the live browser theme runtime.'],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'tokenizer-theme',
    match: '/tokenizer',
    matchMode: 'exact',
    title: 'Tokenizer colors help',
    summary:
      'Tokenizer colors control syntax-highlighted prompt and review surfaces without changing the rest of the app palette.',
    keyActions: [
      'Use this page when you want to tune bracket, pipe, and annotation colors independently from the main app theme.',
      'Return to Themes for broader app palette work and preset management.',
    ],
    pitfalls: ['Tokenizer changes affect highlighted editing and review surfaces, not the entire app chrome.'],
    actions: [
      { label: 'Open Themes', to: '/themes' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'settings',
    match: '/settings',
    matchMode: 'exact',
    title: 'Settings help',
    summary:
      'Settings is split into focused sections for setup, providers, generation defaults, help preferences, and optional sync.',
    keyActions: [
      'Start with Setup when you need to configure the active provider and runtime defaults.',
      'Use Providers to edit stored credentials one provider at a time instead of scanning every key field.',
      'Open Generation only when you need batch tuning or blueprint defaults.',
    ],
    pitfalls: ['Saving API keys in browser storage is convenient, but it should be limited to devices you trust.'],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open About', to: '/about' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'data',
    match: '/data',
    matchMode: 'exact',
    title: 'Data Manager help',
    summary: 'Data Manager is the safety net for browser-local drafts, config, and backups.',
    keyActions: [
      'Export backups before clearing browser data or changing devices.',
      'Treat API-key export files as sensitive data.',
    ],
    pitfalls: ['Clearing browser storage without a backup removes local drafts and settings.'],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['how-export-works', 'common-blockers'],
  },
  {
    id: 'whats-new',
    match: '/whats-new',
    matchMode: 'exact',
    title: 'What’s New help',
    summary:
      'Use this page to understand recent product changes and staged roadmap work before assuming the workflow still behaves the same way.',
    keyActions: ['Check release notes after updates when a flow feels different.'],
    pitfalls: ['Roadmap items are not the same as implemented features.'],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open Home', to: '/' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'about',
    match: '/about',
    matchMode: 'exact',
    title: 'About help',
    summary:
      'About explains the current browser-first product surface, storage model, and the difference between the app runtime and repo reference assets.',
    keyActions: ['Use About when you need to confirm how the browser app stores or handles your work.'],
    pitfalls: [
      'Do not assume older Python/backend flows exist in the current product unless you can see them in the app.',
    ],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'help-center',
    match: '/help',
    matchMode: 'exact',
    title: 'Help Center help',
    summary:
      'Help Center is the structured fallback when you want answers without guessing which page or workflow to visit next.',
    keyActions: [
      'Start with the Getting Started section if you are still learning the workflow.',
      'Use concepts when the terminology is the blocker.',
      'Use troubleshooting when the app behavior does not match your expectation.',
    ],
    pitfalls: [
      'The Help Center explains the browser app. It does not guarantee parity with future mobile or desktop surfaces.',
    ],
    actions: [
      { label: 'Open Home', to: '/' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'community',
    match: '/community',
    matchMode: 'exact',
    title: 'Community help',
    summary:
      'Community collects the current public project spaces: repository, issue tracking, support links, and internal conduct guidance.',
    keyActions: [
      'Use repository issues for concrete bugs and feature requests that should stay visible and traceable.',
      'Use support or direct contact links when the goal is outreach rather than issue tracking.',
    ],
    pitfalls: [
      'This page only lists spaces confirmed in the current build, so missing Discord or forum links are intentional rather than hidden.',
    ],
    actions: [
      { label: 'Open About', to: '/about' },
      { label: 'Open Code of Conduct', to: '/code-of-conduct' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'license',
    match: '/license',
    matchMode: 'exact',
    title: 'License help',
    summary:
      'License explains the repository licensing terms and should be read when you need usage or redistribution clarity.',
    keyActions: ['Use this page when you need the exact license text or attribution expectations.'],
    pitfalls: ['License answers legal distribution questions, not workflow or storage questions.'],
    actions: [
      { label: 'Open About', to: '/about' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'terms',
    match: '/terms',
    matchMode: 'exact',
    title: 'Terms help',
    summary:
      'Terms of Use covers the rules around using the app, exports, and generated content through the current browser surface.',
    keyActions: ['Use this page when you need policy guidance rather than workflow guidance.'],
    pitfalls: ['Terms is not a how-to page. Use Help Center for workflow questions.'],
    actions: [
      { label: 'Open Help Center', to: '/help' },
      { label: 'Open Privacy', to: '/privacy' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'privacy',
    match: '/privacy',
    matchMode: 'exact',
    title: 'Privacy help',
    summary:
      'Privacy explains what stays in browser storage, what reaches provider APIs, and what sensitive data you are responsible for handling carefully.',
    keyActions: [
      'Use this page when you need to understand local storage, API key handling, or data exposure to providers.',
    ],
    pitfalls: ['Browser-local does not mean impossible to lose. You still need backups if the data matters.'],
    actions: [
      { label: 'Open Data Manager', to: '/data' },
      { label: 'Open Settings', to: '/settings' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'security',
    match: '/security',
    matchMode: 'exact',
    title: 'Security help',
    summary:
      'Security covers vulnerability reporting and safe handling of provider keys and browser-stored configuration.',
    keyActions: ['Use this page when the question is about secure handling or vulnerability reporting.'],
    pitfalls: ['Security policy does not replace provider-specific account protection practices.'],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open Privacy', to: '/privacy' },
    ],
    relatedTopicIds: ['api-key-setup'],
  },
  {
    id: 'code-of-conduct',
    match: '/code-of-conduct',
    matchMode: 'exact',
    title: 'Code of Conduct help',
    summary: 'Code of Conduct covers collaboration expectations for the repository and project community spaces.',
    keyActions: ['Use this page for contribution and interaction standards, not workflow setup.'],
    pitfalls: ['Community rules are separate from app usage or licensing terms.'],
    actions: [
      { label: 'Open About', to: '/about' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['common-blockers'],
  },
  {
    id: 'insights',
    match: '/insights',
    matchMode: 'exact',
    title: 'Insights help',
    summary:
      'Insights shows what your LLM calls cost in tokens and time, grouped by provider, model, call type, asset, template, draft, and day, from records stored locally on this device.',
    keyActions: [
      'Check provider and model groups first to spot expensive or slow combinations.',
      'Use asset and template groups to find which generation steps consume the most tokens.',
      'Clear the local record history when you no longer need it; records never leave this device.',
    ],
    pitfalls: [
      'Token counts only appear when the provider reports usage for the call.',
      'Records are capped at the most recent 5,000 calls on this device and are not synced across devices.',
    ],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open Help Center', to: '/help' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
  {
    id: 'compare',
    match: '/compare',
    matchMode: 'exact',
    title: 'Compare models help',
    summary:
      'Compare runs one seed and template through up to four candidate models and lines the resulting drafts up with their token and time cost.',
    keyActions: [
      'Configure an API key for every candidate model provider in Settings before starting a run.',
      'Pick between two and four candidate models; each becomes a normal draft linked to the comparison group.',
      'Use the results table and the side-by-side diff to choose which candidate to keep refining.',
    ],
    pitfalls: [
      'Candidates without a configured provider key fail individually; the rest of the run continues.',
      'Comparison runs are not resumable yet — closing the page stops the remaining candidates.',
    ],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open Generate', to: '/generate' },
    ],
    relatedTopicIds: ['api-key-setup', 'common-blockers'],
  },
];

export const routeCoverageManifest: RouteCoverageManifestEntry[] = [
  { route: '/', pageHelpId: 'home', coverage: 'complete' },
  { route: '/generate', pageHelpId: 'generate', coverage: 'complete' },
  { route: '/seed-generator', pageHelpId: 'seed-generator', coverage: 'complete' },
  { route: '/validation', pageHelpId: 'validation', coverage: 'complete' },
  { route: '/optimize', pageHelpId: 'token-optimization', coverage: 'complete' },
  { route: '/batch', pageHelpId: 'batch', coverage: 'complete' },
  { route: '/drafts', pageHelpId: 'drafts', coverage: 'complete' },
  { route: '/drafts/:id', pageHelpId: 'draft-review', coverage: 'complete' },
  { route: '/drafts/:id/assets/:assetName/regenerate', pageHelpId: 'draft-review', coverage: 'complete' },
  { route: '/templates', pageHelpId: 'templates', coverage: 'complete' },
  { route: '/blueprints', pageHelpId: 'blueprints', coverage: 'complete' },
  { route: '/blueprints/edit/*', pageHelpId: 'blueprint-editor', coverage: 'complete' },
  { route: '/lineage', pageHelpId: 'lineage', coverage: 'complete' },
  { route: '/similarity', pageHelpId: 'similarity', coverage: 'complete' },
  { route: '/offspring', pageHelpId: 'offspring', coverage: 'complete' },
  { route: '/themes', pageHelpId: 'themes', coverage: 'complete' },
  { route: '/tokenizer', pageHelpId: 'tokenizer-theme', coverage: 'complete' },
  { route: '/insights', pageHelpId: 'insights', coverage: 'complete' },
  { route: '/compare', pageHelpId: 'compare', coverage: 'complete' },
  { route: '/settings', pageHelpId: 'settings', coverage: 'complete' },
  { route: '/data', pageHelpId: 'data', coverage: 'complete' },
  { route: '/about', pageHelpId: 'about', coverage: 'complete' },
  { route: '/help', pageHelpId: 'help-center', coverage: 'complete' },
  { route: '/community', pageHelpId: 'community', coverage: 'complete' },
  { route: '/whats-new', pageHelpId: 'whats-new', coverage: 'complete' },
  { route: '/license', pageHelpId: 'license', coverage: 'complete' },
  { route: '/terms', pageHelpId: 'terms', coverage: 'complete' },
  { route: '/privacy', pageHelpId: 'privacy', coverage: 'complete' },
  { route: '/security', pageHelpId: 'security', coverage: 'complete' },
  { route: '/code-of-conduct', pageHelpId: 'code-of-conduct', coverage: 'complete' },
];

export const appRouteHelpCoverage: AppRouteHelpCoverageEntry[] = routeCoverageManifest.map((entry) => ({
  path: entry.route,
  pageHelpId: entry.pageHelpId,
}));

export const guidedTourTargetCatalog: GuidedTourTargetCatalogEntry[] = [
  { id: 'settings-api-keys', route: '/settings' },
  { id: 'settings-model', route: '/settings' },
  { id: 'settings-help-tutorials', route: '/settings' },
  { id: 'generation-seed', route: '/generate' },
  { id: 'generation-content-mode', route: '/generate' },
  { id: 'generation-template', route: '/generate' },
  { id: 'generation-submit', route: '/generate' },
  { id: 'drafts-workbench', route: '/drafts' },
  { id: 'drafts-list', route: '/drafts' },
  { id: 'drafts-open-review', route: '/drafts' },
  { id: 'review-actions', route: '/drafts/:id' },
  { id: 'review-validate', route: '/drafts/:id' },
  { id: 'review-export', route: '/drafts/:id' },
  { id: 'review-assets', route: '/drafts/:id' },
  { id: 'export-preset-selection', route: '/drafts/:id' },
  { id: 'export-confirm', route: '/drafts/:id' },
  { id: 'validation-draft-panel', route: '/validation' },
  { id: 'validation-draft-run', route: '/validation' },
  { id: 'validation-results', route: '/validation' },
  { id: 'blueprints-search', route: '/blueprints' },
  { id: 'blueprints-tools', route: '/blueprints' },
  { id: 'blueprints-list', route: '/blueprints' },
];
