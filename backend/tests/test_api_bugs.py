"""
Tests for:
  - POST /api/contracts/simulate
  - GET /api/messages/unread-count
  - GET /api/emergencies/open-count
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database.connection import Base, get_db
from backend.app.models.user import User
from backend.app.models.message import Message
from backend.app.models.emergency import Emergency
from backend.app.services.auth_service import get_password_hash, create_access_token

# ── Test DB ───────────────────────────────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///./test_endpoints.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


from backend.app.models.port import Port

@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    # Create admin user
    admin = User(
        email="testadmin@freight.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Test Admin",
        organization="Test Org",
        is_admin=True,
        is_active=True,
    )
    # Create regular user
    user = User(
        email="testuser@freight.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Test User",
        organization="Test Org",
        is_admin=False,
        is_active=True,
    )
    db.add_all([admin, user])
    db.commit()
    db.refresh(admin)
    db.refresh(user)

    # Seed ports that simulate endpoint needs
    singapore = Port(
        name="Singapore", code="SGSIN", country="Singapore", region="Southeast Asia",
        latitude=1.3521, longitude=103.8198,
        draft_depth_m=16.0, max_loa=400.0, max_beam=60.0,
        congestion_index=20.0, waiting_time_days=1.0, status="Operational",
    )
    chennai = Port(
        name="Chennai", code="INMAA", country="India", region="East Coast India",
        latitude=13.0827, longitude=80.2707,
        draft_depth_m=14.6, max_loa=300.0, max_beam=50.0,
        congestion_index=26.5, waiting_time_days=1.6, status="Operational",
    )
    db.add_all([singapore, chennai])
    db.commit()

    # Add an unread message from the user (for admin's unread-count)
    msg = Message(
        thread_user_id=user.id,
        sender_id=user.id,
        sender_role="user",
        body="Test message",
        is_read=False,
    )
    db.add(msg)

    # Add an open emergency
    emerg = Emergency(
        user_id=user.id,
        category="cyclone",
        severity="high",
        location="Bay of Bengal",
        message="Test emergency",
        status="open",
    )
    db.add(emerg)
    db.commit()

    yield {"admin_id": admin.id, "user_id": user.id}

    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def get_token(email: str) -> str:
    return create_access_token({"sub": email})


# ── Bug 1: POST /api/contracts/simulate ──────────────────────────────────────

class TestSimulateEndpoint:
    def test_simulate_returns_200(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"

    def test_simulate_contains_vessel_recommendation(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = r.json()
        assert "vessel_recommendation" in data
        assert "vessel_type" in data["vessel_recommendation"]
        assert "limiting_constraint" in data["vessel_recommendation"]

    def test_simulate_contains_schedule(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = r.json()
        assert "schedule" in data
        assert isinstance(data["schedule"], list)

    def test_simulate_contains_all_four_cost_structures(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = r.json()
        assert "prices" in data
        prices = data["prices"]
        for structure in ["spot", "coa", "consecutive_voyage", "time_charter"]:
            assert structure in prices, f"Missing structure: {structure}"
            assert "low" in prices[structure]
            assert "expected" in prices[structure]
            assert "high" in prices[structure]

    def test_simulate_contains_recommendation(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = r.json()
        assert "recommendation" in data
        assert "cheapest_structure" in data["recommendation"]
        assert "advice" in data["recommendation"]

    def test_simulate_rejects_invalid_port(self, client):
        token = get_token("testadmin@freight.com")
        payload = {
            "origin_port": "NotARealPort",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post(
            "/api/contracts/simulate",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 400

    def test_simulate_requires_auth(self, client):
        payload = {
            "origin_port": "Singapore",
            "destination_port": "Chennai",
            "cargo_type": "Coal",
            "total_quantity_mt": 250000,
            "period_start": "2026-10-01",
            "period_end": "2026-12-31",
        }
        r = client.post("/api/contracts/simulate", json=payload)
        assert r.status_code in (401, 403)


# ── Bug 2: GET /api/messages/unread-count ────────────────────────────────────

class TestUnreadMessageCount:
    def test_admin_sees_user_unread_messages(self, client):
        """Admin should see unread messages from users."""
        token = get_token("testadmin@freight.com")
        r = client.get(
            "/api/messages/unread-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert "unread_count" in data
        assert isinstance(data["unread_count"], int)
        assert data["unread_count"] >= 1  # We seeded 1 unread user message

    def test_user_sees_own_unread_messages(self, client):
        """User should get their own unread count without 422."""
        token = get_token("testuser@freight.com")
        r = client.get(
            "/api/messages/unread-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert "unread_count" in data
        assert isinstance(data["unread_count"], int)

    def test_unread_count_not_shadowed_by_thread_route(self, client):
        """
        Root cause test: unread-count must NOT be treated as /{thread_user_id}
        (which would fail int conversion → 422). Route order fix ensures
        /unread-count is registered before /{thread_user_id}.
        """
        token = get_token("testadmin@freight.com")
        r = client.get(
            "/api/messages/unread-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        # A 422 here means the path was captured by /{thread_user_id} and
        # FastAPI tried to coerce "unread-count" to int → validation error.
        assert r.status_code != 422, (
            "/api/messages/unread-count is being captured by /{thread_user_id}. "
            "Route order is wrong."
        )

    def test_unread_count_requires_auth(self, client):
        r = client.get("/api/messages/unread-count")
        assert r.status_code in (401, 403)


# ── Bug 2: GET /api/emergencies/open-count ───────────────────────────────────

class TestOpenEmergenciesCount:
    def test_admin_gets_open_count(self, client):
        token = get_token("testadmin@freight.com")
        r = client.get(
            "/api/emergencies/open-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert "open_count" in data
        assert isinstance(data["open_count"], int)
        assert data["open_count"] >= 1  # We seeded 1 open emergency

    def test_user_gets_zero_open_count(self, client):
        """Non-admin user should get 0 (not 403, not 422)."""
        token = get_token("testuser@freight.com")
        r = client.get(
            "/api/emergencies/open-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert data["open_count"] == 0

    def test_open_count_not_shadowed_by_emergency_id_route(self, client):
        """
        Root cause test: /open-count must not be captured by /{emergency_id}.
        A 422 here means the string 'open-count' was being coerced to int.
        """
        token = get_token("testadmin@freight.com")
        r = client.get(
            "/api/emergencies/open-count",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code != 422, (
            "/api/emergencies/open-count is captured by /{emergency_id}. "
            "Route order is wrong."
        )

    def test_open_count_requires_auth(self, client):
        r = client.get("/api/emergencies/open-count")
        assert r.status_code in (401, 403)
