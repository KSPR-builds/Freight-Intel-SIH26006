"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { ProcurementDashboardResponse, SupplierItem, ProcurementPlanItem } from "@/types";
import { ActiveScenarioBanner } from "@/lib/scenario-context";
import { 
  Boxes, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  FileCheck,
  X,
  Loader2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function ProcurementPage() {
  const [data, setData] = useState<ProcurementDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // New Plan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commodity, setCommodity] = useState("Thermal Coal");
  const [quantity, setQuantity] = useState(65000);
  const [origin, setOrigin] = useState("Indonesia (Kalimantan)");
  const [destination, setDestination] = useState("Visakhapatnam");
  const [period, setPeriod] = useState("May 2025");
  const [budget, setBudget] = useState(6500000);
  const [supplier, setSupplier] = useState("Kalimantan Coal Resources");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProcurement() {
      try {
        const res = await api.getProcurementOverview();
        setData(res);
      } catch (err) {
        console.error("Procurement data error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProcurement();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await api.createProcurementPlan({
        commodity,
        quantity_mt: quantity,
        origin,
        destination,
        procurement_period: period,
        budget_usd: budget,
        preferred_supplier: supplier
      });

      if (data) {
        setData({
          ...data,
          upcoming_plans: [created, ...data.upcoming_plans],
          potential_savings_usd: data.potential_savings_usd + created.projected_savings_usd
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Error creating plan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Active Scenario Banner */}
      <ActiveScenarioBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bulk Cargo Procurement Planning</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              East Coast Corridors
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Optimize bulk commodity purchases, supplier allocations, and delivery schedules to minimize landed FOB + freight costs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generate Procurement Plan</span>
        </button>
      </div>

      {/* KPI CARDS (5 Core Procurement Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Cargo Demand
          </span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {data ? `${(data.total_demand_mt / 1e6).toFixed(2)}M MT` : "1.24M MT"}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Annualized requirement</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Procurement Planned
          </span>
          <span className="text-xl font-extrabold text-sky-700 mt-1 block">
            {data ? `${(data.procurement_planned_mt / 1e3).toFixed(0)}k MT` : "980k MT"}
          </span>
          <span className="text-[11px] text-sky-600 font-medium mt-1 block">79% Fulfilled</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Total Cost
          </span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {data ? `$${(data.estimated_total_cost_usd / 1e6).toFixed(1)}M` : "$108.5M"}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">FOB + Ocean Freight</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Landed Price
          </span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">
            ${data?.average_price_per_ton || "87.50"} / MT
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">↓ $4.20 vs budget</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Potential AI Savings
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-xl font-extrabold text-emerald-700">
              {data ? `$${(data.potential_savings_usd / 1e6).toFixed(2)}M` : "$3.85M"}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Optimized timing</span>
        </div>
      </div>

      {/* DEMAND & PRICE TRENDS CHART */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Commodity Demand & Price Forecast</h3>
            <p className="text-xs text-slate-500">
              Historical FOB prices with projected upcoming forward delivery windows.
            </p>
          </div>
          <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
            FOB Benchmark: GAR 4200 Coal
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.demand_trends || []} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(val: any) => [`$${val} / MT`, "Price"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <Area type="monotone" dataKey="avg_price_usd" stroke="#0284c7" strokeWidth={2.5} fill="url(#priceGrad)" />
              <Area type="monotone" dataKey="forecast_price_usd" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP SUPPLIERS TABLE */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Top Rated Commodity Suppliers</h3>
          <span className="text-[10px] text-slate-400 uppercase font-bold">Reliability Scorecard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Supplier Name</th>
                <th className="pb-2.5">Origin Country</th>
                <th className="pb-2.5">Commodity</th>
                <th className="pb-2.5">FOB Price</th>
                <th className="pb-2.5">Load Speed</th>
                <th className="pb-2.5">Grade Specification</th>
                <th className="pb-2.5 text-right">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.top_suppliers?.map((s, idx) => (
                <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 text-slate-600">{s.country}</td>
                  <td className="py-3 text-slate-600 font-medium">{s.commodity}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">${(s.fob_price_per_ton ?? 0).toFixed(2)}/MT</td>
                  <td className="py-3 text-slate-600">{(s.port_loading_speed_tpd ?? 0).toLocaleString()} TPD</td>
                  <td className="py-3 text-[11px] text-slate-500">{s.moisture_grade}</td>
                  <td className="py-3 text-right">
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {s.reliability_score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPCOMING PROCUREMENT PLANS */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active & Upcoming Procurement Plans</h3>
          <span className="text-xs text-sky-700 font-semibold">East Coast India Terminals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Plan Code</th>
                <th className="pb-2.5">Commodity</th>
                <th className="pb-2.5">Corridor</th>
                <th className="pb-2.5">Supplier</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Delivery Window</th>
                <th className="pb-2.5">Total Cost</th>
                <th className="pb-2.5">Est. Savings</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.upcoming_plans?.map((p) => (
                <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-sky-700">{p.plan_code}</td>
                  <td className="py-3 font-semibold text-slate-800">{p.commodity}</td>
                  <td className="py-3 text-slate-600">{p.origin} → {p.destination}</td>
                  <td className="py-3 text-slate-600">{p.supplier_name}</td>
                  <td className="py-3 font-semibold text-slate-900">{(p.quantity_mt ?? 0).toLocaleString()} MT</td>
                  <td className="py-3 text-slate-500">{p.delivery_window}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">${(p.total_cost_usd ?? 0).toLocaleString()}</td>
                  <td className="py-3 font-mono font-bold text-emerald-600">+${(p.projected_savings_usd ?? 0).toLocaleString()}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE PLAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Create Optimized Procurement Plan</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Commodity Type</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Thermal Coal">Thermal Coal (GAR 4200)</option>
                  <option value="Coking Coal">Coking Coal (Low Ash)</option>
                  <option value="Iron Ore Pellets">Iron Ore Pellets (67.5% Fe)</option>
                  <option value="Bauxite">Bauxite</option>
                  <option value="Fertilizer">Fertilizer (DAP/Urea)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Quantity (MT)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Origin Port / Region</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Destination Port</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Visakhapatnam">Visakhapatnam (INVTZ)</option>
                    <option value="Chennai">Chennai (INMAA)</option>
                    <option value="Paradip">Paradip (INPRT)</option>
                    <option value="Kolkata">Kolkata / Haldia</option>
                    <option value="Kakinada">Kakinada (INKAK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Preferred Supplier</label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Kalimantan Coal Resources">Kalimantan Coal Resources (Indonesia)</option>
                  <option value="Adani Abbot Point Terminal">Adani Abbot Point Terminal (Australia)</option>
                  <option value="Vale Oman Distribution">Vale Oman Distribution (UAE/Oman)</option>
                  <option value="Kaltim Prima Coal">Kaltim Prima Coal (Indonesia)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Optimized Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
