"use client";

import React from "react";
import { CheckCircle2, BookmarkPlus, X, AlertCircle, FileText, User, Calendar } from "lucide-react";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: () => void;
}

export function SaveConfirmationModal({
  isOpen,
  onClose,
  onConfirmSave,
}: SaveConfirmationModalProps) {
  const { prescriptionNo, patient, diagnosis, items } = usePrescriptionStore();

  if (!isOpen) return null;

  const patientName = patient.nameAr || patient.name || "مريض بدون اسم";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 font-arabic text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">حفظ الروشتة بأرشيف المريض</h3>
              <p className="text-xs text-slate-400">تأكيد الأرشفة وفتح روشتة جديدة فارغة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Prescription Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              اسم المريض:
            </span>
            <span className="font-bold text-slate-100 text-sm">{patientName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              رقم الروشتة:
            </span>
            <span className="font-mono font-bold text-emerald-400">{prescriptionNo}</span>
          </div>

          {diagnosis && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
              <span className="font-semibold text-slate-400">التشخيص:</span>
              <span className="font-bold text-slate-200 truncate max-w-[200px]">{diagnosis}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className="font-semibold text-slate-400">عدد الأدوية الموصوفة:</span>
            <span className="font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded-md">
              {items.length} {items.length === 1 ? "دواء" : "أدوية"}
            </span>
          </div>
        </div>

        {/* Confirmation Question */}
        <p className="text-xs text-slate-300 font-medium leading-relaxed bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-200">
          💡 عند الحفظ، سيتم إضافة الروشتة لسجل المريض في <strong>دليل المرضى (Patients Catalog)</strong> وتفريغ الشاشة تلقائياً لبدء روشتة جديدة فارغة.
        </p>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
          >
            إلغاء
          </button>

          <button
            onClick={() => {
              onConfirmSave();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>نعم، حفظ وفتح جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
