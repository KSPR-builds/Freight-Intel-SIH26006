"use client";

import React from "react";
import { Ship, Clock } from "lucide-react";

export interface SisterVessel {
  id: number;
  name: string;
  status: "Underway" | "Moored" | "Anchored";
}

export interface VoyageLog {
  id: number;
  vesselName: string;
  action: string;
  time: string;
}

interface VoyageLogsCardProps {
  sisterVessels: SisterVessel[];
  selectedVesselName: string;
  onSelectVessel: (name: string) => void;
  logs: VoyageLog[];
}

export function VoyageLogsCard({
  sisterVessels,
  selectedVesselName,
  onSelectVessel,
  logs
}: VoyageLogsCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-4">
      {/* Sister Vessels Quick Switch */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sister Vessels
          </span>
          <span className="text-[10px] text-sky-700 font-semibold cursor-pointer hover:underline">
            AIS Range
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sisterVessels.map((v) => {
            const isSelected = selectedVesselName === v.name;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVessel(v.name)}
                className={`p-2.5 rounded-2xl border text-left transition-all duration-200 backdrop-blur-md ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400/40 shadow-xs ring-1 ring-emerald-400/30"
                    : "bg-white/50 hover:bg-white/80 border-white/70 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      v.status === "Underway"
                        ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                        : v.status === "Moored"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                    }`}
                  />
                  <span className={`font-bold text-[11px] truncate block ${
                    isSelected ? "text-emerald-950 font-extrabold" : "text-slate-800"
                  }`}>
                    {v.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 capitalize block pl-3.5">
                  {v.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Voyage Logs */}
      <div className="pt-2 border-t border-slate-200/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Voyage Logs
          </span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/60 backdrop-blur-md transition-all duration-200 flex items-center justify-between gap-3 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white shadow-2xs border border-white/90 flex items-center justify-center text-sky-700 shrink-0">
                  <Ship className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 text-xs block truncate">
                    {log.vesselName}
                  </span>
                  <p className="text-[11px] text-slate-500 truncate">{log.action}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
