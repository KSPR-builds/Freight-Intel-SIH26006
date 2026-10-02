"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import {
  FileText,
  Calculator,
  Anchor,
  Box,
  CalendarDays,
  Ship,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Loader2,
  DollarSign
} from "lucide-react";

export default function ContractPlannerPage() {
  // Form State
  const [name, setName] = useState("Q1 Bulk Transport");
  const [originPort, setOriginPort] = useState("Singapore");
  const [destPort, setDestPort] = useState("Chennai");
  const [cargoType, setCargoType] = useState("Coal");
  const [totalQuantity, setTotalQuantity] = useState(250000);
  const [periodStart, setPeriodStart] = useState("2026-10-01");
  const [periodEnd, setPeriodEnd] = useState("2026-12-31");
  const [parcelSize, setParcelSize] = useState("");
  const [preferredStructure, setPreferredStructure] = useState("compare_all");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");

  // Options
  const [ports, setPorts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Simulation State
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [simError, setSimError] = useState<string>("");
  
  // Save State
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getPorts().then(setPorts).catch(() => {});
    api.getUsers().then(res => setUsers(res.filter((u: any) => u.role === "user"))).catch(() => {});
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setResults(null);
    setSimError("");
    setSaveSuccess(false);

    const payload = {
      origin_port: originPort,
      destination_port: destPort,
      cargo_type: cargoType,
      total_quantity_mt: totalQuantity,
      period_start: periodStart,
      period_end: periodEnd,
      parcel_size: parcelSize ? parseInt(parcelSize) : null,
      preferred_structure: preferredStructure
    };

    try {
      const data = await api.simulateContract(payload);
      if (data && (data.vessel_recommendation || data.recommendation)) {
        setResults(data);
      } else {
        throw new Error("Invalid simulation response structure");
      }
    } catch (e: any) {
      console.warn("Simulation call error, falling back to client engine:", e);
      setSimError("Could not run live simulation. Showing sample result.");

      const qty = Number(totalQuantity) || 250000;
      const parcel = parcelSize ? parseInt(parcelSize) : (qty >= 120000 ? 65000 : 45000);
      const vType = parcel >= 120000 ? "Capesize (150k DWT)" : parcel >= 70000 ? "Panamax (75k DWT)" : "Supramax (55k DWT)";
      const cargoMult = cargoType === "Iron Ore" ? 21.4 : cargoType === "Fertilizer" ? 25.8 : 22.8;
      const baseCost = Math.round(qty * cargoMult);
      const cvoCost = Math.round(baseCost * 0.91);

      const numVoyages = Math.max(1, Math.ceil(qty / parcel));
      const sDate = new Date(periodStart || "2026-10-01");
      const sched = [];
      for (let i = 0; i < Math.min(numVoyages, 6); i++) {
        const vStart = new Date(sDate.getTime() + i * 21 * 24 * 3600 * 1000);
        const vEnd = new Date(vStart.getTime() + 7 * 24 * 3600 * 1000);
        sched.push({
          sequence: i + 1,
          laycan_start: vStart.toISOString().split("T")[0],
          laycan_end: vEnd.toISOString().split("T")[0],
          quantity_mt: i === numVoyages - 1 ? (qty - (numVoyages - 1) * parcel) || parcel : parcel,
          status: "scheduled"
        });
      }

      setResults({
        vessel_recommendation: {
          vessel_type: vType,
          limiting_constraint: "Optimal Draft Matched"
        },
        recommendation: {
          cheapest_structure: "consecutive_voyage",
          advice: `For ${qty.toLocaleString()} MT of ${cargoType} on ${originPort} → ${destPort}, Consecutive Voyage delivers maximal voyage economy.`
        },
        prices: {
          spot: { expected: baseCost, low: Math.round(baseCost * 0.92), high: Math.round(baseCost * 1.08) },
          coa: { expected: Math.round(baseCost * 0.94), low: Math.round(baseCost * 0.88), high: Math.round(baseCost * 1.02) },
          consecutive_voyage: { expected: cvoCost, low: Math.round(cvoCost * 0.92), high: Math.round(cvoCost * 1.03) },
          time_charter: { expected: Math.round(baseCost * 0.96), low: Math.round(baseCost * 0.90), high: Math.round(baseCost * 1.06) }
        },
        schedule: sched
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleSave = async () => {
    if (!assignedUserId) return alert("Please select a user to assign the plan to.");
    
    setSaving(true);
    try {
      await api.createContract({
        name,
        origin_port: originPort,
        destination_port: destPort,
        cargo_type: cargoType,
        total_quantity_mt: totalQuantity,
        period_start: periodStart,
        period_end: periodEnd,
        parcel_size: parcelSize ? parseInt(parcelSize) : null,
        structure: results?.recommendation?.cheapest_structure || "consecutive_voyage",
        vessel_type: results?.vessel_recommendation?.vessel_type || "Supramax (55k DWT)",
        assigned_user_id: Number(assignedUserId)
      });
      setSaveSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number" || isNaN(val)) return "$0.00M";
    return "$" + (val / 1000000).toFixed(2) + "M";
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-sky-600" />
            Contract Planning Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate shipping contracts, optimize vessel types, and forecast multi-voyage schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-sm">
              <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Plan Parameters</h2>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Port</label>
                  <select 
                    value={originPort} onChange={e => setOriginPort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  >
                    {ports.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dest Port</label>
                  <select 
                    value={destPort} onChange={e => setDestPort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  >
                    {ports.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo</label>
                  <select 
                    value={cargoType} onChange={e => setCargoType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="Coal">Coal</option>
                    <option value="Iron Ore">Iron Ore</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Bauxite">Bauxite</option>
                    <option value="Grain">Grain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Qty (MT)</label>
                  <input 
                    type="number" value={totalQuantity} onChange={e => setTotalQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period Start</label>
                  <input 
                    type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period End</label>
                  <input 
                    type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parcel Size (MT) <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <input 
                  type="number" value={parcelSize} onChange={e => setParcelSize(e.target.value)} placeholder="Auto-optimize"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Run Engine Simulation
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-4">
            
            {simError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{simError}</span>
              </div>
            )}

            {!results && !simulating && (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                <Calculator className="w-12 h-12 mb-3 opacity-50" />
                <p>Run simulation to see contract recommendations.</p>
              </div>
            )}

            {simulating && (
              <div className="bg-white rounded-2xl border border-slate-200 h-full min-h-[400px] flex flex-col items-center justify-center text-sky-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="font-bold text-slate-600 animate-pulse">Running Contract Engine...</p>
              </div>
            )}

            {results && !simulating && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Top: Vessel & Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vessel Recommendation */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase mb-3">
                      <Ship className="w-4 h-4" /> Vessel Optimization
                    </div>
                    {results?.vessel_recommendation?.vessel_type === "None" ? (
                      <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-bold">No Suitable Vessel</div>
                          <div className="text-xs mt-1">Limiting factor: {results?.vessel_recommendation?.limiting_constraint || "Draft limit"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
                          <Ship className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-800">
                            {results?.vessel_recommendation?.vessel_type || "Supramax (55k DWT)"}
                          </div>
                          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-emerald-100">
                            {results?.vessel_recommendation?.limiting_constraint || "Draft & Cargo Matched"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-sm text-white">
                    <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase mb-3">
                      <TrendingUp className="w-4 h-4" /> AI Recommendation
                    </div>
                    <div>
                      <div className="text-xs text-indigo-100 mb-1">Recommended Structure</div>
                      <div className="text-2xl font-black uppercase mb-3">
                        {(results?.recommendation?.cheapest_structure || "consecutive_voyage").replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm font-medium bg-white/10 p-2.5 rounded-lg border border-white/20 backdrop-blur-sm">
                        "{results?.recommendation?.advice || "Multi-voyage arrangement recommended."}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Costs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                      <DollarSign className="w-4 h-4" /> Structure Cost Comparison
                    </div>
                    <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      *Simulated Assumptions
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["spot", "coa", "consecutive_voyage", "time_charter"].map(struct => {
                      const data = results?.prices?.[struct] || { expected: 0, low: 0, high: 0 };
                      const isRec = (results?.recommendation?.cheapest_structure || "consecutive_voyage") === struct;
                      return (
                        <div key={struct} className={`p-4 rounded-xl border ${isRec ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                            {struct.replace(/_/g, ' ')}
                            {isRec && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <div className="text-xl font-black text-slate-800 mb-2">
                            {formatCurrency(data?.expected)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium flex justify-between">
                            <span>L: {formatCurrency(data?.low)}</span>
                            <span>H: {formatCurrency(data?.high)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Voyage Schedule Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                   <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase mb-4">
                    <CalendarDays className="w-4 h-4" /> Simulated Voyage Schedule
                  </div>

                  <div className="space-y-3">
                    {Array.isArray(results?.schedule) && results.schedule.length > 0 ? (
                      results.schedule.map((v: any, idx: number) => {
                        const prev = idx > 0 ? results.schedule[idx-1] : null;
                        let idleDays = 0;
                        if (prev && prev.laycan_end && v.laycan_start) {
                          const d1 = new Date(prev.laycan_end);
                          const d2 = new Date(v.laycan_start);
                          idleDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
                        }

                        return (
                          <React.Fragment key={v.sequence || idx}>
                            {idleDays > 0 && (
                              <div className="flex items-center justify-center gap-2 py-1">
                                <div className="h-4 border-l-2 border-dashed border-amber-300"></div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {idleDays} Days Idle Gap
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                V{v.sequence || idx + 1}
                              </div>
                              <div className="flex-1 grid grid-cols-2 text-sm">
                                <div>
                                  <span className="text-xs text-slate-500 block">Laycan Window</span>
                                  <span className="font-semibold text-slate-800">
                                    {v.laycan_start ? new Date(v.laycan_start).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}) : "TBD"} - {v.laycan_end ? new Date(v.laycan_end).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}) : "TBD"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-500 block">Quantity</span>
                                  <span className="font-semibold text-slate-800">{(v.quantity_mt ?? 0).toLocaleString()} MT</span>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No voyage schedule generated.</p>
                    )}
                  </div>
                </div>

                {/* Save & Assign */}
                <div className="bg-sky-50 rounded-2xl border border-sky-100 p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-600 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sky-900">Finalize & Assign</h4>
                      <p className="text-xs text-sky-700">Save this plan and assign the schedule to an operator.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                      value={assignedUserId} 
                      onChange={e => setAssignedUserId(e.target.value ? Number(e.target.value) : "")}
                      className="bg-white border border-sky-200 rounded-xl px-3 py-2 text-sm outline-none w-full sm:w-48 font-medium"
                    >
                      <option value="">Select User...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                    
                    <button
                      onClick={handleSave}
                      disabled={saving || saveSuccess || !assignedUserId}
                      className="bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {saving ? "Saving..." : saveSuccess ? "Assigned!" : "Create Contract"}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
