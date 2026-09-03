/**
 * WebAuthn (Web Authentication API) Platform Biometric Integration
 * 
 * Invokes real device/browser platform authenticators:
 * - Touch ID / Face ID on Apple macOS & iOS
 * - Windows Hello on Windows
 * - Fingerprint / Biometric screen lock on Android
 * 
 * NEVER stores raw biometric templates, images, or sensor data.
 * Only handles public-key WebAuthn credentials managed by the OS.
 */

const CREDENTIAL_STORAGE_PREFIX = 'safefinance_webauthn_credential_id:';

function credentialStorageKey(userName = 'user') {
  return `${CREDENTIAL_STORAGE_PREFIX}${userName.trim().toLowerCase()}`;
}

export interface BiometricCheckResult {
  isSupported: boolean;
  isPlatformAvailable: boolean;
  isRegistered: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  credentialId?: string;
}

// Convert ArrayBuffer to URL-safe base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Convert URL-safe base64 string back to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

/**
 * Check if WebAuthn and platform authenticators (Face ID / Touch ID / Fingerprint) are available
 */
export async function checkBiometricSupport(userName = 'user'): Promise<BiometricCheckResult> {
  const isSupported = typeof window !== 'undefined' && 
    !!window.PublicKeyCredential && 
    !!navigator.credentials;

  let isPlatformAvailable = false;
  if (isSupported && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
    try {
      isPlatformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      isPlatformAvailable = false;
    }
  }

  const isRegistered = typeof window !== 'undefined' &&
    !!localStorage.getItem(credentialStorageKey(userName));

  return {
    isSupported,
    isPlatformAvailable,
    isRegistered
  };
}

/**
 * Register a device passkey / platform biometric authenticator
 * Triggers the real OS Face ID / Touch ID / Android biometric enrollment prompt
 */
export async function registerBiometrics(userName = 'user@safefinance.local'): Promise<BiometricAuthResult> {
  if (typeof window === 'undefined' || !navigator.credentials || !window.PublicKeyCredential) {
    return {
      success: false,
      error: 'This device/browser does not support biometric authentication.'
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'SafeFinance Payment Approval',
          id: window.location.hostname || 'localhost'
        },
        user: {
          id: userId,
          name: userName,
          displayName: 'SafeFinance payment approval'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256 (standard WebAuthn)
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Requires device hardware: Touch ID, Face ID, Windows Hello
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    }) as PublicKeyCredential | null;

    if (!credential) {
      return {
        success: false,
        error: 'Authentication failed. Payment was not completed.'
      };
    }

    const credIdBase64 = bufferToBase64(credential.rawId);
    localStorage.setItem(credentialStorageKey(userName), credIdBase64);

    return {
      success: true,
      credentialId: credIdBase64
    };
  } catch (err: any) {
    console.warn('WebAuthn Registration Error:', err);
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
      return {
        success: false,
        cancelled: true,
        error: 'Authentication cancelled. Payment was not completed.'
      };
    }
    return {
      success: false,
      error: err.message || 'Authentication failed. Payment was not completed.'
    };
  }
}

/**
 * Authenticate a payment using real platform biometrics (Touch ID / Face ID / Fingerprint)
 * Triggers the real OS biometric prompt.
 */
export async function authenticateWithBiometrics(userName = 'user'): Promise<BiometricAuthResult> {
  if (typeof window === 'undefined' || !navigator.credentials || !window.PublicKeyCredential) {
    return {
      success: false,
      error: 'This device/browser does not support biometric authentication.'
    };
  }

  const storedCredId = localStorage.getItem(credentialStorageKey(userName));

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // If a credential was previously registered, supply it in allowCredentials
    const allowCredentials: PublicKeyCredentialDescriptor[] = [];
    if (storedCredId) {
      try {
        allowCredentials.push({
          id: base64ToBuffer(storedCredId),
          type: 'public-key'
        });
      } catch {
        // if invalid format, allow any platform authenticator
      }
    }

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname || 'localhost',
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        userVerification: 'required',
        timeout: 60000
      }
    }) as PublicKeyCredential | null;

    if (!assertion) {
      return {
        success: false,
        error: 'Authentication failed. Payment was not completed.'
      };
    }

    return {
      success: true,
      credentialId: assertion.id
    };
  } catch (err: any) {
    console.warn('WebAuthn Authentication Error:', err);
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
      return {
        success: false,
        cancelled: true,
        error: 'Authentication cancelled. Payment was not completed.'
      };
    }
    return {
      success: false,
      error: err.message || 'Authentication failed. Payment was not completed.'
    };
  }
}

/**
 * Clear stored WebAuthn credential (for testing reset)
 */
export function resetStoredBiometricCredential(userName?: string) {
  if (typeof window !== 'undefined') {
    if (userName) {
      localStorage.removeItem(credentialStorageKey(userName));
      return;
    }

    Object.keys(localStorage)
      .filter((key) => key.startsWith(CREDENTIAL_STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  }
}
