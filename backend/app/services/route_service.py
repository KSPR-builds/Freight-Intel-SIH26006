import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.port import Port
from backend.app.models.route import Route
from backend.app.schemas.route import RouteOptimizationResponse, RouteOption, PortInfo

# Maritime waypoints connecting major origins to East Coast India
CORRIDOR_WAYPOINTS = {
    ("Singapore", "Chennai"): [
        [1.290270, 103.851959], # Singapore
        [5.65, 95.3],          # Malacca Exit / North Sumatra
        [8.5, 87.0],           # Bay of Bengal Central
        [13.0827, 80.2707]     # Chennai
    ],
    ("Singapore", "Visakhapatnam"): [
        [1.290270, 103.851959], # Singapore
        [5.65, 95.3],          # North Sumatra
        [11.5, 88.2],          # Bay of Bengal Mid
        [17.6868, 83.2185]     # Visakhapatnam
    ],
    ("Singapore", "Paradip"): [
        [1.290270, 103.851959], # Singapore
        [5.65, 95.3],          # Malacca
        [14.2, 89.5],          # Central East Bay
        [20.3164, 86.6111]     # Paradip
    ],
    ("Indonesia", "Visakhapatnam"): [
        [-1.2692, 116.8253],   # Balikpapan / Kalimantan
        [5.8, 95.5],           # Malacca Straight Bypass
        [12.0, 87.5],          # Bay of Bengal
        [17.6868, 83.2185]     # Visakhapatnam
    ],
    ("Australia", "Visakhapatnam"): [
        [-20.3167, 118.5760],  # Port Hedland
        [-10.2, 105.5],        # Christmas Island pass
        [5.5, 94.8],           # North Andaman Sea
        [17.6868, 83.2185]     # Visakhapatnam
    ],
    ("Australia", "Paradip"): [
        [-32.9283, 151.7817],  # Newcastle
        [-12.0, 110.0],        # Indian Ocean South
        [8.0, 90.0],           # Bay of Bengal
        [20.3164, 86.6111]     # Paradip
    ],
    ("UAE", "Chennai"): [
        [25.1288, 56.3265],    # Fujairah
        [20.5, 62.0],          # Arabian Sea Outer
        [7.5, 76.5],           # South tip Sri Lanka / Cape Comorin
        [13.0827, 80.2707]     # Chennai
    ],
    ("South Africa", "Visakhapatnam"): [
        [-28.7833, 32.0333],   # Richards Bay
        [-15.0, 50.0],         # Madagascar channel north
        [4.0, 78.0],           # South Sri Lanka
        [17.6868, 83.2185]     # Visakhapatnam
    ]
}

def get_ports_list(db: Session) -> List[PortInfo]:
    ports = db.query(Port).all()
    return [
        PortInfo(
            id=p.id,
            name=p.name,
            code=p.code,
            country=p.country,
            region=p.region,
            latitude=p.latitude,
            longitude=p.longitude,
            draft_depth_m=p.draft_depth_m,
            berths=p.berths,
            avg_handling_time_hours=p.avg_handling_time_hours,
            congestion_index=p.congestion_index,
            waiting_time_days=p.waiting_time_days,
            status=p.status
        )
        for p in ports
    ]

