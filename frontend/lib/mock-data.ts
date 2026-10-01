// Comprehensive mock data for DEMO MODE on Vercel
// When NEXT_PUBLIC_DEMO_MODE=true or when backend API is unreachable in demo mode,
// this mock data seamlessly powers the dashboard, charts, reports, and modules.

export const MOCK_CURRENT_USER = {
  id: 1,
  email: "user@freight-intel.com",
  full_name: "Priya Sharma",
  organization: "Coromandel Bulk Carriers",
  role_name: "Dry Bulk Chartering Specialist",
  is_admin: false,
  is_active: true,
};

export const MOCK_ADMIN_USER = {
  id: 2,
  email: "admin@freight-intel.com",
  full_name: "Captain R. K. Nair",
  organization: "freight-intel Operations Master",
  role_name: "Fleet Administrator",
  is_admin: true,
  is_active: true,
};

export const MOCK_DASHBOARD = {
  kpis: [
    { id: "freight-rate", label: "Freight Rate (Avg)", value: "$1,240 / TEU", trend: "↑ 6.2%", subtitle: "vs previous fixture cycle" },
    { id: "vessel-utilization", label: "Vessel Utilization", value: "82%", trend: "↑ 4.3%", subtitle: "fleet operating capacity" },
    { id: "cargo-volume", label: "Total Cargo Volume", value: "1.8M MT", trend: "↑ 7.5%", subtitle: "cumulative throughput" },
    { id: "cost-savings", label: "Est. Cost Savings", value: "$12.4M", trend: "↑ 9.8%", subtitle: "via AI-optimized fixtures" }
  ]
};

export const MOCK_FORECAST = {
  origin_port: "Singapore",
  destination_port: "Visakhapatnam",
  cargo_type: "Coal",
  vessel_type: "Supramax",
  horizon_days: 30,
  current_rate: 22.80,
  predicted_rate: 21.32,
  trend: "Declining",
  trend_percent: -6.5,
  volatility: 4.2,
  confidence_score: 93.8,
  mae: 0.68,
  rmse: 0.89,
  r2_score: 0.93,
  model_name: "GradientBoostingRegressor (v2.4)",
  ai_insight: "Freight rates are projected to decline by 6.5% over the next 30 days due to easing port turnaround times in East Coast India and softening bunker fuel indices. Consider spot fixtures over long-term charters for Q2 shipments.",
  chart_data: [
    { date: "Day -14", historical_rate: 24.1, is_future: false },
    { date: "Day -10", historical_rate: 23.8, is_future: false },
    { date: "Day -7", historical_rate: 23.2, is_future: false },
    { date: "Day -3", historical_rate: 23.0, is_future: false },
    { date: "Today", historical_rate: 22.8, predicted_rate: 22.8, lower_bound: 22.8, upper_bound: 22.8, is_future: false },
    { date: "Day +7", predicted_rate: 22.4, lower_bound: 21.6, upper_bound: 23.2, is_future: true },
    { date: "Day +14", predicted_rate: 21.9, lower_bound: 20.9, upper_bound: 22.9, is_future: true },
    { date: "Day +21", predicted_rate: 21.5, lower_bound: 20.4, upper_bound: 22.6, is_future: true },
    { date: "Day +30", predicted_rate: 21.3, lower_bound: 20.1, upper_bound: 22.5, is_future: true }
  ],
  route_comparisons: [
    { route_name: "Singapore → Visakhapatnam", cargo_name: "Coal", current_rate: 22.80, predicted_rate: 21.32, trend_percent: -6.5, recommendation: "Delay purchases — rates softening" },
    { route_name: "Newcastle → Paradip", cargo_name: "Coal", current_rate: 24.10, predicted_rate: 22.90, trend_percent: -5.0, recommendation: "Spot fixtures favourable" },
    { route_name: "Fujairah → Chennai", cargo_name: "Fertilizer", current_rate: 19.80, predicted_rate: 20.40, trend_percent: 3.0, recommendation: "Lock forward contracts now" },
    { route_name: "Guangzhou → Kolkata", cargo_name: "Iron Ore", current_rate: 21.50, predicted_rate: 20.10, trend_percent: -6.5, recommendation: "Wait for further softening" }
  ]
};

