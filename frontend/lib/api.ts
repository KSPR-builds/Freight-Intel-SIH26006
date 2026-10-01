import * as mockData from "./mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("freightiq_token") : null;

  // In DEMO MODE, intercept network requests that would fail on Vercel and serve mock data
  if (IS_DEMO) {
    const mock = getMockResponse<T>(endpoint, options);
    if (mock !== undefined) {
      return mock;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        if (!IS_DEMO) {
          localStorage.removeItem("freightiq_token");
          localStorage.removeItem("freightiq_role");
          localStorage.removeItem("freightiq_name");
        }
      }
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      let detailMsg = errData.detail;
      if (typeof detailMsg === "object" && detailMsg !== null) {
        if (Array.isArray(detailMsg)) {
          detailMsg = detailMsg.map((err: any) => `${err.loc?.join(".") || "field"}: ${err.msg}`).join(", ");
        } else {
          detailMsg = JSON.stringify(detailMsg);
        }
      }
      throw new Error(detailMsg ? `${res.status}: ${detailMsg}` : `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API unavailable on ${endpoint}:`, err.message);

    // If offline or on Vercel without backend, gracefully fallback to mock data
    const fallback = getMockResponse<T>(endpoint, options);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

// Helper to provide seamless mock data matching all endpoints
function getMockResponse<T>(endpoint: string, options: RequestInit = {}): T | undefined {
  const [cleanEndpoint] = endpoint.split("?");

  if (cleanEndpoint === "/api/auth/me") {
    const role = typeof window !== "undefined" ? localStorage.getItem("freightiq_role") : "user";
    return (role === "admin" ? mockData.MOCK_ADMIN_USER : mockData.MOCK_CURRENT_USER) as unknown as T;
  }

  if (cleanEndpoint === "/api/dashboard") {
    return mockData.MOCK_DASHBOARD as unknown as T;
  }

  if (cleanEndpoint === "/api/forecast") {
    return mockData.MOCK_FORECAST as unknown as T;
  }

  if (cleanEndpoint === "/api/forecast/history") {
    return mockData.MOCK_FORECAST.chart_data as unknown as T;
  }

  if (cleanEndpoint === "/api/vessels") {
    return mockData.MOCK_VESSELS as unknown as T;
  }

  if (cleanEndpoint.startsWith("/api/vessels/")) {
    const id = parseInt(cleanEndpoint.split("/").pop() || "1", 10);
    const vessel = mockData.MOCK_VESSELS.find(v => v.id === id) || mockData.MOCK_VESSELS[0];
    return vessel as unknown as T;
  }

  if (cleanEndpoint === "/api/chartering/recommend") {
    return mockData.MOCK_CHARTER_RECOMMENDATIONS as unknown as T;
  }

  if (cleanEndpoint === "/api/chartering/book") {
    return { success: true, booking_id: "BK-DEMO-9081", status: "confirmed" } as unknown as T;
  }

  if (cleanEndpoint === "/api/procurement") {
    return mockData.MOCK_PROCUREMENT as unknown as T;
  }

  if (cleanEndpoint === "/api/procurement/plan") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return { id: Date.now(), ...body, status: "Active" } as unknown as T;
  }

  if (cleanEndpoint === "/api/ports") {
    return mockData.MOCK_PORTS as unknown as T;
  }

  if (cleanEndpoint === "/api/routes/optimize") {
    return mockData.MOCK_ROUTE_OPTIMIZATION as unknown as T;
  }

  if (cleanEndpoint === "/api/insights") {
    return mockData.MOCK_INSIGHTS as unknown as T;
  }

  if (cleanEndpoint === "/api/insights/ask") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return {
      answer: `AI Analysis for "${body.query || "maritime enquiry"}": Freight rates on East Coast India corridors indicate softening spot fixtures with favorable chartering windows across Singapore-Visakhapatnam routes.`,
      metrics: [
        { label: "Target Spot", value: "$21.32 / MT" },
        { label: "Confidence", value: "93.8%" }
      ],
      reasoning_summary: "Calculated with autoregressive gradient boosting incorporating Newcastle & Kalimantan origin fuel burn indices.",
      recommended_action: "Prompt fixture booking recommended to lock forward discount."
    } as unknown as T;
  }

  if (cleanEndpoint === "/api/insights/prompts") {
    return [
      "What is the current freight rate to Chennai?",
      "Which vessel is cheapest for iron ore?",
      "Which route has the lowest total cost?",
      "When should I charter a vessel?",
      "How much cargo should I procure?"
    ] as unknown as T;
  }

  if (cleanEndpoint === "/api/reports") {
    return mockData.MOCK_REPORTS as unknown as T;
  }

  if (cleanEndpoint === "/api/reports/notifications") {
    return mockData.MOCK_NOTIFICATIONS as unknown as T;
  }

  if (cleanEndpoint === "/api/admin/overview") {
    return mockData.MOCK_ADMIN_OVERVIEW as unknown as T;
  }

  if (cleanEndpoint === "/api/admin/users") {
    return mockData.MOCK_ADMIN_USERS as unknown as T;
  }

  if (cleanEndpoint.startsWith("/api/admin/users/")) {
    if (options.method === "DELETE") {
      return { success: true } as unknown as T;
    }
    const body = options.body ? JSON.parse(options.body as string) : {};
    const { id: _id, ...restUser } = mockData.MOCK_CURRENT_USER;
    return { id: 1, ...restUser, ...body } as unknown as T;
  }

  if (cleanEndpoint === "/api/health") {
    return { status: "healthy", database: "connected (demo)", latency_ms: 1.2 } as unknown as T;
  }

  if (cleanEndpoint === "/api/assignments") {
    if (options.method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      return { id: Date.now(), ...body, status: "active", created_at: new Date().toISOString() } as unknown as T;
    }
    return mockData.MOCK_ASSIGNMENTS as unknown as T;
  }

  if (cleanEndpoint.startsWith("/api/assignments/")) {
    const id = parseInt(cleanEndpoint.split("/").pop() || "101", 10);
    const item = mockData.MOCK_ASSIGNMENTS.find(a => a.id === id) || mockData.MOCK_ASSIGNMENTS[0];
    return item as unknown as T;
  }

  if (cleanEndpoint === "/api/notifications") {
    return mockData.MOCK_NOTIFICATIONS as unknown as T;
  }

  if (cleanEndpoint === "/api/notifications/unread-count") {
    return { unread_count: 2 } as unknown as T;
  }

  if (cleanEndpoint === "/api/notifications/read" || cleanEndpoint === "/api/notifications/read-all") {
    return { success: true } as unknown as T;
  }

  if (cleanEndpoint === "/api/messages/unread-count") {
    return { unread_count: 1 } as unknown as T;
  }

  if (cleanEndpoint === "/api/messages/threads/summary") {
    return mockData.MOCK_MESSAGES_THREADS as unknown as T;
  }

  if (cleanEndpoint.startsWith("/api/messages/")) {
    return mockData.MOCK_MESSAGES as unknown as T;
  }

  if (cleanEndpoint === "/api/messages") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return {
      id: Date.now(),
      sender_id: 1,
      recipient_id: 2,
      body: body.body || "",
      created_at: new Date().toISOString(),
      sender_name: "Priya Sharma"
    } as unknown as T;
  }

  if (cleanEndpoint === "/api/emergencies") {
    if (options.method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      return { id: Date.now(), ...body, status: "reported", created_at: new Date().toISOString() } as unknown as T;
    }
    return mockData.MOCK_EMERGENCIES as unknown as T;
  }

  if (cleanEndpoint === "/api/emergencies/open-count") {
    return { open_count: 1 } as unknown as T;
  }

  if (cleanEndpoint.startsWith("/api/emergencies/")) {
    return { success: true } as unknown as T;
  }

  if (cleanEndpoint === "/api/contracts/simulate") {
    return {
      name: "Simulated Contract",
      structure: "consecutive_voyages",
      origin_port: "Singapore",
      destination_port: "Visakhapatnam",
      cargo_type: "Coal",
      total_quantity_mt: 250000,
      total_cost_usd: 5400000,
      rate_per_mt: 21.60,
      voyages: [
        { sequence: 1, laycan_start: "2026-10-05", laycan_end: "2026-10-12", quantity_mt: 55000, status: "scheduled" },
        { sequence: 2, laycan_start: "2026-10-25", laycan_end: "2026-11-01", quantity_mt: 55000, status: "scheduled" },
        { sequence: 3, laycan_start: "2026-11-15", laycan_end: "2026-11-22", quantity_mt: 55000, status: "scheduled" }
      ]
    } as unknown as T;
  }

  if (cleanEndpoint === "/api/contracts" || cleanEndpoint === "/api/contracts/user") {
    return mockData.MOCK_CONTRACTS as unknown as T;
  }

  return undefined;
}

