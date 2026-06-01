import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./dashboard-pages.css";

const FAQ_PREVIEW = [
  {
    question: "Kako AI analiza kože funkcionira?",
    answer:
      "MySkin Code koristi naprednu AI tehnologiju za analizu fotografije vašeg lica i personalizirane preporuke njege.",
  },
  {
    question: "Jesu li moji podaci privatni?",
    answer:
      "Da. Podaci su enkriptirani i obrađeni u skladu s GDPR propisima.",
  },
  {
    question: "Mogu li promijeniti paket?",
    answer:
      "Da, paket možete promijeniti u postavkama mobilne aplikacije.",
  },
] as const;

export default function DashboardSupportPage() {
  useEffect(() => {
    document.title = "Podrška | MySkin Code";
  }, []);

  return (
    <div>
      <header className="dashboard-view__header">
        <h1 className="dashboard-view__title">Podrška</h1>
        <p className="dashboard-view__subtitle">
          Tu smo da pomognemo — kontaktirajte nas ili pogledajte česta pitanja.
        </p>
      </header>

      <div className="dashboard-view__stack dashboard-view__stack--wide">
        <div className="dashboard-support__grid">
          <a href="mailto:support@myskincode.com" className="dashboard-support__card">
            <div className="dashboard-support__card-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M2 7l10 7 10-7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>Email podrška</h3>
            <p>support@myskincode.com — odgovaramo u najkraćem roku.</p>
          </a>

          <Link to="/#support" className="dashboard-support__card">
            <div className="dashboard-support__card-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M12 11v5M12 8h.01"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>Česta pitanja</h3>
            <p>Pregledajte FAQ na početnoj stranici.</p>
          </Link>

          <Link to="/privacy" className="dashboard-support__card">
            <div className="dashboard-support__card-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3l7 3v6c0 4.418-3.134 8.166-7 9-3.866-.834-7-4.582-7-9V6l7-3z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Pravni dokumenti</h3>
            <p>Politika privatnosti i uvjeti korištenja.</p>
          </Link>
        </div>

        <section className="ui-card dashboard-support__faq">
          <h2>Brzi odgovori</h2>
          {FAQ_PREVIEW.map((item) => (
            <div key={item.question} className="dashboard-support__faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
