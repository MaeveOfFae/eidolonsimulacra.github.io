# Generate Full Suite from Seed

Goal: compile one seed into a complete template-specific asset suite using the official orchestrator and the selected template's asset blueprints.

1) Ask me for:
   - seed (one line)
   - template: default to `V2/V3 Card` unless I specify another official or custom template
   - mode (optional): `SFW`, `NSFW`, `Platform-Safe`, or `Auto`
   - output target:
     a) asset codeblocks only
     b) app-ready asset text for manual paste into the browser flow

2) Open and read:
   - `blueprints/system/rpbotgenerator.md`
   - the selected template's `template.toml`
   - every asset blueprint referenced by that template

3) Validate the seed against the orchestrator contract:
   - it should imply a power dynamic, emotional temperature, tension axis, and why `{{user}}` matters as an anchor rather than an authored actor

4) Compile assets in the template's declared dependency order.
   - For `V2/V3 Card`, that is `system_prompt -> post_history -> character_sheet -> intro_scene -> intro_page -> a1111`
   - For `Official Aksho`, that is `system_prompt -> char_basic_info -> char_physical -> char_clothing -> char_personality -> char_background -> post_history -> initial_message`
   - Do not hardcode `suno` into the default flow.
   - Output only the asset codeblocks plus an `Adjustment Note` block if the orchestrator requires it.

5) Final checks before returning output:
   - no placeholders remain: `{PLACEHOLDER}`, `((...))`, `{TITLE}`, bracket fields, or example-name leaks
   - mode is respected across all generated assets
   - no authored `{{user}}` actions, thoughts, sensations, decisions, or consent
   - no contradictions across assets
   - output count and order exactly match the selected template

6) If asked to persist results, prefer the current browser workflow.
   - This repo does not ship a checked-in shell export pipeline or `/output` writer.
   - Treat saved files as an explicit follow-up task, not a default behavior.
