# freight-intel — AI-Powered Maritime Freight Intelligence

> **Smarter Logistics. Greener Tomorrow.**  
> Intelligent Freight Forecasting Model for Optimised Vessel Chartering and Bulk Cargo Procurement from Overseas to the East Coast of India.

---

## 🌊 Overview

**freight-intel** is an enterprise-grade maritime logistics intelligence and vessel chartering platform tailored for overseas dry bulk supply corridors into the East Coast of India (Chennai, Visakhapatnam, Paradip, Kolkata/Haldia, Kakinada).

By synthesizing 12+ months of historical fixture indices, live bunker pricing (VLSFO / MGO), port congestion delays, and vessel naval architectural specifications, freight-intel provides predictive freight rate trajectories with confidence intervals, multi-factor vessel chartering recommendations with interactive hover telemetry, and bulk procurement scheduling.

---

## 🚀 Key Features

1. **AI Freight Rate Forecasting (`/forecast`)**
   - Corridors from Singapore, Indonesia (Kalimantan), Australia, South Africa, UAE, and China to East Coast India.
   - Machine Learning regression engine with 7D, 30D, 90D, and 1-year prediction horizons.
   - Interactive Recharts visualization with historical trends, forecasted trajectory, and shaded confidence bands (upper/lower bounds).
   - Live corridor comparison tables and AI-synthesized market drivers.

2. **Vessel Chartering & Fleet Optimization (`/chartering`)**
   - Directory of 50+ bulk carriers (Capesize, Panamax, Supramax, Ultramax, Handymax).
   - **Critical Floating Vessel Hover Popup**: Immediate non-intrusive popup rendering IMO, DWT, built year, LOA, beam, draft, main engine, speed, daily fuel consumption, day rate, live AIS position, ETA, and "Why Recommended" justification badges.
   - AI Top 3 Charter Recommendations with projected total voyage cost and estimated savings.
   - One-click charter fixture booking.

3. **Bulk Cargo Procurement Planning (`/procurement`)**
   - Simulator for Thermal/Coking Coal, Iron Ore Pellets, Bauxite, Fertilizer, and Grain.
   - Vendor reliability scorecards, FOB price tracking, and port loading speed metrics.
   - AI-optimized procurement windows to hedge against monsoon freight tightening.

4. **Ports & Routes Optimization (`/ports-routes`)**
   - Real-time handling metrics, draft limits, and congestion delay indices for East Coast India ports.
   - Interactive Leaflet maritime corridor map with great-circle shipping lanes and waypoints.
   - Trade-off comparison: **Recommended (Balanced)**, **Lowest Cost (Eco-Steaming)**, **Fastest Route**, and **Lowest Emissions ($CO_2$ Optimization)**.

5. **AI Insights & Analytics (`/insights`) & "Ask freight-intel" Assistant**
   - Executive intelligence briefing with confidence scores and actionable recommendations.
   - Conversational maritime assistant with quick prompts answering spot rate queries, vessel cost comparisons, and procurement timing.

6. **Reports & Data Export (`/reports`)**
   - Downloadable CSV datasets (Freight benchmarks, Fleet directory, Port handling indices).
   - Formatted printable PDF audit reports.

7. **Multi-Role Authentication & Admin Dashboard (`/admin`)**
   - Separate tabs for **User Login** and **Admin Login**.
   - Admin KPI suite, User management (edit, activate/disable, role assign), System data controls, and ML Telemetry monitoring (MAE, RMSE, $R^2$, Data Drift).

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React, Tailwind CSS, Lucide Icons, Recharts, Leaflet.
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Uvicorn.
- **Data & ML**: NumPy, Pandas, Scikit-learn (Ridge Regression, Gradient Boosting, Quantile Intervals).
- **Database**: PostgreSQL with intelligent SQLite fallback for zero-dependency local execution.
- **Auth**: JWT Bearer Tokens with bcrypt password hashing and Role-Based Access Control (RBAC).

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Enterprise User** | `user@freight-intel.com` | `User@123` | User Dashboard, Forecasting, Chartering, Procurement, Maps |
| **System Admin** | `admin@freight-intel.com` | `Admin@123` | Full Admin Console, User Mgmt, ML Ops, System Services |

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- (Optional) Docker & PostgreSQL

### 1. Backend Setup

```bash
# From the project root
# Activate virtual environment (optional) or use system python
pip install -r requirements.txt

# Run database setup & seeding (creates freightiq.db with 50+ vessels, 20+ ports, routes)
python -m backend.app.database.seed

# Launch the FastAPI backend server (runs on http://localhost:8000)
uvicorn backend.app.main:app --reload --port 8000
```

FastAPI Swagger documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Real Data Architecture

freight-intel is built on an extensible `DataProvider` pattern:
- Set `USE_REAL_DATA=false` in `.env` to run in self-contained **Seeded Demo Mode** (no external API keys required).
- Set `USE_REAL_DATA=true` and configure `WEATHER_API_KEY`, `MARINE_API_KEY`, and `MAP_API_KEY` in `.env` to stream live satellite AIS and Platts bunker pricing.

---

## 📄 License
Enterprise Maritime Intelligence Platform — freight-intel 2025.
