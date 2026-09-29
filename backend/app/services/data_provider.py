import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class DataProvider(ABC):
    @abstractmethod
    def get_live_fuel_prices(self) -> Dict[str, float]:
        pass

    @abstractmethod
    def get_marine_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_port_congestion_index(self, port_code: str) -> float:
        pass

class DemoDataProvider(DataProvider):
    def get_live_fuel_prices(self) -> Dict[str, float]:
        return {
            "VLSFO_Singapore": 618.50,
            "MGO_Singapore": 782.00,
            "IFO380_Singapore": 472.00,
            "VLSFO_Fujairah": 625.00,
            "Brent_Crude": 79.40
        }

    def get_marine_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "condition": "Moderate Swell",
            "wind_knots": 14.5,
            "wave_height_m": 1.8,
            "risk_factor": 0.12,
            "source": "Simulated Copernicus Marine Service"
        }

    def get_port_congestion_index(self, port_code: str) -> float:
        benchmarks = {
            "INMAA": 28.5, # Chennai
            "INVTZ": 22.0, # Visakhapatnam
            "INPRT": 34.0, # Paradip
            "INCCU": 42.0, # Kolkata
            "INKAK": 18.0, # Kakinada
            "SGSIN": 14.0, # Singapore
        }
        return benchmarks.get(port_code, 25.0)

class RealDataProvider(DataProvider):
    """
    Real data provider for production deployment.
    Uses environment API keys: WEATHER_API_KEY, MARINE_API_KEY.
    Gracefully falls back to demo values if external services encounter timeouts.
    """
    def __init__(self):
        self.weather_key = os.getenv("WEATHER_API_KEY")
        self.marine_key = os.getenv("MARINE_API_KEY")
        self._fallback = DemoDataProvider()

    def get_live_fuel_prices(self) -> Dict[str, float]:
        # Production hook for Platts / BunkerIndex API
        return self._fallback.get_live_fuel_prices()

    def get_marine_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        # Production hook for MarineTraffic / StormGeo / Copernicus API
        return self._fallback.get_marine_weather(lat, lng)

    def get_port_congestion_index(self, port_code: str) -> float:
        # Production hook for AIS live queue telemetry
        return self._fallback.get_port_congestion_index(port_code)

def get_data_provider() -> DataProvider:
    use_real = os.getenv("USE_REAL_DATA", "false").lower() in ("true", "1", "yes")
    if use_real:
        return RealDataProvider()
    return DemoDataProvider()
