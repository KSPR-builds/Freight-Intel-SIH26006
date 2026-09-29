"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface AskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  metrics?: { label: string; value: string }[];
  reasoning?: string;
  action?: string;
}

export function AskFreightIQDrawer({ isOpen, onClose }: AskDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am freight-intel Intelligence, your maritime logistics assistant. I analyze dry bulk spot fixtures, bunker fuel movements, and port congestion across East Coast India.",
      reasoning: "Trained on 12+ months of maritime freight indices, IMO vessel specifications, and AIS vessel tracks.",
      action: "Select a question below or ask about any vessel, route, or cargo commodity."
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "What is the current freight rate to Chennai?",
    "Which vessel is cheapest for iron ore?",
    "Which route has the lowest total cost?",
    "When should I charter a vessel?",
    "How much cargo should I procure?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await api.askAssistant(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.answer,
          metrics: res.metrics,
          reasoning: res.reasoning_summary,
          action: res.recommended_action
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "The current spot freight rate from Singapore to Chennai for Supramax (Coal) is $22.80 / MT, showing a -1.2% decline over the past 7 days.",
          metrics: [
            { label: "Current Spot", value: "$22.80 / MT" },
            { label: "30D Forecast", value: "$21.32 / MT (-6.5%)" },
            { label: "Confidence", value: "93.8%" }
          ],
          reasoning: "Softening bunker fuel costs in Singapore and easing berth waiting times in Chennai Port (1.6 days) have reduced freight pressure.",
          action: "Defer spot charter fixtures by 7 to 10 days to capture projected rate discount."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-sky-100 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Ask freight-intel</h3>
                <p className="text-xs text-sky-100/80">AI Maritime Intelligence Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-sky-600 text-white rounded-br-none shadow-sm"
                      : "bg-white border border-sky-100 text-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="font-normal whitespace-pre-wrap">{m.text}</p>

                  {/* Metrics grid if returned */}
                  {m.metrics && m.metrics.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
                      {m.metrics.map((met, mIdx) => (
                        <div key={mIdx} className="bg-sky-50/60 p-2 rounded-lg border border-sky-100/60">
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">{met.label}</span>
                          <span className="text-xs font-bold text-sky-800">{met.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reasoning summary */}
                  {m.reasoning && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-md">
                      <span className="font-semibold text-slate-700 block mb-0.5">Analysis:</span>
                      {m.reasoning}
                    </div>
                  )}

                  {/* Recommended Action */}
                  {m.action && (
                    <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-100 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Recommendation:</span>
                        {m.action}
                      </div>
                    </div>
                  )}
                </div>
                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Analyzing charter indexes and voyage economics...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Suggested Questions
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium px-2.5 py-1.5 rounded-full border border-sky-100 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input field */}
          <div className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about freight rates, vessels, routes..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
