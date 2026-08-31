import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../layouts/PageShell";
import { verifyMonriSuccessUrl } from "../lib/monri";
import "./PaymentResultPage.css";

type Variant = "success" | "cancel";

type Props = {
  variant: Variant;
};

export default function PaymentResultPage({ variant }: Props) {
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState<boolean | null>(
    variant === "success" ? null : true,
  );
  const orderNumber = searchParams.get("order_number");
  const responseCode = searchParams.get("response_code");

  useEffect(() => {
    document.title =
      variant === "success"
        ? "Plaćanje uspješno | MySkin Code"
        : "Plaćanje otkazano | MySkin Code";
  }, [variant]);

  useEffect(() => {
    if (variant !== "success") return;
    const url = window.location.href;
    let cancelled = false;
    verifyMonriSuccessUrl(url).then((ok) => {
      if (!cancelled) setVerified(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [variant]);

  const approved = variant === "success" && responseCode !== null
    ? responseCode === "0000"
    : variant === "success";

  return (
    <PageShell>
      <main className="payment-result">
        <div className="payment-result__panel ui-panel">
          {variant === "cancel" ? (
            <>
              <h1 className="ui-panel__title">Plaćanje otkazano</h1>
              <p className="ui-panel__subtitle">
                Transakcija nije izvršena. Možete se vratiti na pakete i
                pokušati ponovo.
              </p>
              <Link to="/plans" className="ui-btn-primary">
                Natrag na pakete
              </Link>
            </>
          ) : (
            <>
              <h1 className="ui-panel__title">
                {approved ? "Hvala na uplati" : "Plaćanje zaprimljeno"}
              </h1>
              <p className="ui-panel__subtitle">
                {verified === false
                  ? "Potvrdu transakcije još usklađujemo. Ako je naplata prošla, paket će se aktivirati uskoro."
                  : "Ako je banka odobrila transakciju, Plus ili Premium paket se aktivira na vašem računu. Otvorite mobilnu aplikaciju ili stranicu Moj paket."}
              </p>
              {orderNumber ? (
                <p className="payment-result__order">
                  Broj narudžbe: <strong>{orderNumber}</strong>
                </p>
              ) : null}
              <div className="payment-result__actions">
                <Link to="/account" className="ui-btn-primary">
                  Moj paket
                </Link>
                <Link to="/download" className="payment-result__secondary">
                  Preuzmi aplikaciju
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}
