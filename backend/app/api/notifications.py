"""
UserNotifications API
---------------------
GET   /api/notifications           → own notifications (user) or all (admin)
POST  /api/notifications/read      → mark list of IDs as read
GET   /api/notifications/unread-count → badge count
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.user_notification import UserNotification
from backend.app.models.user import User
from backend.app.schemas.role_based import UserNotificationResponse, MarkReadRequest
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=List[UserNotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User: returns their own notifications (newest first, limit 50).
    Admin: returns all notifications across users.
    """
    q = db.query(UserNotification)
    if not current_user.is_admin:
        q = q.filter(UserNotification.user_id == current_user.id)
    return q.order_by(UserNotification.created_at.desc()).limit(50).all()


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(UserNotification)
        .filter(
            UserNotification.user_id == current_user.id,
            UserNotification.is_read == False,
        )
        .count()
    )
    return {"unread_count": count}


@router.post("/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_as_read(
    payload: MarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a list of notification IDs as read. Users can only mark their own."""
    q = db.query(UserNotification).filter(
        UserNotification.id.in_(payload.notification_ids)
    )
    if not current_user.is_admin:
        q = q.filter(UserNotification.user_id == current_user.id)

    q.update({"is_read": True}, synchronize_session=False)
    db.commit()


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark ALL of the current user's notifications as read."""
    db.query(UserNotification).filter(
        UserNotification.user_id == current_user.id,
        UserNotification.is_read == False,
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

