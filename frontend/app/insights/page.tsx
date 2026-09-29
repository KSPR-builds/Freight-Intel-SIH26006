"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { ActiveScenarioBanner } from "@/lib/scenario-context";
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileText,
  Activity,
  Layers,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function InsightsPage() {
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await api.getInsights();
        setInsightsData(res);
      } catch (err) {
        console.error("Insights load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <DashboardLayout>
      {/* Active Scenario Banner */}
      <ActiveScenarioBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Insights & Analytics</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Autonomous Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Automated pattern detection, market trend analysis, and strategic recommendations for East Coast maritime operations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Detailed AI Report</span>
        </button>
      </div>

      {/* KEY INSIGHTS FEED */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Executive Intelligence Briefing</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightsData?.key_insights?.map((ins: any) => (
            <div
              key={ins.id}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3 hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      ins.impact === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {ins.impact} Impact
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{ins.confidence}% Confidence</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">{ins.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                  {ins.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-sky-800 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommended Action</span>
                    <span>{ins.recommended_action}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MARKET TREND & RISK ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trend Analysis */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Corridor Market Dynamics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-slate-600 font-medium">BDI Baltic Dry Direction:</span>
              <strong className="text-rose-600 font-bold">{insightsData?.market_trends?.bdi_direction}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-slate-600 font-medium">Singapore Fuel VLSFO Index:</span>
              <strong className="text-slate-900 font-bold">{insightsData?.market_trends?.fuel_index}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-slate-600 font-medium">Malacca Strait Fleet Supply:</span>
              <strong className="text-sky-700 font-bold">{insightsData?.market_trends?.fleet_supply}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-slate-600 font-medium">Port Bottleneck Telemetry:</span>
              <strong className="text-amber-700 font-bold">{insightsData?.market_trends?.port_bottlenecks}</strong>
            </div>
          </div>
        </div>

        {/* Corridor Risk Analysis */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Maritime Corridor Risk Factors</h3>
          </div>

          <div className="space-y-3 text-xs">
            {insightsData?.risk_analysis?.map((r: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-xs">{r.corridor}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.factor}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.risk_level === "Elevated"
                      ? "bg-rose-100 text-rose-800"
                      : r.risk_level === "Moderate"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {r.risk_level} Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
