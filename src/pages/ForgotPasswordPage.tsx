import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import PageShell from "../layouts/PageShell";
import { requestPasswordReset } from "../lib/password-reset";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const message = await requestPasswordReset(email);
      setSuccessMessage(message);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Slanje uputa za reset lozinke nije uspjelo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <main className="ui-page">
        <div className="ui-panel">
          <h1 className="ui-panel__title">Zaboravljena lozinka</h1>
          <p className="ui-panel__subtitle">
            Unesite e-mail adresu povezanu s vašim računom. Poslat ćemo vam
            link za postavljanje nove lozinke.
          </p>

          {successMessage ? (
            <div className="ui-success" role="status">
              <p>{successMessage}</p>
              <p className="ui-success__hint">
                Provjerite inbox i spam folder. Link vrijedi 1 sat.
              </p>
            </div>
          ) : (
            <form className="ui-form" onSubmit={handleSubmit}>
              <div className="ui-field">
                <label htmlFor="forgot-email">E-mail</label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  placeholder="vaša@email.com"
                />
              </div>

              {error && (
                <p className="ui-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="ui-btn-primary" disabled={loading}>
                {loading ? "Slanje..." : "Pošalji link za reset"}
              </button>
            </form>
          )}

          <Link to="/login" className="ui-link-back">
            ← Natrag na prijavu
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
