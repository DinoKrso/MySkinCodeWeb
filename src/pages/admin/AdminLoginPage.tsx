import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { isAdminConfigured } from "../../lib/admin-auth";
import PageShell from "../../layouts/PageShell";
import "../LoginPage.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const returnTo =
    (location.state as { from?: string } | null)?.from ?? "/admin/analitika";

  useEffect(() => {
    if (session) {
      navigate(returnTo, { replace: true });
    }
  }, [session, navigate, returnTo]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAdminConfigured()) {
      setError(
        "Admin prijava nije konfigurirana. Postavite VITE_ADMIN_EMAIL i VITE_ADMIN_PASSWORD.",
      );
      return;
    }

    const ok = login(email, password);
    if (!ok) {
      setError("Neispravan e-mail ili lozinka.");
      return;
    }

    navigate(returnTo, { replace: true });
  }

  return (
    <PageShell>
      <main className="ui-page">
        <div className="ui-panel">
          <p className="ui-eyebrow" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            Admin
          </p>
          <h1 className="ui-panel__title">Prijava administratora</h1>
          <p className="ui-panel__subtitle">
            Pristup analitici i upravljanju — samo za ovlaštene korisnike.
          </p>

          <form className="ui-form" onSubmit={handleSubmit}>
            <div className="ui-field">
              <label htmlFor="admin-email">E-mail</label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                placeholder="admin@myskincodeapp.com"
              />
            </div>

            <div className="ui-field">
              <label htmlFor="admin-password">Lozinka</label>
              <input
                id="admin-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="ui-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ui-btn-primary">
              Prijavi se
            </button>
          </form>

          <Link to="/" className="ui-link-back">
            ← Natrag na početnu
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
