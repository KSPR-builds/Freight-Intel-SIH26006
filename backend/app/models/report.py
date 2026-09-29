import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from backend.app.database.connection import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(100), nullable=False, index=True) # Freight Forecast Report, Vessel Chartering Report, etc.
    corridor = Column(String(150), default="East Coast India Corridors")
    commodity = Column(String(100), default="All Commodities")
    generated_by = Column(String(100), default="AI Optimization Engine")
    summary = Column(Text, nullable=True)
    file_size_kb = Column(Integer, default=142)
    format = Column(String(20), default="PDF") # PDF, CSV, Excel
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    notification_type = Column(String(50), default="Alert") # Alert, Recommendation, System, Route
    severity = Column(String(20), default="info") # info, warning, success, error
    is_read = Column(Boolean, default=False)
    action_url = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
