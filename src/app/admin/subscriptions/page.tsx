"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  User,
  Building2,
  Calendar,
  Phone,
  Hash,
  Laptop,
  Play,
  Pause,
  ArrowLeft,
  X,
  Sparkles,
  Check,
  Shield,
  CreditCard,
} from "lucide-react";
import { useSubscriptionStore, SubscriptionRecord } from "@/store/useSubscriptionStore";

export default function AdminSubscriptionsPortal() {
  const {
    subscriptions,
    activateSubscription,
    suspendSubscription,
    deleteSubscription,
    addManualSubscription,
  } = useSubscriptionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "ACTIVE" | "SUSPENDED">("ALL");
  const [selectedSubForActivate, setSelectedSubForActivate] = useState<SubscriptionRecord | null>(null);
  const [customDays, setCustomDays] = useState(365);
  const [showAddManualModal, setShowAddManualModal] = useState(false);

  // Manual Form States
  const [manualDoctor, setManualDoctor] = useState("");
  const [manualClinic, setManualClinic] = useState("");
  const [manualMachineId, setManualMachineId] = useState("");
  const [manualPlanName, setManualPlanName] = useState("الاشتراك السنوي (VIP)");
  const [manualPrice, setManualPrice] = useState(1600);
  const [manualDuration, setManualDuration] = useState(365);

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === "ALL" || sub.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;

    const docName = (sub.doctorName || "").toLowerCase();
    const clinicName = (sub.clinicName || "").toLowerCase();
    const phone = (sub.senderPhone || "").toLowerCase();
    const ref = (sub.transactionRef || "").toLowerCase();
    const machine = (sub.machineId || "").toLowerCase();

    return matchesStatus && (docName.includes(q) || clinicName.includes(q) || phone.includes(q) || ref.includes(q) || machine.includes(q));
  });

  const totalRequests = subscriptions.length;
  const pendingCount = subscriptions.filter((s) => s.status === "PENDING").length;
  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((acc, curr) => acc + curr.price, 0);

  const handleActivateSubmit = (subId: string, days: number) => {
    activateSubscription(subId, days);
    setSelectedSubForActivate(null);
  };

  const handleCreateManualSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDoctor || !manualMachineId) {
      alert("يرجى إدخال اسم الطبيب وكود الجهاز.");
      return;
    }

    addManualSubscription({
      planId: "manual",
      planName: manualPlanName,
      price: Number(manualPrice),
      paymentMethod: "vodafone",
      senderPhone: "إدخال يدوي",
      transactionRef: `MANUAL-${Date.now().toString().slice(-6)}`,
      machineId: manualMachineId,
      doctorName: manualDoctor,
      clinicName: manualClinic || "عيادة خاصة",
      status: "ACTIVE",
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + manualDuration * 24 * 60 * 60 * 1000).toISOString(),
      durationDays: manualDuration,
    });

    setShowAddManualModal(false);
    setManualDoctor("");
    setManualClinic("");
    setManualMachineId("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 text-white shadow-lg shadow-purple-900/30">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                بورتال لوحة التحكم في تفعيل الاشتراكات
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold">
                ADMIN PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              إدارة طلبات الاشتراكات، الموافقة والتفعيل المباشر، وتخصيص مدد الصلاحيات لجميع العيادات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddManualModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة اشتراك يدوي جديد ➕</span>
          </button>

          <Link
            href="/subscriptions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة لصفحة الباقات</span>
          </Link>
        </div>
      </div>

      {/* Admin Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-purple-400" />
            <span>إجمالي طلبات الاشتراكات:</span>
          </span>
          <p className="text-2xl font-black text-slate-100">{totalRequests}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-1.5 shadow-lg">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>طلبات قيد الانتظار:</span>
          </span>
          <p className="text-2xl font-black text-amber-300">{pendingCount}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5 shadow-lg">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>الاشتراكات المفعلة:</span>
          </span>
          <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5 shadow-lg">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>إجمالي إيرادات الاشتراكات:</span>
          </span>
          <p className="text-2xl font-black text-cyan-300">{totalRevenue.toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطبيب، رقم العملية، رقم الهاتف، كود الجهاز..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "ALL" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            الكل ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilterStatus("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "PENDING" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            قيد الانتظار ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === "ACTIVE" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            المفعلة ({activeCount})
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-4">الطبيب / العيادة</th>
                <th className="p-4">الباقة والقيمة</th>
                <th className="p-4">وسيلة الدفع</th>
                <th className="p-4">رقم العملية / المحول</th>
                <th className="p-4">كود الجهاز (Machine ID)</th>
                <th className="p-4">تاريخ الطلب / الانتهاء</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">أدوات التحكم والإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{sub.doctorName || "دكتور غير محدد"}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sub.clinicName || "عيادة خاصة"}</span>
                      </p>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <span className="font-extrabold text-emerald-300 block">{sub.planName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{sub.price} ج.م</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {sub.paymentMethod === "vodafone" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold">
                            <div className="relative w-4 h-4">
                              <Image src="/vodafone-cash.png" alt="VF" fill className="object-contain" />
                            </div>
                            <span>فودافون كاش</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
                            <div className="relative w-4 h-4">
                              <Image src="/instapay.png" alt="Insta" fill className="object-contain" />
                            </div>
                            <span>إنستا باي</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5 font-mono">
                      <p className="text-emerald-400 font-bold">{sub.transactionRef}</p>
                      <p className="text-slate-400 text-[11px]">{sub.senderPhone}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 block w-max">
                        {sub.machineId}
                      </span>
                    </td>

                    <td className="p-4 space-y-0.5 text-[11px]">
                      <p className="text-slate-400">تاريخ: {new Date(sub.createdAt).toLocaleDateString("ar-EG")}</p>
                      {sub.expiresAt && (
                        <p className="text-emerald-400 font-bold">ينتهي: {new Date(sub.expiresAt).toLocaleDateString("ar-EG")}</p>
                      )}
                    </td>

                    <td className="p-4">
                      {sub.status === "ACTIVE" && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مفعل</span>
                        </span>
                      )}
                      {sub.status === "PENDING" && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 w-max animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>قيد الانتظار</span>
                        </span>
                      )}
                      {sub.status === "SUSPENDED" && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold flex items-center gap-1 w-max">
                          <Pause className="w-3 h-3" />
                          <span>موقوف</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Quick Activation Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedSubForActivate(sub)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>تفعيل الباقة</span>
                        </button>

                        {/* Suspend Button */}
                        {sub.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => suspendSubscription(sub.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-600/30 text-amber-400 border border-slate-700 hover:border-amber-500/40 transition-colors"
                            title="إيقاف مؤقت للاشتراك"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("هل أنت تأكد من حذف هذا الطلب؟")) {
                              deleteSubscription(sub.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد طلبات اشتراك مطابقة للبحث الحالي.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activation Duration Selection Modal */}
      {selectedSubForActivate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedSubForActivate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Crown className="w-4 h-4" />
                <span>تأكيد التفعيل الإداري</span>
              </span>
              <h3 className="text-lg font-black text-slate-100">
                تفعيل اشتراك: {selectedSubForActivate.doctorName}
              </h3>
              <p className="text-xs text-slate-400">
                اختر مدة التفعيل المطلوبة لمنح صلاحية استخدام النظام لكود الجهاز: <strong className="font-mono text-emerald-400">{selectedSubForActivate.machineId}</strong>
              </p>
            </div>

            {/* Duration Preset Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleActivateSubmit(selectedSubForActivate.id, 30)}
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-extrabold transition-all cursor-pointer text-center"
              >
                تفعيل شهر واحد (30 يوم)
              </button>

              <button
                type="button"
                onClick={() => handleActivateSubmit(selectedSubForActivate.id, 90)}
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-extrabold transition-all cursor-pointer text-center"
              >
                تفعيل 3 شهور (90 يوم)
              </button>

              <button
                type="button"
                onClick={() => handleActivateSubmit(selectedSubForActivate.id, 180)}
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-extrabold transition-all cursor-pointer text-center"
              >
                تفعيل 6 شهور (180 يوم)
              </button>

              <button
                type="button"
                onClick={() => handleActivateSubmit(selectedSubForActivate.id, 365)}
                className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-extrabold transition-all cursor-pointer text-center"
              >
                تفعيل سنة كاملة (365 يوم) ⭐
              </button>
            </div>

            {/* Custom Days Input */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300">أو تفعيل لمدة مخصصة (عدد الأيام):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleActivateSubmit(selectedSubForActivate.id, customDays)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
                >
                  تأكيد التفعيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Subscription Modal */}
      {showAddManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateManualSub} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddManualModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>إضافة اشتراك يدوي جديد</span>
              </h3>
              <p className="text-xs text-slate-400">إدخال بيانات عيادة أو طبيب وتفعيل الاشتراك فوراً.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">اسم الطبيب:</label>
                <input
                  type="text"
                  required
                  value={manualDoctor}
                  onChange={(e) => setManualDoctor(e.target.value)}
                  placeholder="مثال: د. أحمد المحمودي"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">اسم العيادة / المركز:</label>
                <input
                  type="text"
                  value={manualClinic}
                  onChange={(e) => setManualClinic(e.target.value)}
                  placeholder="مثال: مركز الحياة الطبي"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">كود الجهاز (Machine ID):</label>
                <input
                  type="text"
                  required
                  value={manualMachineId}
                  onChange={(e) => setManualMachineId(e.target.value)}
                  placeholder="مثال: RSH-8492-E49E"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم الباقة:</label>
                  <input
                    type="text"
                    value={manualPlanName}
                    onChange={(e) => setManualPlanName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">مدة التفعيل (أيام):</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddManualModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                تفعيل وإضافة الاشتراك
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
