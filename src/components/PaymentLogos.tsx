import "./PaymentLogos.css";

export type PaymentLogo = {
  id: string;
  src: string;
  alt: string;
  href: string;
};

/** Order: Visa, Mastercard®, Maestro®, then Monri. Mastercard then Maestro with nothing in between. */
export const ACCEPTANCE_LOGOS: readonly PaymentLogo[] = [
  {
    id: "visa",
    src: "/payment-logos/visa.svg",
    alt: "Visa",
    href: "https://www.visa.com/",
  },
  {
    id: "mastercard",
    src: "/payment-logos/mastercard.svg",
    alt: "Mastercard®",
    href: "https://www.mastercard.com/",
  },
  {
    id: "maestro",
    src: "/payment-logos/maestro.svg",
    alt: "Maestro®",
    href: "https://brand.mastercard.com/brandcenter/more-about-our-brands.html",
  },
  {
    id: "monri",
    src: "/payment-logos/monri.svg",
    alt: "Monri Payments",
    href: "https://monri.com/",
  },
];

export const SECURITY_LOGOS: readonly PaymentLogo[] = [
  {
    id: "visa-secure",
    src: "/payment-logos/visa-secure.svg",
    alt: "Visa Secure",
    href: "https://www.visa.com/",
  },
  {
    id: "mastercard-id-check",
    src: "/payment-logos/mastercard-id-check.svg",
    alt: "Mastercard® Identity Check™",
    href: "https://www.mastercard.com/",
  },
];

type Props = {
  variant?: "full" | "compact";
  className?: string;
};

export default function PaymentLogos({ variant = "full", className }: Props) {
  return (
    <div
      className={`payment-logos${variant === "compact" ? " payment-logos--compact" : ""}${className ? ` ${className}` : ""}`}
    >
      <p className="payment-logos__label">Sigurno plaćanje karticom</p>
      <ul className="payment-logos__row">
        {ACCEPTANCE_LOGOS.map((logo) => (
          <li key={logo.id}>
            <a
              href={logo.href}
              target="_blank"
              rel="noreferrer"
              title={logo.alt}
            >
              <img src={logo.src} alt={logo.alt} />
            </a>
          </li>
        ))}
      </ul>
      {variant === "full" && (
        <>
          <ul className="payment-logos__row payment-logos__row--security">
            {SECURITY_LOGOS.map((logo) => (
              <li key={logo.id}>
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noreferrer"
                  title={logo.alt}
                >
                  <img src={logo.src} alt={logo.alt} />
                </a>
              </li>
            ))}
          </ul>
          <p className="payment-logos__note">
            Transakcije su sigurne uz Visa plaćanje. Koristimo Mastercard®
            Identity Check™.
          </p>
        </>
      )}
    </div>
  );
}
