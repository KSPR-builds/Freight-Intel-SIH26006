from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class VesselBase(BaseModel):
    name: str
    imo: str
    vessel_type: str
    dwt: int
    built_year: int
    length_overall_m: float
    beam_m: float
    draft_m: float
    flag: str
    classification_society: str
    main_engine: str
    service_speed_knots: float
    fuel_consumption_tpd: float
    daily_hire_rate: float
    availability_status: str
    current_position_name: str
    current_lat: float
    current_lng: float
    eta: str
    recommendation_score: float
    why_recommended: str
    image_url: str
    owner_operator: str

class VesselResponse(VesselBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VesselCharterRequest(BaseModel):
    vessel_id: int
    cargo_id: int
    route_id: int
    laycan_start: str
    laycan_end: str
    agreed_daily_rate: float

class CharterRecommendationResponse(BaseModel):
    id: int
    vessel_id: int
    vessel_name: str
    vessel_type: str
    dwt: int
    daily_hire_rate: float
    overall_score: float
    projected_total_cost_usd: float
    estimated_savings_usd: float
    confidence_level: float
    recommended_reason: str
    image_url: str
