/**
 * Legal and policy document content shared by the web and mobile apps.
 *
 * The three repository documents are generated into
 * `packages/shared/src/generated/legal-documents.ts` by
 * `tools/generation/generate-shared-info-documents.mjs`, so the browser build
 * no longer needs a Vite `?raw` import and the mobile build can bundle the same
 * text instead of shipping its own copy.
 */

export { codeOfConductDocumentText, licenseDocumentText, securityDocumentText } from '../generated/legal-documents';

/**
 * Which storage surface the prose should describe. Web passes `browser` or
 * `desktop`; mobile passes `mobile`. Keeping the scope explicit is what stops
 * one surface from claiming another surface's storage model.
 */
export type InfoRuntimeScope = 'browser' | 'desktop' | 'mobile';

const STORAGE_LOCATION: Record<InfoRuntimeScope, string> = {
  browser: 'in your browser',
  desktop: 'in desktop app data',
  mobile: 'in this app on your device',
};

const API_KEY_LOCATION: Record<InfoRuntimeScope, string> = {
  browser: 'keys are stored in local browser storage on the current device.',
  desktop: 'keys are stored in desktop app data on the current device.',
  mobile: 'keys are stored in this app on the current device.',
};

const DELETION_LOCATION: Record<InfoRuntimeScope, string> = {
  browser:
    'You can remove browser-stored data through the in-app Data Manager or by clearing site storage in your browser.',
  desktop:
    'You can remove device-stored data through the in-app Data Manager or by clearing the desktop app data for this installation.',
  mobile: 'You can remove app-stored data from the Settings screen, or by clearing the app data for this installation.',
};

const ABOUT_SUMMARY: Record<InfoRuntimeScope, string> = {
  browser:
    'Eidolon Simulacra is a browser-first blueprint compiler for character packages. It builds structured assets from a seed, preserves template-specific formats, and keeps draft state local by default.',
  desktop:
    'Eidolon Simulacra is a desktop-first workspace over the same blueprint compiler stack. It builds structured assets from a seed, preserves template-specific formats, and keeps draft state local by default.',
  mobile:
    'Eidolon Simulacra is a browser-first blueprint compiler with a companion mobile workspace for generating, reviewing, and exporting character packages.',
};

const PRIVACY_SUMMARY: Record<InfoRuntimeScope, string> = {
  browser:
    'How browser storage, API keys, provider requests, and exports are handled in the current browser-first architecture.',
  desktop: 'How desktop app data, API keys, provider requests, and exports are handled in the desktop runtime.',
  mobile: 'How on-device storage, API keys, provider requests, and exports are handled in the mobile app.',
};

export function buildAboutSummary(scope: InfoRuntimeScope): string {
  return ABOUT_SUMMARY[scope];
}

export function buildPrivacySummary(scope: InfoRuntimeScope): string {
  return PRIVACY_SUMMARY[scope];
}

/** Terms of Use, verbatim from the browser app's page so both surfaces match. */
export const termsMarkdown = `## Acceptance

By accessing or using Eidolon Simulacra, you agree to use the application, generated outputs, and repository materials in accordance with these terms and applicable law.

## Intended Use

Eidolon Simulacra is provided as a browser-first tooling surface for structured prompt compilation, review, validation, and export.

You may use the app to create, edit, and export character-related assets. You are responsible for how those assets are used, shared, or published.

## User Responsibility

- You are responsible for any prompt, draft, export, or provider configuration you supply.
- You must not use the service to violate law, platform policy, or the rights of other people.
- You are responsible for reviewing generated content before relying on it, publishing it, or sending it to third parties.

## Third-Party Providers

Model calls may be sent directly to third-party LLM providers chosen in your configuration. Those requests are governed by the provider's own terms, pricing, availability, and privacy practices.

## Exports and Content

Generated content may be inaccurate, incomplete, unsafe for your intended use, or incompatible with downstream services. You are responsible for validation, moderation, and compliance before deployment or publication.

## Availability

The application is provided on an as-is and as-available basis. Features, routes, templates, and storage formats may change over time without prior notice.

## Termination

Access to hosted surfaces, if any, may be suspended or terminated for abuse, misuse, legal risk, or operational reasons.

## Warranty Disclaimer

To the maximum extent permitted by law, Eidolon Simulacra is provided without warranties of any kind, express or implied.

## Limitation of Liability

To the maximum extent permitted by law, the maintainers and contributors are not liable for any indirect, incidental, special, consequential, or exemplary damages arising from use of the application, generated outputs, or repository materials.

## Changes

These terms may be revised. Continued use after an update constitutes acceptance of the revised terms.

## Contact

For security matters, use the contact details listed on the Security page.`;

/**
 * Privacy policy. The surface-specific sentences (where data lives, where keys
 * are persisted, how data is deleted) are selected by scope so the browser,
 * desktop, and mobile apps each describe their own storage honestly.
 */
export function buildPrivacyMarkdown(scope: InfoRuntimeScope): string {
  return `## Overview

Eidolon Simulacra is designed as a browser-first application, and the desktop build reuses that same client workflow. By default, drafts, templates, blueprint overrides, theme presets, and most configuration state are stored locally on your device ${STORAGE_LOCATION[scope]}.

## What Is Stored Locally

- draft metadata and draft assets
- template definitions and blueprint overrides
- theme presets and theme customizations
- app configuration and model preferences
- optional persisted API keys, if you explicitly enable persistence

## API Keys

API keys are sensitive. The app can keep them in memory for the current session or persist them locally when you opt in.

If you enable persistence, ${API_KEY_LOCATION[scope]}

## Third-Party Model Providers

When you generate, refine, compare, or otherwise use model-backed actions, relevant request data may be sent directly to the configured provider. This can include prompts, asset content, draft context, and selected settings.

Provider handling of that data is governed by the provider's own privacy policy and terms.

## Imports and Exports

When you export drafts, config, or keys, files are generated on your device. You are responsible for securing those exports and handling them appropriately.

## Hosted Telemetry

Optional analytics or error tracking may be configured via environment variables in a deployment, but this repository does not require them for core operation.

## Data Deletion

${DELETION_LOCATION[scope]}

## Security Reporting

If you discover a vulnerability or sensitive data exposure issue, follow the reporting instructions on the Security page.`;
}
