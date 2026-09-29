from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database.connection import get_db
from backend.app.schemas.route import PortInfo, RouteOptimizationResponse, RouteOptimizeRequest
from backend.app.services.route_service import get_ports_list, optimize_maritime_route
from backend.app.models.port import Port

router_ports = APIRouter(prefix="/api/ports", tags=["Ports"])
router_routes = APIRouter(prefix="/api/routes", tags=["Routes"])

@router_ports.get("", response_model=List[PortInfo])
def list_ports(
    region: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    ports = get_ports_list(db)
    if region and region != "All":
        ports = [p for p in ports if p.region.lower() == region.lower()]
    if country and country != "All":
        ports = [p for p in ports if p.country.lower() == country.lower()]
    return ports

@router_routes.get("/optimize", response_model=RouteOptimizationResponse)
def get_optimized_route(
    origin: str = Query("Singapore"),
    destination: str = Query("Visakhapatnam"),
    fuel_price: float = Query(620.0),
    db: Session = Depends(get_db)
):
    return optimize_maritime_route(
        db=db,
        origin_name=origin,
        dest_name=destination,
        fuel_price=fuel_price
    )

@router_routes.post("/optimize", response_model=RouteOptimizationResponse)
def post_optimized_route(
    payload: RouteOptimizeRequest,
    db: Session = Depends(get_db)
):
    return optimize_maritime_route(
        db=db,
        origin_name=payload.origin_port,
        dest_name=payload.destination_port,
        fuel_price=payload.fuel_price_usd_mt or 620.0
    )
