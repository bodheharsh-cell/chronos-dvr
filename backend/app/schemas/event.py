from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, ConfigDict


class EventBase(BaseModel):
    evidence_id: int
    timestamp: float
    timestamp_str: Optional[str] = None
    event_type: str
    confidence: float = 1.0
    description: str
    risk_level: str = "LOW"
    frame_index: Optional[int] = None
    thumbnail_path: Optional[str] = None


class EventResponse(EventBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
