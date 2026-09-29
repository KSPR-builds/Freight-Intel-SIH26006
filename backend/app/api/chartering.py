from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database.connection import get_db
from backend.app.schemas.vessel import CharterRecommendationResponse, VesselCharterRequest
from backend.app.services.charter_service import get_charter_recommendations
from backend.app.models.vessel import Vessel

router = APIRouter(prefix="/api/chartering", tags=["Chartering"])

@router.get("/recommend", response_model=List[CharterRecommendationResponse])
def recommend_vessels(
    corridor: str = Query("Singapore → Visakhapatnam"),
    cargo_type: str = Query("Coal"),
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db)
):
    return get_charter_recommendations(
        db=db,
        corridor=corridor,
        cargo_type=cargo_type,
        limit=limit
    )

@router.post("/book")
def book_vessel_fixture(
    payload: VesselCharterRequest,
    db: Session = Depends(get_db)
):
    vessel = db.query(Vessel).filter(Vessel.id == payload.vessel_id).first()
    if not vessel:
        return {"status": "error", "message": "Vessel not found"}

    # Update vessel status to Booked
    vessel.availability_status = "Booked"
    db.commit()

    return {
        "status": "success",
        "fixture_code": f"FIX-2025-{vessel.id * 137}",
        "vessel_name": vessel.name,
        "daily_rate": payload.agreed_daily_rate,
        "laycan": f"{payload.laycan_start} to {payload.laycan_end}",
        "message": f"Fixture confirmed for {vessel.name}. Charter party documents generated."
    }
