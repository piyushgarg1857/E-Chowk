import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      !firebaseConfig.apiKey.includes("YOUR_")
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!auth && app) {
    auth = getAuth(app);
    auth.useDeviceLanguage();
  }
  return auth;
}

export function setupRecaptcha(
  containerId: string,
  onSolved?: () => void
): RecaptchaVerifier | null {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth || typeof window === "undefined") return null;

  // Clear existing if any
  const existing = (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
  if (existing) {
    try {
      existing.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(currentAuth, containerId, {
    size: "invisible",
    callback: () => {
      onSolved?.();
    },
    "expired-callback": () => {
      console.warn("Recaptcha expired");
    },
  });

  (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
  return verifier;
}

export async function sendFirebaseOtp(
  phone: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    throw new Error("Firebase is not configured yet. Please set VITE_FIREBASE_API_KEY in .env");
  }
  return signInWithPhoneNumber(currentAuth, phone, verifier);
}

export async function confirmFirebaseOtp(
  confirmation: ConfirmationResult,
  code: string
): Promise<UserCredential> {
  return confirmation.confirm(code);
}
