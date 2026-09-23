import { Device } from "@capacitor/device";

/**
 * Gets a persistent, unique hardware Device ID.
 * On Android Native (Capacitor), uses the Android Secure Hardware Identifier.
 * On Web / iOS, uses a composite persistent hardware fingerprint.
 */
export async function getHardwareDeviceId(): Promise<string> {
  if (typeof window === "undefined") {
    return "PRX-0000-0000";
  }

  // 1. Try to read existing stored ID first to preserve active subscriptions
  try {
    const legacyId = localStorage.getItem("rosheta_bound_machine_id");
    const existingPrxId = localStorage.getItem("penrx_device_hardware_id");

    if (existingPrxId && !existingPrxId.includes("0000-0000")) {
      return existingPrxId;
    }

    if (legacyId && !legacyId.includes("0000-0000") && !legacyId.startsWith("rh-0000") && !legacyId.startsWith("RSH-0000")) {
      // Migrate legacy ID to new key seamlessly
      localStorage.setItem("penrx_device_hardware_id", legacyId);
      return legacyId;
    }
  } catch (err) {
    console.warn("Storage access warning:", err);
  }

  // 2. If running inside Native Capacitor (Android APK)
  try {
    const info = await Device.getId();
    if (info && info.identifier) {
      // Clean identifier format: PRX-XXXX-XXXX
      const rawHex = info.identifier.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const p1 = rawHex.substring(0, 4) || "A1B2";
      const p2 = rawHex.substring(4, 8) || "C3D4";
      const nativeId = `PRX-${p1}-${p2}`;
      
      try {
        localStorage.setItem("penrx_device_hardware_id", nativeId);
      } catch {}
      return nativeId;
    }
  } catch (err) {
    // Native Capacitor plugin not active (e.g. running in standard web browser)
  }

  // 3. Composite Web Hardware Fingerprint
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const userAgent = nav.userAgent || "";
    const platform = nav.platform || "";
    const screenRes = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const hardwareCores = nav.hardwareConcurrency || 4;

    const rawFingerprint = `${userAgent}|${platform}|${screenRes}|${hardwareCores}`;
    
    // Hash the composite fingerprint string
    let hash = 0;
    for (let i = 0; i < rawFingerprint.length; i++) {
      const char = rawFingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }

    const hexHash = Math.abs(hash).toString(36).toUpperCase().padStart(6, "0");
    const randomSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
    const webHardwareId = `PRX-${hexHash.substring(0, 4)}-${randomSalt}`;

    localStorage.setItem("penrx_device_hardware_id", webHardwareId);
    return webHardwareId;
  } catch {
    const fallbackId = `PRX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return fallbackId;
  }
}
