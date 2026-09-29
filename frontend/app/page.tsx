"use client";

import React from "react";
import Link from "next/link";
import { Ship, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f7fd] text-slate-900 selection:bg-sky-500 selection:text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-sky-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">freight-intel</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-grow flex flex-col items-center justify-center px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Glow & Grid Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none mb-4 lowercase">
          freight-intel
        </h1>
        
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
          AI-Powered Maritime Freight Intelligence
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          AI-driven freight forecasting and maritime logistics optimization for smarter vessel chartering, cargo procurement, and route planning.
        </p>

        <div className="flex items-center justify-center">
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-lg shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to freight-intel</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 text-center">
        <p>© 2026 freight-intel Technologies. AI-Powered Maritime Freight Intelligence. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Designed for East Coast India Port Corridors: Chennai, Visakhapatnam, Paradip, Kolkata, and Kakinada.
        </p>
      </footer>
    </div>
  );
}
