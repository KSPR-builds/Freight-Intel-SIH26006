from backend.app.models.user import User, Role
from backend.app.models.port import Port
from backend.app.models.cargo import Cargo
from backend.app.models.route import Route
from backend.app.models.vessel import Vessel
from backend.app.models.freight import FreightRate
from backend.app.models.forecast import Forecast
from backend.app.models.shipment import Shipment
from backend.app.models.procurement import ProcurementPlan, CharterRecommendation
from backend.app.models.market_data import MarketData
from backend.app.models.report import Report, Notification
from backend.app.models.audit_log import AuditLog
from backend.app.models.assignment import Assignment
from backend.app.models.user_notification import UserNotification
from backend.app.models.message import Message
from backend.app.models.emergency import Emergency

__all__ = [
    "User",
    "Role",
    "Port",
    "Cargo",
    "Route",
    "Vessel",
    "FreightRate",
    "Forecast",
    "Shipment",
    "ProcurementPlan",
    "CharterRecommendation",
    "MarketData",
    "Report",
    "Notification",
    "AuditLog",
    # New role-based tables
    "Assignment",
    "UserNotification",
    "Message",
    "Emergency",
]
