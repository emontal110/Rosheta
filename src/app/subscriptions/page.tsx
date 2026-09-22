"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  Building2,
  Pill,
  Bot,
  MessageCircle,
  FileSpreadsheet,
  WifiOff,
  X,
  Check,
  Copy,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
  Laptop,
  CheckCircle,
} from "lucide-react";
import { useSubscriptionStore, SubscriptionRecord, getSubscriptionDetails, hasUsedFreeTrial } from "@/store/useSubscriptionStore";
import { useClinicStore } from "@/store/useClinicStore";

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  durationLabel: string;
  price: number;
  originalPrice?: number;
  discountText?: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  isTrial?: boolean;
}

export default function SubscriptionsPage() {
  const { subscriptions, submitSubscriptionRequest, machineId } = useSubscriptionStore();
  const { clinic } = useClinicStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vodafone" | "instapay">("vodafone");
  const [senderPhone, setSenderPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPendingView, setIsPendingView] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SubscriptionRecord | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("البرنامج مثبت بالفعل على جهازك أو يدعم التثبيت المباشر من قائمة المتصفح (Install App).");
    }
  };

  // Check if there is an existing pending or active subscription for this device
  const currentSub = subscriptions.find((s) => s.machineId === machineId) || null;

  const TRANSFER_NUMBER = "01094085228";

  const PLANS: SubscriptionPlan[] = [
    {
      id: "trial",
      name: "Free Trial",
      nameAr: "الاشتراك المجاني (تجريبي)",
      durationLabel: "تجريبي لمدة شهر كامل",
      price: 0,
      badge: "هدية الانضمام",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      description: "تجربة كاملة ومجانية لجميع مميزات النظام لمدة 30 يوماً بدون أي التزام.",
      isTrial: true,
      ctaText: "تفعيل التجربة المجانية 🚀",
      features: [
        "تجربة مجانية بالكامل لمدة شهر (30 يوم)",
        "وصول كامل لبنك الأدوية (43,500+ دواء)",
        "فحص التفاعلات الأدوية بالذكاء الاصطناعي",
        "طباعة الروشتة وتصدير PDF / صور",
        "إرسال الروشتات عبر الواتساب",
        "إضافة فرع عيادة واحد وتخصيص اللوجو",
      ],
    },
    {
      id: "monthly",
      name: "Monthly Plan",
      nameAr: "الاشتراك الشهري",
      durationLabel: "شهر واحد",
      price: 150,
      description: "مرونة كاملة ودفع شهري مريح بدون أي التزام طويل الأجل.",
      ctaText: "اشترك بـ 150 ج.م",
      features: [
        "تجديد شهري مرن بقيمة 150 جنيه",
        "وصول غير محدود لبنك الأدوية المحدث",
        "تنبيهات وتفاعلات الذكاء الاصطناعي",
        "طباعة ومشاركة واتساب غير محدودة",
        "إدارة فروع العيادات المتعددة",
        "نسخ احتياطي واستيراد المرضى تلقائياً",
      ],
    },
    {
      id: "quarterly",
      name: "3 Months Plan",
      nameAr: "اشتراك 3 شهور",
      durationLabel: "لكل 3 شهور",
      price: 400,
      originalPrice: 450,
      discountText: "خصم 50 جنيه",
      badge: "توفير 50 ج.م",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      description: "وفر 50 جنيه مقارنة بالتجديد الشهري مع ضمان استقرار الخدمة.",
      ctaText: "اشترك بـ 400 ج.م",
      features: [
        "اشتراك 3 شهور بقيمة 400 جنيه بدلاً من 450",
        "توفير 50 جنيه مباشر",
        "تحديثات بنك الأدوية اللحظية الفورية",
        "دعم فني وتفعيل سريع خلال دقائق",
        "طباعة وأرشيف كامل لجميع المرضى",
        "دعم العمل بدون إنترنت PWA",
      ],
    },
    {
      id: "semi_annual",
      name: "6 Months Plan",
      nameAr: "اشتراك 6 شهور",
      durationLabel: "لكل 6 شهور",
      price: 800,
      originalPrice: 900,
      discountText: "تخفيض 100 جنيه",
      badge: "تخفيض 100 ج.م",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      description: "تخفيض 100 جنيه كاملة لتغطية نصف سنوية مريحة لعيادتك.",
      ctaText: "اشترك بـ 800 ج.م",
      features: [
        "اشتراك 6 شهور بقيمة 800 جنيه بدلاً من 900",
        "توفير 100 جنيه مباشر",
        "جميع مميزات النظام المتكامل بدون أي قيود",
        "أولوية في تحديثات وقواعد بيانات الأدوية",
        "دعم فني مباشر على مدار الساعة",
        "إضافة فروع وعيادات غير محدودة",
      ],
    },
    {
      id: "annual_vip",
      name: "Annual VIP Plan",
      nameAr: "الاشتراك السنوي (VIP)",
      durationLabel: "اشتراك سنوي كامل (12 شهر)",
      price: 1600,
      originalPrice: 1800,
      discountText: "خصم 200 جنيه ⭐",
      badge: "الأكثر مبيعاً 🔥 | توفير 200 ج.م",
      badgeColor: "bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md animate-pulse",
      popular: true,
      description: "الخيار الأفضل للأطباء والعيادات. وفر 200 جنيه واضمن عمل النظام طوال العام.",
      ctaText: "اشترك الآن في الباقة السنوية ⭐",
      features: [
        "اشتراك سنوي كامل بقيمة 1,600 جنيه بدلاً من 1,800",
        "توفير 200 جنيه مباشر (شهران مجاناً)",
        "دعم مخصص واستجابة فورية عبر الواتساب",
        "تحديثات حصرية مجانية طوال السنة",
        "تخصيص كامل لتروئيسات الروشتة واللوجو",
        "أرشيف غير محدود للمرضى والروشتات السابقة",
        "شهادة تفعيل رسمية لعيادتك",
      ],
    },
  ];

  const SYSTEM_FEATURES = [
    {
      icon: Pill,
      color: "from-emerald-500 to-teal-400",
      title: "بنك الأدوية الشامل (43,500+ دواء)",
      description: "محرك بحث فائق السرعة بالاسم التجاري والمادة الفعالة وأصل المستحضر (مصري، مستورد، تجميل، أسنان، مكملات).",
    },
    {
      icon: Bot,
      color: "from-cyan-500 to-blue-500",
      title: "مساعد الذكاء الاصطناعي لفحص الأمان",
      description: "تنبيهات فورية عند وجود تعارضات بين الأدوية، تكرار المواد الفعالة، أو حساسية البنسلين وحساب الجرعات تلقائياً.",
    },
    {
      icon: MessageCircle,
      color: "from-teal-400 to-emerald-600",
      title: "مشاركة الروشتة عبر الواتساب",
      description: "توليد روابط سريعة وصور عالي الدقة ومستندات PDF وإرسال الروشتة مباشرة لرقم المريض بنقرة واحدة.",
    },
    {
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      title: "إدارة الفروع والترويسات المخصصة",
      description: "إمكانية إضافة فروع العيادات المتعددة وتخصيص الألوان واللوجو وبيانات الطباعة لكل فرع بدقة.",
    },
    {
      icon: FileSpreadsheet,
      color: "from-amber-500 to-orange-500",
      title: "أرشيف وسجل المرضى الإلكتروني",
      description: "حفظ واستيراد بيانات المرضى تلقائياً، والبحث بالاسم أو الهاتف مع الاحتفاظ بالتاريخ المرضي الكامل.",
    },
    {
      icon: WifiOff,
      color: "from-emerald-400 to-cyan-500",
      title: "تطبيق PWA والعمل بدون إنترنت",
      description: "سرعة فائقة في الاستجابة وحفظ البيانات محلياً بفضل تقنية PWA لضمان العمل حتى عند انقطاع الإنترنت.",
    },
  ];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(TRANSFER_NUMBER);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const alreadyUsedTrial = hasUsedFreeTrial(subscriptions, machineId);

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const isTrialPlan = selectedPlan.isTrial || selectedPlan.id === "trial" || selectedPlan.price === 0;

    if (isTrialPlan && alreadyUsedTrial) {
      alert("تم الاشتراك بالفعل في الباقة المجانية من قبل على هذا الجهاز. لا يمكن تكرار التجربة المجانية مرة أخرى، يرجى اختيار إحدى الباقات المدفوعة.");
      setSelectedPlan(null);
      return;
    }

    if (selectedPlan.price > 0 && (!senderPhone.trim() || !transactionRef.trim())) {
      alert("يرجى إدخال رقم العملية ورقم الهاتف المحول منه لاستكمال الطلب.");
      return;
    }

    const newRec = submitSubscriptionRequest({
      planId: selectedPlan.id,
      planName: selectedPlan.nameAr,
      price: selectedPlan.price,
      paymentMethod: paymentMethod,
      senderPhone: senderPhone.trim() || "",
      transactionRef: transactionRef.trim() || `TRIAL-${Date.now().toString().slice(-6)}`,
      machineId: machineId,
      doctorName: "",
      clinicName: "",
      durationDays: selectedPlan.id === "annual_vip" ? 365 : selectedPlan.id === "semi_annual" ? 180 : selectedPlan.id === "quarterly" ? 90 : 30,
      isTrial: isTrialPlan,
    });

    setSubmittedRecord(newRec);
    setIsPendingView(true);
    setSelectedPlan(null);
  };

  const subDetails = getSubscriptionDetails(subscriptions, machineId);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* Subscriptions Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100">بوابة الاشتراكات وتفعيل الأجهزة</h2>
            <p className="text-xs text-slate-400">إدارة وتفعيل تراخيص العيادة وربط الأجهزة المسموحة</p>
          </div>
        </div>

        {subDetails.isActive && (
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span>الدخول للبرنامج 🚀</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        )}
      </div>

      {/* SINGLE UNIFIED CONTAINER FOR SUBSCRIPTION DETAILS & MACHINE ID */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          {/* Machine ID with Copy Button */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>معرّف الجهاز الحالي (Hardware Machine ID):</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black text-emerald-400 text-lg sm:text-xl tracking-wider bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 inline-block shadow-inner" dir="ltr">
                {machineId}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(machineId);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 3000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ المعرّف</span>
              </button>
              {copySuccess && (
                <span className="text-xs font-extrabold text-emerald-400 animate-bounce">
                  ✓ تم النسخ!
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 shadow-lg ${subDetails.badgeColor}`}>
              <Sparkles className="w-4 h-4" />
              <span>{subDetails.statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Grid of Key Subscription Details: Type, Price, Days Remaining */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Plan Type */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>نوع الاشتراك:</span>
            </span>
            <p className="text-base font-black text-slate-100">{subDetails.planName}</p>
          </div>

          {/* 2. Subscription Price */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>قيمة الاشتراك:</span>
            </span>
            <p className="text-base font-black text-emerald-400">
              {currentSub ? (currentSub.price === 0 ? "مجاناً (0 ج.م)" : `${currentSub.price} ج.م`) : "غير مسجل"}
            </p>
          </div>

          {/* 3. LARGE PROMINENT DISTINCT DAYS REMAINING HERO BADGE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-950 to-teal-950/80 border-2 border-emerald-500/50 space-y-1.5 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>الأيام المتبقية على الانتهاء:</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span className="text-emerald-300">{subDetails.daysRemaining}</span>
              <span className="text-xs font-bold text-slate-400">يوماً</span>
            </p>
          </div>
        </div>
      </div>

      {/* If Pending / Active Subscription View */}
      {(isPendingView || (currentSub && currentSub.status !== "EXPIRED")) && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  {currentSub?.status === "ACTIVE" ? "✅ اشتراك مفعل" : "⏳ طلب التفعيل قيد المراجعة الإدارية"}
                </span>
                <h3 className="text-xl font-black text-slate-100 mt-1">
                  {currentSub?.planName || submittedRecord?.planName || "باقة الاشتراك"}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">كود الجهاز المرتبط (Machine ID):</span>
              <span className="text-sm font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 inline-block mt-1">
                {machineId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">قيمة الاشتراك:</span>
              <p className="text-lg font-bold text-slate-100">{currentSub?.price || submittedRecord?.price || 0} ج.م</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">رقم العملية المرجعي:</span>
              <p className="text-sm font-mono font-bold text-emerald-400">{currentSub?.transactionRef || submittedRecord?.transactionRef || "قيد التوليد"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">حالة التفعيل:</span>
              <p className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{currentSub?.status === "ACTIVE" ? "مفعل وجاهز للعمل" : "بانتظار الموافقة والتفعيل الإداري"}</span>
              </p>
            </div>
          </div>

          {/* Action Step: WhatsApp Verification Upload */}
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>إخطار التفعيل الفوري عبر الواتساب:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              يرجى رفع أو إرسال صورة/إيصال التحويل إلى رقم الواتساب المباشر <strong className="text-emerald-400 font-mono">01094085228</strong> فور إتمام التحويل لتفعيل باقتك خلال دقائق معدودة.
            </p>

            <a
              href={`https://wa.me/201094085228?text=${encodeURIComponent(
                `مرحباً، قمت بتحويل مبلغ الاشتراك لباقة (${currentSub?.planName || submittedRecord?.planName}) لرقم العملية: ${
                  currentSub?.transactionRef || submittedRecord?.transactionRef
                } من الهاتف: ${currentSub?.senderPhone || submittedRecord?.senderPhone}، يرجى تفعيل الجهاز (${machineId}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال صورة التحويل عبر الواتساب (01094085228) 💬</span>
            </a>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
          <Crown className="w-4 h-4 text-emerald-400" />
          <span>خطط وباقات الاشتراك لـ Rosheta</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
          اختر الباقة المناسبة لعيادتك واستمتع بجميع المميزات
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          نظام إدارة الروشتات الطبية الأحدث في مصر. تفعيل فوري خلال دقائق، بدون أي مصاريف خفية، مع إمكانية التغيير والتجديد بكل سهولة.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isTrialPlan = plan.isTrial || plan.id === "trial" || plan.price === 0;
          const isTrialBlocked = isTrialPlan && alreadyUsedTrial;

          const displayBadge = isTrialBlocked ? "تم الاستخدام من قبل 🚫" : plan.badge;
          const displayBadgeColor = isTrialBlocked
            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
            : plan.badgeColor || "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

          const displayCta = isTrialBlocked ? "تم الاشتراك بالباقة المجانية من قبل 🚫" : plan.ctaText;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                isPopular
                  ? "bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/50 ring-4 ring-emerald-500/20"
                  : isTrialBlocked
                  ? "bg-slate-900/60 border border-rose-500/30 opacity-90"
                  : "bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl"
              }`}
            >
              {/* Badge */}
              {displayBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 shrink-0 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-md ${displayBadgeColor}`}
                  >
                    {displayBadge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="text-center pt-2 pb-4 border-b border-slate-800/80 space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-100">{plan.nameAr}</h3>
                  <span className="text-[11px] text-slate-400 font-medium block">{plan.durationLabel}</span>

                  {/* Price */}
                  <div className="pt-2 flex items-baseline justify-center gap-1.5">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-black text-emerald-400">مجاناً</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-slate-100">{plan.price.toLocaleString()}</span>
                        <span className="text-xs font-bold text-emerald-400">ج.م</span>
                      </>
                    )}
                    {plan.originalPrice && (
                      <span className="text-xs text-slate-500 line-through mr-1 font-mono">
                        {plan.originalPrice} ج.م
                      </span>
                    )}
                  </div>

                  {plan.discountText && (
                    <span className="inline-block text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {plan.discountText}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 my-4 text-center leading-relaxed font-medium">
                  {plan.description}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    المميزات المشمولة:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => {
                    if (isTrialBlocked) {
                      alert("لقد تم الاشتراك بالفعل في الباقة المجانية من قبل على هذا الجهاز. يرجى اختيار إحدى الباقات المدفوعة لتجديد الاشتراك.");
                      return;
                    }
                    setSelectedPlan(plan);
                  }}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isTrialBlocked
                      ? "bg-slate-800 text-rose-300 border border-rose-500/30 hover:bg-rose-950/40"
                      : isPopular
                      ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black hover:brightness-110 shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
                      : plan.isTrial
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-emerald-500/50"
                  }`}
                >
                  <span>{displayCta}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrated System Features Section */}
      <div className="pt-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>🚀 مميزات النظام المتكامل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
            لماذا يفضل مئات الأطباء التعامل مع منصة Rosheta؟
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl mx-auto">
            منظومة متكاملة مصممة خصيصاً لتلبية احتياجات العيادات والمراكز الطبية في مصر بأعلى معايير الدقة والسرعة.
          </p>
        </div>

        {/* Grid of 6 System Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYSTEM_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3 shadow-lg group hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} p-0.5 shadow-lg shadow-emerald-950/30 flex items-center justify-center`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment / Activation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-2 text-right border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Crown className="w-4 h-4" />
                <span>تفعيل باقة: {selectedPlan.nameAr}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-100">
                طريقة التفعيل والسداد (القيمة: {selectedPlan.price === 0 ? "مجاناً" : `${selectedPlan.price} ج.م`})
              </h3>
            </div>

            {/* Two Payment Method Buttons with Official Icons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Vodafone Cash Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("vodafone")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "vodafone"
                    ? "bg-rose-500/15 border-rose-500 text-rose-300 shadow-xl scale-[1.02]"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-white"
                }`}
              >
                <div className="relative w-28 h-10">
                  <Image
                    src="/vodafone-cash.png"
                    alt="Vodafone Cash"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-extrabold">فودافون كاش (Vodafone Cash)</span>
              </button>

              {/* InstaPay Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod("instapay")}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "instapay"
                    ? "bg-purple-500/15 border-purple-500 text-purple-300 shadow-xl scale-[1.02]"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-white"
                }`}
              >
                <div className="relative w-28 h-10">
                  <Image
                    src="/instapay.png"
                    alt="InstaPay"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-extrabold">إنستا باي (InstaPay)</span>
              </button>
            </div>

            {/* Account Transfer Box with Copy Number Button */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">
                  {paymentMethod === "vodafone" ? "رقم محفظة فودافون كاش للتحويل:" : "رقم الهاتف / الحساب على إنستاباي (InstaPay) للتحويل:"}
                </span>
                {copySuccess && (
                  <span className="text-[10px] font-bold text-emerald-400 animate-bounce">
                    ✓ تم نسخ الرقم بنجاح!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-mono font-black text-emerald-400 tracking-widest" dir="ltr">
                  {TRANSFER_NUMBER}
                </span>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم</span>
                </button>
              </div>
            </div>

            {/* Payment Steps Instructions - Dynamic for Vodafone Cash & InstaPay */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs space-y-2">
              <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>
                  {paymentMethod === "vodafone"
                    ? "خطوات الدفع والتفعيل عبر فودافون كاش (Vodafone Cash):"
                    : "خطوات الدفع والتفعيل عبر إنستا باي (InstaPay):"}
                </span>
              </h4>
              {paymentMethod === "vodafone" ? (
                <ol className="list-decimal list-inside text-slate-300 space-y-1.5 font-medium leading-relaxed">
                  <li>افتح تطبيق <strong>أنا فودافون</strong> أو محفظتك أو اطلب الكود <code className="text-rose-400 font-mono">*9#</code>.</li>
                  <li>قم بتحويل مبلغ الباقة المحددة (<strong className="text-emerald-400 font-bold">{selectedPlan.price} ج.م</strong>) إلى رقم الكاش: <strong className="text-emerald-400 font-mono" dir="ltr">01094085228</strong>.</li>
                  <li>أدخل رقم عملية التحويل ورقم المحفظة التي حولت منها في الخانات بالأسفل.</li>
                  <li>اضغط على زر <strong className="text-emerald-300">تأكيد وإرسال الطلب</strong>.</li>
                  <li>أرسل صورة إيصال التحويل عبر الواتساب إلى <strong className="text-emerald-400 font-mono" dir="ltr">01094085228</strong> لإتمام التفعيل اللحظي.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside text-slate-300 space-y-1.5 font-medium leading-relaxed">
                  <li>افتح تطبيق <strong>إنستا باي (InstaPay)</strong> المعتمد على هاتفك المحمول.</li>
                  <li>اختر <strong>تحويل أموال</strong> ثم ادخل رقم الهاتف المخصص للتحويل: <strong className="text-purple-400 font-mono" dir="ltr">01094085228</strong>.</li>
                  <li>قم بتحويل قيمة الباقة (<strong className="text-purple-300 font-bold">{selectedPlan.price} ج.م</strong>) وأكد العملية في التطبيق.</li>
                  <li>أدخل رقم المرجع (Reference No) المكتوب بإيصال إنستاباي ورقم الهاتف في الخانات بالأسفل.</li>
                  <li>اضغط على زر <strong className="text-purple-300">تأكيد وإرسال الطلب</strong> وسيتم مراجعة وتفعيل اشتراكك فوراً.</li>
                </ol>
              )}
            </div>

            {/* Payment Details Form */}
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transaction Ref ID Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <span>{paymentMethod === "vodafone" ? "رقم عملية التحويل (Ref ID):" : "رقم العملية / المرجع (Ref No):"}</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={selectedPlan.price > 0}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={paymentMethod === "vodafone" ? "مثال: VF-98420195" : "مثال: 492019582103"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>

                {/* Sender Phone Number Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <span>{paymentMethod === "vodafone" ? "رقم محفظة فودافون كاش المرسل منها:" : "رقم الهاتف / الحساب المرسل منه:"}</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required={selectedPlan.price > 0}
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="مثال: 01094085223"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد وإرسال طلب التفعيل 🚀</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
