import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2, Info } from "lucide-react";
import { api } from "@/lib/api";

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  const [category, setCategory] = useState("severe_weather");
  const [severity, setSeverity] = useState("high");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  
  const [step, setStep] = useState<"form" | "confirm" | "status">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<any>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep("form");
      setCategory("severe_weather");
      setSeverity("high");
      setMessage("");
      setError(null);
      setSuccessStatus(null);
      
      // Attempt to load active assignment for location default
      api.getAssignments().then(assignments => {
        const active = assignments.find((a: any) => a.status === "active");
        if (active) {
          setLocation(`${active.route.origin.name} → ${active.route.destination.name}`);
        } else {
          setLocation("");
        }
      }).catch(() => setLocation(""));
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.fileEmergency({
        category,
        severity,
        location,
        message
      });
      setSuccessStatus(res);
      setStep("status");
    } catch (e: any) {
      if (e.message?.includes("429")) {
        setError("Rate limit exceeded. You can only submit 3 emergencies per 10 minutes.");
      } else {
        setError("Failed to submit emergency report. Please try again.");
      }
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-rose-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-rose-500 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <AlertTriangle className="w-5 h-5" />
            Report Emergency
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "form" && (
            <div className="space-y-4 text-sm">
              <p className="text-slate-600 mb-2">
                Use this form only for urgent operational issues that require immediate admin attention.
              </p>
              
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                  >
                    <option value="cyclone">Cyclone</option>
                    <option value="severe_weather">Severe weather</option>
                    <option value="war_security">War / Security</option>
                    <option value="port_closure">Port closure</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                  <select 
                    value={severity} 
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 font-semibold"
                  >
                    <option value="low" className="text-slate-700">Low</option>
                    <option value="medium" className="text-amber-600">Medium</option>
                    <option value="high" className="text-orange-600">High</option>
                    <option value="critical" className="text-rose-600">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Route / Vessel</label>
                <input 
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Paradip Port Anchorage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the situation..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 resize-none h-24"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setStep("confirm")}
                  disabled={!message.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Submission</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                Are you sure you want to send this emergency alert? This will immediately notify all system admins.
              </p>
              
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setStep("form")}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Back to Edit
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Confirm Send
                </button>
              </div>
            </div>
          )}

          {step === "status" && successStatus && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Emergency Sent</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                Your report has been logged and admins have been notified. Check your messages for any updates.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 inline-block text-left mb-6 min-w-[200px]">
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Current Status</div>
                <div className="flex items-center gap-2 font-semibold text-slate-800 capitalize">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {successStatus.status}
                </div>
              </div>

              <div>
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
