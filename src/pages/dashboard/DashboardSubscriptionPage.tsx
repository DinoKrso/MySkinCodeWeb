import { useEffect } from "react";
import { Link } from "react-router-dom";
import { findPlanById, normalizePlanId, PRICING_PLANS } from "../../content/plans";
import { useDashboardProfile } from "../../context/DashboardProfileContext";
import "./dashboard-pages.css";

export default function DashboardSubscriptionPage() {
  const { profile, loading, error } = useDashboardProfile();

  useEffect(() => {
    document.title = "Pretplata | MySkin Code";
  }, []);

  const currentPlanId = normalizePlanId(profile?.subscriptionPlan);
  const currentPlan = findPlanById(currentPlanId);

  return (
    <div>
      <header className="dashboard-view__header">
        <h1 className="dashboard-view__title">Pretplata i paketi</h1>
        <p className="dashboard-view__subtitle">
          Pregled vašeg trenutnog paketa i dostupnih opcija u aplikaciji.
        </p>
      </header>

      {loading && <p className="profile-page__status">Učitavanje...</p>}
      {error && (
        <p className="ui-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="dashboard-view__stack dashboard-view__stack--wide">
          <section className="ui-card">
            <p className="ui-eyebrow">Trenutni paket</p>
            <div className="dashboard-subscription__current">
              {currentPlan ? (
                <>
                  <span className="dashboard-subscription__plan-badge">
                    Aktivno
                  </span>
                  <p className="dashboard-subscription__plan-name">
                    {currentPlan.name}
                  </p>
                  <p className="dashboard-subscription__plan-price">
                    {currentPlan.price}
                    {currentPlan.period ? ` ${currentPlan.period}` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="dashboard-subscription__plan-name">
                    {profile?.subscriptionPlan ?? "Nije odabrano"}
                  </p>
                  <p className="dashboard-subscription__plan-price">
                    Podaci o paketu nisu dostupni.
                  </p>
                </>
              )}
              {profile?.subscriptionExpiresAt && (
                <p className="dashboard-subscription__expires">
                  Istječe: {profile.subscriptionExpiresAt}
                </p>
              )}
            </div>
            <p className="dashboard-subscription__note">
              Za promjenu ili nadogradnju paketa otvorite MySkin Code mobilnu
              aplikaciju. Upravljanje pretplatom dostupno je u postavkama
              aplikacije.
            </p>
          </section>

          <section>
            <h2 className="ui-card__title dashboard-subscription__section-title">
              Dostupni paketi
            </h2>
            <div className="dashboard-subscription__grid">
              {PRICING_PLANS.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                return (
                  <article
                    key={plan.id}
                    className={`dashboard-subscription__plan-card${isCurrent ? " dashboard-subscription__plan-card--current" : ""}`}
                  >
                    {isCurrent && (
                      <span className="dashboard-subscription__plan-badge">
                        Vaš paket
                      </span>
                    )}
                    <h3>{plan.name}</h3>
                    <p>
                      {plan.price}
                      {plan.period ? ` ${plan.period}` : ""} — {plan.description}
                    </p>
                    <ul>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          <p className="dashboard-subscription__note">
            Želite usporediti detalje? Pogledajte{" "}
            <Link to="/#pricing">cijene na početnoj stranici</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
