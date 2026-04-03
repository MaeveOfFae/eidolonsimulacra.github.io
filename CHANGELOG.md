# Changelog

Generated release history for the browser app.


## v3.1.8 - 2026-04-03

### Platform and runtime update

This release packages 12 recent commits focused on platform, runtime, and templates.

### Highlights
- Update version to 3.1.7 and enhance changelog with highlights and links
- Update version to 3.1.6 and enhance changelog with highlights and links
- Update changelog and release notes for version 3.1.5
- Update package manager to pnpm@10.33.0
- Update version numbers and add sync-backed persistence tests for templates and blueprints

### Links
- [Open generation](/generate)
- [Review templates](/templates)

## v3.1.7 - 2026-04-02

### Platform and runtime update

This release packages 12 recent commits focused on platform, runtime, and templates.

### Highlights
- Update version to 3.1.6 and enhance changelog with highlights and links
- Update changelog and release notes for version 3.1.5
- Update package manager to pnpm@10.33.0
- Update version numbers and add sync-backed persistence tests for templates and blueprints
- Enhance Theme components with optional headers and sync controls

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.1.6 - 2026-04-02

### Platform and runtime update

This release packages 12 recent commits focused on platform, runtime, and templates.

### Highlights
- Update changelog and release notes for version 3.1.5
- Update package manager to pnpm@10.33.0
- Update version numbers and add sync-backed persistence tests for templates and blueprints
- Enhance Theme components with optional headers and sync controls
- Add favorites, asset regen, and refactor backend

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.1.5 - 2026-04-02

### Platform and themes update

This release packages 12 recent commits focused on platform, themes, and runtime.

### Highlights
- Update package manager to pnpm@10.33.0
- Update version numbers and add sync-backed persistence tests for templates and blueprints
- Enhance Theme components with optional headers and sync controls
- Add favorites, asset regen, and refactor backend
- Update Docker configuration and scripts for improved API and PostgreSQL integration

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.1.4 - 2026-04-02

### Sync reliability and theme controls update

This release tightens browser sync workflows for templates and blueprints, expands theme management controls, and continues the shift toward the universal asset regeneration flow alongside updated container tooling.

### Highlights
- Harden template and blueprint sync coverage with persistence regression tests
- Add optional headers and sync controls across theme management views
- Continue the favorites and asset regeneration refactor across browser and backend flows
- Refresh Docker and PostgreSQL setup scripts for local and server deployment paths
- Move the workspace to pnpm 10.33.0

### Links
- [Open generation](/generate)
- [Review templates](/templates)

## v3.1.3 - 2026-04-01

### Platform and runtime update

This release packages 12 recent commits focused on platform, runtime, and themes.

### Highlights
- Update Docker configuration and scripts for improved API and PostgreSQL integration
- Replace IntroGenerator with AssetRegenerator in Generation component
- Add AssetRegenerator component for regenerating draft assets with custom instructions and multiple variants feat: implement asset regeneration session management with local storage feat: add route for asset regeneration in the Review component feat: update changelog and release notes for version 3.1.1
- Implement asset copy functionality in Review component
- Update version to 3.0.21 and enhance release notes with highlights and links

### Links
- [Open generation](/generate)
- [Review templates](/templates)
 Changelog


## v3.1.2 - 2026-03-26

### Draft assets and regeneration update

This release adds per-asset review actions and a universal asset regeneration workspace that now replaces the old intro-only flow.

### Highlights

- Add copy actions to each asset card on the draft review page
- Add a single-asset regeneration route from draft review cards
- Replace the intro-only generation tab with the universal asset variants workspace
- Carry intro-scene keep, export, and restore behavior into the universal asset page
- Persist asset regeneration sessions and runtime blueprint overrides between visits

### Links

- [Open generation](/generate)
- [Review drafts](/drafts)

## v3.1.1 - 2026-03-26

### Platform and themes update

This release packages 12 recent commits focused on platform, themes, and runtime.

### Highlights

- Implement asset copy functionality in Review component
- Update version to 3.1.1 and enhance release notes with highlights and links
- Add rate limiting configuration options to server environment
- Add optional rate limiting configuration to environment files and update server logic
- Add 'Themes' navigation item with Palette icon to the layout

