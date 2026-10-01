"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import {
  ClipboardList,
  Ship,
  Boxes,
  Calendar,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Download,
  RefreshCw,
  Anchor,
  FileText,
  Loader2,
  Calculator,
} from "lucide-react";

// ─── Inline SVG Route Visual ─────────────────────────────────────────────────
function RouteVisual({
  origin,
  destination,
  status,
}: {
  origin: string;
  destination: string;
  status: string;
}) {
  const lineColor =
    status === "cancelled"
      ? "#f43f5e"
      : status === "updated"
      ? "#f59e0b"
      : "#0ea5e9";

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Origin port dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-2.5 h-2.5 rounded-full border-2 border-white shadow"
          style={{ background: lineColor }}
        />
      </div>

      {/* SVG dashed route line with ship icon */}
      <div className="flex-1 relative h-5 min-w-0">
        <svg
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <marker
              id={`arrowhead-${status}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill={lineColor} />
            </marker>
          </defs>
          <line
            x1="4"
            y1="10"
            x2="188"
            y2="10"
            stroke={lineColor}
            strokeWidth="1.5"
            strokeDasharray="5,4"
            markerEnd={`url(#arrowhead-${status})`}
            opacity="0.7"
          />
          {/* Ship icon at midpoint */}
          <text
            x="100"
            y="10"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill={lineColor}
          >
            ⛵
          </text>
        </svg>
      </div>

      {/* Destination port dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-3 h-3 rounded-sm border-2 border-white shadow rotate-45"
          style={{ background: lineColor }}
        />
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "updated") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Updated
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
      {status}
    </span>
  );
}

// ─── Assignment Card ──────────────────────────────────────────────────────────
function AssignmentCard({
  item,
  isNew,
}: {
  item: any;
  isNew: boolean;
}) {
  const updatedAt = item.updated_at
    ? new Date(item.updated_at)
    : item.created_at
    ? new Date(item.created_at)
    : null;

  const lastUpdatedStr = updatedAt
    ? updatedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const isCancelled = item.status === "cancelled";
  const isUpdated = item.status === "updated";

  return (
    <div
      className={`relative bg-white rounded-3xl border shadow-xs overflow-hidden transition-all hover:shadow-md ${
        isCancelled
          ? "border-rose-200/80 opacity-75"
          : isUpdated
          ? "border-amber-200/80"
          : "border-sky-100"
      }`}
    >
      {/* Updated / New badge ribbon */}
      {isNew && !isCancelled && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm animate-pulse">
            <Clock className="w-3 h-3" />
            Updated
          </span>
        </div>
      )}

      {/* Card top colour strip */}
      <div
        className={`h-1 w-full ${
          isCancelled
            ? "bg-gradient-to-r from-rose-400 to-rose-300"
            : isUpdated
            ? "bg-gradient-to-r from-amber-400 to-amber-300"
            : "bg-gradient-to-r from-sky-600 to-cyan-500"
        }`}
      />

      <div className="p-5 space-y-4">
        {/* Route Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 tracking-tight truncate">
                <span className="truncate">{item.origin_port}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{item.destination_port}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Assignment #{item.id}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          {/* Route SVG Visual */}
          <RouteVisual
            origin={item.origin_port}
            destination={item.destination_port}
            status={item.status}
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Boxes className="w-3 h-3" /> Cargo
            </p>
            <p className="font-semibold text-slate-800">{item.cargo_type}</p>
            <p className="text-slate-500 font-mono">
              {Number(item.quantity_mt).toLocaleString()} MT
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Ship className="w-3 h-3" /> Vessel
            </p>
            <p className="font-semibold text-slate-800 leading-snug">
              {item.vessel_type}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Laycan Window
            </p>
            <p className="font-semibold text-slate-800 font-mono text-[11px]">
              {item.laycan_start}
            </p>
            <p className="text-slate-500 font-mono text-[11px]">
              to {item.laycan_end}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last Updated
            </p>
            <p className="text-slate-600 font-mono text-[11px] leading-snug">
              {lastUpdatedStr}
            </p>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Operator Notes
            </p>
            <p>{item.notes}</p>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              This voyage assignment has been cancelled. Contact your fleet
              coordinator for a replacement fixture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const LAST_VISIT_KEY = "freightiq_my_assignments_last_visit";

export default function MyAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  const [contracts, setContracts] = useState<any[]>([]);

  // Record current visit timestamp; load previous one to detect "new" items
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prev = localStorage.getItem(LAST_VISIT_KEY);
      if (prev) setLastVisit(new Date(prev));
      // Update last visit timestamp
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    }
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [res, cRes] = await Promise.all([
        api.getAssignments(),
        api.getUserContracts()
      ]);
      setAssignments(Array.isArray(res) ? res : []);
      setContracts(Array.isArray(cRes) ? cRes : []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const isNewSinceLastVisit = (item: any): boolean => {
    if (!lastVisit) return false;
    const itemDate = item.updated_at
      ? new Date(item.updated_at)
      : item.created_at
      ? new Date(item.created_at)
      : null;
    if (!itemDate) return false;
    return itemDate > lastVisit;
  };

  const filtered = useMemo(() => {
    if (statusFilter === "all") return assignments;
    return assignments.filter((a) => a.status === statusFilter);
  }, [assignments, statusFilter]);

  const newCount = useMemo(
    () => assignments.filter(isNewSinceLastVisit).length,
    [assignments, lastVisit]
  );

  const counts = useMemo(() => {
    return {
      all: assignments.length,
      active: assignments.filter((a) => a.status === "active").length,
      updated: assignments.filter((a) => a.status === "updated").length,
      cancelled: assignments.filter((a) => a.status === "cancelled").length,
    };
  }, [assignments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-sky-100/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-sky-600" />
              My Voyage Assignments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active route fixtures and cargo dispatch instructions assigned to you by your fleet coordinator.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                {newCount} new since last visit
              </span>
            )}
            <button
              onClick={loadAssignments}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-all"
              title="Refresh assignments"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {assignments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", count: counts.all, color: "text-slate-700 bg-slate-50 border-slate-200" },
              { label: "Active", count: counts.active, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
              { label: "Updated", count: counts.updated, color: "text-amber-700 bg-amber-50 border-amber-200" },
              { label: "Cancelled", count: counts.cancelled, color: "text-rose-700 bg-rose-50 border-rose-200" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border p-3 text-center ${stat.color}`}
              >
                <p className="text-xl font-extrabold">{stat.count}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider mt-0.5 opacity-70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {assignments.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-fit text-xs font-semibold">
            {["all", "active", "updated", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? "bg-white text-sky-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {/* Assignment Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-xs font-medium">Loading your voyage assignments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sky-100 py-20 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center">
              <Anchor className="w-8 h-8 text-sky-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {statusFilter === "all"
                  ? "No assignments yet"
                  : `No ${statusFilter} assignments`}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                {statusFilter === "all"
                  ? "No assignments yet. Your admin will send routes and cargo details here."
                  : `You have no assignments with status "${statusFilter}".`}
              </p>
            </div>
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
              >
                Show all assignments
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <AssignmentCard
                key={item.id}
                item={item}
                isNew={isNewSinceLastVisit(item)}
              />
            ))}
          </div>
        )}

        {/* Contract Plans Section */}
        {contracts.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-sky-100/80 pb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              Contract Plans & Schedules
            </h2>
            <div className="space-y-4">
              {contracts.map(contract => (
                <div key={contract.id} className="bg-white rounded-3xl border border-indigo-100 overflow-hidden shadow-sm">
                  <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{contract.name}</span>
                        <span className="bg-indigo-200 text-indigo-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          {contract.structure.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        {contract.origin_port} → {contract.destination_port}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold text-slate-600 bg-white p-2 rounded-xl border border-indigo-50">
                      <div><span className="text-slate-400 block text-[10px] uppercase">Cargo</span> {contract.cargo_type} ({(contract.total_quantity_mt ?? 0).toLocaleString()} MT)</div>
                      <div><span className="text-slate-400 block text-[10px] uppercase">Period</span> {contract.period_start} - {contract.period_end}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {contract.voyages.map((v: any) => (
                      <div key={v.sequence} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-2">
                          <span className="font-bold text-xs text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                            V{v.sequence}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-sky-600">{v.status}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-600 space-y-1">
                          <div className="flex justify-between"><span>Start:</span> <span className="font-semibold text-slate-800">{new Date(v.laycan_start).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}</span></div>
                          <div className="flex justify-between"><span>End:</span> <span className="font-semibold text-slate-800">{new Date(v.laycan_end).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}</span></div>
                          <div className="flex justify-between text-[11px] text-slate-500 pt-1 mt-1 border-t border-slate-200"><span>Qty:</span> <span>{(v.quantity_mt ?? 0).toLocaleString()} MT</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info footer note */}
        {!loading && assignments.length > 0 && (
          <div className="flex items-start gap-2 p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs text-sky-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
            <p>
              Assignments are managed by your fleet coordinator. For queries about a specific voyage, contact them via the{" "}
              <a href="/messages" className="font-semibold underline underline-offset-2 hover:text-sky-900">
                Messages
              </a>{" "}
              channel.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
