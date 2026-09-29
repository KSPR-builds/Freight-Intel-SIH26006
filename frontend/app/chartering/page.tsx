"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VesselHoverPopup } from "@/components/vessels/VesselHoverPopup";
import { api } from "@/lib/api";
import { Vessel, CharterRecommendation } from "@/types";
import { ActiveScenarioBanner } from "@/lib/scenario-context";
import { 
  Ship, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Navigation, 
  Check, 
  X, 
  Loader2,
  Calendar
} from "lucide-react";

export default function CharteringPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [recommendations, setRecommendations] = useState<CharterRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [vesselType, setVesselType] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("Singapore → Visakhapatnam");

  // Critical Hover State: track vessel and its row bounding rect
  const [hoveredVessel, setHoveredVessel] = useState<Vessel | null>(null);
  const [rowRect, setRowRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charter Booking Modal State
  const [bookingVessel, setBookingVessel] = useState<Vessel | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function loadVessels() {
      try {
        const [vList, recList] = await Promise.all([
          api.getVessels({ vessel_type: vesselType, availability, search: searchQuery }),
          api.getCharterRecommendations(selectedRoute)
        ]);
        setVessels(vList);
        setRecommendations(recList);
      } catch (err) {
        console.error("Vessel charter data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVessels();
  }, [vesselType, availability, searchQuery, selectedRoute]);

  // Hover Handlers anchored to the hovered vessel row
  const handleRowMouseEnter = (vessel: Vessel, event: React.MouseEvent<HTMLTableRowElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    setRowRect(rect);
    setHoveredVessel(vessel);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredVessel(null);
      setRowRect(null);
    }, 250);
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handlePopupMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredVessel(null);
      setRowRect(null);
    }, 200);
  };

  const handleCharterClick = (vessel: Vessel) => {
    setHoveredVessel(null);
    setRowRect(null);
    setBookingVessel(vessel);
    setBookingSuccess(null);
  };

  // Opens charter modal from a recommendation — falls back to constructing
  // a vessel object from rec data when vessel list hasn't loaded yet
  const handleRecommendationCharter = (rec: CharterRecommendation) => {
    const matched = vessels.find((v) => v.id === rec.vessel_id || String(v.id) === String(rec.vessel_id));
    if (matched) {
      handleCharterClick(matched);
    } else {
      // Construct a minimal Vessel from recommendation data so modal works
      const vesselFromRec: Vessel = {
        id: rec.vessel_id,
        name: rec.vessel_name,
        imo: `IMO-${rec.vessel_id}`,
        vessel_type: rec.vessel_type,
        dwt: rec.dwt,
        built_year: 2019,
        length_overall_m: 190,
        beam_m: 32,
        draft_m: 12.5,
        flag: "Panama",
        classification_society: "DNV GL",
        main_engine: "MAN B&W",
        service_speed_knots: 13.5,
        fuel_consumption_tpd: 28,
        daily_hire_rate: rec.daily_hire_rate,
        availability_status: "Available",
        current_position_name: selectedRoute.split(" → ")[0] || "Singapore",
        current_lat: 1.29,
        current_lng: 103.85,
        eta: "2025-04-14",
        recommendation_score: rec.overall_score,
        why_recommended: rec.recommended_reason,
        image_url: rec.image_url || "",
        owner_operator: "Independent Operator"
      };
      handleCharterClick(vesselFromRec);
    }
  };

  const handleConfirmCharter = async () => {
    if (!bookingVessel) return;
    setIsBooking(true);
    try {
      const res = await api.bookCharter({
        vessel_id: bookingVessel.id,
        cargo_id: 1,
        route_id: 1,
        laycan_start: "2025-04-12",
        laycan_end: "2025-04-18",
        agreed_daily_rate: bookingVessel.daily_hire_rate
      });
      setBookingSuccess(res.message || `Charter confirmed for ${bookingVessel.name}`);
      // Refresh vessel list
      const updated = await api.getVessels();
      setVessels(updated);
    } catch (err: any) {
      alert("Booking failed: " + err.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Floating Hover Information Popup */}
      <VesselHoverPopup
        vessel={hoveredVessel}
        anchorRect={rowRect}
        onMouseEnter={handlePopupMouseEnter}
        onMouseLeave={handlePopupMouseLeave}
        onCharterClick={handleCharterClick}
        onDetailsClick={(v) => {
          setHoveredVessel(null);
          setBookingVessel(v);
        }}
        onCompareClick={(v) => {
          setHoveredVessel(null);
          setSearchQuery(v.name);
        }}
      />

      {/* Active Scenario Banner */}
      <ActiveScenarioBanner />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vessel Chartering</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              55 Vessels Tracked
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Find the best vessels. Optimize charter costs. Maximize fleet efficiency for East Coast India.
          </p>
        </div>

        {/* Corridor Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Corridor:</span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs focus:outline-none focus:border-sky-500"
          >
            <option value="Singapore → Visakhapatnam">Singapore → Visakhapatnam</option>
            <option value="Singapore → Chennai">Singapore → Chennai</option>
            <option value="Indonesia → Paradip">Indonesia → Paradip</option>
            <option value="Australia → Kolkata">Australia → Kolkata</option>
          </select>
        </div>
      </div>

      {/* TOP 3 AI CHARTER RECOMMENDATIONS */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-sky-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top AI Charter Recommendations</h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedRoute} • Highest-scoring available carriers (Weighted: 30% Hire Rate, 25% Fuel Efficiency, 20% Availability, 15% Port Draft, 10% Built Year)
              </p>
            </div>
          </div>
          <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
            Corridor Optimized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-100 hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                    Rank #{idx + 1} · {rec.vessel_type}
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    {Number(rec.overall_score).toFixed(1)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{rec.vessel_name}</h4>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{rec.recommended_reason}</p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl mb-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Projected Cost</span>
                    <strong className="text-slate-800">${rec.projected_total_cost_usd?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Est. Savings</span>
                    <strong className="text-emerald-600">+${rec.estimated_savings_usd?.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-mono font-bold text-sky-700">
                  ${rec.daily_hire_rate?.toLocaleString()}/day
                </span>
                <button
                  onClick={() => handleRecommendationCharter(rec)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Ship className="w-3 h-3" />
                  Charter Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by vessel name or IMO..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={vesselType}
            onChange={(e) => setVesselType(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Vessel Classes</option>
            <option value="Supramax">Supramax</option>
            <option value="Ultramax">Ultramax</option>
            <option value="Panamax">Panamax</option>
            <option value="Capesize">Capesize</option>
            <option value="Handymax">Handymax</option>
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available Now</option>
            <option value="Immediate">Immediate Laycan</option>
            <option value="Within 7 Days">Within 7 Days</option>
          </select>
        </div>
      </div>

      {/* VESSEL TABLE WITH HOVER TELEMETRY */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
          <span className="font-semibold">
            Showing {vessels.length} Bulk Carriers (Hover any vessel to reveal floating telemetry popup)
          </span>
          <span className="text-[11px] font-mono text-slate-400">Positioning updated via AIS</span>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
            <span className="text-xs text-slate-400">Filtering maritime fleet registry...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Vessel Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">DWT</th>
                  <th className="pb-3">Current Position</th>
                  <th className="pb-3">ETA</th>
                  <th className="pb-3">Daily Hire Rate</th>
                  <th className="pb-3">Fuel Cons.</th>
                  <th className="pb-3">Availability</th>
                  <th className="pb-3 text-right pr-2">AI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vessels.map((v) => (
                  <tr
                    key={v.id}
                    onMouseEnter={(e) => handleRowMouseEnter(v, e)}
                    onMouseLeave={handleRowMouseLeave}
                    className="hover:bg-sky-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                          <Ship className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors block">
                            {v.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{v.imo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">{v.vessel_type}</td>
                    <td className="py-3.5 text-slate-800 font-semibold">{v.dwt.toLocaleString()} MT</td>
                    <td className="py-3.5 text-slate-600 max-w-[180px] truncate" title={v.current_position_name}>
                      {v.current_position_name}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono">{v.eta}</td>
                    <td className="py-3.5 font-bold text-sky-700 font-mono">
                      ${v.daily_hire_rate.toLocaleString()}/d
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {v.fuel_consumption_tpd} TPD
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.availability_status === "Available"
                            ? "bg-emerald-100 text-emerald-800"
                            : v.availability_status === "Immediate"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {v.availability_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        {Number(v.recommendation_score).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHARTER FIXTURE CONFIRMATION MODAL */}
      {bookingVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Confirm Charter Fixture</h3>
              </div>
              <button
                onClick={() => setBookingVessel(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Fixture Confirmed!</h4>
                <p className="text-xs text-slate-600">{bookingSuccess}</p>
                <button
                  onClick={() => setBookingVessel(null)}
                  className="px-5 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl mt-2"
                >
                  Return to Charter Directory
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vessel:</span>
                    <strong className="text-slate-900">{bookingVessel.name} ({bookingVessel.imo})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class & DWT:</span>
                    <span className="font-semibold text-slate-800">{bookingVessel.vessel_type} • {bookingVessel.dwt.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Corridor:</span>
                    <span className="font-semibold text-slate-800">{selectedRoute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Daily Rate:</span>
                    <strong className="text-sky-700">${bookingVessel.daily_hire_rate.toLocaleString()} / day</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Laycan Window
                  </label>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <input
                      type="date"
                      defaultValue="2025-04-12"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <input
                      type="date"
                      defaultValue="2025-04-18"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setBookingVessel(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCharter}
                    disabled={isBooking}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Fixture"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
