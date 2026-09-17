"use client";

import React, { useEffect } from "react";
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";

export function AiAssistPanel() {
  const { items, patient, aiInteractions, setAiInteractions, isAiAnalyzing, setIsAiAnalyzing, updateItem } = usePrescriptionStore();

  const runAiAnalysis = async () => {
    if (items.length === 0) {
      setAiInteractions([]);
      return;
    }

    setIsAiAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          patientAllergies: patient.allergies,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiInteractions(data.interactions || []);

        // Apply intelligent dosage auto-fills if requested or if item dosage is empty
        if (data.dosageSuggestions) {
          items.forEach((item) => {
            const suggestion = data.dosageSuggestions[item.id];
            if (suggestion && (!item.frequency || item.frequency.trim() === "")) {
              updateItem(item.id, {
                doseQuantity: suggestion.doseQuantity,
                frequency: suggestion.frequency,
                duration: suggestion.duration,
                instructions: suggestion.instructions,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  useEffect(() => {
    runAiAnalysis();
  }, [items.length, patient.allergies]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Rosheta Clinical AI Assist</h4>
            <p className="text-[10px] text-slate-400">Real-time interaction safety & dosage auto-fill</p>
          </div>
        </div>

        <button
          onClick={runAiAnalysis}
          disabled={isAiAnalyzing}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          title="Re-run AI Safety Scan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiAnalyzing ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Warning List */}
      {aiInteractions.length > 0 ? (
        <div className="space-y-2">
          {aiInteractions.map((warning) => (
            <div
              key={warning.id}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                warning.severity === "HIGH"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {warning.severity === "HIGH" ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{warning.title}</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">{warning.description}</p>
              <div className="text-[10px] font-semibold text-emerald-400 pt-1">
                💡 Rec: {warning.recommendation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>No critical drug interactions or allergy conflicts detected.</span>
        </div>
      )}
    </div>
  );
}