def optimize_maritime_route(
    db: Session,
    origin_name: str = "Singapore",
    dest_name: str = "Visakhapatnam",
    fuel_price: float = 620.0
) -> RouteOptimizationResponse:
    # Match route or fallback
    route = db.query(Route).join(
        Port, Route.origin_port_id == Port.id
    ).filter(
        Port.name.ilike(f"%{origin_name}%")
    ).first()

    base_distance = 1680.0 if "Singapore" in origin_name else 3850.0
    if route and route.distance_nm:
        base_distance = route.distance_nm

    waypoints = CORRIDOR_WAYPOINTS.get(
        (origin_name, dest_name),
        CORRIDOR_WAYPOINTS.get(("Singapore", "Visakhapatnam"))
    )

    # 1. Best Route (Balanced speed: 13.0 knots)
    dist_best = base_distance
    days_best = round(dist_best / (13.0 * 24), 1)
    fuel_best = round(days_best * 24.0, 1)
    cost_best = round(days_best * 16500.0 + fuel_best * fuel_price + 38000.0, 0)
    co2_best = round(fuel_best * 3.114, 1)

    # 2. Lowest Cost Route (Eco speed: 11.5 knots, lower fuel)
    dist_cost = base_distance + 20.0
    days_cost = round(dist_cost / (11.5 * 24), 1)
    fuel_cost = round(days_cost * 18.2, 1)
    cost_cost = round(days_cost * 15500.0 + fuel_cost * fuel_price + 36000.0, 0)
    savings_cost = round(cost_best - cost_cost, 0)
    co2_cost = round(fuel_cost * 3.114, 1)

    # 3. Fastest Route (Speed: 14.5 knots)
    dist_fast = base_distance - 15.0
    days_fast = round(dist_fast / (14.5 * 24), 1)
    fuel_fast = round(days_fast * 30.5, 1)
    cost_fast = round(days_fast * 17500.0 + fuel_fast * fuel_price + 42000.0, 0)
    co2_fast = round(fuel_fast * 3.114, 1)

    # 4. Lowest Emissions (Optimal green lane)
    dist_eco = base_distance + 10.0
    days_eco = round(dist_eco / (12.0 * 24), 1)
    fuel_eco = round(days_eco * 17.5, 1)
    cost_eco = round(days_eco * 16000.0 + fuel_eco * fuel_price + 37000.0, 0)
    co2_eco = round(fuel_eco * 3.114, 1)

    ports = get_ports_list(db)

    return RouteOptimizationResponse(
        origin=origin_name,
        destination=dest_name,
        best_route=RouteOption(
            route_id=1,
            route_name=f"{origin_name} → {dest_name} (Direct Deepwater)",
            origin_port=origin_name,
            destination_port=dest_name,
            label="Recommended (Balanced)",
            distance_nm=dist_best,
            transit_time_days=days_best,
            bunker_fuel_mt=fuel_best,
            total_cost_usd=cost_best,
            savings_usd=0.0,
            co2_emissions_mt=co2_best,
            weather_risk="Low (Sea State 3)",
            waypoints=waypoints
        ),
        lowest_cost_route=RouteOption(
            route_id=2,
            route_name=f"{origin_name} → {dest_name} (Eco Speed Corridor)",
            origin_port=origin_name,
            destination_port=dest_name,
            label="Lowest Cost",
            distance_nm=dist_cost,
            transit_time_days=days_cost,
            bunker_fuel_mt=fuel_cost,
            total_cost_usd=cost_cost,
            savings_usd=max(8500.0, savings_cost),
            co2_emissions_mt=co2_cost,
            weather_risk="Low",
            waypoints=waypoints
        ),
        fastest_route=RouteOption(
            route_id=3,
            route_name=f"{origin_name} → {dest_name} (Express Passage)",
            origin_port=origin_name,
            destination_port=dest_name,
            label="Fastest Route",
            distance_nm=dist_fast,
            transit_time_days=days_fast,
            bunker_fuel_mt=fuel_fast,
            total_cost_usd=cost_fast,
            savings_usd=0.0,
            co2_emissions_mt=co2_fast,
            weather_risk="Moderate (Draft sensitive)",
            waypoints=waypoints
        ),
        lowest_emissions_route=RouteOption(
            route_id=4,
            route_name=f"{origin_name} → {dest_name} (Green Sea Lane)",
            origin_port=origin_name,
            destination_port=dest_name,
            label="Lowest Emissions",
            distance_nm=dist_eco,
            transit_time_days=days_eco,
            bunker_fuel_mt=fuel_eco,
            total_cost_usd=cost_eco,
            savings_usd=12400.0,
            co2_emissions_mt=co2_eco,
            weather_risk="Low",
            waypoints=waypoints
        ),
        available_ports=ports
    )
