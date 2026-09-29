"""
Emergencies API
---------------
POST  /api/emergencies                     → user files emergency
GET   /api/emergencies                     → admin sees all; user sees own
GET   /api/emergencies/{id}               → owner or admin
PATCH /api/emergencies/{id}/acknowledge   → admin only
PATCH /api/emergencies/{id}/resolve       → admin only
"""
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.connection import get_db
from backend.app.models.emergency import Emergency
from backend.app.models.user_notification import UserNotification
from backend.app.models.user import User
from backend.app.schemas.role_based import (
    EmergencyCreate,
    EmergencyAcknowledge,
    EmergencyResponse,
)
from backend.app.services.auth_service import get_current_user, get_current_admin

router = APIRouter(prefix="/api/emergencies", tags=["Emergencies"])

VALID_CATEGORIES = {"cyclone", "severe_weather", "war_security", "port_closure", "other"}
VALID_SEVERITIES = {"low", "medium", "high", "critical"}


def _notify_admins_emergency(db: Session, user: User, emergency: Emergency):
    """Notify all active admins of a new emergency filing."""
    admins = db.query(User).filter(User.is_admin == True, User.is_active == True).all()
    for admin in admins:
        notif = UserNotification(
            user_id=admin.id,
            type="emergency",
            title=f"⚠ Emergency Filed [{emergency.severity.upper()}]",
            body=(
                f"{user.full_name} filed a {emergency.category.replace('_', ' ')} emergency "
                f"at {emergency.location or 'unspecified location'}. "
                f"Message: {emergency.message[:120]}"
            ),
            link_url=f"/admin/emergencies/{emergency.id}",
        )
        db.add(notif)


def _notify_user_emergency_ack(db: Session, emergency: Emergency, admin: User):
    """Notify the user when admin acknowledges their emergency."""
    notif = UserNotification(
        user_id=emergency.user_id,
        type="emergency_ack",
        title="Emergency Acknowledged",
        body=(
            f"Your emergency report ({emergency.category.replace('_', ' ')}) has been "
            f"acknowledged by {admin.full_name}. Status: {emergency.status}."
        ),
        link_url=f"/emergencies/{emergency.id}",
    )
    db.add(notif)


# ── File Emergency ────────────────────────────────────────────────────────────

@router.post("", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
def file_emergency(
    payload: EmergencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Any authenticated user can file an emergency."""
    if payload.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=422,
            detail=f"category must be one of: {', '.join(sorted(VALID_CATEGORIES))}"
        )
    if payload.severity not in VALID_SEVERITIES:
        raise HTTPException(
            status_code=422,
            detail=f"severity must be one of: {', '.join(sorted(VALID_SEVERITIES))}"
        )

    # Rate Limit: max 3 per 10 mins
    ten_mins_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    recent_count = db.query(Emergency).filter(
        Emergency.user_id == current_user.id,
        Emergency.created_at >= ten_mins_ago
    ).count()
    
    if recent_count >= 3:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Too many emergency reports in a short time."
        )

    emergency = Emergency(
        user_id=current_user.id,
        category=payload.category,
        severity=payload.severity,
        location=payload.location,
        message=payload.message,
        status="open",
    )
    db.add(emergency)
    db.flush()

    _notify_admins_emergency(db, current_user, emergency)
    
    # Post copy in user's message thread
    from backend.app.models.message import Message
    msg = Message(
        thread_user_id=current_user.id,
        sender_id=current_user.id,
        sender_role="user",
        body=f"[EMERGENCY: {payload.category.replace('_', ' ').title()}] {payload.message}",
    )
    db.add(msg)

    db.commit()
    db.refresh(emergency)
    return emergency


# ── Open Count (Admin Badge) ──────────────────────────────────────────────────

@router.get("/open-count")
def get_open_emergencies_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin only: get count of emergencies with status 'open'."""
    if not current_user.is_admin:
        return {"open_count": 0}
    count = db.query(Emergency).filter(Emergency.status == "open").count()
    return {"open_count": count}


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[EmergencyResponse])
def list_emergencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Emergency)
    if not current_user.is_admin:
        q = q.filter(Emergency.user_id == current_user.id)
    return q.order_by(Emergency.created_at.desc()).all()


# ── Read One ──────────────────────────────────────────────────────────────────

@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    if not current_user.is_admin and emergency.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return emergency


# ── Acknowledge ───────────────────────────────────────────────────────────────

@router.patch("/{emergency_id}/acknowledge", response_model=EmergencyResponse)
def acknowledge_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    if emergency.status not in ("open",):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot acknowledge emergency with status '{emergency.status}'"
        )

    emergency.status = "acknowledged"
    emergency.acknowledged_by = admin.id
    emergency.acknowledged_at = datetime.datetime.utcnow()

    _notify_user_emergency_ack(db, emergency, admin)

    db.commit()
    db.refresh(emergency)
    return emergency


# ── Resolve ───────────────────────────────────────────────────────────────────

@router.patch("/{emergency_id}/resolve", response_model=EmergencyResponse)
def resolve_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")

    emergency.status = "resolved"
    if not emergency.acknowledged_by:
        emergency.acknowledged_by = admin.id
        emergency.acknowledged_at = datetime.datetime.utcnow()

    # Notify user of resolution
    notif = UserNotification(
        user_id=emergency.user_id,
        type="emergency_ack",
        title="Emergency Resolved",
        body=(
            f"Your emergency report ({emergency.category.replace('_', ' ')}) "
            f"has been resolved by {admin.full_name}."
        ),
        link_url=f"/emergencies/{emergency.id}",
    )
    db.add(notif)

    db.commit()
    db.refresh(emergency)
    return emergency
