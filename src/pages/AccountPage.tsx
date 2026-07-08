import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  findPlanById,
  isSubscriptionActive,
  normalizePlanId,
} from "../content/plans";
import { useAuth } from "../context/AuthContext";
import { DashboardProfileProvider, useDashboardProfile } from "../context/DashboardProfileContext";
import { formatSubscriptionExpiresAt } from "../lib/profile";
import DeleteAccountSection from "../components/DeleteAccountSection";
import PageShell from "../layouts/PageShell";
import "./AccountPage.css";

function AccountContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profile, loading, error } = useDashboardProfile();

  const flashMessage = (location.state as { message?: string } | null)?.message;
  const currentPlanId = normalizePlanId(profile?.subscriptionPlan);
  const currentPlan = findPlanById(currentPlanId);
  const subscriptionActive = isSubscriptionActive(profile);
  const subscriptionExpiresLabel = formatSubscriptionExpiresAt(
    profile?.subscriptionExpiresAt,
  );

  useEffect(() => {
    document.title = "Moj paket | MySkin Code";
  }, []);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <PageShell>
      <main className="account-page">
        <div className="account-page__panel ui-panel">
          <h1 className="ui-panel__title">Moj paket</h1>
          <p className="ui-panel__subtitle">
            {user?.email}
          </p>

          {flashMessage && (
            <p className="account-page__flash" role="status">
              {flashMessage}
            </p>
          )}

          {loading && (
            <p className="account-page__status">Učitavanje...</p>
          )}

          {error && (
            <p className="ui-error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="account-page__plan">
              <p className="ui-eyebrow">Trenutni paket</p>
              {currentPlan && subscriptionActive ? (
                <>
                  <p className="account-page__plan-name">{currentPlan.name}</p>
                  <p className="account-page__plan-price">
                    {currentPlan.price}
                    {currentPlan.period ? ` ${currentPlan.period}` : ""}
                  </p>
                  {subscriptionExpiresLabel ? (
                    <p className="account-page__expires">
                      Vrijedi do:{" "}
                      <strong>{subscriptionExpiresLabel}</strong>
                    </p>
                  ) : currentPlan.requiresCheckout ? (
                    <p className="account-page__plan-hint">
                      Datum isteka pretplate nije dostupan u profilu.
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="account-page__plan-name">
                    {profile?.subscriptionPlan?.trim() || "Nije odabrano"}
                  </p>
                  <p className="account-page__plan-hint">
                    {profile?.subscriptionPlan?.trim()
                      ? "Pretplata nije aktivna ili je istekla."
                      : "Još nemate aktivnu pretplatu."}
                  </p>
                  {subscriptionExpiresLabel && (
                    <p className="account-page__expires account-page__expires--inactive">
                      Zadnji zabilježeni istek: {subscriptionExpiresLabel}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="account-page__actions">
            <Link to="/plans" className="ui-btn-primary account-page__btn">
              Promijeni paket
            </Link>
            <button
              type="button"
              className="account-page__btn account-page__btn--logout"
              onClick={handleLogout}
            >
              Odjava
            </button>
          </div>

          <DeleteAccountSection />

          <Link to="/" className="ui-link-back">
            ← Natrag na početnu
          </Link>
        </div>
      </main>
    </PageShell>
  );
}

export default function AccountPage() {
  return (
    <DashboardProfileProvider>
      <AccountContent />
    </DashboardProfileProvider>
  );
}
