from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.models.timeline import TimelineEvent
from backend.app.schemas.graph import EvidenceGraphResponse
from backend.app.services.evidence_graph import build_evidence_graph
from backend.app.services.risk_engine import calculate_case_risk
from backend.app.services.audit_service import verify_audit_chain

router = APIRouter(tags=["Evidence Graph"])


@router.get("/api/cases/{case_id}/graph", response_model=EvidenceGraphResponse)
def get_case_evidence_graph(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    evidence_list = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    events_list = db.query(Event).join(Evidence).filter(Evidence.case_id == case_id).all()
    timeline_list = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).all()
    chain_valid, _ = verify_audit_chain(db, case_id)
    risk = calculate_case_risk(case_id, evidence_list, events_list, timeline_list, chain_valid)

    graph_data = build_evidence_graph(
        case=case,
        evidence_list=evidence_list,
        events_list=events_list,
        timeline_list=timeline_list,
        risk=risk,
    )

    return graph_data
