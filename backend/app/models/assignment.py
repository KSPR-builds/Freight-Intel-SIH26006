import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)

    # Who the assignment is for
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Route details stored as free-text port names so they don't break if port rows change
    origin_port = Column(String(150), nullable=False)
    destination_port = Column(String(150), nullable=False)

    # Cargo
    cargo_type = Column(String(100), nullable=False)          # e.g. "Thermal Coal"
    quantity_mt = Column(Float, nullable=False)               # metric tonnes

    # Laycan window
    laycan_start = Column(Date, nullable=False)
    laycan_end = Column(Date, nullable=False)

    # Vessel
    vessel_type = Column(String(100), nullable=True)          # Capesize, Panamax, etc.

    # Admin notes
    notes = Column(Text, nullable=True)

    # Status lifecycle: active → updated → cancelled
    status = Column(String(50), default="active", nullable=False, index=True)

    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="assignments")
    creator = relationship("User", foreign_keys=[created_by])
