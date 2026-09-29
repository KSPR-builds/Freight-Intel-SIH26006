from pydantic import BaseModel
from typing import List, Optional, Any

class PortInfo(BaseModel):
    id: int
    name: str
    code: str
    country: str
    region: str
    latitude: float
    longitude: float
    draft_depth_m: float
    berths: int
    avg_handling_time_hours: float
    congestion_index: float
    waiting_time_days: float
    status: str

class RouteWaypoint(BaseModel):
    name: str
    lat: float
    lng: float

class RouteOption(BaseModel):
    route_id: int
    route_name: str
    origin_port: str
    destination_port: str
    label: str # 'Recommended', 'Lowest Cost', 'Fastest', 'Lowest Emissions'
    distance_nm: float
    transit_time_days: float
    bunker_fuel_mt: float
    total_cost_usd: float
    savings_usd: float
    co2_emissions_mt: float
    weather_risk: str
    waypoints: List[List[float]] # [[lat, lng], ...]

class RouteOptimizeRequest(BaseModel):
    origin_port: str = "Singapore"
    destination_port: str = "Visakhapatnam"
    vessel_speed_knots: Optional[float] = 13.5
    fuel_price_usd_mt: Optional[float] = 620.0
    priority: Optional[str] = "balanced" # balanced, cost, speed, emissions

class RouteOptimizationResponse(BaseModel):
    origin: str
    destination: str
    best_route: RouteOption
    lowest_cost_route: RouteOption
    fastest_route: RouteOption
    lowest_emissions_route: RouteOption
    available_ports: List[PortInfo]
