import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import FaqAccordion from "../components/FaqAccordion";
import PhoneMock from "../components/PhoneMock";
import PricingPlansSection from "../components/PricingPlansSection";
import type { BillingInterval } from "../content/plans";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../content/download";
import { FAQ_LANDING_PREVIEW, FAQ_SUPPORT_EMAIL } from "../content/faq";
import { useAuth } from "../context/AuthContext";
import {
  animateCarouselToStep,
  useLandingAnimations,
} from "../hooks/useLandingAnimations";
import "./HomePage.css";

const HOW_ASSETS = "/images/how-it-works";

type HowCardIcon =
  | { type: "plain"; src: string }
  | { type: "circled"; src: string; size: number }
  | { type: "scan" };

type HowCard = {
  title: string;
  description: string;
  icon: HowCardIcon;
};

type HowStep = {
  label: string;
  title: string;
  description: string;
  cards: readonly HowCard[];
  photo?: {
    src: string;
    mobileSrc?: string;
    mobileZoom?: boolean;
    style: CSSProperties;
  };
  tiltedPhone?: boolean;
  storeBadges?: boolean;
  note?: string;
};

const HOW_IT_WORKS_STEPS: readonly HowStep[] = [
  {
    label: "Korak 1/6",
    title: "Preuzmite aplikaciju",
    description:
      "Preuzmite MySkin Code aplikaciju i započnite potpuno personalizirano skincare iskustvo. Analizirajte svoju kožu, pratite napredak i primajte preporuke rutine prilagođene upravo vašim potrebama, sve na jednom mjestu.",
    tiltedPhone: true,
    storeBadges: true,
    cards: [
      {
        title: "AI Skeniranje",
        description:
          "Analizirajte stanje svoje kože uz napredno AI prepoznavanje i otkrijte njezine jedinstvene potrebe.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-ai-scan.svg` },
      },
      {
        title: "Rutina",
        description:
          "Primajte personalizirane preporuke proizvoda i korake njege prilagođene vašem tipu kože.",
        icon: { type: "circled", src: `${HOW_ASSETS}/icon-rotate-cw.svg`, size: 13 },
      },
      {
        title: "Pratnja progresa",
        description:
          "Pratite promjene svoje kože kroz vrijeme i usporedite rezultate iz svakog skeniranja.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-progress.svg` },
      },
      {
        title: "Podsjetnici",
        description:
          "Ostanite dosljedni rutini uz pametne podsjetnike za njegu i nova skeniranja.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-reminders.svg` },
      },
    ],
  },
  {
    label: "Korak 2/6",
    title: "Ispunite skincare upitnik",
    description:
      "Odgovorite na nekoliko kratkih pitanja o svojoj koži, trenutnoj rutini i skincare ciljevima. Vaši odgovori pomoći će nam da preporuke budu što preciznije i prilagođene upravo vama.",
    note: "*Trajanje: 2 minute",
    photo: {
      src: `${HOW_ASSETS}/slide-2.png`,
      mobileSrc: `${HOW_ASSETS}/slide-2-mobile.png`,
      mobileZoom: true,
      style: { width: "101.12%", height: "116.97%", left: "16.68%", top: "-6.2%" },
    },
    cards: [
      {
        title: "Zdravlje kože",
        description:
          "Podijelite informacije o terapijama, alergijama i postojećim stanjima kože kako bismo izbjegli neodgovarajuće preporuke.",
        icon: { type: "circled", src: `${HOW_ASSETS}/icon-skin-health.svg`, size: 16 },
      },
      {
        title: "Ciljevi njege",
        description:
          "Odaberite što želite poboljšati, od akni i pigmentacija do hidratacije, teksture i znakova starenja.",
        icon: { type: "circled", src: `${HOW_ASSETS}/icon-goals.svg`, size: 17 },
      },
      {
        title: "Trenutna rutina",
        description:
          "Recite nam koje proizvode, tretmane i aktivne sastojke već koristite u svakodnevnoj njezi.",
        icon: { type: "circled", src: `${HOW_ASSETS}/icon-rotate-cw.svg`, size: 13 },
      },
      {
        title: "Personalizacija",
        description:
          "Na temelju vaših odgovora prilagođavamo AI analizu i preporuke koje najbolje odgovaraju vašoj koži.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-personalization.svg` },
      },
    ],
  },
  {
    label: "Korak 3/6",
    title: "Skenirajte lice",
    description:
      "U nekoliko jednostavnih koraka snimite fotografije lica kako bi AI analizirao stanje vaše kože. Procjenjujemo teksturu, nepravilnosti i druge karakteristike kako bismo izradili personalizirane preporuke.",
    photo: {
      src: `${HOW_ASSETS}/slide-3.png`,
      mobileSrc: `${HOW_ASSETS}/slide-3-mobile.png`,
      style: { width: "100%", height: "115.67%", left: "34.09%", top: "-4.27%" },
    },
    cards: [
      {
        title: "Vođeno fotografiranje",
        description:
          "Pratite vodič na zaslonu i postavite lice unutar okvira za pravilno skeniranje.",
        icon: { type: "scan" },
      },
      {
        title: "Optimalni uvjeti",
        description:
          "Za najpreciznije rezultate koristite prirodno osvjetljenje, lice bez šminke i gledajte ravno u kameru.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-conditions.svg` },
      },
      {
        title: "AI analiza kože",
        description:
          "Analiziramo teksturu kože, pore, pigmentacije, bore, crvenilo i druge vidljive karakteristike.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-analysis.svg` },
      },
      {
        title: "Brzi rezultati",
        description:
          "Analiza traje svega nekoliko sekundi, a preporuke su dostupne odmah nakon završetka skeniranja.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-fast-results.svg` },
      },
    ],
  },
  {
    label: "Korak 4/6",
    title: "Započnite personaliziranu rutinu",
    description:
      "Nakon AI analize dobivate pregled stanja svoje kože, ključnih metrika i personaliziranu rutinu s preporučenim proizvodima prilagođenima upravo vama.",
    photo: {
      src: `${HOW_ASSETS}/slide-4.png`,
      mobileSrc: `${HOW_ASSETS}/slide-4-mobile.png`,
      style: { width: "88.27%", height: "102.12%", left: "14.92%", top: "-2.12%" },
    },
    cards: [
      {
        title: "Rezultat analize",
        description:
          "Jedinstveni Skin Score i pregled stanja vaše kože na temelju AI analize.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-analysis-result.svg` },
      },
      {
        title: "Ključne metrike",
        description:
          "Pratite hidrataciju, masnoću, teksturu i crvenilo kroz jasno prikazane rezultate.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-metrics.svg` },
      },
      {
        title: "Uočeni problemi",
        description:
          "Prepoznajemo područja koja zahtijevaju dodatnu pažnju kako bi preporuke bile što preciznije.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-analysis.svg` },
      },
      {
        title: "Preporučena rutina",
        description:
          "Dobijte jutarnju i večernju rutinu s proizvodima odabranima prema rezultatima vaše analize.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-fast-results.svg` },
      },
    ],
  },
  {
    label: "Korak 5/6",
    title: "Pratite napredak svoje kože",
    description:
      "Pratite rezultate svakog skeniranja, usporedite promjene kroz vrijeme i održavajte dosljednu rutinu uz dnevnik i pregled napretka.",
    photo: {
      src: `${HOW_ASSETS}/slide-5.png`,
      mobileSrc: `${HOW_ASSETS}/slide-5-mobile.png`,
      style: { width: "81.87%", height: "94.75%", left: "26.57%", top: "7.14%" },
    },
    cards: [
      {
        title: "Dnevnik skeniranja",
        description:
          "Svako skeniranje automatski se sprema u dnevnik kako biste mogli pregledati rezultate po datumu i pratiti promjene kroz vrijeme",
        icon: { type: "scan" },
      },
      {
        title: "Grafovi napretka",
        description:
          "Za najpreciznije rezultate koristite prirodno osvjetljenje, lice bez šminke i gledajte ravno u kameru.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-conditions.svg` },
      },
      {
        title: "Praćenje rutine",
        description:
          "Kalendar bilježi izvršene, preskočene i pauzirane rutine kako biste lakše ostali dosljedni njezi.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-analysis.svg` },
      },
      {
        title: "Pametni uvidi",
        description:
          "Povezujemo vaše navike s rezultatima analize kako biste lakše razumjeli što donosi najbolje rezultate za vašu kožu.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-fast-results.svg` },
      },
    ],
  },
  {
    label: "Korak 6/6",
    title: "Skenirajte proizvode",
    description:
      "Analizirajte sastojke bilo kojeg skincare proizvoda i saznajte koliko odgovara potrebama vaše kože. Dobijte jasan pregled korisnih sastojaka, mogućih iritansa i personaliziranu ocjenu kompatibilnosti.",
    photo: {
      src: `${HOW_ASSETS}/slide-6.png`,
      mobileSrc: `${HOW_ASSETS}/slide-6-mobile.png`,
      style: { width: "84.61%", height: "97.89%", left: "27.96%", top: "4.2%" },
    },
    cards: [
      {
        title: "Analiza sastojaka",
        description:
          "Skenirajte ili pretražite proizvod i pregledajte detaljan sastav svake formule.",
        icon: { type: "scan" },
      },
      {
        title: "Ocjena kompatibilnosti",
        description:
          "Provjerite koliko je proizvod prikladan za vaš tip kože i rezultate AI analize.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-conditions.svg` },
      },
      {
        title: "Korisni i rizični sastojci",
        description:
          "Brzo prepoznajte aktivne sastojke koji mogu koristiti vašoj koži te one koji mogu izazvati iritacije ili nisu idealan izbor.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-analysis.svg` },
      },
      {
        title: "Kupujte s više sigurnosti",
        description:
          "Provjerite proizvod prije kupnje i odaberite formule koje najbolje odgovaraju vašoj personaliziranoj rutini.",
        icon: { type: "plain", src: `${HOW_ASSETS}/icon-fast-results.svg` },
      },
    ],
  },
] as const;

