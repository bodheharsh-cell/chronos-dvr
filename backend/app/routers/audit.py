from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.case import Case
from backend.app.schemas.audit import AuditLogResponse
from backend.app.services.audit_service import verify_audit_chain

router = APIRouter(tags=["Audit"])


@router.get("/api/cases/{case_id}/audit")
def get_case_audit_trail(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    is_valid, entries = verify_audit_chain(db, case_id=case_id)
    return {
        "case_id": case_id,
        "is_tamper_evident": True,
        "chain_integrity_valid": is_valid,
        "status": "TAMPER-EVIDENT VERIFIED" if is_valid else "INTEGRITY_COMPROMISED",
        "total_entries": len(entries),
        "audit_ledger": entries,
    }


@router.get("/api/audit/ledger")
def get_global_audit_ledger(db: Session = Depends(get_db)):
    is_valid, entries = verify_audit_chain(db, case_id=None)
    return {
        "is_tamper_evident": True,
        "chain_integrity_valid": is_valid,
        "status": "TAMPER-EVIDENT VERIFIED" if is_valid else "INTEGRITY_COMPROMISED",
        "total_entries": len(entries),
        "audit_ledger": entries,
    }
