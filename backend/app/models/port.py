import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Port(Base):
    __tablename__ = "ports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True) # e.g. 'INMAA', 'INVTZ'
    country = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False) # 'East Coast India', 'Southeast Asia', etc.
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    draft_depth_m = Column(Float, default=14.5)
    max_loa = Column(Float, default=300.0)
    max_beam = Column(Float, default=50.0)
    berths = Column(Integer, default=12)
    avg_handling_time_hours = Column(Float, default=36.0)
    congestion_index = Column(Float, default=24.5) # 0 to 100
    waiting_time_days = Column(Float, default=1.8)
    status = Column(String(50), default="Operational") # Operational, Congested, Maintenance
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    origin_routes = relationship("Route", foreign_keys="[Route.origin_port_id]", back_populates="origin_port")
    destination_routes = relationship("Route", foreign_keys="[Route.destination_port_id]", back_populates="destination_port")
