from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    path = Column(Text, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    mime_type = Column(String(128), nullable=False)
    vendor = Column(String(64), default="Generic/Unknown", nullable=False)
    codec = Column(String(64), nullable=True)
    resolution = Column(String(32), nullable=True)
    duration = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    analysis_status = Column(String(32), default="PENDING", nullable=False)  # PENDING, ANALYZING, COMPLETED, FAILED

    # Additional metadata fields
    fps = Column(Float, nullable=True)
    frame_count = Column(Integer, nullable=True)
    bitrate = Column(BigInteger, nullable=True)
    camera_id = Column(String(64), default="CAM_01", nullable=True)
    metadata_json = Column(Text, nullable=True)

    case = relationship("Case", back_populates="evidence_items")
    events = relationship("Event", back_populates="evidence", cascade="all, delete-orphan")