export const api = {
  // Auth
  login: (email: string, password: string, isAdmin: boolean = false) =>
    fetchApi<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, is_admin_login: isAdmin })
    }),

  getCurrentUser: () => fetchApi<any>("/api/auth/me"),

  // Dashboard
  getDashboard: () => fetchApi<any>("/api/dashboard"),

  // Forecasting
  getForecast: (params: { origin_port: string; destination_port: string; cargo_type: string; vessel_type: string; horizon_days: number }) => {
    const query = new URLSearchParams({
      origin_port: params.origin_port,
      destination_port: params.destination_port,
      cargo_type: params.cargo_type,
      vessel_type: params.vessel_type,
      horizon_days: params.horizon_days.toString()
    });
    return fetchApi<any>(`/api/forecast?${query.toString()}`);
  },

  getForecastHistory: () => fetchApi<any>("/api/forecast/history"),

  // Vessels
  getVessels: (params?: { vessel_type?: string; availability?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.vessel_type && params.vessel_type !== "All") query.append("vessel_type", params.vessel_type);
    if (params?.availability && params.availability !== "All") query.append("availability", params.availability);
    if (params?.search) query.append("search", params.search);
    return fetchApi<any>(`/api/vessels?${query.toString()}`);
  },

  getVesselDetails: (id: number) => fetchApi<any>(`/api/vessels/${id}`),

  // Chartering
  getCharterRecommendations: (corridor?: string, cargo?: string) => {
    const query = new URLSearchParams();
    if (corridor) query.append("corridor", corridor);
    if (cargo) query.append("cargo_type", cargo);
    return fetchApi<any>(`/api/chartering/recommend?${query.toString()}`);
  },

  bookCharter: (payload: any) =>
    fetchApi<any>("/api/chartering/book", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Procurement
  getProcurementOverview: () => fetchApi<any>("/api/procurement"),

  createProcurementPlan: (payload: any) =>
    fetchApi<any>("/api/procurement/plan", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Ports & Routes
  getPorts: (region?: string) => {
    const query = region ? `?region=${region}` : "";
    return fetchApi<any>(`/api/ports${query}`);
  },

  getOptimizedRoute: (origin: string, destination: string) => {
    const query = new URLSearchParams({ origin, destination });
    return fetchApi<any>(`/api/routes/optimize?${query.toString()}`);
  },

  // Insights & Assistant
  getInsights: () => fetchApi<any>("/api/insights"),

  askAssistant: (query: string) =>
    fetchApi<any>("/api/insights/ask", {
      method: "POST",
      body: JSON.stringify({ query })
    }),

  getAssistantPrompts: () => fetchApi<string[]>("/api/insights/prompts"),

  // Reports
  getReports: (params?: { report_type?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.report_type && params.report_type !== "All") query.append("report_type", params.report_type);
    if (params?.search) query.append("search", params.search);
    return fetchApi<any>(`/api/reports?${query.toString()}`);
  },

  getNotifications: () => fetchApi<any>("/api/reports/notifications"),

  // Admin
  getAdminOverview: () => fetchApi<any>("/api/admin/overview"),
  getAdminUsers: () => fetchApi<any>("/api/admin/users"),
  updateAdminUser: (userId: number, payload: any) =>
    fetchApi<any>(`/api/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  createAdminUser: (payload: any) =>
    fetchApi<any>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  deleteAdminUser: (userId: number) =>
    fetchApi<any>(`/api/admin/users/${userId}`, {
      method: "DELETE"
    }),

  // Health
  getHealth: () => fetchApi<any>("/api/health"),

  // ── Assignments ─────────────────────────────────────────────────────────
  getAssignments: (statusFilter?: string) => {
    const q = statusFilter ? `?status=${statusFilter}` : "";
    return fetchApi<any[]>(`/api/assignments${q}`);
  },
  getAssignment: (id: number) => fetchApi<any>(`/api/assignments/${id}`),
  createAssignment: (payload: any) =>
    fetchApi<any>("/api/assignments", { method: "POST", body: JSON.stringify(payload) }),
  updateAssignment: (id: number, payload: any) =>
    fetchApi<any>(`/api/assignments/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  cancelAssignment: (id: number) =>
    fetchApi<void>(`/api/assignments/${id}`, { method: "DELETE" }),
  exportAssignments: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("freightiq_token") : null;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${base}/api/assignments/export`;
    const a = document.createElement("a");
    a.href = url;
    if (token) {
      // Use fetch with auth then blob-download
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.blob())
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = "my_assignments_export.csv";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        });
    }
  },

  // ── User Notifications ───────────────────────────────────────────────────
  getUserNotifications: () => fetchApi<any[]>("/api/notifications"),
  getUnreadCount: () => fetchApi<{ unread_count: number }>("/api/notifications/unread-count"),
  markNotificationsRead: (ids: number[]) =>
    fetchApi<void>("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ notification_ids: ids }),
    }),
  markAllNotificationsRead: () =>
    fetchApi<void>("/api/notifications/read-all", { method: "POST" }),

  // ── Messages ─────────────────────────────────────────────────────────────
  getUnreadMessageCount: () => fetchApi<{ unread_count: number }>("/api/messages/unread-count"),
  getMessageThread: (threadUserId: number) =>
    fetchApi<any[]>(`/api/messages/${threadUserId}`),
  getMessageThreads: () => fetchApi<any[]>("/api/messages/threads/summary"),
  sendMessage: (threadUserId: number, body: string) =>
    fetchApi<any>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ thread_user_id: threadUserId, body }),
    }),
  markThreadRead: (threadUserId: number) =>
    fetchApi<void>(`/api/messages/${threadUserId}/read`, { method: "POST" }),

  // ── Emergencies ───────────────────────────────────────────────────────────
  getEmergencies: () => fetchApi<any[]>("/api/emergencies"),
  getOpenEmergenciesCount: () => fetchApi<{ open_count: number }>("/api/emergencies/open-count"),
  getEmergency: (id: number) => fetchApi<any>(`/api/emergencies/${id}`),
  fileEmergency: (payload: { category: string; severity: string; location?: string; message: string }) =>
    fetchApi<any>("/api/emergencies", { method: "POST", body: JSON.stringify(payload) }),
  acknowledgeEmergency: (id: number) =>
    fetchApi<any>(`/api/emergencies/${id}/acknowledge`, { method: "PATCH" }),
  resolveEmergency: (id: number) =>
    fetchApi<any>(`/api/emergencies/${id}/resolve`, { method: "PATCH" }),

  // ── Contract Planner ──────────────────────────────────────────────────────
  simulateContract: (payload: any) =>
    fetchApi<any>("/api/contracts/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createContract: (payload: any) =>
    fetchApi<any>("/api/contracts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUserContracts: () => fetchApi<any[]>("/api/contracts/user"),
  getUsers: () => fetchApi<any[]>("/api/admin/users"),
};
