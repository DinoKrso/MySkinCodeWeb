import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import "./LandingHeader.css";

const NAV_LINKS = [
  { label: "Kako radi", to: "/#how-it-works", hash: "#how-it-works" },
  { label: "Mogućnosti", to: "/#features", hash: "#features" },
  { label: "Paketi", to: "/#pricing", hash: "#pricing" },
  { label: "Support", to: "/faq", match: "/faq" },
] as const;

function LandingNavLink({
  to,
  hash,
  match,
  children,
}: {
  to: string;
  hash?: string;
  match?: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const isActive = match ? pathname === match : false;

  if (hash && pathname === "/") {
    return (
      <a href={hash} className={isActive ? "landing-header__nav-link--active" : undefined}>
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={isActive ? "landing-header__nav-link--active" : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default function LandingHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="landing-header">
      <div className="landing-header__inner-wrap landing-header__inner">
        <Link to="/" className="landing-header__logo">
          <BrandLogo />
        </Link>

        <nav className="landing-header__nav" aria-label="Glavna navigacija">
          {NAV_LINKS.map((link) => (
            <LandingNavLink
              key={link.to}
              to={link.to}
              hash={"hash" in link ? link.hash : undefined}
              match={"match" in link ? link.match : undefined}
            >
              {link.label}
            </LandingNavLink>
          ))}
        </nav>

        <div className="landing-header__actions">
          {user ? (
            <Link to="/account" className="landing-header__login">
              Moj paket
            </Link>
          ) : (
            <Link
              to="/login"
              className={`landing-header__login${pathname === "/login" ? " landing-header__login--active" : ""}`}
              aria-current={pathname === "/login" ? "page" : undefined}
            >
              Login
            </Link>
          )}
          <Link
            to="/download"
            className={`landing-header__cta${pathname === "/download" ? " landing-header__cta--active" : ""}`}
            aria-current={pathname === "/download" ? "page" : undefined}
          >
            Download
          </Link>
        </div>
      </div>
    </header>
  );
}
