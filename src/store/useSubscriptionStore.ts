import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateSubscriptionSignature, verifySubscriptionSignature, checkSystemClockRollback } from "@/lib/subscriptionAuth";

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
  allowedMachineIds?: string[];
  doctorName?: string;
  clinicName?: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  durationDays?: number;
  signatureToken?: string;
  isTrial?: boolean;
}

export function hasUsedFreeTrial(subscriptions: SubscriptionRecord[], machineId: string): boolean {
  if (!subscriptions || subscriptions.length === 0) return false;
  return subscriptions.some(
    (s) =>
      (s.machineId === machineId || (s.allowedMachineIds && s.allowedMachineIds.includes(machineId))) &&
      (s.planId === "trial" || s.isTrial === true || s.price === 0 || (s.planName && s.planName.includes("تجريبي")))
  );
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
  adjustSubscriptionDays: (id: string, daysDelta: number) => void;
  updateBoundMachineId: (id: string, newMachineId: string) => void;
  addAllowedMachineId: (id: string, newMachineId: string) => void;
  removeAllowedMachineId: (id: string, targetMachineId: string) => void;
  getMachineId: () => string;
}

const generateMachineId = () => {
  return "RSH-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
};

export function getSubscriptionDetails(subscriptions: SubscriptionRecord[], machineId: string) {
  // Find subscription matching either primary machineId or listed in allowedMachineIds
  const currentSub = subscriptions.find(
    (s) => s.machineId === machineId || (s.allowedMachineIds && s.allowedMachineIds.includes(machineId))
  );

  if (!currentSub) {
    return {
      status: "UNREGISTERED",
      statusLabel: "غير مسجل / غير مفعّل 🔒",
      badgeColor: "bg-slate-800 text-slate-400 border-slate-700",
      planName: "لا يوجد اشتراك مفعّل",
      daysRemaining: 0,
      isExpired: true,
      isPending: false,
      isActive: false,
      currentSub: null,
    };
  }

  const now = Date.now();
  let daysRemaining = 0;
  if (currentSub.expiresAt) {
    const expireTime = new Date(currentSub.expiresAt).getTime();
    daysRemaining = Math.max(0, Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24)));
  } else if (currentSub.activatedAt && currentSub.durationDays) {
    const expireTime = new Date(currentSub.activatedAt).getTime() + currentSub.durationDays * 24 * 60 * 60 * 1000;
    daysRemaining = Math.max(0, Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24)));
  } else {
    daysRemaining = currentSub.durationDays || 0;
  }

  // Anti-Tampering Check 1: Cryptographic Signature Verification
  let isSignatureTampered = false;
  if (currentSub.status === "ACTIVE" && currentSub.signatureToken) {
    const isValidSignature = verifySubscriptionSignature(
      currentSub.machineId,
      currentSub.status,
      currentSub.expiresAt,
      currentSub.signatureToken
    );
    if (!isValidSignature) {
      isSignatureTampered = true;
    }
  }

  // Anti-Tampering Check 2: System Clock Rollback Verification (Prevents setting PC clock back)
  const isClockRollback = checkSystemClockRollback();

  const isPending = currentSub.status === "PENDING";
  const isSuspended = currentSub.status === "SUSPENDED" || isSignatureTampered || isClockRollback;
  const isExpired = currentSub.status === "EXPIRED" || daysRemaining <= 0 || isSignatureTampered || isClockRollback;
  const isActive = currentSub.status === "ACTIVE" && daysRemaining > 0 && !isSignatureTampered && !isClockRollback;

  let statusLabel = "نشط ✅";
  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  if (isPending) {
    statusLabel = "بانتظار التفعيل ⏳";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  } else if (isClockRollback) {
    statusLabel = "تم كشف تلاعب بتاريخ الجهاز ⚠️";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30 font-black";
  } else if (isSignatureTampered) {
    statusLabel = "تم اكتشاف تلاعب بالبيانات ⚠️";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30 font-black";
  } else if (isSuspended) {
    statusLabel = "معلّق ⛔";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
  } else if (isExpired) {
    statusLabel = "منتهي ⚠️";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
  }

  return {
    status: (isSignatureTampered || isClockRollback) ? "SUSPENDED" : currentSub.status,
    statusLabel,
    badgeColor,
    planName: currentSub.planName || "باقة الاشتراك",
    daysRemaining,
    isExpired,
    isPending,
    isSuspended,
    isActive,
    currentSub,
  };
}

