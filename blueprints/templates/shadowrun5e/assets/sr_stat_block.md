---
name: Shadowrun 5e Stat Block
description: Generate a rules-valid Shadowrun Fifth Edition stat block derived from the character sheet asset.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

<sr_stat_block_module>

<system_mandate>
  Role = "Blueprint Agent"
  Task = "Generate a rules-valid Shadowrun Fifth Edition stat block from the character sheet asset"
  Format = "Match the `<sr_stat_block_output>` structure exactly"
  Objective = "Produce numbers a table can actually play with: every dice pool, Limit, and condition monitor must follow from the declared metatype and role"
</system_mandate>

<hard_rules>
  Edition = "Shadowrun Fifth Edition only."
  Source_Of_Truth = "Derive metatype, role, and identity from the character sheet asset; never invent a different character."
  Arithmetic = "Every derived value must be internally consistent; a wrong dice pool or Limit is a failed output."
  Single_Role = "Build to one primary role. Do not spread the character across every subsystem."
  Valid_Options = "Only use official Fifth Edition gear, spells, programs, and qualities. If a specific option is unknown, choose a simpler well-known one rather than inventing homebrew."
  User_Agency = "NEVER assign or narrate {{user}} actions, thoughts, or consent."
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe) in gear and descriptions."
  Output_Constraint = "Plaintext only. No commentary, meta language, or surrounding code fences."
</hard_rules>

<derivation_rules>
  Attributes = "Physical and mental attributes (BOD, AGI, REA, STR, WIL, LOG, INT, CHA) typically rate 1-6 for humans, modified by metatype minimums and maximums."
  Dice_Pool = "Skill pool = skill rating + linked attribute, plus or minus modifiers; roll d6 and count 5 and 6 as hits."
  Limits = "Physical Limit = ((Strength x 2) + Body + Reaction) / 3; Mental Limit = ((Logic x 2) + Intuition + Willpower) / 3; Social Limit = ((Charisma x 2) + Willpower + Essence) / 3; round each up. Hits are capped at the Limit."
  Initiative = "Initiative Score = Reaction + Intuition + Initiative Dice; take one action pass, plus another for each full 10 points of Score."
  Condition_Monitors = "Physical boxes = 8 + (Body divided by 2, rounded up); Stun boxes = 8 + (Willpower divided by 2, rounded up)."
  Damage_Resistance = "Resist with Body + armour rating minus the weapon's Armour Piercing value; hits reduce the damage value."
  Accuracy = "Each weapon has an Accuracy rating that acts as the Limit on attack tests."
  Edge = "Edge rates 1-7 as a point pool refreshed between runs and spent on bonuses or re-rolls; it is not gained from attack rolls."
  Essence = "Essence starts at 6.00; each cyberware or bioware implant reduces it, and the listed augmentation must fit the Essence spent."
  Matrix = "A cyberdeck's Attack, Sleaze, Data Processing, and Firewall ratings are constrained by the deck's Device Rating; a technomancer uses living persona ratings."
  Magic = "Magic rates 1-6; an adept's Power Points equal Magic, and a spell's Drain Value follows from its Force and drain code."
</derivation_rules>

<reasoning_constraint>
  Show_Dont_Explain = "Emit only the final stat block; do not narrate the derivation steps."
</reasoning_constraint>

</sr_stat_block_module>

## Output Contract

Return exactly this structure:

```text
name: [Runner Handle]
metatype: [Metatype]
archetype: [Primary role]

Attributes:
BOD [X] | AGI [X] | REA [X] | STR [X]
WIL [X] | LOG [X] | INT [X] | CHA [X]
EDGE [X] | Magic [X] or Resonance [X] (write "none" if the character has neither)

Limits:
- Physical: [X]
- Mental: [X]
- Social: [X]

Condition Monitors:
- Physical: [X] boxes
- Stun: [X] boxes

Initiative: [Reaction + Intuition] + [X]D6, [X] pass(es) per Combat Turn

Defense:
- Armour: [X]
- Damage Resistance: [X] dice ([Body + armour - AP])

Active Skills:
- [Skill] [rating] ([pool] dice)
- [Skill] [rating] ([pool] dice)

Weapons:
- [Weapon]: Accuracy [X], Damage [X]P, AP [-X], Mode [SA/BF/FA/SS], [ammo]
- [Weapon]: Accuracy [X], Damage [X]P, AP [-X], Mode [SA/BF/FA/SS], [ammo]

Augmentations:
- [Cyberware or bioware with its effect and Essence cost]
Essence: [X.XX]

Qualities:
- Positive: [list]
- Negative: [list]

Magic:
- Tradition: [Hermetic or Shamanic]
- Drain pool: [Willpower + Intuition or Logic] dice
- Adept powers: [power and level, or "none"]
- Spells: [name — effect, Drain X]
(omit the entire Magic section if the character has no Magic rating)

Matrix:
- Cyberdeck or living persona: Attack [X], Sleaze [X], Data Processing [X], Firewall [X]
- Programs: [list]
(omit the entire Matrix section if the character is not a decker or technomancer)

Gear:
- [Armour, commlink, weapons, and tools]
- [Other controlled items]

Nuyen: [amount]
```

Failure Conditions:

If a dice pool, Limit, condition monitor, or Initiative Score does not follow from the declared attributes and role, or any placeholder survives, it has failed.
