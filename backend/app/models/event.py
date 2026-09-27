from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(Float, nullable=False)  # offset in seconds or epoch
    timestamp_str = Column(String(64), nullable=True)  # formatted ISO or HH:MM:SS
    event_type = Column(String(64), nullable=False)  # MOTION, RECORDING_GAP, TIMESTAMP_ANOMALY, METADATA_WARNING, FRAME_CORRUPTION
    confidence = Column(Float, default=1.0, nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(32), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    frame_index = Column(Integer, nullable=True)
    thumbnail_path = Column(Text, nullable=True)

    evidence = relationship("Evidence", back_populates="events")
