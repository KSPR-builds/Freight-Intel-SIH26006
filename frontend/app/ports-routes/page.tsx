"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaritimeMap } from "@/components/maps/MaritimeMap";
import { api } from "@/lib/api";
import { PortInfo, RouteOptimizationResponse, RouteOption } from "@/types";
import { ActiveScenarioBanner } from "@/lib/scenario-context";
import { 
  Anchor, 
  Navigation, 
  Leaf, 
  DollarSign, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function PortsRoutesPage() {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [routeData, setRouteData] = useState<RouteOptimizationResponse | null>(null);
  const [selectedRouteOption, setSelectedRouteOption] = useState<RouteOption | null>(null);
  const [origin, setOrigin] = useState("Singapore");
  const [destination, setDestination] = useState("Visakhapatnam");
  const [loading, setLoading] = useState(true);

  const origins = ["Singapore", "Indonesia", "Australia", "UAE", "South Africa"];
  const destinations = ["Visakhapatnam", "Chennai", "Paradip", "Kolkata", "Kakinada"];

  useEffect(() => {
    async function loadRoute() {
      setLoading(true);
      try {
        const res = await api.getOptimizedRoute(origin, destination);
        setRouteData(res);
        setPorts(res.available_ports || []);
        setSelectedRouteOption(res.best_route);
      } catch (err) {
        console.error("Route optimization load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [origin, destination]);

  return (
    <DashboardLayout>
      {/* Active Scenario Banner */}
      <ActiveScenarioBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ports & Route Optimization</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Interactive Leaflet GIS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time port congestion tracking, draft clearance, and multi-objective maritime route comparison for East Coast India.
          </p>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-sky-100 shadow-2xs">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {origins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span className="text-slate-400 font-bold">→</span>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {destinations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 AI ROUTE OBJECTIVE COMPARISON CARDS */}
      {routeData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Best Route */}
          <div
            onClick={() => setSelectedRouteOption(routeData.best_route)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedRouteOption?.label === routeData.best_route.label
                ? "bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/20 shadow-sm"
                : "bg-white/90 border-sky-100 hover:border-sky-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-600 text-white">
                Recommended
              </span>
              <Navigation className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Balanced Optimal</h4>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Distance:</span>
                <strong className="text-slate-900">{routeData.best_route.distance_nm} NM</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transit Time:</span>
                <strong className="text-slate-900">{routeData.best_route.transit_time_days} Days</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Cost:</span>
                <strong className="text-sky-700">${routeData.best_route.total_cost_usd.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* 2. Lowest Cost Route */}
          <div
            onClick={() => setSelectedRouteOption(routeData.lowest_cost_route)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedRouteOption?.label === routeData.lowest_cost_route.label
                ? "bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm"
                : "bg-white/90 border-sky-100 hover:border-sky-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                Lowest Cost
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Eco-Steaming Lane</h4>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Savings:</span>
                <strong className="text-emerald-600">+${routeData.lowest_cost_route.savings_usd.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fuel (VLSFO):</span>
                <strong className="text-slate-900">{routeData.lowest_cost_route.bunker_fuel_mt} MT</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Cost:</span>
                <strong className="text-slate-900">${routeData.lowest_cost_route.total_cost_usd.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* 3. Fastest Route */}
          <div
            onClick={() => setSelectedRouteOption(routeData.fastest_route)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedRouteOption?.label === routeData.fastest_route.label
                ? "bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 shadow-sm"
                : "bg-white/90 border-sky-100 hover:border-sky-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white">
                Fastest
              </span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Express Passage</h4>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Transit:</span>
                <strong className="text-blue-700">{routeData.fastest_route.transit_time_days} Days</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Speed:</span>
                <strong className="text-slate-900">14.5 knots</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Cost:</span>
                <strong className="text-slate-900">${routeData.fastest_route.total_cost_usd.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* 4. Lowest Emissions */}
          <div
            onClick={() => setSelectedRouteOption(routeData.lowest_emissions_route)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedRouteOption?.label === routeData.lowest_emissions_route.label
                ? "bg-teal-50/90 border-teal-400 ring-2 ring-teal-400/20 shadow-sm"
                : "bg-white/90 border-sky-100 hover:border-sky-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-600 text-white">
                Green Lane
              </span>
              <Leaf className="w-4 h-4 text-teal-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Lowest Carbon (CII A)</h4>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>CO2 Emissions:</span>
                <strong className="text-teal-700">{routeData.lowest_emissions_route.co2_emissions_mt} MT</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fuel Conserved:</span>
                <strong className="text-slate-900">17.5 TPD</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Weather State:</span>
                <strong className="text-slate-900">Sea State 2-3</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARITIME MAP & ROUTE TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Route Visualization: {origin} → {destination}
              </h3>
            </div>
            {selectedRouteOption && (
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {selectedRouteOption.label} Selected
              </span>
            )}
          </div>

          <MaritimeMap ports={ports} selectedRoute={selectedRouteOption} height="440px" />
        </div>

        {/* Selected Route Telemetry Breakdown */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Voyage Breakdown</h3>
          </div>

          {selectedRouteOption ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route Name:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedRouteOption.route_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nautical Miles:</span>
                  <strong className="text-slate-900">{selectedRouteOption.distance_nm.toLocaleString()} NM</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Voyage Duration:</span>
                  <strong className="text-slate-900">{selectedRouteOption.transit_time_days} Days</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bunker Fuel (VLSFO):</span>
                  <strong className="text-slate-900">{selectedRouteOption.bunker_fuel_mt} MT</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CO2 Emissions:</span>
                  <strong className="text-teal-700">{selectedRouteOption.co2_emissions_mt} MT</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weather Risk:</span>
                  <span className="font-semibold text-slate-800">{selectedRouteOption.weather_risk}</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Financial Impact</span>
                <div className="text-xl font-black text-emerald-800">
                  ${selectedRouteOption.total_cost_usd.toLocaleString()}
                </div>
                {selectedRouteOption.savings_usd > 0 && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Unlocks ${selectedRouteOption.savings_usd.toLocaleString()} net savings vs spot index.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Select a route option above to view voyage telemetry.
            </div>
          )}
        </div>
      </div>

      {/* MAJOR PORTS STATUS TABLE */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Major Ports Directory & Congestion Telemetry</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">East Coast India + Overseas Terminals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Port Name</th>
                <th className="pb-2.5">UN Code</th>
                <th className="pb-2.5">Country</th>
                <th className="pb-2.5">Region</th>
                <th className="pb-2.5">Max Draft</th>
                <th className="pb-2.5">Berths</th>
                <th className="pb-2.5">Avg Handling</th>
                <th className="pb-2.5">Waiting Delay</th>
                <th className="pb-2.5">Congestion</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ports.map((p) => (
                <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3 font-mono text-slate-500">{p.code}</td>
                  <td className="py-3 text-slate-600">{p.country}</td>
                  <td className="py-3 text-slate-600">{p.region}</td>
                  <td className="py-3 font-semibold text-sky-700">{p.draft_depth_m} m</td>
                  <td className="py-3 text-slate-600">{p.berths}</td>
                  <td className="py-3 text-slate-600">{p.avg_handling_time_hours} hrs</td>
                  <td className="py-3 font-semibold text-slate-800">{p.waiting_time_days} days</td>
                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        p.congestion_index > 30 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {p.congestion_index} Index
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "Operational"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
