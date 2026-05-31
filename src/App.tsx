import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { PRIVACY_POLICY, TERMS_OF_USE } from "./content/legal";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
