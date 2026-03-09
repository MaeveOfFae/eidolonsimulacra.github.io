import asyncio
from pathlib import Path
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from bpui.api.routers.generation import finalize_generation, generate_asset, generate_single
from bpui.api.routers.generation import generate_batch
from bpui.api.routers.offspring import router as offspring_router
from bpui.api.schemas.generation import FinalizeGenerationRequest, GenerateAssetRequest, GenerateBatchRequest, GenerateRequest


async def _collect_streaming_body(response) -> str:
    chunks: list[str] = []
    async for chunk in response.body_iterator:
        if isinstance(chunk, bytes):
            chunks.append(chunk.decode("utf-8"))
        else:
            chunks.append(chunk)
    return "".join(chunks)


class _FakeBatchEngine:
    async def generate_stream(self, system_prompt: str, user_prompt: str):
        yield "generated output"


class _FakeSequentialEngine:
    async def generate_stream(self, system_prompt: str, user_prompt: str):
        if "system_prompt" in system_prompt:
            yield "```\nSYSTEM\n```"
            return
        yield "```\nname: Batch Character\n```"

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        if "system_prompt" in system_prompt:
            return "```\nSYSTEM\n```"
        return "```\nname: Batch Character\n```"


class _FakeOffspringEngine:
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        return "generated output"


def test_offspring_route_accepts_json_body_and_emits_draft_id(tmp_path, monkeypatch):
    import bpui.api.routers.offspring as offspring_module

    parent1_dir = tmp_path / "parent_one"
    parent2_dir = tmp_path / "parent_two"
    child_dir = tmp_path / "child_draft"
    parent1_dir.mkdir()
    parent2_dir.mkdir()
    child_dir.mkdir()

    monkeypatch.setattr(
        offspring_module,
        "_find_draft_dir",
        lambda draft_id: {
            "parent-1": parent1_dir,
            "parent-2": parent2_dir,
        }[draft_id],
    )
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.llm.factory.create_engine", lambda config: _FakeOffspringEngine())
    monkeypatch.setattr(
        "bpui.core.prompting.build_asset_prompt",
        lambda asset_name, offspring_seed, mode, assets: ("system", "user"),
    )
    monkeypatch.setattr("bpui.core.parse_blocks.extract_single_asset", lambda output, asset_name: "name: Child")
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Child")
    monkeypatch.setattr(
        "bpui.utils.file_io.pack_io.load_draft",
        lambda draft_path: {"character_sheet": f"name: {draft_path.name}"},
    )
    monkeypatch.setattr(
        "bpui.utils.file_io.pack_io.create_draft_dir",
        lambda *args, **kwargs: child_dir,
    )
    monkeypatch.setattr("bpui.utils.topological_sort.topological_sort", lambda assets: ["character_sheet"])

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(name=name, assets=[SimpleNamespace(name="character_sheet")])

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)

    app = FastAPI()
    app.include_router(offspring_router, prefix="/offspring")
    client = TestClient(app)

    response = client.post(
        "/offspring",
        json={
            "parent1_id": "parent-1",
            "parent2_id": "parent-2",
            "mode": "SFW",
            "seed": "child concept",
        },
    )

    assert response.status_code == 200
    assert "event: complete" in response.text
    assert '"draft_id": "child_draft"' in response.text


def test_generate_batch_stream_emits_completion_for_each_seed(tmp_path, monkeypatch):
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.llm.factory.create_engine", lambda config: _FakeSequentialEngine())
    prompt_calls: list[tuple[str, dict[str, str]]] = []

    def fake_build_asset_prompt(asset_name, seed, mode, prior_assets=None, repo_root=None, blueprint_content=None):
        prompt_calls.append((asset_name, dict(prior_assets or {})))
        return (f"system::{asset_name}", f"user::{seed}")

    monkeypatch.setattr("bpui.core.prompting.build_asset_prompt", fake_build_asset_prompt)
    monkeypatch.setattr("bpui.core.parse_blocks.extract_single_asset", lambda output, asset_name: output.replace("```", "").strip())
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Batch Character")

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(
                name=name,
                assets=[SimpleNamespace(name="system_prompt"), SimpleNamespace(name="character_sheet")],
            )

        def get_blueprint_content(self, template, asset_name):
            return f"blueprint::{asset_name}"

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(
        "bpui.utils.topological_sort.topological_sort",
        lambda assets: [asset.name for asset in assets],
    )

    def fake_create_draft_dir(*args, **kwargs):
        draft_dir = tmp_path / kwargs["seed"].replace(" ", "_")
        draft_dir.mkdir(exist_ok=True)
        return draft_dir

    monkeypatch.setattr("bpui.utils.file_io.pack_io.create_draft_dir", fake_create_draft_dir)

    response = asyncio.run(
        generate_batch(
            GenerateBatchRequest(
                seeds=["first seed", "second seed"],
                mode="SFW",
                parallel=True,
                max_concurrent=2,
            )
        )
    )
    body = asyncio.run(_collect_streaming_body(response))

    assert body.count("event: batch_start") == 2
    assert body.count("event: batch_complete") == 2
    assert '"draft_id": "first_seed"' in body
    assert '"draft_id": "second_seed"' in body
    assert 'event: complete\ndata: {"total": 2}' in body
    assert prompt_calls[0] == ("system_prompt", {})
    assert prompt_calls[1] == ("character_sheet", {"system_prompt": "SYSTEM"})


