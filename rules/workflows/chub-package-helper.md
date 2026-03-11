# Chub Packaging Helper (Metadata + Greetings)

Goal: prepare Chub-facing fields and ensure greeting/alternates follow Chub formatting.

1) Ask me for:
   - intended rating: SFW or NSFW
   - 5–10 tags you want (or let me propose them)
   - whether you want alternate greetings (count)

2) Enforce Chub metadata rules:
   - ensure at least 3 accurate tags (otherwise character is hidden in search)
   - rating accurate (SFW vs NSFW)
   - avoid NSFW avatar recommendation if you ask for avatar notes

3) Greetings:
   - produce one initial message sourced from the active draft's opener asset
   - for `V2/V3 Card`, that usually means `intro_scene`
   - for `Official Aksho`, that usually means `initial_message`
   - if alternate greetings requested:
     - each alternate MUST start with ```"<START>"```

4) Macro hygiene:
   - use {{user}} and {{char}} correctly
   - optionally include time/date macros only if requested

5) Export note:
   - the repo contains Chub-oriented preset definitions under `presets/`, but the current browser app's export menu is built around `json`, `text`, and `combined`
   - if you want final Chub JSON in this workspace, treat it as a content-mapping task rather than a shell export step
