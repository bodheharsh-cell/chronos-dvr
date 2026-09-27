from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    case_id: Optional[int] = None
    action: str
    actor: str = "SYSTEM_FORENSIC_ENGINE"
    details: Optional[str] = None
    previous_hash: str
    current_hash: str


class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime
    is_valid_chain: Optional[bool] = True

    model_config = ConfigDict(from_attributes=True)
