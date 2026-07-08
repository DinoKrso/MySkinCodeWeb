import { useEffect } from "react";
import { Link } from "react-router-dom";
import FaqAccordion from "../components/FaqAccordion";
import { FAQ_CATEGORIES, FAQ_SUPPORT_EMAIL } from "../content/faq";
import PageShell from "../layouts/PageShell";
import "./FaqPage.css";

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="4"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 6l8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FaqPage() {
  useEffect(() => {
    document.title = "Česta pitanja | MySkin Code";
  }, []);

  return (
    <PageShell>
      <main className="faq-page">
        <div className="faq-page__inner">
          <header className="faq-page__hero">
            <p className="faq-page__eyebrow">Podrška</p>
            <h1>Česta pitanja</h1>
            <p className="faq-page__lead">
              Odgovori o analizi kože, paketima, privatnosti i rutini. Ako ne
              pronađete što tražite, javite nam se.
            </p>
            <div className="faq-page__hero-links">
              <Link to="/plans" className="faq-page__hero-link">
                Pogledaj pakete
              </Link>
              <a
                href={`mailto:${FAQ_SUPPORT_EMAIL}`}
                className="faq-page__hero-link faq-page__hero-link--muted"
              >
                {FAQ_SUPPORT_EMAIL}
              </a>
            </div>
          </header>

          <div className="faq-page__sections">
            {FAQ_CATEGORIES.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="faq-page__section"
                aria-labelledby={`faq-${category.id}-title`}
              >
                <div className="faq-page__section-head">
                  <h2 id={`faq-${category.id}-title`}>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                <FaqAccordion items={category.items} />
              </section>
            ))}
          </div>

          <aside className="faq-page__support">
            <div className="faq-page__support-copy">
              <h2>Trebate dodatnu pomoć?</h2>
              <p>
                Naš tim odgovara na upite u najkraćem mogućem roku. Pošaljite
                nam email s opisom problema ili pitanja.
              </p>
            </div>
            <div className="faq-page__support-actions">
              <a
                href={`mailto:${FAQ_SUPPORT_EMAIL}`}
                className="faq-page__support-btn faq-page__support-btn--primary"
              >
                <MailIcon />
                Pošalji email
              </a>
              <Link to="/" className="faq-page__support-btn">
                Natrag na početnu
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}
