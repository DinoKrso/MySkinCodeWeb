import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PricingPlansSection from "../components/PricingPlansSection";
import {
  getCheckoutUrl,
  isUsersCurrentPlan,
  normalizePlanId,
  parseBillingInterval,
  type BillingInterval,
  type PricingPlan,
} from "../content/plans";
import {
  DashboardProfileProvider,
  useDashboardProfile,
} from "../context/DashboardProfileContext";
import { formatSubscriptionExpiresAt } from "../lib/profile";
import PageShell from "../layouts/PageShell";
import "./ChoosePlanPage.css";

function ChoosePlanContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useDashboardProfile();
  const subscriptionExpiresLabel = formatSubscriptionExpiresAt(
    profile?.subscriptionExpiresAt,
  );
  const preselected = normalizePlanId(searchParams.get("plan"));
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(() =>
    parseBillingInterval(searchParams.get("billing")),
  );
  const [error, setError] = useState<string | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Odabir paketa | MySkin Code";
  }, []);

  function handleSelect(plan: PricingPlan) {
    if (isUsersCurrentPlan(plan.id, profile)) return;

    setError(null);
    setBusyPlanId(plan.id);

    if (!plan.requiresCheckout) {
      navigate("/account", {
        replace: true,
        state: { message: "Basic paket je aktivan. Koristite mobilnu aplikaciju." },
      });
      return;
    }

    const checkoutUrl = getCheckoutUrl(plan.id, billingInterval);
    if (!checkoutUrl) {
      setError(
        `Link za plaćanje paketa „${plan.name}” (${billingInterval === "yearly" ? "godišnje" : "mjesečno"}) još nije postavljen. Kontaktirajte podršku.`,
      );
      setBusyPlanId(null);
      return;
    }

    window.location.href = checkoutUrl;
  }

  function getCardClassName(plan: PricingPlan) {
    let extra = "";
    if (
      plan.id === preselected &&
      !isUsersCurrentPlan(plan.id, profile)
    ) {
      extra += " pricing-plans-card--highlight";
    }
    if (isUsersCurrentPlan(plan.id, profile)) {
      extra += " pricing-plans-card--current";
    }
    return extra;
  }

  return (
    <PageShell>
      <main className="choose-plan-page">
        <div className="choose-plan-page__inner">
          {error && (
            <p className="ui-error choose-plan-page__error" role="alert">
              {error}
            </p>
          )}

          <PricingPlansSection
            title="Odaberite svoj paket"
            subtitle="Započnite besplatno ili odaberite napredne funkcionalnosti za potpunu AI personalizaciju"
            billingInterval={billingInterval}
            onBillingChange={setBillingInterval}
            getCardClassName={getCardClassName}
            renderCardExtra={(plan) =>
              isUsersCurrentPlan(plan.id, profile) &&
              subscriptionExpiresLabel ? (
                <p className="pricing-plans-card__expires">
                  Vrijedi do: <strong>{subscriptionExpiresLabel}</strong>
                </p>
              ) : null
            }
            renderCardAction={(plan) => {
              const isCurrent = isUsersCurrentPlan(plan.id, profile);
              const ctaLabel = isCurrent
                ? "Trenutni"
                : plan.requiresCheckout
                  ? "Nastavi na plaćanje"
                  : "Odaberi besplatni paket";

              return (
                <button
                  type="button"
                  className={`pricing-plans-card__cta${isCurrent ? " pricing-plans-card__cta--current" : ""}`}
                  disabled={isCurrent || busyPlanId === plan.id}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => handleSelect(plan)}
                >
                  {busyPlanId === plan.id ? "Preusmjeravanje..." : ctaLabel}
                </button>
              );
            }}
          />

          <p className="choose-plan-page__footer">
            Već imate pretplatu?{" "}
            <Link to="/account">Pogledajte svoj paket</Link>
            {" · "}
            <Link to="/">Natrag na početnu</Link>
          </p>
        </div>
      </main>
    </PageShell>
  );
}

export default function ChoosePlanPage() {
  return (
    <DashboardProfileProvider>
      <ChoosePlanContent />
    </DashboardProfileProvider>
  );
}
