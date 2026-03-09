#!/usr/bin/env python3

"""Validate a generated Blueprint Pack directory.

This script is intentionally heuristic: it is meant to catch the most common
workspace-breaking failures (missing files, leftover placeholders, mode
inconsistencies) without requiring external dependencies.

Usage:
  python tools/validate_pack.py path/to/dir

Exit codes:
  0 = ok
  1 = validation failed
  2 = invalid invocation
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from bpui.core.content_validation import validate_file_content
from bpui.core.parse_blocks import get_asset_filename
from bpui.features.templates.templates import TemplateManager
from bpui.utils.metadata.metadata import DraftMetadata


REQUIRED_FILES = [
    "system_prompt.txt",
    "post_history.txt",
    "character_sheet.txt",
    "intro_scene.txt",
    "intro_page.md",
    "a1111_prompt.txt",
    "suno_prompt.txt",
]

OPTIONAL_FILES = [
    "a1111_sdxl_prompt.txt",
]


@dataclass
class Finding:
    path: Path
    message: str


@dataclass
class ValidationPlan:
    required_files: list[Path]
    optional_files: list[Path]
    template_name: str | None = None


def iter_files(base_dir: Path) -> Iterable[Path]:
    for rel in REQUIRED_FILES + OPTIONAL_FILES:
        p = base_dir / rel
        if p.exists():
            yield p


def build_validation_plan(base_dir: Path) -> ValidationPlan:
    metadata = DraftMetadata.load(base_dir)
    template_name = metadata.template_name if metadata else None

    if not template_name or template_name == "V2/V3 Card":
        return ValidationPlan(
            required_files=[base_dir / rel for rel in REQUIRED_FILES],
            optional_files=[base_dir / rel for rel in OPTIONAL_FILES],
            template_name=template_name,
        )

    template = TemplateManager().get_template(template_name)
    if not template:
        raise ValueError(f"Template not found for validation: {template_name}")

    required_files: list[Path] = []
    optional_files: list[Path] = []
    for asset in template.assets:
        asset_path = base_dir / get_asset_filename(asset.name, template)
        if asset.required:
            required_files.append(asset_path)
        else:
            optional_files.append(asset_path)

    return ValidationPlan(
        required_files=required_files,
        optional_files=optional_files,
        template_name=template_name,
    )


def validate_required_files(required_files: Iterable[Path]) -> list[Finding]:
    findings: list[Finding] = []
    for p in required_files:
        if not p.is_file():
            findings.append(Finding(p, f"Missing required file: {p.name}"))
    return findings


def validate_placeholders(files: Iterable[Path]) -> list[Finding]:
    findings: list[Finding] = []
    for file_path in files:
        if not file_path.is_file():
            continue
        labels = validate_file_content(file_path)
        for label in sorted(set(labels)):
            findings.append(Finding(file_path, f"Found validation issue: {label}"))

    return findings


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Validate a Blueprint Pack output directory")
    parser.add_argument("dir", help="Directory containing exported pack files")
    args = parser.parse_args(argv)

    base_dir = Path(args.dir).expanduser().resolve()
    if not base_dir.is_dir():
        print(f"ERROR: Not a directory: {base_dir}")
        return 2

    try:
        plan = build_validation_plan(base_dir)
    except ValueError as error:
        print(f"ERROR: {error}")
        return 1

    findings: list[Finding] = []
    findings.extend(validate_required_files(plan.required_files))
    # Only run content checks if the required set exists.
    if not any(f.message.startswith("Missing required file") for f in findings):
        findings.extend(validate_placeholders([*plan.required_files, *plan.optional_files]))
        # Note: validate_a1111_mode removed - [Content: SFW|NSFW] is now optional

    if findings:
        print("VALIDATION FAILED")
        for f in findings:
            print(f"- {f.path}: {f.message}")
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
