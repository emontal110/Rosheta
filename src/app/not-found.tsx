import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-100">404 - الصفحة غير موجودة</h2>
        <p className="text-xs text-slate-400 mt-1">عذراً، الصفحة التي تبحث عنها غير موجودة في تطبيق روشتة.</p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
      >
        العودة للرئيسية (Prescription Builder)
      </Link>
    </div>
  );
}
