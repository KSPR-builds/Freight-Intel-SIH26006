import datetime
import random
import numpy as np
from sqlalchemy.orm import Session
from backend.app.database.connection import SessionLocal, engine, Base
from backend.app.services.auth_service import get_password_hash
from backend.app.models.user import User, Role
from backend.app.models.port import Port
from backend.app.models.cargo import Cargo
from backend.app.models.route import Route
from backend.app.models.vessel import Vessel
from backend.app.models.freight import FreightRate
from backend.app.models.forecast import Forecast
from backend.app.models.shipment import Shipment
from backend.app.models.procurement import ProcurementPlan, CharterRecommendation
from backend.app.models.market_data import MarketData
from backend.app.models.report import Report, Notification
from backend.app.models.audit_log import AuditLog
from backend.app.ml.forecasting import ml_forecaster
from backend.app.services.charter_service import compute_vessel_score
import pandas as pd

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        # Create all tables first
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@freight-intel.com").first():
            print("Database already seeded. Skipping initial seed.")
            return

        print("Seeding freight-intel enterprise maritime database...")

        # 1. Roles
        admin_role = Role(name="admin", description="System Administrator with full access")
        user_role = Role(name="user", description="Maritime Chartering and Procurement Specialist")
        db.add_all([admin_role, user_role])
        db.commit()

        # 2. Users (Admin and User demo accounts)
        admin_user = User(
            email="admin@freight-intel.com",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Alexander Vance (Admin)",
            organization="freight-intel Maritime Operations",
            role_id=admin_role.id,
            is_active=True,
            is_admin=True
        )
        demo_user = User(
            email="user@freight-intel.com",
            hashed_password=get_password_hash("User@123"),
            full_name="Priya Sharma",
            organization="Eastern Bulk Logistics Ltd",
            role_id=user_role.id,
            is_active=True,
            is_admin=False
        )
        db.add_all([admin_user, demo_user])
        db.commit()

        # 3. Ports (20+ Ports: East Coast India + International Origins)
        ports_data = [
            # East Coast India
            {"name": "Chennai", "code": "INMAA", "country": "India", "region": "East Coast India", "lat": 13.0827, "lng": 80.2707, "draft": 14.6, "berths": 18, "handling": 32.0, "congestion": 26.5, "wait": 1.6, "status": "Operational"},
            {"name": "Visakhapatnam", "code": "INVTZ", "country": "India", "region": "East Coast India", "lat": 17.6868, "lng": 83.2185, "draft": 16.5, "berths": 24, "handling": 28.0, "congestion": 21.0, "wait": 1.2, "status": "Operational"},
            {"name": "Paradip", "code": "INPRT", "country": "India", "region": "East Coast India", "lat": 20.3164, "lng": 86.6111, "draft": 16.0, "berths": 20, "handling": 38.0, "congestion": 34.5, "wait": 2.3, "status": "Congested"},
            {"name": "Kolkata / Haldia", "code": "INCCU", "country": "India", "region": "East Coast India", "lat": 22.0289, "lng": 88.0645, "draft": 11.2, "berths": 14, "handling": 46.0, "congestion": 42.0, "wait": 3.1, "status": "Congested"},
            {"name": "Kakinada", "code": "INKAK", "country": "India", "region": "East Coast India", "lat": 16.9891, "lng": 82.2475, "draft": 14.0, "berths": 8, "handling": 26.0, "congestion": 17.5, "wait": 0.8, "status": "Operational"},
            {"name": "Tuticorin (V.O.C.)", "code": "INTCR", "country": "India", "region": "South-East Coast India", "lat": 8.7642, "lng": 78.1348, "draft": 14.2, "berths": 12, "handling": 30.0, "congestion": 20.0, "wait": 1.1, "status": "Operational"},
            {"name": "Ennore (Kamarajar)", "code": "INENR", "country": "India", "region": "East Coast India", "lat": 13.2612, "lng": 80.3342, "draft": 16.0, "berths": 9, "handling": 25.0, "congestion": 18.0, "wait": 0.9, "status": "Operational"},
            {"name": "Gopalpur", "code": "INGPR", "country": "India", "region": "East Coast India", "lat": 19.3000, "lng": 84.9667, "draft": 13.5, "berths": 5, "handling": 29.0, "congestion": 15.0, "wait": 0.7, "status": "Operational"},
            {"name": "Krishnapatnam", "code": "INKRI", "country": "India", "region": "East Coast India", "lat": 14.2500, "lng": 80.1200, "draft": 18.0, "berths": 11, "handling": 22.0, "congestion": 16.0, "wait": 0.6, "status": "Operational"},

            # Southeast Asia (Singapore, Indonesia)
            {"name": "Singapore", "code": "SGSIN", "country": "Singapore", "region": "Southeast Asia", "lat": 1.290270, "lng": 103.851959, "draft": 18.5, "berths": 65, "handling": 14.0, "congestion": 14.0, "wait": 0.5, "status": "Operational"},
            {"name": "Balikpapan (Kalimantan)", "code": "IDBPN", "country": "Indonesia", "region": "Southeast Asia", "lat": -1.2692, "lng": 116.8253, "draft": 14.0, "berths": 10, "handling": 34.0, "congestion": 28.0, "wait": 1.9, "status": "Operational"},
            {"name": "Tanjung Priok (Jakarta)", "code": "IDTPP", "country": "Indonesia", "region": "Southeast Asia", "lat": -6.1025, "lng": 106.8833, "draft": 15.0, "berths": 26, "handling": 28.0, "congestion": 22.0, "wait": 1.4, "status": "Operational"},
            {"name": "Samarinda", "code": "IDSMI", "country": "Indonesia", "region": "Southeast Asia", "lat": -0.5022, "lng": 117.1536, "draft": 12.5, "berths": 8, "handling": 40.0, "congestion": 33.0, "wait": 2.2, "status": "Operational"},
            {"name": "Port Klang", "code": "MYPKG", "country": "Malaysia", "region": "Southeast Asia", "lat": 2.9999, "lng": 101.3928, "draft": 16.5, "berths": 32, "handling": 18.0, "congestion": 19.0, "wait": 1.0, "status": "Operational"},

            # Australia
            {"name": "Port Hedland", "code": "AUPHE", "country": "Australia", "region": "Oceania", "lat": -20.3167, "lng": 118.5760, "draft": 19.5, "berths": 19, "handling": 20.0, "congestion": 25.0, "wait": 1.5, "status": "Operational"},
            {"name": "Newcastle", "code": "AUNTL", "country": "Australia", "region": "Oceania", "lat": -32.9283, "lng": 151.7817, "draft": 15.2, "berths": 14, "handling": 24.0, "congestion": 22.0, "wait": 1.3, "status": "Operational"},
            {"name": "Hay Point", "code": "AUHPT", "country": "Australia", "region": "Oceania", "lat": -21.2833, "lng": 149.3000, "draft": 18.0, "berths": 6, "handling": 21.0, "congestion": 18.0, "wait": 1.1, "status": "Operational"},
            {"name": "Gladstone", "code": "AUGLT", "country": "Australia", "region": "Oceania", "lat": -23.8427, "lng": 151.2560, "draft": 16.8, "berths": 12, "handling": 23.0, "congestion": 16.0, "wait": 0.9, "status": "Operational"},

            # Middle East / South Africa / China
            {"name": "Fujairah", "code": "AEFJR", "country": "UAE", "region": "Middle East", "lat": 25.1288, "lng": 56.3265, "draft": 17.5, "berths": 18, "handling": 16.0, "congestion": 12.0, "wait": 0.4, "status": "Operational"},
            {"name": "Richards Bay", "code": "ZARCB", "country": "South Africa", "region": "Africa", "lat": -28.7833, "lng": 32.0333, "draft": 18.5, "berths": 15, "handling": 36.0, "congestion": 38.0, "wait": 2.8, "status": "Congested"},
            {"name": "Guangzhou", "code": "CNCAN", "country": "China", "region": "East Asia", "lat": 23.1291, "lng": 113.2644, "draft": 16.0, "berths": 48, "handling": 22.0, "congestion": 29.0, "wait": 1.7, "status": "Operational"},
            {"name": "Qingdao", "code": "CNTAO", "country": "China", "region": "East Asia", "lat": 36.0671, "lng": 120.3826, "draft": 18.0, "berths": 52, "handling": 21.0, "congestion": 24.0, "wait": 1.4, "status": "Operational"}
        ]

        port_objs = []
        for p in ports_data:
            obj = Port(
                name=p["name"],
                code=p["code"],
                country=p["country"],
                region=p["region"],
                latitude=p["lat"],
                longitude=p["lng"],
                draft_depth_m=p["draft"],
                berths=p["berths"],
                avg_handling_time_hours=p["handling"],
                congestion_index=p["congestion"],
                waiting_time_days=p["wait"],
                status=p["status"]
            )
            db.add(obj)
            port_objs.append(obj)
        db.commit()

        # 4. Cargo Types
        cargos = [
            Cargo(name="Coal", code="COAL", category="Dry Bulk", stowage_factor=1.25, typical_handling_rate_tpd=30000),
            Cargo(name="Iron Ore", code="IROR", category="Dry Bulk", stowage_factor=0.65, typical_handling_rate_tpd=45000),
            Cargo(name="Fertilizer", code="FERT", category="Dry Bulk", stowage_factor=1.15, typical_handling_rate_tpd=18000),
            Cargo(name="Grain", code="GRAI", category="Dry Bulk", stowage_factor=1.35, typical_handling_rate_tpd=22000),
            Cargo(name="Bauxite", code="BAUX", category="Dry Bulk", stowage_factor=0.85, typical_handling_rate_tpd=35000),
            Cargo(name="Limestone", code="LIME", category="Dry Bulk", stowage_factor=0.95, typical_handling_rate_tpd=25000)
        ]
        db.add_all(cargos)
        db.commit()

        # 5. Routes (50+ routes connecting origins to East Coast India)
        origins = [p for p in port_objs if p.country != "India"]
        destinations = [p for p in port_objs if p.country == "India"]

        routes_list = []
        for o in origins:
            for d in destinations:
                # Approximate nautical miles
                lat_diff = abs(o.latitude - d.latitude)
                lng_diff = abs(o.longitude - d.longitude)
                dist = round((lat_diff**2 + lng_diff**2)**0.5 * 60.0 * 1.15, 0)
                dist = max(1450.0, dist)
                transit_days = round(dist / (13.0 * 24.0), 1)
                bunker_mt = round(transit_days * 24.5, 1)

                r_obj = Route(
                    name=f"{o.name} → {d.name}",
                    origin_port_id=o.id,
                    destination_port_id=d.id,
                    distance_nm=dist,
                    typical_transit_days=transit_days,
                    bunker_consumption_mt=bunker_mt,
                    canal_fees_usd=0.0,
                    weather_risk_factor=round(random.uniform(0.08, 0.22), 2),
                    co2_emissions_mt=round(bunker_mt * 3.114, 1),
                    is_active=True
                )
                db.add(r_obj)
                routes_list.append(r_obj)
        db.commit()

        # 6. Vessels (50+ Realistically Modeled Bulk Carriers)
        vessel_names = [
            "MV Ocean Grace", "MV Stellar Force", "MV Baltic Star", "MV Nordic Wind", "MV Iron Pioneer",
            "MV Bay Challenger", "MV Eastern Horizon", "MV Pacific Titan", "MV Coromandel Pride", "MV Bengal Carrier",
            "MV Kakinada Trader", "MV Paradip Voyager", "MV Andhra Glory", "MV Visakha Navigator", "MV Chennai Express",
            "MV Singapore Wave", "MV Java Sea Pioneer", "MV Kalimantan Leader", "MV Sumatra Trader", "MV Hedland Iron",
            "MV Newcastle Glory", "MV Richards Bay Express", "MV Arabian Pearl", "MV Fujairah Breeze", "MV Cape Odyssey",
            "MV Oceanic Harmony", "MV Global Venture", "MV Golden Ray", "MV Polaris Glory", "MV Sirius Bulk",
            "MV Vega Explorer", "MV Altair Star", "MV Antares Trader", "MV Rigel Voyager", "MV Capella Carrier",
            "MV Aldebaran Express", "MV Betelgeuse Titan", "MV Spica Pioneer", "MV Deneb Leader", "MV Regulus Iron",
            "MV Castor Wave", "MV Pollux Breeze", "MV Procyon Pride", "MV Canopus Spirit", "MV Arcturus Navigator",
            "MV Bellatrix Horizon", "MV Alnilam Trader", "MV Mintaka Glory", "MV Alnitak Carrier", "MV Saiph Bulk",
            "MV Mirfak Voyager", "MV Achernar Titan", "MV Fomalhaut Express", "MV Acrux Leader", "MV Mimosa Pioneer"
        ]

        vessel_types = ["Supramax", "Ultramax", "Panamax", "Capesize", "Handymax"]
        flags = ["Singapore", "Panama", "Liberia", "Marshall Islands", "India", "Cyprus", "Malta"]
        engines = [
            "MAN B&W 6S60ME-C8.2", "Wärtsilä 6X72", "MAN B&W 6S50ME-B9.3",
            "Mitsubishi 6UEC50LSII", "Hyundai-MAN B&W 7S50ME-C"
        ]
        positions = [
            ("Bay of Bengal (En route Chennai)", 12.8, 82.5),
            ("Strait of Malacca (Ballasting)", 4.2, 99.8),
            ("Visakhapatnam Outer Anchorage", 17.65, 83.28),
            ("Singapore Eastern Anchorage", 1.28, 103.88),
            ("Kalimantan Coal Anchorage", -1.25, 116.85),
            ("Port Hedland Inner Basin", -20.30, 118.55),
            ("Arabian Sea (West of Mangalore)", 13.5, 73.2),
            ("Indian Ocean Equatorial Passage", 0.5, 85.0),
            ("Paradip Roadstead Anchorage", 20.28, 86.65),
            ("South China Sea", 10.5, 112.0)
        ]

        vessels_created = []
        for i, name in enumerate(vessel_names):
            v_type = vessel_types[i % len(vessel_types)]
            if v_type == "Capesize":
                dwt = random.randint(160000, 182000)
                length = round(random.uniform(285.0, 295.0), 1)
                beam = round(random.uniform(44.0, 46.0), 1)
                draft = round(random.uniform(17.5, 18.5), 1)
                speed = round(random.uniform(13.0, 14.5), 1)
                fuel = round(random.uniform(38.0, 44.0), 1)
                hire = round(random.uniform(23000.0, 28500.0), 0)
            elif v_type == "Panamax":
                dwt = random.randint(74000, 82500)
                length = round(random.uniform(224.0, 229.0), 1)
                beam = round(random.uniform(32.2, 32.5), 1)
                draft = round(random.uniform(14.0, 14.8), 1)
                speed = round(random.uniform(13.5, 14.2), 1)
                fuel = round(random.uniform(26.0, 31.0), 1)
                hire = round(random.uniform(16500.0, 19800.0), 0)
            elif v_type in ("Supramax", "Ultramax"):
                dwt = random.randint(55000, 64000)
                length = round(random.uniform(189.0, 199.9), 1)
                beam = round(random.uniform(32.2, 32.3), 1)
                draft = round(random.uniform(12.8, 13.4), 1)
                speed = round(random.uniform(13.5, 14.0), 1)
                fuel = round(random.uniform(21.0, 25.0), 1)
                hire = round(random.uniform(14200.0, 16800.0), 0)
            else: # Handymax
                dwt = random.randint(42000, 48000)
                length = round(random.uniform(175.0, 185.0), 1)
                beam = round(random.uniform(30.0, 31.0), 1)
                draft = round(random.uniform(11.5, 12.2), 1)
                speed = round(random.uniform(13.0, 13.8), 1)
                fuel = round(random.uniform(19.0, 22.0), 1)
                hire = round(random.uniform(12500.0, 14500.0), 0)

            built = random.randint(2014, 2023)
            flag = flags[i % len(flags)]
            pos_label, pos_lat, pos_lng = positions[i % len(positions)]
            imo = f"IMO {9400000 + i * 117}"

            status = "Available" if i % 4 != 0 else ("Immediate" if i % 5 == 0 else "Within 7 Days")

            v_obj = Vessel(
                name=name,
                imo=imo,
                vessel_type=v_type,
                dwt=dwt,
                built_year=built,
                length_overall_m=length,
                beam_m=beam,
                draft_m=draft,
                flag=flag,
                classification_society="DNV" if i % 2 == 0 else "Lloyd's Register",
                main_engine=engines[i % len(engines)],
                service_speed_knots=speed,
                fuel_consumption_tpd=fuel,
                daily_hire_rate=hire,
                availability_status=status,
                current_position_name=pos_label,
                current_lat=pos_lat + random.uniform(-0.1, 0.1),
                current_lng=pos_lng + random.uniform(-0.1, 0.1),
                eta=(datetime.datetime.utcnow() + datetime.timedelta(days=random.randint(2, 9))).strftime("%Y-%m-%d %H:%M"),
                recommendation_score=0.0,
                why_recommended="",
                image_url=f"/vessels/vessel-{(i % 6) + 1}.jpg",
                owner_operator="Pacific Bulk Maritime" if i % 2 == 0 else "Coromandel Shipping Corp"
            )
            scoring = compute_vessel_score(v_obj)
            v_obj.recommendation_score = scoring["overall_score"]
            v_obj.why_recommended = scoring["why_recommended"]
            db.add(v_obj)
            vessels_created.append(v_obj)
        db.commit()

        # 7. 12+ Months Historical Freight Rates (High fidelity daily/weekly time series)
        print("Seeding 12+ months historical freight rates...")
        now = datetime.datetime.utcnow()
        start_date = now - datetime.timedelta(days=380)

        coal_cargo = db.query(Cargo).filter(Cargo.name == "Coal").first()
        singapore_vizag = routes_list[0]

        history_rows = []
        base_rate = 24.50
        curr_dt = start_date
        step_days = 2
        day_idx = 0

        while curr_dt <= now:
            # Realistic maritime market cycle: seasonal swings, bunker fluctuations
            seasonal = np.sin(day_idx / 45.0) * 2.8 + np.cos(day_idx / 90.0) * 1.5
            noise = random.uniform(-0.6, 0.6)
            rate_val = round(max(17.5, base_rate + seasonal + noise), 2)
            bunker_val = round(610.0 + np.sin(day_idx / 30.0) * 45.0 + random.uniform(-5.0, 5.0), 1)
            bdi_val = round(1350.0 + seasonal * 45.0 + random.uniform(-20.0, 20.0), 0)

            fr = FreightRate(
                date=curr_dt,
                route_id=singapore_vizag.id,
                cargo_id=coal_cargo.id,
                vessel_type="Supramax",
                rate_per_ton=rate_val,
                bunker_price_vlsfo=bunker_val,
                bdi_value=bdi_val,
                port_congestion_delay_days=round(random.uniform(1.2, 2.5), 1)
            )
            db.add(fr)
            history_rows.append({
                "date": curr_dt,
                "rate": rate_val,
                "distance_nm": 1680.0,
                "bunker_price": bunker_val,
                "congestion_index": 24.0,
                "cargo_type": "Coal",
                "vessel_type": "Supramax"
            })

            curr_dt += datetime.timedelta(days=step_days)
            day_idx += 1

        db.commit()

        # Train ML Forecaster with generated 12-month data
        df_hist = pd.DataFrame(history_rows)
        ml_forecaster.train_on_history(df_hist)
        print("ML Forecaster successfully trained on historical data.")

        # 8. 100+ Realistic Shipment Records
        print("Seeding 100+ shipment voyage records...")
        statuses = ["Completed", "Completed", "In Transit", "Discharging", "Scheduled"]
        for i in range(110):
            v_pick = vessels_created[i % len(vessels_created)]
            r_pick = routes_list[i % len(routes_list)]
            c_pick = cargos[i % len(cargos)]
            
            dep_offset = random.randint(-180, 5)
            dep_date = now + datetime.timedelta(days=dep_offset)
            transit_days = int(r_pick.typical_transit_days)
            arr_date = dep_date + datetime.timedelta(days=transit_days)

            status = "Completed" if dep_offset < -20 else random.choice(statuses)
            qty = round(random.uniform(45000, 75000), 0)
            rate = round(random.uniform(18.5, 26.0), 2)

            sh = Shipment(
                shipment_code=f"SHP-2025-{1000 + i}",
                vessel_id=v_pick.id,
                route_id=r_pick.id,
                cargo_id=c_pick.id,
                quantity_mt=qty,
                freight_rate_per_ton=rate,
                total_cost_usd=round(qty * rate, 0),
                status=status,
                departure_date=dep_date,
                estimated_arrival_date=arr_date,
                actual_arrival_date=arr_date if status == "Completed" else None
            )
            db.add(sh)
        db.commit()

        # 9. Market Data Indicators
        indicators = [
            {"name": "Baltic Dry Index (BDI)", "val": 1452.0, "unit": "Points", "c24": -1.4, "c7": -3.2},
            {"name": "BDI Supramax Index (BSI)", "val": 1280.0, "unit": "Points", "c24": -0.8, "c7": -2.1},
            {"name": "BDI Capesize Index (BCI)", "val": 2150.0, "unit": "Points", "c24": +2.3, "c7": +5.4},
            {"name": "VLSFO Bunker Singapore", "val": 618.5, "unit": "USD/MT", "c24": -0.5, "c7": -1.8},
            {"name": "MGO Singapore", "val": 782.0, "unit": "USD/MT", "c24": -0.2, "c7": -0.9},
            {"name": "Brent Crude Benchmark", "val": 79.4, "unit": "USD/Bbl", "c24": +0.6, "c7": +1.4},
            {"name": "Indonesian Coal Benchmark (ICI 4)", "val": 84.5, "unit": "USD/MT", "c24": -0.4, "c7": -2.8},
            {"name": "Australian Coking Coal Premium", "val": 242.0, "unit": "USD/MT", "c24": +1.1, "c7": +0.5}
        ]
        for ind in indicators:
            m = MarketData(
                indicator_name=ind["name"],
                value=ind["val"],
                unit=ind["unit"],
                change_24h=ind["c24"],
                change_7d=ind["c7"]
            )
            db.add(m)
        db.commit()

        # 10. Notifications
        notifs = [
            Notification(title="Freight Rate Softening Detected", message="Singapore → Chennai spot rates decreased by 3.2% over 48 hours. Consider spot fixtures.", notification_type="Alert", severity="info", is_read=False),
            Notification(title="Paradip Port Congestion Alert", message="Anchorage queue at Paradip increased to 12 vessels; average waiting delay rose to 2.3 days.", notification_type="Alert", severity="warning", is_read=False),
            Notification(title="Optimal Charter Window Opening", message="AIS indicates 4 Supramax carriers ballasting towards Bay of Bengal with open prompt laycans.", notification_type="Recommendation", severity="success", is_read=False),
            Notification(title="Bunker Price Drop in Singapore", message="VLSFO declined below $620/MT, reducing estimated voyage cost for East Coast corridors.", notification_type="Alert", severity="info", is_read=True),
            Notification(title="Procurement Plan Approved", message="PLN-2025-042 (Vale Oman Iron Ore to Chennai) has been signed by chartering lead.", notification_type="System", severity="success", is_read=True)
        ]
        db.add_all(notifs)

        # 11. Reports
        reports = [
            Report(title="East Coast India Freight Outlook", report_type="Freight Forecast Report", corridor="Singapore / Indonesia → East Coast India", commodity="Thermal Coal & Iron Ore", generated_by="freight-intel ML Engine", summary="Comprehensive freight price projections across dry bulk corridors.", file_size_kb=245, format="PDF"),
            Report(title="Vessel Chartering Efficiency & Fuel Audit", report_type="Vessel Chartering Report", corridor="Bay of Bengal Corridors", commodity="Dry Bulk", generated_by="Charter Optimization Service", summary="Analysis of 45 chartered voyages with fuel consumption benchmarks comparing eco-speeds vs full speed.", file_size_kb=180, format="CSV"),
            Report(title="Bulk Cargo Procurement & Supplier Quality Index", report_type="Cargo Procurement Report", corridor="Indonesia & Australia → Vizag/Paradip", commodity="Coal & Bauxite", generated_by="Procurement Analytics", summary="Vendor reliability scorecard and FOB contract savings summary totaling $3.85M in captured discounts.", file_size_kb=310, format="PDF"),
            Report(title="East Coast India Port Congestion & Turnaround Times", report_type="Route Optimization Report", corridor="Chennai, Vizag, Paradip, Kolkata, Kakinada", commodity="All Cargoes", generated_by="AIS Telemetry Feed", summary="Average anchorage waiting times and berth productivity metrics across 5 major East Coast ports.", file_size_kb=165, format="CSV")
        ]
        db.add_all(reports)
        db.commit()

        print("freight-intel database seeding complete!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
