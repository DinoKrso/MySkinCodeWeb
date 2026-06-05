import { readEnv } from "./env";

const ADMIN_SESSION_KEY = "myskincode_admin_session";

export type AdminSession = {
  email: string;
  loggedInAt: string;
};

export function getAdminCredentials(): { email: string; password: string } | null {
  const email = readEnv("ADMIN_EMAIL");
  const password = readEnv("ADMIN_PASSWORD");
  if (!email || !password) return null;
  return { email, password };
}

export function verifyAdminLogin(email: string, password: string): boolean {
  const expected = getAdminCredentials();
  if (!expected) return false;
  return (
    email.trim().toLowerCase() === expected.email.toLowerCase() &&
    password === expected.password
  );
}

export function getAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function saveAdminSession(email: string): void {
  const session: AdminSession = {
    email: email.trim(),
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminConfigured(): boolean {
  return getAdminCredentials() !== null;
}
