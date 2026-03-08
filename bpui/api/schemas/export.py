"""Export schemas."""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class FieldMappingSchema(BaseModel):
    """Mapping of an asset to a target field."""
    asset: str
    target: str
    wrapper: Optional[str] = None
    optional: bool = False


class ExportPresetSchema(BaseModel):
    """Export preset configuration."""
    name: str
    format: Literal["text", "json", "combined"]
    description: str = ""
    fields: List[FieldMappingSchema] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    output_pattern: str = "{{character_name}}"


class ExportRequest(BaseModel):
    """Request to export a draft."""
    draft_id: str
    preset: str  # Preset name or path
    include_metadata: bool = True


class ExportResponse(BaseModel):
    """Response for export operation."""
    status: str
    filename: str
    format: str
    data: Optional[Dict[str, Any]] = None
    download_url: Optional[str] = None