const INITIAL_SUBSCRIPTIONS: SubscriptionRecord[] = [];

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      subscriptions: INITIAL_SUBSCRIPTIONS,
      activeSubscription: null,
      machineId: "RSH-0000-0000",

      submitSubscriptionRequest: (data) => {
        const newSub: SubscriptionRecord = {
          id: `sub-${Date.now()}`,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          allowedMachineIds: [],
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
              const signatureToken = generateSubscriptionSignature(
                sub.machineId,
                "ACTIVE",
                expires.toISOString()
              );

              return {
                ...sub,
                status: "ACTIVE" as const,
                activatedAt: now.toISOString(),
                expiresAt: expires.toISOString(),
                durationDays: durationDays,
                signatureToken,
              };
            }
            return sub;
          });

          const activatedSub = updatedSubs.find((s) => s.id === id) || null;

          return {
            subscriptions: updatedSubs,
            activeSubscription: (activatedSub?.machineId === state.machineId || activatedSub?.allowedMachineIds?.includes(state.machineId)) ? activatedSub : state.activeSubscription,
          };
        });
      },

      adjustSubscriptionDays: (id, daysDelta) => {
        set((state) => {
          const updatedSubs = state.subscriptions.map((sub) => {
            if (sub.id === id) {
              const currentExpire = sub.expiresAt ? new Date(sub.expiresAt).getTime() : Date.now();
              const newExpireTime = currentExpire + daysDelta * 24 * 60 * 60 * 1000;
              const now = Date.now();
              const isExpiredNow = newExpireTime <= now;
              const newStatus = isExpiredNow ? ("EXPIRED" as const) : ("ACTIVE" as const);
              const expiresIso = new Date(newExpireTime).toISOString();
              const signatureToken = generateSubscriptionSignature(
                sub.machineId,
                newStatus,
                expiresIso
              );

              return {
                ...sub,
                expiresAt: expiresIso,
                status: newStatus,
                durationDays: Math.max(0, Math.ceil((newExpireTime - (sub.activatedAt ? new Date(sub.activatedAt).getTime() : now)) / (1000 * 60 * 60 * 24))),
                signatureToken,
              };
            }
            return sub;
          });

          return { subscriptions: updatedSubs };
        });
      },

      updateBoundMachineId: (id, newMachineId) => {
        const cleanId = newMachineId.trim().toUpperCase();
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id === id) {
              const signatureToken = generateSubscriptionSignature(
                cleanId,
                sub.status,
                sub.expiresAt
              );
              return { ...sub, machineId: cleanId, signatureToken };
            }
            return sub;
          }),
        }));
      },

      addAllowedMachineId: (id, newMachineId) => {
        const cleanId = newMachineId.trim().toUpperCase();
        if (!cleanId) return;

        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id === id) {
              const currentList = sub.allowedMachineIds || [];
              if (!currentList.includes(cleanId)) {
                return { ...sub, allowedMachineIds: [...currentList, cleanId] };
              }
            }
            return sub;
          }),
        }));
      },

      removeAllowedMachineId: (id, targetMachineId) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id === id) {
              return {
                ...sub,
                allowedMachineIds: (sub.allowedMachineIds || []).filter((m) => m !== targetMachineId),
              };
            }
            return sub;
          }),
        }));
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
        const expires = data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const signatureToken = generateSubscriptionSignature(
          data.machineId,
          data.status || "ACTIVE",
          expires
        );

        const newSub: SubscriptionRecord = {
          id: `sub-manual-${Date.now()}`,
          createdAt: new Date().toISOString(),
          allowedMachineIds: [],
          expiresAt: expires,
          signatureToken,
          ...data,
        };

        set((state) => ({
          subscriptions: [newSub, ...state.subscriptions],
        }));
      },

      getMachineId: () => {
        const state = get();
        if (!state.machineId || state.machineId === "RSH-0000-0000") {
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
