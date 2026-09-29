from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.connection import get_db
from backend.app.ml.model_registry import get_ml_metrics

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "Healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Degraded: {str(e)}"

    ml_stats = get_ml_metrics()

    return {
        "status": "Operational",
        "services": {
            "database": {"status": db_status, "type": db.bind.dialect.name},
            "backend_api": {"status": "Healthy", "version": "1.0.0"},
            "ml_engine": {"status": ml_stats["status"], "r2_score": ml_stats["r2_score"]},
            "data_pipeline": {"status": "Operational", "mode": "Seeded High-Fidelity"},
            "ai_engine": {"status": "Online"}
        }
    }
