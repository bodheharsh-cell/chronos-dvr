from __future__ import annotations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "CASE", "EVIDENCE", "CAMERA", "TIMELINE_EVENT", "FRAME", "ANALYSIS", "RISK"
    group: str
    status: Optional[str] = "NORMAL"
    properties: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship: str  # "CONTAINS", "CAPTURED_BY", "GENERATED", "ASSOCIATED_WITH", "INDICATES"


class EvidenceGraphResponse(BaseModel):
    case_id: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, int]
