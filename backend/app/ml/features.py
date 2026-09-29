import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def build_feature_vector(
    historical_rates: list[float],
    distance_nm: float,
    bunker_price: float,
    port_congestion_index: float,
    target_date: datetime,
    cargo_type: str = "Coal",
    vessel_type: str = "Supramax"
) -> np.ndarray:
    """
    Extracts numerical ML features for predicting the future freight rate:
    - Lag 1 rate (latest)
    - 7-day moving average
    - 30-day moving average
    - 14-day rate momentum (rate - lag14)
    - Volatility (standard deviation of last 14 days)
    - Distance in Nautical Miles
    - Bunker Fuel (VLSFO) price per MT
    - Port Congestion index (0-100)
    - Seasonality features (Month sin/cos, Quarter)
    - Cargo type one-hot/multiplier
    - Vessel type factor
    """
    if len(historical_rates) == 0:
        rates = [22.5] * 30
    elif len(historical_rates) < 30:
        rates = [historical_rates[0]] * (30 - len(historical_rates)) + list(historical_rates)
    else:
        rates = list(historical_rates[-30:])

    rates_arr = np.array(rates, dtype=float)

    lag_1 = rates_arr[-1]
    ma_7 = float(np.mean(rates_arr[-7:]))
    ma_30 = float(np.mean(rates_arr[-30:]))
    momentum_14 = float(rates_arr[-1] - rates_arr[-14]) if len(rates_arr) >= 14 else 0.0
    volatility_14 = float(np.std(rates_arr[-14:])) if len(rates_arr) >= 14 else 1.0

    # Seasonality
    month = target_date.month
    month_sin = float(np.sin(2 * np.pi * month / 12.0))
    month_cos = float(np.cos(2 * np.pi * month / 12.0))
    quarter = (month - 1) // 3 + 1

    # Cargo multiplier encoding
    cargo_multipliers = {
        "Coal": 1.0,
        "Iron Ore": 1.15,
        "Fertilizer": 1.25,
        "Grain": 1.20,
        "Bauxite": 1.10,
        "Dry Bulk": 1.05
    }
    cargo_factor = cargo_multipliers.get(cargo_type, 1.0)

    # Vessel multiplier encoding
    vessel_multipliers = {
        "Capesize": 0.85, # lower per-ton rate due to massive economies of scale
        "Panamax": 0.95,
        "Ultramax": 1.02,
        "Supramax": 1.05,
        "Handymax": 1.15
    }
    vessel_factor = vessel_multipliers.get(vessel_type, 1.0)

    features = [
        lag_1,
        ma_7,
        ma_30,
        momentum_14,
        volatility_14,
        distance_nm,
        bunker_price,
        port_congestion_index,
        month_sin,
        month_cos,
        float(quarter),
        cargo_factor,
        vessel_factor
    ]

    return np.array(features, dtype=float)
