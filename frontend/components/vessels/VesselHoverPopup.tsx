"use client";

import React, { useState, useEffect } from "react";
import { Vessel } from "@/types";
import { 
  Ship, 
  MapPin, 
  CheckCircle 
} from "lucide-react";

interface VesselHoverPopupProps {
  vessel: Vessel | null;
  anchorRect?: DOMRect | null;
  position?: { x: number; y: number } | null; // Backward-compatibility fallback
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onCharterClick?: (vessel: Vessel) => void;
  onCompareClick?: (vessel: Vessel) => void;
  onDetailsClick?: (vessel: Vessel) => void;
}

export function VesselHoverPopup({
  vessel,
  anchorRect,
  position,
  onMouseEnter,
  onMouseLeave,
  onCharterClick,
  onCompareClick,
  onDetailsClick
}: VesselHoverPopupProps) {
  const [coords, setCoords] = useState<{ x: number; y: number; placement: "right" | "left" | "below" | "above" } | null>(null);

  useEffect(() => {
    if (!vessel) {
      setCoords(null);
      return;
    }

    const popupWidth = 370;
    const popupHeight = 440;
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const margin = 12;

    if (anchorRect) {
      // 1. Calculate ideal position beside the row (right side first)
      const spaceRight = windowWidth - anchorRect.right - margin;
      const spaceLeft = anchorRect.left - margin;
      
      let left = 0;
      let top = 0;
      let placement: "right" | "left" | "below" | "above" = "right";

      // Horizontal positioning
      if (spaceRight >= popupWidth) {
        // Place on the right of the row
        left = anchorRect.right + 12;
        placement = "right";
      } else if (spaceLeft >= popupWidth) {
        // Place on the left of the row
        left = anchorRect.left - popupWidth - 12;
        placement = "left";
      } else {
        // Fallback: place centered or clamped under/above the row
        left = Math.max(margin, Math.min(windowWidth - popupWidth - margin, anchorRect.left + 24));
        if (windowHeight - anchorRect.bottom >= popupHeight + margin) {
          placement = "below";
        } else {
          placement = "above";
        }
      }

      // Vertical positioning relative to hovered vessel row
      if (placement === "below") {
        top = anchorRect.bottom + 8;
      } else if (placement === "above") {
        top = anchorRect.top - popupHeight - 8;
      } else {
        // Align vertically with the row's center / top
        const idealTop = anchorRect.top + (anchorRect.height / 2) - 80;
        // Clamp so it never goes off top or bottom of viewport
        top = Math.max(margin + 60, Math.min(windowHeight - popupHeight - margin, idealTop));
      }

      setCoords({ x: Math.round(left), y: Math.round(top), placement });
    } else if (position) {
      // Fallback if anchorRect not supplied
      const isRightOverflow = position.x + 16 + popupWidth > windowWidth - margin;
      const left = isRightOverflow
        ? Math.max(margin, position.x - popupWidth - 16)
        : position.x + 16;
      let top = position.y - 45;
      if (top + popupHeight > windowHeight - margin) {
        top = Math.max(margin + 60, windowHeight - popupHeight - margin);
      }
      if (top < margin + 60) top = margin + 60;
      setCoords({ x: Math.round(left), y: Math.round(top), placement: isRightOverflow ? "left" : "right" });
    } else {
      setCoords(null);
    }
  }, [vessel, anchorRect, position]);

  if (!vessel || !coords) return null;

  const whyReasons = vessel.why_recommended
    ? vessel.why_recommended.split(";").map(r => r.trim()).filter(Boolean)
    : ["Competitive daily hire rate", "High fuel efficiency engine", "Optimal draft for East Coast India"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
        width: "370px",
        zIndex: 50
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bg-white rounded-2xl shadow-xl shadow-sky-950/10 border border-sky-100 overflow-hidden pointer-events-auto transition-opacity duration-150 ease-out animate-in fade-in-50 zoom-in-98"
    >
      {/* Invisible bridge to prevent pointer gap dismissal when transitioning to popup */}
      {coords.placement === "right" && (
        <div className="absolute -left-3.5 top-0 bottom-0 w-3.5" />
      )}
      {coords.placement === "left" && (
        <div className="absolute -right-3.5 top-0 bottom-0 w-3.5" />
      )}
      {coords.placement === "below" && (
        <div className="absolute left-0 right-0 -top-3 h-3" />
      )}
      {coords.placement === "above" && (
        <div className="absolute left-0 right-0 -bottom-3 h-3" />
      )}

      {/* Header Image & Info Banner */}
      <div className="relative h-24 bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 overflow-hidden flex items-end p-3 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="absolute top-2 right-2 text-sky-400/30">
          <Ship className="w-14 h-14 transform -rotate-12" />
        </div>

        <div className="relative z-10 w-full flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                {vessel.vessel_type}
              </span>
              <span className="text-[10px] text-sky-200 font-mono">{vessel.imo}</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">{vessel.name}</h4>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-sky-200 uppercase font-semibold">Match Score</div>
            <div className="text-lg font-extrabold text-emerald-400 leading-none">
              {Number(vessel.recommendation_score).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Metrics Content */}
      <div className="p-3.5 space-y-3 text-xs text-slate-700">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Capacity</span>
            <span className="text-xs font-bold text-slate-800">{vessel.dwt.toLocaleString()} MT</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Daily Hire</span>
            <span className="text-xs font-bold text-sky-700 font-mono">${vessel.daily_hire_rate.toLocaleString()}/d</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Availability</span>
            <span className={`text-[10px] font-bold ${vessel.availability_status === "Available" ? "text-emerald-600" : "text-sky-600"}`}>
              {vessel.availability_status}
            </span>
          </div>
        </div>

        {/* Detailed Naval Architecture Specs */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] bg-sky-50/50 p-2.5 rounded-xl border border-sky-100/70">
          <div className="flex justify-between">
            <span className="text-slate-500">Built Year:</span>
            <span className="font-semibold text-slate-800">{vessel.built_year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">LOA × Beam:</span>
            <span className="font-semibold text-slate-800">{vessel.length_overall_m}m × {vessel.beam_m}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Draft:</span>
            <span className="font-semibold text-slate-800">{vessel.draft_m} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Flag:</span>
            <span className="font-semibold text-slate-800">{vessel.flag}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Speed / Fuel:</span>
            <span className="font-semibold text-slate-800">{vessel.service_speed_knots} kts • {vessel.fuel_consumption_tpd} TPD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Engine:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[80px]" title={vessel.main_engine}>
              {vessel.main_engine}
            </span>
          </div>
        </div>

        {/* Position & ETA */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate max-w-[160px]" title={vessel.current_position_name}>
              {vessel.current_position_name}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            ETA: <span className="font-bold text-slate-700">{vessel.eta}</span>
          </div>
        </div>

        {/* WHY RECOMMENDED SECTION */}
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Why Recommended
          </span>
          <div className="space-y-1">
            {whyReasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded-md border border-emerald-100">
                <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <button
            onClick={() => onDetailsClick?.(vessel)}
            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors text-center"
          >
            Full Details
          </button>
          <button
            onClick={() => onCompareClick?.(vessel)}
            className="px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] border border-sky-100 transition-colors text-center"
          >
            Compare
          </button>
          <button
            onClick={() => onCharterClick?.(vessel)}
            className="px-2 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] shadow-sm transition-colors text-center"
          >
            Charter Vessel
          </button>
        </div>
      </div>
    </div>
  );
}
