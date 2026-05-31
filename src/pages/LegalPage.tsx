import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LegalDocument } from "../content/legal";
import LegalContent from "../components/LegalContent";
import "./LegalPage.css";

type Props = {
  document: LegalDocument;
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 6L8 12l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LegalPage({ document: doc }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = doc.seoTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", doc.seoDescription);
  }, [doc]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="legal-doc">
      <header className="legal-doc__header">
        <button
          type="button"
          className="legal-doc__back"
          onClick={handleBack}
          aria-label="Natrag"
        >
          <BackIcon />
        </button>
        <h1 className="legal-doc__header-title">{doc.headerTitle}</h1>
        <div className="legal-doc__header-spacer" aria-hidden="true" />
      </header>

      <main className="legal-doc__main">
        <div className="legal-doc__card">
          <LegalContent document={doc} />
        </div>

        <footer className="legal-doc__footer">
          <Link to="/privacy">Politika privatnosti</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms">Uvjeti i odredbe</Link>
        </footer>
      </main>
    </div>
  );
}
