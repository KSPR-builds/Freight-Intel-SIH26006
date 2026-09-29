from pydantic import BaseModel
from typing import List, Optional

class ForecastRequest(BaseModel):
    origin_port: Optional[str] = "Singapore"
    destination_port: Optional[str] = "Chennai"
    cargo_type: Optional[str] = "Coal"
    vessel_type: Optional[str] = "Supramax"
    horizon_days: Optional[int] = 30 # 7, 30, 90, 365

class ChartDataPoint(BaseModel):
    date: str
    historical_rate: Optional[float] = None
    predicted_rate: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    is_future: bool = False

class RouteComparisonItem(BaseModel):
    route_name: str
    cargo_name: str
    current_rate: float
    predicted_rate: float
    trend_percent: float
    recommendation: str

class ForecastResponse(BaseModel):
    origin_port: str
    destination_port: str
    cargo_type: str
    vessel_type: str
    horizon_days: int
    current_rate: float
    predicted_rate: float
    trend: str # 'Declining', 'Increasing', 'Stable'
    trend_percent: float
    volatility: float
    confidence_score: float
    mae: float
    rmse: float
    r2_score: float
    model_name: str
    ai_insight: str
    chart_data: List[ChartDataPoint]
    route_comparisons: List[RouteComparisonItem]
