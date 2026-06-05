import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, loginWithFirebaseToken } from "../lib/auth";
import { getMissingFirebaseEnvKeys, isFirebaseConfigured, signInWithGoogle } from "../lib/firebase";
import PageShell from "../layouts/PageShell";
import "./LoginPage.css";

function GoogleIcon() {
  return (
    <svg
      className="login-page__google-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const billingParam = searchParams.get("billing");
  const defaultReturn = planParam
    ? `/plans?plan=${encodeURIComponent(planParam)}${billingParam ? `&billing=${encodeURIComponent(billingParam)}` : ""}`
    : "/plans";

  const returnTo =
    (location.state as { from?: string } | null)?.from ?? defaultReturn;

  useEffect(() => {
    if (user) {
      navigate(defaultReturn, { replace: true });
    }
  }, [user, navigate, defaultReturn]);

  function finishLogin(token: string, user: { userId: string; email: string; name?: string }) {
    loginSuccess(token, user);
    navigate(returnTo, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token, user } = await login(email.trim(), password);
      finishLogin(token, user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Prijava nije uspjela.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    try {
      const firebaseIdToken = await signInWithGoogle();
      const { token, user } = await loginWithFirebaseToken(firebaseIdToken);
      finishLogin(token, user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google prijava nije uspjela.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  const firebaseReady = isFirebaseConfigured();
  const missingFirebaseKeys = getMissingFirebaseEnvKeys();

  const busy = loading || googleLoading;

  return (
    <PageShell>
      <main className="ui-page">
        <div className="ui-panel">
          <h1 className="ui-panel__title">Prijava</h1>
          <p className="ui-panel__subtitle">
            Unesite e-mail i lozinku ili se prijavite putem Google računa.
          </p>

          {firebaseReady && (
            <>
              <button
                type="button"
                className="ui-btn-google"
                onClick={handleGoogleLogin}
                disabled={busy}
              >
                <GoogleIcon />
                <span>
                  {googleLoading ? "Google prijava..." : "Nastavi s Googleom"}
                </span>
              </button>
              <div className="ui-divider">
                <span>ili</span>
              </div>
            </>
          )}

          <form className="ui-form" onSubmit={handleSubmit}>
            <div className="ui-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={busy}
                placeholder="vaša@email.com"
              />
            </div>

            <div className="ui-field">
              <div className="ui-field__row">
                <label htmlFor="password">Lozinka</label>
                <Link to="/forgot-password" className="ui-link-inline">
                  Zaboravili ste lozinku?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={busy}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="ui-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ui-btn-primary" disabled={busy}>
              {loading ? "Prijava..." : "Prijavi se"}
            </button>
          </form>

          {!firebaseReady && (
            <div className="ui-hint">
              <p>
                <strong>Lambda API je već spojen</strong> (
                <code>/auth/firebase</code>). Ali prije poziva tog API-ja,
                web mora otvoriti Google prozor i dobiti Firebase ID token —
                isto kao mobilna app.
              </p>
              {missingFirebaseKeys.length > 0 && (
                <p className="login-page__hint-keys">
                  U <code>.env</code> dodaj Firebase ključeve istog projekta
                  kao u appu:{" "}
                  {missingFirebaseKeys.map((k) => `VITE_${k}`).join(", ")}
                </p>
              )}
              <p>
                Flow: Google popup (Firebase) → token → tvoj Lambda → JWT.
                Nakon popunjavanja restartaj <code>npm run dev</code>.
              </p>
            </div>
          )}

          <Link to="/" className="ui-link-back">
            ← Natrag na početnu
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
