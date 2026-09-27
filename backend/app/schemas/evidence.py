from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class EvidenceBase(BaseModel):
    filename: str
    file_size: int
    sha256: str
    mime_type: str
    vendor: str = "Generic/Unknown"
    codec: Optional[str] = None
    resolution: Optional[str] = None
    duration: Optional[float] = None
    fps: Optional[float] = None
    frame_count: Optional[int] = None
    camera_id: Optional[str] = "CAM_01"


class EvidenceCreate(EvidenceBase):
    case_id: int
    path: str


class EvidenceResponse(EvidenceBase):
    id: int
    case_id: int
    path: str
    created_at: datetime
    analysis_status: str
    bitrate: Optional[int] = None
    metadata_json: Optional[str] = None
    thumbnails: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)
