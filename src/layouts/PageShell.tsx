import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getDisplayName, useAuth } from "../context/AuthContext";
import "./PageShell.css";

type Props = {
  children: ReactNode;
};

export default function PageShell({ children }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const showNavAuth = pathname !== "/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="page-shell">
      <header className="page-shell__nav">
        <div className="page-shell__nav-inner">
          <Link to="/" className="page-shell__logo">
            MySkin <span>Code</span>
          </Link>
          {showNavAuth && (
            <div className="page-shell__nav-auth">
              {user && (
                <div className="page-shell__user-menu" ref={menuRef}>
                  <button
                    type="button"
                    className="page-shell__user-trigger"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="page-shell__user-name">
                      {getDisplayName(user)}
                    </span>
                    <svg
                      className={`page-shell__user-chevron${menuOpen ? " page-shell__user-chevron--open" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="page-shell__user-dropdown" role="menu">
                    <Link
                      to="/dashboard/profil"
                      className="page-shell__menu-link"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profil
                      </Link>
                      <button
                        type="button"
                        className="page-shell__logout-btn"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Odjava
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!user && (
                <Link to="/login" className="page-shell__login-btn">
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {children}

      <footer className="page-shell__footer">
        <p>© {new Date().getFullYear()} MySkin Code. Sva prava pridržana.</p>
      </footer>
    </div>
  );
}
