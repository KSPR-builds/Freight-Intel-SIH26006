from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.database.connection import get_db
from backend.app.schemas.forecast import ForecastResponse, ForecastRequest
from backend.app.services.forecast_service import generate_freight_forecast
from backend.app.models.freight import FreightRate
from backend.app.models.route import Route
from backend.app.models.cargo import Cargo
from backend.app.models.port import Port

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])

@router.get("", response_model=ForecastResponse)
def get_forecast(
    origin_port: str = Query("Singapore", description="Origin Port"),
    destination_port: str = Query("Chennai", description="Destination Port on East Coast India"),
    cargo_type: str = Query("Coal", description="Dry bulk commodity"),
    vessel_type: str = Query("Supramax", description="Vessel class"),
    horizon_days: int = Query(30, description="Forecast horizon in days (7, 30, 90, 365)"),
    db: Session = Depends(get_db)
):
    return generate_freight_forecast(
        db=db,
        origin_name=origin_port,
        dest_name=destination_port,
        cargo_type=cargo_type,
        vessel_type=vessel_type,
        horizon_days=horizon_days
    )

@router.post("/predict", response_model=ForecastResponse)
def predict_freight_rate(
    payload: ForecastRequest,
    db: Session = Depends(get_db)
):
    return generate_freight_forecast(
        db=db,
        origin_name=payload.origin_port or "Singapore",
        dest_name=payload.destination_port or "Chennai",
        cargo_type=payload.cargo_type or "Coal",
        vessel_type=payload.vessel_type or "Supramax",
        horizon_days=payload.horizon_days or 30
    )

@router.get("/history")
def get_historical_rates(
    limit: int = 60,
    db: Session = Depends(get_db)
):
    rates = db.query(FreightRate).order_by(FreightRate.date.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "date": r.date.strftime("%Y-%m-%d"),
            "rate_per_ton": r.rate_per_ton,
            "bunker_price": r.bunker_price_vlsfo,
            "bdi_value": r.bdi_value,
            "delay_days": r.port_congestion_delay_days
        }
        for r in reversed(rates)
    ]
