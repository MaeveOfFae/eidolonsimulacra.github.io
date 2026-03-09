from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys
from types import SimpleNamespace


def _load_validator_module():
    module_path = Path(__file__).resolve().parents[2] / "tools" / "validation" / "validate_pack.py"
    spec = spec_from_file_location("test_validate_pack_module", module_path)
    assert spec is not None
    assert spec.loader is not None
    module = module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_template_aware_validator_accepts_template_backed_draft(tmp_path, monkeypatch, capsys):
    validator = _load_validator_module()

    draft_dir = tmp_path / "draft"
    draft_dir.mkdir()
    (draft_dir / ".metadata.json").write_text(
        '{\n  "seed": "seed",\n  "template_name": "Official Aksho"\n}',
        encoding="utf-8",
    )
    for filename in (
        "system_prompt.md",
        "post_history.md",
        "char_basic_info.md",
        "char_physical.md",
        "char_clothing.md",
        "char_personality.md",
        "char_background.md",
        "initial_message.md",
    ):
        (draft_dir / filename).write_text("content", encoding="utf-8")

    fake_template = SimpleNamespace(
        name="Official Aksho",
        assets=[
            SimpleNamespace(name="initial_message", required=True, blueprint_file="initial_message.md"),
            SimpleNamespace(name="char_basic_info", required=True, blueprint_file="char_basic_info.md"),
            SimpleNamespace(name="char_physical", required=True, blueprint_file="char_physical.md"),
            SimpleNamespace(name="char_clothing", required=True, blueprint_file="char_clothing.md"),
            SimpleNamespace(name="char_personality", required=True, blueprint_file="char_personality.md"),
            SimpleNamespace(name="char_background", required=True, blueprint_file="char_background.md"),
            SimpleNamespace(name="system_prompt", required=True, blueprint_file="system_prompt.md"),
            SimpleNamespace(name="post_history", required=True, blueprint_file="post_history.md"),
        ],
    )

    class FakeTemplateManager:
        def get_template(self, name):
            assert name == "Official Aksho"
            return fake_template

    monkeypatch.setattr(validator, "TemplateManager", FakeTemplateManager)
    monkeypatch.setattr(validator, "validate_file_content", lambda path: [])

    exit_code = validator.main([str(draft_dir)])
    output = capsys.readouterr().out

    assert exit_code == 0
    assert output.strip() == "OK"