import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True) # Singapore -> Chennai
    origin_port_id = Column(Integer, ForeignKey("ports.id"), nullable=False)
    destination_port_id = Column(Integer, ForeignKey("ports.id"), nullable=False)
    distance_nm = Column(Float, nullable=False) # Nautical Miles
    typical_transit_days = Column(Float, nullable=False)
    bunker_consumption_mt = Column(Float, nullable=False)
    canal_fees_usd = Column(Float, default=0.0)
    weather_risk_factor = Column(Float, default=0.15) # 0 to 1
    co2_emissions_mt = Column(Float, default=450.0)
    is_active = Column(Boolean, default=True)
    waypoints_json = Column(String, nullable=True) # JSON coordinates list for map rendering
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    origin_port = relationship("Port", foreign_keys=[origin_port_id], back_populates="origin_routes")
    destination_port = relationship("Port", foreign_keys=[destination_port_id], back_populates="destination_routes")
    freight_rates = relationship("FreightRate", back_populates="route")
    shipments = relationship("Shipment", back_populates="route")
    procurement_plans = relationship("ProcurementPlan", back_populates="route")
