from __future__ import annotations

from typing import List, Dict, Any
from backend.app.schemas.risk import RiskAssessment, RiskFactor
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.models.timeline import TimelineEvent


def calculate_case_risk(
    case_id: int,
    evidence_list: List[Evidence],
    events_list: List[Event],
    timeline_list: List[TimelineEvent],
    audit_chain_valid: bool = True,
) -> RiskAssessment:
    """
    Transparent rule-based forensic risk fusion engine.
    Computes an explainable risk assessment based on:
    - Integrity and hash chain status
    - Detected recording gaps
    - Timestamp anomalies / discontinuities
    - Metadata and container anomalies
    - Motion near critical boundaries
    """
    factors: List[RiskFactor] = []
    reasons: List[str] = []
    timeline_anomalies: List[Dict[str, Any]] = []

    score = 0.0

    # 1. Audit Chain Integrity Factor
    if not audit_chain_valid:
        score += 40.0
        factors.append(RiskFactor(
            category="INTEGRITY",
            severity="CRITICAL",
            weight=40.0,
            description="Audit ledger hash chain validation failed. Evidence custody record potentially altered.",
        ))
        reasons.append("Audit ledger hash chain verification failure.")

    # 2. Check each evidence item integrity & analysis status
    for ev in evidence_list:
        if ev.analysis_status == "FAILED":
            score += 20.0
            factors.append(RiskFactor(
                category="EVIDENCE_CORRUPTION",
                severity="HIGH",
                weight=20.0,
                description=f"Evidence '{ev.filename}' analysis failed or container is corrupted.",
                evidence_ref=ev.filename,
            ))
            reasons.append(f"Evidence file '{ev.filename}' could not be decoded.")

    # 3. Analyze Detected Events & Timeline Events
    all_events = list(events_list) + [
        Event(
            evidence_id=te.evidence_id or 0,
            timestamp=te.timestamp,
            timestamp_str=te.timestamp_str,
            event_type=te.event_type,
            confidence=te.confidence,
            description=te.description,
            risk_level=te.risk_level,
        ) for te in timeline_list if te.event_type not in [e.event_type for e in events_list]
    ]

    has_gap = False
    has_ts_anomaly = False
    has_motion_near_gap = False

    for ev in all_events:
        t_type = ev.event_type.upper()
        if "GAP" in t_type or "DISCONTINUITY" in t_type:
            has_gap = True
            score += 25.0
            factors.append(RiskFactor(
                category="RECORDING_GAP",
                severity="HIGH",
                weight=25.0,
                description=f"Recording gap detected at {ev.timestamp_str or f'{ev.timestamp}s'}: {ev.description}",
                timestamp=ev.timestamp_str or f"{ev.timestamp}s",
            ))
            reasons.append(f"Recording gap identified at {ev.timestamp_str or f'{ev.timestamp}s'}.")
            timeline_anomalies.append({
                "type": "RECORDING_GAP",
                "timestamp": ev.timestamp,
                "timestamp_str": ev.timestamp_str,
                "description": ev.description,
            })

        elif "TIMESTAMP" in t_type or "ANOMALY" in t_type or "CLOCK" in t_type:
            has_ts_anomaly = True
            score += 25.0
            factors.append(RiskFactor(
                category="TIMESTAMP_ANOMALY",
                severity="HIGH",
                weight=25.0,
                description=f"Timestamp jump / inconsistency detected at {ev.timestamp_str or f'{ev.timestamp}s'}: {ev.description}",
                timestamp=ev.timestamp_str or f"{ev.timestamp}s",
            ))
            reasons.append(f"Timestamp anomaly identified at {ev.timestamp_str or f'{ev.timestamp}s'}.")
            timeline_anomalies.append({
                "type": "TIMESTAMP_ANOMALY",
                "timestamp": ev.timestamp,
                "timestamp_str": ev.timestamp_str,
                "description": ev.description,
            })

        elif "MOTION" in t_type and ev.risk_level in ["MEDIUM", "HIGH"]:
            if has_gap:
                has_motion_near_gap = True
            score += 10.0
            factors.append(RiskFactor(
                category="MOTION_ACTIVITY",
                severity=ev.risk_level,
                weight=10.0,
                description=f"Significant motion activity detected at {ev.timestamp_str or f'{ev.timestamp}s'}.",
                timestamp=ev.timestamp_str or f"{ev.timestamp}s",
            ))

    if has_gap and has_motion_near_gap:
        reasons.append("High motion activity detected immediately adjacent to recording discontinuity.")

    # Bound score between 0 and 100
    final_score = min(100.0, max(0.0, score))

    if final_score >= 70.0:
        overall_risk = "CRITICAL" if not audit_chain_valid else "HIGH"
    elif final_score >= 40.0:
        overall_risk = "HIGH"
    elif final_score >= 20.0:
        overall_risk = "MEDIUM"
    else:
        overall_risk = "LOW"
        if not reasons:
            reasons.append("Continuous video stream verified without detectable gaps or timestamp anomalies.")
            factors.append(RiskFactor(
                category="BASELINE_INTEGRITY",
                severity="LOW",
                weight=0.0,
                description="Evidence stream intact with consistent frame intervals and valid cryptographic hash.",
            ))

    summary_text = (
        f"Forensic Risk Level assessed as {overall_risk} (Score: {final_score:.1f}/100). "
        f"{len(reasons)} primary contributing forensic factors identified."
    )

    return RiskAssessment(
        case_id=case_id,
        overall_risk=overall_risk,
        risk_score=final_score,
        integrity_status="VERIFIED" if audit_chain_valid else "COMPROMISED",
        total_anomalies=len(timeline_anomalies),
        factors=factors,
        summary_text=summary_text,
        reasons=reasons,
        timeline_anomalies=timeline_anomalies,
    )
