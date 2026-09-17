import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  price: number;
  paymentMethod: "vodafone" | "instapay";
  senderPhone: string;
  transactionRef: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "SUSPENDED";
  machineId: string;
  doctorName?: string;
  clinicName?: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  durationDays?: number;
}

interface SubscriptionStoreState {
  subscriptions: SubscriptionRecord[];
  activeSubscription: SubscriptionRecord | null;
  machineId: string;
  
  // Actions
  submitSubscriptionRequest: (request: Omit<SubscriptionRecord, "id" | "status" | "createdAt">) => SubscriptionRecord;
  activateSubscription: (id: string, durationDays: number) => void;
  suspendSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;
  addManualSubscription: (sub: Omit<SubscriptionRecord, "id" | "createdAt">) => void;
  getMachineId: () => string;
}

const generateMachineId = () => {
  return "RSH-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const INITIAL_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: "sub-demo-001",
    planId: "annual_vip",
    planName: "الاشتراك السنوي (VIP)",
    price: 1600,
    paymentMethod: "vodafone",
    senderPhone: "01094085223",
    transactionRef: "VF-98420195",
    status: "ACTIVE",
    machineId: "RSH-8492-E49E",
    doctorName: "د. أحمد السيد",
    clinicName: "عيادات الحياة الطبية",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 365,
  },
  {
    id: "sub-demo-002",
    planId: "quarterly",
    planName: "اشتراك 3 شهور",
    price: 400,
    paymentMethod: "instapay",
    senderPhone: "01123456789",
    transactionRef: "IP-7729104",
    status: "PENDING",
    machineId: "RSH-9921-A8D8",
    doctorName: "د. مريم محمود",
    clinicName: "مركز الشفاء الطبي",
    createdAt: new Date().toISOString(),
    durationDays: 90,
  },
];

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      subscriptions: INITIAL_SUBSCRIPTIONS,
      activeSubscription: INITIAL_SUBSCRIPTIONS[0],
      machineId: generateMachineId(),

      submitSubscriptionRequest: (data) => {
        const newSub: SubscriptionRecord = {
          id: `sub-${Date.now()}`,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          ...data,
        };

        set((state) => ({
          subscriptions: [newSub, ...state.subscriptions],
        }));

        return newSub;
      },

      activateSubscription: (id, durationDays) => {
        const now = new Date();
        const expires = new Date();
        expires.setDate(now.getDate() + durationDays);

        set((state) => {
          const updatedSubs = state.subscriptions.map((sub) => {
            if (sub.id === id) {
              return {
                ...sub,
                status: "ACTIVE" as const,
                activatedAt: now.toISOString(),
                expiresAt: expires.toISOString(),
                durationDays: durationDays,
              };
            }
            return sub;
          });

          const activatedSub = updatedSubs.find((s) => s.id === id) || null;

          return {
            subscriptions: updatedSubs,
            activeSubscription: activatedSub?.machineId === state.machineId ? activatedSub : state.activeSubscription,
          };
        });
      },

      suspendSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "SUSPENDED" as const } : sub
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      addManualSubscription: (data) => {
        const newSub: SubscriptionRecord = {
          id: `sub-manual-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...data,
        };

        set((state) => ({
          subscriptions: [newSub, ...state.subscriptions],
        }));
      },

      getMachineId: () => {
        const state = get();
        if (!state.machineId) {
          const newId = generateMachineId();
          set({ machineId: newId });
          return newId;
        }
        return state.machineId;
      },
    }),
    {
      name: "rosheta-subscriptions-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
