from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.schemas.procurement import (
    ProcurementDashboardResponse,
    SupplierItem,
    ProcurementPlanItem,
    CommodityDemandTrend,
    ProcurementPlanCreate
)
from backend.app.models.procurement import ProcurementPlan
from backend.app.models.cargo import Cargo

import datetime

def get_procurement_data(db: Session) -> ProcurementDashboardResponse:
    now = datetime.date.today()
    cur_year = now.year
    cur_month = now.month

    # Generate rolling 7-month trend window based on current date
    # 6 historical/current months + 1 future projection
    month_names = []
    for offset in range(-5, 2):
        m = cur_month + offset
        y = cur_year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        d = datetime.date(y, m, 1)
        label = d.strftime("%b") + (" (Est)" if offset == 1 else "")
        month_names.append(label)

    # Next month for upcoming procurement actions
    next_m_num = (cur_month % 12) + 1
    next_m_year = cur_year + (1 if cur_month == 12 else 0)
    next_m_date = datetime.date(next_m_year, next_m_num, 1)
    next_month_str = next_m_date.strftime("%B")
    current_month_str = now.strftime("%B")

    suppliers = [
        SupplierItem(
            name="Kalimantan Coal Resources",
            country="Indonesia",
            commodity="Thermal Coal",
            reliability_score=96.4,
            fob_price_per_ton=84.50,
            port_loading_speed_tpd=35000,
            moisture_grade="GAR 4200 kcal/kg (<18% moisture)",
            lead_time_days=6
        ),
        SupplierItem(
            name="Adani Abbot Point Terminal",
            country="Australia",
            commodity="Thermal / Coking Coal",
            reliability_score=94.8,
            fob_price_per_ton=118.00,
            port_loading_speed_tpd=45000,
            moisture_grade="High Calorific (6000 kcal/kg)",
            lead_time_days=14
        ),
        SupplierItem(
            name="Vale Oman Distribution",
            country="Oman / UAE",
            commodity="Iron Ore Pellets",
            reliability_score=98.2,
            fob_price_per_ton=105.20,
            port_loading_speed_tpd=40000,
            moisture_grade="67.5% Fe Direct Reduction",
            lead_time_days=7
        ),
        SupplierItem(
            name="Kaltim Prima Coal (KPC)",
            country="Indonesia",
            commodity="Thermal Coal",
            reliability_score=95.1,
            fob_price_per_ton=88.20,
            port_loading_speed_tpd=38000,
            moisture_grade="Eco-coal Low Ash",
            lead_time_days=5
        ),
        SupplierItem(
            name="Richards Bay Coal Terminal",
            country="South Africa",
            commodity="Steam Coal",
            reliability_score=91.5,
            fob_price_per_ton=92.00,
            port_loading_speed_tpd=32000,
            moisture_grade="RB1 High Volatile",
            lead_time_days=16
        )
    ]

    plans = [
        ProcurementPlanItem(
            id=1,
            plan_code=f"PLN-{cur_year}-041",
            commodity="Thermal Coal",
            origin="Indonesia (Balikpapan)",
            destination="Visakhapatnam",
            supplier_name="Kalimantan Coal Resources",
            quantity_mt=70000.0,
            delivery_window=f"{current_month_str[:3]} 15 - {current_month_str[:3]} 25, {cur_year}",
            fob_price=84.50,
            freight_rate=14.80,
            total_cost_usd=6951000.0,
            projected_savings_usd=320000.0,
            status="Optimized",
            ai_recommendation_reason="Locked before anticipated Indonesian monsoon freight tightening."
        ),
        ProcurementPlanItem(
            id=2,
            plan_code=f"PLN-{cur_year}-042",
            commodity="Iron Ore Pellets",
            origin="UAE (Fujairah)",
            destination="Chennai",
            supplier_name="Vale Oman Distribution",
            quantity_mt=55000.0,
            delivery_window=f"{next_month_str[:3]} 02 - {next_month_str[:3]} 10, {next_m_year}",
            fob_price=105.20,
            freight_rate=18.40,
            total_cost_usd=6798000.0,
            projected_savings_usd=245000.0,
            status="Approved",
            ai_recommendation_reason="Favorable Arabian Sea ballast positioning."
        ),
        ProcurementPlanItem(
            id=3,
            plan_code=f"PLN-{cur_year}-043",
            commodity="Coking Coal",
            origin="Australia (Hay Point)",
            destination="Paradip",
            supplier_name="Adani Abbot Point Terminal",
            quantity_mt=85000.0,
            delivery_window=f"{next_month_str[:3]} 18 - {next_month_str[:3]} 30, {next_m_year}",
            fob_price=118.00,
            freight_rate=21.20,
            total_cost_usd=11832000.0,
            projected_savings_usd=410000.0,
            status="Draft",
            ai_recommendation_reason="Consolidated Capesize cargo reduces landed cost by $4.80/MT."
        )
    ]

    base_demand = [320000, 350000, 380000, 365000, 410000, 430000, 445000]
    base_avg_price = [94.5, 96.2, 98.0, 93.4, 91.8, 89.5, 88.2]
    base_forecast_price = [95.0, 96.5, 97.5, 93.0, 90.5, 87.2, 86.0]

    trends = [
        CommodityDemandTrend(
            month=month_names[i],
            demand_mt=base_demand[i],
            avg_price_usd=base_avg_price[i],
            forecast_price_usd=base_forecast_price[i]
        )
        for i in range(len(month_names))
    ]

    ai_recs = [
        {
            "title": f"Shift Indonesian Coal Procurement to Early {current_month_str}",
            "metric": "Save $320,000",
            "detail": f"Indonesian dry bulk rates to Visakhapatnam are expected to surge 8% in mid-{next_month_str} as regional utility restocking accelerates.",
            "type": "Cost Optimization"
        },
        {
            "title": "Consolidate Paradip Shipments to Capesize",
            "metric": "+14% Freight Economy",
            "detail": "Deep draft berths at Paradip now accommodate up to 16.5m draft, unlocking Capesize economies over Supramax.",
            "type": "Vessel Selection"
        }
    ]

    return ProcurementDashboardResponse(
        total_demand_mt=1240000.0,
        procurement_planned_mt=980000.0,
        estimated_total_cost_usd=108500000.0,
        average_price_per_ton=87.50,
        potential_savings_usd=3850000.0,
        top_suppliers=suppliers,
        upcoming_plans=plans,
        demand_trends=trends,
        ai_recommendations=ai_recs
    )
