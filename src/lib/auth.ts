import crypto from "crypto";

// Security secret for hashing & admin session signature
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || "rosheta-super-admin-secret-key-30630";
export const ADMIN_COOKIE_NAME = "rosheta_admin_session";

// Salted SHA-256 Hashing Function
export function hashPassword(password: string): string {
  const salt = "rosheta_secure_salt_2026_v1";
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash;
}

// Verify Password
export function verifyPassword(password: string, storedHash: string): boolean {
  const hash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

// Generate Admin Session Token
export function createAdminSessionToken(email: string): string {
  const timestamp = Date.now().toString();
  const data = `${email}:${timestamp}:${ADMIN_SECRET}`;
  const signature = crypto.createHash("sha256").update(data).digest("hex");
  return Buffer.from(`${email}:${timestamp}:${signature}`).toString("base64");
}

// Verify Admin Session Token
export function verifyAdminSessionToken(token: string, expectedEmail: string = "emontal.33@gmail.com"): boolean {
  try {
    if (!token) return false;
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email, timestamp, signature] = decoded.split(":");

    if (!email || !timestamp || !signature) return false;
    if (email.toLowerCase() !== expectedEmail.toLowerCase()) return false;

    // Check expiration (24 hours valid session)
    const tokenTime = parseInt(timestamp, 10);
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 Hours
    if (isNaN(tokenTime) || Date.now() - tokenTime > maxAgeMs) return false;

    // Verify signature match
    const data = `${email}:${timestamp}:${ADMIN_SECRET}`;
    const expectedSignature = crypto.createHash("sha256").update(data).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