### Links

- [Open generation](/generate)
- [Review templates](/templates)

## v3.0.21 - 2026-03-26

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and themes.

### Highlights
- Add rate limiting configuration options to server environment
- Add optional rate limiting configuration to environment files and update server logic
- Add 'Themes' navigation item with Palette icon to the layout
- Add optional API rate limiting configuration to environment files
- Update rate limiting configuration to increase maximum requests

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.20 - 2026-03-26

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and themes.

### Highlights
- Enhance DraftComparisonPanel with change handlers for draft selection
- Update timelines, validation, events, and worlds components with planned modules and UI enhancements
- Update version to 3.0.18 and enhance release notes with highlights and links
- Clean up layout and drafts components by removing unused imports and enhancing UI text
- Simplify layout component by removing unused footer links and enhancing button styles

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.19 - 2026-03-25

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and themes.

### Highlights
- Update version to 3.0.18 and enhance release notes with highlights and links
- Clean up layout and drafts components by removing unused imports and enhancing UI text
- Simplify layout component by removing unused footer links and enhancing button styles
- Implement utility panel with dynamic shortcuts and page help integration
- Update version to 3.0.17 and enhance release notes with highlights and links

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.18 - 2026-03-25

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and themes.

### Highlights
- Clean up layout and drafts components by removing unused imports and enhancing UI text
- Simplify layout component by removing unused footer links and enhancing button styles
- Implement utility panel with dynamic shortcuts and page help integration
- Update version to 3.0.17 and enhance release notes with highlights and links
- Add synchronization events for themes and drafts with query invalidation

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.17 - 2026-03-25

### Platform and themes update

This release packages 12 recent commits focused on platform, themes, and runtime.

### Highlights
- Add synchronization events for themes and drafts with query invalidation
- Update font loading strategy by moving font imports to HTML
- Enhance favorite seeds synchronization with new state management and server updates
- Implement seeds management with CRUD operations and sync functionality
- Enhance error handling in draft sync process to include error messages

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.16 - 2026-03-25

### Platform and runtime update

This release packages 12 recent commits focused on platform and runtime.

### Highlights
- Enhance error handling in draft sync process to include error messages
- Correct draft normalization in sync payload to handle single draft objects
- Implement draft normalization functions for improved sync payload handling
- Add function to recognize valid draft JSON payloads for improved import handling
- Update version to 3.0.14 and enhance release notes with recent changes

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.15 - 2026-03-25

### Platform and runtime update

This release packages 12 recent commits focused on platform and runtime.

### Highlights
- Enhance error handling in draft sync process to include error messages
- Correct draft normalization in sync payload to handle single draft objects
- Implement draft normalization functions for improved sync payload handling
- Add function to recognize valid draft JSON payloads for improved import handling
- Update version to 3.0.14 and enhance release notes with recent changes

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.14 - 2026-03-25

### Platform and documentation update

This release packages 12 recent commits focused on platform, documentation, and templates.

### Highlights
- Update draft sync endpoints to unify API calls and improve error handling
- Validate UUIDs before deleting remote drafts to prevent errors
- Remove auto-sync heartbeat logic and related initialization to simplify sync process
- Enhance ServerClient with status caching and rate limiting for improved sync performance
- Improve draft synchronization logic by refining endpoint handling and adding retry conditions

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.13 - 2026-03-25

### Templates and documentation update

This release packages 12 recent commits focused on templates and documentation.

### Highlights
- Modified: blueprints/system/a1111.md modified: blueprints/system/a1111_old.md
- Update A1111 blueprint to compact bracketed format; enhance prompt structure and clarity
- Release v3.0.12 with updates to templates, documentation, and platform; enhance changelog and versioning details
- Release v3.0.11 enhance blueprint path handling and improve changelog entries
- Release v3.0.10 with updates to templates, documentation, and rate limiting; enhance environment configuration and proxy handling

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.12 - 2026-03-24

### Templates and documentation update

This release packages 12 recent commits focused on templates, documentation, and platform.

