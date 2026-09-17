"use client";

import React, { useState, useEffect } from "react";
import { Search, Pill, Sparkles, Filter, Plus, Check, ShieldAlert, Tag, Building } from "lucide-react";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";

export default function DrugsPage() {
  const [query, setQuery] = useState("");
  const [drugs, setDrugs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const { addItem } = usePrescriptionStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const fetchDrugs = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/drugs/search?q=${encodeURIComponent(searchTerm)}&limit=25`);
      const data = await res.json();
      setDrugs(data.results || []);
      setExecutionTime(data.executionTimeMs || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs(query);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) fetchDrugs(query.trim());
  };

  const handleQuickAdd = (drug: any) => {
    addItem({
      drugId: drug.id,
      drugName: drug.name,
      nameAr: drug.nameAr || drug.name,
      activeIngredient: drug.activeIngredient,
      doseQuantity: "1 قرص",
      doseForm: drug.dosageForm || "Tablet",
      frequency: "كل 12 ساعة بعد الأكل",
      duration: "لمدة 5 أيام",
      instructions: "",
      isManual: false,
      price: drug.price || 0,
    });

    setAddedIds((prev) => ({ ...prev, [drug.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [drug.id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">بنك الأدوية والمنتجات المصرية</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                43,500+ Egyptian Drug Bank (O(1) Engine)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              محرك بحث فائق السرعة يدعم البحث الضبابي بالأخطاء الإملائية واللغتين العربية والإنجليزية.
            </p>
          </div>

          {executionTime !== null && (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
              ⚡ Response Time: {executionTime}ms
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchDrugs(e.target.value);
            }}
            placeholder="ابحث باسم الدواء التجاري، المادة الفعالة، أو الشركة (e.g., Panadol, Augmentin, Antinal, أوجمنتين)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            {isLoading ? "جاري البحث..." : "بحث فوري"}
          </button>
        </form>
      </div>

      {/* Drug Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drugs.map((drug) => (
          <div
            key={drug.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-4 hover:border-emerald-500/50 transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {drug.nameAr || drug.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">{drug.name}</p>
                </div>

                {drug.price && (
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold shrink-0">
                    {drug.price} EGP
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{drug.activeIngredient}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>شركة المصنع: {drug.company || "مصر"}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>الشكل: {drug.dosageForm || "Tablet"} | التصنيف: {drug.category || "عام"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleQuickAdd(drug)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                addedIds[drug.id]
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {addedIds[drug.id] ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تمت الإضافة للروشتة!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>إضافة للروشتة الحالية</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