export const MOCK_VESSELS = [
  {
    id: 1,
    name: "MV Coromandel Star",
    imo: "9834521",
    vessel_type: "Supramax",
    dwt: 57800,
    built_year: 2019,
    length_overall_m: 190,
    beam_m: 32,
    draft_m: 12.8,
    flag: "India",
    classification_society: "DNV",
    main_engine: "MAN B&W 6S50ME-B9",
    service_speed_knots: 13.5,
    fuel_consumption_tpd: 24.5,
    daily_hire_rate: 14200,
    availability_status: "Available Prompt",
    current_position_name: "Singapore Outer Port Limits",
    current_lat: 1.25,
    current_lng: 103.85,
    eta: "2026-10-06",
    recommendation_score: 96,
    why_recommended: "Lowest voyage fuel cost & optimal draft for Paradip and Visakhapatnam berth limits.",
    image_url: "/madrid-maersk.jpg",
    owner_operator: "Coromandel Bulk Lines"
  },
  {
    id: 2,
    name: "MV Bay Voyager",
    imo: "9765412",
    vessel_type: "Ultramax",
    dwt: 63500,
    built_year: 2021,
    length_overall_m: 199,
    beam_m: 32.2,
    draft_m: 13.3,
    flag: "Singapore",
    classification_society: "Lloyd's Register",
    main_engine: "Wartsila 6X52",
    service_speed_knots: 14.0,
    fuel_consumption_tpd: 26.0,
    daily_hire_rate: 15600,
    availability_status: "In Transit",
    current_position_name: "Malacca Strait",
    current_lat: 2.50,
    current_lng: 101.40,
    eta: "2026-10-09",
    recommendation_score: 91,
    why_recommended: "Modern eco-design Ultramax with 4x30t cranes suitable for self-discharging at Kakinada.",
    image_url: "/madrid-maersk.jpg",
    owner_operator: "Singa Bulk Maritime"
  },
  {
    id: 3,
    name: "MV Eastern Glory",
    imo: "9642109",
    vessel_type: "Panamax",
    dwt: 76000,
    built_year: 2018,
    length_overall_m: 225,
    beam_m: 32.2,
    draft_m: 14.2,
    flag: "Marshall Islands",
    classification_society: "ABS",
    main_engine: "Hyundai-MAN 7S50MC",
    service_speed_knots: 13.0,
    fuel_consumption_tpd: 29.2,
    daily_hire_rate: 16800,
    availability_status: "Available Prompt",
    current_position_name: "Bay of Bengal (En route Chennai)",
    current_lat: 13.1,
    current_lng: 80.3,
    eta: "2026-10-04",
    recommendation_score: 88,
    why_recommended: "Deep draft Panamax maximized for bulk coal intake at Ennore & Chennai coal berths.",
    image_url: "/madrid-maersk.jpg",
    owner_operator: "Glory Ocean Lines"
  }
];

export const MOCK_CHARTER_RECOMMENDATIONS = [
  {
    id: 1,
    vessel_id: 1,
    vessel_name: "MV Coromandel Star",
    vessel_type: "Supramax (57.8k DWT)",
    dwt: 57800,
    daily_hire_rate: 14200,
    overall_score: 96,
    projected_total_cost_usd: 142500,
    estimated_savings_usd: 18400,
    confidence_level: 95,
    recommended_reason: "Best fuel economy on the Singapore → Visakhapatnam corridor with prompt laycan availability.",
    image_url: "/madrid-maersk.jpg"
  },
  {
    id: 2,
    vessel_id: 2,
    vessel_name: "MV Bay Voyager",
    vessel_type: "Ultramax (63.5k DWT)",
    dwt: 63500,
    daily_hire_rate: 15600,
    overall_score: 91,
    projected_total_cost_usd: 158200,
    estimated_savings_usd: 12100,
    confidence_level: 92,
    recommended_reason: "High deadweight capacity allows 10% more cargo intake per dollar of canal tolls.",
    image_url: "/madrid-maersk.jpg"
  }
];