### Highlights
- Release v3.0.11 enhance blueprint path handling and improve changelog entries
- Release v3.0.10 with updates to templates, documentation, and rate limiting; enhance environment configuration and proxy handling
- Release v3.0.9 with updates to templates, documentation, and sync functionality; add new endpoints for draft synchronization and enhance error handling
- Release v3.0.8 with updates to templates, platform, and documentation; normalize feature blueprint paths and add new engine mode settings
- Update changelog for v3.0.7 with recent templates and platform enhancements; modify README and documentation for clarity on built-in templates

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.11 - 2026-03-24

### Templates and documentation update

This release packages 12 recent commits focused on templates, documentation, and platform.

### Highlights
- Release v3.0.10 with updates to templates, documentation, and rate limiting; enhance environment configuration and proxy handling
- Release v3.0.9 with updates to templates, documentation, and sync functionality; add new endpoints for draft synchronization and enhance error handling
- Release v3.0.8 with updates to templates, platform, and documentation; normalize feature blueprint paths and add new engine mode settings
- Update changelog for v3.0.7 with recent templates and platform enhancements; modify README and documentation for clarity on built-in templates
- Release v3.0.6 with updates to templates, platform, and UI enhancements

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.10 - 2026-03-24

### Templates and documentation update

This release packages 12 recent commits focused on templates, documentation, and platform.

### Highlights
- Release v3.0.9 with updates to templates, documentation, and sync functionality; add new endpoints for draft synchronization and enhance error handling
- Release v3.0.8 with updates to templates, platform, and documentation; normalize feature blueprint paths and add new engine mode settings
- Update changelog for v3.0.7 with recent templates and platform enhancements; modify README and documentation for clarity on built-in templates
- Release v3.0.6 with updates to templates, platform, and UI enhancements
- Update changelog and release notes for v3.0.5, including template and platform enhancements

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.9 - 2026-03-24

### Templates and documentation update

This release packages 12 recent commits focused on templates, documentation, and platform.

### Highlights
- Release v3.0.8 with updates to templates, platform, and documentation; normalize feature blueprint paths and add new engine mode settings
- Update changelog for v3.0.7 with recent templates and platform enhancements; modify README and documentation for clarity on built-in templates
- Release v3.0.6 with updates to templates, platform, and UI enhancements
- Update changelog and release notes for v3.0.5, including template and platform enhancements
- Release v3.0.4 with updates to templates, platform, and new auto-sync features

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.8 - 2026-03-24

### Templates and platform update

This release packages 12 recent commits focused on templates, platform, and documentation.

### Highlights
- Update changelog for v3.0.7 with recent templates and platform enhancements; modify README and documentation for clarity on built-in templates
- Release v3.0.6 with updates to templates, platform, and UI enhancements
- Update changelog and release notes for v3.0.5, including template and platform enhancements
- Release v3.0.4 with updates to templates, platform, and new auto-sync features
- Update blueprints with new feature categories and enhancements

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.7 - 2026-03-24

### Templates and platform update

This release packages 12 recent commits focused on templates, platform, and themes.

### Highlights
- Release v3.0.6 with updates to templates, platform, and UI enhancements
- Update changelog and release notes for v3.0.5, including template and platform enhancements
- Release v3.0.4 with updates to templates, platform, and new auto-sync features
- Update blueprints with new feature categories and enhancements
- Release v3.0.2 with platform and template updates, including new blueprint handling and UI enhancements

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.6 - 2026-03-24

### Templates and platform update

This release packages 12 recent commits focused on templates, platform, and themes.

### Highlights
- Update changelog and release notes for v3.0.5, including template and platform enhancements
- Release v3.0.4 with updates to templates, platform, and new auto-sync features
- Update blueprints with new feature categories and enhancements
- Release v3.0.2 with platform and template updates, including new blueprint handling and UI enhancements
- Update UI text and spacing across multiple components

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.5 - 2026-03-24

### Templates and platform update

This release packages 12 recent commits focused on templates, platform, and themes.

### Highlights
- Release v3.0.4 with updates to templates, platform, and new auto-sync features
- Update blueprints with new feature categories and enhancements
- Release v3.0.2 with platform and template updates, including new blueprint handling and UI enhancements
- Update UI text and spacing across multiple components
- Update server Docker configuration and add health checks

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.4 - 2026-03-24

### Templates and platform update

