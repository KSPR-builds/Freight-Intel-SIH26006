from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.route import RouteOptimizationResponse, RouteOptimizeRequest
from backend.app.services.route_service import optimize_maritime_route

router = APIRouter(prefix="/api/routes", tags=["Routes"])

@router.get("/optimize", response_model=RouteOptimizationResponse)
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

@router.post("/optimize", response_model=RouteOptimizationResponse)
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
