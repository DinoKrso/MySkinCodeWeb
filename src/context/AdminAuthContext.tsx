import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAdminSession,
  getAdminSession,
  saveAdminSession,
  verifyAdminLogin,
  type AdminSession,
} from "../lib/admin-auth";

type AdminAuthContextValue = {
  session: AdminSession | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() =>
    getAdminSession(),
  );

  const login = useCallback((email: string, password: string) => {
    if (!verifyAdminLogin(email, password)) {
      return false;
    }
    saveAdminSession(email);
    const next = getAdminSession();
    setSession(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, login, logout }),
    [session, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
