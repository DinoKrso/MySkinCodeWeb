import { useCallback, useEffect, useMemo, useState } from "react";
import UsersCountChart from "../../components/admin/UsersCountChart";
import {
  appendUsersCountHistory,
  CHART_HISTORY_DAYS,
  fetchProductsCount,
  fetchRegisteredUsersCount,
  getUsersCountChartSeries,
  loadUsersCountHistory,
  type ProductsCountSnapshot,
  type UsersCountHistoryPoint,
  type UsersCountSnapshot,
} from "../../lib/admin-analytics";
import "../dashboard/dashboard-pages.css";
import "./AdminAnalyticsPage.css";

const AUTO_REFRESH_MS = 5 * 60 * 1000;

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}

export default function AdminAnalyticsPage() {
  const [usersSnapshot, setUsersSnapshot] = useState<UsersCountSnapshot | null>(
    null,
  );
  const [productsSnapshot, setProductsSnapshot] =
    useState<ProductsCountSnapshot | null>(null);
  const [history, setHistory] = useState<UsersCountHistoryPoint[]>(() =>
    loadUsersCountHistory(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [usersData, productsData] = await Promise.all([
        fetchRegisteredUsersCount(),
        fetchProductsCount(),
      ]);
      setUsersSnapshot(usersData);
      setProductsSnapshot(productsData);
      setHistory(appendUsersCountHistory(usersData.count));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Učitavanje nije uspjelo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Analitika | MySkin Code Admin";
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const previous =
    history.length >= 2 ? history[history.length - 2].count : null;
  const delta =
    usersSnapshot && previous !== null
      ? usersSnapshot.count - previous
      : null;

  const chartSeries = useMemo(
    () =>
      getUsersCountChartSeries(
        history,
        usersSnapshot?.count ?? 0,
        CHART_HISTORY_DAYS,
      ),
    [history, usersSnapshot?.count],
  );

  return (
    <div className="admin-analytics">
      <header className="dashboard-view__header admin-analytics__header">
        <h1 className="dashboard-view__title">Analitika</h1>
        <p className="dashboard-view__subtitle">
          Korisnici i proizvodi u DynamoDB (live API).
        </p>
      </header>

      <div className="admin-analytics__toolbar">
        {usersSnapshot && (
          <p className="admin-analytics__updated">
            Zadnje osvježeno: {formatUpdatedAt(usersSnapshot.fetchedAt)}
          </p>
        )}
        <button
          type="button"
          className="ui-btn-secondary"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Učitavanje..." : "Osvježi"}
        </button>
      </div>

      {error && (
        <p className="ui-error" role="alert">
          {error}
        </p>
      )}

      <div className="dashboard-view__stack admin-analytics__grid">
        <section className="ui-card admin-analytics__counter-card">
          <p className="ui-eyebrow">Registrirani korisnici</p>
          {loading && !usersSnapshot ? (
            <p className="admin-analytics__loading">
              <span className="admin-analytics__pulse" aria-hidden="true" />
              Učitavanje...
            </p>
          ) : (
            <>
              <p
                className="admin-analytics__counter-value"
                aria-live="polite"
              >
                {usersSnapshot?.count.toLocaleString("hr-HR") ?? "—"}
              </p>
              <p className="admin-analytics__counter-meta">
                {usersSnapshot?.table
                  ? `Tablica ${usersSnapshot.table}`
                  : "Ukupan broj zapisa u bazi"}
              </p>
              {delta !== null && delta !== 0 && (
                <p
                  className={`admin-analytics__counter-delta${delta > 0 ? " admin-analytics__counter-delta--up" : ""}`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} od zadnjeg mjerenja u pregledniku
                </p>
              )}
            </>
          )}
        </section>

        <section className="ui-card admin-analytics__counter-card">
          <p className="ui-eyebrow">Proizvodi u bazi</p>
          {loading && !productsSnapshot ? (
            <p className="admin-analytics__loading">
              <span className="admin-analytics__pulse" aria-hidden="true" />
              Učitavanje...
            </p>
          ) : (
            <>
              <p
                className="admin-analytics__counter-value"
                aria-live="polite"
              >
                {productsSnapshot?.count.toLocaleString("hr-HR") ?? "—"}
              </p>
              <p className="admin-analytics__counter-meta">
                {productsSnapshot?.table
                  ? `Tablica ${productsSnapshot.table}`
                  : "Proizvodi (META zapisi)"}
              </p>
            </>
          )}
        </section>

        <section className="ui-card admin-analytics__chart-card">
          <div className="admin-analytics__chart-head">
            <div>
              <p className="ui-eyebrow">Trend</p>
              <h2 className="ui-card__title">
                Registracije — zadnjih {CHART_HISTORY_DAYS} dana
              </h2>
            </div>
            <p className="admin-analytics__chart-note">
              Prikaz po danu; svako osvježavanje u ovom pregledniku ažurira
              današnju točku. Stariji zapisi stariji od {CHART_HISTORY_DAYS}{" "}
              dana se ne prikazuju.
            </p>
          </div>

          {usersSnapshot && (
            <UsersCountChart
              points={chartSeries}
              currentCount={usersSnapshot.count}
              days={CHART_HISTORY_DAYS}
            />
          )}
        </section>
      </div>
    </div>
  );
}
