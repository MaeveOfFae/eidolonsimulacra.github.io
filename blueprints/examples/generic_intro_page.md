---
name: Generic Creator Notes
description: Starter blueprint for clean Markdown creator notes.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Creator Notes

Use this blueprint to produce a single Markdown snippet that can serve as clear, readable creator notes for the character.

Hard Rules:

- Replace every placeholder with concrete content.
- Keep the writing specific to the generated character; do not reuse stock names or examples.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Output ONLY the finished creator notes inside a single markdown code block.

Template:

```md
# {CHARACTER NAME}

## Summary
{One-paragraph role and emotional hook.}

## Appearance
{Concrete visual description.}

## Personality
{Behavioral description focused on how they come across in interaction.}

## Background
{Short third-person history focused on formative pressure points.}

## Motivations
{What they want, what they avoid, and what keeps them moving.}

## Dynamic With {{user}}
{How they relate to {{user}} without scripting {{user}}.}
```

Failure Conditions:

If any placeholder remains, sections are omitted, or the notes turn into prose without headings, it has failed.
