import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AuthProvider } from "./context/AuthContext";
import { PRIVACY_POLICY, TERMS_OF_USE } from "./content/legal";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginPage from "./pages/LoginPage";
import AppAuthHandoffPage from "./pages/AppAuthHandoffPage";
import AccountPage from "./pages/AccountPage";
import ChoosePlanPage from "./pages/ChoosePlanPage";
import FaqPage from "./pages/FaqPage";
import DownloadPage from "./pages/DownloadPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/privacy"
                element={<LegalPage document={PRIVACY_POLICY} />}
              />
              <Route path="/terms" element={<LegalPage document={TERMS_OF_USE} />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route
                path="/politika-privatnosti"
                element={<Navigate to="/privacy" replace />}
              />
              <Route
                path="/uvjeti-i-odredbe"
                element={<Navigate to="/terms" replace />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/app" element={<AppAuthHandoffPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route
                path="/plans"
                element={
                  <ProtectedRoute>
                    <ChoosePlanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <DashboardLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="analitika" replace />} />
              <Route path="analitika" element={<AdminAnalyticsPage />} />
              <Route path="proizvodi" element={<AdminProductsPage />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />
            <Route path="/profile" element={<Navigate to="/account" replace />} />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
