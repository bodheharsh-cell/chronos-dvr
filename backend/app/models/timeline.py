from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(Float, nullable=False)  # in seconds
    timestamp_str = Column(String(64), nullable=True)  # readable representation
    source = Column(String(64), default="CAM_01", nullable=False)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)
    risk_level = Column(String(32), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL

    case = relationship("Case", back_populates="timeline_events")
