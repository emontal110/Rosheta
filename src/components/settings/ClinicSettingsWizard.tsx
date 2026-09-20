"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Palette,
  FileText,
  UserCheck,
  Clock,
  Phone,
  Shield,
  Sparkles,
  Eye,
  Upload,
  Image as ImageIcon,
  Link2 as LinkIcon,
} from "lucide-react";
import { useClinicStore, BranchInfo } from "@/store/useClinicStore";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";
import { PrescriptionPreview } from "../prescription/PrescriptionPreview";

const COLOR_PRESETS = [
  { name: "Emerald Medical", hex: "#059669" },
  { name: "Teal Clinical", hex: "#0d9488" },
  { name: "Cyan Modern", hex: "#0891b2" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Deep Indigo", hex: "#4f46e5" },
  { name: "Rose Dermatology", hex: "#e11d48" },
];

const FONT_PRESETS = [
  { name: "خط كايرو (Cairo)", value: "'Cairo', sans-serif" },
  { name: "خط تجول (Tajawal)", value: "'Tajawal', sans-serif" },
  { name: "خط الإسكندرية (Alexandria)", value: "'Alexandria', sans-serif" },
  { name: "خط المراعي (Almarai)", value: "'Almarai', sans-serif" },
  { name: "خط أميري (Amiri)", value: "'Amiri', serif" },
  { name: "خط آي بي إم (IBM Plex)", value: "'IBM Plex Sans Arabic', sans-serif" },
  { name: "خط ريدكس برو (Readex Pro)", value: "'Readex Pro', sans-serif" },
];

export function ClinicSettingsWizard() {
  const { clinic, updateClinic, branches, addBranch, updateBranch, deleteBranch, setDefaultBranch } = useClinicStore();
  const { visibleFields, toggleVisibleField } = usePrescriptionStore();

  const [activeTab, setActiveTab] = useState<"profile" | "branches">("profile");

  // New Branch Form Local State
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchNameAr, setNewBranchNameAr] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [newBranchHours, setNewBranchHours] = useState("");

  // Edit Branch Local State
  const [editingBranch, setEditingBranch] = useState<BranchInfo | null>(null);

  const handleCreateBranch = () => {
    if (!newBranchName.trim() || !newBranchAddress.trim()) return;
    addBranch({
      name: newBranchName,
      nameAr: newBranchNameAr || newBranchName,
      address: newBranchAddress,
      phone: newBranchPhone || "+20 100 000 0000",
      workingHours: newBranchHours || "السبت إلى الخميس: 4:00 م - 10:00 م",
      isDefault: branches.length === 0,
    });
    setNewBranchName("");
    setNewBranchNameAr("");
    setNewBranchAddress("");
    setNewBranchPhone("");
    setNewBranchHours("");
  };

  const handleSaveEditBranch = () => {
    if (!editingBranch) return;
    if (!editingBranch.name.trim() || !editingBranch.address.trim()) return;
    updateBranch(editingBranch.id, editingBranch);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`هل أنت تأكد من حذف فرع "${name}"؟`)) {
      deleteBranch(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-arabic text-right">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">إعدادات المركز والعيادات المتعددة</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              Clinic setting
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            خصص هوية المركز الطبي، تصميم الروشتة المطبوعة، الهيدر والفوتير، والألوان والخطوط بكل سهولة.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800 border border-slate-700/80">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            هوية وتصميم المركز والروشتة
          </button>
          <button
            onClick={() => setActiveTab("branches")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "branches"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            إدارة الفروع ({branches.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Combined Profile & Prescription Design (2-Column Grid with Live Preview) */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
              {/* Section 1: Clinic & Doctor Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  بيانات المركز الطبي والطبيب المعالج
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">اسم المركز / العيادة (English):</label>
                    <input
                      type="text"
                      value={clinic.name}
                      onChange={(e) => updateClinic({ name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">اسم العيادة بالعربي:</label>
                    <input
                      type="text"
                      value={clinic.nameAr || ""}
                      onChange={(e) => updateClinic({ nameAr: e.target.value })}
                      placeholder="مجمع عيادات الحياة الطبية..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">اسم الطبيب والمعالج:</label>
                    <input
                      type="text"
                      value={clinic.doctorName}
                      onChange={(e) => updateClinic({ doctorName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">الدرجة العلمية والتخصص:</label>
                    <input
                      type="text"
                      value={clinic.doctorTitle}
                      onChange={(e) => updateClinic({ doctorTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">رقم قيد النقابة (Syndicate ID):</label>
                    <input
                      type="text"
                      value={clinic.syndicateId}
                      onChange={(e) => updateClinic({ syndicateId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Logo Section: Local File Upload OR Web URL Input */}
                  <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-800/80">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      شعار العيادة / المركز (Clinic Logo):
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Logo Preview Box */}
                      <div className="sm:col-span-3 flex items-center justify-center p-2 rounded-2xl bg-slate-950 border border-slate-800 min-h-[85px] relative group">
                        {clinic.logoUrl ? (
                          <div className="relative w-full flex items-center justify-center">
                            <img
                              src={clinic.logoUrl}
                              alt="Clinic Logo Preview"
                              className="max-h-20 max-w-full object-contain rounded-xl shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => updateClinic({ logoUrl: "" })}
                              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-500 transition-colors"
                              title="حذف اللوجو"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-1 text-slate-500">
                            <ImageIcon className="w-6 h-6 mx-auto text-slate-600" />
                            <span className="text-[10px] block font-semibold">بدون لوجو حالياً</span>
                          </div>
                        )}
                      </div>

                      {/* File Upload Button & Link Input */}
                      <div className="sm:col-span-9 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span>اختر لوجو من الجهاز (Upload File)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (reader.result) {
                                      updateClinic({ logoUrl: reader.result as string });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <span className="text-[11px] text-slate-400 font-semibold">أو عبر رابط أونلاين:</span>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={clinic.logoUrl}
                            onChange={(e) => updateClinic({ logoUrl: e.target.value })}
                            placeholder="أدخل رابط صورة اللوجو (https://...)"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 pr-9"
                          />
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Header & Footer Customization */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  ترويسة وتذييل الروشتة المطبوعة (Header & Footer)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">إظهار ترويسة الروشتة (Header Toggle)</span>
                      <p className="text-[11px] text-slate-400">طباعة اسم الطبيب والشعار في أعلى الروشتة</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={clinic.showHeader}
                      onChange={(e) => updateClinic({ showHeader: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">إظهار تذييل الروشتة (Footer Toggle)</span>
                      <p className="text-[11px] text-slate-400">طباعة عنوان الفرع ورقم الهاتف والرمز كيو آر</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={clinic.showFooter}
                      onChange={(e) => updateClinic({ showFooter: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">نص الترويسة العلوي (Header Text):</label>
                    <input
                      type="text"
                      value={clinic.headerText}
                      onChange={(e) => updateClinic({ headerText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">نص التذييل السفلي (Footer Text):</label>
                    <input
                      type="text"
                      value={clinic.footerText}
                      onChange={(e) => updateClinic({ footerText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Patient Data Page Field Visibility Controls (Organized into Professional Categories) */}
              <div className="space-y-5 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    تخصيص حقول بيانات المريض بالروشتة (Default & Custom Patient Fields)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    الوضع الافتراضي البسيط يظهر فقط <strong className="text-emerald-300">(اسم المريض - رقم الهاتف - التشخيص الطبي)</strong>. يمكنك تفعيل أو إخفاء أي حقول إضافية كـ <span className="text-slate-300">(السن، الوزن، الجنس، فصيلة الدم، التاريخ الطبي، الحساسية)</span> بنقرة واحدة وتظل المحفوظات محفوظة دائماً:
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    خيارات إظهار أو إخفاء حقول بيانات المريض في صفحة الروشتة (Prescription Page Field Visibility)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    حدد الحقول التي تحتاجها فقط أثناء كتابة الروشتة. الحقول المعطلة سيتم إخفاؤها بالكامل (مع مربع طباعتها) من شاشة تحرير الروشتة لتوفير المساحة وتسهيل العمل:
                  </p>
                </div>

                {/* Sub-Category 1: Demographics & Vitals */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800/80 pb-2">
                    <span>👤 إضافة بيانات أخرى للمريض (Additional Patient Data)</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      5 حقول
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Age */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">السن (Age):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل عمر المريض بالسنوات</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showAge}
                        onChange={() => toggleVisibleField("showAge")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 2. Gender */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">الجنس (Gender):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل جنس المريض (ذكر / أنثى)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showGender}
                        onChange={() => toggleVisibleField("showGender")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 3. Height */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">الطول (Height سم):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل الطول بالسنتيمتر</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showHeight ?? visibleFields.showHeightWeight}
                        onChange={() => toggleVisibleField("showHeight")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 4. Weight */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">الوزن (Weight كجم):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل الوزن بالكيلوجرام</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showWeight ?? visibleFields.showHeightWeight}
                        onChange={() => toggleVisibleField("showWeight")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 5. Blood Type */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all sm:col-span-2">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">فصيلة الدم (Blood Type):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل فصيلة الدم (A+, B+, O+...)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showBloodType}
                        onChange={() => toggleVisibleField("showBloodType")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Sub-Category 2: Clinical History & Record */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-400 border-b border-slate-800/80 pb-2">
                    <span>🩺 التشخيص والتاريخ الطبي (Clinical Record & History)</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300">
                      3 حقول
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 6. Diagnosis */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all sm:col-span-2">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">التشخيص الطبي (Diagnosis):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل كتابة التشخيص الطبي المباشر</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showDiagnosis}
                        onChange={() => toggleVisibleField("showDiagnosis")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 7. Chronic Medical History */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-emerald-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">الأمراض المزمنة والتاريخ الطبي:</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل السجل المرضي السابق</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showMedicalHistory}
                        onChange={() => toggleVisibleField("showMedicalHistory")}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* 8. Drug Allergies */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-amber-500/40 transition-all">
                      <div>
                        <span className="font-bold text-xs text-amber-300 block">حساسية الأدوية (Drug Allergies):</span>
                        <span className="text-[10px] text-slate-400">إظهار حقل تحذيرات حساسية الأدوية</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleFields.showAllergies}
                        onChange={() => toggleVisibleField("showAllergies")}
                        className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 4: Branding Palette & Typography */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  ألوان وخطوط الروشتة المطبوعة (Branding & Fonts)
                </h3>

                {/* Color Branding Palette Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    لون الهوية الطبية للروشتة (Branding Palette):
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => updateClinic({ primaryColor: color.hex })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          clinic.primaryColor === color.hex
                            ? "border-white bg-slate-800 text-white shadow-lg"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    اختر خط طباعة الروشتة (Prescription Font Family):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {FONT_PRESETS.map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => updateClinic({ fontFamily: font.value })}
                        style={{ fontFamily: font.value }}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                          (clinic.fontFamily || "'Cairo', sans-serif") === font.value
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md ring-1 ring-emerald-500/50"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Live Prescription Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 p-4 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-4">
              {/* Simple Clean Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">معاينه الروشته</h3>
                </div>
              </div>

              {/* Prescription Preview Wrapper */}
              <div className="max-h-[78vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-slate-950 p-2 border border-slate-800/80 custom-scrollbar">
                <div className="transform scale-[0.78] sm:scale-[0.85] xl:scale-[0.90] origin-top transition-transform duration-200">
                  <PrescriptionPreview hideToolbar={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Branch Management (Full Width, NO Prescription Preview) */}
      {activeTab === "branches" && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Add New Branch Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              إضافة فرع جديد (Add New Branch Location)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="اسم الفرع بالإنجليزي (e.g. Alexandria Center)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newBranchNameAr}
                onChange={(e) => setNewBranchNameAr(e.target.value)}
                placeholder="اسم الفرع بالعربي (فرع الإسكندرية)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newBranchPhone}
                onChange={(e) => setNewBranchPhone(e.target.value)}
                placeholder="رقم الهاتف (+20 100...)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newBranchAddress}
                onChange={(e) => setNewBranchAddress(e.target.value)}
                placeholder="العنوان التفصيلي للعيادة..."
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newBranchHours}
                onChange={(e) => setNewBranchHours(e.target.value)}
                placeholder="مواعيد العمل (e.g. 4:00 م - 10:00 م)"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleCreateBranch}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              حفظ الفرع الجديد
            </button>
          </div>

          {/* Branch List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-3xl border space-y-3 relative transition-all ${
                  b.isDefault
                    ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/40"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-slate-100">{b.nameAr || b.name}</span>
                  </div>
                  {b.isDefault ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      الفرع الرئيسي
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultBranch(b.id)}
                      className="text-[10px] text-slate-400 hover:text-emerald-400 font-semibold"
                    >
                      تعيين كفيزيتا رئيسية
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <p>📍 {b.address}</p>
                  <p>📞 {b.phone}</p>
                  <p>🕒 {b.workingHours}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setEditingBranch({ ...b })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Edit2 size={13} className="text-emerald-400" />
                    تعديل البيانات
                  </button>

                  {!b.isDefault && (
                    <button
                      onClick={() => handleDeleteBranch(b.id, b.nameAr || b.name)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
                    >
                      <Trash2 size={13} />
                      حذف
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Branch Modal */}
          {editingBranch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-400" />
                    تعديل بيانات الفرع: {editingBranch.nameAr || editingBranch.name}
                  </h3>
                  <button
                    onClick={() => setEditingBranch(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">اسم الفرع (بالإنجليزي):</label>
                    <input
                      type="text"
                      value={editingBranch.name}
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">اسم الفرع (بالعربي):</label>
                    <input
                      type="text"
                      value={editingBranch.nameAr || ""}
                      onChange={(e) => setEditingBranch({ ...editingBranch, nameAr: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      value={editingBranch.phone}
                      onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">العنوان التفصيلي:</label>
                    <input
                      type="text"
                      value={editingBranch.address}
                      onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">مواعيد العمل:</label>
                    <input
                      type="text"
                      value={editingBranch.workingHours}
                      onChange={(e) => setEditingBranch({ ...editingBranch, workingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setEditingBranch(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEditBranch}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    <Check size={14} />
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
