import io
import csv
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.report import Report
from backend.app.models.vessel import Vessel
from backend.app.models.port import Port
from backend.app.schemas.report import ReportItem

def get_reports_list(db: Session) -> List[ReportItem]:
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    if not reports:
        # Default mock entries if unseeded
        return [
            ReportItem(
                id=1,
                title="East Coast India Freight Outlook",
                report_type="Freight Forecast Report",
                corridor="Singapore / Indonesia → East Coast India",
                commodity="Thermal Coal & Iron Ore",
                generated_by="freight-intel ML Engine",
                summary="Comprehensive freight price projections across dry bulk corridors.",
                file_size_kb=245,
                format="PDF",
                created_at="2026-09-01 10:30"
            ),
            ReportItem(
                id=2,
                title="Vessel Chartering Efficiency & Fuel Audit",
                report_type="Vessel Chartering Report",
                corridor="Bay of Bengal Corridors",
                commodity="Dry Bulk",
                generated_by="Charter Optimization Service",
                summary="Analysis of 45 chartered voyages with fuel consumption benchmarks comparing eco-speeds vs full speed.",
                file_size_kb=180,
                format="CSV",
                created_at="2025-03-28 14:15"
            ),
            ReportItem(
                id=3,
                title="Bulk Cargo Procurement & Supplier Quality Index",
                report_type="Cargo Procurement Report",
                corridor="Indonesia & Australia → Vizag/Paradip",
                commodity="Coal & Bauxite",
                generated_by="Procurement Analytics",
                summary="Vendor reliability scorecard and FOB contract savings summary totaling $3.85M in captured discounts.",
                file_size_kb=310,
                format="PDF",
                created_at="2025-03-25 09:00"
            ),
            ReportItem(
                id=4,
                title="East Coast India Port Congestion & Turnaround Times",
                report_type="Route Optimization Report",
                corridor="Chennai, Vizag, Paradip, Kolkata, Kakinada",
                commodity="All Cargoes",
                generated_by="AIS Telemetry Feed",
                summary="Average anchorage waiting times and berth productivity metrics across 5 major East Coast ports.",
                file_size_kb=165,
                format="CSV",
                created_at="2025-03-20 16:45"
            )
        ]

    return [
        ReportItem(
            id=r.id,
            title=r.title,
            report_type=r.report_type,
            corridor=r.corridor,
            commodity=r.commodity,
            generated_by=r.generated_by,
            summary=r.summary or "",
            file_size_kb=r.file_size_kb,
            format=r.format,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M")
        )
        for r in reports
    ]

def generate_csv_export(db: Session, export_type: str = "freight") -> str:
    """
    Generates real CSV string representation for download.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "vessels":
        writer.writerow(["Vessel Name", "IMO", "Type", "DWT", "Built Year", "Flag", "Daily Hire Rate ($)", "Fuel Consumption (TPD)", "Score", "Availability", "Position"])
        vessels = db.query(Vessel).all()
        for v in vessels:
            writer.writerow([v.name, v.imo, v.vessel_type, v.dwt, v.built_year, v.flag, v.daily_hire_rate, v.fuel_consumption_tpd, v.recommendation_score, v.availability_status, v.current_position_name])
    elif export_type == "ports":
        writer.writerow(["Port Name", "UN Code", "Country", "Region", "Draft (m)", "Berths", "Avg Handling (hrs)", "Congestion Index", "Waiting Time (days)", "Status"])
        ports = db.query(Port).all()
        for p in ports:
            writer.writerow([p.name, p.code, p.country, p.region, p.draft_depth_m, p.berths, p.avg_handling_time_hours, p.congestion_index, p.waiting_time_days, p.status])
    else: # Default freight forecast
        writer.writerow(["Corridor", "Commodity", "Vessel Class", "Current Spot Rate ($/MT)", "30D Predicted Rate ($/MT)", "Trend (%)", "Volatility", "Confidence (%)", "Recommended Action"])
        from backend.app.ml.corridor_catalog import CORRIDOR_CATALOG, computed_predicted_rate
        for key, entry in CORRIDOR_CATALOG.items():
            pred = computed_predicted_rate(entry)
            trend_sign = "+" if entry["trend_30d_pct"] > 0 else ""
            trend_str = f"{trend_sign}{entry['trend_30d_pct']}%"
            vessel_class = "Capesize" if "newcastle" in key[0] else "Supramax"
            writer.writerow([
                entry["route_display"],
                entry["cargo_display"],
                vessel_class,
                f"{entry['spot_rate']:.2f}",
                f"{pred:.2f}",
                trend_str,
                str(entry["volatility"]),
                f"{entry['confidence_score']}%",
                entry["recommendation"],
            ])

    return output.getvalue()
