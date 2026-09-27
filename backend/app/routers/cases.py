from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.schemas.case import CaseCreate, CaseResponse
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/api/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(Case).filter(Case.case_number == payload.case_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case number already exists")

    new_case = Case(
        case_number=payload.case_number,
        title=payload.title,
        description=payload.description,
        investigator=payload.investigator,
        status="ACTIVE",
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    record_audit_event(
        db=db,
        action="CASE_CREATED",
        case_id=new_case.id,
        actor=new_case.investigator,
        details=f"New forensic case registered: {new_case.case_number} - {new_case.title}",
    )

    return new_case


@router.get("", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    results = []
    for c in cases:
        ev_count = db.query(func.count(Evidence.id)).filter(Evidence.case_id == c.id).scalar() or 0
        high_risk = (
            db.query(func.count(Event.id))
            .join(Evidence)
            .filter(Evidence.case_id == c.id, Event.risk_level.in_(["HIGH", "CRITICAL"]))
            .scalar()
            or 0
        )
        resp = CaseResponse.model_validate(c)
        resp.evidence_count = ev_count
        resp.high_risk_count = high_risk
        results.append(resp)
    return results


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    ev_count = db.query(func.count(Evidence.id)).filter(Evidence.case_id == case.id).scalar() or 0
    high_risk = (
        db.query(func.count(Event.id))
        .join(Evidence)
        .filter(Evidence.case_id == case.id, Event.risk_level.in_(["HIGH", "CRITICAL"]))
        .scalar()
        or 0
    )
    resp = CaseResponse.model_validate(case)
    resp.evidence_count = ev_count
    resp.high_risk_count = high_risk
    return resp


@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(case)
    db.commit()
    return {"status": "success", "message": f"Case {case_id} deleted"}
