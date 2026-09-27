from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, ConfigDict


class TimelineEventBase(BaseModel):
    case_id: int
    evidence_id: Optional[int] = None
    timestamp: float
    timestamp_str: Optional[str] = None
    source: str = "CAM_01"
    event_type: str
    description: str
    confidence: float = 1.0
    risk_level: str = "LOW"


class TimelineEventResponse(TimelineEventBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
