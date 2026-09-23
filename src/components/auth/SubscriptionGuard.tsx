"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Lock, ShieldAlert, Copy, Check, ArrowRight, RefreshCw, Fingerprint, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { useSubscriptionStore, getSubscriptionDetails } from "@/store/useSubscriptionStore";
import { isBiometricSupported, isBiometricEnabled, authenticateWithBiometric, registerBiometricCredential } from "@/lib/biometricAuth";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { subscriptions, machineId, syncWithServer } = useSubscriptionStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync subscriptions with backend server periodically for instant Mobile <-> PC synchronization
  useEffect(() => {
    syncWithServer();
    const syncInterval = setInterval(() => {
      syncWithServer();
    }, 3000);
    return () => clearInterval(syncInterval);
  }, [syncWithServer]);

  // Exempt routes from subscription locking (ONLY Admin portal & verification API)
  const isExemptRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/verify");

  const subDetails = getSubscriptionDetails(subscriptions, machineId);

  // Automatic transition to Dashboard (/) when subscription becomes ACTIVE
  useEffect(() => {
    if (mounted && subDetails.isActive) {
      if (pathname === "/subscriptions" && window.location.search.includes("pending")) {
        router.replace("/");
      }
    }
  }, [mounted, subDetails.isActive, pathname, router]);

  // If on exempt route (Admin portal / Verification API), render immediately
  if (isExemptRoute) {
    return <>{children}</>;
  }

  // If not mounted yet (SSR hydration), show smooth loading state
  if (!mounted) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 text-slate-400 dir-rtl">
        <RefreshCw className="w-9 h-9 animate-spin text-emerald-400" />
        <p className="text-xs font-bold text-slate-300">جاري التحقق من الحساب ...</p>
      </div>
    );
  }


  // State 1: Active Subscription -> Access Granted!
  if (subDetails.isActive) {
    return <>{children}</>;
  }

  // Allow visiting /subscriptions page if the user is explicitly trying to select a plan or request a trial
  if (pathname === "/subscriptions" && !subDetails.isPending) {
    return <>{children}</>;
  }

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleBiometricAuth = async () => {
    setBiometricLoading(true);
    setBiometricStatus(null);
    try {
      const supported = await isBiometricSupported();
      if (!supported) {
        setBiometricStatus("جهازك أو المتصفح الحالي لا يدعم مستشعر البصمة أو Face ID.");
        setBiometricLoading(false);
        return;
      }

      const authRes = await authenticateWithBiometric();
      if (authRes.success) {
        await syncWithServer();
        setBiometricStatus("✓ تم القراءة بالبصمة بنجاح! جاري التحديث...");
      } else {
        const wantsReg = confirm("لم يتم تسجيل البصمة مسبقاً على هذا الهاتف. هل تريد تسجيل البصمة / Face ID الآن؟");
        if (wantsReg) {
          const regRes = await registerBiometricCredential("طبيب العيادة");
          if (regRes.success) {
            await syncWithServer();
            setBiometricStatus("✓ تم تسجيل بصمتك بنجاح! يمكنك الآن فتح التطبيق بالبصمة دائماً.");
          } else {
            setBiometricStatus(regRes.error || "تعذر تسجيل البصمة.");
          }
        } else {
          setBiometricStatus(authRes.error || "تم إلغاء عملية البصمة.");
        }
      }
    } catch (err: any) {
      setBiometricStatus(err?.message || "خطأ في قراءة البصمة");
    } finally {
      setBiometricLoading(false);
    }
  };

  // State 2: Subscription Pending Activation -> Dedicated Pending Screen!
  if (subDetails.isPending) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 dir-rtl text-center antialiased">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Animated Glow Backdrop */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pending Animated Clock Header Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-2xl shadow-amber-500/20 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          {/* Title & Status Message */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> بانتظار التفعيل من المالك ⏳
            </span>
            <h2 className="text-2xl font-black text-white">طلب الاشتراك قيد المراجعة والتفعيل</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              تم تقديم طلب الاشتراك بنجاح وهو قيد المراجعة حالياً من المالك عبر بورتال لوحة التحكم (`/admin/subscriptions`).
              سيتم فتح المنظومة وتفعيل حسابك تلقائياً والتحويل إلى لوحة التحكم فور الاعتماد.
            </p>
          </div>

          {/* Auto-Sync Live Indicator */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              جاري الفحص التلقائي للحالة...
            </span>
            <span className="font-mono text-amber-400 font-bold">كل 3 ثوانٍ</span>
          </div>

          {/* Machine Hardware ID Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>معرّف الجهاز الحالي (Hardware Machine ID):</span>
              </span>
              {copied && <span className="text-[10px] font-bold text-emerald-400">✓ تم النسخ!</span>}
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-mono font-black text-emerald-400 text-sm tracking-wider" dir="ltr">
                {machineId}
              </span>
              <button
                type="button"
                onClick={handleCopyMachineId}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ المعرّف</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Subscription Expired / Unregistered / Suspended -> Permanent Lock Firewall Screen!
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 dir-rtl text-center antialiased">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Animated Glow Backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Header Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 via-amber-600 to-rose-500 p-0.5 shadow-2xl shadow-rose-500/20 mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-rose-400">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Title & Status Message */}
        <div className="space-y-2">
          <span className={`inline-block text-[11px] font-black px-3.5 py-1 rounded-full border ${subDetails.badgeColor}`}>
            {subDetails.statusLabel}
          </span>
          <h2 className="text-2xl font-black text-slate-100">
            {subDetails.isExpired ? "انتهت فترة اشتراك العيادة" : "الوصول غير متاح - يلزم تفعيل الاشتراك"}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {subDetails.isExpired
              ? "لقد انتهت المدة المحسوبة لاشتراك جهازك. يرجى تجديد الاشتراك للاستمرار في استخدام المنظومة وكافة مميزاتها."
              : "هذا الجهاز غير مفعّل على منظومة PenRx+. يرجى تقديم طلب اشتراك جديد وتزويد المالك بمعرّف الجهاز بالأسفل."}
          </p>
        </div>

        {/* Biometric Quick Login Action Button */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={biometricLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-95"
          >
            <Fingerprint className="w-5 h-5 text-emerald-300" />
            <span>{biometricLoading ? "جاري قراءة البصمة..." : "تسجيل الدخول بالبصمة / Face ID 👆"}</span>
          </button>
          {biometricStatus && (
            <p className="text-[11px] font-bold text-amber-300 mt-1">{biometricStatus}</p>
          )}
        </div>

        {/* Machine Hardware ID Box for Binding */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-right space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>معرّف الجهاز الحالي (Hardware Machine ID):</span>
            </span>
            {copied && <span className="text-[10px] font-bold text-emerald-400">✓ تم النسخ!</span>}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono font-black text-emerald-400 text-sm tracking-wider" dir="ltr">
              {machineId}
            </span>
            <button
              type="button"
              onClick={handleCopyMachineId}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ المعرّف</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            * قم بنسخ هذا المعرّف وإرساله لمالك المنظومة ليتم ربط وتفعيل الاشتراك على هذا الجهاز دون فقدان أي بيانات.
          </p>
        </div>

        {/* CTA Button to Subscriptions & Plan Selection Page */}
        <div className="pt-2">
          <Link
            href="/subscriptions"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>الانتقال إلى اختيار باقة الاشتراك والتفعيل 🚀</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
