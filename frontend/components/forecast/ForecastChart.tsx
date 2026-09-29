"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { ChartDataPoint } from "@/types";

interface ForecastChartProps {
  data: ChartDataPoint[];
  currentRate: number;
  horizonDays: number;
  onHorizonChange?: (horizon: number) => void;
}

export function ForecastChart({ data, currentRate, horizonDays, onHorizonChange }: ForecastChartProps) {
  const horizons = [7, 30, 90, 365];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-sky-100 text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
            {point.date} {point.is_future ? "(Forecast)" : "(Historical)"}
          </div>
          {point.historical_rate != null && (
            <div className="flex justify-between text-slate-600">
              <span>Historical Spot:</span>
              <span className="font-bold text-sky-700">${point.historical_rate.toFixed(2)} / MT</span>
            </div>
          )}
          {point.predicted_rate != null && (
            <div className="flex justify-between text-blue-800 font-semibold">
              <span>ML Predicted:</span>
              <span className="font-extrabold text-blue-600">${point.predicted_rate.toFixed(2)} / MT</span>
            </div>
          )}
          {point.lower_bound != null && point.upper_bound != null && (
            <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
              <span>90% CI Band:</span>
              <span>${point.lower_bound.toFixed(2)} - ${point.upper_bound.toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Find today connection point
  const todayPoint = data.find((d) => d.historical_rate != null && d.predicted_rate != null);

  return (
    <div className="space-y-4">
      {/* Horizon selector buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Forecast Horizon:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {horizons.map((h) => (
              <button
                key={h}
                onClick={() => onHorizonChange?.(h)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                  horizonDays === h
                    ? "bg-white text-sky-700 shadow-xs border border-sky-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {h === 365 ? "1Y" : `${h}D`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-600 rounded-full" />
            <span>Historical Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-blue-600" />
            <span>Predicted Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-sky-200/50 rounded-xs" />
            <span>Confidence Interval</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              tickFormatter={(val) => {
                const parts = val.split("-");
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={["auto", "auto"]}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Today Marker */}
            {todayPoint && (
              <ReferenceLine
                x={todayPoint.date}
                stroke="#0369a1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#0369a1",
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
            )}

            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke="none"
              fill="url(#confidenceBand)"
              isAnimationActive={false}
            />

            {/* Historical Series */}
            <Line
              type="monotone"
              dataKey="historical_rate"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: "#0284c7" }}
              activeDot={{ r: 5 }}
            />

            {/* Predicted Series */}
            <Line
              type="monotone"
              dataKey="predicted_rate"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
