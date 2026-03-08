"""Generation router with SSE streaming."""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..schemas.generation import GenerateRequest, GenerateBatchRequest

router = APIRouter()


async def _generate_single(seed: str, mode: str, template: str | None = None):
    """Generate a single character with SSE streaming."""
    start_time = time.time()

    async def event_generator():
        try:
            # Import here to avoid circular imports
            from bpui.llm.factory import create_engine
            from bpui.core.config import load_config
            from bpui.core.prompting import build_orchestrator_prompt
            from bpui.utils.draft_io import create_draft_dir

            # Emit initializing status
            yield f"event: status\ndata: {json.dumps({'stage': 'initializing', 'status': 'started'})}\n\n"

            # Load config and create engine
            config = load_config()
            engine = create_engine(config)

            # Build prompts
            yield f"event: status\ndata: {json.dumps({'stage': 'orchestrator', 'status': 'in_progress'})}\n\n"

            system_prompt, user_prompt = build_orchestrator_prompt(
                seed=seed,
                mode=mode,
                template_name=template,
            )

            # Stream generation
            full_response = ""
            async for chunk in engine.generate_stream(system_prompt, user_prompt):
                full_response += chunk
                yield f"event: chunk\ndata: {json.dumps({'content': chunk})}\n\n"

            # Parse assets
            yield f"event: status\ndata: {json.dumps({'stage': 'parsing', 'status': 'in_progress'})}\n\n"

            from bpui.core.parse_blocks import extract_codeblocks
            assets = extract_codeblocks(full_response)

            # Save draft
            yield f"event: status\ndata: {json.dumps({'stage': 'saving', 'status': 'in_progress'})}\n\n"

            metadata = {
                "seed": seed,
                "mode": mode,
                "model": config.model,
                "created": datetime.now().isoformat(),
                "template_name": template,
            }

            # Extract character name from character_sheet if available
            if "character_sheet" in assets:
                # Simple extraction - look for name patterns
                sheet = assets["character_sheet"]
                for line in sheet.split('\n')[:10]:
                    if 'name' in line.lower() and ':' in line:
                        name = line.split(':', 1)[1].strip().strip('"*')
                        if name:
                            metadata["character_name"] = name
                        break

            draft_path = create_draft_dir(seed, assets, metadata)

            # Complete
            duration_ms = (time.time() - start_time) * 1000
            yield f"event: status\ndata: {json.dumps({'stage': 'complete', 'status': 'complete'})}\n\n"
            yield f"event: complete\ndata: {json.dumps({'draft_path': str(draft_path), 'character_name': metadata.get('character_name'), 'duration_ms': duration_ms})}\n\n"

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


@router.post("/single")
async def generate_single(request: GenerateRequest):
    """Generate a single character with SSE streaming."""
    return await _generate_single(
        seed=request.seed,
        mode=request.mode,
        template=request.template,
    )


@router.post("/batch")
async def generate_batch(request: GenerateBatchRequest):
    """Generate multiple characters with SSE streaming."""
    async def event_generator():
        from bpui.core.config import load_config

        config = load_config()
        max_concurrent = request.max_concurrent if request.parallel else 1

        # Create semaphore for concurrency control
        semaphore = asyncio.Semaphore(max_concurrent)

        async def generate_with_semaphore(seed: str, index: int):
            async with semaphore:
                yield f"event: batch_start\ndata: {json.dumps({'index': index, 'seed': seed})}\n\n"
                # For batch, we'll emit progress events and collect results
                # This is a simplified version - full implementation would need more sophisticated handling
                try:
                    from bpui.llm.factory import create_engine
                    from bpui.core.prompting import build_orchestrator_prompt
                    from bpui.core.parse_blocks import extract_codeblocks
                    from bpui.utils.draft_io import create_draft_dir

                    engine = create_engine(config)
                    system_prompt, user_prompt = build_orchestrator_prompt(seed, request.mode, request.template)

                    full_response = ""
                    async for chunk in engine.generate_stream(system_prompt, user_prompt):
                        full_response += chunk

                    assets = extract_codeblocks(full_response)
                    metadata = {
                        "seed": seed,
                        "mode": request.mode,
                        "model": config.model,
                        "created": datetime.now().isoformat(),
                    }
                    draft_path = create_draft_dir(seed, assets, metadata)

                    yield f"event: batch_complete\ndata: {json.dumps({'index': index, 'seed': seed, 'draft_path': str(draft_path)})}\n\n"

                except Exception as e:
                    yield f"event: batch_error\ndata: {json.dumps({'index': index, 'seed': seed, 'error': str(e)})}\n\n"

        # Process all seeds
        tasks = [generate_with_semaphore(seed, i) for i, seed in enumerate(request.seeds)]

        for task_gen in asyncio.as_completed([gen.__anext__() for gen in [generate_with_semaphore(s, i) for i, s in enumerate(request.seeds)]]):
            try:
                async for event in task_gen:
                    yield event
            except StopAsyncIteration:
                pass

        yield f"event: complete\ndata: {json.dumps({'total': len(request.seeds)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
