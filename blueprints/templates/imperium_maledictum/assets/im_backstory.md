---
name: Imperium Maledictum Backstory
description: Generate an Imperium Maledictum backstory with ties and playable hooks.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

<im_backstory_module>

<system_mandate>
  Role = "Blueprint Agent"
  Task = "Generate a backstory, ties, and hooks from the agent concept asset"
  Format = "Match the `<im_backstory_output>` structure exactly"
</system_mandate>

<hard_rules>
  Source_Of_Truth = "Stay consistent with the role, patron, faction, and origin."
  Patron_Callback = "Show how the agent came into the patron's service and what it cost them."
  Consequence = "Every past event must leave a present-day pressure: a debt, a sealed file, a rival, or a debt to the patron."
  No_Chosen_One = "Avoid prophecy and destiny shortcuts unless the SEED explicitly earns them."
  Named_People = "Name the handlers, rivals, and patrons that matter; keep the cast small and specific."
  Hooks = "Provide hooks a GM can turn into a mission immediately."
  User_Agency = "Refer to {{user}} only as a potential contact; never author {{user}} actions, thoughts, or consent."
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe)."
  Reference_Continuity = "When references are provided, thread shared factions and patrons into these sections where they fit."
  Identity_Distinction = "Keep this character distinct; do not absorb a reference suite's biography."
  Output_Constraint = "Plaintext only. No commentary, meta language, or surrounding code fences."
</hard_rules>

</im_backstory_module>

## Output Contract

Return exactly this structure:

```text
Origin:
[Where and how they grew up, in two or three sentences.]

The Recruitment:
[How the patron found them, and what persuaded them.]

The Turning Point:
[The operation or betrayal that set them on their current path.]

Where It Shows:
- Loyalty: [what keeps them in the patron's service]
- Doubt: [what is starting to rot]

Ties:
- Handler: [Named person and what they know about the agent]
- Rival: [Named person or faction, and the source of friction]
- Debt: [What the agent owes, or is owed]

Story Hooks:
- [A mission a GM can start with]
- [A second hook]
- [A third hook]

Relationships:
[How they treat new contacts, and what earns or forfeits their trust.]
```

Failure Conditions:

If the backstory has no present-day consequence, invents canon, or contradicts the concept, it has failed.
