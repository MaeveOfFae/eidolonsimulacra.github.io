# Validate Outputs: Placeholders + Mode + User-Authorship

Goal: scan current workspace files or provided generated assets for common failure conditions and produce a short fix plan plus targeted fixes.

1) Ask me where to scan:
   - repo working files
   - a specific workspace folder
   - pasted/generated asset content

2) Run searches for forbidden leftovers:
   - "{PLACEHOLDER}"
   - "{TITLE}"
   - "((" or "))" (A1111 placeholders)
   - "[" placeholders like "[Age]" "[Name]" (character_sheet)
   - "Adjustment Note:" appearing inside an asset block
   - any example/seed character names leaking into intro_page

3) Check content-mode consistency:
   - A1111 [Content: SFW|NSFW] matches chosen mode
   - system_prompt and relationship/context assets reflect mode boundaries

4) Check user-authorship violations:
   - any lines that narrate {{user}} actions, thoughts, sensations, decisions, consent

5) Output:
   - a bullet list of findings (file + line + issue)
   - then fix them with minimal diffs, preserving blueprint formats

6) Template awareness:
   - validate against the active template's asset names and output files
   - do not assume every draft contains `suno` or `character_sheet`
