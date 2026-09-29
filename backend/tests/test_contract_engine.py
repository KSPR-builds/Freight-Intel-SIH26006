import datetime
import pytest
from backend.app.services.contract_engine import (
    selectVesselType,
    buildVoyageSchedule,
    priceStructures,
    recommend
)
from backend.app.core.contract_config import ASSUMPTIONS

def test_select_vessel_type_success():
    load_port = {"draft_depth_m": 16.5, "max_loa": 300, "max_beam": 50}
    discharge_port = {"draft_depth_m": 14.5, "max_loa": 250, "max_beam": 35}
    
    # Panamax should fit, Capesize shouldn't (too deep for discharge, loa/beam too big)
    vtype, reason = selectVesselType(70000, load_port, discharge_port)
    assert vtype == "Panamax"
    assert reason == "Fits perfectly"


def test_select_vessel_type_too_big():
    load_port = {"draft_depth_m": 16.5, "max_loa": 300, "max_beam": 50}
    discharge_port = {"draft_depth_m": 11.0, "max_loa": 200, "max_beam": 32}
    
    # Even Supramax needs 11.5m draft, only Handysize fits (draft 10m)
    # But parcel size is 150000 (Capesize parcel).
    vtype, reason = selectVesselType(150000, load_port, discharge_port)
    assert vtype == "None"
    assert "Discharge port draft" in reason or "Discharge port LOA" in reason or "Discharge port beam" in reason


def test_build_voyage_schedule():
    plan = {
        "parcel_size_mt": 70000,
        "total_quantity_mt": 140000,
        "period_start": datetime.date(2026, 1, 1),
        "period_end": datetime.date(2026, 6, 30)
    }
    
    voyages = buildVoyageSchedule(plan, "Panamax", 1000) # distance = 1000 nm
    
    assert len(voyages) == 2
    assert voyages[0]["quantity_mt"] == 70000
    assert voyages[1]["quantity_mt"] == 70000
    assert voyages[0]["sequence"] == 1
    assert voyages[1]["sequence"] == 2


def test_price_structures_and_recommend_rising():
    plan = {"total_quantity_mt": 100000}
    # Rising forecast
    forecast = [
        {"expected": 10.0, "low": 8.0, "high": 12.0},
        {"expected": 15.0, "low": 12.0, "high": 18.0},
        {"expected": 20.0, "low": 16.0, "high": 24.0},
    ]
    
    prices = priceStructures(plan, forecast)
    
    # Expected spot = 15.0 avg
    assert prices["spot"]["expected"] == 1500000.0
    
    # COA is 0.95 * avg because rising (discount for locking in early)
    assert prices["coa"]["expected"] == 1500000.0 * 0.95
    
    rec = recommend(plan, prices, forecast)
    assert rec["cheapest_structure"] == "coa"
    assert "rise" in rec["advice"]


def test_price_structures_and_recommend_falling():
    plan = {"total_quantity_mt": 100000}
    # Falling forecast
    forecast = [
        {"expected": 20.0, "low": 18.0, "high": 22.0},
        {"expected": 15.0, "low": 12.0, "high": 18.0},
        {"expected": 10.0, "low": 8.0, "high": 12.0},
    ]
    
    prices = priceStructures(plan, forecast)
    
    # Expected spot = 15.0 avg
    assert prices["spot"]["expected"] == 1500000.0
    
    # COA is 1.05 * avg because falling (premium for locking in early instead of riding it down)
    assert prices["coa"]["expected"] == 1500000.0 * 1.05
    
    rec = recommend(plan, prices, forecast)
    assert rec["cheapest_structure"] == "spot"
    assert "fall" in rec["advice"]
