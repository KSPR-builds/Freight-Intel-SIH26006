import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class FreightRate(Base):
    __tablename__ = "freight_rates"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)
    cargo_id = Column(Integer, ForeignKey("cargo.id"), nullable=False, index=True)
    vessel_type = Column(String(50), default="Supramax", index=True)
    rate_per_ton = Column(Float, nullable=False) # USD / MT
    bunker_price_vlsfo = Column(Float, default=620.0) # USD / MT
    bdi_value = Column(Float, default=1450.0) # Baltic Dry Index
    port_congestion_delay_days = Column(Float, default=1.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    route = relationship("Route", back_populates="freight_rates")
    cargo = relationship("Cargo", back_populates="freight_rates")
