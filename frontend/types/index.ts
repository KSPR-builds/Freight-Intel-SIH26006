export interface User {
  id: number;
  email: string;
  full_name: string;
  organization: string;
  role_name: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface KPICardData {
  title: string;
  value: string;
  numeric_value: number;
  change_text: string;
  change_type: "positive" | "negative" | "neutral";
  icon: string;
}

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  vessel_type: string;
  dwt: number;
  built_year: number;
  length_overall_m: number;
  beam_m: number;
  draft_m: number;
  flag: string;
  classification_society: string;
  main_engine: string;
  service_speed_knots: number;
  fuel_consumption_tpd: number;
  daily_hire_rate: number;
  availability_status: string;
  current_position_name: string;
  current_lat: number;
  current_lng: number;
  eta: string;
  recommendation_score: number;
  why_recommended: string;
  image_url: string;
  owner_operator: string;
}

export interface CharterRecommendation {
  id: number;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  dwt: number;
  daily_hire_rate: number;
  overall_score: number;
  projected_total_cost_usd: number;
  estimated_savings_usd: number;
  confidence_level: number;
  recommended_reason: string;
  image_url: string;
}

export interface ChartDataPoint {
  date: string;
  historical_rate?: number;
  predicted_rate?: number;
  lower_bound?: number;
  upper_bound?: number;
  is_future: boolean;
}

export interface RouteComparisonItem {
  route_name: string;
  cargo_name: string;
  current_rate: number;
  predicted_rate: number;
  trend_percent: number;
  recommendation: string;
}

export interface ForecastResponse {
  origin_port: string;
  destination_port: string;
  cargo_type: string;
  vessel_type: string;
  horizon_days: number;
  current_rate: number;
  predicted_rate: number;
  trend: string;
  trend_percent: number;
  volatility: number;
  confidence_score: number;
  mae: number;
  rmse: number;
  r2_score: number;
  model_name: string;
  ai_insight: string;
  chart_data: ChartDataPoint[];
  route_comparisons: RouteComparisonItem[];
}

export interface PortInfo {
  id: number;
  name: string;
  code: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  draft_depth_m: number;
  berths: number;
  avg_handling_time_hours: number;
  congestion_index: number;
  waiting_time_days: number;
  status: string;
}

export interface RouteOption {
  route_id: number;
  route_name: string;
  origin_port: string;
  destination_port: string;
  label: string;
  distance_nm: number;
  transit_time_days: number;
  bunker_fuel_mt: number;
  total_cost_usd: number;
  savings_usd: number;
  co2_emissions_mt: number;
  weather_risk: string;
  waypoints: [number, number][];
}

export interface RouteOptimizationResponse {
  origin: string;
  destination: string;
  best_route: RouteOption;
  lowest_cost_route: RouteOption;
  fastest_route: RouteOption;
  lowest_emissions_route: RouteOption;
  available_ports: PortInfo[];
}

export interface SupplierItem {
  name: string;
  country: string;
  commodity: string;
  reliability_score: number;
  fob_price_per_ton: number;
  port_loading_speed_tpd: number;
  moisture_grade: string;
  lead_time_days: number;
}

export interface ProcurementPlanItem {
  id: number;
  plan_code: string;
  commodity: string;
  origin: string;
  destination: string;
  supplier_name: string;
  quantity_mt: number;
  delivery_window: string;
  fob_price: number;
  freight_rate: number;
  total_cost_usd: number;
  projected_savings_usd: number;
  status: string;
  ai_recommendation_reason: string;
}

export interface CommodityDemandTrend {
  month: string;
  demand_mt: number;
  avg_price_usd: number;
  forecast_price_usd: number;
}

export interface ProcurementDashboardResponse {
  total_demand_mt: number;
  procurement_planned_mt: number;
  estimated_total_cost_usd: number;
  average_price_per_ton: number;
  potential_savings_usd: number;
  top_suppliers: SupplierItem[];
  upcoming_plans: ProcurementPlanItem[];
  demand_trends: CommodityDemandTrend[];
  ai_recommendations: { title: string; metric: string; detail: string; type: string }[];
}

export interface ReportItem {
  id: number;
  title: string;
  report_type: string;
  corridor: string;
  commodity: string;
  generated_by: string;
  summary: string;
  file_size_kb: number;
  format: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  severity: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface AssignmentItem {
  id: number;
  user_id: number;
  origin_port: string;
  destination_port: string;
  cargo_type: string;
  quantity_mt: number;
  laycan_start: string;
  laycan_end: string;
  vessel_type: string;
  notes?: string;
  status: "active" | "updated" | "cancelled";
  created_by: number;
  created_at: string;
  updated_at?: string;
}