This release packages 12 recent commits focused on templates, platform, and themes.

### Highlights
- Update blueprints with new feature categories and enhancements
- Release v3.0.2 with platform and template updates, including new blueprint handling and UI enhancements
- Update UI text and spacing across multiple components
- Update server Docker configuration and add health checks
- Refactor blueprints and templates for character generation

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.3 - 2026-03-24

### Platform and templates update

This release packages 12 recent commits focused on platform, templates, and themes.

### Highlights
- Release v3.0.2 with platform and template updates, including new blueprint handling and UI enhancements
- Update UI text and spacing across multiple components
- Update server Docker configuration and add health checks
- Refactor blueprints and templates for character generation
- Modified: packages/server/src/middleware/auth.ts modified: packages/shared/src/parse/parse-blocks.ts modified: packages/web/src/components/batch/BatchGenerate.tsx renamed: packages/web/src/components/blueprints/BlueprintLintPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintLintPanel.tsx renamed: packages/web/src/components/blueprints/BlueprintSandboxPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx modified: packages/web/src/components/blueprints/Blueprints.tsx modified: packages/web/src/components/blueprints/blueprintLint.ts modified: packages/web/src/components/common/DataManager.tsx modified: packages/web/src/components/common/GuidedTourContext.tsx modified: packages/web/src/components/common/OnboardingPlaceholder.tsx renamed: packages/web/src/components/drafts/DraftComparisonPlaceholder.tsx -> packages/web/src/components/drafts/DraftComparisonPanel.tsx modified: packages/web/src/components/drafts/Drafts.tsx modified: packages/web/src/components/drafts/Review.tsx renamed: packages/web/src/components/drafts/ReviewChecklistPlaceholder.tsx -> packages/web/src/components/drafts/ReviewChecklistPanel.tsx new file: packages/web/src/components/drafts/VersionHistoryPanel.tsx deleted: packages/web/src/components/drafts/VersionHistoryPlaceholder.tsx modified: packages/web/src/components/generation/DraftRefiner.tsx modified: packages/web/src/components/generation/GenerationProgress.tsx modified: packages/web/src/components/generation/IntroGenerator.tsx modified: packages/web/src/components/generation/SeedGenerator.tsx modified: packages/web/src/components/offspring/Offspring.tsx modified: packages/web/src/components/settings/Settings.tsx new file: packages/web/src/components/templates/TemplateComparisonPanel.tsx deleted: packages/web/src/components/templates/TemplateComparisonPlaceholder.tsx modified: packages/web/src/components/templates/Templates.tsx modified: packages/web/src/components/themes/ThemeSelection.tsx new file: packages/web/src/components/timelines/GenerationHistoryPanel.tsx deleted: packages/web/src/components/timelines/GenerationHistoryPlaceholder.tsx modified: packages/web/src/components/timelines/Timelines.tsx modified: packages/web/src/lib/api.ts new file: packages/web/src/lib/asset-validation.test.ts modified: packages/web/src/lib/llm/google.ts modified: packages/web/src/lib/prompting/builder.ts modified: packages/web/src/lib/roadmap.ts new file: packages/web/src/lib/server/auto-sync.ts modified: packages/web/src/lib/server/client.ts modified: packages/web/src/lib/services/generation-session.ts modified: packages/web/src/lib/services/generation.ts modified: packages/web/src/lib/storage/draft-db.ts

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.2 - 2026-03-24

### Platform and templates update

This release packages 12 recent commits focused on platform, templates, and themes.