export const MOCK_PROCUREMENT = {
  total_demand_mt: 1240000,
  procurement_planned_mt: 980000,
  estimated_total_cost_usd: 108500000,
  average_price_per_ton: 87.50,
  potential_savings_usd: 3850000,
  top_suppliers: [
    {
      name: "Kalimantan Coal Resources", country: "Indonesia", commodity: "Thermal Coal",
      reliability_score: 98.2, fob_price_per_ton: 72.40, port_loading_speed_tpd: 45000,
      moisture_grade: "GAR 4200 / TM 18%", lead_time_days: 12
    },
    {
      name: "BHP Queensland Coal", country: "Australia", commodity: "Coking Coal",
      reliability_score: 99.1, fob_price_per_ton: 184.00, port_loading_speed_tpd: 60000,
      moisture_grade: "LV HCC / Ash 9.5%", lead_time_days: 18
    },
    {
      name: "Odisha Mining Corp", country: "India", commodity: "Iron Ore 62% Fe",
      reliability_score: 96.4, fob_price_per_ton: 104.20, port_loading_speed_tpd: 35000,
      moisture_grade: "Fe 62% / Al 2.1%", lead_time_days: 8
    },
    {
      name: "OCP Morocco", country: "Morocco", commodity: "Rock Phosphate",
      reliability_score: 94.7, fob_price_per_ton: 142.00, port_loading_speed_tpd: 25000,
      moisture_grade: "P2O5 32% / Cd 12ppm", lead_time_days: 22
    }
  ],
  upcoming_plans: [
    {
      id: 1, plan_code: "PRC-2026-001", commodity: "Thermal Coal",
      origin: "Indonesia (Kalimantan)", destination: "Visakhapatnam",
      supplier_name: "Kalimantan Coal Resources",
      quantity_mt: 65000, delivery_window: "Oct 5–12, 2026",
      fob_price: 72.40, freight_rate: 22.80,
      total_cost_usd: 6142000, projected_savings_usd: 480000,
      status: "Active", ai_recommendation_reason: "Optimal buy window — thermal coal prices at 3-month low."
    },
    {
      id: 2, plan_code: "PRC-2026-002", commodity: "Iron Ore Pellets",
      origin: "Paradip", destination: "Guangzhou (China)",
      supplier_name: "Odisha Mining Corp",
      quantity_mt: 55000, delivery_window: "Nov 1–8, 2026",
      fob_price: 104.20, freight_rate: 19.50,
      total_cost_usd: 6803500, projected_savings_usd: 320000,
      status: "Planned", ai_recommendation_reason: "Spot price below 30-day average. Forward hedge recommended."
    }
  ],
  demand_trends: [
    { month: "May", demand_mt: 95000, avg_price_usd: 78.20, forecast_price_usd: 79.50 },
    { month: "Jun", demand_mt: 102000, avg_price_usd: 76.80, forecast_price_usd: 77.20 },
    { month: "Jul", demand_mt: 98000, avg_price_usd: 75.40, forecast_price_usd: 75.90 },
    { month: "Aug", demand_mt: 110000, avg_price_usd: 74.10, forecast_price_usd: 73.80 },
    { month: "Sep", demand_mt: 115000, avg_price_usd: 73.20, forecast_price_usd: 72.60 },
    { month: "Oct", demand_mt: 120000, avg_price_usd: 72.40, forecast_price_usd: 71.80 },
    { month: "Nov", demand_mt: 118000, avg_price_usd: null, forecast_price_usd: 71.20 },
    { month: "Dec", demand_mt: 125000, avg_price_usd: null, forecast_price_usd: 70.80 }
  ],
  ai_recommendations: [
    { title: "Accelerate Thermal Coal Purchase", metric: "Save $480k", detail: "Prices at 3-month low — optimal buy window closes in 8 days.", type: "buy" },
    { title: "Hedge Iron Ore Forward", metric: "Lock $104.20/MT", detail: "Forecast shows +4.1% price increase in Nov–Dec due to Indian election demand surge.", type: "hedge" }
  ]
};

export const MOCK_PORTS = [
  {
    id: 1, name: "Visakhapatnam", code: "INVTZ", country: "India", region: "East Coast India",
    latitude: 17.6868, longitude: 83.2185,
    draft_depth_m: 16.5, berths: 24, avg_handling_time_hours: 36, congestion_index: 18,
    waiting_time_days: 1.5, status: "Operational"
  },
  {
    id: 2, name: "Chennai", code: "INMAA", country: "India", region: "East Coast India",
    latitude: 13.0827, longitude: 80.2707,
    draft_depth_m: 15.0, berths: 32, avg_handling_time_hours: 42, congestion_index: 24,
    waiting_time_days: 2.0, status: "Congested"
  },
  {
    id: 3, name: "Paradip", code: "INPAT", country: "India", region: "East Coast India",
    latitude: 20.2644, longitude: 86.6083,
    draft_depth_m: 17.0, berths: 16, avg_handling_time_hours: 30, congestion_index: 32,
    waiting_time_days: 2.5, status: "Congested"
  },
  {
    id: 4, name: "Kolkata / Haldia", code: "INHAL", country: "India", region: "East Coast India",
    latitude: 22.0620, longitude: 88.0830,
    draft_depth_m: 12.0, berths: 18, avg_handling_time_hours: 56, congestion_index: 40,
    waiting_time_days: 3.5, status: "Congested"
  },
  {
    id: 5, name: "Kakinada", code: "INKAK", country: "India", region: "East Coast India",
    latitude: 16.9891, longitude: 82.2475,
    draft_depth_m: 14.0, berths: 10, avg_handling_time_hours: 28, congestion_index: 14,
    waiting_time_days: 1.0, status: "Operational"
  },
  {
    id: 6, name: "Singapore", code: "SGSIN", country: "Singapore", region: "SE Asia",
    latitude: 1.29027, longitude: 103.8519,
    draft_depth_m: 20.0, berths: 55, avg_handling_time_hours: 18, congestion_index: 12,
    waiting_time_days: 0.5, status: "Operational"
  }
];

