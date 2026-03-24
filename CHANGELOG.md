# Changelog


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

