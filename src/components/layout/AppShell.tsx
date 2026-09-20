"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Building2,
  Users,
  Pill,
  Settings,
  PlusCircle,
  Activity,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Sparkles,
  QrCode,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { useClinicStore } from "@/store/useClinicStore";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";
import pkg from "../../../package.json";

// Helper to format version into major.minor format (e.g., "2.5.0" or "2.5" => "2.5")
const getDisplayVersion = (rawVersion: string): string => {
  const parts = rawVersion.split(".");
  const major = parts[0] || "1";
  const minor = parts[1] || "0";
  return `${major}.${minor}`;
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { clinic, branches } = useClinicStore();
  const { selectedBranchId, setSelectedBranchId, items, aiInteractions } = usePrescriptionStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standalone Layout for Admin Portal & Admin Login (No main app header, no sidebar, no bottom nav)
  if (pathname?.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-[#070c1e] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white dir-rtl">
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-[#070c1e] via-[#0b132b] to-[#0f172a]">
          {children}
        </main>
      </div>
    );
  }

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const navLinks = [
    { href: "/", label: "Prescription Builder", icon: FileText, badge: items.length },
    { href: "/patients", label: "Patients Catalog", icon: Users },
    { href: "/drugs", label: "Egyptian Drug Bank", icon: Pill, badge: "43k+" },
    { href: "/settings", label: "Clinic setting", icon: Building2 },
    { href: "/subscriptions", label: "باقات الاشتراك", icon: Crown, badge: "PRO" },
  ];

  return (
    <div className="min-h-screen bg-[#070c1e] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-emerald-500/30 transition-transform group-hover:scale-105 bg-[#131b24] shrink-0">
              <img src="/icon.svg" alt="Rosheta Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Rosheta
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v{getDisplayVersion(pkg.version)} PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {clinic.name}
              </p>
            </div>
          </Link>
        </div>

        {/* Doctor Quick Info & Alerts */}
        <div className="flex items-center gap-3">
          {/* AI Alert Pill Indicator */}
          {aiInteractions.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden md:inline">{aiInteractions.length} Warning(s)</span>
            </div>
          )}

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              Dr
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-xs font-semibold text-slate-200">{clinic.doctorName.split("(")[0]}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Consultant</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0f172a]/60 backdrop-blur-xl border-r border-slate-800/80 p-4 justify-between no-print">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Main Menu
              </div>
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-800 text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="space-y-3">
            {/* Branch Selector Card at Bottom of Sidebar (Only shown if more than 1 branch) */}
            {branches.length > 1 ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 text-xs space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تغيير الفرع الحالي:</span>
                  </span>
                  <span className="text-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {branches.length} فروع
                  </span>
                </div>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                      {b.nameAr || b.name}
                    </option>
                  ))}
                </select>
                <p className="text-slate-400 text-[11px] truncate font-medium flex items-center gap-1.5">
                  <span>📞</span>
                  <span dir="ltr" className="inline-block font-semibold">{activeBranch.phone}</span>
                </p>
              </div>
            ) : (
              /* Static Active Location display when 1 branch exists */
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الفرع الحالي:</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px]">نشط</span>
                </div>
                <p className="text-slate-200 font-medium truncate">{activeBranch.nameAr || activeBranch.name}</p>
                <p className="text-slate-400 text-[11px] truncate flex items-center gap-1.5">
                  <span dir="ltr" className="inline-block font-semibold">{activeBranch.phone}</span>
                </p>
              </div>
            )}

            {/* Smart Prescription AI Info Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Smart Prescription AI</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Trigram 43,500+ Drug bank search with interaction safety checks.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Flyout Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
            <div className="w-4/5 max-w-xs bg-slate-900 h-full p-5 flex flex-col justify-between border-r border-slate-800 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src="/icon.svg" alt="Rosheta" className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30" />
                    <span className="font-bold text-lg text-emerald-400">Rosheta Navigation</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-emerald-400" />
                          <span>{link.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Sidebar Branch Selector / Info */}
              <div className="space-y-3 pt-4">
                {branches.length > 1 ? (
                  <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تغيير الفرع الحالي:</span>
                      </span>
                      <span className="text-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {branches.length} فروع
                      </span>
                    </div>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                          {b.nameAr || b.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-slate-400 text-[11px] truncate flex items-center gap-1.5">
                      <span>📞</span>
                      <span dir="ltr" className="inline-block font-semibold">{activeBranch.phone}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/80 rounded-2xl text-xs space-y-1 text-slate-300">
                    <p className="font-bold text-emerald-400">{clinic.name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>📞</span>
                      <span dir="ltr" className="inline-block font-semibold">{activeBranch.phone}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-[#070c1e] via-[#0b132b] to-[#0f172a]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom PWA Navigation Bar */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-2 no-print">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-medium transition-all ${isActive ? "text-emerald-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
