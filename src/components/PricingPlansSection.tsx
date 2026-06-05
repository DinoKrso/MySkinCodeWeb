import type { ReactNode } from "react";
import BillingIntervalToggle from "./BillingIntervalToggle";
import PlanPriceDisplay from "./PlanPriceDisplay";
import {
  PRICING_PLANS,
  type BillingInterval,
  type PricingPlan,
} from "../content/plans";
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
  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-title">
      <div className="pricing-plans__head">
        <h2 id="pricing-plans-title">{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="pricing-plans__billing">
        <BillingIntervalToggle
          value={billingInterval}
          onChange={onBillingChange}
        />
      </div>

      <div className="pricing-plans__grid">
        {PRICING_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-plans-card${plan.featured ? " pricing-plans-card--featured" : ""}${getCardClassName?.(plan) ?? ""}`}
          >
            {plan.featured && (
              <span className="pricing-plans-card__badge">Preporučeno</span>
            )}
            <h3>{plan.name}</h3>
            <p className="pricing-plans-card__desc">{plan.description}</p>
            <PlanPriceDisplay
              plan={plan}
              interval={billingInterval}
              className="plan-price--landing"
            />
            {renderCardExtra?.(plan)}
            {renderCardAction(plan)}
            <ul className="pricing-plans-card__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <PricingCheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
