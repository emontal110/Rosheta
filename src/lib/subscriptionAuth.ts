const SECRET_KEY = process.env.SUBSCRIPTION_SECRET || "ROSHETA_COMMERCIAL_SECURE_HMAC_KEY_2026_V1";
const CLOCK_GUARD_KEY = "rosheta_monotonic_clock_highwater";

export interface SubscriptionTokenPayload {
  machineId: string;
  status: string;
  expiresAt: string | null;
}

/**
 * Browser-safe timing-constant string comparison to prevent timing side-channel attacks.
 */
function safeConstantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a deterministic cryptographic checksum token for a subscription record.
 * Compatible with Node.js SSR and Browser client-side environments.
 */
export function generateSubscriptionSignature(
  machineId: string,
  status: string,
  expiresAt: string | null | undefined
): string {
  const cleanExpire = expiresAt ? new Date(expiresAt).toISOString() : "NO_EXPIRE";
  const payload = `${SECRET_KEY}:${machineId.toUpperCase()}:${status.toUpperCase()}:${cleanExpire}`;
  
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < payload.length; i++) {
    ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
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
  return safeConstantTimeCompare(token, expectedToken);
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
