import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Cargo(Base):
    __tablename__ = "cargo"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True) # Coal, Iron Ore, Fertilizer, etc.
    code = Column(String(20), unique=True, nullable=False)
    category = Column(String(50), default="Dry Bulk")
    stowage_factor = Column(Float, default=1.2) # m3/MT
    typical_handling_rate_tpd = Column(Integer, default=25000) # Tons per day
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    freight_rates = relationship("FreightRate", back_populates="cargo")
    shipments = relationship("Shipment", back_populates="cargo")
    procurement_plans = relationship("ProcurementPlan", back_populates="cargo")
