"""Drafts router."""

import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ..schemas.drafts import (
    DraftMetadataSchema,
    DraftDetailResponse,
    DraftListResponse,
    DraftUpdate,
    AssetUpdate,
)

router = APIRouter()

# Default drafts directory
DRAFTS_DIR = Path("drafts")


def _get_drafts_dir() -> Path:
    """Get the drafts directory path."""
    # Try to get from config, fall back to default
    try:
        from bpui.core.config import load_config
        config = load_config()
        if hasattr(config, 'drafts_dir') and config.drafts_dir:
            return Path(config.drafts_dir)
    except Exception:
        pass
    return DRAFTS_DIR


def _load_metadata(draft_path: Path) -> Optional[dict]:
    """Load metadata from a draft directory."""
    metadata_file = draft_path / ".metadata.json"
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            return json.load(f)
    return None


def _load_assets(draft_path: Path) -> dict[str, str]:
    """Load all assets from a draft directory."""
    assets = {}
    for file_path in draft_path.iterdir():
        if file_path.is_file() and not file_path.name.startswith('.'):
            with open(file_path, 'r') as f:
                assets[file_path.stem] = f.read()
    return assets


@router.get("", response_model=DraftListResponse)
async def list_drafts(
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    favorite: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List all drafts with optional filtering."""
    drafts_dir = _get_drafts_dir()

    if not drafts_dir.exists():
        return DraftListResponse(drafts=[], total=0, stats={"total_drafts": 0, "favorites": 0, "by_genre": {}, "by_mode": {}})

    drafts = []
    stats = {
        "total_drafts": 0,
        "favorites": 0,
        "by_genre": {},
        "by_mode": {},
    }

    for draft_path in drafts_dir.iterdir():
        if not draft_path.is_dir():
            continue

        metadata = _load_metadata(draft_path)
        if not metadata:
            continue

        # Apply filters
        if search and search.lower() not in metadata.get('seed', '').lower():
            if search.lower() not in metadata.get('character_name', '').lower():
                continue
        if genre and metadata.get('genre') != genre:
            continue
        if mode and metadata.get('mode') != mode:
            continue
        if favorite is not None and metadata.get('favorite', False) != favorite:
            continue

        # Update stats
        stats["total_drafts"] += 1
        if metadata.get('favorite'):
            stats["favorites"] += 1
        if metadata.get('genre'):
            stats["by_genre"][metadata['genre']] = stats["by_genre"].get(metadata['genre'], 0) + 1
        if metadata.get('mode'):
            stats["by_mode"][metadata['mode']] = stats["by_mode"].get(metadata['mode'], 0) + 1

        drafts.append(DraftMetadataSchema(
            seed=metadata.get('seed', draft_path.name),
            mode=metadata.get('mode'),
            model=metadata.get('model'),
            created=metadata.get('created'),
            modified=metadata.get('modified'),
            tags=metadata.get('tags'),
            genre=metadata.get('genre'),
            notes=metadata.get('notes'),
            favorite=metadata.get('favorite', False),
            character_name=metadata.get('character_name'),
            template_name=metadata.get('template_name'),
            parent_drafts=metadata.get('parent_drafts'),
            offspring_type=metadata.get('offspring_type'),
        ))

    # Sort by created date (newest first)
    drafts.sort(key=lambda d: d.created or '', reverse=True)

    # Apply pagination
    total = len(drafts)
    drafts = drafts[offset:offset + limit]

    return DraftListResponse(drafts=drafts, total=total, stats=stats)


@router.get("/{draft_id}", response_model=DraftDetailResponse)
async def get_draft(draft_id: str):
    """Get a specific draft with all assets."""
    drafts_dir = _get_drafts_dir()

    # Find the draft directory
    draft_path = None
    for path in drafts_dir.iterdir():
        if path.is_dir():
            metadata = _load_metadata(path)
            if metadata and metadata.get('seed') == draft_id:
                draft_path = path
                break
            # Also check by directory name
            if draft_id in path.name:
                draft_path = path
                break

    if not draft_path:
        raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")

    metadata = _load_metadata(draft_path)
    assets = _load_assets(draft_path)

    return DraftDetailResponse(
        metadata=DraftMetadataSchema(
            seed=metadata.get('seed', draft_id),
            mode=metadata.get('mode'),
            model=metadata.get('model'),
            created=metadata.get('created'),
            modified=metadata.get('modified'),
            tags=metadata.get('tags'),
            genre=metadata.get('genre'),
            notes=metadata.get('notes'),
            favorite=metadata.get('favorite', False),
            character_name=metadata.get('character_name'),
            template_name=metadata.get('template_name'),
            parent_drafts=metadata.get('parent_drafts'),
            offspring_type=metadata.get('offspring_type'),
        ),
        assets=assets,
        path=str(draft_path),
    )


@router.put("/{draft_id}", response_model=DraftDetailResponse)
async def update_draft(draft_id: str, update: DraftUpdate):
    """Update a draft's metadata or assets."""
    drafts_dir = _get_drafts_dir()

    # Find the draft directory
    draft_path = None
    for path in drafts_dir.iterdir():
        if path.is_dir():
            metadata = _load_metadata(path)
            if metadata and metadata.get('seed') == draft_id:
                draft_path = path
                break

    if not draft_path:
        raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")

    # Update metadata
    if update.metadata:
        metadata = _load_metadata(draft_path) or {}
        metadata.update(update.metadata)
        with open(draft_path / ".metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)

    # Update assets
    if update.assets:
        for asset_name, content in update.assets.items():
            asset_file = draft_path / f"{asset_name}.txt"
            with open(asset_file, 'w') as f:
                f.write(content)

    return await get_draft(draft_id)


@router.put("/{draft_id}/assets/{asset_name}")
async def update_asset(draft_id: str, asset_name: str, update: AssetUpdate):
    """Update a single asset in a draft."""
    drafts_dir = _get_drafts_dir()

    # Find the draft directory
    draft_path = None
    for path in drafts_dir.iterdir():
        if path.is_dir():
            metadata = _load_metadata(path)
            if metadata and metadata.get('seed') == draft_id:
                draft_path = path
                break

    if not draft_path:
        raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")

    # Determine file extension based on asset name
    ext = ".md" if asset_name == "intro_page" else ".txt"
    asset_file = draft_path / f"{asset_name}{ext}"

    with open(asset_file, 'w') as f:
        f.write(update.content)

    return {"status": "updated", "asset": asset_name}


@router.put("/{draft_id}/metadata")
async def update_metadata(draft_id: str, metadata: dict):
    """Update draft metadata."""
    drafts_dir = _get_drafts_dir()

    # Find the draft directory
    draft_path = None
    for path in drafts_dir.iterdir():
        if path.is_dir():
            meta = _load_metadata(path)
            if meta and meta.get('seed') == draft_id:
                draft_path = path
                break

    if not draft_path:
        raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")

    # Load existing and update
    existing = _load_metadata(draft_path) or {}
    existing.update(metadata)

    with open(draft_path / ".metadata.json", 'w') as f:
        json.dump(existing, f, indent=2)

    return {"status": "updated"}


@router.delete("/{draft_id}")
async def delete_draft(draft_id: str):
    """Delete a draft."""
    import shutil

    drafts_dir = _get_drafts_dir()

    # Find the draft directory
    draft_path = None
    for path in drafts_dir.iterdir():
        if path.is_dir():
            metadata = _load_metadata(path)
            if metadata and metadata.get('seed') == draft_id:
                draft_path = path
                break

    if not draft_path:
        raise HTTPException(status_code=404, detail=f"Draft not found: {draft_id}")

    shutil.rmtree(draft_path)
    return {"status": "deleted", "draft_id": draft_id}
