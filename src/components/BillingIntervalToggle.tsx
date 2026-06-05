import type { BillingInterval } from "../content/plans";
import "./BillingIntervalToggle.css";

type Props = {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  className?: string;
};

export default function BillingIntervalToggle({
  value,
  onChange,
  className = "",
}: Props) {
  const isYearly = value === "yearly";

  return (
    <div
      className={`billing-toggle${isYearly ? " billing-toggle--yearly" : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Razdoblje naplate"
    >
      <span className="billing-toggle__thumb" aria-hidden="true" />
      <button
        type="button"
        className={
          value === "monthly"
            ? "billing-toggle__btn billing-toggle__btn--active"
            : "billing-toggle__btn"
        }
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
      >
        Mjesečno
      </button>
      <button
        type="button"
        className={
          value === "yearly"
            ? "billing-toggle__btn billing-toggle__btn--active"
            : "billing-toggle__btn"
        }
        aria-pressed={value === "yearly"}
        onClick={() => onChange("yearly")}
      >
        Godišnje
      </button>
    </div>
  );
}
