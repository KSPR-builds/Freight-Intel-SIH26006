"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Ship,
  Boxes,
  Calendar,
  User as UserIcon,
  X,
  FileText,
  Clock,
  Check,
  AlertTriangle
} from "lucide-react";

interface ToastState {
  type: "success" | "error";
  message: string;
}

const CARGO_TYPES = [
  "Iron Ore",
  "Coking Coal",
  "Thermal Coal",
  "Bauxite",
  "Fertilizers",
  "Limestone",
  "Grain",
  "Steel Products"
];

const VESSEL_TYPES = [
  "Capesize (120k-200k DWT)",
  "Panamax (65k-85k DWT)",
  "Supramax (50k-65k DWT)",
  "Handymax (35k-50k DWT)",
  "Handysize (10k-35k DWT)",
  "Ultramax (60k-65k DWT)"
];

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification
  const [toast, setToast] = useState<ToastState | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cancel confirmation modal
  const [cancelModalId, setCancelModalId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    user_id: "",
    origin_port: "",
    destination_port: "",
    cargo_type: "Thermal Coal",
    quantity_mt: "55000",
    laycan_start: "",
    laycan_end: "",
    vessel_type: "Panamax (65k-85k DWT)",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignRes, usersRes, portsRes] = await Promise.all([
        api.getAssignments(),
        api.getAdminUsers(),
        api.getPorts()
      ]);
      setAssignments(assignRes || []);
      setUsers(usersRes || []);
      setPorts(portsRes || []);
    } catch (err: any) {
      console.error("Error loading assignments data:", err);
      showToast("error", err.message || "Failed to load assignments list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userMap = useMemo(() => {
    const map: Record<number, any> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Port names list fallback
  const portNames = useMemo(() => {
    if (ports && ports.length > 0) {
      return Array.from(new Set(ports.map((p) => p.name))).sort();
    }
    return [
      "Singapore",
      "Visakhapatnam",
      "Chennai",
      "Paradip",
      "Kolkata",
      "Kakinada",
      "Tanjung Priok",
      "Port Hedland",
      "Fujairah",
      "Richards Bay"
    ];
  }, [ports]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const targetUser = userMap[item.user_id];
      const userName = targetUser?.full_name || targetUser?.email || `User #${item.user_id}`;
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = 
        !searchQuery ||
        userName.toLowerCase().includes(searchLower) ||
        item.origin_port.toLowerCase().includes(searchLower) ||
        item.destination_port.toLowerCase().includes(searchLower) ||
        item.cargo_type.toLowerCase().includes(searchLower) ||
        item.vessel_type.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower));

      return matchesStatus && matchesSearch;
    });
  }, [assignments, statusFilter, searchQuery, userMap]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData({
      user_id: users.length > 0 ? String(users[0].id) : "",
      origin_port: portNames[0] || "Singapore",
      destination_port: portNames[1] || "Visakhapatnam",
      cargo_type: "Thermal Coal",
      quantity_mt: "55000",
      laycan_start: new Date().toISOString().split("T")[0],
      laycan_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      vessel_type: "Panamax (65k-85k DWT)",
      notes: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setEditingId(item.id);
    setFormData({
      user_id: String(item.user_id),
      origin_port: item.origin_port,
      destination_port: item.destination_port,
      cargo_type: item.cargo_type,
      quantity_mt: String(item.quantity_mt),
      laycan_start: item.laycan_start,
      laycan_end: item.laycan_end,
      vessel_type: item.vessel_type,
      notes: item.notes || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.user_id) errors.user_id = "Please select an assigned user.";
    if (!formData.origin_port) errors.origin_port = "Origin port is required.";
    if (!formData.destination_port) errors.destination_port = "Destination port is required.";
    if (formData.origin_port && formData.destination_port && formData.origin_port === formData.destination_port) {
      errors.destination_port = "Destination must be different from Origin.";
    }
    if (!formData.cargo_type) errors.cargo_type = "Cargo type is required.";
    if (!formData.quantity_mt || Number(formData.quantity_mt) <= 0) {
      errors.quantity_mt = "Quantity must be a positive number.";
    }
    if (!formData.laycan_start) errors.laycan_start = "Laycan start date is required.";
    if (!formData.laycan_end) errors.laycan_end = "Laycan end date is required.";
    if (formData.laycan_start && formData.laycan_end) {
      if (new Date(formData.laycan_end) <= new Date(formData.laycan_start)) {
        errors.laycan_end = "Laycan end date must be after laycan start date.";
      }
    }
    if (!formData.vessel_type) errors.vessel_type = "Vessel type is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        user_id: Number(formData.user_id),
        origin_port: formData.origin_port,
        destination_port: formData.destination_port,
        cargo_type: formData.cargo_type,
        quantity_mt: Number(formData.quantity_mt),
        laycan_start: formData.laycan_start,
        laycan_end: formData.laycan_end,
        vessel_type: formData.vessel_type,
        notes: formData.notes.trim() || undefined,
      };

      if (modalMode === "create") {
        await api.createAssignment(payload);
        showToast("success", "Assignment created & notification dispatched to user.");
      } else if (editingId) {
        await api.updateAssignment(editingId, payload);
        showToast("success", "Assignment updated & change notification dispatched to user.");
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Assignment save failed:", err);
      showToast("error", err.message || "Failed to save assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAssignment = async () => {
    if (!cancelModalId) return;
    setIsCancelling(true);
    try {
      await api.cancelAssignment(cancelModalId);
      showToast("success", "Assignment cancelled and cancellation notification logged.");
      setCancelModalId(null);
      await loadData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to cancel assignment.");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "updated":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Updated
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sky-100/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-purple-700" />
              Voyage & Cargo Assignments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Assign bulk cargo fixtures, laycan windows, and route dispatches directly to commercial operators.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs shadow-purple-700/20 hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, route, cargo, vessel..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium shrink-0">Status:</span>
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {["all", "active", "updated", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? "bg-white text-purple-800 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
              <p className="text-xs font-medium">Loading assignments telemetry...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No assignments found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search filters or status selection."
                  : "Click 'New Assignment' above to create and dispatch your first voyage fixture."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Assigned User</th>
                    <th className="px-5 py-3.5">Route</th>
                    <th className="px-5 py-3.5">Cargo & Qty</th>
                    <th className="px-5 py-3.5">Vessel Type</th>
                    <th className="px-5 py-3.5">Laycan Window</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map((item) => {
                    const assignedUser = userMap[item.user_id];
                    const userName = assignedUser?.full_name || assignedUser?.email || `User #${item.user_id}`;
                    const userEmail = assignedUser?.email || "";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{userName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{userEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{item.origin_port}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>{item.destination_port}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{item.cargo_type}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {Number(item.quantity_mt).toLocaleString()} MT
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {item.vessel_type}
                        </td>

                        <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">
                          <div>{item.laycan_start}</div>
                          <div className="text-slate-400 text-[10px]">to {item.laycan_end}</div>
                        </td>

                        <td className="px-5 py-4">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                          {item.updated_at
                            ? new Date(item.updated_at).toLocaleDateString()
                            : item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Edit Assignment"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {item.status !== "cancelled" && (
                              <button
                                onClick={() => setCancelModalId(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Cancel Assignment"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: New / Edit Assignment */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {modalMode === "create" ? "Create New Assignment" : "Edit Assignment"}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {modalMode === "create"
                        ? "Dispatches voyage details & sends notification to user."
                        : "Updates laycan or route and sends update notification."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                {/* Select User */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned User <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                  >
                    <option value="">-- Select User --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email} ({u.role_name} • {u.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.user_id && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.user_id}</p>
                  )}
                </div>

                {/* Ports Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Origin Port <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.origin_port}
                      onChange={(e) => setFormData({ ...formData, origin_port: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    >
                      <option value="">-- Select Origin --</option>
                      {portNames.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {formErrors.origin_port && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.origin_port}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Destination Port <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.destination_port}
                      onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    >
                      <option value="">-- Select Destination --</option>
                      {portNames.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {formErrors.destination_port && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.destination_port}</p>
                    )}
                  </div>
                </div>

                {/* Cargo Type & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cargo Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.cargo_type}
                      onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    >
                      {CARGO_TYPES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {formErrors.cargo_type && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.cargo_type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Quantity (Metric Tons) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_mt}
                      onChange={(e) => setFormData({ ...formData, quantity_mt: e.target.value })}
                      placeholder="e.g. 55000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    />
                    {formErrors.quantity_mt && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.quantity_mt}</p>
                    )}
                  </div>
                </div>

                {/* Laycan Start & End */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Laycan Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.laycan_start}
                      onChange={(e) => setFormData({ ...formData, laycan_start: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    />
                    {formErrors.laycan_start && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.laycan_start}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Laycan End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.laycan_end}
                      onChange={(e) => setFormData({ ...formData, laycan_end: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    />
                    {formErrors.laycan_end && (
                      <p className="text-rose-600 text-[11px] mt-1">{formErrors.laycan_end}</p>
                    )}
                  </div>
                </div>

                {/* Vessel Type */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vessel Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.vessel_type}
                    onChange={(e) => setFormData({ ...formData, vessel_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                  >
                    {VESSEL_TYPES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {formErrors.vessel_type && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.vessel_type}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notes & Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Berth congestion expected, expedited loading required"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20 bg-white resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{modalMode === "create" ? "Create & Dispatch" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Cancel Assignment */}
        {cancelModalId && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cancel Voyage Assignment?</h3>
              <p className="text-xs text-slate-500">
                This will mark assignment #{cancelModalId} as cancelled and notify the assigned charterer.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelAssignment}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
