import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseAppHandoffSearchParams } from "../lib/app-handoff";
import PageShell from "../layouts/PageShell";
import "./AppAuthHandoffPage.css";

export default function AppAuthHandoffPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginSuccess } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    document.title = "Prijava | MySkin Code";
  }, []);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const result = parseAppHandoffSearchParams(searchParams);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    loginSuccess(result.data.token, result.data.user);
    navigate(result.data.redirect, { replace: true });
  }, [searchParams, loginSuccess, navigate]);

  if (error) {
    const loginRedirect = searchParams.get("redirect")?.trim();
    const loginTo = loginRedirect
      ? `/login?${new URLSearchParams({ redirect: loginRedirect }).toString()}`
      : "/login";

    return (
      <PageShell>
        <main className="ui-page">
          <div className="ui-panel app-handoff">
            <h1 className="ui-panel__title">Prijava nije uspjela</h1>
            <p className="ui-panel__subtitle">
              Poveznica iz aplikacije nije valjana ili je istekla.
            </p>
            <p className="ui-error" role="alert">
              {error}
            </p>
            <Link to={loginTo} className="ui-btn-primary app-handoff__btn">
              Prijavi se ručno
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="ui-page">
        <div className="ui-panel app-handoff">
          <p className="app-handoff__status" role="status">
            Prijava u tijeku...
          </p>
        </div>
      </main>
    </PageShell>
  );
}
