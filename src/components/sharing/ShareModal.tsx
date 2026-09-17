"use client";

import React, { useState } from "react";
import { X, Send, Phone, MessageSquare, Image as ImageIcon, FileText, Download, Check, ClipboardCheck } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";
import { useClinicStore } from "@/store/useClinicStore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { prescriptionNo, patient, paperSize } = usePrescriptionStore();
  const { clinic } = useClinicStore();
  const [patientPhone, setPatientPhone] = useState(patient.phone || "");
  const [shareFormat, setShareFormat] = useState<"PNG" | "PDF">("PNG");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [clipboardNotice, setClipboardNotice] = useState(false);

  React.useEffect(() => {
    if (patient.phone) {
      setPatientPhone(patient.phone);
    }
  }, [patient.phone, isOpen]);

  if (!isOpen) return null;

  // Generate Prescription Blob (in-memory, ZERO download folder triggered!)
  const getPrescriptionBlob = async (format: "PNG" | "PDF"): Promise<Blob | null> => {
    const canvasElem = document.querySelector(".prescription-canvas") as HTMLElement;
    if (!canvasElem) return null;

    try {
      const dataUrl = await toPng(canvasElem, { cacheBust: true, quality: 0.95, pixelRatio: 2 });
      if (!dataUrl) return null;

      if (format === "PNG") {
        const response = await fetch(dataUrl);
        return await response.blob();
      } else {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: paperSize === "A5" ? "a5" : "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight);
        return pdf.output("blob");
      }
    } catch (err) {
      console.error("Error generating prescription blob:", err);
      return null;
    }
  };

  // Explicit Direct Download ONLY when requested by user
  const handleExplicitDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await getPrescriptionBlob(shareFormat);
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = shareFormat.toLowerCase();
      link.download = `Rosheta_${prescriptionNo}_${patient.nameAr || patient.name}.${ext}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct WhatsApp Share (WITHOUT opening download folder dialog)
  const handleShareWhatsApp = async () => {
    setIsGenerating(true);
    setClipboardNotice(false);

    try {
      const blob = await getPrescriptionBlob(shareFormat);
      if (!blob) return;

      const ext = shareFormat.toLowerCase();
      const fileName = `Rosheta_${prescriptionNo}_${patient.nameAr || patient.name}.${ext}`;
      const mimeType = shareFormat === "PNG" ? "image/png" : "application/pdf";
      const file = new File([blob], fileName, { type: mimeType });

      let cleanPhone = (patientPhone || patient.phone || "").replace(/[^0-9]/g, "");
      if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
        cleanPhone = "20" + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith("00")) {
        cleanPhone = cleanPhone.substring(2);
      }

      const formatTitle = shareFormat === "PNG" ? "صورة الروشتة (PNG)" : "ملف الروشتة (PDF)";
      const whatsappMessage = `مرحباً بك، مرفق لكم ${formatTitle} الخاصة بـ (${patient.nameAr || patient.name}) من عيادة ${clinic.name}.`;

      // 1. Web Share API: Attaches ACTUAL FILE directly to WhatsApp (Mobile/Supported Browsers) - ZERO Download Folder!
      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `روشتة ${patient.nameAr || patient.name}`,
          text: whatsappMessage,
        });
        return;
      }

      // 2. Desktop Fallback: Copy PNG directly to System Clipboard so user can just Ctrl+V (Paste) in WhatsApp Chat!
      if (shareFormat === "PNG" && typeof navigator !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setClipboardNotice(true);
        } catch (clipErr) {
          console.warn("Clipboard copy not permitted:", clipErr);
        }
      }

      // 3. Open WhatsApp Web / App with message
      const textNotice =
        shareFormat === "PNG"
          ? `\n\n📋 (تم نسخ صورة الروشتة للحافظة تلقائياً — اضغط Ctrl+V لصق في محادثة الواتساب لإرسال الصورة مباشرةً)`
          : "";
      const encodedText = encodeURIComponent(`${whatsappMessage}${textNotice}`);
      const whatsappUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
        : `https://api.whatsapp.com/send?text=${encodedText}`;

      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("WhatsApp share failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">مشاركة الروشتة عبر الواتساب</h3>
              <p className="text-xs text-slate-400">إرسال الروشتة مباشرة للمريض دون فتح مجلد التنزيلات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Patient Phone Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            رقم واتساب المريض:
          </label>
          <input
            type="text"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            placeholder="+20 100 000 0000"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono transition-all"
          />
        </div>

        {/* Select Format: PNG vs PDF */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">اختر صيغة مشاركة الروشتة:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setShareFormat("PNG");
                setClipboardNotice(false);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                shareFormat === "PNG"
                  ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/50"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>صورة PNG عالية الجودة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShareFormat("PDF");
                setClipboardNotice(false);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                shareFormat === "PDF"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ملف مستند PDF (A4/A5)</span>
            </button>
          </div>
        </div>

        {/* Clipboard Notice Alert */}
        {clipboardNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-fade-in">
            <ClipboardCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">تم نسخ صورة الروشتة للحافظة (Clipboard) تلقائياً!</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                عند فتح محادثة الواتساب، اضغط <kbd className="px-1.5 py-0.5 rounded bg-emerald-950 text-white font-mono">Ctrl + V</kbd> أو اختر لصق (Paste) لإرسال الصورة مباشرة دون الحاجة لتنزيلها على جهازك.
              </p>
            </div>
          </div>
        )}

        {/* Preview Message */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-arabic leading-relaxed space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold mb-1">معاينة الرسالة المرسلة للواتساب:</span>
          <p className="whitespace-pre-wrap">
            {`مرحباً بك، مرفق لكم ${shareFormat === "PNG" ? "صورة الروشتة (PNG)" : "ملف الروشتة (PDF)"} الخاصة بـ (${patient.nameAr || patient.name}) من عيادة ${clinic.name}.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isGenerating
                ? "جاري تجهيز الروشتة..."
                : `إرسال ${shareFormat === "PNG" ? "صورة PNG" : "ملف PDF"} مباشرة عبر الواتساب`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExplicitDownload}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">تم تنزيل الملف بنجاح!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-400" />
                <span>تنزيل {shareFormat === "PNG" ? "صورة PNG" : "ملف PDF"} على الجهاز فقط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