export const MOCK_ROUTE_OPTIMIZATION = {
  origin: "Singapore",
  destination: "Visakhapatnam",
  best_route: {
    route_id: 1,
    route_name: "Great Circle via Malacca Strait",
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    label: "Balanced Optimal",
    distance_nm: 1620,
    transit_time_days: 5.1,
    bunker_fuel_mt: 123,
    total_cost_usd: 121500,
    savings_usd: 8400,
    co2_emissions_mt: 310,
    weather_risk: "Low (Monsoon Tail)",
    waypoints: [[1.29, 103.85], [5.5, 99.0], [10.0, 87.5], [17.69, 83.22]] as [number, number][]
  },
  lowest_cost_route: {
    route_id: 2,
    route_name: "Eco-Steaming via Nicobar Channel",
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    label: "Eco-Steaming Lane",
    distance_nm: 1720,
    transit_time_days: 6.2,
    bunker_fuel_mt: 104,
    total_cost_usd: 109200,
    savings_usd: 12300,
    co2_emissions_mt: 265,
    weather_risk: "Very Low",
    waypoints: [[1.29, 103.85], [4.0, 97.0], [9.5, 88.0], [17.69, 83.22]] as [number, number][]
  },
  fastest_route: {
    route_id: 3,
    route_name: "Express Passage via Malacca North",
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    label: "Express Passage",
    distance_nm: 1580,
    transit_time_days: 4.4,
    bunker_fuel_mt: 148,
    total_cost_usd: 136800,
    savings_usd: 0,
    co2_emissions_mt: 374,
    weather_risk: "Moderate (Strong SW)",
    waypoints: [[1.29, 103.85], [6.5, 100.5], [12.0, 89.0], [17.69, 83.22]] as [number, number][]
  },
  lowest_emissions_route: {
    route_id: 4,
    route_name: "Green Lane via Andaman Sea",
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    label: "Lowest Carbon (CII A)",
    distance_nm: 1800,
    transit_time_days: 7.0,
    bunker_fuel_mt: 89,
    total_cost_usd: 98600,
    savings_usd: 22900,
    co2_emissions_mt: 226,
    weather_risk: "Low (Tail Wind)",
    waypoints: [[1.29, 103.85], [3.0, 96.0], [8.0, 86.0], [13.5, 82.0], [17.69, 83.22]] as [number, number][]
  },
  available_ports: MOCK_PORTS
};

