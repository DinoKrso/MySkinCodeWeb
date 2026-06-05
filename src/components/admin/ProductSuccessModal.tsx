import { useEffect } from "react";
import "./ProductSuccessModal.css";

type Props = {
  open: boolean;
  brand: string;
  name: string;
  pk: string;
  onClose: () => void;
};

export default function ProductSuccessModal({
  open,
  brand,
  name,
  pk,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="product-success-modal"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="product-success-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-success-title"
        aria-describedby="product-success-desc"
      >
        <div className="product-success-modal__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 12.5l2.5 2.5L16 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="product-success-modal__eyebrow">Uspješno spremljeno</p>
        <h2 id="product-success-title" className="product-success-modal__title">
          Proizvod je u bazi
        </h2>
        <p id="product-success-desc" className="product-success-modal__product">
          <strong>{brand}</strong>
          {" · "}
          {name}
        </p>

        <div className="product-success-modal__pk">
          <span className="product-success-modal__pk-label">DynamoDB PK</span>
          <code>{pk}</code>
        </div>

        <button
          type="button"
          className="ui-btn-primary product-success-modal__btn"
          onClick={onClose}
          autoFocus
        >
          Dodaj još jedan proizvod
        </button>
      </div>
    </div>
  );
}
