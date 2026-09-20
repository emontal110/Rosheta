/**
 * Biometric Authentication Utility (WebAuthn / Fingerprint / Face ID)
 * Supports Touch ID, Face ID, and Android Fingerprint sensors natively in PWA browsers.
 */

const BIOMETRIC_KEY_STORAGE = "rosheta_biometric_credential";
const BIOMETRIC_ENABLED_KEY = "rosheta_biometric_enabled";

/**
 * Checks if Biometric authentication (Fingerprint / Face ID) is supported on this device.
 */
export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Checks if Biometric Login is currently enabled by the doctor.
 */
export function isBiometricEnabled(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
}

/**
 * Toggles Biometric Login setting.
 */
export function setBiometricEnabled(enabled: boolean): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
}

/**
 * Registers doctor's fingerprint / Face ID credential on the device using WebAuthn API.
 */
export async function registerBiometricCredential(doctorName: string = "Doctor"): Promise<{ success: boolean; error?: string }> {
  try {
    const supported = await isBiometricSupported();
    if (!supported) {
      return { success: false, error: "جهازك أو المتصفح لا يدعم مستشعر البصمة أو Face ID" };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Rosheta Medical App",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: doctorName,
        displayName: doctorName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Native Fingerprint / Face ID
        userVerification: "required",
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (credential) {
      localStorage.setItem(BIOMETRIC_KEY_STORAGE, credential.id);
      setBiometricEnabled(true);
      return { success: true };
    }
    return { success: false, error: "لم يتم التعرف على البصمة" };
  } catch (err: any) {
    console.warn("Biometric registration error:", err);
    return { success: false, error: err?.message || "تم إلغاء عملية قراءة البصمة" };
  }
}

/**
 * Authenticates doctor using fingerprint / Face ID.
 */
export async function authenticateWithBiometric(): Promise<{ success: boolean; error?: string }> {
  try {
    const supported = await isBiometricSupported();
    if (!supported) {
      return { success: false, error: "بصمة الاصبع غير مدعومة على هذا الجهاز" };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (assertion) {
      return { success: true };
    }
    return { success: false, error: "فشلت مطابقة البصمة" };
  } catch (err: any) {
    console.warn("Biometric authentication error:", err);
    return { success: false, error: err?.message || "تم إلغاء التحقق بالبصمة" };
  }
}
