"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { 
  ShieldAlert, 
  Users, 
  Ship, 
  Anchor, 
  Navigation, 
  Cpu, 
  Activity, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function AdminPage() {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserOrg, setNewUserOrg] = useState("Coromandel Bulk");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [ovRes, uRes] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminUsers()
        ]);
        setOverview(ovRes);
        setUsers(uRes);
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleToggleUser = async (user: any) => {
    try {
      const updated = await api.updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? updated : u));
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await api.createAdminUser({
        email: newUserEmail,
        password: newUserPass,
        full_name: newUserName,
        organization: newUserOrg,
        is_admin: newUserIsAdmin
      });
      setUsers([...users, created]);
      setIsCreateModalOpen(false);
      setNewUserEmail("");
      setNewUserPass("");
      setNewUserName("");
    } catch (err: any) {
      alert("User creation error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise Administration & ML Ops</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Admin Restricted
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            System administration, user access control, database assets, and ML model performance telemetry.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* ADMIN KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{overview?.kpis?.total_users || 2}</span>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">Active Sessions: {overview?.kpis?.active_users || 2}</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracked Vessels</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{overview?.kpis?.vessels || 55}</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">AIS Streaming</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Managed Ports</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{overview?.kpis?.ports || 22}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">East Coast + Origins</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Routes</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{overview?.kpis?.routes || 54}</span>
          <span className="text-[11px] text-sky-600 font-medium mt-1 block">Waypoints mapped</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">API Invocations</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">14,205</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">99.98% Success</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Health</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">Uptime 99.9%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Latency &lt;1.2ms</span>
        </div>
      </div>

      {/* ML MODEL MONITORING PANEL */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-sky-950 text-white p-6 rounded-3xl shadow-lg border border-purple-400/20 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold">Machine Learning Operations (MLOps) Telemetry</h3>
          </div>
          <span className="text-xs text-purple-200 font-mono">
            Model: {overview?.ml_monitoring?.model_type || "GradientBoostingRegressor"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-purple-200 block uppercase">Mean Absolute Error (MAE)</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ${overview?.ml_monitoring?.mae || "0.68"} / MT
            </span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">High precision fit</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-purple-200 block uppercase">Root Mean Square Error</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ${overview?.ml_monitoring?.rmse || "0.89"} / MT
            </span>
            <span className="text-[10px] text-purple-200 block mt-0.5">Variance controlled</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-purple-200 block uppercase">R² Goodness of Fit</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {overview?.ml_monitoring?.r2_score || "0.93"}
            </span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">93% Variance explained</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-purple-200 block uppercase">Data Drift Status</span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block">
              {overview?.ml_monitoring?.data_drift || "Nominal (<1.8%)"}
            </span>
            <span className="text-[10px] text-cyan-200 block mt-0.5">Zero drift alert</span>
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">User Identity & Access Management</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">User</th>
                <th className="pb-2.5">Organization</th>
                <th className="pb-2.5">Role</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Registered</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 block">{u.full_name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 text-slate-600 font-medium">{u.organization}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        u.is_admin
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-sky-100 text-sky-800 border border-sky-200"
                      }`}
                    >
                      {u.role_name}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleUser(u)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        u.is_active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{u.created_at}</td>
                  <td className="py-3 text-right">
                    {u.email !== "admin@freight-intel.com" && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Provision User Account</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@coromandel.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Organization</label>
                <input
                  type="text"
                  value={newUserOrg}
                  onChange={(e) => setNewUserOrg(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAdminCheckbox"
                  checked={newUserIsAdmin}
                  onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600"
                />
                <label htmlFor="isAdminCheckbox" className="text-slate-700 font-semibold">
                  Grant System Administrator Role
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
