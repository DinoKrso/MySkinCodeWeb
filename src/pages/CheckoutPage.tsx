import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PaymentLogos from "../components/PaymentLogos";
import { MERCHANT } from "../content/merchant";
import {
  findPlanById,
  getPlanPriceDisplay,
  isUsersCurrentPlan,
  normalizePlanId,
  parseBillingInterval,
} from "../content/plans";
import { useAuth } from "../context/AuthContext";
import {
  DashboardProfileProvider,
  useDashboardProfile,
} from "../context/DashboardProfileContext";
import { createMonriSession, submitMonriForm } from "../lib/monri";
import { getStoredToken } from "../lib/auth";
import PageShell from "../layouts/PageShell";
import "./CheckoutPage.css";

function CheckoutContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useDashboardProfile();
  const plan = findPlanById(normalizePlanId(searchParams.get("plan")));
  const billingInterval = parseBillingInterval(searchParams.get("billing"));
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Potvrda narudžbe | MySkin Code";
  }, []);

  useEffect(() => {
    if (!plan || !plan.requiresCheckout) {
      navigate("/plans", { replace: true });
    }
  }, [plan, navigate]);

  if (!plan || !plan.requiresCheckout) return null;

  const display = getPlanPriceDisplay(plan, billingInterval);
  const periodLabel =
    billingInterval === "yearly" ? "Godišnja pretplata" : "Mjesečna pretplata";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan || !user) return;
    if (isUsersCurrentPlan(plan.id, profile)) return;

    if (!accepted) {
      setError("Potvrdite da prihvaćate uvjete prodaje i uvjete korištenja.");
      return;
    }

    const token = getStoredToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const session = await createMonriSession({
        token,
        userId: user.userId,
        planId: plan.id,
        billingInterval,
        email: user.email,
        name: user.name,
      });
      submitMonriForm(session.action, session.fields);
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof Error
          ? err.message
          : "Priprema plaćanja nije uspjela.",
      );
    }
  }

  return (
    <PageShell>
      <main className="checkout-page">
        <form className="checkout-page__panel ui-panel" onSubmit={handleSubmit}>
          <p className="ui-eyebrow">Potvrda narudžbe</p>
          <h1 className="ui-panel__title">Pregled plaćanja</h1>
          <p className="ui-panel__subtitle">
            Digitalna pretplata se aktivira odmah nakon uspješne naplate. Nema
            fizičke dostave.
          </p>

          <dl className="checkout-page__summary">
            <div>
              <dt>Usluga</dt>
              <dd>MySkin Code — paket {plan.name}</dd>
            </div>
            <div>
              <dt>Razdoblje</dt>
              <dd>{periodLabel}</dd>
            </div>
            <div>
              <dt>Cijena (uključuje PDV ako je primjenjivo)</dt>
              <dd>
                {display.price}
                {display.period ? ` ${display.period}` : ""}
              </dd>
            </div>
            {display.compareSavings ? (
              <div>
                <dt>Ušteda u odnosu na 12 mjeseci</dt>
                <dd>{display.compareSavings}</dd>
              </div>
            ) : null}
            <div>
              <dt>Dostava</dt>
              <dd>0,00 KM — elektronička isporuka</dd>
            </div>
            <div className="checkout-page__total">
              <dt>Ukupno za naplatu</dt>
              <dd>
                {display.price} {display.period ? display.period : ""}
              </dd>
            </div>
          </dl>

          <p className="checkout-page__pay-hint">
            Plaćanje karticom Visa, Mastercard® ili Maestro® putem Monri
            WebPay. Podatke kartice unesite na sljedećoj, sigurnoj stranici.
          </p>

          <label className="checkout-page__accept">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>
              Prihvaćam{" "}
              <Link to="/terms-of-sale" target="_blank">
                uvjete prodaje
              </Link>
              ,{" "}
              <Link to="/terms" target="_blank">
                uvjete korištenja
              </Link>{" "}
              i{" "}
              <Link to="/refund" target="_blank">
                pravila povrata
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="ui-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ui-btn-primary checkout-page__pay"
            disabled={busy || isUsersCurrentPlan(plan.id, profile)}
          >
            {busy ? "Preusmjeravanje..." : "Nastavi na sigurno plaćanje"}
          </button>

          <PaymentLogos />

          <p className="checkout-page__legal-links">
            <Link to="/payment-security">Sigurnost plaćanja</Link>
            {" · "}
            <Link to="/privacy">Privatnost</Link>
            {" · "}
            <a href={`mailto:${MERCHANT.email}`}>{MERCHANT.email}</a>
          </p>

          <Link to="/plans" className="ui-link-back">
            ← Natrag na pakete
          </Link>
        </form>
      </main>
    </PageShell>
  );
}

export default function CheckoutPage() {
  return (
    <DashboardProfileProvider>
      <CheckoutContent />
    </DashboardProfileProvider>
  );
}
