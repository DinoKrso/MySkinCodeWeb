import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PRICING_PLANS } from "../content/plans";
import { useAuth } from "../context/AuthContext";
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
    title: "Ingredient Insights",
    description:
      "Analizirajte sastojke i saznajte što svaki ingredient radi za vašu kožu.",
  },
  {
    title: "Smart Reminders",
    description: "Automatski podsjetnici za jutarnju i večernju rutinu.",
  },
  {
    title: "Skincare Dnevnik",
    description: "Pratite sve analize i promjene na koži kroz vrijeme.",
  },
  {
    title: "Recovery Mode",
    description: "Posebna njega nakon tretmana ili procedura.",
  },
  {
    title: "Professional Treatments",
    description: "Prilagodite rutinu nakon tretmana kod dermatologa.",
  },
  {
    title: "Progress Tracking",
    description: "Vizualizirajte napredak kroz elegantne grafikone.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Kako AI analiza kože funkcionira?",
    answer:
      "MySkin Code koristi naprednu AI tehnologiju za analizu fotografije vašeg lica. Algoritam procjenjuje teksturu, ton, hidrataciju i druge parametre kako bi vam pružio personalizirane preporuke njege.",
  },
  {
    question: "Koliko često trebam skenirati lice?",
    answer:
      "Preporučujemo tjedno skeniranje kako biste pratili napredak. U Plus i Premium paketima možete skenirati češće za detaljnije praćenje promjena.",
  },
  {
    question: "Jesu li moji podaci privatni i sigurni?",
    answer:
      "Da. Vaši podaci su enkriptirani i pohranjeni u skladu s GDPR propisima. Nikada ne dijelimo vaše podatke s trećim stranama bez vašeg pristanka.",
  },
  {
    question: "Mogu li promijeniti paket kasnije?",
    answer:
      "Da, paket možete nadograditi ili promijeniti u bilo kojem trenutku iz postavki aplikacije. Promjene stupaju na snagu odmah ili na kraju trenutnog obračunskog razdoblja.",
  },
] as const;

const PARTNER_BRANDS = [
  "CeraVe",
  "La Roche-Posay",
  "The Ordinary",
  "Paula's Choice",
  "Typology",
] as const;

function CheckIcon() {
  return (
    <svg
      className="landing-check-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M6 10l3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StoreBadge({
  store,
  large = false,
}: {
  store: "apple" | "google";
  large?: boolean;
}) {
  const isApple = store === "apple";
  return (
    <a
      href="#download"
      className={`landing-store-badge${large ? " landing-store-badge--lg" : ""}`}
    >
      <span>
        <span className="landing-store-badge__small">
          {isApple ? "Download on the" : "GET IT ON"}
        </span>
        <span className="landing-store-badge__large">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </span>
    </a>
  );
}

