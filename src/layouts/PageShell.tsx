import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import "./PageShell.css";

type Props = {
  children: ReactNode;
};

export default function PageShell({ children }: Props) {
  return (
    <div className="page-shell">
      <header className="page-shell__nav">
        <Link to="/" className="page-shell__logo">
          MySkinCode
        </Link>
      </header>

      {children}

      <footer className="page-shell__footer">
        <p>© {new Date().getFullYear()} MySkinCode</p>
      </footer>
    </div>
  );
}
