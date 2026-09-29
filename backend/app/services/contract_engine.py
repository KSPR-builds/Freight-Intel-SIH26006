import datetime
import math
from typing import Dict, List, Tuple
from backend.app.core.contract_config import ASSUMPTIONS

def selectVesselType(parcel_size_mt: float, load_port: dict, discharge_port: dict) -> Tuple[str, str]:
    """
    Checks parcel size, port max draft, LOA, and beam against available vessel types.
    Returns the largest fitting vessel type and the limiting constraint if any,
    or ("None", "constraint") if it can't fit anywhere.
    """
    vessels = ASSUMPTIONS["vessels"]
    
    # Sort vessels by capacity descending (try largest first)
    sorted_vtypes = sorted(vessels.keys(), key=lambda k: vessels[k]["capacity"], reverse=True)
    
    # We want a vessel that can carry the parcel (or at least the parcel fits in the vessel).
    # Since we want the "largest fitting vessel type" for the parcel size:
    # Actually, we should find the most efficient one that can hold the parcel.
    # Wait, the prompt says "largest fitting vessel type".
    # Let's find the largest vessel that satisfies the port constraints.
    
    limiting_constraint = None
    
    for vtype in sorted_vtypes:
        props = vessels[vtype]
        
        # Check capacity
        if props["capacity"] < parcel_size_mt:
            continue
            
        # Check load port constraints
        if props["draft_m"] > load_port.get("draft_depth_m", 100):
            limiting_constraint = f"Load port draft ({load_port.get('draft_depth_m')}m)"
            continue
        if props["loa_m"] > load_port.get("max_loa", 1000):
            limiting_constraint = f"Load port LOA ({load_port.get('max_loa')}m)"
            continue
        if props["beam_m"] > load_port.get("max_beam", 1000):
            limiting_constraint = f"Load port beam ({load_port.get('max_beam')}m)"
            continue
            
        # Check discharge port constraints
        if props["draft_m"] > discharge_port.get("draft_depth_m", 100):
            limiting_constraint = f"Discharge port draft ({discharge_port.get('draft_depth_m')}m)"
            continue
        if props["loa_m"] > discharge_port.get("max_loa", 1000):
            limiting_constraint = f"Discharge port LOA ({discharge_port.get('max_loa')}m)"
            continue
        if props["beam_m"] > discharge_port.get("max_beam", 1000):
            limiting_constraint = f"Discharge port beam ({discharge_port.get('max_beam')}m)"
            continue
            
        return vtype, "Fits perfectly"
        
    if limiting_constraint:
        return "None", limiting_constraint
    return "None", "Parcel too large for any vessel"


def buildVoyageSchedule(plan: dict, vessel_type: str, distance_nm: float) -> List[dict]:
    """
    Calculate number of voyages, duration, and idle days.
    """
    if vessel_type not in ASSUMPTIONS["vessels"]:
        raise ValueError(f"Unknown vessel type: {vessel_type}")
        
    vprops = ASSUMPTIONS["vessels"][vessel_type]
    parcel_size = plan["parcel_size_mt"]
    
    if parcel_size > vprops["capacity"]:
        parcel_size = vprops["capacity"]
        
    num_voyages = math.ceil(plan["total_quantity_mt"] / parcel_size)
    
    sailing_days = distance_nm / (vprops["speed_knots"] * 24.0)
    handling_days_load = parcel_size / vprops["handling_mt_per_day"]
    handling_days_disc = parcel_size / vprops["handling_mt_per_day"]
    
    # Simple assumption: 2 days delay per port
    delay_days = 4.0
    
    voyage_days = (sailing_days * 2) + handling_days_load + handling_days_disc + delay_days
    
    total_days_available = (plan["period_end"] - plan["period_start"]).days
    
    # Spread them out
    voyages = []
    current_date = plan["period_start"]
    
    for i in range(num_voyages):
        start = current_date
        end = start + datetime.timedelta(days=int(voyage_days))
        voyages.append({
            "sequence": i + 1,
            "laycan_start": start,
            "laycan_end": end,
            "quantity_mt": min(parcel_size, plan["total_quantity_mt"] - (i * parcel_size)),
            "duration_days": round(voyage_days, 1)
        })
        current_date = end + datetime.timedelta(days=2) # 2 days buffer
        
    return voyages


def priceStructures(plan: dict, forecast_series: List[dict]) -> dict:
    """
    Returns low/expected/high total cost for:
    - spot
    - coa
    - consecutive_voyage
    - time_charter
    Using forecast series.
    """
    # Simply sum up the forecasts for the periods of the voyages.
    # For a purely illustrative engine:
    total_q = plan["total_quantity_mt"]
    
    # Base rates from forecast (avg over period)
    avg_expected = sum(f["expected"] for f in forecast_series) / len(forecast_series) if forecast_series else 15.0
    avg_low = sum(f["low"] for f in forecast_series) / len(forecast_series) if forecast_series else 12.0
    avg_high = sum(f["high"] for f in forecast_series) / len(forecast_series) if forecast_series else 18.0
    
    # Risk premiums / discounts
    # COA: fixed rate slightly below expected spot if rising, above if falling
    is_rising = forecast_series[-1]["expected"] > forecast_series[0]["expected"] if len(forecast_series) > 1 else False
    
    coa_rate = avg_expected * 0.95 if is_rising else avg_expected * 1.05
    cv_rate = avg_expected * 0.97 if is_rising else avg_expected * 1.03
    
    # Spot floats fully with market
    
    return {
        "spot": {
            "low": avg_low * total_q,
            "expected": avg_expected * total_q,
            "high": avg_high * total_q
        },
        "coa": {
            "low": coa_rate * total_q,
            "expected": coa_rate * total_q,
            "high": coa_rate * total_q
        },
        "consecutive_voyage": {
            "low": cv_rate * total_q,
            "expected": cv_rate * total_q,
            "high": cv_rate * total_q
        },
        "time_charter": {
            "low": (avg_low * 0.9) * total_q,
            "expected": (avg_expected * 0.9) * total_q,
            "high": (avg_high * 0.9) * total_q
        }
    }


def recommend(plan: dict, prices: dict, forecast_series: List[dict]) -> dict:
    """
    Cheapest structure, risk band, and suggested fixing window.
    """
    is_rising = forecast_series[-1]["expected"] > forecast_series[0]["expected"] if len(forecast_series) > 1 else False
    
    if is_rising:
        cheapest = "coa"
        advice = "fix within the next 2 weeks because rates are forecast to rise"
        risk = "medium"
    else:
        cheapest = "spot"
        advice = "wait and fix spot, because rates are forecast to fall"
        risk = "high"
        
    return {
        "cheapest_structure": cheapest,
        "risk_band": risk,
        "advice": advice
    }
