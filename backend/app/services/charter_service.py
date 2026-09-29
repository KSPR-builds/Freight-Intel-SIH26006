from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.vessel import Vessel
from backend.app.models.route import Route
from backend.app.models.cargo import Cargo
from backend.app.schemas.vessel import CharterRecommendationResponse

def compute_vessel_score(
    vessel: Vessel,
    route: Optional[Route] = None,
    cargo: Optional[Cargo] = None,
    desired_dwt: Optional[int] = None
) -> Dict[str, Any]:
    """
    Weighted scoring algorithm for vessel chartering suitability:
    - Rate competitiveness (30% weight)
    - Fuel efficiency (25% weight)
    - Availability timing (20% weight)
    - Draft & corridor compatibility (15% weight)
    - Modernity / Built year & class (10% weight)
    """
    # 1. Rate score (benchmarking against $16,000/day for Supramax/Ultramax, $22,000/day for Capesize)
    expected_rate = 16500.0 if vessel.vessel_type in ("Supramax", "Ultramax", "Handymax") else 24000.0
    rate_diff_ratio = (expected_rate - vessel.daily_hire_rate) / expected_rate
    rate_score = max(40.0, min(99.0, 75.0 + rate_diff_ratio * 40.0))

    # 2. Fuel efficiency score (lower consumption relative to DWT is better)
    fuel_per_10k_dwt = (vessel.fuel_consumption_tpd / vessel.dwt) * 10000.0
    # benchmark is ~4.0 TPD per 10k DWT
    fuel_score = max(50.0, min(98.0, 100.0 - (fuel_per_10k_dwt - 2.5) * 20.0))

    # 3. Availability score
    avail_map = {
        "Available": 96.0,
        "Immediate": 98.0,
        "Within 7 Days": 85.0,
        "Within 14 Days": 70.0,
        "On Voyage": 45.0
    }
    avail_score = avail_map.get(vessel.availability_status, 75.0)

    # 4. Draft & Port Compatibility
    max_port_draft = 14.5 # Default East Coast India (Chennai/Vizag/Paradip)
    draft_score = 95.0 if vessel.draft_m <= max_port_draft else 65.0

    # 5. Age / Modernity
    age = max(1, 2025 - vessel.built_year)
    age_score = max(60.0, min(98.0, 100.0 - age * 2.5))

    # Weighted Overall Score
    overall_score = (
        rate_score * 0.30 +
        fuel_score * 0.25 +
        avail_score * 0.20 +
        draft_score * 0.15 +
        age_score * 0.10
    )
    overall_score = round(overall_score, 1)

    # Generate why recommended reasons
    reasons = []
    if rate_score > 78:
        reasons.append("Competitive daily hire rate")
    if fuel_score > 80:
        reasons.append("High fuel efficiency engine")
    if vessel.draft_m <= 13.5:
        reasons.append("Optimal draft for East Coast India ports")
    if vessel.built_year >= 2018:
        reasons.append("Modern eco-vessel design")
    if not reasons:
        reasons.append("Standard corridor charter suitability")

    why_rec = "; ".join(reasons)

    return {
        "overall_score": overall_score,
        "rate_score": round(rate_score, 1),
        "fuel_score": round(fuel_score, 1),
        "avail_score": round(avail_score, 1),
        "draft_score": round(draft_score, 1),
        "why_recommended": why_rec
    }

def get_charter_recommendations(
    db: Session,
    corridor: str = "Singapore → Visakhapatnam",
    cargo_type: str = "Coal",
    limit: int = 3
) -> List[CharterRecommendationResponse]:
    vessels = db.query(Vessel).filter(Vessel.availability_status != "On Voyage").all()
    if not vessels:
        vessels = db.query(Vessel).limit(10).all()

    scored_vessels = []
    for v in vessels:
        scoring = compute_vessel_score(v)
        transit_days = 6.5 # Approx Singapore to Vizag
        bunker_fuel_cost = transit_days * v.fuel_consumption_tpd * 620.0
        hire_cost = transit_days * v.daily_hire_rate
        total_voyage_cost = hire_cost + bunker_fuel_cost + 42000.0 # Port fees

        # Benchmark spot cost
        market_benchmark_cost = total_voyage_cost * 1.12
        estimated_savings = market_benchmark_cost - total_voyage_cost

        scored_vessels.append({
            "vessel": v,
            "score": scoring["overall_score"],
            "reason": scoring["why_recommended"],
            "projected_cost": round(total_voyage_cost, 0),
            "estimated_savings": round(estimated_savings, 0),
            "confidence": round(min(97.0, scoring["overall_score"] * 1.05), 1)
        })

    scored_vessels.sort(key=lambda x: x["score"], reverse=True)
    top = scored_vessels[:limit]

    results = []
    for idx, item in enumerate(top):
        v = item["vessel"]
        results.append(CharterRecommendationResponse(
            id=idx + 1,
            vessel_id=v.id,
            vessel_name=v.name,
            vessel_type=v.vessel_type,
            dwt=v.dwt,
            daily_hire_rate=v.daily_hire_rate,
            overall_score=item["score"],
            projected_total_cost_usd=item["projected_cost"],
            estimated_savings_usd=item["estimated_savings"],
            confidence_level=item["confidence"],
            recommended_reason=item["reason"],
            image_url=v.image_url
        ))

    return results
