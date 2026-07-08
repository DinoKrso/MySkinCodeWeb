import { useId, useState } from "react";
import type { FaqItem } from "../content/faq";
import "./FaqAccordion.css";

type Props = {
  items: readonly FaqItem[];
  /** Ako je postavljeno, samo jedno pitanje može biti otvoreno odjednom. */
  singleOpen?: boolean;
  defaultOpenIndex?: number | null;
  className?: string;
};

export default function FaqAccordion({
  items,
  singleOpen = true,
  defaultOpenIndex = null,
  className = "",
}: Props) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => {
    if (defaultOpenIndex === null || defaultOpenIndex < 0) return new Set();
    return new Set([defaultOpenIndex]);
  });

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const isOpen = prev.has(index);
      if (singleOpen) {
        return isOpen ? new Set() : new Set([index]);
      }
      const next = new Set(prev);
      if (isOpen) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className={`faq-accordion${className ? ` ${className}` : ""}`}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <article
            key={item.question}
            className={
              isOpen
                ? "faq-accordion__item faq-accordion__item--open"
                : "faq-accordion__item"
            }
          >
            <h3 className="faq-accordion__heading">
              <button
                id={buttonId}
                type="button"
                className="faq-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span>{item.question}</span>
                <svg
                  className="faq-accordion__chevron"
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
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="faq-accordion__panel"
              hidden={!isOpen}
            >
              <div className="faq-accordion__answer">{item.answer}</div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
