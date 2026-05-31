import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";
import { readEnv } from "./env";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

function loadFirebaseConfig(): FirebaseWebConfig | null {
  const jsonConfig =
    readEnv("FIREBASE_CONFIG") ??
    import.meta.env.VITE_FIREBASE_CONFIG ??
    import.meta.env.EXPO_PUBLIC_FIREBASE_CONFIG;

  if (jsonConfig) {
    try {
      const parsed = JSON.parse(jsonConfig) as FirebaseWebConfig;
      if (parsed.apiKey && parsed.authDomain && parsed.projectId && parsed.appId) {
        return parsed;
      }
    } catch {
      // fall through to individual vars
    }
  }

  const apiKey = readEnv("FIREBASE_API_KEY");
  const authDomain = readEnv("FIREBASE_AUTH_DOMAIN");
  const projectId = readEnv("FIREBASE_PROJECT_ID");
  const appId = readEnv("FIREBASE_APP_ID");

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: readEnv("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("FIREBASE_MESSAGING_SENDER_ID"),
    appId,
  };
}

const firebaseConfig = loadFirebaseConfig();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return firebaseConfig !== null;
}

export function getMissingFirebaseEnvKeys(): string[] {
  if (isFirebaseConfigured()) return [];

  const required = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_APP_ID",
  ] as const;

  return required.filter((key) => !readEnv(key));
}

export function getFirebaseAuth(): Auth {
  if (!firebaseConfig) {
    throw new Error("Firebase nije konfiguriran. Provjerite .env datoteku.");
  }
  if (!app) app = initializeApp(firebaseConfig as FirebaseOptions);
  if (!auth) auth = getAuth(app);
  return auth;
}

export async function signInWithGoogle(): Promise<string> {
  const firebaseAuth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(firebaseAuth, provider);
  return credential.user.getIdToken();
}
