"""
seed_role_data.py
-----------------
Seeds the four new role-based tables with demo data tied to the two
existing demo accounts:

  Admin : admin@freight-intel.com  / Admin@123
  User  : user@freight-intel.com   / User@123

Idempotent — checks whether sample assignments already exist before seeding.

Run from the project root:
    python -m backend.app.database.seed_role_data
"""
import datetime
from backend.app.database.connection import SessionLocal, engine, Base
from backend.app.models import Assignment, UserNotification, Message, Emergency
from backend.app.models.user import User


def seed_role_data(db=None):
    should_close = False
    if db is None:
        # Ensure tables exist (idempotent)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # ── Resolve the two demo users ────────────────────────────────────────
        admin_user = db.query(User).filter(User.email == "admin@freight-intel.com").first()
        demo_user  = db.query(User).filter(User.email == "user@freight-intel.com").first()

        if not admin_user or not demo_user:
            print("Demo users not found — run `python -m backend.app.database.seed` first.")
            return

        # ── Guard: skip if already seeded ─────────────────────────────────────
        if db.query(Assignment).filter(Assignment.user_id == demo_user.id).first():
            print("Role-based seed data already present. Skipping.")
            return

        print("Seeding role-based demo data (assignments, notifications, messages, emergencies)...")

        # ── 1. Assignments ────────────────────────────────────────────────────
        today = datetime.date.today()

        assignments = [
            Assignment(
                user_id=demo_user.id,
                origin_port="Kalimantan (Balikpapan)",
                destination_port="Visakhapatnam",
                cargo_type="Thermal Coal",
                quantity_mt=65_000,
                laycan_start=today + datetime.timedelta(days=14),
                laycan_end=today + datetime.timedelta(days=21),
                vessel_type="Panamax",
                notes="Consignee: NTPC Vizag. Shipper: Adaro Energy. "
                      "NOR to be tendered at anchorage. Moisture content ≤12%.",
                status="active",
                created_by=admin_user.id,
            ),
            Assignment(
                user_id=demo_user.id,
                origin_port="Port Hedland (Australia)",
                destination_port="Paradip",
                cargo_type="Iron Ore Pellets",
                quantity_mt=80_000,
                laycan_start=today + datetime.timedelta(days=30),
                laycan_end=today + datetime.timedelta(days=37),
                vessel_type="Capesize",
                notes="Pellet grade: DR-Grade 67% Fe. Destination: JSPL Angul slurry pipeline.",
                status="active",
                created_by=admin_user.id,
            ),
            Assignment(
                user_id=demo_user.id,
                origin_port="Singapore (Jurong Island)",
                destination_port="Chennai",
                cargo_type="Fertilizer (Urea)",
                quantity_mt=28_000,
                laycan_start=today - datetime.timedelta(days=10),
                laycan_end=today - datetime.timedelta(days=3),
                vessel_type="Supramax",
                notes="Completed voyage. Bill of lading issued. Final freight settled.",
                status="updated",
                created_by=admin_user.id,
            ),
        ]
        db.add_all(assignments)
        db.flush()  # populate IDs

        # ── 2. UserNotifications ──────────────────────────────────────────────
        notifications = [
            UserNotification(
                user_id=demo_user.id,
                type="assignment_new",
                title="New Voyage Assignment — Thermal Coal",
                body=(
                    "You have been assigned a new voyage: Kalimantan (Balikpapan) → "
                    "Visakhapatnam (Thermal Coal, 65,000 MT). "
                    f"Laycan: {assignments[0].laycan_start} – {assignments[0].laycan_end}."
                ),
                link_url=f"/assignments/{assignments[0].id}",
                is_read=False,
            ),
            UserNotification(
                user_id=demo_user.id,
                type="assignment_new",
                title="New Voyage Assignment — Iron Ore Pellets",
                body=(
                    "You have been assigned a new voyage: Port Hedland → Paradip "
                    "(Iron Ore Pellets, 80,000 MT). "
                    f"Laycan: {assignments[1].laycan_start} – {assignments[1].laycan_end}."
                ),
                link_url=f"/assignments/{assignments[1].id}",
                is_read=False,
            ),
            UserNotification(
                user_id=demo_user.id,
                type="assignment_updated",
                title="Voyage Assignment Updated — Fertilizer",
                body=(
                    "Your Singapore → Chennai assignment (Urea, 28,000 MT) has been updated."
                ),
                link_url=f"/assignments/{assignments[2].id}",
                is_read=True,
            ),
            # Notify admin of a sample message
            UserNotification(
                user_id=admin_user.id,
                type="message",
                title="New message from Priya Sharma",
                body="Priya Sharma sent you a message.",
                link_url=f"/messages/{demo_user.id}",
                is_read=False,
            ),
        ]
        db.add_all(notifications)

        # ── 3. Messages ───────────────────────────────────────────────────────
        base_time = datetime.datetime.utcnow() - datetime.timedelta(hours=3)

        messages = [
            Message(
                thread_user_id=demo_user.id,
                sender_id=admin_user.id,
                sender_role="admin",
                body=(
                    "Hi Priya, please review the Thermal Coal fixture for Visakhapatnam. "
                    "Vessel owner needs NOR acceptance confirmation by EOD."
                ),
                is_read=True,
                created_at=base_time,
            ),
            Message(
                thread_user_id=demo_user.id,
                sender_id=demo_user.id,
                sender_role="user",
                body=(
                    "Understood. I've reviewed the CP terms. NOR acceptance will be sent. "
                    "Can you clarify the demurrage rate applicable post 14:00 hrs?"
                ),
                is_read=True,
                created_at=base_time + datetime.timedelta(minutes=25),
            ),
            Message(
                thread_user_id=demo_user.id,
                sender_id=admin_user.id,
                sender_role="admin",
                body=(
                    "Demurrage rate is USD 8,500 PDPR. Dispatch at half that — USD 4,250 PDPR. "
                    "Will send the full fixture recap shortly."
                ),
                is_read=True,
                created_at=base_time + datetime.timedelta(minutes=40),
            ),
            Message(
                thread_user_id=demo_user.id,
                sender_id=demo_user.id,
                sender_role="user",
                body=(
                    "Received. One concern — the Paradip anchorage delay is now 2.3 days. "
                    "Should we build that into the laytime calculation?"
                ),
                is_read=False,   # admin hasn't read this yet
                created_at=base_time + datetime.timedelta(hours=1, minutes=10),
            ),
        ]
        db.add_all(messages)

        # ── 4. Emergency (sample, already acknowledged) ───────────────────────
        emergency = Emergency(
            user_id=demo_user.id,
            category="severe_weather",
            severity="high",
            location="Bay of Bengal, approx. 12°N 86°E",
            message=(
                "Cyclonic circulation developing in Bay of Bengal. Wind speeds 55-65 knots. "
                "M/V OCEAN PRIDE (IMO 9871234) has requested deviation. "
                "ETA Visakhapatnam delayed by 36–48 hours. Crew safe."
            ),
            status="acknowledged",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            acknowledged_by=admin_user.id,
            acknowledged_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=22),
        )
        db.add(emergency)

        db.commit()
        print("[OK] Role-based seed data created successfully.")
        print(f"  - {len(assignments)} assignments for user@freight-intel.com")
        print(f"  - {len(notifications)} user notifications")
        print(f"  - {len(messages)} messages in thread")
        print(f"  - 1 sample emergency (acknowledged)")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_role_data()
