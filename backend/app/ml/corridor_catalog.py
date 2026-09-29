"""
corridor_catalog.py — Single source of truth for corridor-specific freight
forecast parameters.

All pages (Forecast predictor cards, comparison table, AI Insights,
Reports summary, Dashboard AI recommendations, AI assistant) must derive
their displayed numbers from this module.  The ML engine provides chart
trajectory and model-fit metrics (MAE, RMSE, R2); this catalog provides
the authoritative spot rates, trend percentages, and confidence intervals.

Key schema per corridor entry
------------------------------
route_display   : Human-readable "Origin → Destination" label
cargo_display   : Human-readable commodity name (matches UI dropdown text)
spot_rate       : Current market spot rate $/MT
trend_30d_pct   : Expected 30-day % change (negative = declining)
trend_label     : "Declining" | "Increasing" | "Stable"
volatility      : Market volatility % (std dev of projected trajectory)
confidence_score: Forecast 90%-CI coverage % -- NOT the same as model R2
recommendation  : One-line actionable text for the comparison table
direction       : "import" or "export"
"""
from typing import Dict, Tuple, Any, Optional, List

# ---------------------------------------------------------------------------
# Catalog -- keyed by (origin_keyword, dest_keyword, cargo_keyword), lowercase.
# Lookup is done via substring matching so partial keys work.
# ---------------------------------------------------------------------------
CORRIDOR_CATALOG: Dict[Tuple[str, str, str], Dict[str, Any]] = {

    # IMPORT corridors (International → Indian ports)

    ("singapore", "visakhapatnam", "coal"): {
        "route_display": "Singapore → Visakhapatnam",
        "cargo_display": "Thermal Coal",
        "spot_rate": 22.80,
        "trend_30d_pct": -6.5,
        "trend_label": "Declining",
        "volatility": 4.2,
        "confidence_score": 91.2,
        "recommendation": "Delay spot fixtures 7-10 days; rates softening on bunker relief.",
        "direction": "import",
    },
    ("singapore", "chennai", "coal"): {
        "route_display": "Singapore → Chennai",
        "cargo_display": "Thermal Coal",
        "spot_rate": 21.90,
        "trend_30d_pct": -5.8,
        "trend_label": "Declining",
        "volatility": 3.9,
        "confidence_score": 90.5,
        "recommendation": "Favorable spot window opening in 10 days.",
        "direction": "import",
    },
    ("singapore", "paradip", "coal"): {
        "route_display": "Singapore → Paradip",
        "cargo_display": "Thermal Coal",
        "spot_rate": 23.10,
        "trend_30d_pct": -4.2,
        "trend_label": "Declining",
        "volatility": 4.8,
        "confidence_score": 89.8,
        "recommendation": "Monitor Paradip berth queue; congestion adding +1.8-day wait.",
        "direction": "import",
    },
    ("balikpapan", "visakhapatnam", "coal"): {
        "route_display": "Indonesia (Kalimantan) -> Visakhapatnam",
        "cargo_display": "Thermal Coal",
        "spot_rate": 19.20,
        "trend_30d_pct": 3.4,
        "trend_label": "Increasing",
        "volatility": 5.1,
        "confidence_score": 88.4,
        "recommendation": "Lock early before seasonal monsoon spike in May.",
        "direction": "import",
    },
    ("balikpapan", "paradip", "coal"): {
        "route_display": "Indonesia (Kalimantan) -> Paradip",
        "cargo_display": "Thermal Coal",
        "spot_rate": 18.95,
        "trend_30d_pct": 2.8,
        "trend_label": "Increasing",
        "volatility": 5.3,
        "confidence_score": 87.9,
        "recommendation": "Forward contract advised before monsoon tightening.",
        "direction": "import",
    },
    ("newcastle", "kolkata", "coal"): {
        "route_display": "Australia (Newcastle) -> Kolkata",
        "cargo_display": "Thermal Coal",
        "spot_rate": 32.50,
        "trend_30d_pct": -4.9,
        "trend_label": "Declining",
        "volatility": 6.2,
        "confidence_score": 87.3,
        "recommendation": "Capesize consolidation recommended to reduce per-ton cost.",
        "direction": "import",
    },
    ("newcastle", "visakhapatnam", "coal"): {
        "route_display": "Australia (Newcastle) -> Visakhapatnam",
        "cargo_display": "Thermal Coal",
        "spot_rate": 31.80,
        "trend_30d_pct": -3.6,
        "trend_label": "Declining",
        "volatility": 5.8,
        "confidence_score": 88.1,
        "recommendation": "Spot fixtures competitive; consider partial Capesize layering.",
        "direction": "import",
    },
    ("fujairah", "kakinada", "fertilizer"): {
        "route_display": "UAE (Fujairah) -> Kakinada",
        "cargo_display": "Fertilizer",
        "spot_rate": 20.10,
        "trend_30d_pct": -3.5,
        "trend_label": "Declining",
        "volatility": 3.6,
        "confidence_score": 90.2,
        "recommendation": "Stable supply corridor; spot market favourable.",
        "direction": "import",
    },
    ("fujairah", "chennai", "fertilizer"): {
        "route_display": "UAE (Fujairah) -> Chennai",
        "cargo_display": "Fertilizer",
        "spot_rate": 19.80,
        "trend_30d_pct": 3.0,
        "trend_label": "Increasing",
        "volatility": 3.8,
        "confidence_score": 89.5,
        "recommendation": "Lock forward contracts before seasonal pre-monsoon demand spike.",
        "direction": "import",
    },
    ("guangzhou", "kolkata", "iron ore"): {
        "route_display": "Guangzhou (China) -> Kolkata",
        "cargo_display": "Iron Ore",
        "spot_rate": 21.50,
        "trend_30d_pct": -5.0,
        "trend_label": "Declining",
        "volatility": 4.5,
        "confidence_score": 89.0,
        "recommendation": "Wait for further softening before fixing.",
        "direction": "import",
    },
    ("richards bay", "visakhapatnam", "coal"): {
        "route_display": "Richards Bay (S.Africa) -> Visakhapatnam",
        "cargo_display": "Thermal Coal",
        "spot_rate": 28.40,
        "trend_30d_pct": -2.1,
        "trend_label": "Stable",
        "volatility": 5.5,
        "confidence_score": 87.6,
        "recommendation": "Longer haul corridor; eco-speed passage advised.",
        "direction": "import",
    },

    # EXPORT corridors (Indian ports → International)

    ("visakhapatnam", "guangzhou", "iron ore"): {
        "route_display": "Visakhapatnam → Guangzhou (China)",
        "cargo_display": "Iron Ore Pellets",
        "spot_rate": 18.40,
        "trend_30d_pct": 4.3,
        "trend_label": "Increasing",
        "volatility": 5.8,
        "confidence_score": 88.5,
        "recommendation": "Book now - Chinese demand window opening for iron ore pellets.",
        "direction": "export",
    },
    ("paradip", "rotterdam", "iron ore"): {
        "route_display": "Paradip → Rotterdam (Netherlands)",
        "cargo_display": "Iron Ore",
        "spot_rate": 22.80,
        "trend_30d_pct": 3.1,
        "trend_label": "Increasing",
        "volatility": 6.4,
        "confidence_score": 87.6,
        "recommendation": "Forward fix recommended before Atlantic rate rally.",
        "direction": "export",
    },
    ("chennai", "singapore", "granite"): {
        "route_display": "Chennai → Singapore",
        "cargo_display": "Granite / Stone",
        "spot_rate": 14.20,
        "trend_30d_pct": -2.8,
        "trend_label": "Declining",
        "volatility": 3.2,
        "confidence_score": 90.8,
        "recommendation": "Spot market favourable; avoid forward fixing at premium.",
        "direction": "export",
    },
    ("kolkata", "port klang", "rice"): {
        "route_display": "Kolkata / Haldia → Port Klang (Malaysia)",
        "cargo_display": "Rice / Agri Bulk",
        "spot_rate": 16.50,
        "trend_30d_pct": 3.6,
        "trend_label": "Increasing",
        "volatility": 4.1,
        "confidence_score": 88.9,
        "recommendation": "Lock in forward fixtures; harvest-season demand rising.",
        "direction": "export",
    },
    ("visakhapatnam", "dubai", "manganese ore"): {
        "route_display": "Visakhapatnam → Dubai (UAE)",
        "cargo_display": "Manganese Ore",
        "spot_rate": 17.80,
        "trend_30d_pct": 2.1,
        "trend_label": "Stable",
        "volatility": 3.9,
        "confidence_score": 89.4,
        "recommendation": "Stable corridor; moderate forward exposure acceptable.",
        "direction": "export",
    },
    ("visakhapatnam", "tianjin", "iron ore"): {
        "route_display": "Visakhapatnam → Tianjin (China)",
        "cargo_display": "Iron Ore Pellets",
        "spot_rate": 19.10,
        "trend_30d_pct": 5.2,
        "trend_label": "Increasing",
        "volatility": 6.1,
        "confidence_score": 87.8,
        "recommendation": "Strong Chinese steel restocking; secure Panamax fixtures now.",
        "direction": "export",
    },
    ("kakinada", "singapore", "rice"): {
        "route_display": "Kakinada → Singapore",
        "cargo_display": "Rice / Agri Bulk",
        "spot_rate": 15.60,
        "trend_30d_pct": 2.4,
        "trend_label": "Stable",
        "volatility": 3.4,
        "confidence_score": 90.1,
        "recommendation": "Steady agri-bulk corridor; spot pricing competitive.",
        "direction": "export",
    },
    ("visakhapatnam", "port klang", "iron ore"): {
        "route_display": "Visakhapatnam → Port Klang (Malaysia)",
        "cargo_display": "Iron Ore Pellets",
        "spot_rate": 16.90,
        "trend_30d_pct": 3.8,
        "trend_label": "Increasing",
        "volatility": 4.6,
        "confidence_score": 88.2,
        "recommendation": "Emerging demand corridor; short-haul economics favour spot.",
        "direction": "export",
    },
}

