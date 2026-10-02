"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Ship,
  Boxes,
  Anchor,
  Sparkles,
  FileText,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  Calculator,
  Bell,
} from "lucide-react";
import { useUnreadCount } from "@/lib/use-unread-count";
import { useUnreadMessages } from "@/lib/use-unread-messages";
import { useOpenEmergenciesCount } from "@/lib/use-open-emergencies-count";
import { EmergencyModal } from "@/components/emergencies/EmergencyModal";

interface SidebarProps {
  userRole?: string;
  onOpenAssistant?: () => void;
}

/**
 * Shared row class: fixed clamped height, no padding on top/bottom (height
 * handles centering), identical horizontal padding for every row.
 * `items-center` keeps every child vertically centred regardless of badge.
 */
const ROW =
  "flex items-center gap-2.5 px-2.5 rounded-lg text-xs font-semibold transition-all group";
// The height is set inline via a CSS custom property so it responds to viewport height.
const ROW_STYLE = { height: "clamp(34px, 4.8vh, 44px)" };

export function Sidebar({ userRole = "user", onOpenAssistant }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const { unreadCount } = useUnreadCount();
  const { unreadMsgCount } = useUnreadMessages();
  const { openCount } = useOpenEmergenciesCount();

  // User-specific nav items
  const userNavItems = [
    { name: "My Assignments", href: "/my-assignments", icon: ClipboardList },
    { name: "Reports & Data", href: "/reports", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare, badgeCount: unreadMsgCount },
    { name: "Notifications", href: "/notifications", icon: Bell, badgeCount: unreadCount },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Admin-specific nav items
  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Freight Forecast", href: "/forecast", icon: TrendingUp },
    { name: "Contract Planner", href: "/admin/contract-planner", icon: Calculator },
    { name: "Vessel Chartering", href: "/chartering", icon: Ship },
    { name: "Cargo Procurement", href: "/procurement", icon: Boxes },
    { name: "Ports & Routes", href: "/ports-routes", icon: Anchor },
    { name: "AI Insights", href: "/insights", icon: Sparkles },
    { name: "Assignments", href: "/admin/assignments", icon: ClipboardList },
    { name: "Emergency Alerts", href: "/admin/emergencies", icon: AlertTriangle, badgeCount: openCount },
    { name: "Messages", href: "/messages", icon: MessageSquare, badgeCount: unreadMsgCount },
    { name: "Notifications", href: "/notifications", icon: Bell, badgeCount: unreadCount },
    { name: "Reports & Data", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const navItems = userRole === "admin" ? adminNavItems : userNavItems;

  return (
    <aside
      className={`relative h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-r border-sky-100/80 transition-all duration-300 flex flex-col justify-between z-20 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ── Navigation list ──────────────────────────────────────────── */}
      <div
        className="p-2 flex flex-col gap-1 overflow-y-auto"
        /* gap-1 = 4 px between every row, uniform for both roles */
      >
        {/* ── Admin Console highlight (admin only) ─────────────────── */}
        {userRole === "admin" && (
          <>
            <Link
              href="/admin"
              style={ROW_STYLE}
              className={`${ROW} font-bold border ${
                pathname === "/admin"
                  ? "bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white border-purple-400 shadow-sm shadow-purple-600/30 ring-1 ring-purple-400/40"
                  : "text-purple-800 bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 hover:bg-purple-100/90 border-purple-200/80 shadow-2xs hover:shadow-xs"
              }`}
              title={collapsed ? "Admin Console (Master)" : undefined}
            >
              {/* Icon — fixed 16 px, never moves */}
              <ShieldAlert
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  pathname === "/admin" ? "text-white" : "text-purple-600"
                }`}
              />

              {/* Label + MASTER badge */}
              {!collapsed && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate tracking-tight">Admin Console</span>
                  <span
                    className={`shrink-0 w-[42px] text-center text-[9px] px-1.5 py-0.5 rounded-full uppercase font-mono tracking-wider font-extrabold ${
                      pathname === "/admin"
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-purple-200/90 text-purple-900 border border-purple-300/80"
                    }`}
                  >
                    MASTER
                  </span>
                </div>
              )}
            </Link>

            {/* Thin divider + spacing that separates Admin Console from the rest */}
            <div className="mx-1 mt-1.5 mb-0.5 border-t border-slate-200/80" />
          </>
        )}

        {/* ── Regular nav rows ─────────────────────────────────────── */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const badgeCount = (item as any).badgeCount || 0;
          const showBadge = badgeCount > 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              style={ROW_STYLE}
              className={`${ROW} ${
                isActive
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-xs shadow-sky-600/20"
                  : "text-slate-600 hover:bg-sky-50/70 hover:text-sky-700"
              }`}
              title={collapsed ? item.name : undefined}
            >
              {/* Icon wrapper — fixed size, relative for dot badge */}
              <div className="relative shrink-0">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-white"
                      : "text-sky-600 group-hover:scale-110 transition-transform"
                  }`}
                />
                {/* Dot badge — collapsed only */}
                {showBadge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white" />
                )}
              </div>

              {/* Label + count badge — expanded only */}
              {!collapsed && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.name}</span>
                  {/*
                    Fixed 20×20 badge so single-digit and double-digit look
                    identical and NEVER push the row taller (the row height
                    is locked by ROW_STYLE above).
                  */}
                  {showBadge && (
                    <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Bottom: Emergency (user only) + collapse button ─────────── */}
      <div className="p-2 border-t border-slate-100 flex flex-col gap-1 shrink-0">
        {userRole === "user" && (
          <button
            onClick={() => setEmergencyOpen(true)}
            style={ROW_STYLE}
            className={`w-full flex items-center justify-center gap-2 px-2 rounded-lg font-bold text-xs transition-all ${
              collapsed
                ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                : "bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20"
            }`}
            title={collapsed ? "Report Emergency" : undefined}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Emergency</span>}
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={ROW_STYLE}
          className="w-full flex items-center justify-center px-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </aside>
  );
}
