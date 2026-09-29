from pydantic import BaseModel
from typing import List, Optional

class SupplierItem(BaseModel):
    name: str
    country: str
    commodity: str
    reliability_score: float
    fob_price_per_ton: float
    port_loading_speed_tpd: int
    moisture_grade: str
    lead_time_days: int

class ProcurementPlanCreate(BaseModel):
    commodity: str = "Coal"
    quantity_mt: float = 65000.0
    origin: str = "Indonesia"
    destination: str = "Visakhapatnam"
    procurement_period: str = "May 2025"
    budget_usd: float = 6500000.0
    preferred_supplier: Optional[str] = "Kalimantan Coal Resources"

class ProcurementPlanItem(BaseModel):
    id: int
    plan_code: str
    commodity: str
    origin: str
    destination: str
    supplier_name: str
    quantity_mt: float
    delivery_window: str
    fob_price: float
    freight_rate: float
    total_cost_usd: float
    projected_savings_usd: float
    status: str
    ai_recommendation_reason: str

class CommodityDemandTrend(BaseModel):
    month: str
    demand_mt: float
    avg_price_usd: float
    forecast_price_usd: float

class ProcurementDashboardResponse(BaseModel):
    total_demand_mt: float
    procurement_planned_mt: float
    estimated_total_cost_usd: float
    average_price_per_ton: float
    potential_savings_usd: float
    top_suppliers: List[SupplierItem]
    upcoming_plans: List[ProcurementPlanItem]
    demand_trends: List[CommodityDemandTrend]
    ai_recommendations: List[dict]