# ---------------------------------------------------------------------------
# Primary reference corridors used by dashboard, insights, reports, and the
# AI assistant as the canonical headline data point.
# ---------------------------------------------------------------------------
PRIMARY_IMPORT_KEY: Tuple[str, str, str] = ("singapore", "visakhapatnam", "coal")
PRIMARY_EXPORT_KEY: Tuple[str, str, str] = ("visakhapatnam", "guangzhou", "iron ore")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def lookup_corridor(
    origin: str, dest: str, cargo: str
) -> Optional[Dict[str, Any]]:
    """
    Case-insensitive substring lookup.
    Priority: full triple match > origin+cargo match.
    Returns None when no entry matches.
    """
    o = origin.lower().strip()
    d = dest.lower().strip()
    c = cargo.lower().strip()

    # 1. Full triple match
    for (ok, dk, ck), params in CORRIDOR_CATALOG.items():
        if (ok in o or o in ok) and (dk in d or d in dk) and (ck in c or c in ck):
            return params

    # 2. Origin + cargo match (destination may differ slightly)
    for (ok, dk, ck), params in CORRIDOR_CATALOG.items():
        if (ok in o or o in ok) and (ck in c or c in ck):
            return params

    return None


def get_primary_corridor(direction: str = "import") -> Dict[str, Any]:
    """Return the primary catalog entry for the given trade direction."""
    key = PRIMARY_IMPORT_KEY if direction == "import" else PRIMARY_EXPORT_KEY
    return CORRIDOR_CATALOG[key]


