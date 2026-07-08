import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import BillingIntervalToggle from "./BillingIntervalToggle";
import PlanPriceDisplay from "./PlanPriceDisplay";
import {
  getPlanFeatureItems,
  PRICING_PLANS,
  type BillingInterval,
  type PricingPlan,
} from "../content/plans";
import { gsap } from "../lib/gsap";
import "./PricingPlansSection.css";

export function PricingCheckIcon() {
  return (
    <svg
      className="pricing-plans-card__check"
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

type Props = {
  title: string;
  subtitle: string;
  billingInterval: BillingInterval;
  onBillingChange: (interval: BillingInterval) => void;
  renderCardAction: (plan: PricingPlan) => ReactNode;
  getCardClassName?: (plan: PricingPlan) => string;
  renderCardExtra?: (plan: PricingPlan) => ReactNode;
};

export default function PricingPlansSection({
  title,
  subtitle,
  billingInterval,
  onBillingChange,
  renderCardAction,
  getCardClassName,
  renderCardExtra,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const flipTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(billingInterval);
  const [displayInterval, setDisplayInterval] = useState(billingInterval);

  useEffect(() => {
    if (flipTimelineRef.current?.isActive()) return;
    setSelectedInterval(billingInterval);
    setDisplayInterval(billingInterval);
  }, [billingInterval]);

  const runBillingFlip = useCallback(
    (next: BillingInterval) => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        setDisplayInterval(next);
        onBillingChange(next);
        return;
      }

      const root = gridRef.current;
      if (!root) {
        setDisplayInterval(next);
        onBillingChange(next);
        return;
      }

      const faces = root.querySelectorAll<HTMLElement>(
        ".pricing-plans-card__face",
      );
      if (!faces.length) {
        setDisplayInterval(next);
        onBillingChange(next);
        return;
      }

      flipTimelineRef.current?.kill();
      gsap.set(faces, { rotationY: 0, willChange: "transform" });

      const timeline = gsap.timeline({
        defaults: { transformOrigin: "center center", overwrite: "auto" },
        onComplete: () => {
          gsap.set(faces, { clearProps: "transform,willChange" });
        },
      });

      timeline.to(faces, {
        rotationY: 90,
        duration: 0.3,
        ease: "power2.in",
        stagger: { each: 0.05, from: "center" },
      });

      timeline.call(() => {
        setDisplayInterval(next);
        onBillingChange(next);
      });

      timeline.set(faces, { rotationY: -90 });

      timeline.to(faces, {
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out",
        stagger: { each: 0.05, from: "center" },
      });

      flipTimelineRef.current = timeline;
    },
    [onBillingChange],
  );

  const handleBillingChange = useCallback(
    (next: BillingInterval) => {
      if (next === selectedInterval || flipTimelineRef.current?.isActive()) {
        return;
      }

      setSelectedInterval(next);
      runBillingFlip(next);
    },
    [selectedInterval, runBillingFlip],
  );

  useEffect(() => {
    return () => {
      flipTimelineRef.current?.kill();
    };
  }, []);

  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-title">
      <div className="pricing-plans__head">
        <h2 id="pricing-plans-title">{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="pricing-plans__billing">
        <BillingIntervalToggle
          value={selectedInterval}
          onChange={handleBillingChange}
        />
      </div>

      <div className="pricing-plans__grid" ref={gridRef}>
        {PRICING_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-plans-card${plan.featured ? " pricing-plans-card--featured" : ""}${getCardClassName?.(plan) ?? ""}`}
          >
            <div className="pricing-plans-card__shell">
              <div className="pricing-plans-card__face">
                {plan.featured && (
                  <span className="pricing-plans-card__badge">Preporučeno</span>
                )}
                <h3>{plan.name}</h3>
                <p className="pricing-plans-card__desc">{plan.description}</p>
                <PlanPriceDisplay
                  plan={plan}
                  interval={displayInterval}
                  className="plan-price--landing"
                />
                {renderCardExtra?.(plan)}
                {renderCardAction(plan)}
                <ul className="pricing-plans-card__features">
                  {getPlanFeatureItems(plan).map((item) => (
                    <li
                      key={item.kind === "includes" ? item.key : item.text}
                      className={
                        item.kind === "includes"
                          ? "pricing-plans-card__features-item--includes"
                          : undefined
                      }
                    >
                      <PricingCheckIcon />
                      {item.kind === "includes"
                        ? `Sve funkcije iz ${item.planName} paketa`
                        : item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
