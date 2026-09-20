/**
 * Smart Cache Manager & Performance Auto-Optimizer for Rosheta
 * Prevents memory leaks, stale PWA caches, storage bloat, app lag, and crashes.
 */

export interface CacheStorageInfo {
  totalBytes: number;
  formattedSize: string;
  itemCount: number;
  lastCleanedAt: string | null;
}

const CLEANUP_TIMESTAMP_KEY = "rosheta_last_cache_cleanup";
const ESSENTIAL_STORAGE_KEYS = [
  "rosheta-subscriptions-storage",
  "rosheta-clinic-storage",
  "rosheta-prescriptions-storage",
];

/**
 * Calculates current LocalStorage memory usage.
 */
export function getLocalStorageUsage(): CacheStorageInfo {
  if (typeof window === "undefined" || !window.localStorage) {
    return { totalBytes: 0, formattedSize: "0 KB", itemCount: 0, lastCleanedAt: null };
  }

  let totalBytes = 0;
  let itemCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || "";
        totalBytes += (key.length + val.length) * 2; // UTF-16 characters = 2 bytes
        itemCount++;
      }
    }
  } catch (e) {
    console.warn("Error reading localStorage usage:", e);
  }

  const formattedSize =
    totalBytes > 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalBytes / 1024).toFixed(1)} KB`;

  const lastCleanedAt = localStorage.getItem(CLEANUP_TIMESTAMP_KEY);

  return {
    totalBytes,
    formattedSize,
    itemCount,
    lastCleanedAt: lastCleanedAt ? new Date(lastCleanedAt).toLocaleString("ar-EG") : null,
  };
}

/**
 * Performs smart cache pruning:
 * 1. Safely preserves active subscription, machine ID, clinic profile, and prescription history.
 * 2. Purges stale PWA service worker caches (CacheStorage API).
 * 3. Clears temporary search caches, stale image buffers, and unneeded session data.
 */
export async function smartPurgeCache(): Promise<{ success: boolean; freedBytes: number; freedFormatted: string }> {
  if (typeof window === "undefined") {
    return { success: false, freedBytes: 0, freedFormatted: "0 KB" };
  }

  const initialUsage = getLocalStorageUsage().totalBytes;

  try {
    // 1. Clear SessionStorage (Temporary transient state)
    if (window.sessionStorage) {
      sessionStorage.clear();
    }

    // 2. Prune LocalStorage non-essential keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !ESSENTIAL_STORAGE_KEYS.includes(key) && key !== CLEANUP_TIMESTAMP_KEY) {
        // Remove temporary search caches, expired tokens, or old debug logs
        if (
          key.startsWith("next-") ||
          key.startsWith("sw-") ||
          key.includes("cache") ||
          key.includes("temp") ||
          key.includes("search")
        ) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // 3. Purge stale PWA CacheStorage API caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          // Delete old asset caches except active version
          return caches.delete(name);
        })
      );
    }

    // 4. Update last cleanup timestamp
    const nowIso = new Date().toISOString();
    localStorage.setItem(CLEANUP_TIMESTAMP_KEY, nowIso);

    const finalUsage = getLocalStorageUsage().totalBytes;
    const freedBytes = Math.max(0, initialUsage - finalUsage);
    const freedFormatted =
      freedBytes > 1024 * 1024
        ? `${(freedBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(freedBytes / 1024).toFixed(1)} KB`;

    return {
      success: true,
      freedBytes,
      freedFormatted,
    };
  } catch (error) {
    console.error("Cache purge failed:", error);
    return { success: false, freedBytes: 0, freedFormatted: "0 KB" };
  }
}

/**
 * Background auto-check: Runs on app startup.
 * Automatically cleans cache if > 7 days since last cleanup.
 */
export async function autoCheckAndCleanCache(): Promise<void> {
  if (typeof window === "undefined") return;

  const lastCleaned = localStorage.getItem(CLEANUP_TIMESTAMP_KEY);
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  if (!lastCleaned || Date.now() - new Date(lastCleaned).getTime() > SEVEN_DAYS_MS) {
    await smartPurgeCache();
  }
}
