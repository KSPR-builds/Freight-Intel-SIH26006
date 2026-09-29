"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface VoyageStatisticsCardProps {
  totalVoyages?: number;
  completed?: number;
  inProgress?: number;
  delayed?: number;
}

export function VoyageStatisticsCard({
  totalVoyages = 128,
  completed = 102,
  inProgress = 18,
  delayed = 8
}: VoyageStatisticsCardProps) {
  // Compute percentages for SVG Donut
  const compPct = (completed / totalVoyages) * 100;
  const inProgPct = (inProgress / totalVoyages) * 100;
  const delayPct = (delayed / totalVoyages) * 100;

  // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3
  const C = 251.32;
  const compStroke = (compPct / 100) * C;
  const inProgStroke = (inProgPct / 100) * C;
  const delayStroke = (delayPct / 100) * C;

  const regionalDurations = [
    { region: "Europe - Asia", duration: "3.2d", heightPct: 62 },
    { region: "Asia - Europe", duration: "3.8d", heightPct: 74 },
    { region: "Europe - Americas", duration: "4.5d", heightPct: 88 },
    { region: "Americas - Asia", duration: "5.1d", heightPct: 100 }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Voyage Statistics
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">
          Quarterly Aggregation
        </span>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex items-center justify-between gap-4">
        {/* SVG Donut */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            {/* Completed Slice (Emerald) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${compStroke} ${C}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* In Progress Slice (Sky) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#0284c7"
              strokeWidth="12"
              strokeDasharray={`${inProgStroke} ${C}`}
              strokeDashoffset={-compStroke}
            />
            {/* Delayed Slice (Amber/Rose) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${delayStroke} ${C}`}
              strokeDashoffset={-(compStroke + inProgStroke)}
            />
          </svg>

          {/* Donut Center Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-slate-900 leading-none">
              {totalVoyages}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs flex-1">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium text-[11px]">Completed ({completed})</span>
            </div>
            <strong className="font-bold text-emerald-700 text-xs">80%</strong>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span className="text-slate-600 font-medium text-[11px]">In Progress ({inProgress})</span>
            </div>
            <strong className="font-bold text-sky-700 text-xs">14%</strong>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium text-[11px]">Delayed ({delayed})</span>
            </div>
            <strong className="font-bold text-amber-700 text-xs">6%</strong>
          </div>
        </div>
      </div>

      {/* Regional Voyage Duration Bar Comparison */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Avg. Voyage Duration (by Region)
        </span>

        <div className="grid grid-cols-4 gap-2 text-center">
          {regionalDurations.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-800 mb-1">{item.duration}</span>
              <div className="w-full bg-slate-100 h-10 rounded-lg overflow-hidden flex items-end justify-center p-0.5">
                <div
                  className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded-md transition-all duration-500"
                  style={{ height: `${item.heightPct}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 truncate w-full mt-1.5 font-medium" title={item.region}>
                {item.region}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
