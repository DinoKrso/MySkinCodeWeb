import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { PRIVACY_POLICY, TERMS_OF_USE } from "./content/legal";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginPage from "./pages/LoginPage";
import DashboardProfilePage from "./pages/dashboard/DashboardProfilePage";
import DashboardSubscriptionPage from "./pages/dashboard/DashboardSubscriptionPage";
import DashboardSupportPage from "./pages/dashboard/DashboardSupportPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/privacy"
            element={<LegalPage document={PRIVACY_POLICY} />}
          />
          <Route path="/terms" element={<LegalPage document={TERMS_OF_USE} />} />
          <Route
            path="/politika-privatnosti"
            element={<Navigate to="/privacy" replace />}
          />
          <Route
            path="/uvjeti-i-odredbe"
            element={<Navigate to="/terms" replace />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profil" replace />} />
            <Route path="profil" element={<DashboardProfilePage />} />
            <Route path="pretplata" element={<DashboardSubscriptionPage />} />
            <Route path="podrska" element={<DashboardSupportPage />} />
          </Route>
          <Route
            path="/profile"
            element={<Navigate to="/dashboard/profil" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
