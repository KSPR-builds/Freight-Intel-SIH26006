from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database.connection import get_db
from backend.app.schemas.report import ReportItem, NotificationItem
from backend.app.services.report_service import get_reports_list, generate_csv_export
from backend.app.models.report import Notification

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=List[ReportItem])
def list_reports(
    report_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    reports = get_reports_list(db)
    if report_type and report_type != "All":
        reports = [r for r in reports if report_type.lower() in r.report_type.lower()]
    if search:
        reports = [r for r in reports if search.lower() in r.title.lower() or search.lower() in r.summary.lower()]
    return reports

@router.get("/export")
def export_dataset(
    type: str = Query("freight", description="freight, vessels, ports"),
    db: Session = Depends(get_db)
):
    csv_data = generate_csv_export(db, export_type=type)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=freightiq_{type}_export.csv"}
    )

@router.get("/notifications", response_model=List[NotificationItem])
def get_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    return [
        NotificationItem(
            id=n.id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            severity=n.severity,
            is_read=n.is_read,
            action_url=n.action_url,
            created_at=n.created_at.strftime("%b %d, %H:%M")
        )
        for n in notifs
    ]
