import { SavedPrescriptionRecord } from "@/store/usePrescriptionStore";
import { compactPrescriptionForStorage } from "@/lib/compactPayload";

export interface SyncQueueItem {
  id: string;
  type: "SAVE" | "DELETE";
  machineId: string;
  recordId: string;
  payload?: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = "rosheta_offline_sync_queue";
let isFlushing = false;
let isListenerInitialized = false;

/**
 * Reads pending sync queue from LocalStorage.
 */
export function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to parse sync queue:", e);
    return [];
  }
}

/**
 * Saves sync queue to LocalStorage.
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("Failed to write sync queue:", e);
  }
}

/**
 * Enqueues a SAVE prescription action asynchronously.
 * Uses compact serialization to save 70%+ DB space for Supabase Free Tier compatibility.
 */
export function enqueuePrescriptionSave(record: SavedPrescriptionRecord, machineId: string): void {
  const queue = getSyncQueue();
  const compactPayload = compactPrescriptionForStorage(record, machineId);

  const newItem: SyncQueueItem = {
    id: `sync-save-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "SAVE",
    machineId: machineId || "DEFAULT_MACHINE",
    recordId: record.id,
    payload: compactPayload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(newItem);
  saveSyncQueue(queue);

  // Trigger background flush silently
  triggerQueueFlush();
}

/**
 * Enqueues a DELETE prescription action asynchronously.
 */
export function enqueuePrescriptionDelete(recordId: string, machineId: string): void {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    id: `sync-delete-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "DELETE",
    machineId: machineId || "DEFAULT_MACHINE",
    recordId: recordId,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(newItem);
  saveSyncQueue(queue);

  // Trigger background flush silently
  triggerQueueFlush();
}

/**
 * Flushes pending queue items to Supabase API asynchronously.
 */
export async function triggerQueueFlush(): Promise<void> {
  if (typeof window === "undefined" || isFlushing) return;

  // Check network online status
  if (!navigator.onLine) {
    console.log("Device offline: Queue stored safely locally.");
    return;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  isFlushing = true;
  const remainingQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      const response = await fetch("/api/prescriptions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Sync API responded with status ${response.status}`);
      }
    } catch (err) {
      console.warn(`Background sync item ${item.id} failed, will retry:`, err);
      item.retryCount += 1;
      if (item.retryCount < 5) {
        remainingQueue.push(item);
      }
    }
  }

  saveSyncQueue(remainingQueue);
  isFlushing = false;
}

/**
 * Initializes automatic online/offline background sync listener.
 */
export function initPrescriptionSyncAutoListener(): void {
  if (typeof window === "undefined" || isListenerInitialized) return;
  isListenerInitialized = true;

  window.addEventListener("online", () => {
    console.log("Network connection restored: Flushing prescription background queue...");
    triggerQueueFlush();
  });

  // Run initial flush on mount if online
  if (navigator.onLine) {
    triggerQueueFlush();
  }
}
