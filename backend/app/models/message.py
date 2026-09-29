import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base


class Message(Base):
    """
    Direct-message thread between a user and admin.

    thread_user_id identifies which user the thread belongs to.
    Both admin and user rows share the same thread_user_id so querying
    by thread_user_id returns the full conversation.

    sender_role: 'admin' | 'user'
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    # Identifies the thread — always the non-admin user's ID
    thread_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Who actually sent this specific message
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(20), nullable=False)   # 'admin' | 'user'

    body = Column(Text, nullable=False)

    # True once the *recipient* has read it
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    thread_user = relationship("User", foreign_keys=[thread_user_id], backref="message_threads")
    sender = relationship("User", foreign_keys=[sender_id])
