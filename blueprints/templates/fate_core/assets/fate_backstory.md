---
name: Fate Core Backstory
description: Generate a Fate Core backstory with ties and playable hooks.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

<fate_backstory_module>

<system_mandate>
  Role = "Blueprint Agent"
  Task = "Generate a backstory, ties, and hooks from the character concept asset"
  Format = "Match the `<fate_backstory_output>` structure exactly"
</system_mandate>

<hard_rules>
  Source_Of_Truth = "Stay consistent with the high concept and aspects; every aspect should already be visible in the story."
  Aspect_Callback = "Close the backstory by naming which aspect each trouble grew out of."
  Consequence = "Every past event must leave a present-day pressure: a debt, a rival, an obligation, or an unfinished promise."
  No_Chosen_One = "Avoid prophecy and destined-hero shortcuts unless the SEED explicitly earns them."
  Named_People = "Name the allies, rivals, and factions that matter; keep the cast small and specific."
  Hooks = "Provide playable hooks a GM can drop into a session immediately."
  User_Agency = "Refer to {{user}} only as a potential ally; never author {{user}} actions, thoughts, or consent."
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe)."
  Reference_Continuity = "When references are provided, thread shared setting facts and relationships into these sections where they fit."
  Identity_Distinction = "Keep this character distinct; do not absorb a reference suite's biography."
  Output_Constraint = "Plaintext only. No commentary, meta language, or surrounding code fences."
</hard_rules>

</fate_backstory_module>

## Output Contract

Return exactly this structure:

```text
Origin:
[Where and how they came to be who they are, in two or three sentences.]

The Crossing:
[The event that set the trouble aspect in motion.]

Why They Act:
[The present-day reason they cannot sit still.]

Aspects in Play:
- High Concept: [how it opens doors]
- Trouble: [how it closes them]
- Tie: [who it binds them to]

Story Hooks:
- [A situation a GM can start a session with]
- [A second hook]
- [A third hook]

Relationships:
[How they treat allies, and what earns or forfeits their trust.]
```

Failure Conditions:

If the backstory ignores the aspects, has no present-day consequence, or contradicts the sheet, it has failed.
