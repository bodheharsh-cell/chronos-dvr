from __future__ import annotations

from typing import List, Dict, Any


def detect_events_from_analysis(
    sampled_frames: List[Dict[str, Any]],
    metadata: Dict[str, Any],
    evidence_id: int,
    vendor_info: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Transparent rule-based forensic event detection:
    - Motion / pixel intensity variance spikes
    - Recording continuity / gaps
    - Timing jumps / timestamp anomalies
    - Container / metadata discrepancies
    """
    events = []

    # 1. Container & Metadata Check
    if metadata.get("duration", 0) <= 0:
        events.append({
            "evidence_id": evidence_id,
            "timestamp": 0.0,
            "timestamp_str": "00:00",
            "event_type": "METADATA_WARNING",
            "confidence": 0.95,
            "description": "Video stream duration header is zero or missing, potential container truncation.",
            "risk_level": "HIGH",
            "frame_index": 0,
            "thumbnail_path": sampled_frames[0].get("thumbnail_file") if sampled_frames else None,
        })
    elif metadata.get("fps", 0) > 60:
        events.append({
            "evidence_id": evidence_id,
            "timestamp": 0.0,
            "timestamp_str": "00:00",
            "event_type": "METADATA_WARNING",
            "confidence": 0.85,
            "description": f"Unusually high frame rate detected ({metadata.get('fps')} FPS), typical of synthetic exports.",
            "risk_level": "MEDIUM",
            "frame_index": 0,
            "thumbnail_path": None,
        })

    # 2. Motion / Activity Analysis across sampled frames
    for i, frame in enumerate(sampled_frames):
        motion = frame.get("motion_score", 0.0)
        ts = frame.get("timestamp_seconds", 0.0)
        ts_str = frame.get("timestamp_str", f"{int(ts // 60):02d}:{int(ts % 60):02d}")
        f_idx = frame.get("frame_index", 0)
        thumb = frame.get("thumbnail_file")

        # Significant motion delta detection
        if motion > 25.0:
            events.append({
                "evidence_id": evidence_id,
                "timestamp": ts,
                "timestamp_str": ts_str,
                "event_type": "MOTION_ACTIVITY",
                "confidence": min(1.0, round(0.70 + (motion / 100.0), 2)),
                "description": f"Significant inter-frame scene variance detected (Motion metric: {motion:.1f}).",
                "risk_level": "MEDIUM" if motion > 45.0 else "LOW",
                "frame_index": f_idx,
                "thumbnail_path": thumb,
            })

    # 3. Check for timebase jumps or gaps in sampling
    for i in range(1, len(sampled_frames)):
        curr = sampled_frames[i]
        prev = sampled_frames[i - 1]
        delta_t = curr.get("timestamp_seconds", 0) - prev.get("timestamp_seconds", 0)

        # If sample gap is significantly larger than standard interval
        if delta_t > 6.0:
            events.append({
                "evidence_id": evidence_id,
                "timestamp": round(prev.get("timestamp_seconds", 0) + (delta_t / 2), 2),
                "timestamp_str": prev.get("timestamp_str", "00:00"),
                "event_type": "RECORDING_GAP",
                "confidence": 0.90,
                "description": f"Discontinuity detected in frame sequence: {delta_t:.1f}s gap between frames.",
                "risk_level": "HIGH",
                "frame_index": prev.get("frame_index", 0),
                "thumbnail_path": prev.get("thumbnail_file"),
            })

    # If no events found, create an initial baseline event
    if not events and sampled_frames:
        first = sampled_frames[0]
        events.append({
            "evidence_id": evidence_id,
            "timestamp": 0.0,
            "timestamp_str": "00:00",
            "event_type": "STREAM_ACQUISITION",
            "confidence": 1.0,
            "description": f"Normal stream timeline verified. Container: {metadata.get('container', 'VIDEO')}.",
            "risk_level": "LOW",
            "frame_index": 0,
            "thumbnail_path": first.get("thumbnail_file"),
        })

    return events
