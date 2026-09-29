from fastapi import APIRouter, Query, Body
from typing import Dict, Any, List
from pydantic import BaseModel
from backend.app.services.ai_service import process_assistant_query, QUICK_PROMPTS

router = APIRouter(prefix="/api/insights", tags=["AI Insights"])

class AssistantQueryRequest(BaseModel):
    query: str

@router.get("")
def get_insights_overview():
    from backend.app.ml.corridor_catalog import get_primary_corridor, computed_predicted_rate
    primary_import = get_primary_corridor("import")
    primary_export = get_primary_corridor("export")
    import_trend_abs = abs(primary_import["trend_30d_pct"])
    import_trend_word = "decline" if primary_import["trend_30d_pct"] < 0 else "increase"
    export_trend_sign = "+" if primary_export["trend_30d_pct"] > 0 else ""

    return {
        "key_insights": [
            {
                "id": "INS-01",
                "title": f"Freight rates on {primary_import['route_display']} expected to {import_trend_word} by {import_trend_abs:.1f}%",
                "impact": "High",
                "confidence": primary_import["confidence_score"],
                "reason": f"Bunker prices in Singapore softened to $618.50/MT and current spot rate stands at ${primary_import['spot_rate']:.2f}/MT (forecast: ${computed_predicted_rate(primary_import):.2f}/MT).",
                "recommended_action": primary_import["recommendation"]
            },
            {
                "id": "INS-02",
                "title": f"East Coast export rates on {primary_export['route_display']} projected at {export_trend_sign}{primary_export['trend_30d_pct']}%",
                "impact": "High",
                "confidence": primary_export["confidence_score"],
                "reason": f"Export demand from Indian ports is firming, currently trading at ${primary_export['spot_rate']:.2f}/MT spot (projected ${computed_predicted_rate(primary_export):.2f}/MT).",
                "recommended_action": primary_export["recommendation"]
            },
            {
                "id": "INS-03",
                "title": "Singapore → Visakhapatnam currently the most cost-efficient corridor",
                "impact": "Medium",
                "confidence": 95.0,
                "reason": "Deepwater berthing efficiency at Vizag (28h handling) avoids the 2.3-day congestion delays currently observed at Paradip.",
                "recommended_action": "Reroute incoming Panamax coal vessels to Visakhapatnam where draft allows 16.5m discharge."
            },
            {
                "id": "INS-04",
                "title": "Earlier vessel booking reduces charter hire costs by up to $18,500",
                "impact": "Medium",
                "confidence": 89.2,
                "reason": "Ballasting vessels entering the Strait of Malacca accept lower day rates when voyages are fixed 14+ days ahead.",
                "recommended_action": "Issue forward tenders 2 weeks prior to cargo laycan."
            }
        ],
        "market_trends": {
            "bdi_direction": "Bearish Short-Term (-3.2% 7d)",
            "fuel_index": "Stable ($618.5/MT)",
            "fleet_supply": "Surplus in Malacca Strait (28 carriers)",
            "port_bottlenecks": "Paradip & Kolkata experiencing elevated queues"
        },
        "risk_analysis": [
            {"corridor": "Australia → Kolkata", "risk_level": "Elevated", "factor": "Draft restrictions require lightering at Sandheads."},
            {"corridor": "Indonesia → Paradip", "risk_level": "Moderate", "factor": "Anchorage waiting times exceeding 2 days."},
            {"corridor": "Singapore → Chennai", "risk_level": "Low", "factor": "Normal sea states and rapid turnaround."}
        ]
    }

@router.post("/ask")
def ask_assistant(payload: AssistantQueryRequest):
    return process_assistant_query(payload.query)

@router.get("/prompts")
def get_quick_prompts() -> List[str]:
    return QUICK_PROMPTS
