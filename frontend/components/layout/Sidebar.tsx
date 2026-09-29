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
      {/* Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const badgeCount = (item as any).badgeCount || 0;
          const showBadge = badgeCount > 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-xs shadow-sky-600/20"
                  : "text-slate-600 hover:bg-sky-50/70 hover:text-sky-700"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div className="relative shrink-0">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-white"
                      : "text-sky-600 group-hover:scale-110 transition-transform"
                  }`}
                />
                {/* Unread dot — shows even when collapsed */}
                {showBadge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white" />
                )}
              </div>

              {!collapsed && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.name}</span>
                  {showBadge && (
                    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}

        {/* Admin Console link */}
        {userRole === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group mt-3 ${
              pathname === "/admin"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-700 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100"
            }`}
            title={collapsed ? "Admin Console" : undefined}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600 group-hover:scale-110 transition-transform" />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Admin Console</span>
                <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full uppercase font-mono">
                  Master
                </span>
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Bottom: AI promo (admin only) + Emergency (user only) + Collapse */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!collapsed && userRole === "admin" && (
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 p-3 rounded-xl border border-sky-100 text-xs">
            <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Ask freight-intel</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Query vessel day rates, draft clearance, or route fuel economics.
            </p>
            <Link
              href="/insights"
              className="inline-block text-[11px] font-semibold text-sky-700 hover:text-sky-800"
            >
              Open AI Workspace →
            </Link>
          </div>
        )}

        {userRole === "user" && (
          <button
            onClick={() => setEmergencyOpen(true)}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl font-bold transition-all ${
              collapsed
                ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                : "bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20"
            }`}
            title={collapsed ? "Report Emergency" : undefined}
          >
            <AlertTriangle className="w-4 h-4" />
            {!collapsed && <span>Emergency</span>}
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
