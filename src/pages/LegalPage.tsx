import { Link, useNavigate } from "react-router-dom";
import type { LegalDocument } from "../content/legal";
import LegalContent from "../components/LegalContent";
import PaymentLogos from "../components/PaymentLogos";
import { usePageSeo } from "../lib/seo";
import "./LegalPage.css";

type Props = {
  document: LegalDocument;
};

const LEGAL_PATHS: Record<string, string> = {
  privacy: "/privacy",
  terms: "/terms",
  "terms-of-sale": "/terms-of-sale",
  refund: "/refund",
  "payment-security": "/payment-security",
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

  usePageSeo({
    title: doc.seoTitle,
    description: doc.seoDescription,
    path: LEGAL_PATHS[doc.id] ?? `/${doc.id}`,
  });

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
          {(doc.id === "payment-security" ||
            doc.id === "terms-of-sale" ||
            doc.id === "refund") && (
            <div className="legal-doc__logos">
              <PaymentLogos />
            </div>
          )}
        </div>

        <footer className="legal-doc__footer">
          <Link to="/privacy">Politika privatnosti</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms">Uvjeti i odredbe</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms-of-sale">Uvjeti prodaje</Link>
          <span aria-hidden="true">·</span>
          <Link to="/refund">Povrat</Link>
          <span aria-hidden="true">·</span>
          <Link to="/payment-security">Sigurnost plaćanja</Link>
        </footer>
      </main>
    </div>
  );
}
