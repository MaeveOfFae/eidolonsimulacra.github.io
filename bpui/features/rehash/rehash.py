"""Character rehash functionality - regenerate characters with variations.

This module provides the ability to take an existing character (from a draft
directory, external file, or raw text) and "rehash" them - generating a new
SEED that can be used to regenerate the character with variations.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any


# Available rehash variation types
REHASH_VARIATIONS = {
    "remix": "Create a fresh variation while keeping the core concept intact",
    "twist": "Add a surprising twist or subversion to the character",
    "evolve": "Evolve the character forward in time with new developments",
    "darken": "Emphasize darker aspects and add depth to flaws",
    "lighten": "Soften edges and emphasize positive traits",
    "invert": "Flip key traits while keeping the core dynamic",
    "intensify": "Amplify existing traits for a more extreme version",
    "soften": "Make the character more approachable and relatable",
}


def load_character_for_rehash(
    source: Path,
    drafts_root: Optional[Path] = None
) -> Tuple[Dict[str, str], str, Optional[Dict[str, Any]]]:
    """Load character data from various sources for rehashing.

    Args:
        source: Path to character source. Can be:
            - A draft directory (timestamped folder)
            - A JSON file with character data
            - A text file with character sheet content
            - A markdown file with character info
        drafts_root: Root drafts directory for resolving relative paths

    Returns:
        Tuple of (assets dict, source_type, metadata dict or None)
        - assets: Dict mapping asset names to content
        - source_type: One of "draft", "json", "text", "markdown"
        - metadata: Optional metadata dict if available
    """
    source = Path(source)

    if not source.exists():
        raise FileNotFoundError(f"Source not found: {source}")

    # Check if it's a directory (draft)
    if source.is_dir():
        return _load_from_draft(source)

    # Check file extension
    suffix = source.suffix.lower()

    if suffix == ".json":
        return _load_from_json(source)
    elif suffix in (".md", ".markdown"):
        return _load_from_markdown(source)
    else:
        # Treat as plain text (character sheet)
        return _load_from_text(source)


def _load_from_draft(draft_dir: Path) -> Tuple[Dict[str, str], str, Optional[Dict[str, Any]]]:
    """Load character from a draft directory."""
    from bpui.utils.file_io.pack_io import load_draft
    from bpui.utils.metadata.metadata import DraftMetadata

    assets = load_draft(draft_dir)
    if not assets:
        raise ValueError(f"No assets found in draft: {draft_dir}")

    metadata = None
    meta = DraftMetadata.load(draft_dir)
    if meta:
        metadata = meta.to_dict()

    return assets, "draft", metadata


def _load_from_json(json_path: Path) -> Tuple[Dict[str, str], str, Optional[Dict[str, Any]]]:
    """Load character from a JSON file.

    Expected formats:
    - ChubAI/TavernAI character card format
    - Custom format with 'assets' or 'character_sheet' keys
    """
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    assets = {}
    metadata = None

    # Try ChubAI/TavernAI format
    if "data" in data:
        # TavernAI character card
        char_data = data["data"]
        if "system_prompt" in char_data:
            assets["system_prompt"] = char_data["system_prompt"]
        if "post_history_instructions" in char_data or "post_history" in char_data:
            assets["post_history"] = char_data.get("post_history_instructions") or char_data.get("post_history", "")
        if "description" in char_data or "character_sheet" in char_data:
            assets["character_sheet"] = char_data.get("character_sheet") or char_data.get("description", "")
        if "first_mes" in char_data or "intro_scene" in char_data:
            assets["intro_scene"] = char_data.get("intro_scene") or char_data.get("first_mes", "")
        if "mes_example" in char_data or "intro_page" in char_data:
            assets["intro_page"] = char_data.get("intro_page") or char_data.get("mes_example", "")

        metadata = {
            "character_name": char_data.get("name", "Unknown"),
            "source": "character_card",
        }
    elif "assets" in data:
        # Custom format with assets dict
        assets = data["assets"]
        metadata = data.get("metadata")
    elif "character_sheet" in data:
        # Simple format with character_sheet
        assets["character_sheet"] = data["character_sheet"]
        if "system_prompt" in data:
            assets["system_prompt"] = data["system_prompt"]
        if "post_history" in data:
            assets["post_history"] = data["post_history"]
        if "intro_scene" in data:
            assets["intro_scene"] = data["intro_scene"]
        metadata = {
            "character_name": data.get("name", "Unknown"),
            "source": "json",
        }
    else:
        # Try to extract what we can
        for key in ["system_prompt", "post_history", "character_sheet", "intro_scene", "intro_page"]:
            if key in data:
                assets[key] = str(data[key])
        if "name" in data:
            metadata = {"character_name": data["name"]}

    if not assets:
        raise ValueError(f"No character data found in JSON: {json_path}")

    return assets, "json", metadata


def _load_from_markdown(md_path: Path) -> Tuple[Dict[str, str], str, Optional[Dict[str, Any]]]:
    """Load character from a markdown file."""
    content = md_path.read_text(encoding='utf-8')

    # Try to extract character sheet from markdown
    assets = {"character_sheet": content}

    # Look for frontmatter
    metadata = None
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            import yaml
            try:
                frontmatter = yaml.safe_load(parts[1])
                if frontmatter:
                    metadata = frontmatter
            except:
                pass

    return assets, "markdown", metadata


def _load_from_text(txt_path: Path) -> Tuple[Dict[str, str], str, Optional[Dict[str, Any]]]:
    """Load character from a plain text file."""
    content = txt_path.read_text(encoding='utf-8')

    # Treat the entire content as character sheet
    assets = {"character_sheet": content}

    # Try to extract name from content
    metadata = None
    for line in content.split("\n")[:10]:
        if line.lower().startswith("name:"):
            name = line.split(":", 1)[1].strip()
            metadata = {"character_name": name}
            break

    return assets, "text", metadata


def build_rehash_prompt(
    assets: Dict[str, str],
    variation: str = "remix",
    mode: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    custom_instructions: Optional[str] = None,
    repo_root: Optional[Path] = None,
) -> Tuple[str, str]:
    """Build prompt for rehashing a character.

    Args:
        assets: Dict mapping asset names to content
        variation: Type of variation (remix, twist, evolve, etc.)
        mode: Content mode (SFW/NSFW/Platform-Safe) or None for auto
        metadata: Optional metadata about the character
        custom_instructions: Optional custom instructions for rehashing
        repo_root: Repository root path

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    variation_desc = REHASH_VARIATIONS.get(variation, REHASH_VARIATIONS["remix"])

    system_prompt = f"""# Character Rehasher

You are an expert character designer specializing in character reimagining and variation.

Your task is to take an existing character and generate a NEW SEED that will produce a rehashed version of them. The variation type is: **{variation.upper()}** - {variation_desc}

## Your Process

1. **Analyze the Source Material**
   - Identify the core concept and essential traits
   - Note the power dynamic and relationship to {{{{user}}}}
   - Understand the emotional temperature and tension axis
   - Recognize what makes this character compelling

2. **Apply the Variation**
   - For REMIX: Keep the core intact, refresh the presentation
   - For TWIST: Add a surprising subversion or unexpected element
   - For EVOLVE: Move the character forward with new developments
   - For DARKEN: Emphasize flaws and add depth to darker aspects
   - For LIGHTEN: Soften edges and emphasize positive traits
   - For INVERT: Flip key traits while preserving the core dynamic
   - For INTENSIFY: Amplify existing traits for a more extreme version
   - For SOFTEN: Make the character more approachable and relatable

3. **Generate a NEW SEED**
   - The seed must capture the rehashed version
   - Maintain the core dynamic with {{{{user}}}}
   - Preserve what makes the character work
   - Add the variation's flavor naturally

## SEED Guidelines

Good seeds imply:
- **Power Dynamic**: Who has leverage and why
- **Emotional Temperature**: Tension level of the relationship
- **Tension Axis**: What creates conflict
- **Why {{{{user}}}} Matters**: Role, connection, obligation (without asserting user actions)

## Output Format

Output ONLY the new SEED. No explanation, no breakdown, no metadata.
The seed should be 1-3 sentences that capture the rehashed character.

## Rules

- **Never narrate {{{{user}}}} actions, thoughts, emotions, or decisions**
- Keep the power dynamic intact (don't flip it unless using "invert")
- Maintain the core tension that makes the character work
- The rehashed version should feel like the same character evolved, not a stranger
"""

    # Build user prompt with character data
    user_lines = []

    # Add mode if specified
    if mode:
        user_lines.append(f"Mode: {mode}")

    # Add variation type
    user_lines.append(f"Variation: {variation.upper()}")
    user_lines.append("")

    # Add character name if known
    if metadata and metadata.get("character_name"):
        user_lines.append(f"## CHARACTER: {metadata['character_name']}")
        user_lines.append("")

    # Add available assets
    if "character_sheet" in assets:
        user_lines.append("### Character Sheet:")
        user_lines.append("```")
        user_lines.append(assets["character_sheet"])
        user_lines.append("```")
        user_lines.append("")

    if "system_prompt" in assets:
        user_lines.append("### System Prompt:")
        user_lines.append("```")
        user_lines.append(assets["system_prompt"])
        user_lines.append("```")
        user_lines.append("")

    if "post_history" in assets:
        user_lines.append("### Post History:")
        user_lines.append("```")
        user_lines.append(assets["post_history"])
        user_lines.append("```")
        user_lines.append("")

    if "intro_scene" in assets:
        user_lines.append("### Intro Scene:")
        user_lines.append("```")
        user_lines.append(assets["intro_scene"])
        user_lines.append("```")
        user_lines.append("")

    # Add custom instructions if provided
    if custom_instructions:
        user_lines.append("## CUSTOM INSTRUCTIONS:")
        user_lines.append(custom_instructions)
        user_lines.append("")

    # Final instruction
    user_lines.append("## TASK:")
    user_lines.append(f"Generate a NEW SEED for this character with the '{variation}' variation applied.")
    user_lines.append("Output ONLY the seed - no explanation, no metadata.")

    return system_prompt, "\n".join(user_lines)
