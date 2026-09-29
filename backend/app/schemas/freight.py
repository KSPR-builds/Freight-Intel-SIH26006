from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FreightRateItem(BaseModel):
    id: int
    date: str
    route_name: str
    origin_port: str
    destination_port: str
    cargo_name: str
    vessel_type: str
    rate_per_ton: float
    bunker_price: float
    bdi_value: float

class LiveMarketRate(BaseModel):
    route_name: str
    origin_port: str
    destination_port: str
    cargo_name: str
    current_rate: float
    change_24h_percent: float
    trend: str # Up, Down, Stable
    bunker_index: float
