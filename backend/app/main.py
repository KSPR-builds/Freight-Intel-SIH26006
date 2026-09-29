import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.app.database.connection import engine, Base
from backend.app.database.seed import seed_database
from backend.app.api.auth import router as auth_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.chartering import router as chartering_router
from backend.app.api.procurement import router as procurement_router
from backend.app.api.ports import router_ports, router_routes
from backend.app.api.vessels import router as vessels_router
from backend.app.api.reports import router as reports_router
from backend.app.api.insights import router as insights_router
from backend.app.api.admin import router as admin_router
from backend.app.api.health import router as health_router
from backend.app.api.assignments import router as assignments_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.messages import router as messages_router
from backend.app.api.emergencies import router as emergencies_router
from backend.app.api.contracts import router as contracts_router

# Ensure models are loaded for create_all
import backend.app.models.contract
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("freightiq.app")

app = FastAPI(
    title="freight-intel API — AI-Powered Maritime Freight Intelligence",
    description="Backend API for Freight Rate Forecasting, Vessel Chartering Optimization, and Bulk Cargo Procurement for East Coast India.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend Next.js application
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(forecast_router)
app.include_router(chartering_router)
app.include_router(procurement_router)
app.include_router(router_ports)
app.include_router(router_routes)
app.include_router(vessels_router)
app.include_router(reports_router)
app.include_router(insights_router)
app.include_router(admin_router)
app.include_router(assignments_router)
app.include_router(notifications_router)
app.include_router(messages_router)
app.include_router(emergencies_router)
app.include_router(contracts_router)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing freight-intel database tables...")
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Startup database check: {e}")

@app.get("/")
def root():
    return {
        "name": "freight-intel API",
        "tagline": "AI-Powered Maritime Freight Intelligence",
        "corridors": "Overseas to East Coast India",
        "status": "Operational",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
