from __future__ import annotations

from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CHRONOS-DVR Forensic Platform",
        "version": "1.0.0-prototype",
        "timestamp": datetime.utcnow().isoformat(),
        "integrity_engine": "ACTIVE",
    }
