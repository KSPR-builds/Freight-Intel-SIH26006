"""
Assignments API
--------------
POST   /api/assignments            → admin creates an assignment
GET    /api/assignments            → admin gets all; user gets own
GET    /api/assignments/export     → user or admin: CSV of own (or all) assignments
GET    /api/assignments/{id}       → owner or admin
PATCH  /api/assignments/{id}       → admin only
DELETE /api/assignments/{id}       → admin only (soft-cancel)
"""
import io, csv
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.assignment import Assignment
from backend.app.models.user_notification import UserNotification
from backend.app.models.user import User
from backend.app.schemas.role_based import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
)
from backend.app.services.auth_service import get_current_user, get_current_admin

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


def _notify_user(db: Session, user_id: int, notif_type: str,
                 title: str, body: str, link_url: str = "/assignments"):
    """Helper: create a UserNotification row."""
    notif = UserNotification(
        user_id=user_id,
        type=notif_type,
        title=title,
        body=body,
        link_url=link_url,
    )
    db.add(notif)


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin only — create a new assignment for a user."""
    # Verify target user exists
    target_user = db.query(User).filter(User.id == payload.user_id, User.is_active == True).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found or inactive")

    assignment = Assignment(
        user_id=payload.user_id,
        origin_port=payload.origin_port,
        destination_port=payload.destination_port,
        cargo_type=payload.cargo_type,
        quantity_mt=payload.quantity_mt,
        laycan_start=payload.laycan_start,
        laycan_end=payload.laycan_end,
        vessel_type=payload.vessel_type,
        notes=payload.notes,
        status="active",
        created_by=admin.id,
    )
    db.add(assignment)
    db.flush()  # get assignment.id

    # Notify the user
    _notify_user(
        db,
        user_id=payload.user_id,
        notif_type="assignment_new",
        title="New Voyage Assignment",
        body=(
            f"You have been assigned a new voyage: {payload.origin_port} → "
            f"{payload.destination_port} ({payload.cargo_type}, "
            f"{payload.quantity_mt:,.0f} MT). "
            f"Laycan: {payload.laycan_start} – {payload.laycan_end}."
        ),
        link_url="/my-assignments",
    )

    db.commit()
    db.refresh(assignment)
    return assignment


# ── Export CSV ────────────────────────────────────────────────────────────────

@router.get("/export")
def export_assignments_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """CSV export: admin gets all, user gets own assignments only."""
    q = db.query(Assignment)
    if not current_user.is_admin:
        q = q.filter(Assignment.user_id == current_user.id)

    rows = q.order_by(Assignment.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "User ID", "Origin Port", "Destination Port",
        "Cargo Type", "Quantity (MT)", "Laycan Start", "Laycan End",
        "Vessel Type", "Status", "Notes", "Created At", "Updated At"
    ])
    for r in rows:
        writer.writerow([
            r.id, r.user_id, r.origin_port, r.destination_port,
            r.cargo_type, r.quantity_mt, r.laycan_start, r.laycan_end,
            r.vessel_type, r.status, r.notes or "",
            r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
            r.updated_at.strftime("%Y-%m-%d %H:%M") if r.updated_at else ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=my_assignments_export.csv"}
    )


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[AssignmentResponse])
def list_assignments(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin → all assignments (optionally filtered by status).
    User  → only their own assignments.
    """
    q = db.query(Assignment)

    if not current_user.is_admin:
        q = q.filter(Assignment.user_id == current_user.id)

    if status_filter:
        q = q.filter(Assignment.status == status_filter)

    return q.order_by(Assignment.created_at.desc()).all()


# ── Read One ──────────────────────────────────────────────────────────────────

@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if not current_user.is_admin and assignment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return assignment


# ── Update ────────────────────────────────────────────────────────────────────

@router.patch("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin only — update an existing assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    changed_fields = payload.model_dump(exclude_none=True)
    change_summaries = []

    if "origin_port" in changed_fields or "destination_port" in changed_fields:
        orig = changed_fields.get("origin_port", assignment.origin_port)
        dest = changed_fields.get("destination_port", assignment.destination_port)
        change_summaries.append(f"Route: {orig} → {dest}")
    if "cargo_type" in changed_fields:
        change_summaries.append(f"Cargo: {changed_fields['cargo_type']}")
    if "quantity_mt" in changed_fields:
        change_summaries.append(f"Quantity: {changed_fields['quantity_mt']:,.0f} MT")
    if "laycan_start" in changed_fields or "laycan_end" in changed_fields:
        l_start = changed_fields.get("laycan_start", assignment.laycan_start)
        l_end = changed_fields.get("laycan_end", assignment.laycan_end)
        change_summaries.append(f"Laycan: {l_start} to {l_end}")
    if "vessel_type" in changed_fields:
        change_summaries.append(f"Vessel: {changed_fields['vessel_type']}")
    if "status" in changed_fields:
        change_summaries.append(f"Status: {changed_fields['status']}")

    summary_str = "; ".join(change_summaries) if change_summaries else "Details updated"

    for field, value in changed_fields.items():
        setattr(assignment, field, value)

    # Set status to 'updated' if not explicitly set
    if "status" not in changed_fields:
        assignment.status = "updated"

    assignment.updated_at = datetime.datetime.utcnow()

    # Notify the user
    _notify_user(
        db,
        user_id=assignment.user_id,
        notif_type="assignment_updated",
        title="Voyage Assignment Updated",
        body=f"Assignment ({assignment.origin_port} → {assignment.destination_port}) updated: {summary_str}.",
        link_url="/my-assignments",
    )

    db.commit()
    db.refresh(assignment)
    return assignment


# ── Delete / Cancel ───────────────────────────────────────────────────────────

@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Admin only — soft-cancel an assignment (sets status = 'cancelled')."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.status = "cancelled"
    assignment.updated_at = datetime.datetime.utcnow()

    _notify_user(
        db,
        user_id=assignment.user_id,
        notif_type="assignment_updated",
        title="Voyage Assignment Cancelled",
        body=(
            f"Your assignment ({assignment.origin_port} → {assignment.destination_port}) "
            f"has been cancelled."
        ),
        link_url="/my-assignments",
    )

    db.commit()
