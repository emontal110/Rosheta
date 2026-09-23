"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Download, Share2, CheckCircle2, X, ExternalLink, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      const android = /Android/.test(ua);
      setIsIOS(ios);
      setIsAndroid(android);
      if (ios) setActiveTab("ios");
      else setActiveTab("android");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-emerald-500/40 bg-slate-950 shrink-0">
              <img src="/logo-penrx.jpg" alt="PenRx+ Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span dir="ltr">تنزيل تطبيق PenRx+ 📲</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  v3.1 الأصلي
                </span>
              </h2>

              <p className="text-xs text-slate-300 mt-0.5">
                حمل التطبيق الرسمي للهاتف للحصول على أسرع أداء ودعم البصمة والواتساب الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5">
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "android"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            🤖 نظام أندرويد (Android APK)
          </button>

          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "ios"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <AppleIcon className="w-4 h-4" />
            🍏 آيفون وآيباد (iOS App)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "android" ? (
            <div className="space-y-6">
              {/* Android Card */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center md:text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> ملف APK رسمي موثق ومحمّي
                  </span>
                  <h3 className="text-lg font-bold text-white">تطبيق PenRx+ للأندرويد</h3>
                  <p className="text-xs text-slate-300 max-w-md">
                    يحتوي على كافة مميزات البصمة، استخراج معرّف الجهاز الثابت، وإرسال الروشتات الفوري للواتساب بدون قيود.
                  </p>
                </div>

                <a
                  href="/downloads/PenRx.apk"
                  download="PenRx+.apk"
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all text-sm shrink-0 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  تحميل PenRx+.apk الآن
                </a>
              </div>

              {/* Quick Setup Instructions for Android */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> طريقة التثبيت في 3 ثوانٍ فقط:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">1</div>
                    <p className="text-xs font-semibold text-slate-200">اضغط على زر التحميل</p>
                    <p className="text-[11px] text-slate-400">ينزل ملف PenRx+.apk في التحميلات</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">2</div>
                    <p className="text-xs font-semibold text-slate-200">افتح الملف وحمّله</p>
                    <p className="text-[11px] text-slate-400">إذا ظهرت "تثبيت من مصدر معروف"، اضغط سماح</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">3</div>
                    <p className="text-xs font-semibold text-slate-200">استمتع بالتطبيق</p>
                    <p className="text-[11px] text-slate-400">تنبيهات وتحديثات سحابية فورية تلقائية!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* iOS Card */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <AppleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">تثبيت تطبيق PenRx+ على الآيفون والآيباد</h3>
                    <p className="text-xs text-cyan-300 font-semibold">
                      تثبيت مباشر وسريع بدون أي تحذيرات أمنية 0% Warnings وبدون متجر App Store!
                    </p>
                  </div>
                </div>

                {/* 2-Step Visual Guide for iOS */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        افتح متصفح Safari واضغط زر المشاركة (Share)
                        <Share2 className="w-4 h-4 text-cyan-400 inline" />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        تجد زر المشاركة 📤 في أسفل شاشة الآيفون أو أعلى شاشة الآيباد.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)
                        <PlusSquareIcon className="w-4 h-4 text-cyan-400 inline" />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        سيظهر تطبيق PenRx+ مباشرة على شاشة الآيفون الرئيسية ويفتح بشاشة كاملة وبأعلى سرعة!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>بيانات موحدة ومزججة لحظياً مع قاعدة البيانات السحابية</span>
            </div>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% متزامن
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

function AppleIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.95.99-3.09-1 .04-2.18.67-2.88 1.49-.6.7-1.14 1.84-.99 2.97 1.11.09 2.22-.55 2.88-1.37z" />
    </svg>
  );
}

function PlusSquareIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
