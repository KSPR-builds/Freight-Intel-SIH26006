"""
Messages API
------------
POST  /api/messages                → send a message (user or admin)
GET   /api/messages/{thread_user_id} → get full thread for a user
GET   /api/messages/threads        → admin: list of all user threads (last message each)
POST  /api/messages/{thread_user_id}/read → mark all unread in thread as read
"""
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.message import Message
from backend.app.models.user_notification import UserNotification
from backend.app.models.user import User
from backend.app.schemas.role_based import MessageCreate, MessageResponse
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])


def _notify_new_message(db: Session, recipient_id: int, sender_name: str,
                         thread_user_id: int):
    notif = UserNotification(
        user_id=recipient_id,
        type="message",
        title=f"New message from {sender_name}",
        body=f"{sender_name} sent you a message.",
        link_url=f"/messages/{thread_user_id}",
    )
    db.add(notif)


# ── Send ──────────────────────────────────────────────────────────────────────

@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin: can send to any thread_user_id.
    User:  thread_user_id must equal their own id.
    """
    if not current_user.is_admin and payload.thread_user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Users can only send messages in their own thread."
        )

    # Verify thread user exists
    thread_user = db.query(User).filter(User.id == payload.thread_user_id).first()
    if not thread_user:
        raise HTTPException(status_code=404, detail="Thread user not found")

    sender_role = "admin" if current_user.is_admin else "user"

    import html
    safe_body = html.escape(payload.body[:2000])

    msg = Message(
        thread_user_id=payload.thread_user_id,
        sender_id=current_user.id,
        sender_role=sender_role,
        body=safe_body,
    )
    db.add(msg)
    db.flush()

    # Determine who to notify: if admin sent → notify user; if user sent → notify all admins
    if current_user.is_admin:
        _notify_new_message(db, recipient_id=payload.thread_user_id,
                            sender_name=current_user.full_name,
                            thread_user_id=payload.thread_user_id)
    else:
        # Notify all admins
        admins = db.query(User).filter(User.is_admin == True, User.is_active == True).all()
        for admin in admins:
            _notify_new_message(db, recipient_id=admin.id,
                                sender_name=current_user.full_name,
                                thread_user_id=payload.thread_user_id)

    db.commit()
    db.refresh(msg)
    return msg


# ── Unread Message Count ──────────────────────────────────────────────────────

@router.get("/unread-count")
def get_unread_message_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the total number of unread messages for the current user.
    Admin: counts unread messages from users (sender_role="user").
    User: counts unread messages in their thread from admin (sender_role="admin").
    """
    q = db.query(Message).filter(Message.is_read == False)
    if current_user.is_admin:
        q = q.filter(Message.sender_role == "user")
    else:
        q = q.filter(
            Message.thread_user_id == current_user.id,
            Message.sender_role == "admin"
        )
    return {"unread_count": q.count()}


# ── List Thread ───────────────────────────────────────────────────────────────

@router.get("/{thread_user_id}", response_model=List[MessageResponse])
def get_thread(
    thread_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin: can read any thread.
    User:  can only read their own thread.
    """
    if not current_user.is_admin and thread_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = (
        db.query(Message)
        .filter(Message.thread_user_id == thread_user_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages



# ── Threads Summary (admin) ───────────────────────────────────────────────────

@router.get("/threads/summary")
def list_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin only — returns a list of all threads (unique thread_user_ids)
    with the last message body and unread count.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get all distinct thread users
    thread_user_ids = (
        db.query(Message.thread_user_id)
        .distinct()
        .all()
    )

    result = []
    for (tid,) in thread_user_ids:
        thread_user = db.query(User).filter(User.id == tid).first()
        last_msg = (
            db.query(Message)
            .filter(Message.thread_user_id == tid)
            .order_by(Message.created_at.desc())
            .first()
        )
        unread = (
            db.query(Message)
            .filter(Message.thread_user_id == tid, Message.is_read == False,
                    Message.sender_role == "user")
            .count()
        )
        result.append({
            "thread_user_id": tid,
            "user_name": thread_user.full_name if thread_user else "Unknown",
            "user_email": thread_user.email if thread_user else "",
            "last_message": last_msg.body[:120] if last_msg else "",
            "last_message_at": last_msg.created_at if last_msg else None,
            "unread_count": unread,
        })

    result.sort(key=lambda x: x["last_message_at"] or datetime.datetime.min, reverse=True)
    return result


# ── Mark Thread Read ──────────────────────────────────────────────────────────

@router.post("/{thread_user_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_thread_read(
    thread_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all unread messages in the thread as read (from the other party's perspective)."""
    if not current_user.is_admin and thread_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # If admin reading thread → mark user messages as read
    # If user reading thread → mark admin messages as read
    other_role = "user" if current_user.is_admin else "admin"

    db.query(Message).filter(
        Message.thread_user_id == thread_user_id,
        Message.sender_role == other_role,
        Message.is_read == False,
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
