import { useEffect, useRef } from "react";
import type { LegalDocument } from "../content/legal";
import "./LegalModal.css";

type Props = {
  document: LegalDocument;
  onClose: () => void;
};

export default function LegalModal({ document: doc, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="legal-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <button
        type="button"
        className="legal-modal__backdrop"
        aria-label="Zatvori"
        onClick={onClose}
      />

      <div className="legal-modal__panel">
        <header className="legal-modal__header">
          <div>
            <h2 id="legal-modal-title" className="legal-modal__title">
              {doc.title}
            </h2>
            <p className="legal-modal__updated">
              Posljednja izmjena: {doc.updated}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="legal-modal__close"
            aria-label="Zatvori"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="legal-modal__body">
          <p className="legal-modal__intro">{doc.intro}</p>

          {doc.sections.map((section) => (
            <section key={section.title} className="legal-modal__section">
              <h3>{section.title}</h3>
              {section.paragraphs?.map((p, i) => (
                <p key={`${section.title}-p-${i}`}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={`${section.title}-li-${i}`}>{item}</li>
                  ))}
                </ul>
              )}
              {section.note && (
                <p className="legal-modal__note">{section.note}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
