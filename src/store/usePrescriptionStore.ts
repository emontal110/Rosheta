import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PrescriptionItem {
  id: string;
  drugId?: string;
  drugName: string;
  nameAr?: string;
  activeIngredient?: string;
  doseQuantity: string;
  doseForm: string;
  frequency: string;
  duration: string;
  instructions: string;
  isManual: boolean;
  price?: number;
}

export interface PatientInfo {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  age: number;
  height?: number; // cm
  weight?: number; // kg
  gender: "Male" | "Female";
  bloodType?: string;
  allergies: string;
  medicalHistory: string;
}

export interface VisiblePatientFields {
  showAge: boolean;
  showGender: boolean;
  showHeight: boolean;
  showWeight: boolean;
  showHeightWeight?: boolean;
  showBloodType: boolean;
  showDiagnosis: boolean;
  showMedicalHistory: boolean;
  showAllergies: boolean;
  showDate: boolean;
  showRxNo: boolean;
}

export interface PrintPatientFields {
  printAge: boolean;
  printGender: boolean;
  printHeight: boolean;
  printWeight: boolean;
  printBloodType: boolean;
  printDiagnosis: boolean;
  printMedicalHistory: boolean;
  printAllergies: boolean;
}

export type DrugLanguageMode = "ARABIC" | "ENGLISH" | "BOTH";

export interface SavedPrescriptionRecord {
  id: string;
  prescriptionNo: string;
  savedAt: string;
  patient: PatientInfo;
  diagnosis: string;
  notes: string;
  items: PrescriptionItem[];
  selectedBranchId: string;
  paperSize: "A4" | "A5";
  drugLanguageMode: DrugLanguageMode;
  visibleFields: VisiblePatientFields;
  printFields?: PrintPatientFields;
}

interface PrescriptionState {
  prescriptionNo: string;
  patient: PatientInfo;
  selectedBranchId: string;
  paperSize: "A4" | "A5";
  drugLanguageMode: DrugLanguageMode;
  visibleFields: VisiblePatientFields;
  printFields: PrintPatientFields;
  diagnosis: string;
  notes: string;
  items: PrescriptionItem[];
  isManualMode: boolean;
  
  // Archive & Patients Catalog State
  savedPrescriptions: SavedPrescriptionRecord[];
  savedPatients: PatientInfo[];

  // AI Assist State
  aiInteractions: any[];
  isAiAnalyzing: boolean;

  // Actions
  setPatient: (patient: Partial<PatientInfo>) => void;
  setSelectedBranchId: (branchId: string) => void;
  setPaperSize: (size: "A4" | "A5") => void;
  setDrugLanguageMode: (mode: DrugLanguageMode) => void;
  toggleVisibleField: (field: keyof VisiblePatientFields) => void;
  togglePrintField: (field: keyof PrintPatientFields) => void;
  setDiagnosis: (diagnosis: string) => void;
  setNotes: (notes: string) => void;
  setIsManualMode: (manual: boolean) => void;
  
