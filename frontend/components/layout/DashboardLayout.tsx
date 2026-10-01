"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const [role, setRole] = useState<string>("user");
  const [userName, setUserName] = useState<string>("Priya Sharma");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("freightiq_token");
      const storedRole = localStorage.getItem("freightiq_role") || "user";
      const storedName = localStorage.getItem("freightiq_name") || "Priya Sharma";

      // If no token and demo mode is active, initialize demo session
      if (!token) {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
          const defaultDemoRole = requiredRole || "user";
          localStorage.setItem("freightiq_token", `demo-token-${defaultDemoRole}`);
          localStorage.setItem("freightiq_role", defaultDemoRole);
          localStorage.setItem("freightiq_name", defaultDemoRole === "admin" ? "Captain R. K. Nair" : "Priya Sharma");
          document.cookie = `freightiq_role=${defaultDemoRole}; path=/; max-age=86400; SameSite=Lax`;
          setRole(defaultDemoRole);
          setUserName(defaultDemoRole === "admin" ? "Captain R. K. Nair" : "Priya Sharma");
          setIsLoading(false);
          return;
        }
        router.push("/login");
        return;
      }

      // Check required role for admin pages
      if (requiredRole === "admin" && storedRole !== "admin") {
        router.push("/my-assignments");
        return;
      }

      setRole(storedRole);
      setUserName(storedName);
      setIsLoading(false);
    }
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading freight-intel Maritime Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
      {/* Top Header */}
      <TopHeader userRole={role} userName={userName} />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar userRole={role} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
