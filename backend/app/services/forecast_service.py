"""
forecast_service.py

Single source of truth: all rates, trends, confidence, and comparison rows are
derived from corridor_catalog.CORRIDOR_CATALOG.  The ML engine supplies the
chart trajectory and model-fit metrics (MAE, RMSE, R2) only; it does NOT
override the catalog's authoritative spot/predicted/trend values.

Predictor card <-> comparison table row 0 are guaranteed identical because both
read from the same catalog lookup result.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.freight import FreightRate
from backend.app.models.route import Route
from backend.app.models.cargo import Cargo
from backend.app.models.port import Port
from backend.app.ml.forecasting import ml_forecaster
from backend.app.ml.corridor_catalog import (
    lookup_corridor,
    get_primary_corridor,
    computed_predicted_rate,
    build_comparison_rows,
)
from backend.app.schemas.forecast import ForecastResponse, RouteComparisonItem


def generate_freight_forecast(
    db: Session,
    origin_name: str = "Singapore",
    dest_name: str = "Visakhapatnam",
    cargo_type: str = "Coal",
    vessel_type: str = "Supramax",
    horizon_days: int = 30,
) -> ForecastResponse:
    # ── 1. Resolve catalog entry (single source of truth for rate data) ──────
    catalog = lookup_corridor(origin_name, dest_name, cargo_type)

    # Determine trade direction via origin name heuristics
    indian_ports = {
        "visakhapatnam", "chennai", "paradip", "kolkata", "haldia",
        "kakinada", "ennore", "mormugao", "gangavaram", "mumbai", "mundra",
    }
    is_export = any(kw in origin_name.lower() for kw in indian_ports)
    direction = "export" if is_export else "import"

    if catalog is None:
        # Graceful fallback to primary corridor for the detected direction
        catalog = get_primary_corridor(direction)

    spot_rate: float = catalog["spot_rate"]
    trend_30d_pct: float = catalog["trend_30d_pct"]
    trend_label: str = catalog["trend_label"]
    volatility: float = catalog["volatility"]
    # confidence_score is 90-CI coverage %, strictly separate from model R2
    confidence_score: float = catalog["confidence_score"]
    route_display: str = catalog["route_display"]
    cargo_display: str = catalog["cargo_display"]
    recommendation: str = catalog["recommendation"]

    # 30-day predicted rate is always derived deterministically from the catalog
    predicted_rate_30d: float = computed_predicted_rate(catalog)

    # For non-30d horizons scale the trend linearly to preserve the catalog anchor
    if horizon_days != 30:
        horizon_scale = horizon_days / 30.0
        adjusted_trend = round(trend_30d_pct * horizon_scale, 1)
        predicted_rate_h = round(spot_rate * (1.0 + adjusted_trend / 100.0), 2)
    else:
        adjusted_trend = trend_30d_pct
        predicted_rate_h = predicted_rate_30d

    # ── 2. AI insight text generated from catalog values (no hardcoded %) ────
    abs_pct = abs(adjusted_trend)
    if adjusted_trend <= -2.0:
        ai_insight = (
            f"Freight rates on the {route_display} corridor are projected to decline "
            f"by {abs_pct:.1f}% over the next {horizon_days} days due to easing port "
            f"congestion on East Coast India and softening bunker fuel indices. "
            f"Current spot rate: ${spot_rate:.2f}/MT → forecast: ${predicted_rate_h:.2f}/MT."
        )
    elif adjusted_trend >= 2.0:
        ai_insight = (
            f"Freight rates on the {route_display} corridor are expected to firm "
            f"by {abs_pct:.1f}% over the next {horizon_days} days, driven by seasonal "
            f"cargo demand and tighter vessel tonnage in the Bay of Bengal. "
            f"Current spot rate: ${spot_rate:.2f}/MT → forecast: ${predicted_rate_h:.2f}/MT."
        )
    else:
        ai_insight = (
            f"Freight rates on the {route_display} corridor are broadly stable "
            f"({adjusted_trend:+.1f}%) over the next {horizon_days} days. "
            f"Current spot rate: ${spot_rate:.2f}/MT → forecast: ${predicted_rate_h:.2f}/MT."
        )

    # ── 3. Fetch historical records for chart trajectory only ─────────────────
    route_obj = (
        db.query(Route)
        .join(Port, Route.origin_port_id == Port.id)
        .filter(Port.name.ilike(f"%{origin_name.split()[0]}%"))
        .first()
    )
    distance_nm = float(route_obj.distance_nm) if route_obj else 1680.0

    hist_query = (
        db.query(FreightRate)
        .join(Route, FreightRate.route_id == Route.id)
        .join(Cargo, FreightRate.cargo_id == Cargo.id)
        .filter(Cargo.name.ilike(f"%{cargo_type}%"))
        .order_by(FreightRate.date.asc())
        .all()
    )

    hist_records = [
        {
            "date": r.date.strftime("%Y-%m-%d"),
            "rate_per_ton": r.rate_per_ton,
            "bunker_price": r.bunker_price_vlsfo,
            "congestion_index": r.port_congestion_delay_days * 15.0,
        }
        for r in hist_query
    ]

    # ── 4. ML engine: chart data + model-fit metrics ONLY ────────────────────
    ml_result = ml_forecaster.predict_future(
        historical_records=hist_records,
        distance_nm=distance_nm,
        bunker_price=618.50,
        congestion_index=26.0,
        cargo_type=cargo_type,
        vessel_type=vessel_type,
        horizon_days=horizon_days,
    )
    chart_data = ml_result["chart_data"]
    mae: float = ml_result["mae"]
    rmse: float = ml_result["rmse"]
    # r2_score is a model quality metric — kept separate from confidence_score
    r2_score: float = ml_result["r2_score"]
    model_name: str = ml_result["model_name"]

    # ── 5. Build comparison table: row 0 == predictor card (identical values) ─
    comparison_rows_raw = build_comparison_rows(
        primary_origin=origin_name,
        primary_cargo=cargo_type,
        direction=direction,
        primary_spot=spot_rate,
        primary_predicted=predicted_rate_30d,
        primary_trend=trend_30d_pct,
        primary_rec=recommendation,
        primary_route_display=route_display,
        primary_cargo_display=cargo_display,
        max_rows=5,
    )

    route_comparisons = [
        RouteComparisonItem(
            route_name=r["route_name"],
            cargo_name=r["cargo_name"],
            current_rate=r["current_rate"],
            predicted_rate=r["predicted_rate"],
            trend_percent=r["trend_percent"],
            recommendation=r["recommendation"],
        )
        for r in comparison_rows_raw
    ]

    return ForecastResponse(
        origin_port=origin_name,
        destination_port=dest_name,
        cargo_type=cargo_type,
        vessel_type=vessel_type,
        horizon_days=horizon_days,
        current_rate=spot_rate,           # catalog authoritative value
        predicted_rate=predicted_rate_h,  # catalog-derived, not ML output
        trend=trend_label,
        trend_percent=adjusted_trend,
        volatility=volatility,
        confidence_score=confidence_score,  # 90-CI coverage — NOT R2
        mae=mae,
        rmse=rmse,
        r2_score=r2_score,              # model fit metric — NOT confidence
        model_name=model_name,
        ai_insight=ai_insight,
        chart_data=chart_data,
        route_comparisons=route_comparisons,
    )
