import {
  getPlanPriceDisplay,
  type BillingInterval,
  type PricingPlan,
} from "../content/plans";
import "./PlanPriceDisplay.css";

type Props = {
  plan: PricingPlan;
  interval: BillingInterval;
  className?: string;
};

export default function PlanPriceDisplay({
  plan,
  interval,
  className = "",
}: Props) {
  const display = getPlanPriceDisplay(plan, interval);

  return (
    <div className={`plan-price${className ? ` ${className}` : ""}`}>
      <p className="plan-price__main">
        {display.price}
        {display.period ? (
          <span className="plan-price__period">{display.period}</span>
        ) : null}
      </p>
      {display.compareOriginal && display.compareSavings ? (
        <p className="plan-price__compare">
          <span className="plan-price__compare-original">
            {display.compareOriginal}
          </span>
          <span className="plan-price__compare-sep">/</span>
          <span className="plan-price__compare-savings">
            ušteda {display.compareSavings}
          </span>
        </p>
      ) : null}
    </div>
  );
}
