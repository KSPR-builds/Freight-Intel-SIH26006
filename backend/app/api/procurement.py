from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.procurement import (
    ProcurementDashboardResponse,
    ProcurementPlanCreate,
    ProcurementPlanItem
)
from backend.app.services.procurement_service import get_procurement_data

router = APIRouter(prefix="/api/procurement", tags=["Procurement"])

@router.get("", response_model=ProcurementDashboardResponse)
def get_procurement_overview(db: Session = Depends(get_db)):
    return get_procurement_data(db)

@router.post("/plan", response_model=ProcurementPlanItem)
def create_procurement_plan(
    payload: ProcurementPlanCreate,
    db: Session = Depends(get_db)
):
    # Calculate costs
    fob_estimate = 84.50 if "Coal" in payload.commodity else 105.00
    freight_estimate = 15.20
    total_cost = payload.quantity_mt * (fob_estimate + freight_estimate)
    savings = payload.quantity_mt * 4.50

    return ProcurementPlanItem(
        id=99,
        plan_code=f"PLN-2025-{int(payload.quantity_mt % 900) + 100}",
        commodity=payload.commodity,
        origin=payload.origin,
        destination=payload.destination,
        supplier_name=payload.preferred_supplier or "Kalimantan Coal Resources",
        quantity_mt=payload.quantity_mt,
        delivery_window=payload.procurement_period,
        fob_price=fob_estimate,
        freight_rate=freight_estimate,
        total_cost_usd=total_cost,
        projected_savings_usd=savings,
        status="Optimized",
        ai_recommendation_reason="AI generated plan maximizing vessel charter efficiency and FOB volume pricing."
    )
