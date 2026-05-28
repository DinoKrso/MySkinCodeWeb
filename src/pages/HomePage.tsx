import { Link } from "react-router-dom";
import PageShell from "../layouts/PageShell";
import "../components/ComingSoon.css";

export default function HomePage() {
  return (
    <PageShell>
      <main className="coming-soon__main">
        <h1 className="coming-soon__heading">COMING SOON</h1>
        <div className="coming-soon__divider" aria-hidden="true" />

        <nav className="coming-soon__actions" aria-label="Pravni dokumenti">
          <Link to="/privacy" className="coming-soon__btn">
            Politika privatnosti
          </Link>
          <Link to="/terms" className="coming-soon__btn">
            Uvjeti i odredbe
          </Link>
        </nav>
      </main>
    </PageShell>
  );
}
