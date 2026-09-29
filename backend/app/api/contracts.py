import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.models.port import Port
from backend.app.models.user_notification import UserNotification
from backend.app.models.contract import ContractPlan, Voyage
from backend.app.services.auth_service import get_current_user, get_current_admin
from backend.app.services.contract_engine import (
    selectVesselType,
    buildVoyageSchedule,
    priceStructures,
    recommend
)

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

class SimulateRequest(BaseModel):
    origin_port: str
    destination_port: str
    cargo_type: str
    total_quantity_mt: int
    period_start: str # YYYY-MM-DD
    period_end: str   # YYYY-MM-DD
    parcel_size: Optional[int] = None
    preferred_structure: Optional[str] = None # spot, coa, consecutive_voyage, time_charter

class CreateContractRequest(SimulateRequest):
    name: str
    assigned_user_id: int
    vessel_type: str
    structure: str


@router.post("/simulate")
def simulate_contract(req: SimulateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    # 1. Fetch Ports
    orig = db.query(Port).filter(Port.name == req.origin_port).first()
    dest = db.query(Port).filter(Port.name == req.destination_port).first()
    
    if not orig or not dest:
        raise HTTPException(status_code=400, detail="Invalid origin or destination port")
        
    orig_dict = {"draft_depth_m": orig.draft_depth_m, "max_loa": orig.max_loa, "max_beam": orig.max_beam}
    dest_dict = {"draft_depth_m": dest.draft_depth_m, "max_loa": dest.max_loa, "max_beam": dest.max_beam}
    
    # Defaults
    parcel_sz = req.parcel_size or min(req.total_quantity_mt, 55000)
    
    # 2. Select Vessel Type
    vtype, limit_constraint = selectVesselType(parcel_sz, orig_dict, dest_dict)
    
    # 3. Simulate Schedule
    plan_dict = {
        "parcel_size_mt": parcel_sz,
        "total_quantity_mt": req.total_quantity_mt,
        "period_start": datetime.datetime.strptime(req.period_start, "%Y-%m-%d").date(),
        "period_end": datetime.datetime.strptime(req.period_end, "%Y-%m-%d").date()
    }
    
    voyages = []
    if vtype != "None":
        # Rough distance calculation
        lat_diff = abs(orig.latitude - dest.latitude)
        lng_diff = abs(orig.longitude - dest.longitude)
        dist_nm = max(1450.0, (lat_diff**2 + lng_diff**2)**0.5 * 60.0 * 1.15)
        
        try:
            voyages = buildVoyageSchedule(plan_dict, vtype, dist_nm)
        except ValueError:
            pass

    # 4. Mock Forecast for priceStructures (Normally would fetch from forecast module)
    # We will simulate a forecast series. In a real app we'd query FreightRate/Forecast tables
    forecast_series = [
        {"expected": 15.0, "low": 12.0, "high": 18.0},
        {"expected": 16.0, "low": 13.0, "high": 19.0},
        {"expected": 18.0, "low": 15.0, "high": 21.0}
    ] # Rising
    
    prices = priceStructures(plan_dict, forecast_series)
    rec = recommend(plan_dict, prices, forecast_series)
    
    return {
        "vessel_recommendation": {
            "vessel_type": vtype,
            "limiting_constraint": limit_constraint
        },
        "schedule": voyages,
        "prices": prices,
        "recommendation": rec
    }


@router.post("")
def create_contract(req: CreateContractRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    # Validate User
    assignee = db.query(User).filter(User.id == req.assigned_user_id).first()
    if not assignee:
        raise HTTPException(status_code=400, detail="Invalid assignee")
        
    start_d = datetime.datetime.strptime(req.period_start, "%Y-%m-%d").date()
    end_d = datetime.datetime.strptime(req.period_end, "%Y-%m-%d").date()
    
    cp = ContractPlan(
        name=req.name,
        structure=req.structure,
        origin_port=req.origin_port,
        destination_port=req.destination_port,
        cargo_type=req.cargo_type,
        total_quantity_mt=req.total_quantity_mt,
        period_start=start_d,
        period_end=end_d,
        vessel_type=req.vessel_type,
        created_by=current_user.id,
        assigned_user_id=assignee.id,
        status="active"
    )
    db.add(cp)
    db.commit()
    db.refresh(cp)
    
    # Build Voyages
    # Needs to run engine to get exactly what simulated schedule was
    orig = db.query(Port).filter(Port.name == req.origin_port).first()
    dest = db.query(Port).filter(Port.name == req.destination_port).first()
    
    lat_diff = abs(orig.latitude - dest.latitude) if orig else 0
    lng_diff = abs(orig.longitude - dest.longitude) if orig else 0
    dist_nm = max(1450.0, (lat_diff**2 + lng_diff**2)**0.5 * 60.0 * 1.15)

    parcel_sz = req.parcel_size or min(req.total_quantity_mt, 55000)
    
    plan_dict = {
        "parcel_size_mt": parcel_sz,
        "total_quantity_mt": req.total_quantity_mt,
        "period_start": start_d,
        "period_end": end_d
    }
    
    voyages_data = []
    if req.vessel_type != "None":
        try:
            voyages_data = buildVoyageSchedule(plan_dict, req.vessel_type, dist_nm)
        except ValueError:
            pass
            
    for v in voyages_data:
        voy = Voyage(
            contract_id=cp.id,
            sequence=v["sequence"],
            laycan_start=v["laycan_start"],
            laycan_end=v["laycan_end"],
            quantity_mt=v["quantity_mt"],
            status="planned"
        )
        db.add(voy)
        
    # Notify user
    notif = UserNotification(
        user_id=assignee.id,
        notification_type="assignment_new",
        title="New Contract Assigned",
        message=f"You have been assigned a new contract plan: {cp.name}",
        severity="info",
        link="/my-assignments"
    )
    db.add(notif)
    db.commit()
    
    return {"status": "success", "contract_id": cp.id}


@router.get("/user")
def get_user_contracts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get contract plans for the current user (includes voyages)."""
    contracts = db.query(ContractPlan).filter(ContractPlan.assigned_user_id == current_user.id).all()
    out = []
    for c in contracts:
        out.append({
            "id": c.id,
            "name": c.name,
            "structure": c.structure,
            "origin_port": c.origin_port,
            "destination_port": c.destination_port,
            "cargo_type": c.cargo_type,
            "total_quantity_mt": c.total_quantity_mt,
            "period_start": c.period_start,
            "period_end": c.period_end,
            "vessel_type": c.vessel_type,
            "status": c.status,
            "voyages": [
                {
                    "sequence": v.sequence,
                    "laycan_start": v.laycan_start,
                    "laycan_end": v.laycan_end,
                    "quantity_mt": v.quantity_mt,
                    "status": v.status
                } for v in sorted(c.voyages, key=lambda x: x.sequence)
            ]
        })
    return out
