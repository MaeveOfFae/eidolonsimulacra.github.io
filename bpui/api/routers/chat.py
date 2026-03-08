"""Chat/refinement router."""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class ChatMessage(BaseModel):
    """A chat message."""
    role: str  # "user", "assistant", "system"
    content: str


class ChatRequest(BaseModel):
    """Request for chat-based refinement."""
    draft_id: str
    messages: List[ChatMessage]
    context_asset: Optional[str] = None  # Asset to use as context


class RefineRequest(BaseModel):
    """Request to refine a specific asset."""
    draft_id: str
    asset: str
    message: str  # User's refinement request


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


@router.post("")
async def chat(request: ChatRequest):
    """Chat-based refinement with SSE streaming."""
    async def event_generator():
        try:
            from bpui.core.config import load_config
            from bpui.llm.factory import create_engine

            # Find draft and load context
            draft_path = _find_draft_dir(request.draft_id)
            assets = _load_assets(draft_path)

            # Build context
            context_parts = ["You are helping refine a character. Here is the current character data:\n"]

            if request.context_asset and request.context_asset in assets:
                context_parts.append(f"\n=== {request.context_asset.upper()} ===\n")
                context_parts.append(assets[request.context_asset])
            else:
                # Include all assets as context
                for asset_name, content in assets.items():
                    context_parts.append(f"\n=== {asset_name.upper()} ===\n")
                    context_parts.append(content[:1000])  # Limit size

            system_prompt = "".join(context_parts)
            system_prompt += "\n\nHelp the user refine this character. Be helpful and creative."

            # Create engine
            config = load_config()
            engine = create_engine(config)

            # Convert messages to engine format
            messages = [{"role": m.role, "content": m.content} for m in request.messages]

            # Stream response
            full_response = ""
            async for chunk in engine.generate_chat_stream(messages):
                full_response += chunk
                yield f"event: chunk\ndata: {json.dumps({'content': chunk})}\n\n"

            yield f"event: complete\ndata: {json.dumps({'length': len(full_response)})}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/refine")
async def refine_asset(request: RefineRequest):
    """Refine a specific asset with SSE streaming."""
    async def event_generator():
        try:
            from bpui.core.config import load_config
            from bpui.llm.factory import create_engine

            # Find draft and load assets
            draft_path = _find_draft_dir(request.draft_id)
            assets = _load_assets(draft_path)

            if request.asset not in assets:
                raise ValueError(f"Asset not found: {request.asset}")

            current_content = assets[request.asset]

            # Build refinement prompt
            system_prompt = f"""You are helping refine a character asset.

Current {request.asset}:
---
{current_content}
---

User request: {request.message}

Please provide an updated version of the {request.asset} that addresses the user's request.
Only output the updated content, no explanations or markdown."""

            # Create engine
            config = load_config()
            engine = create_engine(config)

            # Stream response
            full_response = ""
            async for chunk in engine.generate_stream(system_prompt, ""):
                full_response += chunk
                yield f"event: chunk\ndata: {json.dumps({'content': chunk})}\n\n"

            yield f"event: complete\ndata: {json.dumps({'asset': request.asset, 'length': len(full_response)})}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/apply-refinement")
async def apply_refinement(draft_id: str, asset: str, content: str):
    """Apply refined content to an asset."""
    try:
        draft_path = _find_draft_dir(draft_id)

        # Determine file extension
        ext = ".md" if asset == "intro_page" else ".txt"
        asset_file = draft_path / f"{asset}{ext}"

        if not asset_file.exists():
            raise HTTPException(status_code=404, detail=f"Asset file not found: {asset}")

        # Write new content
        with open(asset_file, 'w', encoding='utf-8') as f:
            f.write(content)

        # Update metadata modified timestamp
        import json
        from datetime import datetime
        metadata_file = draft_path / ".metadata.json"
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            metadata["modified"] = datetime.now().isoformat()
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)

        return {"status": "updated", "asset": asset, "length": len(content)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
