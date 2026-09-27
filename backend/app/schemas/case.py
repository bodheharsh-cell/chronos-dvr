from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CaseBase(BaseModel):
    case_number: str
    title: str
    description: Optional[str] = None
    investigator: str


class CaseCreate(CaseBase):
    pass


class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    status: str
    evidence_count: Optional[int] = 0
    high_risk_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