export const MOCK_INSIGHTS = {
  key_insights: [
    {
      id: 1,
      title: "Freight Rate Softening on East Coast India Corridors",
      impact: "High",
      confidence: 93,
      reason: "Baltic Dry Index easing by 4.1% week-on-week driven by Capesize oversupply in the Pacific. East Coast India Supramax spot rates expected to decline $0.80–$1.20/MT over 30 days.",
      recommended_action: "Delay spot fixture bookings by 10–14 days to capture lower prevailing rates on Singapore → Visakhapatnam coal corridor."
    },
    {
      id: 2,
      title: "Optimal Bunker Window: Singapore VLSFO at 6-Month Low",
      impact: "High",
      confidence: 88,
      reason: "Singapore VLSFO index has declined to $585/MT — the lowest level since April 2026 — following crude oil inventory build and easing refinery margins in SE Asia.",
      recommended_action: "Bunker vessels inbound to Singapore at current prices. Lock 500 MT stem at $585/MT for outbound Singapore–Visakhapatnam fixtures."
    },
    {
      id: 3,
      title: "Paradip Port Draft Restriction Alert",
      impact: "Medium",
      confidence: 97,
      reason: "Dredging operations at Channel South berths will temporarily restrict maximum Cape draft to 16.2m for approximately 10 days beginning Oct 5, 2026.",
      recommended_action: "Route Panamax vessels (max 14.2m draft) to Paradip. Defer Capesize fixtures until dredging clears on or around Oct 15."
    },
    {
      id: 4,
      title: "Forward Hedging Opportunity on Fertilizer Routes",
      impact: "Medium",
      confidence: 84,
      reason: "Fujairah → Chennai fertilizer freight rates are trending upward (+3.0%) driven by seasonal demand. Locking a 60-day forward rate now is projected to save $1.80/MT vs spot.",
      recommended_action: "Execute forward charter fixture for 45,000 MT fertilizer cargo from Fujairah to Chennai. Target Handymax at $19.80/MT."
    }
  ],
  market_trends: {
    bdi_direction: "↓ Softening (BDI –4.1% WoW)",
    fuel_index: "$585 / MT VLSFO (↓ 3.4%)",
    fleet_supply: "Supramax Oversupply +8.2% vs Demand",
    port_bottlenecks: "Paradip & Kolkata Elevated (32–40 Index)"
  },
  risk_analysis: [
    { corridor: "Singapore → Visakhapatnam", factor: "Monsoon tail-wind transitioning — sea state may rise to 3–4 in Bay of Bengal after Oct 10.", risk_level: "Moderate" },
    { corridor: "Newcastle → Paradip", factor: "Paradip draft restriction (dredging Oct 5–15) limits Cape intake by 15%.", risk_level: "Elevated" },
    { corridor: "Fujairah → Chennai", factor: "Arabian Sea weather window favourable. Low piracy risk in current patrol zone.", risk_level: "Low" },
    { corridor: "Guangzhou → Kolkata", factor: "Hooghly River draft tidal constraint capping Panamax DWT intake at 70k MT.", risk_level: "Moderate" }
  ]
};

export const MOCK_ASSIGNMENTS = [
  {
    id: 101,
    user_id: 1,
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    cargo_type: "Thermal Coal",
    quantity_mt: 55000,
    laycan_start: "2026-10-05",
    laycan_end: "2026-10-12",
    vessel_type: "Supramax (57k DWT)",
    status: "active",
    notes: "Coordinate pre-arrival discharge paperwork with Visakhapatnam port agency 48h prior.",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
    route: {
      origin: { name: "Singapore" },
      destination: { name: "Visakhapatnam" }
    }
  },
  {
    id: 102,
    user_id: 1,
    origin_port: "Newcastle (Australia)",
    destination_port: "Paradip",
    cargo_type: "Coking Coal",
    quantity_mt: 75000,
    laycan_start: "2026-10-15",
    laycan_end: "2026-10-22",
    vessel_type: "Panamax (76k DWT)",
    status: "updated",
    notes: "Laycan window extended by 3 days following Australian load berth re-sequencing.",
    created_at: "2026-09-28T08:00:00Z",
    updated_at: "2026-10-01T11:30:00Z",
    route: {
      origin: { name: "Newcastle" },
      destination: { name: "Paradip" }
    }
  },
  {
    id: 103,
    user_id: 1,
    origin_port: "Fujairah (UAE)",
    destination_port: "Chennai",
    cargo_type: "Fertilizer",
    quantity_mt: 45000,
    laycan_start: "2026-10-20",
    laycan_end: "2026-10-27",
    vessel_type: "Handymax (45k DWT)",
    status: "active",
    notes: "Bagged discharge alongside Chennai Inner Harbour berth 3.",
    created_at: "2026-09-29T14:00:00Z",
    updated_at: "2026-09-29T14:00:00Z",
    route: {
      origin: { name: "Fujairah" },
      destination: { name: "Chennai" }
    }
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Voyage Assignment #101 Active",
    body: "Your voyage assignment for 55,000 MT Thermal Coal from Singapore to Visakhapatnam is active.",
    type: "assignment_new",
    is_read: false,
    created_at: "2026-10-01T12:00:00Z"
  },
  {
    id: 2,
    title: "Laycan Update for Assignment #102",
    body: "Fleet operations updated the laycan window for Newcastle → Paradip coking coal shipment.",
    type: "assignment_updated",
    is_read: false,
    created_at: "2026-10-01T11:30:00Z"
  },
  {
    id: 3,
    title: "Market Insight Alert",
    body: "Autoregressive ML model flagged a 6.5% freight softening window for East Coast ports.",
    type: "message",
    is_read: true,
    created_at: "2026-09-30T16:00:00Z"
  }
];

