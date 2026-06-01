import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getStoredToken } from "../lib/auth";
import {
  fetchUserProfile,
  mergeProfileWithAuthUser,
  type UserProfile,
} from "../lib/profile";
import { useAuth } from "./AuthContext";

type DashboardProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
};

const DashboardProfileContext =
  createContext<DashboardProfileContextValue | null>(null);

export function DashboardProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !user) {
      setProfile(null);
      setLoading(false);
      setError("Sesija nije valjana.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile(token, user.userId);
      setProfile(mergeProfileWithAuthUser(data, user));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dohvat profila nije uspio.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ profile, loading, error, refresh, setProfile }),
    [profile, loading, error, refresh],
  );

  return (
    <DashboardProfileContext.Provider value={value}>
      {children}
    </DashboardProfileContext.Provider>
  );
}

export function useDashboardProfile() {
  const ctx = useContext(DashboardProfileContext);
  if (!ctx) {
    throw new Error("useDashboardProfile must be used within DashboardProfileProvider");
  }
  return ctx;
}
