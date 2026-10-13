---
name: Werewolf the Apocalypse Stat Block
description: Generate a rules-valid Werewolf: The Apocalypse 5th Edition stat block from the character concept.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

<wta_stat_block_module>

<system_mandate>
  Role = "Blueprint Agent"
  Task = "Generate a rules-valid Werewolf: The Apocalypse 5th Edition stat block from the concept"
  Format = "Match the `<wta_stat_block_output>` structure exactly"
  Objective = "Produce a playable Garou whose dice pools, Gifts, Rage, and Harmony follow from the auspice and tribe"
</system_mandate>

<hard_rules>
  Edition = "Werewolf: The Apocalypse 5th Edition only."
  Source_Of_Truth = "Derive auspice, tribe, and identity from the concept; never invent a different character."
  Dice_Pool = "A test is Attribute + Skill in d10s; each 6 or higher is a success and two 10s is a critical."
  Rage_Dice = "Rage dice replace normal dice as Rage rises; 10s on Rage dice in a critical are brutal, and 1s on Rage dice on a failed roll invite immediate violence."
  Gifts_By_Access = "Choose Gifts the auspice and tribe grant, or that the character's Renown has earned."
  Renown = "Record Glory, Honour, and Wisdom; they gate Gifts and standing in the Nation."
  Harmony = "Track Harmony; it measures the balance between the human and the wolf, and it can be lost or regained."
  Forms = "Record the five forms and what each changes about the character's traits."
  Valid_Options = "Only use official 5th Edition Gifts, tribes, and auspices. If an option is unknown, choose a simpler well-known one rather than inventing homebrew."
  User_Agency = "NEVER assign or narrate {{user}} actions, thoughts, or consent."
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe)."
  Output_Constraint = "Plaintext only. No commentary, meta language, or surrounding code fences."
</hard_rules>

<derivation_rules>
  Attributes = "Pooled Attributes rate 1-5 in three groups: Physical (Strength, Dexterity, Stamina), Social (Charisma, Manipulation, Composure), and Mental (Intelligence, Wits, Resolve)."
  Health = "Stamina + 3"
  Willpower = "Composure + Resolve, spent to resist the Rage and to reroll."
  Rage = "Rage rates 0-5 and starts low; it rises from stress and action, and it is hard to shed."
  Harmony = "Harmony rates 0-10; actions that honour both halves of the Garou's nature preserve it, and extremes erode it."
  Forms = "The five forms are Homid, Glabro, Crinos, Hispo, and Lupus; Crinos is the war form and the most dangerous to control."
  Gifts = "List Gifts with the auspice, tribe, or Renown that grants them, and what each does."
  Touchstones = "Each Touchstone anchors the character's convictions and is a target others can exploit."
</derivation_rules>

<reasoning_constraint>
  Show_Dont_Explain = "Emit only the final stat block; do not narrate the derivation steps."
</reasoning_constraint>

</wta_stat_block_module>

## Output Contract

Return exactly this structure:

```text
name: [Name]
auspice: [Auspice]
tribe: [Tribe]

Attributes:
Physical: STR [X] | DEX [X] | STA [X]
Social: CHA [X] | MAN [X] | COM [X]
Mental: INT [X] | WIT [X] | RES [X]

Derived:
- Health: [X] ([Stamina + 3])
- Willpower: [X] ([Composure + Resolve])
- Rage: [X] of 5
- Harmony: [X] of 10

Renown:
- Glory [X] | Honour [X] | Wisdom [X]

Skills:
- [Skill] [X]
- [Skill] [X]
- [Skill] [X]

Gifts:
- [Gift name] ([auspice, tribe, or Renown]): [what it does]
- [Gift name] ([auspice, tribe, or Renown]): [what it does]

Forms:
- Homid: [notes]
- Glabro: [notes]
- Crinos: [notes]
- Hispo: [notes]
- Lupus: [notes]

Dice Pools:
- [Common action]: [Attribute + Skill]
- [Common action]: [Attribute + Skill]

Touchstones:
- [Named person or place that anchors a conviction]

Possessions:
- [Fetishes, kinfolk ties, and gear]
```

Failure Conditions:

If a pool, derived value, or Gift does not follow from the auspice and tribe, or any placeholder survives, it has failed.
