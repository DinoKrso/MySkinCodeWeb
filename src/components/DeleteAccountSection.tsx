import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteUserAccount, getStoredToken } from "../lib/auth";
import "./DeleteAccountSection.css";

type DeleteAccountModalProps = {
  open: boolean;
  deleting: boolean;
  success: boolean;
  acknowledged: boolean;
  error: string | null;
  onAcknowledgedChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onSuccessDismiss: () => void;
};

function DeleteAccountModal({
  open,
  deleting,
  success,
  acknowledged,
  error,
  onAcknowledgedChange,
  onCancel,
  onConfirm,
  onSuccessDismiss,
}: DeleteAccountModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !deleting && !success) onCancel();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, deleting, success, onCancel]);

  if (!open) return null;

  return (
    <div
      className="delete-account-modal"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting && !success) onCancel();
      }}
    >
      <div
        className="delete-account-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        aria-describedby="delete-account-modal-desc"
      >
        {success ? (
          <>
            <h2
              id="delete-account-modal-title"
              className="delete-account-modal__title delete-account-modal__title--success"
            >
              Račun obrisan
            </h2>
            <p
              id="delete-account-modal-desc"
              className="delete-account-modal__text"
            >
              Vaš račun je uspješno obrisan.
            </p>
            <button
              type="button"
              className="ui-btn-primary delete-account-modal__btn"
              onClick={onSuccessDismiss}
              autoFocus
            >
              U redu
            </button>
          </>
        ) : (
          <>
            <h2 id="delete-account-modal-title" className="delete-account-modal__title">
              Jeste li sigurni?
            </h2>
            <p id="delete-account-modal-desc" className="delete-account-modal__text">
              Ova radnja je trajna. Bit će uklonjeni profil, analize, rutine, slike
              i svi povezani podaci.
            </p>

            <label className="delete-account-modal__checkbox">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => onAcknowledgedChange(e.target.checked)}
                disabled={deleting}
              />
              <span>Razumijem da je brisanje trajno</span>
            </label>

            {error && (
              <p className="ui-error delete-account-modal__error" role="alert">
                {error}
              </p>
            )}

            <div className="delete-account-modal__actions">
              <button
                type="button"
                className="ui-btn-secondary delete-account-modal__btn"
                onClick={onCancel}
                disabled={deleting}
              >
                Odustani
              </button>
              <button
                type="button"
                className="delete-account-modal__btn delete-account-modal__btn--confirm"
                onClick={onConfirm}
                disabled={deleting || !acknowledged}
              >
                {deleting ? "Brisanje..." : "Obriši račun"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DeleteAccountSection() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setAcknowledged(false);
    setError(null);
    setSuccess(false);
    setModalOpen(true);
  }

  function closeModal() {
    if (deleting) return;
    setModalOpen(false);
    setAcknowledged(false);
    setError(null);
    setSuccess(false);
  }

  async function handleConfirmDelete() {
    const token = getStoredToken();
    const userId = user?.userId;

    if (!token || !userId) {
      setError("Sesija je istekla. Prijavite se ponovno.");
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteUserAccount(token, userId);
      logout();
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Brisanje računa nije uspjelo.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleSuccessDismiss() {
    setModalOpen(false);
    setSuccess(false);
    navigate("/", { replace: true });
  }

  return (
    <>
      <p className="delete-account">
        <button
          type="button"
          className="delete-account__trigger"
          onClick={openModal}
        >
          Obriši račun
        </button>
      </p>

      <DeleteAccountModal
        open={modalOpen}
        deleting={deleting}
        success={success}
        acknowledged={acknowledged}
        error={error}
        onAcknowledgedChange={setAcknowledged}
        onCancel={closeModal}
        onConfirm={handleConfirmDelete}
        onSuccessDismiss={handleSuccessDismiss}
      />
    </>
  );
}
