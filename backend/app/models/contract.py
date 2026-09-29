import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class ContractPlan(Base):
    __tablename__ = "contract_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    structure = Column(String(50), nullable=False) # spot, coa, consecutive_voyage, time_charter
    origin_port = Column(String(100), nullable=False)
    destination_port = Column(String(100), nullable=False)
    cargo_type = Column(String(100), nullable=False)
    total_quantity_mt = Column(Integer, nullable=False)
    
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    vessel_type = Column(String(50), nullable=True)
    fixed_rate_per_mt = Column(Float, nullable=True)
    daily_hire = Column(Float, nullable=True)
    
    status = Column(String(30), default="draft")
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    voyages = relationship("Voyage", back_populates="contract_plan", cascade="all, delete-orphan")


class Voyage(Base):
    __tablename__ = "voyages"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contract_plans.id"), nullable=False)
    sequence = Column(Integer, nullable=False)
    
    laycan_start = Column(Date, nullable=False)
    laycan_end = Column(Date, nullable=False)
    
    quantity_mt = Column(Integer, nullable=False)
    vessel_name = Column(String(100), nullable=True)
    
    estimated_cost = Column(Float, nullable=True)
    status = Column(String(30), default="planned")

    # Relationships
    contract_plan = relationship("ContractPlan", back_populates="voyages")
