from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database.connection import get_db
from backend.app.models.vessel import Vessel
from backend.app.schemas.vessel import VesselResponse

router = APIRouter(prefix="/api/vessels", tags=["Vessels"])

@router.get("", response_model=List[VesselResponse])
def list_vessels(
    vessel_type: Optional[str] = Query(None, description="Capesize, Panamax, Supramax, Ultramax, Handymax"),
    availability: Optional[str] = Query(None, description="Available, Immediate, Within 7 Days"),
    search: Optional[str] = Query(None, description="Search by vessel name or IMO"),
    min_dwt: Optional[int] = Query(None),
    max_dwt: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Vessel)
    if vessel_type and vessel_type != "All":
        query = query.filter(Vessel.vessel_type == vessel_type)
    if availability and availability != "All":
        query = query.filter(Vessel.availability_status == availability)
    if search:
        query = query.filter(Vessel.name.ilike(f"%{search}%") | Vessel.imo.ilike(f"%{search}%"))
    if min_dwt:
        query = query.filter(Vessel.dwt >= min_dwt)
    if max_dwt:
        query = query.filter(Vessel.dwt <= max_dwt)

    return query.order_by(Vessel.recommendation_score.desc()).limit(limit).all()

@router.get("/{vessel_id}", response_model=VesselResponse)
def get_vessel_details(vessel_id: int, db: Session = Depends(get_db)):
    vessel = db.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel
