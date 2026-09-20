"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  ChevronRight,
  User,
  MapPin,
  ShieldAlert,
  FileSpreadsheet,
  Activity,
  BookmarkPlus,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { usePrescriptionStore, PrescriptionItem } from "@/store/usePrescriptionStore";
import { useClinicStore } from "@/store/useClinicStore";
import { AiAssistPanel } from "./AiAssistPanel";
import { PrescriptionPreview } from "./PrescriptionPreview";
import { ShareModal } from "../sharing/ShareModal";
import { SaveConfirmationModal } from "./SaveConfirmationModal";

const FREQUENCY_CATEGORIES = [
  {
    category: "⏱️ كل 4 ساعات (Q4H)",
    options: [
      "كل 4 ساعات بعد الأكل",
      "كل 4 ساعات قبل الأكل بـ 15 دقيقة",
      "كل 4 ساعات عند اللزوم",
    ],
  },
  {
    category: "⏱️ كل 6 ساعات (Q6H)",
    options: [
      "كل 6 ساعات بعد الأكل (4 مرات يومياً)",
      "كل 6 ساعات قبل الأكل بـ 30 دقيقة",
    ],
  },
  {
    category: "⏱️ كل 8 ساعات (TDS)",
    options: [
      "كل 8 ساعات بعد الأكل (TDS)",
      "كل 8 ساعات قبل الأكل بـ 30 دقيقة",
      "كل 8 ساعات وسط الوجبة",
    ],
  },
  {
    category: "⏱️ كل 12 ساعة (BD)",
    options: [
      "كل 12 ساعة بعد الوجبات (BD)",
      "كل 12 ساعة قبل الوجبات بـ 30 دقيقة",
      "كل 12 ساعة (مع الإفطار والعشاء)",
    ],
  },
  {
    category: "☀️/🌙 كل 24 ساعة (OD)",
    options: [
      "مرة واحدة يومياً صباحاً بعد الفطور (OD)",
      "مرة واحدة يومياً صباحاً على الريق (قبل الفطور)",
      "مرة واحدة يومياً مساءً بعد العشاء",
      "مرة واحدة يومياً مساءً قبل النوم",
    ],
  },
  {
    category: "🍽️ الوجبات واللزوم",
    options: [
      "بعد كل وجبة (3 مرات يومياً بعد الأكل)",
      "قبل كل وجبة (3 مرات يومياً قبل الأكل بـ 30 دقيقة)",
      "عند الحاجة / عند اللزوم (PRN)",
      "يوم بعد يوم (كل 48 ساعة)",
      "جرعة واحدة أسبوعياً",
    ],
  },
];

const FREQUENCY_PRESETS = FREQUENCY_CATEGORIES.flatMap((c) => c.options);

const DURATION_PRESETS = [
  "لمدة 3 أيام",
  "لمدة 5 أيام",
  "لمدة 7 أيام (أسبوع)",
  "لمدة 10 أيام",
  "لمدة 14 يوماً (أسبوعين)",
  "لمدة شهر",
  "عند اللزوم فقط",
];

const DOSE_FORMS = [
  "Tablet (قرص)",
  "Capsule (كبسولة)",
  "Syrup (شراب)",
  "Suspension (معلق)",
  "Cream / Ointment (كريم / مرهم)",
  "Nasal Drops (نقط أنف)",
  "Eye/Ear Drops (قطرة)",
  "Injection (حقنة)",
  "Effervescent (فوار)",
  "Mouthwash (مضمضة)",
  "Serum (سيروم تجميل)",
];

function formatEgyptPhoneNumber(val: string): string {
  if (!val) return "";
  let digits = val.replace(/[^0-9]/g, "");
  if (digits.startsWith("20")) {
    digits = digits.substring(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  if (!digits) return "";
  return `+20 ${digits}`;
}

export function PrescriptionBuilder() {
  const {
    prescriptionNo,
    patient,
    setPatient,
    diagnosis,
    setDiagnosis,
    notes,
    setNotes,
    items,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    isManualMode,
    setIsManualMode,
    selectedBranchId,
    setSelectedBranchId,
    visibleFields,
    toggleVisibleField,
    printFields,
    togglePrintField,
    aiInteractions,
    savedPatients,
    saveCurrentPrescription,
  } = usePrescriptionStore();

  const { branches } = useClinicStore();

  // Search Combobox Local States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form Field Local Inputs for selected or manual item
  const [doseQuantity, setDoseQuantity] = useState("1");
  const [doseForm, setDoseForm] = useState("Tablet");
  const [frequency, setFrequency] = useState("كل 12 ساعة بعد الوجبات");
  const [isCustomFrequency, setIsCustomFrequency] = useState(false);
  const [duration, setDuration] = useState("لمدة 5 أيام");
  const [instructions, setInstructions] = useState("");
  const [manualDrugName, setManualDrugName] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced Drug Autocomplete Query
  useEffect(() => {
    if (!searchQuery.trim() || isManualMode) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/drugs/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [searchQuery, isManualMode]);

  const handleSelectDrug = (drug: any) => {
    // 1. Instantly add selected drug to prescription list
    addItem({
      drugId: drug.id,
      drugName: drug.name,
      nameAr: drug.nameAr || drug.name,
      activeIngredient: drug.activeIngredient || "",
      doseQuantity: doseQuantity || "1",
      doseForm: drug.dosageForm || doseForm || "Tablet",
      frequency: frequency || "كل 12 ساعة بعد الوجبات",
      duration: duration || "لمدة 5 أيام",
      instructions: instructions || "",
      isManual: false,
      price: drug.price || 0,
    });

    // 2. Instantly reset search query, selected drug state and close popup list
    setSelectedDrug(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddCurrentItem = () => {
    if (isManualMode) {
      if (!manualDrugName.trim()) return;
      const drugName = manualDrugName.trim();
      addItem({
        drugName,
        nameAr: drugName,
        doseQuantity,
        doseForm,
        frequency,
        duration,
        instructions,
        isManual: true,
      });

      // Auto-register custom drug in intelligent database and search catalog
      fetch("/api/drugs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: drugName,
          nameAr: drugName,
          dosageForm: doseForm || "Tablet",
        }),
      }).catch((err) => console.error("Auto drug registration error:", err));

      setManualDrugName("");
    } else {
      if (!selectedDrug && !searchQuery.trim()) return;
      const drugName = selectedDrug ? selectedDrug.name : searchQuery.trim();
      const nameAr = selectedDrug ? selectedDrug.nameAr : searchQuery.trim();
      addItem({
        drugId: selectedDrug?.id,
        drugName,
        nameAr,
        activeIngredient: selectedDrug?.activeIngredient || "",
        doseQuantity,
        doseForm,
        frequency,
        duration,
        instructions,
        isManual: false,
        price: selectedDrug?.price || 0,
      });

      // Auto-register custom typed drug if not selected from catalog
      if (!selectedDrug && searchQuery.trim()) {
        fetch("/api/drugs/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: searchQuery.trim(),
            nameAr: searchQuery.trim(),
            dosageForm: doseForm || "Tablet",
          }),
        }).catch((err) => console.error("Auto drug registration error:", err));
      }

      setSelectedDrug(null);
      setSearchQuery("");
      setSearchResults([]);
    }

    // Reset inputs
    setInstructions("");
  };

  return (
    <div className="space-y-6">
      {/* Patient Vitals & Medical Information Container */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">بيانات وتاريخ المريض الطبي (Patient Vitals)</h3>
                <Link
                  href="/settings"
                  className="text-[10px] font-bold text-slate-400 hover:text-emerald-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                  title="الذهاب لصفحة الإعدادات لتخصيص حقول المريض (السن، الوزن، فصيلة الدم...)"
                >
                  <Settings className="w-3 h-3 text-emerald-400" />
                  <span>تخصيص الحقول ⚙️</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dynamic BMI Calculation Badge (Only shown if Height and Weight fields are enabled in settings and filled) */}
            {mounted &&
            (visibleFields.showHeight ?? visibleFields.showHeightWeight) &&
            (visibleFields.showWeight ?? visibleFields.showHeightWeight) &&
            patient.height &&
            patient.weight &&
            patient.height > 0 &&
            patient.weight > 0 ? (
              (() => {
                const heightM = patient.height / 100;
                const bmi = (patient.weight / (heightM * heightM)).toFixed(1);
                const numBmi = parseFloat(bmi);
                let label = "وزن طبيعي";
                let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                if (numBmi < 18.5) {
                  label = "نقص وزن";
                  badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                } else if (numBmi >= 25 && numBmi < 30) {
                  label = "زيادة وزن";
                  badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                } else if (numBmi >= 30) {
                  label = "سمنة";
                  badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
                }
                return (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${badgeColor}`}>
                    <Activity className="w-4 h-4" />
                    <span>BMI: {bmi} ({label})</span>
                  </div>
                );
              })()
            ) : null}

            {/* Save Prescription to Archive & Start New Button */}
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="relative group flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/30 border border-emerald-300/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ring-2 ring-emerald-500/30 overflow-hidden"
              title="حفظ الروشتة الحالية وتفريغ الشاشة لفتح روشتة جديدة فارغة"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <BookmarkPlus className="w-4 h-4 text-emerald-100" />
              <span className="tracking-wide">حفظ الروشته وفتح جديد</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Form Inputs Grid with Print Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Patient Name with Archive Autocomplete */}
          {(() => {
            const nameQuery = (patient.nameAr || patient.name || "").trim().toLowerCase();
            const matchingPatients = savedPatients.filter((p) => {
              if (!nameQuery) return false;
              const nAr = (p.nameAr || "").toLowerCase();
              const nEn = (p.name || "").toLowerCase();
              const ph = (p.phone || "").replace(/[^0-9]/g, "");
              return nAr.includes(nameQuery) || nEn.includes(nameQuery) || ph.includes(nameQuery.replace(/[^0-9]/g, ""));
            });

            return (
              <div className="sm:col-span-2 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">اسم المريض بالكامل (Full Name):</label>
                  {matchingPatients.length > 0 && showPatientSuggestions && (
                    <span className="text-[10px] font-bold text-emerald-400">
                      ✨ مسجل بالأرشيف ({matchingPatients.length} مريض)
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={patient.nameAr || patient.name}
                  onChange={(e) => {
                    setPatient({ nameAr: e.target.value, name: e.target.value });
                    setShowPatientSuggestions(true);
                  }}
                  onFocus={() => setShowPatientSuggestions(true)}
                  placeholder="اكتب اسم المريض (سيتم سرد مرضى الأرشيف تلقائياً)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />

                {/* Archived Patients Autocomplete Dropdown Popup */}
                {showPatientSuggestions && matchingPatients.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
                    <div className="p-2 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold flex items-center justify-between">
                      <span>اختر مريض مسجل مسبقاً بالأرشيف لاستيراد بياناته الكاملة:</span>
                      <button
                        type="button"
                        onClick={() => setShowPatientSuggestions(false)}
                        className="text-slate-400 hover:text-white text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>

                    {matchingPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setPatient({
                            id: p.id,
                            name: p.name || p.nameAr || "",
                            nameAr: p.nameAr || p.name || "",
                            phone: p.phone || "",
                            age: p.age || 30,
                            gender: p.gender || "Male",
                            height: p.height,
                            weight: p.weight,
                            bloodType: p.bloodType || "A+",
                            allergies: p.allergies || "",
                            medicalHistory: p.medicalHistory || "",
                          });
                          setShowPatientSuggestions(false);
                        }}
                        className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-100 group-hover:text-emerald-400">
                              {p.nameAr || p.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({p.gender === "Male" ? "ذَكَر" : "أنثى"} - {p.age} سنة)
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            📱 {p.phone || "بدون رقم"} {p.medicalHistory ? `| 🩺 ${p.medicalHistory}` : ""}
                          </p>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          استيراد البيانات ↵
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Patient Phone Number - Mandatory for WhatsApp with Auto Egypt +20 Code */}
          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <span>📱 رقم هاتف المريض / الواتساب (Phone / WhatsApp):</span>
                <span className="text-rose-400 font-extrabold">*</span>
              </label>
              <span className="text-[9px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                🔒 خاص بالواتساب (لا يطبع بالروشتة)
              </span>
            </div>

            <div className="relative flex items-center">
              {/* Egypt Country Code Badge */}
              <div className="absolute left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                <span>🇪🇬</span>
                <span>+20</span>
              </div>

              <input
                type="tel"
                inputMode="tel"
                value={patient.phone || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const formatted = formatEgyptPhoneNumber(raw);
                  setPatient({ phone: formatted || raw });
                }}
                placeholder="اكتب الرقم مثل: 01094085223"
                className="w-full pl-20 pr-3.5 py-2 rounded-xl bg-slate-800 border border-emerald-500/40 text-xs font-bold text-emerald-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Age - Text Input with Checkbox */}
          {mounted && visibleFields.showAge && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">السن (Age):</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printAge}
                    onChange={() => togglePrintField("printAge")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={patient.age || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPatient({ age: val ? parseInt(val) : 0 });
                }}
                placeholder="مثال: 42"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Gender - Select with Checkbox */}
          {mounted && visibleFields.showGender && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">الجنس (Gender):</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printGender}
                    onChange={() => togglePrintField("printGender")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <select
                value={patient.gender}
                onChange={(e) => setPatient({ gender: e.target.value as "Male" | "Female" })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Male">ذَكَر (Male)</option>
                <option value="Female">أنثى (Female)</option>
              </select>
            </div>
          )}

          {/* Height - Text Input with Checkbox */}
          {mounted && (visibleFields.showHeight ?? visibleFields.showHeightWeight) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">الطول (Height سم):</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printHeight}
                    onChange={() => togglePrintField("printHeight")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={patient.height || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPatient({ height: val ? parseInt(val) : undefined });
                }}
                placeholder="مثال: 175 سم"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Weight - Text Input with Checkbox */}
          {mounted && (visibleFields.showWeight ?? visibleFields.showHeightWeight) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">الوزن (Weight كجم):</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printWeight}
                    onChange={() => togglePrintField("printWeight")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={patient.weight || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPatient({ weight: val ? parseInt(val) : undefined });
                }}
                placeholder="مثال: 80 كجم"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Blood Type - Select with Checkbox */}
          {mounted && visibleFields.showBloodType && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">فصيلة الدم:</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printBloodType}
                    onChange={() => togglePrintField("printBloodType")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <select
                value={patient.bloodType || "A+"}
                onChange={(e) => setPatient({ bloodType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          )}

          {/* Diagnosis - Input with Checkbox */}
          {mounted && visibleFields.showDiagnosis && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">التشخيص الطبي:</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printDiagnosis}
                    onChange={() => togglePrintField("printDiagnosis")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="مثال: التهاب حاد، ارتجاع مريء..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Chronic Diseases & Medical History with Checkbox */}
          {mounted && visibleFields.showMedicalHistory && (
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">الأمراض المزمنة والتاريخ الطبي:</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-emerald-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printMedicalHistory}
                    onChange={() => togglePrintField("printMedicalHistory")}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                value={patient.medicalHistory || ""}
                onChange={(e) => setPatient({ medicalHistory: e.target.value })}
                placeholder="مثال: ضغط، سكر، حساسية صدرية..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Allergies with Checkbox */}
          {mounted && visibleFields.showAllergies && (
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-amber-400 uppercase">حساسية الأدوية (Drug Allergies):</label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-amber-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={printFields.printAllergies}
                    onChange={() => togglePrintField("printAllergies")}
                    className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>طباعة بالروشتة</span>
                </label>
              </div>
              <input
                type="text"
                value={patient.allergies || ""}
                onChange={(e) => setPatient({ allergies: e.target.value })}
                placeholder="مثال: حساسية من البنسلين، السلفا..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Split Main View: Builder on Left, Live Prescription Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Smart Prescription Inputs & Search */}
        <div className="lg:col-span-6 space-y-6">
          {/* VIP Prominent Drug Search Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-700/80 hover:border-emerald-500/30 space-y-5 shadow-2xl shadow-emerald-950/20 relative transition-all">
            {/* Header Banner & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-100 tracking-wide">
                      {isManualMode ? "إدخال يدوي / مستحضر خاص" : "البحث في بنك الأدوية"}
                    </h3>
                    {!isManualMode && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold shadow-sm">
                        🇪🇬 43,500+ دواء
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isManualMode ? "كتابة دواء أو تركيب تجميلي غير مسجل" : "محرك بحث فائق السرعة بالاسم التجاري أو المادة الفعالة"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManualMode(!isManualMode)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all hover:border-emerald-500/50 shadow-md"
              >
                <span>{isManualMode ? "تبديل للبحث الفوري" : "إضافة دواء يدوي"}</span>
                {isManualMode ? (
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Prominent Drug Search Input Box */}
            {!isManualMode ? (
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-3.5 pointer-events-none" />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedDrug(null);
                    }}
                    placeholder="🔍 ابحث هنا باسم الدواء التجاري أو المادة الفعالة (مثلاً: بنادول، أوجمنتين، كتافلام)..."
                    className="w-full pl-12 pr-12 py-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 transition-all shadow-inner"
                  />

                  {/* Clear Button or Loading Spinner */}
                  {isSearching ? (
                    <div className="absolute right-4 top-3.5 w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setSelectedDrug(null);
                      }}
                      className="absolute right-4 top-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                {/* Autocomplete Dropdown Options Popup */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2.5 z-40 bg-slate-900/98 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-300 text-[11px] font-bold flex items-center justify-between border-b border-emerald-500/20">
                      <span>نتائج البحث الفوري في بنك الأدوية ({searchResults.length} نتيجة):</span>
                      <span className="text-[10px] font-normal text-slate-400">انقر لانتخاب الدواء وإضافته للروشتة</span>
                    </div>

                    {searchResults.map((drug) => (
                      <div
                        key={drug.id}
                        onClick={() => handleSelectDrug(drug)}
                        className="p-3.5 hover:bg-slate-800/90 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                              {drug.nameAr || drug.name}
                            </span>
                            <span className="text-xs font-mono text-slate-400 font-semibold">({drug.name})</span>

                            {/* Origin & Category Badges */}
                            {drug.sourceOrigin === "International / Imported" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                ✈️ مستورد / أجنبي
                              </span>
                            )}
                            {drug.sourceOrigin === "Cosmetics & Aesthetics" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                💄 تجميل
                              </span>
                            )}
                            {drug.sourceOrigin === "Dental Care" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                🦷 أسنان
                              </span>
                            )}
                            {drug.sourceOrigin === "Vitamins & Supplements" && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🌿 مكملات
                              </span>
                            )}
                            {(!drug.sourceOrigin || drug.sourceOrigin === "Egyptian Bank") && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🇪🇬 مصري
                              </span>
                            )}
                            {drug.isControlled && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                🚨 جدول
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            🏢 الشركة: <span className="text-slate-300">{drug.company || "عام"}</span> | 🧪 المادة الفعالة: <span className="text-emerald-300 font-semibold">{drug.activeIngredient}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          {drug.price ? (
                            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 block">
                              {drug.price} EGP
                            </span>
                          ) : null}
                          <span className="text-[10px] text-slate-400 block font-mono font-semibold">{drug.dosageForm || "Tablet"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={manualDrugName}
                  onChange={(e) => setManualDrugName(e.target.value)}
                  placeholder="اكتب اسم المستحضر أو التركيبة التجميلية أو التعليمات..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Dosage Configuration Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Dose Quantity - Select Dropdown (1 to 10) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">كمية الجرعة (Quantity):</label>
                <select
                  value={doseQuantity}
                  onChange={(e) => setDoseQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={`${num}`}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dosage Form */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">الشكل الدوائي (Form):</label>
                <select
                  value={doseForm}
                  onChange={(e) => setDoseForm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {DOSE_FORMS.map((f) => (
                    <option key={f} value={f.split(" ")[0]}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency & Timing Control: Dropdown Select + Manual Input Option */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    التكرار والتوقيت (Frequency & Timing):
                  </label>
                  
                  {/* Single Toggle Button: Dropdown vs Manual Free-Text */}
                  <button
                    type="button"
                    onClick={() => setIsCustomFrequency(!isCustomFrequency)}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    <span>{isCustomFrequency ? "📋 اختيار من القائمة" : "✍️ كتابة مانيول"}</span>
                    {isCustomFrequency ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>

                {!isCustomFrequency ? (
                  /* Categorized Dropdown Select List */
                  <select
                    value={frequency}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM_MANUAL") {
                        setIsCustomFrequency(true);
                      } else {
                        setFrequency(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="" disabled>اختر التوقيت والتكرار من القائمة...</option>
                    {FREQUENCY_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={cat.category} className="bg-slate-900 text-emerald-400 font-bold">
                        {cat.options.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-800 text-slate-100 font-medium">
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="CUSTOM_MANUAL" className="bg-slate-900 text-amber-400 font-bold">
                      ✍️ + كتابة مانيول (تعديل نصي حر)...
                    </option>
                  </select>
                ) : (
                  /* Manual Free-Text Input Field */
                  <div>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="اكتب التكرار والتوقيت يدويًا (مثال: كل 3 أيام قبل الأكل بـ 20 دقيقة)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {/* Duration Presets */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">مدة العلاج (Duration):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="مثال: لمدة 5 أيام..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ملاحظات المريض (Instructions):</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="مثال: يؤخذ بعد الفطور مباشرة مع كوب ماء كامل..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleAddCurrentItem}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة للروشتة (Add to Prescription)</span>
            </button>
          </div>

          {/* AI Clinical Safety Assist Panel */}
          <AiAssistPanel />

          {/* Added Prescription Items List Editor */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>أدوية الروشتة المضافة</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                    {items.length}
                  </span>
                </span>
              </div>

              {/* Language Switcher Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">عرض الأدوية:</span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-800 border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => usePrescriptionStore.getState().setDrugLanguageMode("ARABIC")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      usePrescriptionStore((s) => s.drugLanguageMode) === "ARABIC"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    عربي
                  </button>
                  <button
                    type="button"
                    onClick={() => usePrescriptionStore.getState().setDrugLanguageMode("ENGLISH")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      usePrescriptionStore((s) => s.drugLanguageMode) === "ENGLISH"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => usePrescriptionStore.getState().setDrugLanguageMode("BOTH")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      usePrescriptionStore((s) => s.drugLanguageMode) === "BOTH"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    عربي + En
                  </button>
                </div>

                {items.length > 0 && (
                  <button
                    onClick={clearItems}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors mr-2"
                  >
                    مسح الكل
                  </button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic">
                لم يتم إضافة أدوية للروشتة بعد.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-3 group hover:border-emerald-500/40 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-100 text-xs">{item.nameAr || item.drugName}</span>
                        {item.isManual && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                            يدوي
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-400 font-semibold mr-7">
                        {item.doseQuantity} — {item.frequency} {item.duration ? `(${item.duration})` : ""}
                      </p>

                      {/* Inline Item Instructions Editor Input */}
                      <div className="mr-7">
                        <input
                          type="text"
                          value={item.instructions || ""}
                          onChange={(e) => updateItem(item.id, { instructions: e.target.value })}
                          placeholder="+ إضافة أو تعديل ملاحظات خاصة بهذا الدواء..."
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-medium text-emerald-300 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* General Prescription Doctor Notes */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">ملاحظات الطبيب وتوصيات الإعادة:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توصيات للمريض أو موعد الاستشارة القادمة..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Prescription Preview */}
        <div className="lg:col-span-6 sticky top-20">
          <PrescriptionPreview onOpenShareModal={() => setShowShareModal(true)} />
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />

      {/* Save Confirmation Modal */}
      <SaveConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirmSave={() => {
          saveCurrentPrescription();
          setToastMessage("تم حفظ الروشتة بنجاح في الأرشيف وتفريغ الشاشة لروشتة جديدة! 🌿");
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Toast Success Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
