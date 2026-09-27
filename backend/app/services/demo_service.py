from __future__ import annotations

from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.models.timeline import TimelineEvent
from backend.app.services.evidence_service import ingest_evidence_file, analyze_evidence_full
from backend.app.services.audit_service import record_audit_event
from backend.app.utils.video_gen import generate_synthetic_cctv_video


def load_demo_investigation(
    db: Session,
    uploads_dir: Path,
    frames_dir: Path,
    actor: str = "DEMO_LOADER",
) -> Case:
    """
    Creates and populates the demonstration case CHR-DEMO-001.
    Includes synthetic video file 'camera_01.mp4', Hikvision vendor detection,
    recording gap, timestamp anomaly, HIGH risk assessment, and tamper-evident audit ledger entries.
    All records explicitly labelled: DEMONSTRATION DATA.
    """
    # 1. Clean existing demo case if present
    existing_case = db.query(Case).filter(Case.case_number == "CHR-DEMO-001").first()
    if existing_case:
        db.delete(existing_case)
        db.commit()

    # 2. Create Case
    demo_case = Case(
        case_number="CHR-DEMO-001",
        title="SIH-2026 Perimeter Intrusion & DVR Continuity Investigation [DEMONSTRATION DATA]",
        description="[DEMONSTRATION DATA] Prototype forensic case reconstructing perimeter CCTV footage with simulated recording gaps and timestamp discontinuities across Hikvision NVR export channels.",
        investigator="SIH Lead Forensic Examiner",
        status="ACTIVE",
    )
    db.add(demo_case)
    db.commit()
    db.refresh(demo_case)

    record_audit_event(
        db=db,
        action="CASE_CREATED",
        case_id=demo_case.id,
        actor=actor,
        details="[DEMONSTRATION DATA] Case CHR-DEMO-001 initialized for demonstration inspection.",
    )

    # 3. Generate synthetic video file 'camera_01.mp4' in uploads directory
    uploads_dir.mkdir(parents=True, exist_ok=True)
    demo_video_path = uploads_dir / "camera_01.mp4"
    if not demo_video_path.exists():
        generate_synthetic_cctv_video(demo_video_path, fps=25, duration_seconds=12, simulate_gap=True)

    # 4. Ingest and Analyze
    evidence = ingest_evidence_file(
        db=db,
        case_id=demo_case.id,
        filename="camera_01.mp4",
        file_path=demo_video_path,
        mime_type="video/mp4",
        camera_id="CAM_01_PERIMETER",
        actor=actor,
    )

    evidence = analyze_evidence_full(
        db=db,
        evidence_id=evidence.id,
        frames_base_dir=frames_dir,
        actor=actor,
    )

    # 5. Add demonstration specific forensic anomalies to ensure rich SIH showcase
    # Add recording gap
    gap_event = Event(
        evidence_id=evidence.id,
        timestamp=4.0,
        timestamp_str="01:45:04",
        event_type="RECORDING_GAP",
        confidence=0.96,
        description="[DEMONSTRATION DATA] 8.0-second video recording discontinuity detected between OSD frames #0100 and #0101.",
        risk_level="HIGH",
        frame_index=100,
        thumbnail_path=f"thumb_0_0.0s.jpg",
    )
    db.add(gap_event)

    # Add timestamp anomaly
    ts_event = Event(
        evidence_id=evidence.id,
        timestamp=4.1,
        timestamp_str="01:45:12",
        event_type="TIMESTAMP_ANOMALY",
        confidence=0.92,
        description="[DEMONSTRATION DATA] OSD Clock non-linear time shift: forward jump of +00:00:08 without container frame drop header.",
        risk_level="HIGH",
        frame_index=101,
        thumbnail_path=f"thumb_0_0.0s.jpg",
    )
    db.add(ts_event)

    # Timeline mirrors
    db.add(TimelineEvent(
        case_id=demo_case.id,
        evidence_id=evidence.id,
        timestamp=4.0,
        timestamp_str="01:45:04",
        source="CAM_01_PERIMETER",
        event_type="RECORDING_GAP",
        description="[DEMONSTRATION DATA] 8.0-second recording gap detected.",
        confidence=0.96,
        risk_level="HIGH",
    ))

    db.add(TimelineEvent(
        case_id=demo_case.id,
        evidence_id=evidence.id,
        timestamp=4.1,
        timestamp_str="01:45:12",
        source="CAM_01_PERIMETER",
        event_type="TIMESTAMP_ANOMALY",
        description="[DEMONSTRATION DATA] OSD Clock discontinuity detected (+8s jump).",
        confidence=0.92,
        risk_level="HIGH",
    ))

    db.commit()

    record_audit_event(
        db=db,
        action="RISK_FUSION_EVALUATED",
        case_id=demo_case.id,
        actor="RISK_ENGINE",
        details="[DEMONSTRATION DATA] High risk assigned due to simultaneous recording gap and OSD timestamp anomaly.",
    )

    return demo_case
