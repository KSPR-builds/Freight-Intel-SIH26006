import type { Metadata } from "next";
import "./globals.css";
import { ScenarioProvider } from "@/lib/scenario-context";

export const metadata: Metadata = {
  title: "freight-intel — AI-Powered Maritime Freight Intelligence",
  description: "Intelligent freight forecasting, vessel chartering optimization, and bulk cargo procurement for East Coast India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f0f7fd] text-slate-900 selection:bg-sky-500 selection:text-white">
        <ScenarioProvider>
          {children}
        </ScenarioProvider>
      </body>
    </html>
  );
}