const HOW_STORE_BADGES = [
  {
    href: APP_STORE_URL,
    src: `${HOW_ASSETS}/badge-app-store.svg`,
    alt: "Preuzmi na App Store",
  },
  {
    href: GOOGLE_PLAY_URL,
    src: `${HOW_ASSETS}/badge-google-play.svg`,
    alt: "Preuzmi na Google Play",
  },
] as const;

function HowCardIconBadge({ icon }: { icon: HowCardIcon }) {
  if (icon.type === "scan") {
    return (
      <div className="landing-how-card__icon landing-how-card__icon--circled">
        <span className="landing-how-card__scan" aria-hidden="true">
          <img src={`${HOW_ASSETS}/scan-corner-tl.svg`} alt="" />
          <img src={`${HOW_ASSETS}/scan-corner-tr.svg`} alt="" />
          <img src={`${HOW_ASSETS}/scan-corner-bl.svg`} alt="" />
          <img src={`${HOW_ASSETS}/scan-corner-br.svg`} alt="" />
        </span>
      </div>
    );
  }

  if (icon.type === "circled") {
    return (
      <div className="landing-how-card__icon landing-how-card__icon--circled">
        <img
          src={icon.src}
          alt=""
          style={{
            width: `calc(${icon.size}px * var(--how-slide-scale))`,
            height: `calc(${icon.size}px * var(--how-slide-scale))`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="landing-how-card__icon">
      <img src={icon.src} alt="" />
    </div>
  );
}

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

  const scrollToStep = useCallback(
    (index: number) => {
      const carousel = carouselRef.current;
      if (!carousel) return;
      animateCarouselToStep(carousel, index, activeStep);
      setActiveStep(index);
    },
    [activeStep],
  );

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
            Personalizirana njega kože
            <br />
            uz AI analizu
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
            <article
              key={step.label}
              className={`landing-how__slide${step.photo?.mobileZoom ? " landing-how__slide--zoom-media" : ""}`}
            >
              <div className="landing-how__media" aria-hidden="true">
                {step.photo && (
                  <div className="landing-how__photo">
                    <picture>
                      {step.photo.mobileSrc && (
                        <source
                          media="(max-width: 768px)"
                          srcSet={step.photo.mobileSrc}
                        />
                      )}
                      <img
                        src={step.photo.src}
                        alt=""
                        style={step.photo.style}
                        loading="lazy"
                      />
                    </picture>
                  </div>
                )}
                {step.tiltedPhone && (
                  <div className="landing-how__tilted-phone" />
                )}
              </div>
              <div className="landing-how__slide-content">
                <div className="landing-how__copy">
                  <p className="landing-how__step-label">{step.label}</p>
                  <h3>{step.title}</h3>
                  <p className="landing-how__desc">{step.description}</p>
                  {step.note && (
                    <span className="landing-how__note">{step.note}</span>
                  )}
                  {step.storeBadges && (
                    <div className="landing-how__badges">
                      {HOW_STORE_BADGES.map((badge) =>
                        badge.href ? (
                          <a
                            key={badge.alt}
                            href={badge.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={badge.alt}
                          >
                            <img src={badge.src} alt={badge.alt} />
                          </a>
                        ) : (
                          <img key={badge.alt} src={badge.src} alt={badge.alt} />
                        ),
                      )}
                    </div>
                  )}
                </div>
                <div className="landing-how__cards">
                  {step.cards.map((card) => (
                    <div key={card.title} className="landing-how-card">
                      <HowCardIconBadge icon={card.icon} />
                      <h4>{card.title}</h4>
                      <p>{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="landing__container">
          <div className="landing-how__nav">
            <button
              type="button"
              className="landing-how__arrow"
              aria-label="Prethodni korak"
              disabled={activeStep === 0}
              onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M12.5 4.5 7 10l5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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
            <button
              type="button"
              className="landing-how__arrow"
              aria-label="Sljedeći korak"
              disabled={activeStep === HOW_IT_WORKS_STEPS.length - 1}
              onClick={() =>
                scrollToStep(
                  Math.min(HOW_IT_WORKS_STEPS.length - 1, activeStep + 1),
                )
              }
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M7.5 4.5 13 10l-5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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
                <BrandLogo />
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
