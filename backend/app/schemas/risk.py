from __future__ import annotations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RiskFactor(BaseModel):
    category: str  # e.g., "RECORDING_GAP", "TIMESTAMP_ANOMALY", "INTEGRITY", "METADATA"
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    weight: float
    description: str
    evidence_ref: Optional[str] = None
    timestamp: Optional[str] = None


class RiskAssessment(BaseModel):
    case_id: int
    overall_risk: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score: float  # 0.0 - 100.0
    integrity_status: str  # "VERIFIED", "COMPROMISED", "UNVERIFIED"
    total_anomalies: int
    factors: List[RiskFactor]
    summary_text: str
    reasons: List[str]
    timeline_anomalies: List[Dict[str, Any]]
