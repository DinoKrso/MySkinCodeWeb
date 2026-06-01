import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getDisplayName, useAuth } from "../context/AuthContext";
import { DashboardProfileProvider } from "../context/DashboardProfileContext";
import "./DashboardLayout.css";

const NAV_ITEMS = [
  {
    to: "/dashboard/profil",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/dashboard/pretplata",
    label: "Pretplata i paketi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="6"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M3 10h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/dashboard/podrska",
    label: "Podrška",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 4h16a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function DashboardShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const displayName = user ? getDisplayName(user) : "Korisnik";

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="dashboard-layout">
      <button
        type="button"
        className={`dashboard-layout__backdrop${navOpen ? " dashboard-layout__backdrop--visible" : ""}`}
        aria-label="Zatvori navigaciju"
        onClick={closeNav}
      />

      <aside
        className={`dashboard-layout__sidebar${navOpen ? " dashboard-layout__sidebar--open" : ""}`}
        aria-label="Dashboard navigacija"
      >
        <div className="dashboard-layout__sidebar-header">
          <Link to="/dashboard" className="dashboard-layout__logo" onClick={closeNav}>
            MySkin <span>Code</span>
          </Link>
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
            ← Početna stranica
          </Link>
          <div className="dashboard-layout__user">
            <div className="dashboard-layout__user-avatar" aria-hidden="true">
              {getInitials(displayName)}
            </div>
            <div className="dashboard-layout__user-info">
              <span className="dashboard-layout__user-name">{displayName}</span>
              <span className="dashboard-layout__user-email">{user?.email}</span>
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
          <span className="dashboard-layout__topbar-title">Dashboard</span>
        </header>

        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardProfileProvider>
      <DashboardShell />
    </DashboardProfileProvider>
  );
}
