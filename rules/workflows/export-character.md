# Export Character Bundle

Goal: export a draft or asset set using the current shared export model instead of the retired shell script flow.

1) Ask me for:
   - the source to export: current draft assets, a draft JSON payload, or a workspace folder of asset files
   - desired export shape: `json`, `text`, or `combined`
   - whether metadata should be included

2) Confirm the available assets.
   - Do not assume the legacy `system_prompt/post_history/character_sheet/intro_scene/intro_page/a1111/suno` pack.
   - Respect the selected template or the actual files present.

3) Export using the current model:
   - `json`: emit a JSON document with metadata and assets
   - `text`: emit plain text sections per asset
   - `combined`: emit one markdown bundle with metadata and all assets
   - If a platform-specific preset is requested, map the current assets deliberately rather than assuming a checked-in shell tool exists.

4) Report:
   - the output filename or bundle shape
   - which assets were included
   - any assets skipped because they were not present

5) Do not instruct or rely on `tools/export_character.sh`.
   - That script is not present in the current repo.
