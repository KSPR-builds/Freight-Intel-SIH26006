"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  Globe, 
  Calendar, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldAlert,
  Ship,
  Sun,
  Wind,
  Droplets
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlobalSearchModal } from "@/components/common/GlobalSearchModal";
import { AskFreightIQDrawer } from "@/components/assistant/AskFreightIQDrawer";

interface TopHeaderProps {
  userRole?: string;
  userName?: string;
}

export function TopHeader({ userRole = "user", userName = "Priya Sharma" }: TopHeaderProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("East Coast India");
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return `${month} ${year} (Q${q})`;
  });

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear();
    const q = Math.floor(now.getMonth() / 3) + 1;
    setCurrentDate(`${month} ${year} (Q${q})`);
  }, []);

  const regions = ["East Coast India", "Bay of Bengal", "All India Corridors", "Global Dry Bulk"];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("freightiq_token");
      localStorage.removeItem("freightiq_role");
      localStorage.removeItem("freightiq_name");
      router.push("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 bg-white/90 backdrop-blur-md border-b border-sky-100/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={userRole === "admin" ? "/dashboard" : "/my-assignments"}
            className="flex items-center gap-2.5 group whitespace-nowrap"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 bg-clip-text text-transparent whitespace-nowrap">
                  freight-intel
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100/70 text-sky-800 border border-sky-200/50 whitespace-nowrap shrink-0">
                  Maritime AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block whitespace-nowrap">
                AI-Powered Maritime Freight Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-400 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-sky-600" />
              <span>Search vessels, ports, routes, commodities...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Controls, AI Assistant, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Region Selector */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-sky-50/70 border border-sky-100 hover:bg-sky-100/70 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>{selectedRegion}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Date Selector */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDate}</span>
          </div>

          {/* Live Marine Weather Telemetry */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>28°C</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              <span>12 km/h</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-500" />
              <span>68%</span>
            </span>
          </div>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-sky-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">{userName}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${userRole === "admin" ? "text-purple-600" : "text-sky-600"}`}>
                  {userRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-800">{userName}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{userRole} Account</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Preferences</span>
                </Link>
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-700 font-semibold"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin Control Center</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium text-left mt-1 pt-2 border-t border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Ask FreightIQ Assistant Drawer */}
      <AskFreightIQDrawer isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
