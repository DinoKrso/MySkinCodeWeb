import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FaqAccordion from "../components/FaqAccordion";
import PhoneMock from "../components/PhoneMock";
import PricingPlansSection from "../components/PricingPlansSection";
import type { BillingInterval } from "../content/plans";
import { FAQ_LANDING_PREVIEW, FAQ_SUPPORT_EMAIL } from "../content/faq";
import { useAuth } from "../context/AuthContext";
import {
  animateCarouselToStep,
  useLandingAnimations,
} from "../hooks/useLandingAnimations";
import "./HomePage.css";

const HOW_IT_WORKS_STEPS = [
  {
    label: "Korak 1/6",
    title: "Preuzmite aplikaciju",
    description:
      "Započnite svoj skincare journey preuzimanjem MySkin Code aplikacije. Dostupna na iOS i Android.",
  },
  {
    label: "Korak 2/6",
    title: "Ispunite skincare upitnik",
    description:
      "Odgovorite na kratka pitanja o vašoj koži, rutini i ciljevima za personalizirane preporuke.",
  },
  {
    label: "Korak 3/6",
    title: "Skenirajte lice",
    description:
      "AI analiza kože u nekoliko sekundi. Precizna procjena stanja, teksture i problema.",
  },
  {
    label: "Korak 4/6",
    title: "Započnite personaliziranu rutinu",
    description:
      "Dobijte svoju prilagođenu jutarnju i večernju rutinu sa preporukama proizvoda.",
  },
  {
    label: "Korak 5/6",
    title: "Pratite napredak kože",
    description:
      "Vizualizirajte promjene i napredak kroz elegantne grafikone i dnevnik.",
  },
  {
    label: "Korak 6/6",
    title: "Skenirajte proizvode",
    description:
      "Analizirajte sastojke bilo kojeg proizvoda i saznajte je li kompatibilan s vašom kožom.",
  },
] as const;

const FEATURES = [
  {
    title: "Uvid u sastojke",
    description:
      "Analizirajte sastojke i saznajte što svaki sastojak radi za vašu kožu.",
  },
  {
    title: "Pametni podsjetnici",
    description: "Automatski podsjetnici za jutarnju i večernju rutinu.",
  },
  {
    title: "Dnevnik njege",
    description: "Pratite sve analize i promjene na koži kroz vrijeme.",
  },
  {
    title: "Režim oporavka",
    description: "Posebna njega nakon tretmana ili procedura.",
  },
  {
    title: "Barkod skeniranje proizvoda",
    description:
      "Skenirajte barkod proizvoda i odmah provjerite sastojke te kompatibilnost s vašom kožom.",
  },
  {
    title: "Praćenje napretka",
    description: "Vizualizirajte napredak kroz elegantne grafikone.",
  },
] as const;

const PARTNER_BRANDS = [
  "CeraVe",
  "La Roche-Posay",
  "The Ordinary",
  "Paula's Choice",
  "Typology",
] as const;

