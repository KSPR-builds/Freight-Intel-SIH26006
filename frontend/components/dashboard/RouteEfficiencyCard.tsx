"use client";

import React from "react";
import { Info, Gauge, Wind, Compass, Zap } from "lucide-react";

interface RouteEfficiencyCardProps {
  optimalSpeed?: number;
  routeDeviation?: number;
  weatherEfficiency?: number;
  overallEfficiency?: number;
}

export function RouteEfficiencyCard({
  optimalSpeed = 78,
  routeDeviation = 92,
  weatherEfficiency = 65,
  overallEfficiency = 82
}: RouteEfficiencyCardProps) {
  const metrics = [
    {
      label: "Optimal Speed",
      value: optimalSpeed,
      color: "from-emerald-500 to-teal-400",
      icon: Gauge
    },
    {
      label: "Route Deviation",
      value: routeDeviation,
      color: "from-cyan-500 to-sky-400",
      icon: Compass
    },
    {
      label: "Weather Efficiency",
      value: weatherEfficiency,
      color: "from-amber-500 to-yellow-400",
      icon: Wind
    },
    {
      label: "Overall Efficiency",
      value: overallEfficiency,
      color: "from-sky-600 via-indigo-500 to-emerald-500",
      icon: Zap
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Route Efficiency
        </h3>
        <button
          type="button"
          title="Telemetry calculated using voyage speed, deviation from great-circle line, and sea surface weather conditions."
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 py-1">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium text-[11px] flex items-center gap-1.5">
                <m.icon className="w-3 h-3 text-slate-400" />
                {m.label}
              </span>
              <strong className="text-slate-900 font-bold font-mono text-xs">
                {m.value}%
              </strong>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-700 shadow-2xs`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary Pill */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400">Optimization Model</span>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          Eco-Speed Certified
        </span>
      </div>
    </div>
  );
}
