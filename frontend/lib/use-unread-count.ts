"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

const POLL_INTERVAL = 12_000; // 12 seconds

/**
 * Polls /api/notifications/unread-count every POLL_INTERVAL ms.
 * Returns { unreadCount, refresh }.
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("freightiq_token")
          : null;
      if (!token) return;
      const res = await api.getUnreadCount();
      setUnreadCount(res.unread_count ?? 0);
    } catch {
      // silently swallow — network may be momentarily unavailable
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { unreadCount, refresh };
}
