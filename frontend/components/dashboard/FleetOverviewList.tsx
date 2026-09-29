"use client";

import React, { useState } from "react";
import { Ship, ChevronDown, Navigation, Search } from "lucide-react";

export interface FleetItem {
  id: number;
  name: string;
  status: "Underway" | "Moored" | "Anchored" | "In Port";
  speedKnots: number;
  headingDeg: number;
  type: string;
}

interface FleetOverviewListProps {
  fleet: FleetItem[];
  selectedVesselName: string;
  onSelectVessel: (name: string) => void;
}

export function FleetOverviewList({
  fleet,
  selectedVesselName,
  onSelectVessel
}: FleetOverviewListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const filteredFleet = fleet.filter((item) => {
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] transition-all duration-300 flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Fleet Overview
        </h3>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white/60 backdrop-blur-md border border-white/90 rounded-xl px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs transition-colors"
          >
            <option value="All">All Fleet</option>
            <option value="Underway">Underway</option>
            <option value="Moored">Moored</option>
            <option value="Anchored">Anchored</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter vessels..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-white/80 bg-white/50 backdrop-blur-md focus:bg-white/80 focus:outline-none focus:border-sky-500 shadow-2xs transition-all"
        />
      </div>

      {/* Vessels List */}
      <div className="space-y-1.5 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
        {filteredFleet.map((v) => {
          const isSelected = selectedVesselName === v.name;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVessel(v.name)}
              className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 backdrop-blur-md ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-400/40 shadow-xs ring-1 ring-emerald-400/30"
                  : "bg-white/40 hover:bg-white/75 border-white/60 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-white/90 shadow-2xs"
                  }`}
                >
                  <Ship className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-bold text-xs block truncate ${
                      isSelected ? "text-emerald-950 font-extrabold" : "text-slate-800"
                    }`}
                  >
                    {v.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        v.status === "Underway"
                          ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                          : v.status === "Moored"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 capitalize">
                      {v.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Speed & Heading Telemetry */}
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-800 font-mono block">
                  {v.speedKnots} kn
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                  <Navigation
                    className="w-2.5 h-2.5 text-slate-400"
                    style={{ transform: `rotate(${v.headingDeg}deg)` }}
                  />
                  <span>{String(v.headingDeg).padStart(3, "0")}°</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