def test_generate_single_streams_assets_in_dependency_order(tmp_path, monkeypatch):
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.llm.factory.create_engine", lambda config: _FakeSequentialEngine())
    prompt_calls: list[tuple[str, dict[str, str]]] = []

    def fake_build_asset_prompt(asset_name, seed, mode, prior_assets=None, repo_root=None, blueprint_content=None):
        prompt_calls.append((asset_name, dict(prior_assets or {})))
        return (f"system::{asset_name}", f"user::{seed}")

    monkeypatch.setattr("bpui.core.prompting.build_asset_prompt", fake_build_asset_prompt)
    monkeypatch.setattr("bpui.core.parse_blocks.extract_single_asset", lambda output, asset_name: output.replace("```", "").strip())
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Batch Character")

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(
                name=name,
                assets=[SimpleNamespace(name="system_prompt"), SimpleNamespace(name="character_sheet")],
            )

        def get_blueprint_content(self, template, asset_name):
            return f"blueprint::{asset_name}"

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(
        "bpui.utils.topological_sort.topological_sort",
        lambda assets: [asset.name for asset in assets],
    )
    monkeypatch.setattr(
        "bpui.utils.file_io.pack_io.create_draft_dir",
        lambda *args, **kwargs: tmp_path / "single_draft",
    )

    response = asyncio.run(
        generate_single(
            GenerateRequest(seed="seed", mode="SFW", template="V2/V3 Card")
        )
    )
    body = asyncio.run(_collect_streaming_body(response))

    assert 'event: asset\ndata: {"name": "system_prompt"' in body
    assert 'event: asset_complete\ndata: {"name": "system_prompt"' in body
    assert 'event: asset\ndata: {"name": "character_sheet"' in body
    assert '"draft_id": "single_draft"' in body
    assert prompt_calls[0] == ("system_prompt", {})
    assert prompt_calls[1] == ("character_sheet", {"system_prompt": "SYSTEM"})


def test_generate_asset_requires_prior_assets_and_returns_content(monkeypatch):
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.llm.factory.create_engine", lambda config: _FakeSequentialEngine())

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(
                name=name,
                assets=[SimpleNamespace(name="system_prompt"), SimpleNamespace(name="character_sheet")],
            )

        def get_blueprint_content(self, template, asset_name):
            return f"blueprint::{asset_name}"

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(
        "bpui.utils.topological_sort.topological_sort",
        lambda assets: [asset.name for asset in assets],
    )
    monkeypatch.setattr("bpui.core.prompting.build_asset_prompt", lambda **kwargs: (f"system::{kwargs['asset_name']}", "user"))
    monkeypatch.setattr("bpui.core.parse_blocks.extract_single_asset", lambda output, asset_name: output.replace("```", "").strip())
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Batch Character")

    response = asyncio.run(
        generate_asset(
            GenerateAssetRequest(
                seed="seed",
                mode="SFW",
                template="V2/V3 Card",
                asset_name="character_sheet",
                prior_assets={"system_prompt": "SYSTEM"},
            )
        )
    )

    assert response.asset_name == "character_sheet"
    assert response.content == "name: Batch Character"
    assert response.character_name == "Batch Character"


def test_finalize_generation_persists_reviewed_assets(tmp_path, monkeypatch):
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Batch Character")

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(
                name=name,
                assets=[SimpleNamespace(name="system_prompt"), SimpleNamespace(name="character_sheet")],
            )

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(
        "bpui.utils.topological_sort.topological_sort",
        lambda assets: [asset.name for asset in assets],
    )
    monkeypatch.setattr(
        "bpui.utils.file_io.pack_io.create_draft_dir",
        lambda *args, **kwargs: tmp_path / "finalized_draft",
    )

    response = asyncio.run(
        finalize_generation(
            FinalizeGenerationRequest(
                seed="seed",
                mode="SFW",
                template="V2/V3 Card",
                assets={"system_prompt": "SYSTEM", "character_sheet": "name: Batch Character"},
            )
        )
    )

    assert response.draft_id == "finalized_draft"
    assert response.character_name == "Batch Character"


def test_finalize_generation_does_not_block_on_heuristic_validation(tmp_path, monkeypatch):
    monkeypatch.setattr("bpui.core.config.load_config", lambda: SimpleNamespace(model="test/model"))
    monkeypatch.setattr("bpui.core.parse_blocks.extract_character_name", lambda content: "Batch Character")
    monkeypatch.setattr(
        "bpui.core.content_validation.validate_assets_content",
        lambda assets: {"system_prompt": ["Narrates {{user}} action/thought/consent"]},
    )

    class FakeTemplateManager:
        def get_template(self, name):
            return SimpleNamespace(
                name=name,
                assets=[SimpleNamespace(name="system_prompt"), SimpleNamespace(name="character_sheet")],
            )

    monkeypatch.setattr("bpui.features.templates.templates.TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(
        "bpui.utils.topological_sort.topological_sort",
        lambda assets: [asset.name for asset in assets],
    )
    monkeypatch.setattr(
        "bpui.utils.file_io.pack_io.create_draft_dir",
        lambda *args, **kwargs: tmp_path / "finalized_despite_warning",
    )

    response = asyncio.run(
        finalize_generation(
            FinalizeGenerationRequest(
                seed="seed",
                mode="SFW",
                template="V2/V3 Card",
                assets={"system_prompt": "SYSTEM", "character_sheet": "name: Batch Character"},
            )
        )
    )

    assert response.draft_id == "finalized_despite_warning"