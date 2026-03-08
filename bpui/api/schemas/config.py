"""Configuration schemas."""

from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


EngineType = Literal["openai", "google", "openai_compatible", "auto"]
EngineMode = Literal["auto", "explicit"]
ContentMode = Literal["SFW", "NSFW", "Platform-Safe", "Auto"]


class BatchConfig(BaseModel):
    """Batch processing configuration."""
    max_concurrent: int = Field(default=3, ge=1, le=10)
    rate_limit_delay: float = Field(default=1.0, ge=0, le=60)


class ConfigResponse(BaseModel):
    """Full configuration response."""
    engine: EngineType = "auto"
    engine_mode: EngineMode = "auto"
    model: str = "openrouter/openai/gpt-4o-mini"
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=4096, ge=1, le=128000)
    api_keys: Dict[str, str] = Field(default_factory=dict)
    batch: BatchConfig = Field(default_factory=BatchConfig)
    base_url: Optional[str] = None
    available_providers: list[str] = Field(default_factory=lambda: ["openai", "google", "openrouter"])


class ConfigUpdate(BaseModel):
    """Configuration update request."""
    engine: Optional[EngineType] = None
    engine_mode: Optional[EngineMode] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=None, ge=0, le=2)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=128000)
    api_keys: Optional[Dict[str, str]] = None
    batch: Optional[BatchConfig] = None
    base_url: Optional[str] = None


class ConnectionTestRequest(BaseModel):
    """Request to test an API connection."""
    provider: str
    model: Optional[str] = None
    base_url: Optional[str] = None


class ConnectionTestResult(BaseModel):
    """Result of a connection test."""
    success: bool
    latency_ms: Optional[float] = None
    error: Optional[str] = None
    model_info: Optional[Dict[str, Any]] = None
