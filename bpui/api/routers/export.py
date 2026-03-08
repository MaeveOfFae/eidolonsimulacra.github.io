"""Export router."""

import io
import json
import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ..schemas.export import ExportRequest, ExportResponse, ExportPresetSchema, FieldMappingSchema

router = APIRouter()


def _find_draft_dir(draft_id: str) -> Path:
    """Find a draft directory by ID."""
    drafts_dir = Path("drafts")
    if not drafts_dir.exists():
        raise HTTPException(status_code=404, detail="Drafts directory not found")

    for draft_path in drafts_dir.iterdir():
        if draft_path.is_dir() and draft_id in draft_path.name:
            return draft_path

    raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")


def _load_assets(draft_path: Path) -> dict[str, str]:
    """Load all assets from a draft directory."""
    assets = {}
    for file_path in draft_path.iterdir():
        if file_path.is_file() and not file_path.name.startswith('.'):
            with open(file_path, 'r', encoding='utf-8') as f:
                assets[file_path.stem] = f.read()
    return assets


def _load_metadata(draft_path: Path) -> dict:
    """Load metadata from a draft directory."""
    metadata_file = draft_path / ".metadata.json"
    if metadata_file.exists():
        with open(metadata_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


@router.get("/presets")
async def list_presets():
    """List available export presets."""
    try:
        from bpui.features.export.export_presets import list_presets as _list_presets

        presets_dir = Path("presets")
        preset_list = _list_presets(presets_dir)

        return {
            "presets": [
                {"name": name, "path": str(path)}
                for name, path in preset_list
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presets/{preset_name}")
async def get_preset(preset_name: str):
    """Get details of a specific preset."""
    try:
        from bpui.features.export.export_presets import load_preset

        preset_path = Path("presets") / f"{preset_name}.toml"
        preset = load_preset(preset_path)

        if not preset:
            raise HTTPException(status_code=404, detail=f"Preset not found: {preset_name}")

        return ExportPresetSchema(
            name=preset.name,
            format=preset.format,
            description=preset.description,
            fields=[
                FieldMappingSchema(
                    asset=f.asset,
                    target=f.target,
                    wrapper=f.wrapper,
                    optional=f.optional,
                )
                for f in preset.fields
            ],
            metadata=preset.metadata,
            output_pattern=preset.output_pattern,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def export_draft(request: ExportRequest):
    """Export a draft using a preset."""
    try:
        from bpui.features.export.export_presets import load_preset, apply_preset

        # Find draft
        draft_path = _find_draft_dir(request.draft_id)

        # Load assets and metadata
        assets = _load_assets(draft_path)
        metadata = _load_metadata(draft_path)
        character_name = metadata.get("character_name", draft_path.name)

        # Load preset
        preset_path = Path("presets") / f"{request.preset}.toml"
        if not preset_path.exists():
            # Try as direct path
            preset_path = Path(request.preset)

        preset = load_preset(preset_path)
        if not preset:
            raise HTTPException(status_code=404, detail=f"Preset not found: {request.preset}")

        # Apply preset
        export_data = apply_preset(assets, preset, character_name)

        if request.include_metadata:
            export_data["_metadata"] = {
                "source_path": str(draft_path),
                "exported_at": metadata.get("modified") or metadata.get("created"),
                "template": metadata.get("template_name"),
                "mode": metadata.get("mode"),
            }

        # Return based on format
        if preset.format == "json":
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f'attachment; filename="{character_name}.json"'
                }
            )

        elif preset.format == "combined":
            # Create combined text
            output = io.StringIO()
            for key, value in export_data.items():
                if key == "_metadata":
                    continue
                output.write(f"=== {key.upper()} ===\n\n")
                output.write(str(value))
                output.write("\n\n")

            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/plain",
                headers={
                    "Content-Disposition": f'attachment; filename="{character_name}.txt"'
                }
            )

        else:  # text format - return as zip
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                for key, value in export_data.items():
                    if key == "_metadata":
                        continue
                    ext = ".md" if key in ["intro_page"] else ".txt"
                    zf.writestr(f"{key}{ext}", str(value))

                if request.include_metadata and "_metadata" in export_data:
                    zf.writestr("_metadata.json", json.dumps(export_data["_metadata"], indent=2))

            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={
                    "Content-Disposition": f'attachment; filename="{character_name}.zip"'
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview")
async def preview_export(request: ExportRequest):
    """Preview export output without downloading."""
    try:
        from bpui.features.export.export_presets import load_preset, apply_preset

        # Find draft
        draft_path = _find_draft_dir(request.draft_id)

        # Load assets and metadata
        assets = _load_assets(draft_path)
        metadata = _load_metadata(draft_path)
        character_name = metadata.get("character_name", draft_path.name)

        # Load preset
        preset_path = Path("presets") / f"{request.preset}.toml"
        preset = load_preset(preset_path)
        if not preset:
            raise HTTPException(status_code=404, detail=f"Preset not found: {request.preset}")

        # Apply preset
        export_data = apply_preset(assets, preset, character_name)

        return {
            "character_name": character_name,
            "format": preset.format,
            "fields": list(export_data.keys()),
            "preview": {
                k: v[:200] + "..." if len(str(v)) > 200 else v
                for k, v in list(export_data.items())[:5]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
