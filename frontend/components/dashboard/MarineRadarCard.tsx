"use client";

import React from "react";
import { Ship, Radio, Compass } from "lucide-react";

interface MarineRadarCardProps {
  vesselName?: string;
  headingDeg?: number;
}

export function MarineRadarCard({
  vesselName = "Aurora Sea",
  headingDeg = 45
}: MarineRadarCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Radar & Compass
          </h3>
        </div>
        <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          AIS Live
        </span>
      </div>

      {/* Realistic Tactical Radar Scope */}
      <div className="relative w-full aspect-square max-h-[190px] mx-auto rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Radar Background Grid Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Concentric Range Rings */}
        <div className="absolute w-[88%] h-[88%] rounded-full border border-emerald-500/25" />
        <div className="absolute w-[66%] h-[66%] rounded-full border border-emerald-500/30" />
        <div className="absolute w-[44%] h-[44%] rounded-full border border-emerald-500/35" />
        <div className="absolute w-[22%] h-[22%] rounded-full border border-emerald-500/45" />

        {/* Crosshair Axes */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/20" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20" />

        {/* Cardinal Points */}
        <span className="absolute top-1.5 font-mono text-[10px] font-extrabold text-emerald-400">N</span>
        <span className="absolute bottom-1.5 font-mono text-[10px] font-extrabold text-emerald-400">S</span>
        <span className="absolute left-2 font-mono text-[10px] font-extrabold text-emerald-400">W</span>
        <span className="absolute right-2 font-mono text-[10px] font-extrabold text-emerald-400">E</span>

        {/* Continuous Sweeping Radar Beam */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-[spin_4s_linear_infinite]">
          <div 
            className="w-1/2 h-1/2 origin-bottom-right"
            style={{
              background: "conic-gradient(from 0deg, rgba(16, 185, 129, 0.45) 0deg, transparent 60deg)"
            }}
          />
        </div>

        {/* Target AIS Blips */}
        <div className="absolute top-[28%] right-[32%] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[8px] font-mono text-emerald-300/80">tgt-1</span>
        </div>
        <div className="absolute bottom-[35%] left-[26%] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-[8px] font-mono text-cyan-300/80">tgt-2</span>
        </div>
        <div className="absolute top-[38%] left-[34%]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Central Own-Ship Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Ship className="w-3 h-3 text-emerald-300" />
          </div>
          <span className="text-[9px] font-bold text-white tracking-tight mt-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-700">
            {vesselName}
          </span>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-mono">
        <span className="text-[11px] text-slate-500 font-medium">RANGE: 0 - 100 nm</span>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          HDG: {String(headingDeg).padStart(3, "0")}°
        </span>
      </div>
    </div>
  );
}
