"""Templates router."""

from typing import List
from fastapi import APIRouter, HTTPException
from ..schemas.templates import TemplateSchema, AssetDefinitionSchema, CreateTemplateRequest

router = APIRouter()


@router.get("", response_model=List[TemplateSchema])
async def list_templates():
    """List all available templates."""
    try:
        from bpui.features.templates.templates import TemplateManager

        manager = TemplateManager()
        templates = manager.list_templates()

        return [
            TemplateSchema(
                name=t.name,
                version=t.version,
                description=t.description,
                assets=[
                    AssetDefinitionSchema(
                        name=a.name,
                        required=a.required,
                        depends_on=a.depends_on,
                        description=a.description,
                        blueprint_file=a.blueprint_file,
                    )
                    for a in t.assets
                ],
                is_official=t.is_official,
                path=str(t.path) if t.path else None,
            )
            for t in templates
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}", response_model=TemplateSchema)
async def get_template(name: str):
    """Get a specific template by name."""
    try:
        from bpui.features.templates.templates import TemplateManager

        manager = TemplateManager()
        template = manager.get_template(name)

        if not template:
            raise HTTPException(status_code=404, detail=f"Template not found: {name}")

        return TemplateSchema(
            name=template.name,
            version=template.version,
            description=template.description,
            assets=[
                AssetDefinitionSchema(
                    name=a.name,
                    required=a.required,
                    depends_on=a.depends_on,
                    description=a.description,
                    blueprint_file=a.blueprint_file,
                )
                for a in template.assets
            ],
            is_official=template.is_official,
            path=str(template.path) if template.path else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=TemplateSchema)
async def create_template(request: CreateTemplateRequest):
    """Create a new custom template."""
    try:
        from bpui.features.templates.templates import TemplateManager, Template, AssetDefinition

        manager = TemplateManager()

        # Convert request to internal format
        template = Template(
            name=request.name,
            version=request.version,
            description=request.description,
            assets=[
                AssetDefinition(
                    name=a.name,
                    required=a.required,
                    depends_on=a.depends_on,
                    description=a.description,
                    blueprint_file=a.blueprint_file,
                )
                for a in request.assets
            ],
        )

        created = manager.create_template(template)

        return TemplateSchema(
            name=created.name,
            version=created.version,
            description=created.description,
            assets=[
                AssetDefinitionSchema(
                    name=a.name,
                    required=a.required,
                    depends_on=a.depends_on,
                    description=a.description,
                    blueprint_file=a.blueprint_file,
                )
                for a in created.assets
            ],
            is_official=False,
            path=str(created.path) if created.path else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{name}")
async def delete_template(name: str):
    """Delete a custom template."""
    try:
        from bpui.features.templates.templates import TemplateManager

        manager = TemplateManager()

        # Check if it's an official template
        template = manager.get_template(name)
        if template and template.is_official:
            raise HTTPException(status_code=400, detail="Cannot delete official templates")

        manager.delete_template(name)
        return {"status": "deleted", "name": name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