function PhoneMock({ variant = "default" }: { variant?: "default" | "hero" }) {
  return (
    <div
      className={`landing-phone-mock${variant === "hero" ? " landing-phone-mock--hero" : ""}`}
      aria-hidden="true"
    />
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToStep = useCallback((index: number) => {
    setActiveStep(index);
    const carousel = carouselRef.current;
    if (!carousel) return;
    const slide = carousel.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, []);

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing__container landing-header__inner">
          <Link to="/" className="landing-header__logo">
            MySkin <span>Code</span>
          </Link>

          <nav className="landing-header__nav" aria-label="Glavna navigacija">
            <a href="#how-it-works">Kako radi</a>
            <a href="#features">Features</a>
            <a href="#pricing">Paketi</a>
            <a href="#support">Support</a>
          </nav>

          <div className="landing-header__actions">
            {user ? (
              <Link to="/dashboard/profil" className="landing-header__login">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="landing-header__login">
                Login
              </Link>
            )}
            <a href="#download" className="landing-header__cta">
              Download
            </a>
          </div>
        </div>
      </header>

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
            <a href="#download" className="landing-btn landing-btn--primary">
              Preuzmi aplikaciju
            </a>
            <a href="#how-it-works" className="landing-btn landing-btn--outline">
              Pogledaj kako radi
            </a>
          </div>
          <div className="landing-store-badges" id="download">
            <StoreBadge store="apple" />
            <StoreBadge store="google" />
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
        className="landing-how"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="landing__container">
          <div className="landing-section-head">
            <h2 id="how-title">Kako radi</h2>
            <p>Vaš personalizirani skincare journey u 6 jednostavnih koraka</p>
          </div>
        </div>

        <div
          className="landing-how__carousel"
          ref={carouselRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const slideWidth = el.firstElementChild?.clientWidth ?? 1;
            const gap = 24;
            const index = Math.round(el.scrollLeft / (slideWidth + gap));
            setActiveStep(Math.min(index, HOW_IT_WORKS_STEPS.length - 1));
          }}
        >
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.label} className="landing-how__slide">
              <p className="landing-how__step-label">{step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="landing-how__phone">
                <PhoneMock />
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
        className="landing-features"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="landing__container">
          <div className="landing-section-head">
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

      <section
        className="landing-pricing"
        id="pricing"
        aria-labelledby="pricing-title"
      >
        <div className="landing__container">
          <div className="landing-section-head">
            <h2 id="pricing-title">Odaberite svoj paket</h2>
            <p>
              Započnite besplatno ili odaberite napredne funkcionalnosti za
              potpunu AI personalizaciju
            </p>
          </div>
          <div className="landing-pricing__grid">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`landing-pricing-card${plan.featured ? " landing-pricing-card--featured" : ""}`}
              >
                {plan.featured && (
                  <span className="landing-pricing-card__badge">
                    Preporučeno
                  </span>
                )}
                <h3>{plan.name}</h3>
                <p className="landing-pricing-card__desc">{plan.description}</p>
                <p className="landing-pricing-card__price">{plan.price}</p>
                <p className="landing-pricing-card__period">
                  {plan.period ?? "\u00a0"}
                </p>
                <a href="#download" className="landing-btn landing-btn--primary landing-btn--full">
                  Odaberi paket
                </a>
                <ul className="landing-pricing-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="landing-cta__glow landing-cta__glow--left" aria-hidden="true" />
        <div className="landing-cta__glow landing-cta__glow--right" aria-hidden="true" />
        <div className="landing__container landing-cta__inner">
          <div className="landing-cta__text">
            <h2 id="cta-title">Započnite svoju skincare analizu</h2>
            <p>
              Preuzmite MySkin Code i otkrijte što vaša koža stvarno treba
            </p>
            <div className="landing-store-badges">
              <StoreBadge store="apple" large />
              <StoreBadge store="google" large />
            </div>
          </div>
          <div className="landing-cta__phone-wrap">
            <PhoneMock variant="hero" />
          </div>
        </div>
      </section>

      <section
        className="landing-faq"
        id="support"
        aria-labelledby="faq-title"
      >
        <div className="landing__container">
          <div className="landing-section-head">
            <h2 id="faq-title">Česta pitanja</h2>
            <p>Imate pitanje? Ovdje su odgovori na najčešća pitanja.</p>
          </div>

          <div className="landing-faq__list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question} className="landing-faq__item">
                  <button
                    type="button"
                    className="landing-faq__question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    {item.question}
                    <svg
                      className={`landing-faq__chevron${isOpen ? " landing-faq__chevron--open" : ""}`}
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 8l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="landing-faq__answer">{item.answer}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="landing-faq__support">
            <h3>Trebate dodatnu pomoć?</h3>
            <p>
              Kontaktirajte naš support tim i odgovorit ćemo u najkraćem roku.
            </p>
            <div className="landing-faq__support-actions">
              <a href="mailto:support@myskincode.com" className="landing-faq__support-btn">
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
              <button type="button" className="landing-faq__support-btn">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 4h12a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing__container">
          <div className="landing-footer__grid">
            <div className="landing-footer__col">
              <h4>Proizvod</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Paketi</a>
                </li>
                <li>
                  <a href="#download">Download</a>
                </li>
              </ul>
            </div>
            <div className="landing-footer__col">
              <h4>Podrška</h4>
              <ul>
                <li>
                  <a href="#support">FAQ</a>
                </li>
                <li>
                  <a href="mailto:support@myskincode.com">Kontakt</a>
                </li>
                <li>
                  <a href="#support">Help Center</a>
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
              <h4>MySkin Code</h4>
              <ul>
                <li>
                  <a href="#how-it-works">O nama</a>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="landing-footer__copy">
            © {new Date().getFullYear()} MySkin Code. Sva prava pridržana.
          </p>
        </div>
      </footer>
    </div>
  );
}
