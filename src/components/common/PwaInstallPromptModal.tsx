"use client";

import React, { useState, useEffect } from "react";
import { Laptop, X, Download, Sparkles } from "lucide-react";

export function PwaInstallPromptModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    // Check if app is already running in installed standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, do not show popup
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true);
      setSecondsLeft(10);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Fallback: If beforeinstallprompt hasn't fired yet, show prompt for all uninstalled browser sessions
    if (!isStandalone) {
      const timer = setTimeout(() => {
        setShowPopup((prev) => {
          if (!prev) {
            setSecondsLeft(10);
            return true;
          }
          return prev;
        });
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // 10-second Countdown timer & Auto-close
  useEffect(() => {
    if (!showPopup) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setShowPopup(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPopup]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPopup(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("انقر على قائمة المتصفح (⋮) واختر 'إضافة إلى الشاشة الرئيسية' أو 'Install App'.");
      setShowPopup(false);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top-6 duration-300 dir-rtl no-print">
      <div className="p-4 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/60 text-slate-100 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-3">
        {/* Animated 10-Second Progress Bar at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 10) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-3 left-3 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Header Content */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-emerald-400/40 bg-[#131b24] shrink-0 p-1">
            <img src="/icon.svg" alt="Rosheta App Icon" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-slate-100">تثبيت تطبيق Rosheta على هاتفك</h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {secondsLeft}ث
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تسطيب البرنامج بنقرة واحدة للعمل بأقصى سرعة وبدون إنترنت.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>تسطيب وتثبيت البرنامج الآن 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
