from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db, BASE_DIR
from backend.app.schemas.case import CaseResponse
from backend.app.services.demo_service import load_demo_investigation

router = APIRouter(tags=["Demo"])

UPLOADS_DIR = BASE_DIR / "uploads"
FRAMES_DIR = BASE_DIR / "frames"


@router.post("/api/demo/load", response_model=CaseResponse)
def load_demo(db: Session = Depends(get_db)):
    """
    Populates demonstration investigation case CHR-DEMO-001 with synthetic CCTV evidence,
    Hikvision vendor detection, recording gap, timestamp anomaly, and tamper-evident audit trail.
    """
    demo_case = load_demo_investigation(
        db=db,
        uploads_dir=UPLOADS_DIR,
        frames_dir=FRAMES_DIR,
    )
    return CaseResponse.model_validate(demo_case)
