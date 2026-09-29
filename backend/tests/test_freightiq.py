import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_system_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"
    assert "database" in data["services"]
    assert "ml_engine" in data["services"]

def test_user_authentication():
    # 1. Login with demo user
    res = client.post("/api/auth/login", json={
        "email": "user@freight-intel.com",
        "password": "User@123",
        "is_admin_login": False
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "user"

def test_admin_authentication():
    # 2. Login with demo admin
    res = client.post("/api/auth/login", json={
        "email": "admin@freight-intel.com",
        "password": "Admin@123",
        "is_admin_login": True
    })
    assert res.status_code == 200
    token_data = res.json()
    assert token_data["role"] == "admin"

def test_role_authorization_restriction():
    # Regular user token cannot access admin endpoints
    user_res = client.post("/api/auth/login", json={
        "email": "user@freight-intel.com",
        "password": "User@123",
        "is_admin_login": False
    })
    user_token = user_res.json()["access_token"]

    admin_res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert admin_res.status_code == 403

    # Admin token can access admin endpoints
    admin_auth = client.post("/api/auth/login", json={
        "email": "admin@freight-intel.com",
        "password": "Admin@123",
        "is_admin_login": True
    })
    admin_token = admin_auth.json()["access_token"]
    admin_ok = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_ok.status_code == 200
    assert "kpis" in admin_ok.json()

def test_forecast_endpoint():
    res = client.get("/api/forecast?origin_port=Singapore&destination_port=Visakhapatnam&cargo_type=Coal&horizon_days=30")
    assert res.status_code == 200
    data = res.json()
    assert data["origin_port"] == "Singapore"
    assert data["destination_port"] == "Visakhapatnam"
    assert "predicted_rate" in data
    assert "chart_data" in data
    assert len(data["chart_data"]) > 0
    assert "confidence_score" in data
    assert data["confidence_score"] > 80

def test_vessel_chartering_and_recommendations():
    # List vessels
    v_res = client.get("/api/vessels?vessel_type=Supramax")
    assert v_res.status_code == 200
    vessels = v_res.json()
    assert len(vessels) > 0
    first_vessel = vessels[0]
    assert "imo" in first_vessel
    assert "daily_hire_rate" in first_vessel
    assert "recommendation_score" in first_vessel

    # Recommendations
    rec_res = client.get("/api/chartering/recommend?corridor=Singapore%20%E2%86%92%20Visakhapatnam")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) == 3
    assert recs[0]["overall_score"] >= recs[1]["overall_score"]

def test_route_optimization():
    res = client.get("/api/routes/optimize?origin=Singapore&destination=Chennai")
    assert res.status_code == 200
    data = res.json()
    assert "best_route" in data
    assert "lowest_cost_route" in data
    assert "fastest_route" in data
    assert "lowest_emissions_route" in data
    assert len(data["best_route"]["waypoints"]) > 0

def test_procurement_calculation():
    res = client.get("/api/procurement")
    assert res.status_code == 200
    data = res.json()
    assert data["total_demand_mt"] > 0
    assert len(data["top_suppliers"]) > 0
    assert len(data["upcoming_plans"]) > 0

def test_report_csv_export():
    res = client.get("/api/reports/export?type=freight")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Singapore → Chennai" in res.text
