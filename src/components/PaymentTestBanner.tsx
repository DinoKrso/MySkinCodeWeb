import { isMonriTestMode } from "../content/merchant";
import "./PaymentTestBanner.css";

export default function PaymentTestBanner() {
  if (!isMonriTestMode()) return null;

  return (
    <div className="payment-test-banner" role="status">
      <p>
        <strong>Testni način rada.</strong> Monri plaćanje je u fazi testiranja.
        Stvarne narudžbe i naplate se ne izvršavaju putem ovog sustava. Testne
        kartice ne tereće račun.
      </p>
    </div>
  );
}
