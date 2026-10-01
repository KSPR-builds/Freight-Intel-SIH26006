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
  kpis: {
    total_spend: "$24.8M",
    active_contracts: 12,
    avg_unit_cost: "$74.50 / MT",
    hedged_ratio: "68%"
  },
  commodities: [
    { name: "Thermal Coal", price_per_mt: 72.40, trend: "-3.2%", status: "Optimal Buy Window", supplier: "Kalimantan Coal Resources" },
    { name: "Coking Coal", price_per_mt: 184.00, trend: "+1.8%", status: "Forward Hedged", supplier: "BHP Queensland" },
    { name: "Iron Ore 62% Fe", price_per_mt: 104.20, trend: "-1.5%", status: "Spot Buying", supplier: "Odisha Mining Corp" },
    { name: "Rock Phosphate", price_per_mt: 142.00, trend: "+0.4%", status: "Contract Active", supplier: "OCP Morocco" }
  ],
  suppliers: [
    { id: 1, name: "Kalimantan Coal Resources", rating: 4.8, reliability: "98.2%", contract_volume: "450k MT" },
    { id: 2, name: "BHP Queensland Coal", rating: 4.9, reliability: "99.1%", contract_volume: "300k MT" },
    { id: 3, name: "Odisha Mineral Corp", rating: 4.6, reliability: "96.4%", contract_volume: "600k MT" }
  ],
  plans: [
    { id: 1, commodity: "Thermal Coal", quantity_mt: 65000, origin: "Indonesia (Kalimantan)", destination: "Visakhapatnam", period: "Oct 2026", budget: 4800000, status: "Active" },
    { id: 2, commodity: "Iron Ore Pellets", quantity_mt: 55000, origin: "Paradip", destination: "Guangzhou (China)", period: "Nov 2026", budget: 5200000, status: "Planned" }
  ]
};

export const MOCK_PORTS = [
  { id: 1, name: "Visakhapatnam", country: "India", region: "East Coast India", lat: 17.6868, lng: 83.2185, congestion_hours: 18, draft_limit_m: 16.5 },
  { id: 2, name: "Chennai", country: "India", region: "East Coast India", lat: 13.0827, lng: 80.2707, congestion_hours: 24, draft_limit_m: 15.0 },
  { id: 3, name: "Paradip", country: "India", region: "East Coast India", lat: 20.2644, lng: 86.6083, congestion_hours: 32, draft_limit_m: 17.0 },
  { id: 4, name: "Kolkata / Haldia", country: "India", region: "East Coast India", lat: 22.0620, lng: 88.0830, congestion_hours: 40, draft_limit_m: 12.0 },
  { id: 5, name: "Kakinada", country: "India", region: "East Coast India", lat: 16.9891, lng: 82.2475, congestion_hours: 14, draft_limit_m: 14.0 },
  { id: 6, name: "Singapore", country: "Singapore", region: "SE Asia", lat: 1.29027, lng: 103.8519, congestion_hours: 12, draft_limit_m: 20.0 }
];

export const MOCK_ROUTE_OPTIMIZATION = {
  origin: "Singapore",
  destination: "Visakhapatnam",
  distance_nm: 1620,
  estimated_days: 5.1,
  fuel_cost_usd: 48600,
  total_voyage_cost_usd: 121500,
  carbon_footprint_mt: 310,
  best_route: {
    name: "Direct Malacca-Bay of Bengal Great Circle Route",
    distance_nm: 1620,
    eta_days: 5.1,
    fuel_burn_tpd: 24.0,
    bunker_cost: 48600,
    canal_tolls: 0,
    weather_risk: "Low (Monsoon Tail)",
    efficiency_score: 94
  },
  available_ports: MOCK_PORTS
};

export const MOCK_INSIGHTS = {
  market_summary: "East Coast India bulk freight rates are stabilizing following monsoon recovery. Bunker fuel indices in Singapore reflect a 3.4% easing, supporting competitive fixture negotiations.",
  high_priority_alerts: [
    { title: "Paradip Port Draft Maintenance", description: "Dredging operations at Channel South will temporarily cap Cape draft to 16.2m for 10 days.", severity: "warning" },
    { title: "Bunker Price Window", description: "Singapore VLSFO down to $585/MT — optimal bunkering window for inbound tonnage.", severity: "info" }
  ],
  route_recommendations: [
    { corridor: "Singapore → Visakhapatnam", action: "Spot Chartering Recommended", margin: "+7.2% vs benchmark" },
    { corridor: "Newcastle → Paradip", action: "Lock 60-Day Forward Rate", margin: "Hedge $1.80/MT" }
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
