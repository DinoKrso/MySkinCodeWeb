import type { ReactNode } from "react";
import "./PageShell.css";

type Props = {
  children: ReactNode;
};

export default function PageShell({ children }: Props) {
  return (
    <div className="page-shell">
      {children}

      <footer className="page-shell__footer">
        <p>© {new Date().getFullYear()} MySkin Code. Sva prava pridržana.</p>
      </footer>
    </div>
  );
}
