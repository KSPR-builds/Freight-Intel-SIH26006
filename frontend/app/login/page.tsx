"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Ship, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldAlert, 
  User, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Info
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status states
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: "user" | "admin") => {
    setActiveTab(tab);
    setErrorMsg("");
    setInfoMsg("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const isAdmin = activeTab === "admin";
    const trimmedIdentifier = email.trim();

    // ── DEMO MODE: No network call, inputs are completely optional ──
    if (isDemoMode) {
      setIsLoading(true);
      const chosenRole = isAdmin ? "admin" : "user";
      const displayName = trimmedIdentifier 
        ? trimmedIdentifier.split("@")[0] 
        : (isAdmin ? "Captain R. K. Nair" : "Priya Sharma");

      if (typeof window !== "undefined") {
        localStorage.setItem("freightiq_token", `demo-token-${chosenRole}-${Date.now()}`);
        localStorage.setItem("freightiq_role", chosenRole);
        localStorage.setItem("freightiq_name", displayName);
        document.cookie = `freightiq_role=${chosenRole}; path=/; max-age=86400; SameSite=Lax`;
      }

      const targetRoute = chosenRole === "admin" ? "/dashboard" : "/my-assignments";
      router.push(targetRoute);
      return;
    }

    // ── LIVE MODE (REAL AUTH) ──
    if (!trimmedIdentifier) {
      setErrorMsg(activeTab === "user" ? "Please enter your Email or Username." : "Please enter your Admin Email / Username.");
      return;
    }

    if (!password) {
      setErrorMsg("Password cannot be empty.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.login(trimmedIdentifier, password, isAdmin);

      const resolvedRole = res.role || (isAdmin ? "admin" : "user");
      if (typeof window !== "undefined") {
        localStorage.setItem("freightiq_token", res.access_token);
        localStorage.setItem("freightiq_role", resolvedRole);
        localStorage.setItem("freightiq_name", res.full_name || (isAdmin ? "Administrator" : "Enterprise User"));
        document.cookie = `freightiq_role=${resolvedRole}; path=/; max-age=86400; SameSite=Lax`;
      }

      router.push(resolvedRole === "admin" ? "/dashboard" : "/my-assignments");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("Password reset request submitted. Please consult your maritime administrator.");
  };

  return (
    <div className="min-h-screen bg-[#f0f7fd] flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Subtle Ocean Gradient Background Accents */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Centered Authentication Container */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-sky-900/5 border border-sky-100 p-6 sm:p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Ship className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">freight-intel</span>
            </Link>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to freight-intel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {isDemoMode 
              ? "Hackathon Demo Mode active: Select a role and click Login. Credentials are fully optional."
              : "Select your role to access your maritime freight intelligence dashboard."}
          </p>
        </div>

        {/* TWO SEPARATED LOGIN OPTIONS (TABS) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 text-xs font-semibold gap-1.5 border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleTabChange("user")}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "user"
                ? "bg-white text-sky-700 shadow-sm border border-sky-100 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>User Login</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "admin"
                ? "bg-purple-700 text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Form Context Banner */}
        <div className="mb-5 flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {activeTab === "user" ? "Standard User Portal" : "Enterprise Admin Portal"}
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeTab === "user"
                ? "Freight rate forecasts, vessel fixtures & procurement tools"
                : "System operations, user management & ML engine telemetry"}
            </p>
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            activeTab === "user" ? "bg-sky-100 text-sky-800" : "bg-purple-100 text-purple-800"
          }`}>
            {activeTab === "user" ? "Charterer" : "Admin"}
          </span>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info Notification */}
        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-700 font-medium flex items-start gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {activeTab === "user" ? "Email / Username" : "Admin Username / Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder={activeTab === "user" ? "user@freight-intel.com" : "admin@freight-intel.com"}
                className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-900 placeholder:text-slate-400 transition-all ${
                  activeTab === "admin" 
                    ? "focus:border-purple-500 focus:ring-purple-500/20" 
                    : "focus:border-sky-500 focus:ring-sky-500/20"
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {activeTab === "user" ? "Password" : "Admin Password"}
              </label>
              {activeTab === "user" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="••••••••••••"
                className={`w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-900 placeholder:text-slate-400 transition-all ${
                  activeTab === "admin" 
                    ? "focus:border-purple-500 focus:ring-purple-500/20" 
                    : "focus:border-sky-500 focus:ring-sky-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/20 focus:ring-2"
              />
              <span className="font-normal text-slate-600">Remember session on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer ${
              activeTab === "admin"
                ? "bg-purple-700 hover:bg-purple-800 shadow-purple-700/20 hover:shadow-md"
                : "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20 hover:shadow-md"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{activeTab === "user" ? "User Login" : "Admin Login"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* QUICK ACCESS CREDENTIALS — only visible in non-production / demo mode */}
        {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDS === "true" && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Access
              </span>
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                Dev / Demo Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900">User Account</span>
                  <span className="text-[10px] bg-sky-200/60 text-sky-800 px-1.5 py-0.2 rounded font-semibold">Charterer</span>
                </div>
                <p className="text-slate-600 mt-1 font-mono">user@freight-intel.com</p>
                <p className="text-slate-400 font-mono text-[10px]">Standard User Access</p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Admin Account</span>
                  <span className="text-[10px] bg-purple-200/60 text-purple-800 px-1.5 py-0.2 rounded font-semibold">Admin</span>
                </div>
                <p className="text-slate-600 mt-1 font-mono">admin@freight-intel.com</p>
                <p className="text-slate-400 font-mono text-[10px]">Access to /admin console</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-slate-400">
        © 2026 freight-intel Technologies • AI-Powered Maritime Intelligence
      </footer>
    </div>
  );
}
