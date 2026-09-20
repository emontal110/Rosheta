import crypto from "crypto";

const SECRET_KEY = process.env.SUBSCRIPTION_SECRET || "ROSHETA_COMMERCIAL_SECURE_HMAC_KEY_2026_V1";
const CLOCK_GUARD_KEY = "rosheta_monotonic_clock_highwater";

export interface SubscriptionTokenPayload {
  machineId: string;
  status: string;
  expiresAt: string | null;
}

/**
 * Generates an HMAC SHA-256 cryptographic signature token for a subscription record.
 * This ensures client-side LocalStorage cannot be manually edited via DevTools.
 */
export function generateSubscriptionSignature(
  machineId: string,
  status: string,
  expiresAt: string | null | undefined
): string {
  const cleanExpire = expiresAt ? new Date(expiresAt).toISOString() : "NO_EXPIRE";
  const payload = `${machineId.toUpperCase()}:${status.toUpperCase()}:${cleanExpire}`;
  return crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
}

/**
 * Verifies whether a given cryptographic signature token matches the machine subscription payload.
 */
export function verifySubscriptionSignature(
  machineId: string,
  status: string,
  expiresAt: string | null | undefined,
  token: string | null | undefined
): boolean {
  if (!token) return false;
  const expectedToken = generateSubscriptionSignature(machineId, status, expiresAt);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

/**
 * Detects if the user set their system date/clock backwards to gain free subscription days offline.
 * Maintains a monotonic high-water mark timestamp that only moves forward.
 */
export function checkSystemClockRollback(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const now = Date.now();
  const rawHighwater = localStorage.getItem(CLOCK_GUARD_KEY);

  if (rawHighwater) {
    const lastHighwater = parseInt(rawHighwater, 10);
    // If current time is earlier than highwater by more than 10 minutes (600,000ms), clock tampering is detected!
    if (now < lastHighwater - 600000) {
      console.warn("System clock rollback detected! Anti-tampering protection activated.");
      return true; // Clock tampered!
    }
  }

  // Update highwater mark to highest recorded time
  if (!rawHighwater || now > parseInt(rawHighwater, 10)) {
    localStorage.setItem(CLOCK_GUARD_KEY, now.toString());
  }

  return false;
}
