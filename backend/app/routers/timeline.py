from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.timeline import TimelineEvent
from backend.app.models.event import Event
from backend.app.models.evidence import Evidence
from backend.app.schemas.timeline import TimelineEventResponse
from backend.app.schemas.event import EventResponse

router = APIRouter(tags=["Timeline & Events"])


@router.get("/api/cases/{case_id}/timeline", response_model=List[TimelineEventResponse])
def get_case_timeline(case_id: int, db: Session = Depends(get_db)):
    events = (
        db.query(TimelineEvent)
        .filter(TimelineEvent.case_id == case_id)
        .order_by(TimelineEvent.timestamp.asc())
        .all()
    )
    return events


@router.get("/api/cases/{case_id}/events", response_model=List[EventResponse])
def get_case_events(case_id: int, db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .join(Evidence)
        .filter(Evidence.case_id == case_id)
        .order_by(Event.timestamp.asc())
        .all()
    )
    return events
