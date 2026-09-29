"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FreightScenario {
  origin: string;
  destination: string;
  commodity: string;
  vesselType: string;
  horizonDays: number;
  tradeDirection: "import" | "export";
  isSet: boolean;
}

interface ScenarioContextValue {
  scenario: FreightScenario;
  saveScenario: (s: Omit<FreightScenario, "isSet">) => void;
  clearScenario: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_SCENARIO: FreightScenario = {
  origin: "Singapore",
  destination: "Visakhapatnam",
  commodity: "Coal",
  vesselType: "Supramax",
  horizonDays: 30,
  tradeDirection: "import",
  isSet: false,
};

const STORAGE_KEY = "freightiq_scenario";

// ─── Context ─────────────────────────────────────────────────────────────────
const ScenarioContext = createContext<ScenarioContextValue>({
  scenario: DEFAULT_SCENARIO,
  saveScenario: () => {},
  clearScenario: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenario, setScenario] = useState<FreightScenario>(DEFAULT_SCENARIO);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FreightScenario;
        setScenario(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveScenario = useCallback((s: Omit<FreightScenario, "isSet">) => {
    const next: FreightScenario = { ...s, isSet: true };
    setScenario(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const clearScenario = useCallback(() => {
    setScenario(DEFAULT_SCENARIO);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <ScenarioContext.Provider value={{ scenario, saveScenario, clearScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useScenario() {
  return useContext(ScenarioContext);
}

// ─── Active Scenario Banner (shared UI component) ─────────────────────────────
export function ActiveScenarioBanner() {
  const { scenario } = useScenario();

  if (!scenario.isSet) return null;

  const horizonLabel =
    scenario.horizonDays === 7
      ? "7 Days"
      : scenario.horizonDays === 30
      ? "30 Days"
      : scenario.horizonDays === 90
      ? "90 Days"
      : "1 Year";

  return (
    <div className="flex items-center gap-3 bg-sky-50/90 border border-sky-200/80 rounded-2xl px-4 py-2.5 text-xs backdrop-blur-sm shadow-xs">
      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full shrink-0">
        Active Scenario
      </span>
      <span className="font-bold text-slate-800 truncate">
        {scenario.origin} → {scenario.destination}
      </span>
      <span className="text-slate-400 shrink-0">•</span>
      <span className="text-slate-600 truncate">
        {scenario.commodity} • {scenario.vesselType} • {horizonLabel}
      </span>
    </div>
  );
}
