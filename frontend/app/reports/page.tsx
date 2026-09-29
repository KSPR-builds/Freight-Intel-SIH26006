"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import {
  FileText,
  Download,
  Search,
  Calendar,
  FileSpreadsheet,
  Eye,
  Loader2,
  ClipboardList,
  ArrowRight,
  Ship,
  Boxes,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from "lucide-react";

function AssignmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    updated: "bg-amber-50 text-amber-700 border-amber-200/60",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
        map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function UserReportsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getAssignments();
        setAssignments(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = assignments.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.origin_port.toLowerCase().includes(q) ||
      a.destination_port.toLowerCase().includes(q) ||
      a.cargo_type.toLowerCase().includes(q) ||
      a.vessel_type.toLowerCase().includes(q) ||
      (a.notes && a.notes.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const handleExport = () => {
    setExporting(true);
    api.exportAssignments();
    setTimeout(() => setExporting(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100/80 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-sky-600" />
              Reports & Data
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and export data for your voyage assignments.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer shrink-0"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export My Assignments CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by port, cargo, or vessel..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold shrink-0">
            {["all", "active", "updated", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? "bg-white text-sky-800 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        {!loading && assignments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            {[
              { label: "Total Assignments", val: assignments.length, cls: "bg-slate-50 text-slate-700 border-slate-200" },
              { label: "Active", val: assignments.filter((a) => a.status === "active").length, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Updated", val: assignments.filter((a) => a.status === "updated").length, cls: "bg-amber-50 text-amber-700 border-amber-200" },
              { label: "Cancelled", val: assignments.filter((a) => a.status === "cancelled").length, cls: "bg-rose-50 text-rose-700 border-rose-200" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-3 ${s.cls}`}>
                <p className="text-xl font-extrabold">{s.val}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Assignments Table / Cards */}
        <div className="bg-white/95 rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
              <p className="text-xs font-medium">Loading your assignment records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-6">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No records found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {assignments.length === 0
                  ? "No assignments yet. Your admin will send routes and cargo details here."
                  : "Try adjusting your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Route</th>
                    <th className="px-5 py-3.5">Cargo & Qty</th>
                    <th className="px-5 py-3.5">Vessel Type</th>
                    <th className="px-5 py-3.5">Laycan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const updatedAt = item.updated_at || item.created_at;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                          #{item.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
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
                        <td className="px-5 py-4 text-slate-600 max-w-[140px] truncate">
                          {item.vessel_type}
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                          <div>{item.laycan_start}</div>
                          <div className="text-slate-400">→ {item.laycan_end}</div>
                        </td>
                        <td className="px-5 py-4">
                          <AssignmentStatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                          {updatedAt
                            ? new Date(updatedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Assignment #{previewItem.id} — Full Record
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Route */}
                <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-2">
                    Route
                  </p>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <span>{previewItem.origin_port}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{previewItem.destination_port}</span>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Cargo Type", val: previewItem.cargo_type },
                    { label: "Quantity", val: `${Number(previewItem.quantity_mt).toLocaleString()} MT` },
                    { label: "Vessel Type", val: previewItem.vessel_type },
                    { label: "Status", val: previewItem.status.toUpperCase() },
                    { label: "Laycan Start", val: previewItem.laycan_start },
                    { label: "Laycan End", val: previewItem.laycan_end },
                    {
                      label: "Created",
                      val: previewItem.created_at
                        ? new Date(previewItem.created_at).toLocaleDateString()
                        : "—",
                    },
                    {
                      label: "Last Updated",
                      val: previewItem.updated_at
                        ? new Date(previewItem.updated_at).toLocaleDateString()
                        : "—",
                    },
                  ].map((row) => (
                    <div key={row.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {row.label}
                      </p>
                      <p className="text-slate-800 font-semibold mt-0.5">{row.val}</p>
                    </div>
                  ))}
                </div>

                {previewItem.notes && (
                  <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">
                      Operator Notes
                    </p>
                    <p className="text-slate-600 leading-relaxed">{previewItem.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => { handleExport(); setPreviewItem(null); }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All as CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getReports({ report_type: reportType, search });
        setReports(res);
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reportType, search]);

  const downloadCsv = (type: string = "freight") => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/reports/export?type=${type}`,
      "_blank"
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Reports & Data Suite
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Auditable Intelligence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Generate, view, and export freight market forecasts, vessel charter audits, and bulk cargo plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadCsv("freight")}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export Freight CSV</span>
            </button>
            <button
              onClick={() => downloadCsv("vessels")}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Fleet CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Printable PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title or keyword..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="All">All Report Types</option>
              <option value="Freight Forecast">Freight Forecast Reports</option>
              <option value="Vessel Chartering">Vessel Chartering Reports</option>
              <option value="Cargo Procurement">Cargo Procurement Reports</option>
              <option value="Route Optimization">Route Optimization Reports</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-16 flex justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3 hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                      {rep.report_type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {rep.format} • {rep.file_size_kb} KB
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{rep.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{rep.summary}</p>
                  <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                    <p>Corridor: <span className="text-slate-600 font-medium">{rep.corridor}</span></p>
                    <p>Commodity: <span className="text-slate-600 font-medium">{rep.commodity}</span></p>
                    <p>Generated: <span className="text-slate-600 font-medium">{rep.created_at}</span></p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">By {rep.generated_by}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewReport(rep)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => downloadCsv("freight")}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview modal (unchanged from original) */}
        {viewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">{viewReport.title}</h3>
                </div>
                <button onClick={() => setViewReport(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                    <span className="font-bold">{viewReport.report_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Corridor</span>
                    <span className="font-bold">{viewReport.corridor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Date</span>
                    <span className="font-bold">{viewReport.created_at}</span>
                  </div>
                </div>
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Executive Summary</h5>
                  <p className="text-slate-600">{viewReport.summary}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono text-[11px] text-slate-500">
                  <p>Dataset verified: 12 Months High-Frequency Telemetry</p>
                  <p>Confidence Level: 93.8% (Residual Variance Controlled)</p>
                  <p>Compliance: IMO Carbon Intensity Indicator (CII) Audited</p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setViewReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => { downloadCsv("freight"); setViewReport(null); }}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Role-aware entry point ────────────────────────────────────────────────────
export default function ReportsPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("freightiq_role") || "user");
    }
  }, []);

  if (role === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </DashboardLayout>
    );
  }

  return role === "admin" ? <AdminReportsPage /> : <UserReportsPage />;
}
