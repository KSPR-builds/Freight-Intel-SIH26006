"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useOpenEmergenciesCount } from "@/lib/use-open-emergencies-count";
import {
  AlertTriangle,
  Loader2,
  Check,
  CheckCheck,
  RefreshCw,
  Clock,
  User as UserIcon,
  MapPin,
} from "lucide-react";

export default function AdminEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const { refreshCount } = useOpenEmergenciesCount();

  const load = useCallback(async () => {
    try {
      const data = await api.getEmergencies();
      setEmergencies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleAction = async (id: number, action: "acknowledge" | "resolve") => {
    setActionId(id);
    try {
      if (action === "acknowledge") {
        await api.acknowledgeEmergency(id);
      } else {
        await api.resolveEmergency(id);
      }
      await load();
      refreshCount();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-rose-100 text-rose-800 border-rose-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open": return "bg-rose-500 text-white animate-pulse";
      case "acknowledged": return "bg-amber-500 text-white";
      case "resolved": return "bg-emerald-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  // Sort: open first, then by severity, then by date
  const sorted = [...emergencies].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (a.status !== "open" && b.status === "open") return 1;
    
    const sevMap: any = { critical: 4, high: 3, medium: 2, low: 1 };
    const sevA = sevMap[a.severity] || 0;
    const sevB = sevMap[b.severity] || 0;
    
    if (a.status === "open" && b.status === "open" && sevA !== sevB) {
      return sevB - sevA; // higher severity first
    }
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              Emergency Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage urgent operational alerts filed by users.
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
              <CheckCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">All Clear</h3>
            <p className="text-slate-500 text-sm">No emergency alerts have been filed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(em => (
              <div 
                key={em.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                  em.status === "open" ? "border-rose-200 shadow-rose-100" : "border-slate-200 opacity-80"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getSeverityStyles(em.severity)}`}>
                        {em.severity}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusStyles(em.status)}`}>
                        {em.status}
                      </span>
                      <span className="text-slate-800 font-bold ml-1">
                        {em.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-slate-700 text-sm font-medium p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {em.message}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        User ID: {em.user_id}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {em.location || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(em.created_at).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 md:min-w-[140px]">
                    {em.status === "open" && (
                      <button
                        onClick={() => handleAction(em.id, "acknowledge")}
                        disabled={actionId === em.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {actionId === em.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Acknowledge
                      </button>
                    )}
                    
                    {em.status !== "resolved" && (
                      <button
                        onClick={() => handleAction(em.id, "resolve")}
                        disabled={actionId === em.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {actionId === em.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                        Resolve
                      </button>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
