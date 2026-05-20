import { useState } from "react";
import { PRIVACY_POLICY, TERMS_OF_USE } from "../content/legal";
import type { LegalDocument } from "../content/legal";
import LegalModal from "./LegalModal";
import "./ComingSoon.css";

export default function ComingSoon() {
  const [openDoc, setOpenDoc] = useState<LegalDocument | null>(null);

  return (
    <div className="coming-soon">
      <header className="coming-soon__nav">
        <span className="coming-soon__logo">MySkinCode</span>
      </header>

      <main className="coming-soon__main">
        <h1 className="coming-soon__heading">COMING SOON</h1>
        <div className="coming-soon__divider" aria-hidden="true" />

        <div className="coming-soon__actions">
          <button
            type="button"
            className="coming-soon__btn"
            onClick={() => setOpenDoc(PRIVACY_POLICY)}
          >
            Politika privatnosti
          </button>
          <button
            type="button"
            className="coming-soon__btn"
            onClick={() => setOpenDoc(TERMS_OF_USE)}
          >
            Uvjeti i odredbe
          </button>
        </div>
      </main>

      <footer className="coming-soon__footer">
        <p>© {new Date().getFullYear()} MySkinCode</p>
      </footer>

      {openDoc && (
        <LegalModal document={openDoc} onClose={() => setOpenDoc(null)} />
      )}
    </div>
  );
}
