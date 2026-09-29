from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KPICard(BaseModel):
    title: str
    value: str
    numeric_value: float
    change_text: str
    change_type: str # positive, negative, neutral
    icon: str

class TopPortStat(BaseModel):
    name: str
    code: str
    region: str
    volume_mt: float
    congestion_index: float
    waiting_days: float
    status: str

class UpcomingShipmentItem(BaseModel):
    shipment_code: str
    vessel_name: str
    route_name: str
    cargo_name: str
    quantity_mt: float
    status: str
    eta: str

class AIRecommendationItem(BaseModel):
    id: str
    title: str
    category: str
    confidence: float
    impact: str # High, Medium, Low
    reasoning: str
    action: str

class UserDashboardResponse(BaseModel):
    user_name: Optional[str] = ""        # Populated by frontend from auth session
    organization: Optional[str] = ""     # Populated by frontend from auth session
    kpis: List[KPICard]
    freight_chart_summary: dict
    top_ports: List[TopPortStat]
    upcoming_shipments: List[UpcomingShipmentItem]
    ai_recommendations: List[AIRecommendationItem]
    market_overview: List[dict]
    sustainability_metrics: dict
