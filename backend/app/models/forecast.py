import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from backend.app.database.connection import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    target_date = Column(DateTime, nullable=False, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    cargo_id = Column(Integer, ForeignKey("cargo.id"), nullable=False)
    vessel_type = Column(String(50), default="Supramax")
    horizon_days = Column(Integer, default=30) # 7, 30, 90, 365
    predicted_rate = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    confidence_score = Column(Float, default=92.5) # Percentage
    trend = Column(String(20), default="Declining") # Declining, Increasing, Stable
    trend_percent = Column(Float, default=-6.5)
    volatility = Column(Float, default=4.2)
    model_name = Column(String(50), default="GradientBoostingRegressor")
    mae = Column(Float, default=0.74)
    rmse = Column(Float, default=1.02)
    r2_score = Column(Float, default=0.91)
