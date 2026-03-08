"""Similarity analysis schemas."""

from typing import Optional, List
from pydantic import BaseModel, Field


class LLMAnalysisSchema(BaseModel):
    """LLM-powered analysis results."""
    narrative_dynamics: str = ""
    story_opportunities: List[str] = Field(default_factory=list)
    scene_suggestions: List[str] = Field(default_factory=list)
    dialogue_style: str = ""
    relationship_arc: str = ""


class MetaAnalysisSchema(BaseModel):
    """Meta-analysis for redundancy detection."""
    redundancy_level: str = "low"
    redundancy_score: float = 0.0
    issues_detected: List[str] = Field(default_factory=list)
    rework_suggestions_char1: List[str] = Field(default_factory=list)
    rework_suggestions_char2: List[str] = Field(default_factory=list)
    merge_recommendation: Optional[str] = None
    uniqueness_score: float = 1.0


class SimilarityResultSchema(BaseModel):
    """Result of similarity analysis between two characters."""
    character1_name: str
    character2_name: str
    overall_score: float
    compatibility: str = "medium"
    conflict_potential: float = 0.0
    synergy_potential: float = 0.0
    commonalities: List[str] = Field(default_factory=list)
    differences: List[str] = Field(default_factory=list)
    relationship_suggestions: List[str] = Field(default_factory=list)
    llm_analysis: Optional[LLMAnalysisSchema] = None
    meta_analysis: Optional[MetaAnalysisSchema] = None


class SimilarityRequest(BaseModel):
    """Request to compare two characters."""
    draft1_id: str
    draft2_id: str
    include_llm_analysis: bool = False
