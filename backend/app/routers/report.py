from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database import get_db, BASE_DIR
from backend.app.models.case import Case
from backend.app.services.report_service import generate_forensic_pdf_report

router = APIRouter(tags=["Reports"])

REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/api/cases/{case_id}/report")
def get_or_generate_report(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    pdf_path = generate_forensic_pdf_report(
        db=db,
        case_id=case_id,
        output_dir=REPORTS_DIR,
    )

    return FileResponse(
        path=str(pdf_path),
        filename=pdf_path.name,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={pdf_path.name}"},
    )
