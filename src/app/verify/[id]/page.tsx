"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, FileText, Calendar, Building, User, Download, Printer } from "lucide-react";
import { useParams } from "next/navigation";

export default function VerificationPage() {
  const params = useParams();
  const prescriptionNo = (params?.id as string) || "RSH-849201";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Verification Status Banner */}
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/40">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            روشتة موثقة رسمياً — Verified Official Prescription
          </span>
          <h2 className="text-xl font-black text-slate-100 mt-2">
            تم التحقق من صحة الروشتة الإلكترونية
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Rx Number: {prescriptionNo}</p>
        </div>
      </div>

      {/* Prescription Content Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        {/* Doctor Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-100">د. أحمد السيد (Dr. Ahmed El-Sayed)</h3>
            <p className="text-xs text-emerald-400 font-medium">استشاري الباطنة العامة والأمراض المزمنة</p>
            <p className="text-[11px] text-slate-400">مركز الحياة الطبي - فرع المعادي الرئيسي</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">تاريخ الإصدار</span>
            <p className="text-xs font-bold text-slate-200">13 سبتمبر 2026</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">اسم المريض:</span>
            <span className="font-bold text-slate-100">محمد علي حسن</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">السن / الجنس:</span>
            <span className="font-bold text-slate-100">42 سنة / ذَكَر</span>
          </div>
        </div>

        {/* Medicines List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            الأدوية الموصوفة والجرعات المعتمده:
          </h4>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="font-bold text-slate-100">1. Augmentin 1g (أوجمنتين 1 جرام)</div>
              <div className="text-emerald-400 text-[11px] font-medium mt-0.5">
                الجرعة: 1 قرص — كل 12 ساعة بعد الوجبات (لمدة 7 أيام)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="font-bold text-slate-100">2. Panadol Extra (بنادول إكسترا)</div>
              <div className="text-emerald-400 text-[11px] font-medium mt-0.5">
                الجرعة: 1 قرص — عند الحاجة كل 8 ساعات
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="font-bold text-slate-100">3. Antinal (إنتينال كبسول)</div>
              <div className="text-emerald-400 text-[11px] font-medium mt-0.5">
                الجرعة: 1 كبسولة — كل 6 ساعات (لمدة 4 أيام)
              </div>
            </div>
          </div>
        </div>

        {/* Print & Action buttons */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={() => window.print()}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة نسخة رسمية للصفحة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
