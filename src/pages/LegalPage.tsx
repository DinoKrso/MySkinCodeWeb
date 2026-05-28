import { Link } from "react-router-dom";
import type { LegalDocument } from "../content/legal";
import LegalContent from "../components/LegalContent";
import PageShell from "../layouts/PageShell";
import "./LegalPage.css";

type Props = {
  document: LegalDocument;
};

export default function LegalPage({ document }: Props) {
  return (
    <PageShell>
      <main className="legal-page">
        <div className="legal-page__panel">
          <Link to="/" className="legal-page__back">
            ← Natrag
          </Link>
          <LegalContent document={document} />
        </div>
      </main>
    </PageShell>
  );
}
