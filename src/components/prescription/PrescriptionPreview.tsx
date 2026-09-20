"use client";

import React, { useRef, useState, useEffect } from "react";
import { useClinicStore } from "@/store/useClinicStore";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";
import { Printer, Share2, Download, Check, Sparkles, MapPin, Phone, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";

interface PrescriptionPreviewProps {
  onOpenShareModal?: () => void;
  hideToolbar?: boolean;
}

export function PrescriptionPreview({ onOpenShareModal, hideToolbar = false }: PrescriptionPreviewProps) {
  const { clinic, branches } = useClinicStore();
  const {
    prescriptionNo,
    patient,
    selectedBranchId,
    paperSize,
    setPaperSize,
    drugLanguageMode,
    setDrugLanguageMode,
    diagnosis,
    notes,
    items,
    visibleFields,
    printFields,
  } = usePrescriptionStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const currentDate = mounted
    ? new Date().toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "13 سبتمبر 2026";

  const handlePrint = () => {
    window.print();
  };

  const handleExportPngImage = async () => {
    if (!canvasRef.current) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true, quality: 0.95, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `Rosheta_${prescriptionNo}_${patient.nameAr || patient.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const isA5 = paperSize === "A5";

  // Helpers for checking visibility AND print toggles
  const shouldPrintAge = visibleFields.showAge && (printFields?.printAge ?? true);
  const shouldPrintGender = visibleFields.showGender && (printFields?.printGender ?? true);
  const shouldPrintHeight = (visibleFields.showHeight ?? visibleFields.showHeightWeight ?? false) && (printFields?.printHeight ?? true);
  const shouldPrintWeight = (visibleFields.showWeight ?? visibleFields.showHeightWeight ?? false) && (printFields?.printWeight ?? true);
  const shouldPrintBloodType = visibleFields.showBloodType && (printFields?.printBloodType ?? true);
  const shouldPrintDiagnosis = visibleFields.showDiagnosis && (printFields?.printDiagnosis ?? true);
  const shouldPrintAllergies = visibleFields.showAllergies && (printFields?.printAllergies ?? true);
  const shouldPrintMedicalHistory = visibleFields.showMedicalHistory && (printFields?.printMedicalHistory ?? true);

  // Helper to format drug name based on selected language mode
  const renderDrugName = (item: (typeof items)[0]) => {
    const nameAr = item.nameAr || item.drugName;
    const nameEn = item.drugName;

    if (drugLanguageMode === "ENGLISH") {
      return <span className="font-bold text-slate-900 text-sm font-sans">{nameEn}</span>;
    }

    if (drugLanguageMode === "BOTH") {
      return (
        <span className="text-slate-900 text-sm">
          <span className="font-bold text-slate-900 text-sm ml-1.5">{nameAr}</span>
          {nameEn !== nameAr && <span className="font-mono text-xs text-slate-500 font-semibold">({nameEn})</span>}
        </span>
      );
    }

    // Default ARABIC
    return <span className="font-bold text-slate-900 text-sm">{nameAr}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      {!hideToolbar && (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3 no-print shadow-lg sticky top-0 z-20 backdrop-blur-md">
          {/* Row 1: Selectors (Paper Size A4/A5 + Drug Language Mode) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
            {/* Paper Size Selector Container */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 px-1.5">حجم الورقة:</span>
              <button
                type="button"
                onClick={() => setPaperSize("A4")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  paperSize === "A4"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Paper A4
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("A5")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  paperSize === "A5"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Paper A5
              </button>
            </div>

            {/* Drug Display Language Mode Selector Container */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 px-1.5">لغة الأدوية:</span>
              <button
                type="button"
                onClick={() => setDrugLanguageMode("ARABIC")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  drugLanguageMode === "ARABIC"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setDrugLanguageMode("ENGLISH")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  drugLanguageMode === "ENGLISH"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setDrugLanguageMode("BOTH")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  drugLanguageMode === "BOTH"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                عربي + En
              </button>
            </div>
          </div>

          {/* Row 2: Export & Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleExportPngImage}
              disabled={isExportingImage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-all disabled:opacity-50"
              title="تنزيل الروشتة كصورة عالية الجودة"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExportingImage ? "جاري التجهيز..." : "حفظ كـ صورة PNG"}</span>
            </button>

            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة عبر الواتساب (PDF / PNG)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 hover:brightness-110 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الروشتة فقط</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Prescription Canvas Frame */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div
          ref={canvasRef}
          className={`prescription-canvas bg-white text-slate-900 rounded-xl shadow-2xl transition-all duration-300 relative text-right flex flex-col justify-between ${
            isA5 ? "w-[520px] min-h-[720px] p-6 text-xs" : "w-[680px] min-h-[920px] p-8 text-sm"
          }`}
          style={{
            borderColor: clinic.primaryColor,
            borderTopWidth: "6px",
            fontFamily: clinic.fontFamily || "'Cairo', sans-serif",
          }}
        >
          <table className="w-full border-collapse h-full">
            {/* Clinic Header Section (Repeats on top of every printed page) */}
            {clinic.showHeader && (
              <thead>
                <tr>
                  <td className="pb-3 border-b-2 border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      {/* Doctor & Clinic Info */}
                      <div className="space-y-1 text-right">
                        <h1 className="font-black text-xl text-slate-900 tracking-wide" style={{ color: clinic.primaryColor }}>
                          {clinic.doctorName}
                        </h1>
                        <p className="text-xs font-bold text-slate-700">{clinic.doctorTitle}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{clinic.syndicateId}</p>
                        <p className="text-[11px] font-semibold text-emerald-800">{clinic.headerText}</p>
                      </div>

                      {/* Clinic Logo */}
                      <div className="text-left shrink-0">
                        {clinic.logoUrl ? (
                          <img
                            src={clinic.logoUrl}
                            alt="Clinic Logo"
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md"
                            style={{ backgroundColor: clinic.primaryColor }}
                          >
                            Rosheta
                          </div>
                        )}
                        <div className="mt-1 text-[10px] font-mono text-slate-400 font-semibold">{prescriptionNo}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </thead>
            )}

            {/* Prescription Body: Patient Details, Diagnosis, Allergies, Rx Items, Notes */}
            <tbody>
              <tr>
                <td className="pt-4 align-top">
                  {/* Patient Details Metadata Bar */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">اسم المريض (Patient):</span>
                      <span className="font-bold text-slate-900">{patient.nameAr || patient.name}</span>
                    </div>

                    {(shouldPrintAge || shouldPrintGender) && (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">السن / الجنس:</span>
                        <span className="font-bold text-slate-900">
                          {shouldPrintAge ? `${patient.age} سنة` : ""}
                          {shouldPrintAge && shouldPrintGender ? " / " : ""}
                          {shouldPrintGender ? (patient.gender === "Male" ? "ذَكَر" : "أنثى") : ""}
                        </span>
                      </div>
                    )}

                    {(shouldPrintHeight || shouldPrintWeight) && (patient.height || patient.weight) && (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">الطول / الوزن:</span>
                        <span className="font-bold text-slate-900">
                          {shouldPrintHeight && patient.height ? `${patient.height} سم` : ""}
                          {shouldPrintHeight && shouldPrintWeight && patient.height && patient.weight ? " / " : ""}
                          {shouldPrintWeight && patient.weight ? `${patient.weight} كجم` : ""}
                        </span>
                      </div>
                    )}

                    {shouldPrintBloodType && (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">فصيلة الدم:</span>
                        <span className="font-mono font-bold text-slate-900">{patient.bloodType || "A+"}</span>
                      </div>
                    )}

                    {visibleFields.showDate && (
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">التاريخ (Date):</span>
                        <span className="font-bold text-slate-900">{currentDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Diagnosis Banner if enabled */}
                  {shouldPrintDiagnosis && diagnosis && (
                    <div className="mb-3 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg bg-emerald-50 border-r-4 border-emerald-600">
                      <span className="font-bold text-emerald-900 ml-1">التشخيص (Diagnosis):</span> {diagnosis}
                    </div>
                  )}

                  {/* Allergies Banner if enabled */}
                  {shouldPrintAllergies && patient.allergies && (
                    <div className="mb-3 text-xs font-semibold text-amber-900 px-3 py-1 rounded-lg bg-amber-50 border-r-4 border-amber-500">
                      <span className="font-bold text-amber-950 ml-1">⚠️ حساسية الأدوية (Allergies):</span> {patient.allergies}
                    </div>
                  )}

                  {/* Chronic Medical History Banner if enabled */}
                  {shouldPrintMedicalHistory && patient.medicalHistory && (
                    <div className="mb-3 text-xs font-semibold text-slate-700 px-3 py-1 rounded-lg bg-slate-100 border-r-4 border-slate-400">
                      <span className="font-bold text-slate-900 ml-1">التاريخ الطبي (Medical History):</span> {patient.medicalHistory}
                    </div>
                  )}

                  {/* Rx Symbol Header */}
                  <div className="flex items-center justify-between mb-3 border-b pb-1">
                    <span className="font-serif italic font-extrabold text-3xl text-slate-900">Rx</span>
                    <span className="text-[11px] text-slate-400 font-semibold">الأدوية والتعليمات الطبية</span>
                  </div>

                  {/* Prescribed Items List */}
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic text-xs">
                      لم يتم إضافة أدوية للروشتة بعد...
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {items.map((item, idx) => (
                        <div key={item.id} className="pb-3 border-b border-slate-100 last:border-none page-break-inside-avoid">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-slate-400 text-xs">{idx + 1}.</span>
                            {renderDrugName(item)}
                            {item.isManual && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                تركيب / خاص
                              </span>
                            )}
                          </div>

                          <div className="mr-5 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700">
                            <div>
                              <span className="font-bold text-slate-900">الجرعة والتكرار: </span>
                              <span className="font-bold text-emerald-950">{item.doseQuantity} — {item.frequency}</span>
                            </div>
                            {item.duration && (
                              <div>
                                <span className="font-bold text-slate-900">المدة: </span>
                                <span>{item.duration}</span>
                              </div>
                            )}
                          </div>

                          {item.instructions && (
                            <div className="mr-5 mt-1.5 p-2 rounded-lg bg-emerald-50/90 border-r-4 border-emerald-600 text-xs text-emerald-950 font-medium">
                              <span className="font-bold text-emerald-900">💡 تعليمات خاصة بالدواء: </span>
                              <span>{item.instructions}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Doctor Recommendations & Notes Section */}
                  {notes && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 page-break-inside-avoid">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>📌 ملاحظات وتوصيات الطبيب للمريض (Doctor Notes):</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed mr-2 whitespace-pre-wrap">{notes}</p>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>

            {/* Clinic Footer (Repeats at bottom of every printed page) */}
            {clinic.showFooter && (
              <tfoot>
                <tr>
                  <td className="pt-4 border-t-2 border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Branch Address & Info */}
                      <div className="space-y-1 text-slate-700 text-[11px] text-right">
                        <p className="font-bold text-slate-900 text-xs">{activeBranch.nameAr || activeBranch.name}</p>
                        <p className="text-slate-600 font-medium">{activeBranch.address}</p>
                        {clinic.footerText && (
                          <p className="text-[10px] text-slate-500 pt-0.5">{clinic.footerText}</p>
                        )}
                      </div>

                      {/* Properly Formatted Phone Number Box */}
                      {activeBranch.phone && (
                        <div className="text-left shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-[10px] text-slate-400 font-bold mb-0.5">📞 للتواصل والاستفسارات:</p>
                          <span dir="ltr" className="inline-block font-bold text-slate-900 font-mono text-xs tracking-wider">
                            {activeBranch.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
