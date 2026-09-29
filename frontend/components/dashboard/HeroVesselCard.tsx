"use client";

import React from "react";
import Link from "next/link";
import { 
  Crosshair, 
  Gauge, 
  Navigation, 
  ExternalLink,
  Anchor
} from "lucide-react";

export interface HeroVesselData {
  id?: number;
  name: string;
  imo: string;
  mmsi: string;
  callSign: string;
  vesselType: string;
  status: "Underway" | "Moored" | "Anchored" | "In Port";
  coordinates: string;
  speedKnots: number;
  heading: string;
  headingDeg: number;
  departurePort: string;
  departureTime: string;
  destinationPort: string;
  destinationTime: string;
  duration: string;
  remaining: string;
  progressPct: number;
  imageUrl?: string;
}

interface HeroVesselCardProps {
  vessel: HeroVesselData;
  onViewLiveTrack?: () => void;
}

export function HeroVesselCard({ vessel, onViewLiveTrack }: HeroVesselCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center border border-sky-200/50">
            <Anchor className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Vessel Details
          </span>
        </div>

        <Link
          href="/ports-routes"
          onClick={onViewLiveTrack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-sky-50/80 text-slate-700 hover:text-sky-700 font-semibold text-xs border border-white/90 shadow-2xs backdrop-blur-md transition-all"
        >
          <span>View Live Track</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
        </Link>
      </div>

      {/* Vessel Identity */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {vessel.name}
        </h2>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
          IMO: <span className="text-slate-700 font-semibold">{vessel.imo}</span>
          <span className="mx-1.5 text-slate-300">|</span>
          MMSI: <span className="text-slate-700 font-semibold">{vessel.mmsi}</span>
          <span className="mx-1.5 text-slate-300">|</span>
          Call Sign: <span className="text-slate-700 font-semibold">{vessel.callSign}</span>
        </p>
      </div>

      {/* Vessel Hero Image & Status Overlay */}
      <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden shadow-inner border border-white/60 bg-slate-900 group">
        <img
          src={vessel.imageUrl || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80"}
          alt={vessel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Translucent Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20" />

        {/* Floating Underway Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[11px] font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {vessel.status}
          </span>
        </div>

        {/* Vessel Class Tag */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-mono font-medium border border-white/15">
            {vessel.vesselType}
          </span>
        </div>
      </div>

      {/* Telemetry Metric Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/50 backdrop-blur-md p-2.5 rounded-xl border border-white/70 shadow-2xs flex items-center gap-2 hover:bg-white/80 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200/40">
            <Crosshair className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Coordinates</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{vessel.coordinates}</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-2.5 rounded-xl border border-white/70 shadow-2xs flex items-center gap-2 hover:bg-white/80 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/40">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Speed</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{vessel.speedKnots} knots</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-2.5 rounded-xl border border-white/70 shadow-2xs flex items-center gap-2 hover:bg-white/80 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200/40">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Heading</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{vessel.heading}</span>
          </div>
        </div>
      </div>

      {/* Voyage Route & Progress Section */}
      <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Departure</span>
            <strong className="text-slate-900 block text-xs mt-0.5">{vessel.departurePort}</strong>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{vessel.departureTime}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
            <strong className="text-slate-900 block text-xs mt-0.5">{vessel.destinationPort}</strong>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{vessel.destinationTime}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Duration</span>
            <strong className="text-slate-800 font-semibold">{vessel.duration}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Remaining</span>
            <strong className="text-sky-700 font-semibold">{vessel.remaining}</strong>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
            <span className="text-slate-500">Voyage Completion</span>
            <span className="text-emerald-700">{vessel.progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${vessel.progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