export default function HomePage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const carouselRef = useRef<HTMLDivElement>(null);
  const landingRef = useLandingAnimations(carouselRef, setActiveStep);

  const scrollToStep = useCallback((index: number) => {
    setActiveStep(index);
    const carousel = carouselRef.current;
    if (!carousel) return;
    animateCarouselToStep(carousel, index);
  }, []);

  return (
    <div className="landing" ref={landingRef}>
      <section className="landing-hero" aria-labelledby="hero-title">
        <video
          className="landing-hero__bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/images/SkinCodeVideo.mp4" type="video/mp4" />
        </video>
        <div className="landing-hero__overlay" aria-hidden="true" />
        <div className="landing-hero__content">
          <h1 id="hero-title" className="landing-hero__title">
            Personalizirana njega kože uz AI analizu
          </h1>
          <p className="landing-hero__subtitle">
            Analizirajte stanje kože, dobijte personaliziranu rutinu, pratite
            napredak i razumijte sastojke proizvoda – sve u jednoj aplikaciji.
          </p>
          <div className="landing-hero__actions">
            <Link to="/download" className="landing-btn landing-btn--primary">
              Preuzmi aplikaciju
            </Link>
            <a href="#how-it-works" className="landing-btn landing-btn--outline">
              Pogledaj kako radi
            </a>
          </div>
        </div>
      </section>

      <section className="landing-partners" aria-label="Partneri">
        <div className="landing__container">
          <p className="landing-partners__label">Partneri i skincare brendovi</p>
          <div className="landing-partners__logos">
            {PARTNER_BRANDS.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <section
        className="landing-how landing-snap"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="landing__container">
          <div className="landing-section-head landing-reveal">
            <h2 id="how-title">Kako radi</h2>
            <p>Vaš personalizirani skincare journey u 6 jednostavnih koraka</p>
          </div>
        </div>

        <div className="landing-how__carousel" ref={carouselRef}>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.label} className="landing-how__slide">
              <p className="landing-how__step-label">{step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="landing-how__phone">
                <PhoneMock className="landing-phone-mock" />
              </div>
            </article>
          ))}
        </div>

        <div className="landing__container">
          <div className="landing-how__dots" role="tablist" aria-label="Koraci">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <button
                key={step.label}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                aria-label={step.title}
                className={`landing-how__dot${activeStep === index ? " landing-how__dot--active" : ""}`}
                onClick={() => scrollToStep(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="landing-features landing-snap"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="landing__container">
          <div className="landing-section-head landing-reveal">
            <h2 id="features-title">Dodatne mogućnosti</h2>
          </div>
          <div className="landing-features__grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <div className="landing-feature-card__icon-inner" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-pricing landing-snap" id="pricing">
        <div className="landing__container">
          <PricingPlansSection
            title="Odaberite svoj paket"
            subtitle="Započnite besplatno ili odaberite napredne funkcionalnosti za potpunu AI personalizaciju"
            billingInterval={billingInterval}
            onBillingChange={setBillingInterval}
            renderCardAction={(plan) => {
              const planHref = `/plans?plan=${plan.id}&billing=${billingInterval}`;

              return user ? (
                <Link to={planHref} className="pricing-plans-card__cta">
                  Odaberi paket
                </Link>
              ) : (
                <Link
                  to={`/login?plan=${plan.id}&billing=${billingInterval}`}
                  className="pricing-plans-card__cta"
                >
                  Odaberi paket
                </Link>
              );
            }}
          />
        </div>
      </section>

      <section className="landing-cta landing-snap" aria-labelledby="cta-title">
        <div className="landing-cta__glow landing-cta__glow--left" aria-hidden="true" />
        <div className="landing-cta__glow landing-cta__glow--right" aria-hidden="true" />
        <div className="landing__container landing-cta__inner">
          <div className="landing-cta__text">
            <h2 id="cta-title">Započnite svoju skincare analizu</h2>
            <p>
              Preuzmite MySkin Code i otkrijte što vaša koža stvarno treba
            </p>
            <Link to="/download" className="landing-btn landing-btn--primary">
              Preuzmi aplikaciju
            </Link>
          </div>
          <div className="landing-cta__phone-wrap">
            <PhoneMock variant="hero" className="landing-phone-mock" />
          </div>
        </div>
      </section>

      <section
        className="landing-faq landing-snap"
        id="support"
        aria-labelledby="faq-title"
      >
        <div className="landing__container">
          <div className="landing-section-head landing-reveal">
            <h2 id="faq-title">Česta pitanja</h2>
            <p>Imate pitanje? Ovdje su odgovori na najčešća pitanja.</p>
          </div>

          <FaqAccordion
            items={FAQ_LANDING_PREVIEW}
            className="faq-accordion--compact"
          />

          <p className="landing-faq__more">
            <Link to="/faq">Pogledaj sva pitanja →</Link>
          </p>

          <div className="landing-faq__support">
            <h3>Trebate dodatnu pomoć?</h3>
            <p>
              Kontaktirajte naš support tim i odgovorit ćemo u najkraćem roku.
            </p>
            <div className="landing-faq__support-actions">
              <a href={`mailto:${FAQ_SUPPORT_EMAIL}`} className="landing-faq__support-btn">
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
                Email Support
              </a>
              <Link to="/faq" className="landing-faq__support-btn">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 4h12a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                Sva pitanja
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing__container">
          <div className="landing-footer__top">
            <div className="landing-footer__brand">
              <Link to="/" className="landing-footer__logo">
                MySkin <span>Code</span>
              </Link>
              <p className="landing-footer__brand-text">
                Personalizirana skincare rutina uz AI analizu kože.
              </p>
            </div>

            <nav className="landing-footer__nav" aria-label="Footer navigacija">
              <div className="landing-footer__col">
                <h4>Proizvod</h4>
                <ul>
                  <li>
                    <a href="#features">Mogućnosti</a>
                  </li>
                  <li>
                    <a href="#pricing">Paketi</a>
                  </li>
                  <li>
                    <Link to="/download">Download</Link>
                  </li>
                </ul>
              </div>
              <div className="landing-footer__col">
                <h4>Podrška</h4>
                <ul>
                  <li>
                    <Link to="/faq">FAQ</Link>
                  </li>
                  <li>
                    <a href={`mailto:${FAQ_SUPPORT_EMAIL}`}>Kontakt</a>
                  </li>
                  <li>
                    <Link to="/faq">Help Center</Link>
                  </li>
                </ul>
              </div>
              <div className="landing-footer__col">
                <h4>Pravno</h4>
                <ul>
                  <li>
                    <Link to="/privacy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/terms">Terms of Use</Link>
                  </li>
                </ul>
              </div>
              <div className="landing-footer__col">
                <h4>Kompanija</h4>
                <ul>
                  <li>
                    <a href="#how-it-works">O nama</a>
                  </li>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                </ul>
              </div>
              <div className="landing-footer__col">
                <h4>Follow us</h4>
                <div className="landing-footer__social">
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="landing-footer__social-link"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H8v3h2.6v8h2.9Z" />
                    </svg>
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="landing-footer__social-link"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="3.5"
                        y="3.5"
                        width="17"
                        height="17"
                        rx="5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>

          <p className="landing-footer__copy">
            © {new Date().getFullYear()} MySkin Code. Sva prava pridržana.
          </p>
        </div>
      </footer>
    </div>
  );
}
