from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# ─── Assignment Schemas ───────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    user_id: int
    origin_port: str
    destination_port: str
    cargo_type: str
    quantity_mt: float
    laycan_start: date
    laycan_end: date
    vessel_type: Optional[str] = None
    notes: Optional[str] = None


class AssignmentUpdate(BaseModel):
    origin_port: Optional[str] = None
    destination_port: Optional[str] = None
    cargo_type: Optional[str] = None
    quantity_mt: Optional[float] = None
    laycan_start: Optional[date] = None
    laycan_end: Optional[date] = None
    vessel_type: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None   # active | updated | cancelled


class AssignmentResponse(BaseModel):
    id: int
    user_id: int
    origin_port: str
    destination_port: str
    cargo_type: str
    quantity_mt: float
    laycan_start: date
    laycan_end: date
    vessel_type: Optional[str]
    notes: Optional[str]
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── UserNotification Schemas ─────────────────────────────────────────────────

class UserNotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    link_url: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MarkReadRequest(BaseModel):
    notification_ids: list[int]


# ─── Message Schemas ──────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    thread_user_id: int    # the non-admin user the conversation is with
    body: str


class MessageResponse(BaseModel):
    id: int
    thread_user_id: int
    sender_id: int
    sender_role: str
    body: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Emergency Schemas ────────────────────────────────────────────────────────

class EmergencyCreate(BaseModel):
    category: str          # cyclone | severe_weather | war_security | port_closure | other
    severity: str          # low | medium | high | critical
    location: Optional[str] = None
    message: str


class EmergencyAcknowledge(BaseModel):
    status: str = "acknowledged"   # acknowledged | resolved


class EmergencyResponse(BaseModel):
    id: int
    user_id: int
    category: str
    severity: str
    location: Optional[str]
    message: str
    status: str
    created_at: datetime
    acknowledged_by: Optional[int]
    acknowledged_at: Optional[datetime]

    class Config:
        from_attributes = True
