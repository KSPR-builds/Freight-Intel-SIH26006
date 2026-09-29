const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("freightiq_token") : null;

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
        localStorage.removeItem("freightiq_token");
        localStorage.removeItem("freightiq_role");
        localStorage.removeItem("freightiq_name");
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
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
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
