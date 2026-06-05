import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

type Props = {
  children: ReactNode;
};

export default function AdminProtectedRoute({ children }: Props) {
  const { session } = useAdminAuth();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  }

  return children;
}
