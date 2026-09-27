from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.app.database import get_db, BASE_DIR
from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.schemas.evidence import EvidenceResponse
from backend.app.services.evidence_service import ingest_evidence_file, analyze_evidence_full

router = APIRouter(tags=["Evidence"])

UPLOADS_DIR = BASE_DIR / "uploads"
FRAMES_DIR = BASE_DIR / "frames"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
FRAMES_DIR.mkdir(parents=True, exist_ok=True)


def _enrich_evidence_response(ev: Evidence) -> EvidenceResponse:
    resp = EvidenceResponse.model_validate(ev)
    if ev.metadata_json:
        try:
            data = json.loads(ev.metadata_json)
            samples = data.get("sampled_frames", [])
            resp.thumbnails = [s.get("thumbnail_file") for s in samples if s.get("thumbnail_file")]
        except Exception:
            resp.thumbnails = []
    return resp


@router.post("/api/cases/{case_id}/evidence", response_model=EvidenceResponse)
async def upload_evidence(
    case_id: int,
    file: UploadFile = File(...),
    camera_id: Optional[str] = Form("CAM_01"),
    investigator: Optional[str] = Form("INVESTIGATOR_DESK"),
    db: Session = Depends(get_db),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case_upload_dir = UPLOADS_DIR / f"case_{case_id}"
    case_upload_dir.mkdir(parents=True, exist_ok=True)

    target_path = case_upload_dir / file.filename

    # Save original file untouched
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    evidence = ingest_evidence_file(
        db=db,
        case_id=case_id,
        filename=file.filename,
        file_path=target_path,
        mime_type=file.content_type or "video/mp4",
        camera_id=camera_id or "CAM_01",
        actor=investigator or "INVESTIGATOR_DESK",
    )

    return _enrich_evidence_response(evidence)


@router.get("/api/cases/{case_id}/evidence", response_model=List[EvidenceResponse])
def get_case_evidence(case_id: int, db: Session = Depends(get_db)):
    ev_list = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    return [_enrich_evidence_response(ev) for ev in ev_list]


@router.get("/api/evidence/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_detail(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    return _enrich_evidence_response(ev)


@router.post("/api/evidence/{evidence_id}/analyze", response_model=EvidenceResponse)
def run_analysis(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    analyzed = analyze_evidence_full(
        db=db,
        evidence_id=evidence_id,
        frames_base_dir=FRAMES_DIR,
    )
    return _enrich_evidence_response(analyzed)
