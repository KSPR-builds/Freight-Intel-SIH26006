import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.app.database.connection import Base

class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    indicator_name = Column(String(100), nullable=False, index=True) # Baltic Dry Index, VLSFO Singapore, Brent Crude, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(50), default="USD/MT")
    change_24h = Column(Float, default=0.0) # Percentage
    change_7d = Column(Float, default=0.0)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
