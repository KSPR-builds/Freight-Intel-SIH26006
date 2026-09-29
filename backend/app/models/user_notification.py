import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class UserNotification(Base):
    """
    User-scoped notification.  Replaces/supplements the generic Notification table
    (which has no user_id and is used for system alerts).

    type values:
        assignment_new      – admin assigned a new voyage
        assignment_updated  – admin edited an existing assignment
        message             – new message in thread
        emergency           – emergency acknowledged by admin
        emergency_ack       – admin explicitly acknowledged an emergency report
    """
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Who the notification is for
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Type enum (stored as string for SQLite compatibility)
    type = Column(
        String(50),
        nullable=False,
        index=True
    )  # assignment_new | assignment_updated | message | emergency | emergency_ack

    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    link_url = Column(String(255), nullable=True)

    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="user_notifications")
