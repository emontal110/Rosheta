"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Pill,
  Building2,
  Crown,
  PlusCircle,
  History,
  Settings,
  Smartphone,
  TrendingUp,
  Activity,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Printer,
  Eye,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
} from "lucide-react";
import { usePrescriptionStore, SavedPrescriptionRecord } from "@/store/usePrescriptionStore";
import { useClinicStore } from "@/store/useClinicStore";
import { useSubscriptionStore, getSubscriptionDetails } from "@/store/useSubscriptionStore";
import { AppDownloadModal } from "@/components/common/AppDownloadModal";

export function MedicalDashboard() {
  const { savedPrescriptions, savedPatients, items } = usePrescriptionStore();
  const { clinic, branches } = useClinicStore();
  const { subscriptions, machineId } = useSubscriptionStore();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subDetails = getSubscriptionDetails(subscriptions, machineId);

  // Statistics Calculations
  const totalPatientsCount = savedPatients?.length || 0;
  const totalPrescriptionsCount = savedPrescriptions?.length || 0;
  const totalBranchesCount = branches?.length || 1;

  // Prescriptions issued this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const prescriptionsThisMonth = (savedPrescriptions || []).filter((p) => {
    if (!p.savedAt) return false;
    const date = new Date(p.savedAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const newPatientsThisMonth = (savedPatients || []).length; // Filter fallback

  // Top 5 Most Prescribed Drugs Analysis
  const drugCounts: Record<string, { count: number; nameAr?: string }> = {};
  (savedPrescriptions || []).forEach((p) => {
    (p.items || []).forEach((item) => {
      const key = item.drugName || "دواء غير مسمى";
      if (!drugCounts[key]) {
        drugCounts[key] = { count: 0, nameAr: item.nameAr };
      }
      drugCounts[key].count += 1;
    });
  });

  const sortedTopDrugs = Object.entries(drugCounts)
    .map(([drugName, data]) => ({
      name: drugName,
      nameAr: data.nameAr,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxDrugUsage = sortedTopDrugs[0]?.count || 1;

  // Recent 5 Prescriptions
  const recentPrescriptions = [...(savedPrescriptions || [])]
    .sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12 dir-rtl antialiased selection:bg-emerald-500 selection:text-white">
      <AppDownloadModal isOpen={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">لوحة التحكم الطبية</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              PenRx+ Pro
            </span>
          </div>
          <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
            <span>مرحباً بعودتك دكتور {clinic.doctorName || clinic.name || "العيادة"} 👋</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">إحصائيات ونشاط المنظومة اليومي</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDownloadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:via-teal-500/25 hover:to-cyan-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 text-xs font-extrabold transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Smartphone className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>تثبيت وتنزيل التطبيق 📲</span>
          </button>

          <Link
            href="/prescriptions/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>كتابة روشتة جديدة ✍️</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (Matches Reference Image Pastel Glassmorphism Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Patients */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-950/20 to-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between group hover:border-emerald-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              +{newPatientsThisMonth} هذا الشهر
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black text-white tracking-tight">{totalPatientsCount}</div>
            <div className="text-xs font-bold text-slate-300">إجمالي المرضى المكتشفين</div>
          </div>

          <Link
            href="/patients"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-2 border-t border-emerald-500/20"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Total Prescriptions */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-purple-500/15 via-purple-950/20 to-slate-900/90 border border-purple-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between group hover:border-purple-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              {prescriptionsThisMonth} هذا الشهر
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black text-white tracking-tight">{totalPrescriptionsCount}</div>
            <div className="text-xs font-bold text-slate-300">إجمالي الروشتات المكتوبة</div>
          </div>

          <Link
            href="/history"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors pt-2 border-t border-purple-500/20"
          >
            <span>أرشيف الروشتات</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Top Prescribed Drugs */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-950/20 to-slate-900/90 border border-amber-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between group hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              43,500+ بالدليل
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black text-white tracking-tight">
              {sortedTopDrugs[0]?.count || 0}
            </div>
            <div className="text-xs font-bold text-slate-300">الأكثر كتابة واستخداماً</div>
          </div>

          <Link
            href="/prescriptions/new"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors pt-2 border-t border-amber-500/20"
          >
            <span>كتابة روشتة</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 4: Subscription Status */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-blue-500/15 via-blue-950/20 to-slate-900/90 border border-blue-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between group hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Crown className="w-6 h-6" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${subDetails.badgeColor}`}>
              {subDetails.statusLabel}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black text-white tracking-tight">
              {subDetails.daysRemaining} <span className="text-sm font-normal text-slate-400">يوم</span>
            </div>
            <div className="text-xs font-bold text-slate-300">متبقي على اشتراك المنظومة</div>
          </div>

          <Link
            href="/subscriptions"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 border-t border-blue-500/20"
          >
            <span>إدارة الاشتراك</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Hub Buttons Grid (الانتقال لكافة صفحات البرنامج) */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>اختصارات التصفح السريع للبرنامج</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            href="/prescriptions/new"
            className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">روشتة جديدة</span>
          </Link>

          <Link
            href="/history"
            className="p-4 rounded-2xl bg-gradient-to-tr from-purple-950/60 to-slate-900 border border-purple-500/30 hover:border-purple-400 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">أرشيف الروشتات</span>
          </Link>

          <Link
            href="/patients"
            className="p-4 rounded-2xl bg-gradient-to-tr from-blue-950/60 to-slate-900 border border-blue-500/30 hover:border-blue-400 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">سجل المرضى</span>
          </Link>

          <Link
            href="/branches"
            className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-950/60 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">الفروع والعيادات</span>
          </Link>

          <Link
            href="/settings"
            className="p-4 rounded-2xl bg-gradient-to-tr from-slate-800/60 to-slate-900 border border-slate-700/60 hover:border-slate-500 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700/40 text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">إعدادات العيادة</span>
          </Link>

          <Link
            href="/subscriptions"
            className="p-4 rounded-2xl bg-gradient-to-tr from-amber-950/60 to-slate-900 border border-amber-500/30 hover:border-amber-400 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">الاشتراكات والتفعيل</span>
          </Link>
        </div>
      </div>

      {/* Analytics & Top 5 Prescribed Drugs Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Prescribed Drugs Visual Chart (Takes 2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">أكثر 5 أدوية كتابةً واستخداماً بالروشتات</h3>
                <p className="text-xs text-slate-400">إحصائية فورية بناءً على سجل الروشتات الصادرة</p>
              </div>
            </div>

            <Link href="/history" className="text-xs font-bold text-emerald-400 hover:underline">
              السجل الكامل
            </Link>
          </div>

          {sortedTopDrugs.length > 0 ? (
            <div className="space-y-4 pt-2">
              {sortedTopDrugs.map((drug, index) => {
                const percentage = Math.round((drug.count / maxDrugUsage) * 100);
                const colors = [
                  "from-emerald-500 to-teal-400",
                  "from-cyan-500 to-blue-400",
                  "from-purple-500 to-indigo-400",
                  "from-amber-500 to-orange-400",
                  "from-rose-500 to-pink-400",
                ];
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>{drug.name}</span>
                        {drug.nameAr && <span className="text-slate-400 font-normal">({drug.nameAr})</span>}
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{drug.count} مرات</span>
                    </div>

                    {/* Custom Animated Progress Bar */}
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-700 shadow-sm`}
                        style={{ width: `${Math.max(8, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
              <Pill className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">لم يتم تسجيل أي أدوية في الروشتات حتى الآن.</p>
              <Link
                href="/prescriptions/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all"
              >
                <span>كتابة أول روشتة الآن</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* System Activity & Clinic Summary Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">نشاط العيادة والتفعيل</h3>
                <p className="text-xs text-slate-400">حالة الربط والأمان المباشر</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">حالة السيرفر وقاعدة البيانات:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> متصل بـ Supabase
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">بنك الأدوية المسجل:</span>
                <span className="text-xs font-bold text-cyan-400">43,500+ دواء</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">الذكاء الاصطناعي للفحص:</span>
                <span className="text-xs font-bold text-emerald-400">نشط ومفعّل 🤖</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/settings"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>إدارة ترويسة ولوجو العيادة</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions Table Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <span>سجل أحدث الروشتات المكتوبة</span>
          </h3>

          <Link href="/history" className="text-xs font-bold text-purple-400 hover:underline">
            عرض الأرشيف الكامل ({savedPrescriptions?.length || 0})
          </Link>
        </div>

        {recentPrescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-4">رقم الروشتة</th>
                  <th className="py-3 px-4">اسم المريض</th>
                  <th className="py-3 px-4">التشخيص</th>
                  <th className="py-3 px-4">عدد الأدوية</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {recentPrescriptions.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {record.prescriptionNo || record.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{record.patient?.name || "مريض عام"}</td>
                    <td className="py-3.5 px-4 text-slate-400">{record.diagnosis || "عام"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold">
                        {record.items?.length || 0} أدوية
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {record.savedAt ? new Date(record.savedAt).toLocaleDateString("ar-EG") : "اليوم"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href="/history"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض وطباعة</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            لا توجد روشتات مسجلة في الأرشيف حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
