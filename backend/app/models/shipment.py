import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_code = Column(String(50), unique=True, nullable=False, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    cargo_id = Column(Integer, ForeignKey("cargo.id"), nullable=False)
    quantity_mt = Column(Float, nullable=False)
    freight_rate_per_ton = Column(Float, nullable=False)
    total_cost_usd = Column(Float, nullable=False)
    status = Column(String(50), default="In Transit") # Scheduled, In Transit, Discharging, Completed
    departure_date = Column(DateTime, nullable=False)
    estimated_arrival_date = Column(DateTime, nullable=False)
    actual_arrival_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vessel = relationship("Vessel", back_populates="shipments")
    route = relationship("Route", back_populates="shipments")
    cargo = relationship("Cargo", back_populates="shipments")
