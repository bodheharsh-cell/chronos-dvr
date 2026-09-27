from __future__ import annotations

import hashlib
import json
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


def compute_audit_hash(
    previous_hash: str,
    case_id: Optional[int],
    action: str,
    actor: str,
    timestamp_str: str,
    details: Optional[str],
) -> str:
    payload = f"{previous_hash}|{case_id or 0}|{action}|{actor}|{timestamp_str}|{details or ''}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest().upper()


def record_audit_event(
    db: Session,
    action: str,
    case_id: Optional[int] = None,
    actor: str = "SYSTEM_FORENSIC_ENGINE",
    details: Optional[str] = None,
) -> AuditLog:
    """
    Appends a new audit record with cryptographically chained SHA-256 hash.
    """
    # Find last audit log for chain continuity
    last_entry = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    previous_hash = last_entry.current_hash if last_entry else GENESIS_HASH

    now = datetime.utcnow()
    iso_time = now.isoformat()

    current_hash = compute_audit_hash(
        previous_hash=previous_hash,
        case_id=case_id,
        action=action,
        actor=actor,
        timestamp_str=iso_time,
        details=details,
    )

    audit_entry = AuditLog(
        case_id=case_id,
        action=action,
        actor=actor,
        timestamp=now,
        details=details,
        previous_hash=previous_hash,
        current_hash=current_hash,
    )

    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry


def verify_audit_chain(db: Session, case_id: Optional[int] = None) -> Tuple[bool, List[dict]]:
    """
    Verifies the entire audit trail hash chain integrity.
    """
    query = db.query(AuditLog).order_by(AuditLog.id.asc())
    if case_id:
        query = query.filter(AuditLog.case_id == case_id)
    
    entries = query.all()
    if not entries:
        return True, []

    is_valid = True
    verified_entries = []

    for i, entry in enumerate(entries):
        expected_prev = GENESIS_HASH if i == 0 else entries[i - 1].current_hash
        
        # Verify prev hash linkage
        link_valid = entry.previous_hash == expected_prev
        recalculated_curr = compute_audit_hash(
            previous_hash=entry.previous_hash,
            case_id=entry.case_id,
            action=entry.action,
            actor=entry.actor,
            timestamp_str=entry.timestamp.isoformat(),
            details=entry.details,
        )
        hash_valid = entry.current_hash == recalculated_curr

        entry_ok = link_valid and hash_valid
        if not entry_ok:
            is_valid = False

        verified_entries.append({
            "id": entry.id,
            "case_id": entry.case_id,
            "action": entry.action,
            "actor": entry.actor,
            "timestamp": entry.timestamp,
            "details": entry.details,
            "previous_hash": entry.previous_hash,
            "current_hash": entry.current_hash,
            "is_valid_chain": entry_ok,
        })

    return is_valid, verified_entries
