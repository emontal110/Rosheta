"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Lock, ShieldAlert, Copy, Check, ArrowRight, RefreshCw, Fingerprint, Sparkles } from "lucide-react";
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
    }, 4000);
    return () => clearInterval(syncInterval);
  }, [syncWithServer]);

  // Exempt routes from subscription locking
  const isExemptRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/subscriptions" ||
    pathname?.startsWith("/verify");

  const subDetails = getSubscriptionDetails(subscriptions, machineId);
  const isLocked = !isExemptRoute && (!subDetails.isActive || subDetails.isExpired);

  useEffect(() => {
    if (mounted && isLocked && !isExemptRoute) {
      // Force redirect to subscriptions page if trying to access protected route
      router.replace("/subscriptions");
    }
  }, [mounted, isLocked, isExemptRoute, router]);

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

  // If on exempt route, render immediately
  if (isExemptRoute) {
    return <>{children}</>;
  }

  // If not mounted yet (SSR hydration), show smooth loading state
  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-bold">جاري التحقق من أمان وحالة اشتراك العيادة...</p>
      </div>
    );
  }

  // If subscription is locked, show strict Firewall Access Gate
  if (isLocked) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 dir-rtl text-center">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Animated Glow Backdrop */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Lock Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-600 to-rose-500 p-0.5 shadow-xl mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-rose-400">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          {/* Title & Status Message */}
          <div className="space-y-2">
            <span className={`inline-block text-[11px] font-black px-3 py-1 rounded-full border ${subDetails.badgeColor}`}>
              {subDetails.statusLabel}
            </span>
            <h2 className="text-2xl font-black text-slate-100">
              {subDetails.isPending
                ? "طلب الاشتراك بانتظار التفعيل من المالك"
                : subDetails.isExpired
                ? "انتهت فترة اشتراك العيادة"
                : "الوصول غير متاح - يلزم تفعيل الاشتراك"}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {subDetails.isPending
                ? "تم تقديم طلب التفعيل بنجاح وهو قيد المراجعة حالياً من المالك عبر بورتال لوحة التحكم. سيتم فتح البرنامج فور التفعيل."
                : subDetails.isExpired
                ? "لقد انتهت المدة المحددة لاشتراك جهازك. يرجى تجديد الاشتراك للاستمرار في استخدام المنظومة وكافة مميزاتها."
                : "هذا الجهاز غير مفعّل على منظومة Rosheta. يرجى تقديم طلب اشتراك جديد وتزويد المالك بمعرّف الجهاز بالأسفل."}
            </p>
          </div>

          {/* Biometric Quick Login Action Button */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={biometricLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
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

          {/* CTA Button to Subscriptions Page */}
          <div className="pt-2">
            <Link
              href="/subscriptions"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Crown className="w-4 h-4" />
              <span>الانتقال إلى صفحة الاشتراكات والتفعيل 🚀</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // When active and valid, render children normally
  return <>{children}</>;
}
