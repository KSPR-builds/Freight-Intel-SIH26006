import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class Emergency(Base):
    """
    Emergency report filed by a user.

    category:
        cyclone | severe_weather | war_security | port_closure | other

    severity:
        low | medium | high | critical

    status:
        open          – just filed, not yet seen by admin
        acknowledged  – admin acknowledged (acknowledged_by set)
        resolved      – admin marked as resolved
    """
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)

    # User who filed the emergency
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    category = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)   # low|medium|high|critical
    location = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)

    status = Column(String(30), default="open", nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Admin acknowledgment
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="emergencies")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
