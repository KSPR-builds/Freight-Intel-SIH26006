import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    imo = Column(String(20), unique=True, nullable=False, index=True)
    vessel_type = Column(String(50), nullable=False) # Capesize, Panamax, Supramax, Ultramax, Handymax
    dwt = Column(Integer, nullable=False) # Deadweight Tonnage
    built_year = Column(Integer, nullable=False)
    length_overall_m = Column(Float, nullable=False)
    beam_m = Column(Float, nullable=False)
    draft_m = Column(Float, nullable=False)
    flag = Column(String(50), nullable=False)
    classification_society = Column(String(50), default="DNV")
    main_engine = Column(String(100), default="MAN B&W 6S60ME-C8.2")
    service_speed_knots = Column(Float, default=13.5)
    fuel_consumption_tpd = Column(Float, default=24.5) # Tons per day
    daily_hire_rate = Column(Float, nullable=False) # USD per day
    availability_status = Column(String(50), default="Available") # Available, Immediate, Within 7 Days, On Voyage
    current_position_name = Column(String(150), default="Bay of Bengal")
    current_lat = Column(Float, default=13.0827)
    current_lng = Column(Float, default=80.2707)
    eta = Column(String(50), default="2025-04-02 14:00")
    recommendation_score = Column(Float, default=88.5) # 0 to 100
    why_recommended = Column(String(300), default="Competitive day rate; High fuel efficiency; Perfect draft clearance")
    image_url = Column(String(255), default="/vessels/bulk-carrier-1.jpg")
    owner_operator = Column(String(100), default="Pacific Bulk Maritime")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    shipments = relationship("Shipment", back_populates="vessel")
    charter_recommendations = relationship("CharterRecommendation", back_populates="vessel")
