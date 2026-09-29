import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class ProcurementPlan(Base):
    __tablename__ = "procurement_plans"

    id = Column(Integer, primary_key=True, index=True)
    plan_code = Column(String(50), unique=True, nullable=False, index=True)
    cargo_id = Column(Integer, ForeignKey("cargo.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    supplier_name = Column(String(150), nullable=False)
    quantity_mt = Column(Float, nullable=False)
    target_delivery_window = Column(String(100), nullable=False) # e.g. "May 1 - May 15, 2025"
    budget_usd = Column(Float, nullable=False)
    estimated_fob_price_per_ton = Column(Float, nullable=False)
    estimated_freight_rate_per_ton = Column(Float, nullable=False)
    estimated_total_cost_usd = Column(Float, nullable=False)
    projected_savings_usd = Column(Float, default=0.0)
    status = Column(String(50), default="Optimized") # Draft, Optimized, Approved, In Execution
    ai_recommendation_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cargo = relationship("Cargo", back_populates="procurement_plans")
    route = relationship("Route", back_populates="procurement_plans")

class CharterRecommendation(Base):
    __tablename__ = "charter_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    target_corridor = Column(String(150), nullable=False)
    cargo_type = Column(String(100), nullable=False)
    recommendation_rank = Column(Integer, default=1) # 1, 2, 3
    overall_score = Column(Float, nullable=False)
    rate_competitiveness_score = Column(Float, nullable=False)
    fuel_efficiency_score = Column(Float, nullable=False)
    schedule_reliability_score = Column(Float, nullable=False)
    projected_total_cost_usd = Column(Float, nullable=False)
    estimated_savings_usd = Column(Float, nullable=False)
    confidence_level = Column(Float, default=94.0)
    recommended_reason = Column(String(300), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vessel = relationship("Vessel", back_populates="charter_recommendations")
