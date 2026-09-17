import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BranchInfo {
  id: string;
  name: string;
  nameAr?: string;
  address: string;
  phone: string;
  workingHours: string;
  isDefault: boolean;
}

export interface ClinicBranding {
  id: string;
  name: string;
  nameAr?: string;
  specialty: string;
  logoUrl: string;
  primaryColor: string; // Hex color code
  fontFamily?: string; // Font Family choice
  headerText: string;
  footerText: string;
  showHeader: boolean;
  showFooter: boolean;
  notesTemplate: string;
  doctorName: string;
  doctorTitle: string;
  syndicateId: string;
}

interface ClinicStoreState {
  clinic: ClinicBranding;
  branches: BranchInfo[];
  
  // Actions
  updateClinic: (updates: Partial<ClinicBranding>) => void;
  addBranch: (branch: Omit<BranchInfo, "id">) => void;
  updateBranch: (id: string, updates: Partial<BranchInfo>) => void;
  deleteBranch: (id: string) => void;
  setDefaultBranch: (id: string) => void;
}

const INITIAL_CLINIC: ClinicBranding = {
  id: "clinic-el-hayah-001",
  name: "El-Hayah Medical & Aesthetic Centers",
  nameAr: "مجمع عيادات ومراكز الحياة الطبية التخصصية",
  specialty: "Multi-Specialty Human Clinics & Aesthetics",
  logoUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300",
  primaryColor: "#059669", // Emerald Medical Teal
  fontFamily: "'Cairo', sans-serif",
  headerText: "عيادات د. أحمد السيد - استشاري الأمراض المزمنة والتجميل",
  footerText: "برج الأطباء - القاهرة والإسكندرية | للطلبات والاستفسار: 19001",
  showHeader: true,
  showFooter: true,
  notesTemplate: "يرجى الالتزام بالجرعات والمراجعة بعد أسبوع مع الفحوصات والتحاليل.",
  doctorName: "Dr. Ahmed El-Sayed (د. أحمد السيد)",
  doctorTitle: "استشاري الباطنة العامة وعلاج الألم والأمراض المزمنة",
  syndicateId: "نقابة الأطباء: 84920",
};

const INITIAL_BRANCHES: BranchInfo[] = [
  {
    id: "branch-maadi-001",
    name: "Maadi Main Branch",
    nameAr: "فرع المعادي الرئيسي",
    address: "برج الأطباء - شارع 9 - المعادي - القاهرة",
    phone: "+20 100 123 4567",
    workingHours: "السبت إلى الخميس: 4:00 م - 10:00 م",
    isDefault: true,
  },
  {
    id: "branch-nasrcity-002",
    name: "Nasr City Branch",
    nameAr: "فرع مدينة نصر",
    address: "45 شارع عباس العقاد - أمام الحديقة الدولية - مدينة نصر",
    phone: "+20 111 987 6543",
    workingHours: "الأحد والأربعاء: 2:00 م - 8:00 م",
    isDefault: false,
  },
  {
    id: "branch-alex-003",
    name: "Alexandria Center",
    nameAr: "فرع الإسكندرية - سموحة",
    address: "ميدان فيكتور عمانويل - برج الأطباء - سموحة - الإسكندرية",
    phone: "+20 122 888 9900",
    workingHours: "الجمعة: 1:00 م - 7:00 م",
    isDefault: false,
  },
];

export const useClinicStore = create<ClinicStoreState>()(
  persist(
    (set) => ({
      clinic: INITIAL_CLINIC,
      branches: INITIAL_BRANCHES,

      updateClinic: (updates) =>
        set((state) => ({ clinic: { ...state.clinic, ...updates } })),

      addBranch: (branchData) => {
        const newBranch: BranchInfo = {
          id: `branch-${Date.now()}`,
          ...branchData,
        };
        set((state) => ({ branches: [...state.branches, newBranch] }));
      },

      updateBranch: (id, updates) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),

      setDefaultBranch: (id) =>
        set((state) => ({
          branches: state.branches.map((b) => ({
            ...b,
            isDefault: b.id === id,
          })),
        })),
    }),
    {
      name: "rosheta-clinic-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
