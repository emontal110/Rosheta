"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  HeartPulse,
  ShieldAlert,
  FileText,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Trash2,
  Clock,
  Pill,
  ExternalLink,
  X,
} from "lucide-react";
import { usePrescriptionStore, SavedPrescriptionRecord, PatientInfo } from "@/store/usePrescriptionStore";
import { PrescriptionPreview } from "@/components/prescription/PrescriptionPreview";
import { ShareModal } from "@/components/sharing/ShareModal";
import Link from "next/link";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    savedPatients,
    savedPrescriptions,
    loadSavedPrescription,
    deleteSavedPrescription,
    deleteSavedPatient,
  } = usePrescriptionStore();

  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [previewModalRecord, setPreviewModalRecord] = useState<SavedPrescriptionRecord | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter patients by search term (Name or Phone)
  const filteredPatients = savedPatients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    const nameAr = (p.nameAr || "").toLowerCase();
    const nameEn = (p.name || "").toLowerCase();
    const phone = (p.phone || "").replace(/[^0-9]/g, "");
    return nameAr.includes(q) || nameEn.includes(q) || phone.includes(q.replace(/[^0-9]/g, ""));
  });

  const handlePrintHistoricalPrescription = (record: SavedPrescriptionRecord) => {
    loadSavedPrescription(record);
    setPreviewModalRecord(record);
  };

  const handleReusePrescription = (record: SavedPrescriptionRecord) => {
    loadSavedPrescription(record);
    setToastMsg(`تم استعادة روشتة المريض (${record.patient.nameAr || record.patient.name}) لتعديلها في شاشة الروشتة الحالية! 📋`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-arabic text-right pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">سجلات وأرشيف المرضى (Patients Catalog)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفح أرشيف المرضى، استرجاع الروشتات السابقة، وطباعتها أو إعادتها في أي وقت.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المريض أو رقم التليفون..."
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 w-64 md:w-80"
            />
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 hover:brightness-110 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>روشتة جديدة</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <span>{toastMsg}</span>
          <Link href="/" className="underline text-emerald-100 hover:text-white">
            الانتقال لصفحة الروشتة ↵
          </Link>
        </div>
      )}

      {/* Patients Catalog List */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <p className="font-bold text-sm">لا يوجد مرضى مسجلين في الأرشيف بهذا الاسم أو الرقم.</p>
          <p className="text-xs text-slate-500">قم بإنشاء روشتة جديدة وحفظها لإضافتها تلقائياً لدليل المرضى.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map((patient) => {
            const patientPrescriptions = savedPrescriptions.filter(
              (r) =>
                r.patient.id === patient.id ||
                (r.patient.nameAr && r.patient.nameAr === patient.nameAr) ||
                (r.patient.phone && patient.phone && r.patient.phone === patient.phone)
            );

            const isExpanded = expandedPatientId === patient.id;

            return (
              <div
                key={patient.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all shadow-xl"
              >
                {/* Patient Main Information Bar */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
                      {patient.gender === "Male" ? "👨" : "👩"}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-100">
                          {patient.nameAr || patient.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                          {patient.age} سنة ({patient.gender === "Male" ? "ذَكَر" : "أنثى"})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                        {patient.phone && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            📱 {patient.phone}
                          </span>
                        )}
                        {patient.bloodType && <span>فصيلة الدم: {patient.bloodType}</span>}
                        {patient.medicalHistory && (
                          <span className="text-slate-300">🩺 {patient.medicalHistory}</span>
                        )}
                        {patient.allergies && (
                          <span className="text-amber-400 font-semibold">⚠️ {patient.allergies}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Prescriptions Counter Badge */}
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>
                        {patientPrescriptions.length} {patientPrescriptions.length === 1 ? "روشتة محفوظة" : "روشتات للأرشيف"}
                      </span>
                    </span>

                    {/* Expand Archive History Toggle Button */}
                    <button
                      onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isExpanded
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                          : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <span>{isExpanded ? "إخفاء الروشتات" : "عرض روشتات الأرشيف"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت تأكد من حذف سجل المريض (${patient.nameAr || patient.name}) وجميع روشتاته؟`)) {
                          deleteSavedPatient(patient.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="حذف المريض من السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Archived Prescriptions History Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
                    <h4 className="font-bold text-xs text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>السجل التاريخي لروشتات المريض ({patientPrescriptions.length}):</span>
                    </h4>

                    {patientPrescriptions.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic text-center">
                        لا توجد روشتات سابقة محفوظة لهذا المريض بعد.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patientPrescriptions.map((record) => {
                          const dateFormatted = new Date(record.savedAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div
                              key={record.id}
                              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <span className="font-mono font-bold text-emerald-400 text-xs">
                                    {record.prescriptionNo}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    📅 {dateFormatted}
                                  </span>
                                </div>

                                {record.diagnosis && (
                                  <p className="text-xs font-semibold text-slate-200">
                                    <span className="text-slate-400">التشخيص:</span> {record.diagnosis}
                                  </p>
                                )}

                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 block">الأدوية الموصوفة ({record.items.length}):</span>
                                  <div className="flex flex-wrap gap-1">
                                    {record.items.map((it) => (
                                      <span
                                        key={it.id}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
                                      >
                                        💊 {it.nameAr || it.drugName} ({it.doseQuantity})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Historic Prescription Action Buttons */}
                              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                                <button
                                  onClick={() => handlePrintHistoricalPrescription(record)}
                                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>طباعة ومعاينة</span>
                                </button>

                                <button
                                  onClick={() => handleReusePrescription(record)}
                                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>استعادة للروشتة الحالية</span>
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm("هل ترغب في حذف هذه الروشتة من الأرشيف؟")) {
                                      deleteSavedPrescription(record.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                                  title="حذف الروشتة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Historical Prescription Print & Preview Modal */}
      {previewModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    معاينة وطباعة الروشتة للأرشيف — {previewModalRecord.prescriptionNo}
                  </h3>
                  <p className="text-xs text-slate-400">
                    المريض: {previewModalRecord.patient.nameAr || previewModalRecord.patient.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewModalRecord(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Prescription Canvas Component */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <PrescriptionPreview onOpenShareModal={() => setShowShareModal(true)} />
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
}
