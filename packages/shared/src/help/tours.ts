/**
 * The guided tours: for each one, its steps, the route it belongs to, and its target catalog.
 *
 * Split out of `help.ts`, which is now a barrel over these modules.
 */
import {
  BLUEPRINTS_SAFETY_TOUR_ID,
  DRAFT_LIBRARY_TOUR_ID,
  GETTING_STARTED_TOUR_ID,
  REVIEW_EXPORT_TOUR_ID,
  SAFE_STORAGE_TOUR_ID,
  VALIDATION_TOUR_ID,
} from './types.js';
import type { GuidedTour } from './types.js';

export const guidedTours: GuidedTour[] = [
  {
    id: GETTING_STARTED_TOUR_ID,
    title: 'Getting Started Tour',
    summary: 'Walk through the safest first-run path from setup to a first export-ready draft.',
    audience: 'New users who want the app to tell them what to do next.',
    estimatedMinutes: 6,
    steps: [
      {
        id: 'start-home',
        title: 'Start from Home',
        description:
          'Home is the launch surface for the beginner path. It tells you what the current browser app can do and where to go next.',
        to: '/',
        routeLabel: 'Home',
        bullets: [
          'Use Home when you are not sure which workflow to open first.',
          'The browser profile you are using is the current storage location for drafts and settings.',
        ],
      },
      {
        id: 'set-up-provider',
        title: 'Set up provider access',
        description:
          'Open Settings before you generate anything. This avoids the most common first-run failure: trying to generate with a missing or mismatched provider key.',
        to: '/settings',
        routeLabel: 'Settings',
        targetId: 'settings-api-keys',
        targetLabel: 'API Keys',
        bullets: [
          'Pick the provider you actually use.',
          'Enter the API key you want the browser app to send.',
          'Use trusted devices if you choose to persist keys locally.',
        ],
      },
      {
        id: 'choose-template',
        title: 'Choose the template first',
        description:
          'Templates decide which assets exist and how the draft will export. Make this choice before refining the prompt or seed.',
        to: '/templates',
        routeLabel: 'Templates',
        bullets: [
          'Start with the built-in template unless you already understand custom template behavior.',
          'Template changes are structural, not cosmetic.',
        ],
      },
      {
        id: 'generate-draft',
        title: 'Generate the first draft',
        description:
          'Once provider setup and template choice are in place, Generate becomes the first full workflow step.',
        to: '/generate',
        routeLabel: 'Generate',
        targetId: 'generation-submit',
        targetLabel: 'Generate Character button',
        bullets: [
          'Enter a concrete seed instead of a vague one-liner.',
          'Treat the first result as a draft to review, not a final export.',
        ],
      },
      {
        id: 'review-library',
        title: 'Review saved drafts',
        description:
          'The library is where you reopen saved work and decide what should move into deeper review, validation, or export.',
        to: '/drafts',
        routeLabel: 'Library',
        bullets: [
          'Open the library after generation to confirm the draft actually saved.',
          'Use draft review before export when details need cleanup.',
        ],
      },
      {
        id: 'protect-work',
        title: 'Protect your work with backups',
        description:
          'Data Manager is the safety net for browser-local storage. Use it before clearing browser data or moving to another device.',
        to: '/data',
        routeLabel: 'Data Manager',
        bullets: ['Export backups before risky changes.', 'Treat API key exports as sensitive data.'],
      },
    ],
  },
  {
    id: SAFE_STORAGE_TOUR_ID,
    title: 'Protect Your Work Tour',
    summary:
      'Learn the browser-storage model, backup path, and the pages that matter when you need to avoid losing work.',
    audience: 'Users who are worried about where data lives and how to recover it safely.',
    estimatedMinutes: 4,
    steps: [
      {
        id: 'storage-model',
        title: 'Confirm the storage model',
        description:
          'About explains that the current product surface is the browser app. That matters because drafts and configuration live in browser storage by default.',
        to: '/about',
        routeLabel: 'About',
        bullets: [
          'Do not assume a local backend or desktop shell is saving your work for you.',
          'Treat this browser profile as the place where your work currently lives.',
        ],
      },
      {
        id: 'backup-tools',
        title: 'Use backup tools intentionally',
        description:
          'Data Manager is where you export or restore browser-stored content when you need to migrate, recover, or safeguard work.',
        to: '/data',
        routeLabel: 'Data Manager',
        bullets: ['Back up before clearing site data.', 'Use restore only with files you trust and understand.'],
      },
      {
        id: 'privacy-expectations',
        title: 'Understand privacy expectations',
        description:
          'Privacy explains the difference between local browser storage and the provider requests you intentionally send during generation.',
        to: '/privacy',
        routeLabel: 'Privacy',
        bullets: [
          'Local storage and provider traffic are different concerns.',
          'Backups can still expose sensitive material if handled carelessly.',
        ],
      },
      {
        id: 'secure-settings',
        title: 'Review secure settings habits',
        description:
          'Settings is where you control provider keys and persistence choices, so it is part of the data-protection workflow too.',
        to: '/settings',
        routeLabel: 'Settings',
        targetId: 'settings-api-keys',
        targetLabel: 'API Keys',
        bullets: [
          'Persist keys only on devices you control.',
          'If something feels unsafe or unclear, return to Help Center before continuing.',
        ],
      },
    ],
  },
  {
    id: REVIEW_EXPORT_TOUR_ID,
    title: 'Review and Export Tour',
    summary: 'Walk through the review controls that matter before you hand a draft off to export.',
    audience: 'Users who already generated a draft and need a safe review path before exporting.',
    estimatedMinutes: 5,
    steps: [
      {
        id: 'review-actions',
        title: 'Start from the review action bar',
        description: 'The review header is the control surface for validation, favoriting, export, and draft deletion.',
        to: '/drafts/',
        routeLabel: 'Draft Review',
        matchMode: 'prefix',
        targetId: 'review-actions',
        targetLabel: 'Review actions',
        bullets: [
          'Do not export immediately if you have not checked the draft structure yet.',
          'Keep destructive actions separate from export so you do not rush them.',
        ],
      },
      {
        id: 'review-validate',
        title: 'Validate before export',
        description:
          'Use validation before exporting when the draft has been edited or when the template has strict structure requirements.',
        to: '/drafts/',
        routeLabel: 'Draft Review',
        matchMode: 'prefix',
        targetId: 'review-validate',
        targetLabel: 'Validate button',
        bullets: [
          'Validation catches structural problems that a quick read can miss.',
          'Treat missing required pieces or unresolved placeholders as blockers.',
        ],
      },
      {
        id: 'review-assets',
        title: 'Read the assets, not just the title',
        description:
          'The asset list is where consistency problems usually reveal themselves. Check names, tone, and required sections across multiple assets.',
        to: '/drafts/',
        routeLabel: 'Draft Review',
        matchMode: 'prefix',
        targetId: 'review-assets',
        targetLabel: 'Draft assets',
        bullets: [
          'A draft can look good in one asset while still being broken elsewhere.',
          'Use targeted editing when only one asset drifts.',
        ],
      },
      {
        id: 'review-export',
        title: 'Export with browser expectations in mind',
        description:
          'When the draft is coherent, use Export. On browser and mobile surfaces this may hand off through a share sheet, new tab, or downloads tray instead of a native save dialog.',
        to: '/drafts/',
        routeLabel: 'Draft Review',
        matchMode: 'prefix',
        targetId: 'review-export',
        targetLabel: 'Export button',
        bullets: [
          'The app now tells you which handoff method was used.',
          'If export feels silent on mobile, check share and browser download surfaces.',
        ],
      },
      {
        id: 'export-choose-preset',
        title: 'Choose the export preset inside the modal',
        description:
          'Once the export modal opens, choose the preset that matches the system you are exporting for instead of blindly taking the first option.',
        to: '/drafts/',
        routeLabel: 'Export Modal',
        matchMode: 'prefix',
        targetId: 'export-preset-selection',
        targetLabel: 'Export preset selection',
        bullets: [
          'Presets change output structure and destination compatibility.',
          'If you are unsure, review the preset description before continuing.',
        ],
      },
      {
        id: 'export-confirm',
        title: 'Confirm export and watch the handoff result',
        description:
          'Use the Export button after the preset is selected, then follow the browser-specific save or share flow the app reports back to you.',
        to: '/drafts/',
        routeLabel: 'Export Modal',
        matchMode: 'prefix',
        targetId: 'export-confirm',
        targetLabel: 'Export confirm button',
        bullets: [
          'A successful export in the browser may still look different from a desktop save dialog.',
          'Use the success message to know whether the file went to share, download, or a new tab.',
        ],
      },
    ],
  },
  {
    id: DRAFT_LIBRARY_TOUR_ID,
    title: 'Draft Library Tour',
    summary: 'Learn how to use the library as a review queue instead of a pile of saved outputs.',
    audience: 'Users who generated drafts and need to understand where to reopen, compare, and triage them.',
    estimatedMinutes: 4,
    steps: [
      {
        id: 'draft-library-overview',
        title: 'Treat Drafts as your working library',
        description:
          'The library is not just storage. It is where you decide which drafts are worth opening for deeper review or export.',
        to: '/drafts',
        routeLabel: 'Library',
        targetId: 'drafts-list',
        targetLabel: 'Draft list',
        bullets: [
          'Open the library from here after generation instead of relying on memory or browser history.',
          'Use names, tags, and favorites to keep the library readable as it grows.',
        ],
      },
      {
        id: 'draft-workbench',
        title: 'Use the workbench for comparison and checks',
        description:
          'The workbench keeps review aids in view so you can compare outputs and think before opening a draft for editing.',
        to: '/drafts',
        routeLabel: 'Library',
        targetId: 'drafts-workbench',
        targetLabel: 'Draft workbench',
        bullets: [
          'Comparison and review tools help you choose the better draft before you start editing.',
          'Staged placeholders are visible here, but only the active tools should drive your next action.',
        ],
      },
      {
        id: 'draft-review-hand-off',
        title: 'Open one draft for real review',
        description:
          'Once a draft looks worth keeping, open it and continue with validation, editing, and export on the review page.',
        to: '/drafts',
        routeLabel: 'Drafts',
        targetId: 'drafts-open-review',
        targetLabel: 'Draft review links',
        bullets: [
          'The library is the triage layer. The review page is the editing and export layer.',
          'Back up important work before risky cleanup or browser-data changes.',
        ],
      },
    ],
  },
  {
    id: VALIDATION_TOUR_ID,
    title: 'Validation Workflow Tour',
    summary:
      'Walk through the validation screen so structural checks become a normal part of review instead of a last-minute panic step.',
    audience: 'Users who edit drafts or export to strict formats and need to know when validation matters.',
    estimatedMinutes: 4,
    steps: [
      {
        id: 'validation-overview',
        title: 'Use validation as a structural checkpoint',
        description:
          'Validation is where you confirm the draft still matches the expected structure before you export or hand it off to another tool.',
        to: '/validation',
        routeLabel: 'Validation',
        targetId: 'validation-draft-panel',
        targetLabel: 'Validate saved draft panel',
        bullets: [
          'Run validation after major edits, not only after generation.',
          'Treat structural failures as blockers instead of cosmetic warnings.',
        ],
      },
      {
        id: 'validation-run',
        title: 'Choose the simplest input path',
        description:
          'Most users should validate a saved draft by review ID instead of typing a manual path unless they know exactly what they are checking.',
        to: '/validation',
        routeLabel: 'Validation',
        targetId: 'validation-draft-run',
        targetLabel: 'Validate Draft button',
        bullets: [
          'Use saved-draft validation for normal browser workflows.',
          'Manual paths are useful when you are investigating a specific stored location.',
        ],
      },
      {
        id: 'validation-results',
        title: 'Read the results for real blockers',
        description:
          'The result panel tells you whether the draft passed and shows the lines that need attention before export.',
        to: '/validation',
        routeLabel: 'Validation',
        targetId: 'validation-results',
        targetLabel: 'Validation results',
        bullets: [
          'Fix missing required sections and unresolved placeholders first.',
          'If the result passes, move back to review or export with more confidence.',
        ],
      },
    ],
  },
  {
    id: BLUEPRINTS_SAFETY_TOUR_ID,
    title: 'Blueprint Safety Tour',
    summary:
      'Learn when to leave blueprints alone, when to inspect them carefully, and where to bail out to safer surfaces.',
    audience:
      'Non-technical or first-time users who might wander into blueprints before understanding template contracts.',
    estimatedMinutes: 4,
    steps: [
      {
        id: 'blueprints-search',
        title: 'Treat Blueprints as inspection first, editing second',
        description:
          'Start by searching and reading. Do not jump into editing unless you know why a blueprint needs to change.',
        to: '/blueprints',
        routeLabel: 'Blueprints',
        targetId: 'blueprints-search',
        targetLabel: 'Blueprint search',
        bullets: [
          'Search helps you understand which blueprint family you are looking at.',
          'Reading the path and description usually tells you whether the file is core, system, or template-specific.',
        ],
      },
      {
        id: 'blueprints-tools',
        title: 'Use browser safety tools before editing',
        description:
          'The lint and sandbox tools exist so you can inspect behavior without immediately rewriting contract-heavy text.',
        to: '/blueprints',
        routeLabel: 'Blueprints',
        targetId: 'blueprints-tools',
        targetLabel: 'Blueprint tools',
        bullets: [
          'Use lint and preview to reduce guesswork.',
          'A readable blueprint is not automatically a safe blueprint.',
        ],
      },
      {
        id: 'blueprints-exit-ramp',
        title: 'Know the safer alternative',
        description:
          'If you are trying to change workflow shape rather than raw blueprint text, templates are usually the safer surface for early users.',
        to: '/blueprints',
        routeLabel: 'Blueprints',
        targetId: 'blueprints-list',
        targetLabel: 'Blueprint list',
        bullets: [
          'Do not edit a blueprint just because you found the right file name.',
          'When in doubt, go back to Templates or Help Center before making changes.',
        ],
      },
    ],
  },
];