### Highlights
- Update UI text and spacing across multiple components
- Update server Docker configuration and add health checks
- Refactor blueprints and templates for character generation
- Modified: packages/server/src/middleware/auth.ts modified: packages/shared/src/parse/parse-blocks.ts modified: packages/web/src/components/batch/BatchGenerate.tsx renamed: packages/web/src/components/blueprints/BlueprintLintPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintLintPanel.tsx renamed: packages/web/src/components/blueprints/BlueprintSandboxPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx modified: packages/web/src/components/blueprints/Blueprints.tsx modified: packages/web/src/components/blueprints/blueprintLint.ts modified: packages/web/src/components/common/DataManager.tsx modified: packages/web/src/components/common/GuidedTourContext.tsx modified: packages/web/src/components/common/OnboardingPlaceholder.tsx renamed: packages/web/src/components/drafts/DraftComparisonPlaceholder.tsx -> packages/web/src/components/drafts/DraftComparisonPanel.tsx modified: packages/web/src/components/drafts/Drafts.tsx modified: packages/web/src/components/drafts/Review.tsx renamed: packages/web/src/components/drafts/ReviewChecklistPlaceholder.tsx -> packages/web/src/components/drafts/ReviewChecklistPanel.tsx new file: packages/web/src/components/drafts/VersionHistoryPanel.tsx deleted: packages/web/src/components/drafts/VersionHistoryPlaceholder.tsx modified: packages/web/src/components/generation/DraftRefiner.tsx modified: packages/web/src/components/generation/GenerationProgress.tsx modified: packages/web/src/components/generation/IntroGenerator.tsx modified: packages/web/src/components/generation/SeedGenerator.tsx modified: packages/web/src/components/offspring/Offspring.tsx modified: packages/web/src/components/settings/Settings.tsx new file: packages/web/src/components/templates/TemplateComparisonPanel.tsx deleted: packages/web/src/components/templates/TemplateComparisonPlaceholder.tsx modified: packages/web/src/components/templates/Templates.tsx modified: packages/web/src/components/themes/ThemeSelection.tsx new file: packages/web/src/components/timelines/GenerationHistoryPanel.tsx deleted: packages/web/src/components/timelines/GenerationHistoryPlaceholder.tsx modified: packages/web/src/components/timelines/Timelines.tsx modified: packages/web/src/lib/api.ts new file: packages/web/src/lib/asset-validation.test.ts modified: packages/web/src/lib/llm/google.ts modified: packages/web/src/lib/prompting/builder.ts modified: packages/web/src/lib/roadmap.ts new file: packages/web/src/lib/server/auto-sync.ts modified: packages/web/src/lib/server/client.ts modified: packages/web/src/lib/services/generation-session.ts modified: packages/web/src/lib/services/generation.ts modified: packages/web/src/lib/storage/draft-db.ts
- Refactor blueprint paths and enhance template handling

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.1 - 2026-03-24

### Platform and templates update

This release packages 12 recent commits focused on platform, templates, and themes.

### Highlights
- Update server Docker configuration and add health checks
- Refactor blueprints and templates for character generation
- Modified: packages/server/src/middleware/auth.ts modified: packages/shared/src/parse/parse-blocks.ts modified: packages/web/src/components/batch/BatchGenerate.tsx renamed: packages/web/src/components/blueprints/BlueprintLintPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintLintPanel.tsx renamed: packages/web/src/components/blueprints/BlueprintSandboxPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx modified: packages/web/src/components/blueprints/Blueprints.tsx modified: packages/web/src/components/blueprints/blueprintLint.ts modified: packages/web/src/components/common/DataManager.tsx modified: packages/web/src/components/common/GuidedTourContext.tsx modified: packages/web/src/components/common/OnboardingPlaceholder.tsx renamed: packages/web/src/components/drafts/DraftComparisonPlaceholder.tsx -> packages/web/src/components/drafts/DraftComparisonPanel.tsx modified: packages/web/src/components/drafts/Drafts.tsx modified: packages/web/src/components/drafts/Review.tsx renamed: packages/web/src/components/drafts/ReviewChecklistPlaceholder.tsx -> packages/web/src/components/drafts/ReviewChecklistPanel.tsx new file: packages/web/src/components/drafts/VersionHistoryPanel.tsx deleted: packages/web/src/components/drafts/VersionHistoryPlaceholder.tsx modified: packages/web/src/components/generation/DraftRefiner.tsx modified: packages/web/src/components/generation/GenerationProgress.tsx modified: packages/web/src/components/generation/IntroGenerator.tsx modified: packages/web/src/components/generation/SeedGenerator.tsx modified: packages/web/src/components/offspring/Offspring.tsx modified: packages/web/src/components/settings/Settings.tsx new file: packages/web/src/components/templates/TemplateComparisonPanel.tsx deleted: packages/web/src/components/templates/TemplateComparisonPlaceholder.tsx modified: packages/web/src/components/templates/Templates.tsx modified: packages/web/src/components/themes/ThemeSelection.tsx new file: packages/web/src/components/timelines/GenerationHistoryPanel.tsx deleted: packages/web/src/components/timelines/GenerationHistoryPlaceholder.tsx modified: packages/web/src/components/timelines/Timelines.tsx modified: packages/web/src/lib/api.ts new file: packages/web/src/lib/asset-validation.test.ts modified: packages/web/src/lib/llm/google.ts modified: packages/web/src/lib/prompting/builder.ts modified: packages/web/src/lib/roadmap.ts new file: packages/web/src/lib/server/auto-sync.ts modified: packages/web/src/lib/server/client.ts modified: packages/web/src/lib/services/generation-session.ts modified: packages/web/src/lib/services/generation.ts modified: packages/web/src/lib/storage/draft-db.ts
- Refactor blueprint paths and enhance template handling
- Add DraftRefiner and IntroGenerator components for refining drafts and generating intros

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.0.0 - 2026-03-24

