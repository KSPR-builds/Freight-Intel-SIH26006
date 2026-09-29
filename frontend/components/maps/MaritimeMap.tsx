"use client";

import React, { useEffect, useRef, useState } from "react";
import { PortInfo, RouteOption } from "@/types";
import { Anchor, Navigation, Layers, Info } from "lucide-react";

interface MaritimeMapProps {
  ports?: PortInfo[];
  selectedRoute?: RouteOption | null;
  height?: string;
  onPortClick?: (port: PortInfo) => void;
}

export function MaritimeMap({
  ports = [],
  selectedRoute,
  height = "480px",
  onPortClick
}: MaritimeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const container = mapContainerRef.current;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !container) return;

      if (!mapInstanceRef.current) {
        // Initialize map centered on Bay of Bengal / Indian Ocean
        const map = L.map(container, {
          center: [14.0, 85.0],
          zoom: 5,
          minZoom: 3,
          maxZoom: 12,
          scrollWheelZoom: true
        });

        // CartoDB Positron - Light clean enterprise map style
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap',
            subdomains: "abcd",
            maxZoom: 19
          }
        ).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing non-tile layers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // 1. Draw Default Corridor Routes
      const defaultLanes = [
        [[1.29027, 103.8519], [5.65, 95.3], [8.5, 87.0], [13.0827, 80.2707]], // Chennai
        [[1.29027, 103.8519], [5.65, 95.3], [11.5, 88.2], [17.6868, 83.2185]], // Vizag
        [[1.29027, 103.8519], [5.65, 95.3], [14.2, 89.5], [20.3164, 86.6111]], // Paradip
        [[-1.2692, 116.8253], [5.8, 95.5], [12.0, 87.5], [17.6868, 83.2185]] // Kalimantan to Vizag
      ];

      defaultLanes.forEach((lane, idx) => {
        L.polyline(lane as any, {
          color: idx === 0 ? "#0284c7" : "#94a3b8",
          weight: idx === 0 ? 3.5 : 2,
          opacity: 0.75,
          dashArray: idx === 0 ? undefined : "5, 8"
        }).addTo(map);
      });

      // 2. Draw Selected Highlighted Route if provided
      if (selectedRoute && selectedRoute.waypoints && selectedRoute.waypoints.length > 0) {
        L.polyline(selectedRoute.waypoints as any, {
          color: "#0369a1",
          weight: 4,
          opacity: 0.95
        }).addTo(map);
      }

      // 3. Add Port Markers
      ports.forEach((p) => {
        const isEastCoast = p.region === "East Coast India";
        const color = isEastCoast ? "#0284c7" : "#0d9488";

        const marker = L.circleMarker([p.latitude, p.longitude], {
          radius: isEastCoast ? 7 : 5,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 170px; padding: 2px;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              ${p.name} <span style="font-size: 10px; color: #64748b;">(${p.code})</span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">${p.region}, ${p.country}</div>
            <div style="font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
              <span>Draft Depth:</span>
              <strong style="color: #0369a1;">${p.draft_depth_m} m</strong>
            </div>
            <div style="font-size: 11px; display: flex; justify-content: space-between;">
              <span>Congestion:</span>
              <strong style="color: ${p.congestion_index > 30 ? "#b91c1c" : "#15803d"};">${p.congestion_index} Index</strong>
            </div>
            <div style="font-size: 11px; display: flex; justify-content: space-between;">
              <span>Wait Time:</span>
              <strong>${p.waiting_time_days} days</strong>
            </div>
          </div>
        `);

        marker.on("click", () => {
          onPortClick?.(p);
        });
      });

      // 4. Live Vessel Markers
      const vesselSamples = [
        { name: "MV Baltic Star", lat: 14.5, lng: 84.8, type: "Supramax", status: "In Transit" },
        { name: "MV Ocean Grace", lat: 10.2, lng: 91.5, type: "Ultramax", status: "Ballasting" },
        { name: "MV Iron Pioneer", lat: 18.2, lng: 85.1, type: "Capesize", status: "Anchored" }
      ];

      vesselSamples.forEach((v) => {
        const vMarker = L.circleMarker([v.lat, v.lng], {
          radius: 6,
          fillColor: "#f59e0b",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(map);

        vMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #0f172a;">${v.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${v.type} • ${v.status}</span>
          </div>
        `);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [ports, selectedRoute, onPortClick]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-sky-100 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />

      {/* Map Overlay Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-sky-100 shadow-md text-xs space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
          Maritime Legend
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-3 h-3 rounded-full bg-sky-600 border border-white inline-block" />
          <span>East Coast India Ports</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-3 h-3 rounded-full bg-teal-600 border border-white inline-block" />
          <span>International Origin Ports</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block" />
          <span>AIS Tracked Vessels</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-4 h-0.5 bg-sky-600 inline-block" />
          <span>Optimized Shipping Lane</span>
        </div>
      </div>
    </div>
  );
}