  addItem: (item: Partial<PrescriptionItem>) => void;
  updateItem: (id: string, updates: Partial<PrescriptionItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setItems: (items: PrescriptionItem[]) => void;
  
  // Archive Actions
  saveCurrentPrescription: () => void;
  loadSavedPrescription: (record: SavedPrescriptionRecord) => void;
  deleteSavedPrescription: (id: string) => void;
  deleteSavedPatient: (patientId: string) => void;

  setAiInteractions: (interactions: any[]) => void;
  setIsAiAnalyzing: (analyzing: boolean) => void;
  resetPrescription: () => void;
}

const DEFAULT_PATIENT: PatientInfo = {
  id: "patient-mohamed-001",
  name: "Mohamed Aly Hassan",
  nameAr: "محمد علي حسن",
  phone: "+20 122 345 6789",
  age: 42,
  height: 175,
  weight: 80,
  gender: "Male",
  bloodType: "A+",
  allergies: "Penicillin (بنسلين)",
  medicalHistory: "Hypertension (ارتفاع ضغط الدم)",
};

const INITIAL_SAVED_PATIENTS: PatientInfo[] = [
  DEFAULT_PATIENT,
  {
    id: "patient-sara-002",
    name: "Sara Ibrahim Ahmed",
    nameAr: "سارة إبراهيم أحمد",
    phone: "+20 100 888 7766",
    age: 29,
    height: 162,
    weight: 60,
    gender: "Female",
    bloodType: "O+",
    allergies: "لا يوجد",
    medicalHistory: "حساسية أنف موسمية (Allergic Rhinitis)",
  },
  {
    id: "patient-khaled-003",
    name: "Khaled Mahmoud El-Sayed",
    nameAr: "خالد محمود السيد",
    phone: "+20 111 222 3344",
    age: 55,
    height: 170,
    weight: 85,
    gender: "Male",
    bloodType: "B+",
    allergies: "Sulfonamides (سلفا)",
    medicalHistory: "السكر النوع الثاني (Type 2 Diabetes)",
  },
];

const SAMPLE_INITIAL_ITEMS: PrescriptionItem[] = [
  {
    id: "item-1",
    drugId: "d7",
    drugName: "Augmentin 1g",
    nameAr: "أوجمنتين 1 جرام",
    activeIngredient: "Amoxicillin 875mg + Clavulanic Acid 125mg",
    doseQuantity: "1 قرص",
    doseForm: "Tablet",
    frequency: "كل 12 ساعة بعد الوجبات",
    duration: "لمدة 7 أيام",
    instructions: "استكمل الجرعة بالكامل. يشرب مع كمية كافية من الماء.",
    isManual: false,
    price: 131.0,
  },
  {
    id: "item-2",
    drugId: "d1",
    drugName: "Panadol Extra",
    nameAr: "بنادول إكسترا",
    activeIngredient: "Paracetamol 500mg + Caffeine 65mg",
    doseQuantity: "1 قرص",
    doseForm: "Tablet",
    frequency: "عند الحاجة كل 8 ساعات",
    duration: "عند اللزوم",
    instructions: "عند الشعور بالصداع أو الألم بعد الأكل.",
    isManual: false,
    price: 45.0,
  },
  {
    id: "item-3",
    drugId: "d12",
    drugName: "Antinal",
    nameAr: "إنتينال كبسول",
    activeIngredient: "Nifuroxazide 200mg",
    doseQuantity: "1 كبسولة",
    doseForm: "Capsule",
    frequency: "كل 6 ساعات",
    duration: "لمدة 4 أيام",
    instructions: "مطهر معوي واسع المجال.",
    isManual: false,
    price: 36.0,
  },
];

const DEFAULT_VISIBLE_FIELDS: VisiblePatientFields = {
  showAge: true,
  showGender: true,
  showHeight: true,
  showWeight: true,
  showHeightWeight: true,
  showBloodType: true,
  showDiagnosis: true,
  showMedicalHistory: true,
  showAllergies: true,
  showDate: true,
  showRxNo: true,
};

const DEFAULT_PRINT_FIELDS: PrintPatientFields = {
  printAge: true,
  printGender: true,
  printHeight: true,
  printWeight: true,
  printBloodType: true,
  printDiagnosis: true,
  printMedicalHistory: true,
  printAllergies: true,
};

const INITIAL_SAVED_PRESCRIPTIONS: SavedPrescriptionRecord[] = [
  {
    id: "saved-001",
    prescriptionNo: "RSH-849201",
    savedAt: "2026-09-10T14:30:00.000Z",
    patient: INITIAL_SAVED_PATIENTS[0],
    diagnosis: "التهاب الشعب الهوائية الحاد مع إجهاد عام (Acute Bronchitis)",
    notes: "يرجى الإلتزام بالراحة التامة وتناول السوائل الدافئة والمراجعة بعد أسبوع.",
    items: SAMPLE_INITIAL_ITEMS,
    selectedBranchId: "branch-maadi-001",
    paperSize: "A4",
    drugLanguageMode: "ARABIC",
    visibleFields: DEFAULT_VISIBLE_FIELDS,
    printFields: DEFAULT_PRINT_FIELDS,
  },
  {
    id: "saved-002",
    prescriptionNo: "RSH-629104",
    savedAt: "2026-09-08T11:15:00.000Z",
    patient: INITIAL_SAVED_PATIENTS[1],
    diagnosis: "نزلة برد حادة وحساسية جيوب أنفية (Acute Rhinitis)",
    notes: "تناول المشروبات الدافئة وتجنب الأتربة والمراجعة عند اللزوم.",
    items: [
      {
        id: "item-201",
        drugId: "eg-12",
        drugName: "Congestal",
        nameAr: "كونجستال أقراص",
        activeIngredient: "Paracetamol + Pseudoephedrine",
        doseQuantity: "1 قرص",
        doseForm: "Tablet",
        frequency: "كل 8 ساعات بعد الأكل (TDS)",
        duration: "لمدة 5 أيام",
        instructions: "لعلاج الرشح والاحتقان والصداع.",
        isManual: false,
        price: 31.5,
      },
      {
        id: "item-202",
        drugId: "eg-13",
        drugName: "Otrivin 0.1% Drops",
        nameAr: "أوتروفين نقط أنف 0.1%",
        activeIngredient: "Xylometazoline 0.1%",
        doseQuantity: "2 نقطة",
        doseForm: "Nasal Drops",
        frequency: "كل 12 ساعة عند الحاجة",
        duration: "لمدة 3 أيام فقط",
        instructions: "لا تزيد مدة الاستخدام عن 3 أيام متتالية.",
        isManual: false,
        price: 25.0,
      },
    ],
    selectedBranchId: "branch-maadi-001",
    paperSize: "A4",
    drugLanguageMode: "ARABIC",
    visibleFields: DEFAULT_VISIBLE_FIELDS,
    printFields: DEFAULT_PRINT_FIELDS,
  },
];

export const usePrescriptionStore = create<PrescriptionState>()(
  persist(
    (set, get) => ({
      prescriptionNo: "RSH-849201",
      patient: DEFAULT_PATIENT,
      selectedBranchId: "branch-maadi-001",
      paperSize: "A4",
      drugLanguageMode: "ARABIC",
      visibleFields: DEFAULT_VISIBLE_FIELDS,
      printFields: DEFAULT_PRINT_FIELDS,
      diagnosis: "التهاب الشعب الهوائية الحاد مع إجهاد عام (Acute Bronchitis)",
      notes: "يرجى الإلتزام بالراحة التامة وتناول السوائل الدافئة والمراجعة بعد أسبوع.",
      items: SAMPLE_INITIAL_ITEMS,
      isManualMode: false,
      savedPrescriptions: INITIAL_SAVED_PRESCRIPTIONS,
      savedPatients: INITIAL_SAVED_PATIENTS,
      aiInteractions: [],
      isAiAnalyzing: false,

      setPatient: (patientUpdates) =>
        set((state) => ({ patient: { ...state.patient, ...patientUpdates } })),

      setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),
      setPaperSize: (paperSize) => set({ paperSize }),
      setDrugLanguageMode: (drugLanguageMode) => set({ drugLanguageMode }),
      toggleVisibleField: (field) =>
        set((state) => ({
          visibleFields: {
            ...state.visibleFields,
            [field]: !state.visibleFields[field],
          },
        })),
      togglePrintField: (field) =>
        set((state) => ({
          printFields: {
            ...state.printFields,
            [field]: !state.printFields[field],
          },
        })),
      setDiagnosis: (diagnosis) => set({ diagnosis }),
      setNotes: (notes) => set({ notes }),
      setIsManualMode: (isManualMode) => set({ isManualMode }),

      addItem: (item) => {
        const newItem: PrescriptionItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          drugName: item.drugName || "دواء غير مدرج",
          nameAr: item.nameAr || item.drugName,
          activeIngredient: item.activeIngredient || "",
          doseQuantity: item.doseQuantity || "1 قرص",
          doseForm: item.doseForm || "Tablet",
          frequency: item.frequency || "كل 12 ساعة بعد الأكل",
          duration: item.duration || "لمدة 5 أيام",
          instructions: item.instructions || "",
          isManual: item.isManual || false,
          price: item.price || 0,
          ...item,
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        })),

      clearItems: () => set({ items: [] }),
      setItems: (items) => set({ items }),

      saveCurrentPrescription: () => {
        const state = get();
        const currentPatient = state.patient;

        // Ensure current patient has a valid name before archiving
        const patientName = currentPatient.nameAr || currentPatient.name || "مريض بدون اسم";

        const newRecord: SavedPrescriptionRecord = {
          id: `saved-${Date.now()}`,
          prescriptionNo: state.prescriptionNo,
          savedAt: new Date().toISOString(),
          patient: { ...currentPatient, nameAr: patientName, name: currentPatient.name || patientName },
          diagnosis: state.diagnosis,
          notes: state.notes,
          items: [...state.items],
          selectedBranchId: state.selectedBranchId,
          paperSize: state.paperSize,
          drugLanguageMode: state.drugLanguageMode,
          visibleFields: { ...state.visibleFields },
          printFields: { ...state.printFields },
        };

        // Update patient list (add if new, update if existing)
        const patientIndex = state.savedPatients.findIndex(
          (p) =>
            p.id === currentPatient.id ||
            (p.nameAr && p.nameAr === currentPatient.nameAr) ||
            (p.phone && currentPatient.phone && p.phone === currentPatient.phone)
        );

        let updatedPatients = [...state.savedPatients];
        if (patientIndex >= 0) {
          updatedPatients[patientIndex] = { ...currentPatient, nameAr: patientName };
        } else {
          updatedPatients = [{ ...currentPatient, nameAr: patientName }, ...updatedPatients];
        }

        // Save record to archive & reset prescription to a fresh empty prescription
        set({
          savedPrescriptions: [newRecord, ...state.savedPrescriptions],
          savedPatients: updatedPatients,
          prescriptionNo: `RSH-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [],
          diagnosis: "",
          notes: "يرجى الإلتزام بالجرعات والمراجعة في الموعد المحدد.",
          aiInteractions: [],
          patient: {
            id: `patient-${Date.now()}`,
            name: "",
            nameAr: "",
            phone: "",
            age: 30,
            gender: "Male",
            bloodType: "A+",
            allergies: "",
            medicalHistory: "",
          },
        });
      },

      loadSavedPrescription: (record) => {
        set({
          prescriptionNo: record.prescriptionNo,
          patient: { ...record.patient },
          diagnosis: record.diagnosis,
          notes: record.notes,
          items: [...record.items],
          selectedBranchId: record.selectedBranchId || "branch-maadi-001",
          paperSize: record.paperSize || "A4",
          drugLanguageMode: record.drugLanguageMode || "ARABIC",
          visibleFields: record.visibleFields ? { ...record.visibleFields } : DEFAULT_VISIBLE_FIELDS,
          printFields: record.printFields ? { ...record.printFields } : DEFAULT_PRINT_FIELDS,
        });
      },

      deleteSavedPrescription: (id) => {
        set((state) => ({
          savedPrescriptions: state.savedPrescriptions.filter((r) => r.id !== id),
        }));
      },

      deleteSavedPatient: (patientId) => {
        set((state) => ({
          savedPatients: state.savedPatients.filter((p) => p.id !== patientId),
          savedPrescriptions: state.savedPrescriptions.filter((r) => r.patient.id !== patientId),
        }));
      },

      setAiInteractions: (aiInteractions) => set({ aiInteractions }),
      setIsAiAnalyzing: (isAiAnalyzing) => set({ isAiAnalyzing }),

      resetPrescription: () =>
        set({
          prescriptionNo: `RSH-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [],
          diagnosis: "",
          notes: "يرجى الإلتزام بالجرعات والمراجعة في الموعد المحدد.",
          aiInteractions: [],
        }),
    }),
    {
      name: "rosheta-prescription-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prescriptionNo: state.prescriptionNo,
        patient: state.patient,
        selectedBranchId: state.selectedBranchId,
        paperSize: state.paperSize,
        drugLanguageMode: state.drugLanguageMode,
        visibleFields: state.visibleFields,
        printFields: state.printFields,
        diagnosis: state.diagnosis,
        notes: state.notes,
        items: state.items,
        isManualMode: state.isManualMode,
        savedPrescriptions: state.savedPrescriptions,
        savedPatients: state.savedPatients,
      }),
    }
  )
);
