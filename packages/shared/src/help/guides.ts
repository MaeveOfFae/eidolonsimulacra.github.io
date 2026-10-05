/**
 * The getting-started steps, the help topics, and the category order the help centre renders.
 *
 * Split out of `help.ts`, which is now a barrel over these modules.
 */
import type { HelpGuideStep, HelpTopic } from './types.js';

export const gettingStartedSteps: HelpGuideStep[] = [
  {
    id: 'browser-storage',
    title: 'Understand where your work lives',
    description:
      'Drafts, templates, settings, and theme edits stay in this browser profile by default. Clearing browser storage removes them unless you export a backup first.',
    to: '/about',
    actionLabel: 'Read about browser storage',
  },
  {
    id: 'api-keys',
    title: 'Set up an API key',
    description:
      'Open Settings, pick the provider you actually use, and paste the provider key you want the browser app to send with generation requests.',
    to: '/settings',
    actionLabel: 'Open Settings',
  },
  {
    id: 'template',
    title: 'Choose a template before you generate',
    description:
      'Templates define which assets are produced and what export structure must be preserved. Start with the built-in template before making custom ones.',
    to: '/templates',
    actionLabel: 'Review templates',
  },
  {
    id: 'generate',
    title: 'Create your first draft',
    description:
      'Go to Generate, enter a seed, confirm the content mode, and let the app produce a full draft pack you can review asset by asset.',
    to: '/generate',
    actionLabel: 'Start generating',
  },
  {
    id: 'review',
    title: 'Review before exporting',
    description:
      'Open the saved draft, check for consistency and missing details, and refine anything that does not fit the character you want to keep.',
    to: '/drafts',
    actionLabel: 'Open draft library',
  },
  {
    id: 'export',
    title: 'Export with browser expectations in mind',
    description:
      'On mobile or in a browser, export may use a share sheet, a new tab, or the download tray instead of a desktop-style save dialog.',
    to: '/data',
    actionLabel: 'See backup and export tools',
  },
];

export const helpTopics: HelpTopic[] = [
  {
    id: 'what-is-a-template',
    title: 'Templates vs. blueprints',
    category: 'Concepts',
    summary:
      'Templates choose the asset graph. Blueprints define how each asset is generated. Most users should start with templates and leave blueprints alone until they understand the workflow.',
    bullets: [
      'Templates decide which files exist and in what order they depend on each other.',
      'Blueprints are stricter and can break parser-facing output if edited casually.',
      'Use the built-in template first, then move to custom templates only after you understand review and export.',
    ],
    actions: [
      { label: 'Open templates', to: '/templates' },
      { label: 'Open blueprints', to: '/blueprints' },
    ],
  },
  {
    id: 'how-export-works',
    title: 'How export works in the browser',
    category: 'Getting Started',
    summary:
      'Browser export behavior depends on the device and browser. Normal web apps do not always get a native filename prompt.',
    bullets: [
      'Desktop browsers often save directly to Downloads.',
      'Mobile browsers may show a share sheet or open a new tab instead of prompting for a filename.',
      'Use Data Manager exports when you want a full backup of browser-stored content.',
    ],
    actions: [
      { label: 'Open Data Manager', to: '/data' },
      { label: 'Open draft review', to: '/drafts' },
    ],
  },
  {
    id: 'api-key-setup',
    title: 'API key setup without guesswork',
    category: 'Getting Started',
    summary:
      'The browser app talks to your chosen model provider using the API key you enter in Settings. No local backend service is required for the current web runtime.',
    bullets: [
      'Choose the provider you really use before selecting a model.',
      'If a key looks corrupted or includes invisible characters, the app will reject it.',
      'Persist keys only on devices you control.',
    ],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Read About storage', to: '/about' },
    ],
  },
  {
    id: 'first-draft-review',
    title: 'How to review a first draft',
    category: 'Concepts',
    summary:
      'A good review checks structure first, then consistency, then polish. Do not export just because generation finished.',
    bullets: [
      'Confirm the character name, major facts, and tone stay consistent across assets.',
      'Watch for unresolved placeholders or format drift in strict assets.',
      'Use refinement and validation before exporting to a target format.',
    ],
    actions: [
      { label: 'Open Library', to: '/drafts' },
      { label: 'Open Validation', to: '/validation' },
    ],
  },
  {
    id: 'common-blockers',
    title: 'Common blockers and what to do next',
    category: 'Troubleshooting',
    summary: 'Most early problems are configuration or browser-behavior issues, not generator bugs.',
    bullets: [
      'If generation fails immediately, verify the provider, model, and API key in Settings.',
      'If export feels silent on mobile, check for a share sheet, a new tab, or the browser download tray.',
      'If you lose drafts after clearing browser data, restore from a JSON backup in Data Manager.',
    ],
    actions: [
      { label: 'Open Settings', to: '/settings' },
      { label: 'Open Data Manager', to: '/data' },
    ],
  },
];

export const helpCategories = ['Getting Started', 'Concepts', 'Troubleshooting'] as const;
