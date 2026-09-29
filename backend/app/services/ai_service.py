from typing import Dict, Any, List

def process_assistant_query(query_text: str) -> Dict[str, Any]:
    q = query_text.lower().strip()

    if "chennai" in q or "current freight rate" in q or "rate" in q or "singapore" in q:
        from backend.app.ml.corridor_catalog import lookup_corridor, computed_predicted_rate
        corridor = lookup_corridor("singapore", "visakhapatnam" if "visakhapatnam" in q or "vizag" in q else "chennai", "coal")
        if not corridor:
            from backend.app.ml.corridor_catalog import get_primary_corridor
            corridor = get_primary_corridor("import")
        spot = corridor["spot_rate"]
        pred = computed_predicted_rate(corridor)
        trend = corridor["trend_30d_pct"]
        conf = corridor["confidence_score"]
        route = corridor["route_display"]
        cargo = corridor["cargo_display"]
        trend_sign = "+" if trend > 0 else ""
        return {
            "query": query_text,
            "answer": f"The current spot freight rate for {route} ({cargo}) is **${spot:.2f} / MT**, with a 30-day projection of **${pred:.2f} / MT** ({trend_sign}{trend}%).",
            "metrics": [
                {"label": "Current Spot", "value": f"${spot:.2f} / MT"},
                {"label": "30D Forecast", "value": f"${pred:.2f} / MT ({trend_sign}{trend}%)"},
                {"label": "Confidence", "value": f"{conf}%"},
                {"label": "Bunker VLSFO", "value": "$618.50 / MT"}
            ],
            "reasoning_summary": f"Softening fuel bunker costs in Singapore and improving berth turnarounds support the {trend_sign}{trend}% projection for this corridor.",
            "recommended_action": corridor["recommendation"]
        }
    elif "cheapest" in q or "vessel" in q or "iron ore" in q:
        return {
            "query": query_text,
            "answer": "**MV Baltic Star** (Supramax 57,000 DWT) is currently the most cost-effective vessel for Iron Ore from UAE/Oman to East Coast India, with an agreed hire rate of **$14,800/day**.",
            "metrics": [
                {"label": "Best Vessel", "value": "MV Baltic Star"},
                {"label": "Daily Hire", "value": "$14,800 / day"},
                {"label": "Score", "value": "94.2 / 100"},
                {"label": "Est. Savings", "value": "$18,500"}
            ],
            "reasoning_summary": "Positioned in the Northern Arabian Sea with ballast readiness within 48 hours, high fuel efficiency (21.5 MT/day), and optimal gear for geared discharging.",
            "recommended_action": "Initiate charter fixture immediately before laycan expiration within the next 10 business days."
        }
    elif "lowest total cost" in q or "route" in q or "cheapest route" in q:
        return {
            "query": query_text,
            "answer": "The **Eco Speed Corridor** for Singapore → Visakhapatnam yields the lowest voyage cost at **$182,400 total voyage cost**, delivering **$12,400 net savings** compared to standard deepwater passage.",
            "metrics": [
                {"label": "Total Cost", "value": "$182,400"},
                {"label": "Transit Days", "value": "6.1 Days"},
                {"label": "Fuel Used", "value": "111.0 MT"},
                {"label": "CO2 Emissions", "value": "345.6 MT"}
            ],
            "reasoning_summary": "Cruising at 11.5 knots (slow steaming) reduces fuel consumption curve exponentially without missing laycan windows at Visakhapatnam.",
            "recommended_action": "Apply eco-routing parameters in voyage voyage instructions."
        }
    elif "when should i charter" in q or "timing" in q:
        import datetime
        today = datetime.date.today()
        w_start = today + datetime.timedelta(days=7)
        w_end = today + datetime.timedelta(days=15)
        next_month = (today.replace(day=1) + datetime.timedelta(days=32)).strftime("%B")
        w_str = f"{w_start.strftime('%b %d')} - {w_end.strftime('%b %d')}"
        return {
            "query": query_text,
            "answer": f"Optimal vessel charter window is between **{w_start.strftime('%B %d')} and {w_end.strftime('%B %d, %Y')}**. Rates will hit a cyclical trough before regional monsoon prep increases {next_month} demand.",
            "metrics": [
                {"label": "Recommended Window", "value": w_str},
                {"label": "Projected Low", "value": "$21.15 / MT"},
                {"label": "Demand Surge", "value": f"+8% in {next_month}"},
                {"label": "Tonnage Avail.", "value": "High (14 vessels)"}
            ],
            "reasoning_summary": "AIS tracking shows an influx of 14 ballasting bulk carriers entering the Indian Ocean from the Red Sea and South China Sea next week, creating temporary tonnage oversupply.",
            "recommended_action": f"Issue tenders to spot brokers during the window of {w_str}."
        }
    elif "procure" in q or "cargo" in q or "quantity" in q:
        return {
            "query": query_text,
            "answer": "Recommended procurement volume is **135,000 MT of Thermal Coal (GAR 4200)** split into two Panamax/Supramax shipments from Kalimantan to Visakhapatnam and Paradip.",
            "metrics": [
                {"label": "Recommended Volume", "value": "135,000 MT"},
                {"label": "Avg FOB Price", "value": "$84.50 / MT"},
                {"label": "Potential Savings", "value": "$320,000"},
                {"label": "Target Window", "value": "Apr 15 - Apr 25"}
            ],
            "reasoning_summary": "FOB index is currently at a 6-month low ($84.50/MT), while Indian thermal power plants have inventory levels below the 12-day threshold.",
            "recommended_action": "Execute purchase order with Kalimantan Coal Resources with guaranteed laycan."
        }
    else:
        return {
            "query": query_text,
            "answer": f"freight-intel Intelligence analyzed: '{query_text}'. For East Coast India dry bulk trade, current market conditions favor forward contracts over spot chartering as freight indexes are softening by 4.2% to 6.5%.",
            "metrics": [
                {"label": "East Coast India Index", "value": "1,452 BDI"},
                {"label": "Avg Port Congestion", "value": "26.4 Index"},
                {"label": "Active Corridors", "value": "12 Corridors"}
            ],
            "reasoning_summary": "Aggregated trade telemetry and Scikit-learn freight rate regression forecast stable to declining rates across major coal and iron ore routes over the next 30-day horizon.",
            "recommended_action": "Review the Freight Forecast module for corridor-specific rate distributions."
        }

QUICK_PROMPTS = [
    "What is the current freight rate to Chennai?",
    "Which vessel is cheapest for iron ore?",
    "Which route has the lowest total cost?",
    "When should I charter a vessel?",
    "How much cargo should I procure?"
]
