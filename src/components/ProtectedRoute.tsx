import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getStoredToken } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const token = getStoredToken();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