### Documentation and templates update

This release packages 12 recent commits focused on documentation, templates, and themes.

### Highlights
- Refactor blueprints and templates for character generation
- Modified: packages/server/src/middleware/auth.ts modified: packages/shared/src/parse/parse-blocks.ts modified: packages/web/src/components/batch/BatchGenerate.tsx renamed: packages/web/src/components/blueprints/BlueprintLintPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintLintPanel.tsx renamed: packages/web/src/components/blueprints/BlueprintSandboxPlaceholder.tsx -> packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx modified: packages/web/src/components/blueprints/Blueprints.tsx modified: packages/web/src/components/blueprints/blueprintLint.ts modified: packages/web/src/components/common/DataManager.tsx modified: packages/web/src/components/common/GuidedTourContext.tsx modified: packages/web/src/components/common/OnboardingPlaceholder.tsx renamed: packages/web/src/components/drafts/DraftComparisonPlaceholder.tsx -> packages/web/src/components/drafts/DraftComparisonPanel.tsx modified: packages/web/src/components/drafts/Drafts.tsx modified: packages/web/src/components/drafts/Review.tsx renamed: packages/web/src/components/drafts/ReviewChecklistPlaceholder.tsx -> packages/web/src/components/drafts/ReviewChecklistPanel.tsx new file: packages/web/src/components/drafts/VersionHistoryPanel.tsx deleted: packages/web/src/components/drafts/VersionHistoryPlaceholder.tsx modified: packages/web/src/components/generation/DraftRefiner.tsx modified: packages/web/src/components/generation/GenerationProgress.tsx modified: packages/web/src/components/generation/IntroGenerator.tsx modified: packages/web/src/components/generation/SeedGenerator.tsx modified: packages/web/src/components/offspring/Offspring.tsx modified: packages/web/src/components/settings/Settings.tsx new file: packages/web/src/components/templates/TemplateComparisonPanel.tsx deleted: packages/web/src/components/templates/TemplateComparisonPlaceholder.tsx modified: packages/web/src/components/templates/Templates.tsx modified: packages/web/src/components/themes/ThemeSelection.tsx new file: packages/web/src/components/timelines/GenerationHistoryPanel.tsx deleted: packages/web/src/components/timelines/GenerationHistoryPlaceholder.tsx modified: packages/web/src/components/timelines/Timelines.tsx modified: packages/web/src/lib/api.ts new file: packages/web/src/lib/asset-validation.test.ts modified: packages/web/src/lib/llm/google.ts modified: packages/web/src/lib/prompting/builder.ts modified: packages/web/src/lib/roadmap.ts new file: packages/web/src/lib/server/auto-sync.ts modified: packages/web/src/lib/server/client.ts modified: packages/web/src/lib/services/generation-session.ts modified: packages/web/src/lib/services/generation.ts modified: packages/web/src/lib/storage/draft-db.ts
- Refactor blueprint paths and enhance template handling
- Add DraftRefiner and IntroGenerator components for refining drafts and generating intros
- Refactor code structure and remove redundant code blocks for improved readability and maintainability

### Links
- [Open generation](/generate)
- [Review templates](/templates)




























