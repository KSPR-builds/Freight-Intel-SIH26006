import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("freightiq.database")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./freightiq.db")

# Fallback mechanism if Postgres connection fails
def get_engine():
    global DATABASE_URL
    connect_args = {}
    if DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(DATABASE_URL, connect_args=connect_args)
    
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection to {DATABASE_URL} failed: {e}. Falling back to SQLite local database.")
        DATABASE_URL = "sqlite:///./freightiq.db"
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
