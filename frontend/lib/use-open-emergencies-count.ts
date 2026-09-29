"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

const POLL_INTERVAL = 15_000; // 15 seconds

export function useOpenEmergenciesCount() {
  const [openCount, setOpenCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef(0);

  const refreshCount = useCallback(async () => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("freightiq_token")
          : null;
      if (!token) return;
      const res = await api.getOpenEmergenciesCount();
      setOpenCount(res.open_count ?? 0);
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current += 1;
    } finally {
      const delay = Math.min(POLL_INTERVAL * Math.pow(2, errorCountRef.current), 300_000);
      timeoutRef.current = setTimeout(refreshCount, delay);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refreshCount]);

  return { openCount, refreshCount };
}
