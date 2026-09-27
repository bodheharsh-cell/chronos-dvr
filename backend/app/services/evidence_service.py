from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.models.timeline import TimelineEvent
from backend.app.services.hashing_service import calculate_file_sha256, calculate_forensic_hashes
from backend.app.services.vendor_detector import detect_vendor
from backend.app.services.timestamp_analyzer import analyze_sampled_timestamps
from backend.app.services.event_detector import detect_events_from_analysis
from backend.app.services.audit_service import record_audit_event


def ingest_evidence_file(
    db: Session,
    case_id: int,
    filename: str,
    file_path: Path,
    mime_type: str = "video/mp4",
    camera_id: str = "CAM_01",
    actor: str = "INVESTIGATOR_DESK",
) -> Evidence:
    """
    Ingests an evidence file:
    1. Preserves original file untouched.
    2. Calculates SHA-256 (and full forensic hashes).
    3. Detects vendor signatures.
    4. Records in SQLite.
    5. Appends to tamper-evident audit ledger.
    """
    file_size = file_path.stat().st_size if file_path.exists() else 0
    hashes = calculate_forensic_hashes(file_path)
    sha256_hash = hashes["sha256"]

    analyzer, vendor_info = detect_vendor(file_path, filename)

    evidence = Evidence(
        case_id=case_id,
        filename=filename,
        path=str(file_path.resolve()),
        file_size=file_size,
        sha256=sha256_hash,
        mime_type=mime_type,
        vendor=vendor_info["vendor_name"],
        codec="PROBING_PENDING",
        resolution="PROBING_PENDING",
        duration=0.0,
        analysis_status="PENDING",
        camera_id=camera_id,
        metadata_json=json.dumps({"forensic_hashes": hashes, "vendor_detection": vendor_info}),
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    # Tamper-evident audit logging
    record_audit_event(
        db=db,
        action="EVIDENCE_INGESTED",
        case_id=case_id,
        actor=actor,
        details=f"Evidence '{filename}' (Size: {file_size} bytes, SHA-256: {sha256_hash[:16]}...) ingested into Case ID {case_id}.",
    )

    record_audit_event(
        db=db,
        action="VENDOR_DETECTED",
        case_id=case_id,
        actor="FORENSIC_VENDOR_ENGINE",
        details=f"Evidence ID {evidence.id}: Detected vendor '{vendor_info['vendor_name']}' (Confidence: {vendor_info['confidence']*100:.0f}%).",
    )

    return evidence


def analyze_evidence_full(
    db: Session,
    evidence_id: int,
    frames_base_dir: Path,
    actor: str = "FORENSIC_ANALYZER_SERVICE",
) -> Evidence:
    """
    Executes full forensic pipeline for an evidence item:
    1. Video metadata extraction (OpenCV/Probe)
    2. Frame sampling & thumbnail generation
    3. Timestamp / OCR analysis with fallback
    4. Event detection (motion, gaps, anomalies)
    5. Timeline event generation
    6. Tamper-evident audit ledger update
    """
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise ValueError(f"Evidence with ID {evidence_id} not found")

    file_path = Path(evidence.path)
    if not file_path.exists():
        evidence.analysis_status = "FAILED"
        db.commit()
        record_audit_event(
            db=db,
            action="ANALYSIS_FAILED",
            case_id=evidence.case_id,
            actor=actor,
            details=f"Evidence ID {evidence_id} file not found on disk: {evidence.path}",
        )
        return evidence

    record_audit_event(
        db=db,
        action="ANALYSIS_STARTED",
        case_id=evidence.case_id,
        actor=actor,
        details=f"Forensic stream analysis initiated for Evidence ID {evidence_id} ({evidence.filename}).",
    )

    evidence.analysis_status = "ANALYZING"
    db.commit()

    try:
        analyzer, vendor_info = detect_vendor(file_path, evidence.filename)
        metadata = analyzer.analyze_metadata(file_path)

        # Update evidence model
        evidence.codec = metadata.get("codec", "H.264")
        evidence.resolution = metadata.get("resolution", "1920x1080")
        evidence.duration = metadata.get("duration", 0.0)
        evidence.fps = metadata.get("fps", 25.0)
        evidence.frame_count = metadata.get("frame_count", 0)
        evidence.bitrate = metadata.get("bitrate", 0)

        # Frames extraction
        evidence_frames_dir = frames_base_dir / f"ev_{evidence.id}"
        sampled_frames = analyzer.extract_keyframes_and_timestamps(
            file_path=file_path,
            output_dir=evidence_frames_dir,
            sample_interval_seconds=2.0,
        )

        # Timestamp / OCR analysis
        annotated_samples = analyze_sampled_timestamps(sampled_frames, evidence_frames_dir)

        # Store metadata
        meta_dict = {
            "metadata": metadata,
            "vendor_detection": vendor_info,
            "sampled_frames": annotated_samples,
        }
        evidence.metadata_json = json.dumps(meta_dict)

        # Event Detection
        detected_events = detect_events_from_analysis(
            sampled_frames=annotated_samples,
            metadata=metadata,
            evidence_id=evidence.id,
            vendor_info=vendor_info,
        )

        # Clear any prior events for this evidence
        db.query(Event).filter(Event.evidence_id == evidence.id).delete()
        db.query(TimelineEvent).filter(TimelineEvent.evidence_id == evidence.id).delete()

        for ev_data in detected_events:
            ev_obj = Event(
                evidence_id=evidence.id,
                timestamp=ev_data["timestamp"],
                timestamp_str=ev_data.get("timestamp_str"),
                event_type=ev_data["event_type"],
                confidence=ev_data.get("confidence", 1.0),
                description=ev_data["description"],
                risk_level=ev_data.get("risk_level", "LOW"),
                frame_index=ev_data.get("frame_index"),
                thumbnail_path=ev_data.get("thumbnail_path"),
            )
            db.add(ev_obj)

            # Mirror into case TimelineEvents
            timeline_obj = TimelineEvent(
                case_id=evidence.case_id,
                evidence_id=evidence.id,
                timestamp=ev_data["timestamp"],
                timestamp_str=ev_data.get("timestamp_str"),
                source=evidence.camera_id or "CAM_01",
                event_type=ev_data["event_type"],
                description=ev_data["description"],
                confidence=ev_data.get("confidence", 1.0),
                risk_level=ev_data.get("risk_level", "LOW"),
            )
            db.add(timeline_obj)

        evidence.analysis_status = "COMPLETED"
        db.commit()
        db.refresh(evidence)

        record_audit_event(
            db=db,
            action="ANALYSIS_COMPLETED",
            case_id=evidence.case_id,
            actor=actor,
            details=f"Analysis completed for Evidence ID {evidence.id}: {len(sampled_frames)} frames sampled, {len(detected_events)} events detected.",
        )

    except Exception as e:
        evidence.analysis_status = "FAILED"
        db.commit()
        record_audit_event(
            db=db,
            action="ANALYSIS_ERROR",
            case_id=evidence.case_id,
            actor=actor,
            details=f"Analysis exception on Evidence ID {evidence.id}: {str(e)}",
        )

    return evidence
