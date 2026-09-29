"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useUnreadCount } from "@/lib/use-unread-count";
import {
  Bell,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCheck,
  Check,
  Loader2,
  ExternalLink,
  Package,
  RefreshCw,
  X,
} from "lucide-react";

// ─── Type icon mapping ────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; colorClass: string; bgClass: string }
> = {
  assignment_new: {
    icon: <ClipboardList className="w-4 h-4" />,
    label: "New Assignment",
    colorClass: "text-sky-700",
    bgClass: "bg-sky-100",
  },
  assignment_updated: {
    icon: <ClipboardList className="w-4 h-4" />,
    label: "Assignment Updated",
    colorClass: "text-amber-700",
    bgClass: "bg-amber-100",
  },
  message: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Message",
    colorClass: "text-violet-700",
    bgClass: "bg-violet-100",
  },
  emergency: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Emergency",
    colorClass: "text-rose-700",
    bgClass: "bg-rose-100",
  },
  emergency_ack: {
    icon: <Check className="w-4 h-4" />,
    label: "Emergency Acknowledged",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
  },
};

function getTypeConfig(type: string) {
  return (
    TYPE_CONFIG[type] ?? {
      icon: <Info className="w-4 h-4" />,
      label: type,
      colorClass: "text-slate-600",
      bgClass: "bg-slate-100",
    }
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const { refresh: refreshBadge } = useUnreadCount();

  const load = useCallback(async () => {
    try {
      const res = await api.getUserNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: number) => {
    setMarkingId(id);
    try {
      await api.markNotificationsRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      refreshBadge();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refreshBadge();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered =
    typeFilter === "all"
      ? notifications
      : typeFilter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.type === typeFilter);

  const allTypes = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sky-100/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-sky-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Assignment updates, messages, and system alerts — newest first.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={load}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {markingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-fit text-xs font-semibold flex-wrap">
            {[
              { key: "all", label: `All (${notifications.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              ...allTypes.map((t) => ({
                key: t,
                label: getTypeConfig(t).label,
              })),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  typeFilter === tab.key
                    ? "bg-white text-sky-800 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
            <p className="text-xs font-medium">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sky-100 py-20 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center">
              <Bell className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {typeFilter === "unread"
                  ? "All caught up!"
                  : "No notifications"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                {typeFilter === "unread"
                  ? "You have no unread notifications."
                  : "When your admin sends assignment updates or messages, they'll appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const cfg = getTypeConfig(notif.type);
              const isUnread = !notif.is_read;

              return (
                <div
                  key={notif.id}
                  className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    isUnread
                      ? "bg-sky-50/60 border-sky-200/80 shadow-xs"
                      : "bg-white border-slate-100 opacity-80"
                  }`}
                >
                  {/* Unread indicator strip */}
                  {isUnread && (
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-sky-500 rounded-full" />
                  )}

                  {/* Type icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgClass} ${cfg.colorClass}`}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-xs font-bold leading-snug ${
                              isUnread ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.bgClass} ${cfg.colorClass}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>

                      {/* Time + actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {timeAgo(notif.created_at)}
                        </span>
                        {isUnread && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            disabled={markingId === notif.id}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-100 transition-colors"
                            title="Mark as read"
                          >
                            {markingId === notif.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Link to related page */}
                    {notif.link_url && (
                      <Link
                        href={notif.link_url}
                        onClick={() => {
                          if (isUnread) handleMarkRead(notif.id);
                        }}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-sky-600 hover:text-sky-800 hover:underline underline-offset-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View details</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
