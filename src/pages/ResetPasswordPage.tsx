import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageShell from "../layouts/PageShell";
import {
  submitNewPassword,
  validateResetToken,
} from "../lib/password-reset";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [email, setEmail] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidationError("Link za reset nije ispravan.");
      setValidating(false);
      return;
    }

    let cancelled = false;

    validateResetToken(token)
      .then(({ email: verifiedEmail }) => {
        if (!cancelled) {
          setEmail(verifiedEmail);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setValidationError(
            err instanceof Error
              ? err.message
              : "Link je nevažeći ili je istekao.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setValidating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 8) {
      setSubmitError("Lozinka mora imati najmanje 8 znakova.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Lozinke se ne podudaraju.");
      return;
    }

    setLoading(true);

    try {
      const message = await submitNewPassword(token, password);
      setSuccessMessage(message);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Promjena lozinke nije uspjela.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <main className="ui-page">
        <div className="ui-panel">
          <h1 className="ui-panel__title">Nova lozinka</h1>

          {validating && (
            <p className="ui-panel__subtitle">Provjera linka...</p>
          )}

          {!validating && validationError && (
            <>
              <p className="ui-error" role="alert">
                {validationError}
              </p>
              <Link to="/forgot-password" className="ui-link-back">
                Zatraži novi link
              </Link>
            </>
          )}

          {!validating && !validationError && successMessage && (
            <>
              <div className="ui-success" role="status">
                <p>{successMessage}</p>
              </div>
              <button
                type="button"
                className="ui-btn-primary"
                onClick={() => navigate("/login", { replace: true })}
              >
                Idi na prijavu
              </button>
            </>
          )}

          {!validating && !validationError && !successMessage && email && (
            <>
              <p className="ui-panel__subtitle">
                Postavite novu lozinku za račun{" "}
                <strong>{email}</strong>
              </p>

              <form className="ui-form" onSubmit={handleSubmit}>
                <div className="ui-field">
                  <label htmlFor="new-password">Nova lozinka</label>
                  <input
                    id="new-password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    placeholder="Najmanje 8 znakova"
                  />
                </div>

                <div className="ui-field">
                  <label htmlFor="confirm-password">Potvrdi lozinku</label>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    placeholder="Ponovite lozinku"
                  />
                </div>

                {submitError && (
                  <p className="ui-error" role="alert">
                    {submitError}
                  </p>
                )}

                <button type="submit" className="ui-btn-primary" disabled={loading}>
                  {loading ? "Spremanje..." : "Spremi novu lozinku"}
                </button>
              </form>
            </>
          )}

          {!validating && !validationError && !successMessage && (
            <Link to="/login" className="ui-link-back">
              ← Natrag na prijavu
            </Link>
          )}
        </div>
      </main>
    </PageShell>
  );
}
