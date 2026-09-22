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
  id: "clinic-001",
  name: "",
  nameAr: "",
  specialty: "",
  logoUrl: "",
  primaryColor: "#059669", // Emerald Medical Teal
  fontFamily: "'Cairo', sans-serif",
  headerText: "",
  footerText: "",
  showHeader: true,
  showFooter: true,
  notesTemplate: "",
  doctorName: "",
  doctorTitle: "",
  syndicateId: "",
};

const INITIAL_BRANCHES: BranchInfo[] = [
  {
    id: "branch-main-001",
    name: "Main Branch",
    nameAr: "الفرع الرئيسي",
    address: "",
    phone: "",
    workingHours: "",
    isDefault: true,
  },
];

export const useClinicStore = create<ClinicStoreState>()(
  persist(
    (set) => ({
      clinic: INITIAL_CLINIC,
      branches: INITIAL_BRANCHES,

      updateClinic: (updates) =>
        set((state) => {
          const updatedClinic = { ...state.clinic, ...updates };
          if (typeof window !== "undefined") {
            try {
              const { useSubscriptionStore } = require("@/store/useSubscriptionStore");
              useSubscriptionStore
                .getState()
                .updateDoctorInfo(
                  updatedClinic.doctorName || "",
                  updatedClinic.nameAr || updatedClinic.name || ""
                );
            } catch {
              // ignore sync errors
            }
          }
          return { clinic: updatedClinic };
        }),

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
