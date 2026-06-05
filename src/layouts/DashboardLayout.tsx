import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./DashboardLayout.css";
import "../styles/admin-dashboard.css";

const NAV_ITEMS = [
  {
    to: "/admin/proizvodi",
    label: "Proizvodi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 8h12l-1 10H7L6 8zM9 8V6a3 3 0 016 0v2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/admin/analitika",
    label: "Analitika",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20V10M10 20V4M16 20v-6M22 20V8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const [navOpen, setNavOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="dashboard-layout dashboard-layout--admin">
      <button
        type="button"
        className={`dashboard-layout__backdrop${navOpen ? " dashboard-layout__backdrop--visible" : ""}`}
        aria-label="Zatvori navigaciju"
        onClick={closeNav}
      />

      <aside
        className={`dashboard-layout__sidebar${navOpen ? " dashboard-layout__sidebar--open" : ""}`}
        aria-label="Admin navigacija"
      >
        <div className="dashboard-layout__sidebar-header">
          <Link to="/admin/analitika" className="dashboard-layout__logo" onClick={closeNav}>
            MySkin <span>Code</span>
          </Link>
          <span className="dashboard-layout__admin-badge">Admin</span>
          <button
            type="button"
            className="dashboard-layout__close-nav"
            aria-label="Zatvori izbornik"
            onClick={closeNav}
          >
            ✕
          </button>
        </div>

        <nav className="dashboard-layout__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `dashboard-layout__nav-link${isActive ? " dashboard-layout__nav-link--active" : ""}`
              }
              onClick={closeNav}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-layout__sidebar-footer">
          <Link to="/" className="dashboard-layout__home-link" onClick={closeNav}>
            ← Javna stranica
          </Link>
          <div className="dashboard-layout__user">
            <div className="dashboard-layout__user-info">
              <span className="dashboard-layout__user-name">Administrator</span>
              <span className="dashboard-layout__user-email">{session?.email}</span>
            </div>
          </div>
          <button type="button" className="dashboard-layout__logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Odjava
          </button>
        </div>
      </aside>

      <div className="dashboard-layout__main">
        <header className="dashboard-layout__topbar">
          <button
            type="button"
            className="dashboard-layout__menu-btn"
            aria-label="Otvori izbornik"
            onClick={() => setNavOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="dashboard-layout__topbar-title">Admin</span>
        </header>

        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
