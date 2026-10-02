"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { 
  TrendingUp, 
  Ship, 
  Boxes, 
  Anchor, 
  ArrowRight,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If logged in as standard user, redirect to /my-assignments
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("freightiq_role");
      if (storedRole === "user") {
        router.replace("/my-assignments");
        return;
      }
    }

    async function loadData() {
      try {
        const dashRes = await api.getDashboard().catch(() => null);
        setData(dashRes);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Exactly 4 KPI Cards (as specified in user requirements)
  const kpis = [
    {
      id: "freight-rate",
      label: "Freight Rate (Avg)",
      value: "$1,240 / TEU",
      trend: "↑ 6.2%",
      subtitle: "vs previous fixture cycle"
    },
    {
      id: "vessel-utilization",
      label: "Vessel Utilization",
      value: "82%",
      trend: "↑ 4.3%",
      subtitle: "fleet operating capacity"
    },
    {
      id: "cargo-volume",
      label: "Total Cargo Volume",
      value: "1.8M MT",
      trend: "↑ 7.5%",
      subtitle: "cumulative throughput"
    },
    {
      id: "cost-savings",
      label: "Est. Cost Savings",
      value: "$12.4M",
      trend: "↑ 9.8%",
      subtitle: "via AI-optimized fixtures"
    }
  ];

  // Exactly 4 Quick Access Feature Cards connected to existing pages
  const quickAccessCards = [
    {
      title: "Freight Forecasting",
      description: "AI-driven rate trajectories with multi-horizon confidence intervals",
      href: "/forecast",
      icon: TrendingUp
    },
    {
      title: "Vessel Chartering",
      description: "Fleet directory, vessel telemetry, and charter fixture recommendations",
      href: "/chartering",
      icon: Ship
    },
    {
      title: "Procurement Planning",
      description: "Bulk commodity price tracking, supplier scorecards & hedging windows",
      href: "/procurement",
      icon: Boxes
    },
    {
      title: "Ports & Routes",
      description: "East Coast India congestion indices, turnaround times & route planning",
      href: "/ports-routes",
      icon: Anchor
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading freight-intel Maritime Intelligence...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* 
        CONTINUOUS CONTAINER SHIP & OCEAN BACKGROUND:
        Stretches across the entire main dashboard content area.
        Bright natural daylight maritime photograph with ship positioned clearly on the right.
      */}
      <div 
        className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 rounded-3xl relative bg-cover bg-center flex flex-col justify-start font-sans overflow-hidden"
        style={{
          backgroundImage: `url('/madrid-maersk.jpg')`,
          backgroundPosition: "center right",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Light overlay: ensures left-side text is readable while keeping the ship clearly visible on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/10 pointer-events-none" />

        {/* Content Container Floating on Top of Bright Ship Background */}
        <div className="relative z-10 max-w-7xl w-full space-y-6">
          
          {/* ================================================== */}
          {/* 1. FREIGHTIQ TITLE (Floating directly over background, NO banner) */}
          {/* ================================================== */}
          <div className="space-y-1 pt-1 pb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans drop-shadow-xs">
                freight-intel
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100/90 text-sky-800 border border-sky-200/80 shadow-2xs backdrop-blur-xs">
                Maritime AI
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-700 tracking-wide drop-shadow-2xs">
              AI-Powered Maritime Freight Intelligence
            </p>
          </div>

          {/* ================================================== */}
          {/* 2. KPI CARDS: Exactly Four Light Translucent Cards in One Row */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white/85 hover:bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-sky-200/80 shadow-md shadow-sky-950/5 hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between h-full"
              >
                <div>
                  <span className="text-xs font-bold text-sky-900/80 uppercase tracking-wider block">
                    {kpi.label}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-1 tracking-tight font-mono">
                    {kpi.value}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-sky-100/80 mt-3 text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    {kpi.trend}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {kpi.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ================================================== */}
          {/* 3. QUICK ACCESS: Exactly Four Light Translucent Cards in One Row */}
          {/* ================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight drop-shadow-2xs">
                Quick Access
              </h2>
              <span className="text-xs font-semibold text-slate-600 shrink-0">
                Core Operational Modules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAccessCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group bg-white/85 hover:bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-sky-200/80 hover:border-sky-400 shadow-md shadow-sky-950/5 hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[150px]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:translate-x-1 group-hover:bg-sky-50 group-hover:text-sky-600 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