export const MOCK_MESSAGES_THREADS = [
  {
    thread_user_id: 1,
    full_name: "Priya Sharma",
    email: "user@freight-intel.com",
    role: "user",
    last_message: "Noted on the laycan update for MV Coromandel Star. Discharging agent alerted.",
    last_message_time: "2026-10-01T12:15:00Z",
    unread_count: 0
  }
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    sender_id: 2,
    recipient_id: 1,
    body: "Welcome to freight-intel. Your voyage fixtures for East Coast India are loaded under My Assignments.",
    created_at: "2026-10-01T09:00:00Z",
    sender_name: "Captain R. K. Nair"
  },
  {
    id: 2,
    sender_id: 1,
    recipient_id: 2,
    body: "Thank you Captain. Confirmed review of Singapore → Visakhapatnam 55k MT Coal fixture.",
    created_at: "2026-10-01T10:15:00Z",
    sender_name: "Priya Sharma"
  },
  {
    id: 3,
    sender_id: 2,
    recipient_id: 1,
    body: "Noted. Vessel MV Coromandel Star is arriving prompt at Singapore OPL with clear holds.",
    created_at: "2026-10-01T11:45:00Z",
    sender_name: "Captain R. K. Nair"
  }
];

export const MOCK_EMERGENCIES = [
  {
    id: 1,
    category: "severe_weather",
    severity: "medium",
    location: "Bay of Bengal (15.2N, 84.5E)",
    message: "Tropical depression developing east of Chennai. Tonnage instructed to maintain 50nm safe corridor.",
    status: "acknowledged",
    created_at: "2026-10-01T08:30:00Z"
  }
];

export const MOCK_ADMIN_OVERVIEW = {
  kpis: {
    total_users: 2,
    active_users: 2,
    vessels: 55,
    ports: 22,
    routes: 54,
    api_calls: 14205,
    uptime: "99.98%"
  },
  ml_monitoring: {
    model_type: "GradientBoostingRegressor (v2.4)",
    mae: 0.68,
    rmse: 0.89,
    r2_score: 0.93,
    data_drift: "Nominal (<1.8%)"
  }
};

export const MOCK_ADMIN_USERS = [
  {
    id: 1,
    full_name: "Priya Sharma",
    email: "user@freight-intel.com",
    organization: "Coromandel Bulk Carriers",
    role: "user",
    role_name: "Charterer",
    is_admin: false,
    is_active: true,
    created_at: "2026-01-15T00:00:00Z"
  },
  {
    id: 2,
    full_name: "Captain R. K. Nair",
    email: "admin@freight-intel.com",
    organization: "freight-intel Operations",
    role: "admin",
    role_name: "Fleet Administrator",
    is_admin: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z"
  }
];

export const MOCK_CONTRACTS = [
  {
    id: 1,
    name: "Q4 Thermal Coal Supply Agreement",
    structure: "consecutive_voyages",
    origin_port: "Singapore",
    destination_port: "Visakhapatnam",
    cargo_type: "Thermal Coal",
    total_quantity_mt: 220000,
    period_start: "2026-10-01",
    period_end: "2026-12-31",
    voyages: [
      { sequence: 1, laycan_start: "2026-10-05", laycan_end: "2026-10-12", quantity_mt: 55000, status: "scheduled" },
      { sequence: 2, laycan_start: "2026-10-25", laycan_end: "2026-11-01", quantity_mt: 55000, status: "scheduled" },
      { sequence: 3, laycan_start: "2026-11-15", laycan_end: "2026-11-22", quantity_mt: 55000, status: "scheduled" },
      { sequence: 4, laycan_start: "2026-12-05", laycan_end: "2026-12-12", quantity_mt: 55000, status: "scheduled" }
    ]
  }
];

export const MOCK_REPORTS = [
  {
    id: 1,
    title: "East Coast India Q3 Freight Rate Review",
    report_type: "Market Analysis",
    date: "2026-09-30",
    file_format: "PDF",
    size: "2.4 MB"
  },
  {
    id: 2,
    title: "Voyage Bunker Fuel & Emissions Ledger",
    report_type: "Operational Report",
    date: "2026-10-01",
    file_format: "CSV",
    size: "640 KB"
  }
];
