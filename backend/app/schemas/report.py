from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportItem(BaseModel):
    id: int
    title: str
    report_type: str
    corridor: str
    commodity: str
    generated_by: str
    summary: str
    file_size_kb: int
    format: str
    created_at: str

class NotificationItem(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    severity: str
    is_read: bool
    action_url: Optional[str] = None
    created_at: str
