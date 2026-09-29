"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

const POLL_INTERVAL = 12_000; // 12 seconds

export function useUnreadMessages() {
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef(0);

  const refreshMsg = useCallback(async () => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("freightiq_token")
          : null;
      if (!token) return;
      const res = await api.getUnreadMessageCount();
      setUnreadMsgCount(res.unread_count ?? 0);
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current += 1;
    } finally {
      const delay = Math.min(POLL_INTERVAL * Math.pow(2, errorCountRef.current), 300_000);
      timeoutRef.current = setTimeout(refreshMsg, delay);
    }
  }, []);

  useEffect(() => {
    refreshMsg();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refreshMsg]);

  return { unreadMsgCount, refreshMsg };
}