def computed_predicted_rate(catalog_entry: Dict[str, Any]) -> float:
    """Derive the 30-day predicted rate from spot + trend."""
    return round(
        catalog_entry["spot_rate"] * (1.0 + catalog_entry["trend_30d_pct"] / 100.0),
        2,
    )


def build_comparison_rows(
    primary_origin: str,
    primary_cargo: str,
    direction: str,
    primary_spot: float,
    primary_predicted: float,
    primary_trend: float,
    primary_rec: str,
    primary_route_display: str,
    primary_cargo_display: str,
    max_rows: int = 5,
) -> List[Dict[str, Any]]:
    """
    Build comparison-table row dicts.

    Row 0 is ALWAYS the primary corridor with values that exactly match
    the predictor card (passed in as arguments).  Remaining rows come from
    alternate catalog corridors for the same direction.
    """
    rows: List[Dict[str, Any]] = []

    # Row 0 - primary corridor
    rows.append({
        "route_name": primary_route_display,
        "cargo_name": primary_cargo_display,
        "current_rate": primary_spot,
        "predicted_rate": primary_predicted,
        "trend_percent": primary_trend,
        "recommendation": primary_rec,
    })

    o_kw = primary_origin.lower()
    c_kw = primary_cargo.lower()

    for (ok, dk, ck), params in CORRIDOR_CATALOG.items():
        if params["direction"] != direction:
            continue
        # Skip the primary (already row 0)
        if (ok in o_kw or o_kw in ok) and (ck in c_kw or c_kw in ck):
            continue
        pred = computed_predicted_rate(params)
        rows.append({
            "route_name": params["route_display"],
            "cargo_name": params["cargo_display"],
            "current_rate": params["spot_rate"],
            "predicted_rate": pred,
            "trend_percent": params["trend_30d_pct"],
            "recommendation": params["recommendation"],
        })
        if len(rows) >= max_rows:
            break

    return rows
